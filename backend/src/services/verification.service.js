const AuditService = require('./audit.service');
const logger = require('../utils/logger');

/**
 * Verification Engine — Confirms whether recovery actually happened.
 * Does not assume success from action result alone.
 */
class VerificationService {
  /**
   * Verify the outcome of a recovery action.
   */
  static async verify(recoveryCase, actionResult, batchId) {
    logger.agent('VERIFICATION', `Verifying outcome for ${recoveryCase.caseId}...`);

    await AuditService.log({
      recoveryCaseId: recoveryCase._id,
      batchId,
      event: 'verification_started',
      actor: 'verification',
      message: `Verifying recovery action result`,
      metadata: { actionResult: actionResult.result }
    });

    recoveryCase.status = 'VERIFYING';
    await recoveryCase.save();

    let verified = false;
    let finalStatus = 'FAILED';
    let recoveredAmount = 0;

    if (actionResult.result === 'timeout') {
      // Unknown state — mark for re-check
      finalStatus = 'UNKNOWN_STATE';
      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'recovery_failed',
        actor: 'verification',
        message: 'Action timed out — status unknown, needs re-verification',
        metadata: { status: 'UNKNOWN_STATE' }
      });
    } else if (actionResult.result === 'promise_to_pay') {
      // Promise to pay (B2B invoices)
      finalStatus = 'PAUSED';
      recoveryCase.promiseToPayDate = actionResult.data?.promiseDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      recoveryCase.stoppingRule = 'AWAITING_PROMISE';

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'recovery_verified',
        actor: 'verification',
        message: `Promise to pay received — expected: ${recoveryCase.promiseToPayDate.toDateString()}`,
        metadata: { promiseDate: recoveryCase.promiseToPayDate }
      });
    } else if (actionResult.success || actionResult.result === 'link_generated') {
      // Action successfully dispatched to customer — awaiting customer action in Customer Portal
      verified = false;
      finalStatus = 'AWAITING_CUSTOMER';
      recoveredAmount = 0;

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'action_executed',
        actor: 'verification',
        message: `Action dispatched via Razorpay API — awaiting customer settlement on Customer Portal`,
        metadata: { action: recoveryCase.recommendedAction }
      });
    } else {
      // Failed
      finalStatus = 'FAILED';
      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'recovery_failed',
        actor: 'verification',
        message: `✗ Recovery verification failed`,
        metadata: { reason: actionResult.data?.error || 'Action did not succeed' }
      });
    }

    // Update case
    recoveryCase.status = finalStatus;
    recoveryCase.recoveredAmount = recoveredAmount;
    await recoveryCase.save();

    logger.agent('VERIFICATION', verified
      ? `✓ ${recoveryCase.caseId}: ₹${recoveredAmount} RECOVERED`
      : `${recoveryCase.caseId}: ${finalStatus}`);

    return { verified, finalStatus, recoveredAmount };
  }
}

module.exports = VerificationService;
