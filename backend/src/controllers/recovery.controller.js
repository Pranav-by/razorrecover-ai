const RecoveryCase = require('../models/RecoveryCase');
const BatchRun = require('../models/BatchRun');
const AuditService = require('../services/audit.service');
const OrchestratorService = require('../services/orchestrator.service');

class RecoveryController {
  /**
   * GET /api/recoveries
   */
  static async listAll(req, res, next) {
    try {
      const { scenario, status, page = 1, limit = 50, sort = '-priorityScore' } = req.query;
      const filter = {};
      if (scenario) filter.scenario = scenario;
      if (status) filter.status = status;

      const cases = await RecoveryCase.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
      const total = await RecoveryCase.countDocuments(filter);

      res.json({ cases, total, page: Number(page), limit: Number(limit) });
    } catch (err) { next(err); }
  }

  /**
   * GET /api/recoveries/:id
   */
  static async getById(req, res, next) {
    try {
      const recoveryCase = await RecoveryCase.findOne({ caseId: req.params.id })
        .populate('transactionId')
        .lean();
      if (!recoveryCase) return res.status(404).json({ error: 'Case not found' });

      const auditTrail = await AuditService.getTrail(recoveryCase._id);
      res.json({ ...recoveryCase, auditTrail });
    } catch (err) { next(err); }
  }

  /**
   * POST /api/recovery/run-batch
   */
  static async runBatch(req, res, next) {
    try {
      // Clear any stale running batches older than 10 seconds to prevent deadlock
      const staleThreshold = new Date(Date.now() - 10 * 1000);
      await BatchRun.updateMany(
        { status: 'running', startedAt: { $lt: staleThreshold } },
        { status: 'interrupted', completedAt: new Date() }
      );

      // Check if another batch was started just now (< 10s ago)
      const running = await BatchRun.findOne({ status: 'running' });
      if (running) {
        // If still active within 10s, return active status
        return res.json({ message: 'Batch recovery currently processing', batchId: running.batchId, status: 'running' });
      }

      // Start batch
      res.json({ message: 'Batch recovery started', status: 'running' });

      // Run orchestrator
      OrchestratorService.runBatch().catch(err => {
        console.error('Batch run error:', err.message);
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /api/recovery/batch/:batchId
   */
  static async getBatchResult(req, res, next) {
    try {
      const batch = await BatchRun.findOne({ batchId: req.params.batchId }).lean();
      if (!batch) return res.status(404).json({ error: 'Batch not found' });
      res.json(batch);
    } catch (err) { next(err); }
  }

  /**
   * GET /api/recovery/batch/:batchId/export
   */
  static async exportBatch(req, res, next) {
    try {
      let batchId = req.params.batchId;
      if (batchId === 'latest') {
        const latest = await BatchRun.findOne().sort({ startedAt: -1 }).lean();
        batchId = latest?.batchId;
      }

      const batch = await BatchRun.findOne({ batchId }).lean();
      const cases = await RecoveryCase.find().populate('transactionId').lean();

      const exportData = cases.map(c => ({
        caseId: c.caseId,
        scenario: c.scenario,
        customer: c.customerName,
        amount: c.amountAtRisk,
        diagnosis: c.diagnosis?.category || 'evaluated',
        confidence: c.diagnosis?.confidence || 0.85,
        action: c.recommendedAction || 'retry_payment',
        policyResult: c.policyDecision?.allowed ? 'approved' : 'blocked',
        stoppingRule: c.stoppingRule || 'none',
        status: c.status,
        recoveredAmount: c.recoveredAmount || 0
      }));

      const format = req.query.format || 'json';
      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {}).join(',');
        const rows = exportData.map(r => Object.values(r).map(v => `"${v}"`).join(','));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=recovery_audit_matrix_${batchId || 'latest'}.csv`);
        res.send([headers, ...rows].join('\n'));
      } else {
        res.json({ batch, cases: exportData });
      }
    } catch (err) { next(err); }
  }

  /**
   * GET /api/recovery/latest-batch
   */
  static async getLatestBatch(req, res, next) {
    try {
      const batch = await BatchRun.findOne().sort({ startedAt: -1 }).lean();
      if (!batch) return res.json({ batch: null });
      res.json(batch);
    } catch (err) { next(err); }
  }
}

module.exports = RecoveryController;
