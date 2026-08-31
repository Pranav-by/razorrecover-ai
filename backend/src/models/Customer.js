const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  successfulPayments: { type: Number, default: 0 },
  failedPayments: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  lastPaymentAt: { type: Date, default: null },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  optedOut: { type: Boolean, default: false },
  consentChannels: [{ type: String, enum: ['email', 'sms', 'notification'] }],
  disputeHistory: [{
    disputeId: String,
    amount: Number,
    status: String,
    createdAt: Date
  }],
  subscriptions: [{
    subscriptionId: String,
    plan: String,
    amount: Number,
    status: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
