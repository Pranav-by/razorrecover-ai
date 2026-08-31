const mongoose = require('mongoose');

const batchRunSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['running', 'completed', 'failed', 'interrupted'], default: 'running' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  casesScanned: { type: Number, default: 0 },
  totalRevenueAtRisk: { type: Number, default: 0 },
  recoverableCases: { type: Number, default: 0 },
  autoActioned: { type: Number, default: 0 },
  humanReviewRequired: { type: Number, default: 0 },
  blockedByPolicy: { type: Number, default: 0 },
  blockedByCompliance: { type: Number, default: 0 },
  stoppedByStoppingRules: { type: Number, default: 0 },
  verifiedRecoveredAmount: { type: Number, default: 0 },
  pendingVerificationAmount: { type: Number, default: 0 },
  recoveryRatePercent: { type: Number, default: 0 },
  lastProcessedCaseIndex: { type: Number, default: 0 },
  caseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryCase' }]
}, { timestamps: true });

module.exports = mongoose.model('BatchRun', batchRunSchema);
