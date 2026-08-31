const RecoveryAction = require('../models/RecoveryAction');
const Transaction = require('../models/Transaction');
const RazorpayService = require('./razorpay.service');
const AuditService = require('./audit.service');
const { generateIdempotencyKey, checkIdempotency } = require('../utils/idempotency');
const logger = require('../utils/logger');

/**
 * Message templates — only these can be sent.
 */
const TEMPLATES = {
  payment_reminder_gentle: {
    id: 'payment_reminder_gentle',
    text: 'Hi {name}, your payment of ₹{amount} for {order} didn\'t go through. No action needed if this was intentional — otherwise, here\'s a quick link to retry: {link}'
  },
  subscription_card_expired: {
    id: 'subscription_card_expired',
    text: 'Hi {name}, we couldn\'t renew your {plan} subscription because your card on file has expired. Update it here: {link}. Your access continues uninterrupted for the next {grace_days} days.'
  },
  invoice_reminder_b2b: {
    id: 'invoice_reminder_b2b',
    text: 'Hi {name}, a friendly note that invoice {invoice_id} for ₹{amount} was due on {due_date}. Could you confirm an expected payment date? {link}'
  },
  checkout_recovery: {
    id: 'checkout_recovery',
    text: 'Hi {name}, we noticed you didn\'t complete your purchase of {order} (₹{amount}). We\'ve saved your cart — complete your order here: {link}'
  }
};

/**
 * Action Agent — Executes approved recovery actions.
 * Never decides permission — that's Policy Engine's job.
 */
class ActionService {
  /**
   * Execute a recovery action.
   */
  static async execute(recoveryCase, batchId) {
    logger.agent('ACTION_AGENT', `Executing ${recoveryCase.recommendedAction} for ${recoveryCase.caseId}...`);

    const attemptNum = recoveryCase.attemptCount + 1;
    const idempotencyKey = generateIdempotencyKey(recoveryCase.caseId, attemptNum);

    // Check idempotency
    const existing = await checkIdempotency(idempotencyKey);
    if (existing) {
      logger.warn(`Idempotency conflict: ${idempotencyKey} — returning cached result`);
      return { success: existing.result === 'success', result: existing.result, cached: true };
    }

    // Log action start
    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: 'action_started',
      actor: 'action_agent',
      message: `Starting ${recoveryCase.recommendedAction} (attempt #${attemptNum})`,
      metadata: { action: recoveryCase.recommendedAction, attempt: attemptNum, idempotencyKey }
    });

    recoveryCase.status = 'EXECUTING';
    await recoveryCase.save();

    const transaction = await Transaction.findById(recoveryCase.transactionId).lean();
    let result;

    try {
      switch (recoveryCase.recommendedAction) {
        case 'retry_payment':
          result = await this._retryPayment(recoveryCase, transaction);
          break;
        case 'generate_link':
          result = await this._generateLink(recoveryCase, transaction);
          break;
        case 'send_reminder':
          result = await this._sendReminder(recoveryCase, transaction);
          break;
        case 'update_method':
          result = await this._requestMethodUpdate(recoveryCase, transaction);
          break;
        default:
          result = { success: false, result: 'unknown_action', data: {} };
      }
    } catch (err) {
      logger.error(`Action execution error: ${err.message}`);
      result = { success: false, result: 'timeout', data: { error: err.message } };
    }

    // Record the action
    const actionRecord = await RecoveryAction.create({
      recoveryCaseId: recoveryCase._id,
      action: recoveryCase.recommendedAction,
      attempt: attemptNum,
      policyDecision: 'approved',
      complianceCheck: recoveryCase.complianceDecision?.passed ? 'passed' : 'not_applicable',
      idempotencyKey,
      result: result.success ? 'success' : (result.result === 'timeout' ? 'timeout' : 'failed'),
      razorpayResponse: result.data || {},
      error: result.success ? null : (result.data?.error || 'Action failed'),
      templateId: result.templateId || null,
      channel: result.channel || null,
      messageSent: result.messageSent || null
    });

    // Update case
    recoveryCase.attemptCount = attemptNum;
    recoveryCase.actionHistory.push({
      action: recoveryCase.recommendedAction,
      result: result.success ? 'success' : 'failed',
      timestamp: new Date()
    });
    await recoveryCase.save();

    // Audit
    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: result.success ? 'action_executed' : (result.result === 'timeout' ? 'action_timeout' : 'action_failed'),
      actor: 'action_agent',
      message: result.success
        ? `✓ Action succeeded: ${recoveryCase.recommendedAction}`
        : `✗ Action failed: ${result.data?.error || result.result}`,
      metadata: { action: recoveryCase.recommendedAction, attempt: attemptNum, result: result.result }
    });

    logger.agent('ACTION_AGENT', result.success
      ? `✓ ${recoveryCase.caseId}: ${recoveryCase.recommendedAction} succeeded`
      : `✗ ${recoveryCase.caseId}: ${recoveryCase.recommendedAction} failed`);

    return result;
  }

  static async _retryPayment(recoveryCase, transaction) {
    // Create order via Razorpay (or simulate)
    const orderResult = await RazorpayService.createOrder(
      recoveryCase.amountAtRisk,
      'INR',
      `recovery_${recoveryCase.caseId}`
    );

    if (orderResult.success) {
      // Simulate payment completion for demo
      const simResult = await RazorpayService.simulateRecoveryAction('retry_payment', recoveryCase);
      return { ...simResult, data: { ...simResult.data, orderId: orderResult.data?.id } };
    }

    // If order creation fails, simulate anyway for demo purposes
    return RazorpayService.simulateRecoveryAction('retry_payment', recoveryCase);
  }

  static async _generateLink(recoveryCase, transaction) {
    const linkResult = await RazorpayService.createPaymentLink(
      recoveryCase.amountAtRisk,
      recoveryCase.customerName,
      transaction.customerEmail,
      transaction.customerPhone,
      `Recovery for ${transaction.orderDescription || 'your order'}`,
      { caseId: recoveryCase.caseId }
    );

    const template = TEMPLATES.checkout_recovery;
    return {
      success: true,
      result: 'link_generated',
      data: linkResult.data || {},
      templateId: template.id,
      channel: 'email',
      messageSent: template.text
        .replace('{name}', recoveryCase.customerName)
        .replace('{order}', transaction.orderDescription || 'your order')
        .replace('{amount}', recoveryCase.amountAtRisk)
        .replace('{link}', linkResult.data?.short_url || 'https://rzp.io/recovery')
    };
  }

  static async _sendReminder(recoveryCase, transaction) {
    let template;
    if (recoveryCase.scenario === 'invoice_overdue') {
      template = TEMPLATES.invoice_reminder_b2b;
    } else {
      template = TEMPLATES.payment_reminder_gentle;
    }

    const simResult = await RazorpayService.simulateRecoveryAction('send_reminder', recoveryCase);
    return {
      ...simResult,
      templateId: template.id,
      channel: 'email',
      messageSent: template.text
        .replace('{name}', recoveryCase.customerName)
        .replace('{contact_name}', recoveryCase.customerName)
        .replace('{amount}', recoveryCase.amountAtRisk)
        .replace('{order}', transaction.orderDescription || 'your order')
        .replace('{invoice_id}', transaction.invoiceId || '')
        .replace('{due_date}', transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : '')
        .replace('{link}', 'https://rzp.io/recovery')
    };
  }

  static async _requestMethodUpdate(recoveryCase, transaction) {
    const template = TEMPLATES.subscription_card_expired;
    const simResult = await RazorpayService.simulateRecoveryAction('update_method', recoveryCase);
    return {
      ...simResult,
      templateId: template.id,
      channel: 'email',
      messageSent: template.text
        .replace('{name}', recoveryCase.customerName)
        .replace('{plan}', transaction.orderDescription || 'your subscription')
        .replace('{link}', 'https://rzp.io/update-method')
        .replace('{grace_days}', '7')
    };
  }
}

module.exports = ActionService;
