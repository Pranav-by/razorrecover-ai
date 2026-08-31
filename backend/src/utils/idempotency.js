const RecoveryAction = require('../models/RecoveryAction');
const logger = require('./logger');

/**
 * Generate an idempotency key for a recovery action.
 * Format: recovery_{caseId}_attempt_{attemptNumber}
 */
function generateIdempotencyKey(caseId, attemptNumber) {
  return `recovery_${caseId}_attempt_${String(attemptNumber).padStart(2, '0')}`;
}

/**
 * Check if an action with this idempotency key has already been executed.
 * Returns the existing action if found, null otherwise.
 */
async function checkIdempotency(idempotencyKey) {
  try {
    const existing = await RecoveryAction.findOne({ idempotencyKey });
    if (existing) {
      logger.warn(`Idempotency conflict: ${idempotencyKey} already exists`, {
        result: existing.result,
        executedAt: existing.executedAt
      });
      return existing;
    }
    return null;
  } catch (err) {
    logger.error(`Idempotency check failed: ${err.message}`);
    // Fail closed — treat as conflict to prevent duplicate actions
    return { result: 'conflict_error', error: err.message };
  }
}

module.exports = { generateIdempotencyKey, checkIdempotency };
