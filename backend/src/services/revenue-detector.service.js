const Transaction = require('../models/Transaction');
const RecoveryCase = require('../models/RecoveryCase');
const Customer = require('../models/Customer');
const AuditService = require('./audit.service');
const logger = require('../utils/logger');

let caseCounter = 0;

/**
 * Revenue Detection Agent
 * Scans transactions and creates/refreshes recovery cases for revenue at risk.
 */
class RevenueDetectorService {
  /**
   * Scan all non-successful transactions and retrieve/create recovery cases.
   * Returns array of recovery cases ready for autonomous processing.
   */
  static async detectAll(batchId) {
    logger.agent('REVENUE_DETECTOR', 'Starting scan for revenue at risk...');

    // Find transactions that represent revenue at risk
    const atRiskTransactions = await Transaction.find({
      scenario: { $ne: 'successful' },
      amount: { $gt: 0 }
    }).lean();

    logger.agent('REVENUE_DETECTOR', `Found ${atRiskTransactions.length} transactions at risk`);

    const cases = [];
    for (const txn of atRiskTransactions) {
      // Check if case already exists for this payment
      let recoveryCase = await RecoveryCase.findOne({ transactionId: txn._id });

      if (recoveryCase) {
        // If existing case is already terminal, but batch is run, reset to processable state
        if (['RECOVERED', 'REJECTED', 'HALTED', 'UNRECOVERABLE'].includes(recoveryCase.status)) {
          // Keep it as is if already recovered, or re-evaluate
        }
        recoveryCase.batchId = batchId;
        await recoveryCase.save();
        cases.push(recoveryCase);
        continue;
      }

      // Calculate initial recovery probability based on rules
      const customer = await Customer.findOne({ customerId: txn.customerId }).lean();
      const probability = this._calculateInitialProbability(txn, customer);
      const expectedValue = Math.round(txn.amount * probability);

      let initialAction = 'retry_payment';
      if (txn.scenario === 'checkout_abandonment') initialAction = 'generate_link';
      else if (txn.scenario === 'subscription_failure' || txn.failureReason === 'expired_card') initialAction = 'update_method';
      else if (txn.scenario === 'invoice_overdue') initialAction = 'send_reminder';

      caseCounter++;
      recoveryCase = await RecoveryCase.create({
        caseId: `RC_${String(caseCounter).padStart(4, '0')}`,
        transactionId: txn._id,
        customerId: txn.customerId,
        customerName: txn.customerName || customer?.name || 'Unknown',
        scenario: txn.scenario,
        amountAtRisk: txn.amount,
        recoveryProbability: probability,
        expectedRecoveryValue: expectedValue,
        priorityScore: this._calculatePriority(txn, customer, probability),
        recommendedAction: initialAction,
        status: 'DETECTED',
        batchId,
        attemptCount: txn.attempts || 0,
        maxAttempts: txn.scenario === 'payment_failure' ? 3 : 5
      });

      // Audit log
      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'revenue_detected',
        actor: 'system',
        message: `₹${txn.amount} revenue at risk detected (${txn.scenario})`,
        metadata: {
          paymentId: txn.paymentId,
          amount: txn.amount,
          scenario: txn.scenario,
          method: txn.method,
          failureReason: txn.failureReason,
          recoveryProbability: probability
        }
      });

      cases.push(recoveryCase);
    }

    logger.agent('REVENUE_DETECTOR', `Identified ${cases.length} active recovery cases for batch processing`);
    return cases;
  }

  /**
   * Rule-based initial recovery probability.
   */
  static _calculateInitialProbability(txn, customer) {
    let prob = 0.5; // base

    // Scenario adjustments
    if (txn.scenario === 'payment_failure') {
      if (['upi_timeout', 'network_error'].includes(txn.failureReason)) prob = 0.88;
      else if (txn.failureReason === 'bank_decline') prob = 0.65;
      else if (txn.failureReason === 'insufficient_funds') prob = 0.40;
      else if (txn.failureReason === 'expired_card') prob = 0.75;
      else if (txn.failureReason === 'authentication_failure') prob = 0.50;
    } else if (txn.scenario === 'checkout_abandonment') {
      const events = txn.checkoutEvents || [];
      if (events.includes('payment_page_opened')) prob = 0.80;
      else if (events.includes('checkout_started')) prob = 0.60;
      else prob = 0.35;
    } else if (txn.scenario === 'subscription_failure') {
      prob = txn.failureReason === 'expired_card' ? 0.78 : 0.60;
    } else if (txn.scenario === 'invoice_overdue') {
      prob = 0.65;
    }

    // Customer history adjustments
    if (customer) {
      if (customer.successfulPayments > 5) prob = Math.min(prob + 0.10, 0.98);
      if (customer.successfulPayments > 10) prob = Math.min(prob + 0.05, 0.98);
      if (customer.riskLevel === 'high') prob = Math.max(prob - 0.15, 0.10);
      if (customer.optedOut) prob = 0;
    }

    // Attempt adjustments
    if (txn.attempts >= 3) prob = Math.max(prob - 0.25, 0.05);
    else if (txn.attempts >= 2) prob = Math.max(prob - 0.10, 0.10);

    return Math.round(prob * 100) / 100;
  }

  /**
   * Priority score calculation (0-100).
   */
  static _calculatePriority(txn, customer, probability) {
    const expectedValue = txn.amount * probability;
    let priority = Math.min(Math.round((expectedValue / 50000) * 90), 95);

    const hoursOld = (Date.now() - new Date(txn.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 1) priority = Math.min(priority + 10, 99);
    else if (hoursOld < 24) priority = Math.min(priority + 5, 99);

    if (customer && customer.totalSpend > 100000) priority = Math.min(priority + 5, 99);

    return Math.max(priority, 1);
  }
}

module.exports = RevenueDetectorService;
