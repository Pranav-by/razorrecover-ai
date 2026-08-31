const AuditService = require('./audit.service');
const logger = require('../utils/logger');

/**
 * Strategy Agent — Selects the appropriate recovery intervention.
 * Uses the diagnosis to determine the best action.
 * (Deterministic mapping — AI is used in diagnosis, not here.)
 */
class StrategyService {
  /**
   * Select recovery strategy based on diagnosis.
   */
  static async selectStrategy(recoveryCase, diagnosis, batchId) {
    logger.agent('STRATEGY_AGENT', `Selecting strategy for ${recoveryCase.caseId}...`);

    const action = this._mapStrategy(recoveryCase.scenario, diagnosis);

    recoveryCase.recommendedAction = action;
    recoveryCase.status = 'STRATEGY_SELECTED';
    await recoveryCase.save();

    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: 'strategy_selected',
      actor: 'ai',
      message: `Strategy selected: ${action} for ${recoveryCase.scenario}`,
      metadata: {
        scenario: recoveryCase.scenario,
        action,
        diagnosisCategory: diagnosis?.diagnosis?.category,
        confidence: diagnosis?.diagnosis?.confidence
      }
    });

    logger.agent('STRATEGY_AGENT', `Strategy for ${recoveryCase.caseId}: ${action}`);
    return action;
  }

  /**
   * Map scenario + diagnosis to a recovery action.
   */
  static _mapStrategy(scenario, diagnosis) {
    const category = diagnosis?.diagnosis?.category || 'unknown';
    const action = diagnosis?.recovery?.action;

    // If AI already recommended an action and it's valid, use it
    const validActions = ['retry_payment', 'generate_link', 'send_reminder', 'update_method', 'escalate_human', 'stop_recovery'];
    if (action && validActions.includes(action)) {
      // But override for safety
      if (category === 'fraud_risk') return 'escalate_human';
      if (category === 'unknown' && (diagnosis?.diagnosis?.confidence || 0) < 0.5) return 'escalate_human';
      return action;
    }

    // Fallback: deterministic mapping
    switch (scenario) {
      case 'payment_failure':
        if (['temporary_failure'].includes(category)) return 'retry_payment';
        if (category === 'payment_method_issue') return 'update_method';
        if (category === 'fraud_risk') return 'escalate_human';
        return 'generate_link';

      case 'checkout_abandonment':
        return 'generate_link';

      case 'subscription_failure':
        if (category === 'payment_method_issue') return 'update_method';
        return 'send_reminder';

      case 'invoice_overdue':
        return 'send_reminder';

      default:
        return 'escalate_human';
    }
  }
}

module.exports = StrategyService;
