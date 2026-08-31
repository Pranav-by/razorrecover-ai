const Customer = require('../models/Customer');
const RecoveryCase = require('../models/RecoveryCase');
const AuditService = require('./audit.service');
const logger = require('../utils/logger');

/**
 * Stopping Rules Engine — Checked BEFORE Policy Engine.
 * Determines if a case must be halted (permanently) or paused (temporarily).
 */
class StoppingRulesService {
  /**
   * Check all stopping rules for a recovery case.
   * Returns: { stopped: boolean, permanent: boolean, rule: string|null, reason: string }
   */
  static async check(recoveryCase, batchId) {
    logger.agent('STOPPING_RULES', `Checking stopping rules for ${recoveryCase.caseId}...`);

    const customer = await Customer.findOne({ customerId: recoveryCase.customerId }).lean();

    // ── Permanent stops (terminal, never resume) ──

    // CUSTOMER_PAID — check if there's a successful payment for the same transaction
    if (recoveryCase.status === 'RECOVERED') {
      return this._halt(recoveryCase, 'CUSTOMER_PAID', 'Payment already settled', batchId);
    }

    // CUSTOMER_OPT_OUT
    if (customer?.optedOut) {
      return this._halt(recoveryCase, 'CUSTOMER_OPT_OUT', 'Customer has opted out of contact', batchId);
    }

    // DISPUTE_RAISED
    if (customer?.disputeHistory?.some(d => d.status === 'open')) {
      return this._halt(recoveryCase, 'DISPUTE_RAISED', 'Active dispute exists — freeze all recovery', batchId);
    }

    // UNRECOVERABLE — max attempts AND extended time (>30 days)
    const ageInDays = (Date.now() - new Date(recoveryCase.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (recoveryCase.attemptCount >= recoveryCase.maxAttempts && ageInDays > 30) {
      return this._halt(recoveryCase, 'UNRECOVERABLE', 'Max attempts and time window exhausted', batchId);
    }

    // ── Temporary stops (paused, may resume) ──

    // RETRY_LIMIT_HIT
    if (recoveryCase.attemptCount >= recoveryCase.maxAttempts) {
      return this._pause(recoveryCase, 'RETRY_LIMIT_HIT', `Retry limit reached (${recoveryCase.attemptCount}/${recoveryCase.maxAttempts})`, batchId);
    }

    // LOW_CONFIDENCE
    if (recoveryCase.diagnosis?.confidence && recoveryCase.diagnosis.confidence < 0.5) {
      return this._pause(recoveryCase, 'LOW_CONFIDENCE', `Diagnosis confidence too low (${Math.round(recoveryCase.diagnosis.confidence * 100)}%)`, batchId);
    }

    // AWAITING_PROMISE
    if (recoveryCase.promiseToPayDate) {
      const promiseDate = new Date(recoveryCase.promiseToPayDate);
      const tomorrow = new Date(promiseDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (new Date() < tomorrow) {
        return this._pause(recoveryCase, 'AWAITING_PROMISE', `Waiting for promise-to-pay date: ${promiseDate.toDateString()}`, batchId);
      }
    }

    // All clear
    recoveryCase.status = 'STOPPING_CHECK';
    await recoveryCase.save();
    logger.agent('STOPPING_RULES', `No stopping rules triggered for ${recoveryCase.caseId}`);

    return { stopped: false, permanent: false, rule: null, reason: 'All stopping rules passed' };
  }

  static async _halt(recoveryCase, rule, reason, batchId) {
    recoveryCase.status = 'HALTED';
    recoveryCase.stoppingRule = rule;
    await recoveryCase.save();

    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: 'stopping_rule_fired',
      actor: 'stopping_rules',
      message: `PERMANENT STOP: ${rule} — ${reason}`,
      metadata: { rule, permanent: true }
    });

    logger.agent('STOPPING_RULES', `🛑 HALTED ${recoveryCase.caseId}: ${rule}`);
    return { stopped: true, permanent: true, rule, reason };
  }

  static async _pause(recoveryCase, rule, reason, batchId) {
    recoveryCase.status = 'PAUSED';
    recoveryCase.stoppingRule = rule;
    await recoveryCase.save();

    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: 'stopping_rule_fired',
      actor: 'stopping_rules',
      message: `TEMPORARY STOP: ${rule} — ${reason}`,
      metadata: { rule, permanent: false }
    });

    logger.agent('STOPPING_RULES', `⏸ PAUSED ${recoveryCase.caseId}: ${rule}`);
    return { stopped: true, permanent: false, rule, reason };
  }
}

module.exports = StoppingRulesService;
