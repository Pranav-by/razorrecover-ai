const logger = require('../utils/logger');

/**
 * Priority Engine — Ranks recovery cases by expected recovery value.
 */
class PriorityService {
  /**
   * Sort cases by expected recovery value (descending).
   */
  static rankCases(cases) {
    return cases.sort((a, b) => {
      // Primary: expected recovery value
      const evDiff = b.expectedRecoveryValue - a.expectedRecoveryValue;
      if (evDiff !== 0) return evDiff;

      // Tiebreak: priority score
      const pDiff = b.priorityScore - a.priorityScore;
      if (pDiff !== 0) return pDiff;

      // Tiebreak: fewer attempts first (more likely to succeed)
      return a.attemptCount - b.attemptCount;
    });
  }

  /**
   * Calculate expected recovery value.
   */
  static calculateExpectedValue(amount, probability) {
    return Math.round(amount * probability);
  }
}

module.exports = PriorityService;
