const RecoveryCase = require('../models/RecoveryCase');
const AuditService = require('../services/audit.service');

class ReviewController {
  /**
   * GET /api/review-queue
   */
  static async getQueue(req, res, next) {
    try {
      const cases = await RecoveryCase.find({
        status: { $in: ['HUMAN_REVIEW', 'BLOCKED', 'PAUSED'] }
      })
        .populate('transactionId')
        .sort({ amountAtRisk: -1 })
        .lean();

      res.json({ cases, total: cases.length });
    } catch (err) { next(err); }
  }

  /**
   * POST /api/review-queue/:id/approve
   */
  static async approve(req, res, next) {
    try {
      const recoveryCase = await RecoveryCase.findOne({ caseId: req.params.id });
      if (!recoveryCase) return res.status(404).json({ error: 'Case not found' });

      recoveryCase.status = 'APPROVED';
      recoveryCase.policyDecision = {
        allowed: true,
        reason: 'Manually approved by human reviewer',
        checkedAt: new Date()
      };
      await recoveryCase.save();

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        event: 'human_approved',
        actor: 'human',
        message: `Case manually approved by reviewer`,
        metadata: { previousStatus: 'HUMAN_REVIEW' }
      });

      res.json({ message: 'Case approved', case: recoveryCase });
    } catch (err) { next(err); }
  }

  /**
   * POST /api/review-queue/:id/reject
   */
  static async reject(req, res, next) {
    try {
      const recoveryCase = await RecoveryCase.findOne({ caseId: req.params.id });
      if (!recoveryCase) return res.status(404).json({ error: 'Case not found' });

      recoveryCase.status = 'REJECTED';
      await recoveryCase.save();

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        event: 'human_rejected',
        actor: 'human',
        message: `Case manually rejected by reviewer${req.body.reason ? ': ' + req.body.reason : ''}`,
        metadata: { reason: req.body.reason }
      });

      res.json({ message: 'Case rejected', case: recoveryCase });
    } catch (err) { next(err); }
  }
}

module.exports = ReviewController;
