// Policy configuration — all thresholds in one place
module.exports = {
  MAX_PAYMENT_RETRIES: 2,
  AUTO_ACTION_LIMIT: 10000,          // ₹10,000
  MIN_RECOVERY_CONFIDENCE: 0.75,
  HIGH_VALUE_THRESHOLD: 50000,       // ₹50,000
  HUMAN_REVIEW_THRESHOLD: 50000,
  ALLOWED_RETRY_REASONS: [
    'upi_timeout',
    'network_error',
    'bank_decline'
  ],
  DISALLOWED_REASONS: [
    'fraud_suspected',
    'customer_requested_cancellation'
  ],
  // Communication guardrails
  CONTACT_WINDOW_START: 9,   // 09:00 IST
  CONTACT_WINDOW_END: 19,    // 19:00 IST
  MAX_MESSAGES_PER_DAY: 1,
  MAX_MESSAGES_PER_CASE: 3,
  // Escalation
  MAX_ESCALATION_STEPS: 5,
  ESCALATION_AUTO_MAX: 3     // Steps 1-3 are automated, 4-5 require human
};
