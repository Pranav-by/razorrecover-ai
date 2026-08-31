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
   */
  static async simulateRecoveryAction(action, recoveryCase) {
    // Simulate based on recovery probability
    const willSucceed = Math.random() < recoveryCase.recoveryProbability;

    // For demo cases, force specific outcomes
    const demoOutcomes = {
      'pay_demo_001': true,   // Always recover
      'pay_demo_002': true,   // Always recover
      'pay_demo_003': true,   // Always recover
      'pay_demo_004': 'promise', // Promise to pay
    };

    const paymentId = recoveryCase.transactionId?.paymentId;
    if (demoOutcomes[paymentId] !== undefined) {
      if (demoOutcomes[paymentId] === 'promise') {
        return { success: true, result: 'promise_to_pay', data: { promiseDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) } };
      }
      return { success: demoOutcomes[paymentId], result: demoOutcomes[paymentId] ? 'success' : 'failed', data: {} };
    }

    return {
      success: willSucceed,
      result: willSucceed ? 'success' : 'failed',
      data: { simulated: true, probability: recoveryCase.recoveryProbability }
    };
  }
}

module.exports = RazorpayService;
