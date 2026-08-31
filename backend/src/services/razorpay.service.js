const Razorpay = require('razorpay');
const logger = require('../utils/logger');

/**
 * Razorpay Service — Wrapper around Razorpay SDK (test mode).
 * All Razorpay interactions go through this service.
 */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

class RazorpayService {
  /**
   * Create an order for payment retry.
   */
  static async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay uses paise
        currency,
        receipt,
        notes: { ...notes, source: 'razorrecover_ai' }
      });
      logger.agent('RAZORPAY', `Order created: ${order.id} for ₹${amount}`);
      return { success: true, data: order };
    } catch (err) {
      logger.error(`Razorpay createOrder error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Create a payment link for recovery.
   */
  static async createPaymentLink(amount, customerName, customerEmail, customerPhone, description, notes = {}) {
    try {
      const link = await razorpay.paymentLink.create({
        amount: amount * 100,
        currency: 'INR',
        description,
        customer: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        notify: { sms: !!customerPhone, email: !!customerEmail },
        notes: { ...notes, source: 'razorrecover_ai' },
        callback_url: '',
        callback_method: ''
      });
      logger.agent('RAZORPAY', `Payment link created: ${link.short_url} for ₹${amount}`);
      return { success: true, data: link };
    } catch (err) {
      logger.error(`Razorpay createPaymentLink error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch payment details to verify status.
   */
  static async fetchPayment(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return { success: true, data: payment };
    } catch (err) {
      logger.error(`Razorpay fetchPayment error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch order details.
   */
  static async fetchOrder(orderId) {
    try {
      const order = await razorpay.orders.fetch(orderId);
      return { success: true, data: order };
    } catch (err) {
      logger.error(`Razorpay fetchOrder error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Simulate a payment action (for hackathon demo).
   * In test mode, we simulate the outcome since we can't trigger actual customer payments.
   * Demo cases have deterministic outcomes for reproducible demos.
   */
  static async simulateRecoveryAction(action, recoveryCase) {
    const paymentId = recoveryCase.transactionId?.paymentId;

    // ── Deterministic demo cases ──
    const demoOutcomes = {
      'pay_demo_001': { success: true, result: 'success', data: { verified: true, razorpayOrderId: 'order_demo_001_recovered' } },
      'pay_demo_002': { success: true, result: 'success', data: { verified: true, paymentLinkId: 'plink_demo_002_converted' } },
      'pay_demo_003': { success: true, result: 'success', data: { verified: true, methodUpdated: true } },
      'pay_demo_004': { success: true, result: 'promise_to_pay', data: { promiseDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) } },
      'pay_demo_005': { success: false, result: 'failed', data: { reason: 'policy_blocked_before_execution' } },
      'pay_demo_optout': { success: false, result: 'failed', data: { reason: 'stopping_rule_customer_opt_out' } },
      'pay_demo_dispute': { success: false, result: 'failed', data: { reason: 'stopping_rule_dispute_raised' } },
    };

    if (demoOutcomes[paymentId]) {
      logger.agent('RAZORPAY', `Demo case ${paymentId}: deterministic outcome → ${demoOutcomes[paymentId].result}`);
      return demoOutcomes[paymentId];
    }

    // ── Non-demo cases: probability-weighted simulation ──
    // Use recovery probability to determine success, with a floor of 60% for realistic demo numbers
    const effectiveProb = Math.max(recoveryCase.recoveryProbability || 0.5, 0.60);
    const willSucceed = Math.random() < effectiveProb;

    return {
      success: willSucceed,
      result: willSucceed ? 'success' : 'failed',
      data: { simulated: true, probability: recoveryCase.recoveryProbability }
    };
  }
}

module.exports = RazorpayService;
