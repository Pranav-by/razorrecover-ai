const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  recoveryCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryCase', index: true },
  batchId: { type: String, default: null, index: true },
  event: {
    type: String,
    enum: [
      'revenue_detected', 'diagnosis_complete', 'strategy_selected',
      'stopping_rule_fired', 'policy_check', 'policy_approved', 'policy_blocked',
      'compliance_check', 'compliance_blocked', 'compliance_passed',
      'action_started', 'action_executed', 'action_failed', 'action_timeout',
      'verification_started', 'recovery_verified', 'recovery_failed', 'partial_recovery',
      'human_review_required', 'human_approved', 'human_rejected',
      'case_halted', 'case_paused', 'batch_started', 'batch_completed',
      'message_sent', 'message_blocked'
    ],
    required: true
  },
  actor: {
    type: String,
    enum: ['system', 'ai', 'policy_engine', 'stopping_rules', 'compliance', 'action_agent', 'verification', 'human'],
    required: true
  },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Append-only: disable update and delete operations
auditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndDelete', 'deleteOne', 'deleteMany'], function() {
  throw new Error('Audit logs are append-only. Updates and deletes are not permitted.');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
