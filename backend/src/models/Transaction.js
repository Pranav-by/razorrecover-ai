const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  merchantId: { type: String, default: 'MERCHANT_001' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'emandate', 'bank_transfer'], required: true },
  status: { type: String, enum: ['failed', 'success', 'created', 'abandoned'], required: true, index: true },
  failureReason: {
    type: String,
    enum: [
      'upi_timeout', 'bank_decline', 'insufficient_funds', 'expired_card',
      'network_error', 'authentication_failure', 'customer_abandonment',
      'subscription_payment_failed', 'invoice_overdue', 'fraud_suspected',
      'mandate_expired', 'mandate_revoked', null
    ],
    default: null
  },
  scenario: {
    type: String,
    enum: ['payment_failure', 'checkout_abandonment', 'subscription_failure', 'invoice_overdue', 'successful'],
    required: true,
    index: true
  },
  checkoutEvents: [{ type: String }],
  subscriptionId: { type: String, default: null },
  invoiceId: { type: String, default: null },
  dueDate: { type: Date, default: null },
  attempts: { type: Number, default: 1 },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  orderDescription: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
