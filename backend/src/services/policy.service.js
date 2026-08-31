const Transaction = require('../models/Transaction');
const AuditService = require('./audit.service');
const config = require('../utils/policy-config');
const logger = require('../utils/logger');

/**
 * Policy Engine — Deterministic financial guardrails.
 * Never uses AI. Fail-closed: any error = BLOCK.
 */
class PolicyService {
  /**
   * Check if a recovery action is permitted.
   * Returns: { allowed: boolean, reason: string, checks: [] }
   */
  static async check(recoveryCase, batchId) {
    logger.agent('POLICY_ENGINE', `Checking policy for ${recoveryCase.caseId}...`);

    const checks = [];
    let blocked = false;
    let blockReason = '';

    try {
      const transaction = await Transaction.findById(recoveryCase.transactionId).lean();

      // Check 1: Transaction actually failed
      if (transaction.status === 'success') {
        checks.push({ rule: 'payment_failed', passed: false, detail: 'Transaction already succeeded' });
        blocked = true;
        blockReason = 'Transaction already succeeded — no retry needed';
      } else {
        checks.push({ rule: 'payment_failed', passed: true, detail: 'Transaction is in failed/abandoned state' });
      }

      // Check 2: Customer hasn't already paid (duplicate payment check)
      if (!blocked) {
        const successfulPayment = await Transaction.findOne({
          customerId: recoveryCase.customerId,
          status: 'success',
          amount: recoveryCase.amountAtRisk,
          createdAt: { $gt: transaction.createdAt }
        });
        if (successfulPayment) {
          checks.push({ rule: 'customer_not_already_paid', passed: false, detail: 'Customer has since paid successfully' });
          blocked = true;
          blockReason = 'Customer already paid via another channel';
        } else {
          checks.push({ rule: 'customer_not_already_paid', passed: true, detail: 'No subsequent payment found' });
        }
      }

      // Check 3: Retry count within limit (for retry actions)
      if (!blocked && recoveryCase.recommendedAction === 'retry_payment') {
        const withinLimit = recoveryCase.attemptCount < config.MAX_PAYMENT_RETRIES;
        checks.push({
          rule: 'retry_within_limit',
          passed: withinLimit,
          detail: `Attempts: ${recoveryCase.attemptCount}/${config.MAX_PAYMENT_RETRIES}`
        });
        if (!withinLimit) {
          blocked = true;
          blockReason = `Retry limit exceeded (${recoveryCase.attemptCount}/${config.MAX_PAYMENT_RETRIES})`;
        }
      }

      // Check 4: Failure reason allows retry
      if (!blocked && recoveryCase.recommendedAction === 'retry_payment') {
        const reasonAllowed = config.ALLOWED_RETRY_REASONS.includes(transaction.failureReason);
        const reasonDisallowed = config.DISALLOWED_REASONS.includes(transaction.failureReason);
        checks.push({
          rule: 'reason_allows_retry',
          passed: reasonAllowed && !reasonDisallowed,
          detail: `Reason: ${transaction.failureReason}, Allowed: ${reasonAllowed}`
        });
        if (!reasonAllowed || reasonDisallowed) {
          blocked = true;
          blockReason = `Failure reason '${transaction.failureReason}' does not permit automatic retry`;
        }
      }

      // Check 5: Amount within automatic action limit
      if (!blocked) {
        const withinLimit = recoveryCase.amountAtRisk <= config.AUTO_ACTION_LIMIT;
        checks.push({
          rule: 'amount_within_limit',
          passed: withinLimit,
          detail: `₹${recoveryCase.amountAtRisk} vs limit ₹${config.AUTO_ACTION_LIMIT}`
        });
        if (!withinLimit) {
          blocked = true;
          blockReason = `Amount ₹${recoveryCase.amountAtRisk} exceeds auto-action limit ₹${config.AUTO_ACTION_LIMIT}`;
        }
      }

      // Check 6: High-value threshold
      if (!blocked && recoveryCase.amountAtRisk > config.HIGH_VALUE_THRESHOLD) {
        checks.push({ rule: 'high_value_check', passed: false, detail: `₹${recoveryCase.amountAtRisk} > ₹${config.HIGH_VALUE_THRESHOLD}` });
        blocked = true;
        blockReason = `High-value transaction (₹${recoveryCase.amountAtRisk}) requires human approval`;
      }

    } catch (err) {
      // FAIL CLOSED — any error means BLOCK
      logger.error(`Policy engine error for ${recoveryCase.caseId}: ${err.message}`);
      checks.push({ rule: 'system_error', passed: false, detail: err.message });
      blocked = true;
      blockReason = `Policy engine error: ${err.message}. Failing closed (BLOCK).`;
    }

    // Update case
    const decision = {
      allowed: !blocked,
      reason: blocked ? blockReason : 'All policy checks passed',
      checkedAt: new Date()
    };
    recoveryCase.policyDecision = decision;
    recoveryCase.status = blocked ? 'BLOCKED' : 'APPROVED';
    await recoveryCase.save();

    // Audit
    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: blocked ? 'policy_blocked' : 'policy_approved',
      actor: 'policy_engine',
      message: blocked ? `❌ BLOCKED: ${blockReason}` : '✓ All policy checks passed',
      metadata: { checks, decision }
    });

    logger.agent('POLICY_ENGINE', blocked ? `❌ BLOCKED ${recoveryCase.caseId}: ${blockReason}` : `✓ APPROVED ${recoveryCase.caseId}`);
    return { allowed: !blocked, reason: decision.reason, checks };
  }
}

module.exports = PolicyService;
