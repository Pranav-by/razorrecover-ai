const mongoose = require('mongoose');

const recoveryActionSchema = new mongoose.Schema({
  recoveryCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryCase', required: true, index: true },
  action: {
    type: String,
    enum: ['retry_payment', 'generate_link', 'send_reminder', 'update_method', 'escalate_human'],
    required: true
  },
  attempt: { type: Number, required: true },
  policyDecision: { type: String, enum: ['approved', 'blocked'], required: true },
  complianceCheck: {
    type: String,
    enum: ['passed', 'blocked_hours', 'blocked_frequency', 'blocked_consent', 'blocked_template', 'not_applicable'],
    default: 'not_applicable'
  },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  executedAt: { type: Date, default: Date.now },
  result: { type: String, enum: ['success', 'failed', 'timeout', 'pending', 'blocked'], default: 'pending' },
  razorpayResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String, default: null },
  templateId: { type: String, default: null },
  channel: { type: String, enum: ['sms', 'email', 'notification', null], default: null },
  messageSent: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('RecoveryAction', recoveryActionSchema);
