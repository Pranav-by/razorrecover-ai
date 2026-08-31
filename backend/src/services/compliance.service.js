const Customer = require('../models/Customer');
const RecoveryAction = require('../models/RecoveryAction');
const AuditService = require('./audit.service');
const config = require('../utils/policy-config');
const logger = require('../utils/logger');

/**
 * Compliance Service — Communication guardrails.
 * 7-point checklist before any outbound message.
 * Independent from Policy Engine (financial guardrails).
 */
class ComplianceService {
  /**
   * Check all communication compliance rules.
   * Returns: { passed: boolean, reason: string, checks: [] }
   */
  static async check(recoveryCase, channel = 'email', batchId) {
    logger.agent('COMPLIANCE', `Checking communication compliance for ${recoveryCase.caseId}...`);

    // If action doesn't involve communication, skip
    if (['retry_payment', 'escalate_human'].includes(recoveryCase.recommendedAction)) {
      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'compliance_passed',
        actor: 'compliance',
        message: 'Compliance check not required (non-communication action)',
        metadata: { action: recoveryCase.recommendedAction }
      });
      return { passed: true, reason: 'Not a communication action', checks: [] };
    }

    const customer = await Customer.findOne({ customerId: recoveryCase.customerId }).lean();
    const checks = [];
    let blocked = false;
    let blockReason = '';

    // Check 1: Customer not opted out
    if (customer?.optedOut) {
      checks.push({ rule: 'opt_out', passed: false });
      blocked = true;
      blockReason = 'Customer has opted out of contact';
    } else {
      checks.push({ rule: 'opt_out', passed: true });
    }

    // Check 2: Within contact window (09:00–19:00 IST)
    if (!blocked) {
      const now = new Date();
      const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0);
      const withinWindow = istHour >= config.CONTACT_WINDOW_START && istHour < config.CONTACT_WINDOW_END;
      checks.push({ rule: 'contact_window', passed: withinWindow, detail: `IST hour: ${istHour}` });
      if (!withinWindow) {
        blocked = true;
        blockReason = `Outside contact window (current IST hour: ${istHour}, allowed: ${config.CONTACT_WINDOW_START}:00–${config.CONTACT_WINDOW_END}:00)`;
      }
    }

    // Check 3: Frequency cap
    if (!blocked) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayMessages = await RecoveryAction.countDocuments({
        recoveryCaseId: recoveryCase._id,
        channel: { $ne: null },
        createdAt: { $gte: today }
      });
      const totalMessages = await RecoveryAction.countDocuments({
        recoveryCaseId: recoveryCase._id,
        channel: { $ne: null }
      });

      const dailyOk = todayMessages < config.MAX_MESSAGES_PER_DAY;
      const totalOk = totalMessages < config.MAX_MESSAGES_PER_CASE;
      checks.push({ rule: 'frequency_cap', passed: dailyOk && totalOk, detail: `Today: ${todayMessages}/${config.MAX_MESSAGES_PER_DAY}, Total: ${totalMessages}/${config.MAX_MESSAGES_PER_CASE}` });
      if (!dailyOk || !totalOk) {
        blocked = true;
        blockReason = `Frequency cap exceeded (today: ${todayMessages}/${config.MAX_MESSAGES_PER_DAY}, total: ${totalMessages}/${config.MAX_MESSAGES_PER_CASE})`;
      }
    }

    // Check 4: Channel consent
    if (!blocked) {
      const hasConsent = customer?.consentChannels?.includes(channel);
      checks.push({ rule: 'channel_consent', passed: hasConsent, detail: `Channel: ${channel}, Consented: ${customer?.consentChannels?.join(', ')}` });
      if (!hasConsent) {
        // Try fallback channel
        const fallbackChannel = customer?.consentChannels?.[0];
        if (fallbackChannel) {
          checks.push({ rule: 'channel_fallback', passed: true, detail: `Falling back to ${fallbackChannel}` });
          channel = fallbackChannel;
        } else {
          blocked = true;
          blockReason = `No consented communication channel available`;
        }
      }
    }

    // Check 5: Case not disputed
    if (!blocked) {
      const hasDispute = customer?.disputeHistory?.some(d => d.status === 'open');
      checks.push({ rule: 'no_dispute', passed: !hasDispute });
      if (hasDispute) {
        blocked = true;
        blockReason = 'Active dispute on customer account';
      }
    }

    // Check 6: Escalation step valid
    if (!blocked) {
      const stepValid = recoveryCase.escalationStep < config.ESCALATION_AUTO_MAX;
      checks.push({ rule: 'escalation_step', passed: stepValid, detail: `Step: ${recoveryCase.escalationStep}/${config.ESCALATION_AUTO_MAX}` });
      if (!stepValid) {
        blocked = true;
        blockReason = `Escalation step ${recoveryCase.escalationStep} requires human hand-off`;
      }
    }

    // Update case
    recoveryCase.complianceDecision = {
      passed: !blocked,
      reason: blocked ? blockReason : 'All compliance checks passed',
      checkedAt: new Date()
    };
    await recoveryCase.save();

    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: blocked ? 'compliance_blocked' : 'compliance_passed',
      actor: 'compliance',
      message: blocked ? `❌ Compliance blocked: ${blockReason}` : '✓ All compliance checks passed',
      metadata: { checks, channel }
    });

    logger.agent('COMPLIANCE', blocked ? `❌ BLOCKED ${recoveryCase.caseId}: ${blockReason}` : `✓ PASSED ${recoveryCase.caseId}`);
    return { passed: !blocked, reason: blocked ? blockReason : 'All checks passed', checks, channel };
  }
}

module.exports = ComplianceService;
