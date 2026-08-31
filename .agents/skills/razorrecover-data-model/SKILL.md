---
name: razorrecover-data-model
description: MongoDB collection schemas, API contracts, AI output schema, and idempotency key format for RazorRecover AI. Reference for any data or API work.
---

# RazorRecover AI — Data Model & API Contracts

## MongoDB Database
- **Database:** `razorrecover`
- **Connection:** MongoDB Atlas (cluster0.lkee1f1.mongodb.net)

## Collections

### `transactions`
Raw payment/event data ingested from merchant systems.
```json
{
  "_id": "ObjectId",
  "paymentId": "pay_82931",
  "customerId": "CUS_102",
  "merchantId": "MERCHANT_001",
  "amount": 4999,
  "currency": "INR",
  "method": "upi|card|netbanking|wallet",
  "status": "failed|success|created|abandoned",
  "failureReason": "upi_timeout|bank_decline|insufficient_funds|expired_card|network_error|authentication_failure|customer_abandonment",
  "scenario": "payment_failure|checkout_abandonment|subscription_failure|invoice_overdue",
  "checkoutEvents": ["product_viewed", "added_to_cart", "checkout_started", "payment_page_opened", "customer_left"],
  "subscriptionId": "sub_123|null",
  "invoiceId": "inv_456|null",
  "dueDate": "ISODate|null",
  "attempts": 1,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `recovery_cases`
Active recovery tracking with full state machine.
```json
{
  "_id": "ObjectId",
  "caseId": "RC_001",
  "transactionId": "ObjectId → transactions",
  "customerId": "CUS_102",
  "scenario": "payment_failure|checkout_abandonment|subscription_failure|invoice_overdue",
  "amountAtRisk": 4999,
  "recoveryProbability": 0.91,
  "expectedRecoveryValue": 4549,
  "priorityScore": 84,
  "diagnosis": {
    "category": "temporary_failure|payment_method_issue|customer_abandonment|overdue_payment",
    "confidence": 0.94,
    "recoverability": "high|medium|low|unrecoverable",
    "reasoning": "string"
  },
  "recommendedAction": "retry_payment|generate_link|send_reminder|update_method|escalate_human|stop_recovery",
  "status": "DETECTED|DIAGNOSING|STRATEGY_SELECTED|STOPPING_CHECK|HALTED|PAUSED|POLICY_CHECK|BLOCKED|APPROVED|EXECUTING|VERIFYING|RECOVERED|PARTIALLY_RECOVERED|FAILED|UNKNOWN_STATE|HUMAN_REVIEW|REJECTED|UNRECOVERABLE",
  "stoppingRule": "null|CUSTOMER_PAID|CUSTOMER_OPT_OUT|DISPUTE_RAISED|LEGAL_HOLD|UNRECOVERABLE|RETRY_LIMIT_HIT|LOW_CONFIDENCE|POLICY_BLOCKED|COMMS_BLOCKED|AWAITING_PROMISE|IDEMPOTENCY_CONFLICT",
  "policyDecision": {
    "allowed": true,
    "reason": "string",
    "checkedAt": "ISODate"
  },
  "recoveredAmount": 0,
  "attemptCount": 0,
  "maxAttempts": 3,
  "batchId": "run_2026_08_31_001|null",
  "escalationStep": 0,
  "promiseToPayDate": "ISODate|null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### `recovery_actions`
Individual executed actions with idempotency.
```json
{
  "_id": "ObjectId",
  "recoveryCaseId": "ObjectId → recovery_cases",
  "action": "retry_payment|generate_link|send_reminder|update_method|escalate_human",
  "attempt": 1,
  "policyDecision": "approved|blocked",
  "complianceCheck": "passed|blocked_hours|blocked_frequency|blocked_consent|blocked_template",
  "idempotencyKey": "recovery_RC_001_attempt_01",
  "executedAt": "ISODate",
  "result": "success|failed|timeout|pending",
  "razorpayResponse": {},
  "error": "string|null",
  "templateId": "payment_reminder_gentle|null",
  "channel": "sms|email|notification|null",
  "createdAt": "ISODate"
}
```

### `audit_logs`
Append-only decision trail. No updates or deletes ever.
```json
{
  "_id": "ObjectId",
  "recoveryCaseId": "ObjectId → recovery_cases",
  "batchId": "string|null",
  "event": "revenue_detected|diagnosis_complete|strategy_selected|stopping_rule_fired|policy_check|policy_approved|policy_blocked|compliance_check|compliance_blocked|action_started|action_executed|action_failed|verification_started|recovery_verified|recovery_failed|human_review_required|human_approved|human_rejected|case_halted|case_paused",
  "actor": "system|ai|policy_engine|stopping_rules|compliance|action_agent|verification|human",
  "message": "string",
  "metadata": {},
  "timestamp": "ISODate"
}
```

### `customers`
Customer history and profile.
```json
{
  "_id": "ObjectId",
  "customerId": "CUS_102",
  "name": "Rahul",
  "email": "rahul@example.com",
  "phone": "+91-9876543210",
  "successfulPayments": 5,
  "failedPayments": 1,
  "totalSpend": 45000,
  "lastPaymentAt": "ISODate",
  "riskLevel": "low|medium|high",
  "optedOut": false,
  "consentChannels": ["email", "sms"],
  "disputeHistory": [],
  "subscriptions": [],
  "createdAt": "ISODate"
}
```

### `batch_runs`
Batch-level execution tracking.
```json
{
  "_id": "ObjectId",
  "batchId": "run_2026_08_31_001",
  "status": "running|completed|failed|interrupted",
  "startedAt": "ISODate",
  "completedAt": "ISODate|null",
  "casesScanned": 73,
  "totalRevenueAtRisk": 842000,
  "recoverableCases": 51,
  "autoActioned": 37,
  "humanReviewRequired": 9,
  "blockedByPolicy": 4,
  "blockedByCompliance": 1,
  "stoppedByStoppingRules": 5,
  "verifiedRecoveredAmount": 217000,
  "pendingVerificationAmount": 68000,
  "recoveryRatePercent": 25.8,
  "lastProcessedCaseIndex": 73,
  "caseIds": ["ObjectId"]
}
```

## AI Output Contract (Section 41)
The LLM must return this exact JSON structure. Backend validates before acting.
```json
{
  "scenario": "payment_failure|checkout_abandonment|subscription_failure|invoice_overdue",
  "diagnosis": {
    "category": "temporary_failure|payment_method_issue|customer_abandonment|overdue_payment|fraud_risk|unknown",
    "confidence": 0.94
  },
  "recovery": {
    "action": "retry_payment|generate_link|send_reminder|update_method|escalate_human|stop_recovery",
    "priority": 84,
    "expectedRecovery": 4549
  },
  "reasoningSummary": "Temporary UPI timeout with high customer intent."
}
```

## Idempotency Key Format
```
recovery_{caseId}_attempt_{attemptNumber}
```
Example: `recovery_RC_001_attempt_01`

Before executing any action:
1. Check if this key already exists in `recovery_actions`
2. If YES → return cached result, do NOT execute again
3. If NO → execute and store with this key

## API Response Contracts

### GET /api/dashboard/summary
```json
{
  "revenueAtRisk": 842000,
  "revenueRecovered": 217000,
  "recoveryRate": 25.8,
  "activeRecoveries": 37,
  "humanReviews": 9,
  "totalCases": 73
}
```

### GET /api/recoveries
```json
{
  "cases": [
    {
      "caseId": "RC_001",
      "customer": "Rahul",
      "scenario": "payment_failure",
      "amount": 6999,
      "probability": 0.91,
      "priority": 84,
      "recommendedAction": "retry_payment",
      "status": "RECOVERED",
      "recoveredAmount": 6999
    }
  ],
  "total": 73,
  "page": 1,
  "limit": 20
}
```

### POST /api/recovery/run-batch
```json
{
  "batchId": "run_2026_08_31_001",
  "status": "running",
  "casesFound": 73
}
```

### GET /api/recovery/batch/:batchId
```json
{
  "batchId": "run_2026_08_31_001",
  "status": "completed",
  "casesScanned": 73,
  "totalRevenueAtRisk": 842000,
  "verifiedRecoveredAmount": 217000,
  "recoveryRatePercent": 25.8,
  "breakdown": {
    "autoActioned": 37,
    "humanReviewRequired": 9,
    "blockedByPolicy": 4,
    "stoppedByRules": 5,
    "blockedByCompliance": 1
  }
}
```
