const mongoose = require('mongoose');

const STATUSES = [
  'UNPROCESSED', 'DETECTED', 'DIAGNOSING', 'STRATEGY_SELECTED', 'STOPPING_CHECK',
  'HALTED', 'PAUSED', 'POLICY_CHECK', 'BLOCKED', 'APPROVED',
  'EXECUTING', 'VERIFYING', 'AWAITING_CUSTOMER', 'PROMISE_LOGGED', 'RECOVERED', 'PARTIALLY_RECOVERED',
  'FAILED', 'UNKNOWN_STATE', 'HUMAN_REVIEW', 'REJECTED', 'UNRECOVERABLE'
];

const STOPPING_RULES = [
  'CUSTOMER_PAID', 'CUSTOMER_OPT_OUT', 'DISPUTE_RAISED', 'LEGAL_HOLD',
  'UNRECOVERABLE', 'RETRY_LIMIT_HIT', 'LOW_CONFIDENCE', 'POLICY_BLOCKED',
  'COMMS_BLOCKED', 'AWAITING_PROMISE', 'IDEMPOTENCY_CONFLICT'
];

const recoveryCaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, index: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String },
  scenario: {
    type: String,
    enum: ['payment_failure', 'checkout_abandonment', 'subscription_failure', 'invoice_overdue'],
    required: true
  },
  amountAtRisk: { type: Number, required: true },
  recoveryProbability: { type: Number, default: 0 },
  expectedRecoveryValue: { type: Number, default: 0 },
  priorityScore: { type: Number, default: 0 },
  diagnosis: {
    category: { type: String, default: null },
    confidence: { type: Number, default: 0 },
    recoverability: { type: String, enum: ['high', 'medium', 'low', 'unrecoverable', null], default: null },
    reasoning: { type: String, default: '' }
  },
  recommendedAction: {
    type: String,
    enum: ['retry_payment', 'generate_link', 'send_reminder', 'update_method', 'escalate_human', 'stop_recovery', null],
    default: null
  },
  status: { type: String, enum: STATUSES, default: 'DETECTED', index: true },
  stoppingRule: { type: String, enum: [...STOPPING_RULES, null], default: null },
  policyDecision: {
    allowed: { type: Boolean, default: null },
    reason: { type: String, default: '' },
    checkedAt: { type: Date, default: null }
  },
  complianceDecision: {
    passed: { type: Boolean, default: null },
    reason: { type: String, default: '' },
    checkedAt: { type: Date, default: null }
  },
  recoveredAmount: { type: Number, default: 0 },
  attemptCount: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  batchId: { type: String, default: null, index: true },
  escalationStep: { type: Number, default: 0 },
  promiseToPayDate: { type: Date, default: null },
  actionHistory: [{
    action: String,
    result: String,
    timestamp: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('RecoveryCase', recoveryCaseSchema);
