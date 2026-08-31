const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Audit Service — Append-only logging for every decision and action.
 * Every state transition, policy check, and action gets a permanent record.
 */
class AuditService {
  /**
   * Log an audit event. Throws if write fails (no action without a trail).
   */
  static async log({ recoveryCaseId, batchId = null, event, actor, message, metadata = {} }) {
    try {
      const entry = await AuditLog.create({
        recoveryCaseId,
        batchId,
        event,
        actor,
        message,
        metadata,
        timestamp: new Date()
      });
      logger.debug(`Audit: [${event}] ${message}`, { caseId: recoveryCaseId });
      return entry;
    } catch (err) {
      logger.error(`CRITICAL: Audit log write failed — ${err.message}`);
      // No action without a trail — throw to prevent the calling action from proceeding
      throw new Error(`Audit trail write failed: ${err.message}. Action cannot proceed without audit.`);
    }
  }

  /**
   * Get the full audit trail for a recovery case, ordered by timestamp.
   */
  static async getTrail(recoveryCaseId) {
    return AuditLog.find({ recoveryCaseId }).sort({ timestamp: 1 }).lean();
  }

  /**
   * Get all audit entries for a batch run.
   */
  static async getBatchTrail(batchId) {
    return AuditLog.find({ batchId }).sort({ timestamp: 1 }).lean();
  }

  /**
   * Export audit trail as structured array (for CSV/JSON export).
   */
  static async exportTrail(recoveryCaseId) {
    const trail = await this.getTrail(recoveryCaseId);
    return trail.map(entry => ({
      timestamp: entry.timestamp,
      event: entry.event,
      actor: entry.actor,
      message: entry.message,
      metadata: JSON.stringify(entry.metadata)
    }));
  }
}

module.exports = AuditService;
