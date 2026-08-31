const RecoveryCase = require('../models/RecoveryCase');
const BatchRun = require('../models/BatchRun');
const Transaction = require('../models/Transaction');

class DashboardController {
  /**
   * GET /api/dashboard/summary
   */
  static async getSummary(req, res, next) {
    try {
      const allCases = await RecoveryCase.find().lean();
      const revenueAtRisk = allCases.reduce((sum, c) => sum + c.amountAtRisk, 0);
      const revenueRecovered = allCases
        .filter(c => c.status === 'RECOVERED')
        .reduce((sum, c) => sum + c.recoveredAmount, 0);
      const activeRecoveries = allCases.filter(c =>
        !['RECOVERED', 'HALTED', 'REJECTED', 'UNRECOVERABLE'].includes(c.status)
      ).length;
      const humanReviews = allCases.filter(c =>
        ['HUMAN_REVIEW', 'BLOCKED', 'PAUSED'].includes(c.status)
      ).length;
      const recoveryRate = revenueAtRisk > 0
        ? Math.round((revenueRecovered / revenueAtRisk) * 10000) / 100
        : 0;

      res.json({
        revenueAtRisk,
        revenueRecovered,
        recoveryRate,
        activeRecoveries,
        humanReviews,
        totalCases: allCases.length
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /api/dashboard/breakdown
   */
  static async getBreakdown(req, res, next) {
    try {
      const pipeline = [
        { $match: { scenario: { $ne: 'successful' } } },
        {
          $group: {
            _id: '$scenario',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ];
      const breakdown = await Transaction.aggregate(pipeline);

      const result = breakdown.map(b => ({
        scenario: b._id,
        count: b.count,
        totalAmount: b.totalAmount
      }));

      res.json({ breakdown: result });
    } catch (err) { next(err); }
  }

  /**
   * GET /api/dashboard/batch-history
   */
  static async getBatchHistory(req, res, next) {
    try {
      const batches = await BatchRun.find()
        .sort({ startedAt: -1 })
        .limit(10)
        .lean();
      res.json({ batches });
    } catch (err) { next(err); }
  }
}

module.exports = DashboardController;
