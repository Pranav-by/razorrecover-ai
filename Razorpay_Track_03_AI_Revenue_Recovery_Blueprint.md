# Razorpay Buildathon --- Track 03: AI Revenue Recovery

## Project Blueprint for Antigravity

**Working product name:** RazorRecover AI\
**Track:** Track 03 --- AI Revenue Recovery\
**Theme:** Find revenue that is slipping away and win it back.

------------------------------------------------------------------------

# 1. Official Track Brief

## Track 03 --- AI Revenue Recovery

### Goal

> **Find revenue that's slipping away and win it back.**

The challenge asks builders to create an **AI agent that detects revenue
at risk, determines the right intervention, and executes a bounded
recovery workflow**.

The workflow can cover situations such as:

-   Payment failures
-   Checkout abandonment
-   Failed subscriptions
-   Overdue receivables / invoices

The important distinction is that this should not be merely an analytics
dashboard or a chatbot. The system should demonstrate a complete
operational loop:

``` text
Detect
  ↓
Understand
  ↓
Decide
  ↓
Apply guardrails
  ↓
Execute
  ↓
Verify
  ↓
Record outcome
```

------------------------------------------------------------------------

# 2. Official "Why Now"

The track describes revenue loss as something that rarely happens in one
clean step.

A payment can degrade, a checkout can be abandoned, a subscription can
fail, or an invoice can become overdue.

The opportunity is for AI to close the loop:

``` text
Problem detected
      ↓
Problem diagnosed
      ↓
Intervention selected
      ↓
Recovery executed
      ↓
Money recovered
```

This is the central idea behind our product.

------------------------------------------------------------------------

# 3. Official Example Directions

The track gives examples including:

-   Payment degradation → root cause → recovery action
-   Checkout drop-off recovery
-   Failed-subscription recovery
-   B2B receivables chaser
-   Mandate retry sequencer
-   Hinglish voice recovery
-   Promise-to-pay tracker

We should not attempt to build all of these.

For a hackathon MVP, we should build a strong common recovery engine and
support **four core scenarios**:

1.  Payment failure recovery
2.  Checkout abandonment recovery
3.  Failed subscription recovery
4.  Overdue invoice / receivables recovery

The architecture should make the other directions possible later.

------------------------------------------------------------------------

# 4. Official Bar / Evaluation Philosophy

The track expects the system to:

-   Detect real revenue at risk.
-   Determine an appropriate recovery intervention.
-   Execute a bounded workflow.
-   Explain money-related actions.
-   Keep actions constrained by explicit rules.
-   Show the audit trail.
-   Demonstrate at least one failure handled gracefully.

This means our system must prioritize:

``` text
Explainability
+
Safety
+
Reliability
+
Measurable recovery
+
Agentic execution
```

------------------------------------------------------------------------

# 4a. Explicit Mapping --- Official "The Bar" → Implementation

The official track page states the bar in one exact sentence:

> **"Don't just identify the problem. Show measured money recovered
> across a batch, with compliant escalation, stopping rules, and an
> audit trail."**

Every clause of that sentence is a distinct, separately-gradable
requirement. Treat this as a literal judging checklist, not a vibe.

| Bar phrase (verbatim) | What it demands | Where it is implemented |
|---|---|---|
| "Don't just identify the problem" | Detection alone is not enough --- must act | Sections 9--13, 20 (Detection → Strategy → Action Agent) |
| "measured money recovered" | A real ₹ number, before vs. after, not a vague claim | Section 46 (Expected Recovery Value), Section 70 (Batch Measurement) |
| "across a batch" | Aggregate result over a set of transactions run together, not one lucky case | Section 70 (Batch Processing & Measured Recovery Across a Batch) --- **new** |
| "compliant escalation" | Escalation/communication must respect consent, timing, tone, and regulation | Section 68 (Compliant Escalation & Communication Policy) --- **new** |
| "stopping rules" | Explicit, named conditions that halt automatic recovery | Section 69 (Explicit Stopping Rules) --- **new** |
| "an audit trail" | Every decision traceable end-to-end | Section 25 (Audit Trail), Section 55 (Logging) |

Sections 68--72 below were added specifically to close the gaps in
**compliant escalation**, **stopping rules**, and **batch-level
measurement**, since the rest of the document already covers detection,
diagnosis, policy, execution, verification, and audit trail in depth.

------------------------------------------------------------------------

# 5. Our Product

## RazorRecover AI

### One-line description

> **An autonomous AI revenue-recovery agent that detects money at risk,
> diagnoses why it is being lost, chooses a bounded intervention,
> executes the permitted action, verifies the result, and maintains a
> complete audit trail.**

------------------------------------------------------------------------

# 6. The Core Problem

Merchants lose revenue for many reasons.

A merchant might have:

``` text
Payment failure             ₹80,000
Checkout abandonment       ₹45,000
Subscription failures      ₹30,000
Overdue invoices          ₹1,20,000
------------------------------------
Potential revenue at risk  ₹2,75,000
```

A normal dashboard might only say:

``` text
75 payments failed
42 checkouts abandoned
13 subscriptions failed
10 invoices overdue
```

That tells the merchant **what happened**.

Our product should answer:

``` text
How much money is at risk?
Why is it at risk?
Which revenue is most recoverable?
What should we do?
Are we allowed to do it?
Did the action work?
How much money did we recover?
```

------------------------------------------------------------------------

# 7. Product Philosophy

The product is not:

``` text
❌ A chatbot
❌ A static analytics dashboard
❌ A generic LLM wrapper
❌ A model that blindly retries payments
```

The product is:

``` text
✅ An agentic workflow
✅ A revenue-risk detector
✅ A diagnostic engine
✅ A recovery decision engine
✅ A policy/guardrail layer
✅ An action executor
✅ A verification layer
✅ An audit system
```

------------------------------------------------------------------------

# 8. Complete System Flow

``` text
                       MERCHANT DATA
                            │
                            ▼
                  ┌───────────────────┐
                  │ DATA INGESTION    │
                  │                   │
                  │ Payments          │
                  │ Checkout Events   │
                  │ Subscriptions     │
                  │ Invoices          │
                  │ Customer History  │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ REVENUE DETECTOR  │
                  │                   │
                  │ Find money at     │
                  │ risk              │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ DIAGNOSTIC AGENT  │
                  │                   │
                  │ Why is revenue    │
                  │ being lost?       │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ PRIORITY ENGINE   │
                  │                   │
                  │ Which recovery    │
                  │ matters most?     │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ STRATEGY AGENT    │
                  │                   │
                  │ What should we    │
                  │ do?               │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ POLICY ENGINE     │
                  │                   │
                  │ Are we allowed   │
                  │ to do it?         │
                  └─────────┬─────────┘
                            │
                      ┌─────┴─────┐
                      │           │
                   APPROVE       BLOCK
                      │           │
                      ▼           ▼
               ┌────────────┐   HUMAN
               │ ACTION     │   REVIEW
               │ AGENT      │
               └─────┬──────┘
                     │
                     ▼
              RAZORPAY TEST APIs
                     │
                     ▼
              RECOVERY ACTION
                     │
                     ▼
              ┌───────────────┐
              │ VERIFICATION  │
              │ ENGINE        │
              └───────┬───────┘
                      │
                 ┌────┴────┐
                 │         │
              SUCCESS     FAILURE
                 │         │
                 └────┬────┘
                      ▼
                AUDIT TRAIL
                      │
                      ▼
                 DASHBOARD
```

------------------------------------------------------------------------

# 9. Agent Responsibilities

We should use several focused components rather than one giant agent.

## 9.1 Revenue Detection Agent

### Responsibility

Find transactions or events that represent potential lost revenue.

### Inputs

-   Payment status
-   Amount
-   Payment method
-   Failure reason
-   Checkout state
-   Subscription status
-   Invoice status
-   Customer history
-   Number of attempts
-   Timestamps

### Output

``` json
{
  "revenue_at_risk": 4999,
  "scenario": "payment_failure",
  "recoverability": "high",
  "recovery_probability": 0.91,
  "priority": 84
}
```

------------------------------------------------------------------------

# 10. Diagnostic Agent

## Responsibility

Determine why revenue is at risk.

### Example

Input:

``` text
Amount: ₹4,999
Method: UPI
Status: FAILED
Reason: TIMEOUT
Previous attempts: 1
Customer history: 5 successful purchases
```

Output:

``` text
Diagnosis:
Temporary UPI payment failure

Confidence:
94%

Category:
Recoverable

Suggested intervention:
Retry payment
```

------------------------------------------------------------------------

# 11. Priority Engine

Not every revenue opportunity has equal value.

Example:

``` text
Customer A
Amount: ₹500
Recovery probability: 50%

Customer B
Amount: ₹50,000
Recovery probability: 80%

Customer C
Amount: ₹5,000
Recovery probability: 95%
```

A simple expected-recovery calculation can be:

``` text
Expected Recovery =
Amount × Recovery Probability
```

Therefore:

``` text
Customer A
₹500 × 0.50 = ₹250

Customer B
₹50,000 × 0.80 = ₹40,000

Customer C
₹5,000 × 0.95 = ₹4,750
```

Priority should consider:

``` text
Expected recovery value
+
Customer intent
+
Urgency
+
Number of previous attempts
+
Customer value
+
Action cost
+
Risk
```

------------------------------------------------------------------------

# 12. Recovery Strategy Agent

The strategy agent decides the appropriate intervention.

Possible actions:

``` text
Retry payment
Generate payment link
Send reminder
Request payment-method update
Retry subscription
Escalate to human
Stop recovery
```

The action should depend on the diagnosis.

------------------------------------------------------------------------

# 13. Scenario 1 --- Payment Failure Recovery

## Example

Customer:

``` text
Rahul
```

Transaction:

``` text
Amount: ₹6,999
Payment method: UPI
Status: FAILED
Failure reason: TIMEOUT
Attempts: 1
```

### Flow

``` text
Payment failed
      ↓
Revenue detector
      ↓
₹6,999 revenue at risk
      ↓
Diagnostic agent
      ↓
Temporary UPI timeout
      ↓
Recovery probability = 91%
      ↓
Strategy agent
      ↓
Retry payment
      ↓
Policy engine
      ↓
Retry permitted
      ↓
Action agent
      ↓
Razorpay test API
      ↓
Payment succeeds
      ↓
Verification
      ↓
₹6,999 recovered
```

------------------------------------------------------------------------

# 14. Payment Failure Safety

The system must never blindly retry.

Before retrying:

``` text
✓ Payment actually failed
✓ Customer has not already paid
✓ Retry count is below limit
✓ Failure type permits retry
✓ Amount is within automatic-action limit
✓ Idempotency key is present
✓ Transaction is not already under another recovery
```

Only then:

``` text
ALLOW
```

Otherwise:

``` text
BLOCK
```

------------------------------------------------------------------------

# 15. Scenario 2 --- Checkout Abandonment

## Example

Customer:

``` text
₹12,999 product
```

Events:

``` text
Product viewed
      ↓
Product added to cart
      ↓
Checkout started
      ↓
UPI selected
      ↓
Payment page opened
      ↓
Customer left
```

There was no failed payment.

Instead, the system identifies:

``` text
Scenario:
Checkout abandonment

Customer intent:
HIGH

Revenue at risk:
₹12,999
```

### Strategy

The agent may choose:

``` text
Generate payment/recovery link
+
Send personalized reminder
```

### Flow

``` text
Checkout abandoned
      ↓
Detect high intent
      ↓
₹12,999 at risk
      ↓
Diagnose abandonment
      ↓
Select recovery intervention
      ↓
Policy check
      ↓
Approved
      ↓
Generate recovery link
      ↓
Send reminder
      ↓
Customer completes payment
      ↓
Verify
      ↓
₹12,999 recovered
```

------------------------------------------------------------------------

# 16. Scenario 3 --- Failed Subscription

## Example

Customer:

``` text
Subscription:
₹999/month

Customer lifetime:
18 months

Current payment:
FAILED

Reason:
Expired card
```

The system should recognize:

``` text
Long-term customer
+
Recurring revenue
+
Payment method problem
```

### Strategy

Instead of repeatedly retrying:

``` text
Ask customer to update payment method
```

### Flow

``` text
Subscription payment failed
      ↓
Detect recurring revenue risk
      ↓
Diagnose expired card
      ↓
Customer value = high
      ↓
Strategy:
Payment-method update
      ↓
Policy check
      ↓
Approved
      ↓
Send update/payment link
      ↓
Customer updates method
      ↓
Payment succeeds
      ↓
Subscription retained
```

------------------------------------------------------------------------

# 17. Scenario 4 --- Overdue B2B Invoice

## Example

Invoice:

``` text
Amount: ₹2,50,000
Due date: August 25
Current date: August 31
```

Customer history:

``` text
Long-term customer
10 previous invoices
9 paid on time
1 paid 4 days late
```

AI should not immediately escalate aggressively.

It can infer:

``` text
Customer historically pays.

Likely late payment rather than intentional non-payment.
```

### Strategy

``` text
Send polite reminder
+
Include payment link
+
Ask expected payment date
```

Customer replies:

``` text
Expected payment:
September 2
```

The system records:

``` text
Promise to pay:
₹2,50,000
Expected date:
September 2
```

Then the system can follow up.

------------------------------------------------------------------------

# 18. Policy / Guardrail Engine

This is one of the most important architectural components.

The LLM should never directly control financial actions.

Instead:

``` text
AI recommendation
      ↓
Policy engine
      ↓
Permission decision
      ↓
Action
```

Example:

``` json
{
  "action": "retry_payment",
  "amount": 4999,
  "attempt_count": 1,
  "reason": "upi_timeout"
}
```

Policy:

``` text
IF:
  payment_failed = true
  AND customer_not_already_paid = true
  AND attempt_count < MAX_RETRIES
  AND reason IN allowed_retry_reasons
  AND amount <= AUTO_ACTION_LIMIT

THEN:
  ALLOW

ELSE:
  BLOCK
```

------------------------------------------------------------------------

# 19. Example --- Policy Blocks the AI

Transaction:

``` text
Amount: ₹50,000
Previous attempts: 3
Maximum automatic attempts: 2
```

AI recommends:

``` text
Retry payment
```

Policy engine:

``` text
❌ Retry limit exceeded
```

Result:

``` text
ACTION BLOCKED

Human review required.
```

This is a feature.

It demonstrates controlled autonomy.

------------------------------------------------------------------------

# 20. Action Agent

The Action Agent executes an approved action.

Examples:

``` text
Retry payment
Generate payment link
Send reminder
Update recovery state
Escalate to human
```

The Action Agent should never decide whether an action is permitted.

That decision belongs to the Policy Engine.

------------------------------------------------------------------------

# 21. Razorpay Integration

Use Razorpay's **test environment / test-mode APIs** wherever the
hackathon flow permits.

The application architecture should keep Razorpay integration behind a
service layer:

``` text
Frontend
   ↓
Backend API
   ↓
Recovery Orchestrator
   ↓
Policy Engine
   ↓
Razorpay Service
   ↓
Razorpay APIs
```

Do not place secret keys in frontend code.

Use environment variables:

``` env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Never commit secrets to Git.

------------------------------------------------------------------------

# 22. Verification Engine

Execution does not automatically equal recovery.

The system must verify the result.

Example:

``` text
Action:
Retry payment
```

After execution:

``` text
Check transaction
      ↓
Payment status
      ↓
Success?
```

If yes:

``` text
RECOVERED
```

If no:

``` text
NOT RECOVERED
```

Then the orchestrator decides what happens next based on policy.

------------------------------------------------------------------------

# 23. Complete Transaction Example

## Initial event

``` text
Customer:
Rahul

Amount:
₹6,999

Payment:
UPI

Status:
FAILED

Reason:
TIMEOUT
```

## Detection

``` text
Revenue at risk:
₹6,999
```

## Diagnosis

``` text
Temporary UPI timeout

Confidence:
94%

Recoverability:
HIGH
```

## Strategy

``` text
Recommended action:
Retry payment
```

## Policy

``` text
Previous retries:
0

Maximum:
2

Customer already paid:
No

Action:
Allowed
```

## Execution

``` text
Retry #1
```

## Verification

``` text
Payment:
SUCCESS
```

## Final result

``` text
Revenue recovered:
₹6,999

Time to recovery:
7 seconds

Attempts:
1
```

------------------------------------------------------------------------

# 24. Failure Example

Transaction:

``` text
Amount:
₹50,000

Failure:
Payment failed

Previous retries:
2
```

AI:

``` text
Recommend retry
```

Policy:

``` text
Maximum retries reached
```

Result:

``` text
❌ Action blocked

Reason:
Retry limit exceeded.

Next action:
Human review
```

This should be shown in the demo.

------------------------------------------------------------------------

# 25. Audit Trail

Every financial action should have an audit record.

Example:

``` text
TRANSACTION #pay_82931

₹4,999 Revenue at Risk

────────────────────────────────

09:10:01
Payment failed

Reason:
UPI_TIMEOUT

────────────────────────────────

09:10:02
Revenue detected

Risk:
₹4,999

Recovery probability:
91%

────────────────────────────────

09:10:03
AI diagnosis

Temporary UPI failure

Confidence:
94%

────────────────────────────────

09:10:04
AI recommendation

Retry payment

────────────────────────────────

09:10:04
Policy validation

✓ Payment failed
✓ Customer hasn't already paid
✓ Retry limit valid
✓ Amount within limit
✓ Action permitted

────────────────────────────────

09:10:05
Action executed

Retry #1

────────────────────────────────

09:10:08
Payment successful

────────────────────────────────

09:10:09
Recovery verified

────────────────────────────────

RESULT

₹4,999 RECOVERED
```

------------------------------------------------------------------------

# 26. Dashboard

The dashboard should immediately communicate business value.

## Top metrics

``` text
Revenue at Risk
₹8.42L

Revenue Recovered
₹2.17L

Recovery Rate
68.4%

Active Recoveries
37

Human Reviews
9
```

------------------------------------------------------------------------

# 27. Revenue-at-Risk Breakdown

Show:

``` text
Payment failures          ₹80,000
Checkout abandonment      ₹45,000
Subscriptions             ₹30,000
Overdue invoices         ₹1,20,000
```

And:

``` text
Total:
₹2,75,000
```

------------------------------------------------------------------------

# 28. Recovery Pipeline

A useful dashboard section:

``` text
Detected
   73

Recoverable
   51

Automatically actionable
   37

Human approval
   9

Unrecoverable
   5
```

This gives judges an instant understanding of the system.

------------------------------------------------------------------------

# 29. Live Agent Activity

The dashboard should show agent activity.

Example:

``` text
● Revenue Detector
Scanning transactions...

✓ Found ₹6,999 revenue at risk

● Diagnostic Agent
Analyzing payment failure...

✓ UPI timeout detected

● Strategy Agent
Selecting intervention...

✓ Retry selected

● Policy Engine
Validating action...

✓ Approved

● Action Agent
Executing retry...

✓ Completed

● Verification Agent
Checking payment...

✓ Payment recovered
```

This creates a strong demo experience.

------------------------------------------------------------------------

# 30. Transaction Detail Page

Clicking a transaction should open:

``` text
Transaction ID
Customer
Amount
Scenario
Status
Failure reason
Recovery probability
Priority
Recommended action
Policy decision
Action history
Final result
Audit trail
```

Example:

``` text
Transaction:
pay_82931

Customer:
Rahul

Amount:
₹6,999

Scenario:
Payment Failure

Status:
Recovered

Recovery probability:
91%

Action:
Retry Payment

Policy:
Approved

Result:
Successful

Recovered:
₹6,999
```

------------------------------------------------------------------------

# 31. AI Decision Panel

For every recovery opportunity, show:

``` text
WHY IS THIS AT RISK?

UPI payment timed out.

WHY IS IT RECOVERABLE?

Customer has successfully paid
five times previously.

WHAT SHOULD WE DO?

Retry once after a short delay.

WHY?

Temporary timeout + high intent +
only one previous attempt.

CONFIDENCE

94%
```

This makes the AI explainable.

------------------------------------------------------------------------

# 32. Human Approval Queue

Not every action should be automatic.

Create a queue:

``` text
HUMAN REVIEW REQUIRED

1. ₹50,000 payment
   Reason: retry limit exceeded

2. ₹1,20,000 invoice
   Reason: high-value receivable

3. ₹75,000 recovery
   Reason: confidence below threshold
```

Each item can show:

``` text
Approve
Reject
View details
```

For the hackathon, these can be controlled UI actions backed by the
backend.

------------------------------------------------------------------------

# 33. Recovery Rules

Create explicit configurable rules.

Example:

``` text
MAX_PAYMENT_RETRIES = 2

AUTO_ACTION_LIMIT = ₹10,000

MIN_RECOVERY_CONFIDENCE = 0.75

HIGH_VALUE_THRESHOLD = ₹50,000

HUMAN_REVIEW_THRESHOLD = ₹50,000
```

The exact values should be clearly labeled as **demo/business-policy
configuration**, not universal financial rules.

------------------------------------------------------------------------

# 34. Idempotency

This is important for payment systems.

Imagine the agent sends:

``` text
Retry payment
```

Then the server times out.

The agent does not know whether the request succeeded.

It must not blindly send another retry.

Use an idempotency/recovery operation identifier such as:

``` text
recovery_pay_82931_attempt_01
```

Before executing:

``` text
Has this recovery operation already executed?

YES → Do not execute again.

NO → Execute.
```

This protects against duplicate actions.

------------------------------------------------------------------------

# 35. State Machine

Every recovery case should have an explicit state.

``` text
DETECTED
   ↓
DIAGNOSING
   ↓
STRATEGY_SELECTED
   ↓
POLICY_CHECK
   ↓
   ├── BLOCKED → HUMAN_REVIEW
   │
   └── APPROVED
          ↓
       EXECUTING
          ↓
       VERIFYING
          ↓
      ┌───┴────┐
      ↓        ↓
  RECOVERED   FAILED
                 ↓
          RETRY_ALLOWED?
             ↓       ↓
            YES      NO
             ↓       ↓
          RETRY   HUMAN_REVIEW
```

This makes the system much easier to reason about and debug.

------------------------------------------------------------------------

# 36. Suggested Database Collections

Use MongoDB or another suitable database.

## `transactions`

``` json
{
  "_id": "...",
  "paymentId": "pay_82931",
  "customerId": "CUS_102",
  "merchantId": "MERCHANT_001",
  "amount": 4999,
  "currency": "INR",
  "method": "upi",
  "status": "failed",
  "failureReason": "upi_timeout",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## `recovery_cases`

``` json
{
  "_id": "...",
  "transactionId": "...",
  "scenario": "payment_failure",
  "amountAtRisk": 4999,
  "recoveryProbability": 0.91,
  "priorityScore": 84,
  "diagnosis": "...",
  "recommendedAction": "retry_payment",
  "status": "recovered"
}
```

## `recovery_actions`

``` json
{
  "_id": "...",
  "recoveryCaseId": "...",
  "action": "retry_payment",
  "attempt": 1,
  "policyDecision": "approved",
  "idempotencyKey": "...",
  "executedAt": "...",
  "result": "success"
}
```

## `audit_logs`

``` json
{
  "_id": "...",
  "recoveryCaseId": "...",
  "event": "policy_check",
  "message": "Retry approved",
  "metadata": {},
  "timestamp": "..."
}
```

## `customers`

``` json
{
  "_id": "...",
  "customerId": "CUS_102",
  "name": "Rahul",
  "successfulPayments": 5,
  "totalSpend": 45000,
  "lastPaymentAt": "...",
  "riskLevel": "low"
}
```

------------------------------------------------------------------------

# 37. Recommended Backend Architecture

A clean architecture could be:

``` text
backend/
│
├── src/
│   ├── controllers/
│   │   ├── transaction.controller.js
│   │   ├── recovery.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── services/
│   │   ├── razorpay.service.js
│   │   ├── revenue-detector.service.js
│   │   ├── diagnosis.service.js
│   │   ├── strategy.service.js
│   │   ├── policy.service.js
│   │   ├── action.service.js
│   │   └── verification.service.js
│   │
│   ├── models/
│   │   ├── Transaction.js
│   │   ├── RecoveryCase.js
│   │   ├── RecoveryAction.js
│   │   ├── AuditLog.js
│   │   └── Customer.js
│   │
│   ├── routes/
│   │   ├── transaction.routes.js
│   │   ├── recovery.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── agents/
│   │   ├── detector.agent.js
│   │   ├── diagnostician.agent.js
│   │   └── strategist.agent.js
│   │
│   ├── policies/
│   │   └── recovery.policy.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── idempotency.js
│   │
│   └── server.js
│
└── .env
```

------------------------------------------------------------------------

# 38. Recommended Frontend Architecture

``` text
frontend/
│
├── src/
│   ├── pages/
│   │   ├── Dashboard
│   │   ├── Recoveries
│   │   ├── TransactionDetails
│   │   ├── ReviewQueue
│   │   └── Settings
│   │
│   ├── components/
│   │   ├── MetricCard
│   │   ├── RevenueChart
│   │   ├── RecoveryTable
│   │   ├── AgentActivity
│   │   ├── AuditTimeline
│   │   ├── PolicyDecision
│   │   └── ApprovalCard
│   │
│   ├── services/
│   │   └── api.js
│   │
│   └── App.jsx
```

------------------------------------------------------------------------

# 39. API Design

Possible backend endpoints:

``` text
GET /api/dashboard/summary

GET /api/recoveries

GET /api/recoveries/:id

POST /api/recoveries/:id/analyze

POST /api/recoveries/:id/execute

POST /api/recoveries/:id/approve

POST /api/recoveries/:id/reject

GET /api/recoveries/:id/audit

GET /api/review-queue

POST /api/demo/seed
```

------------------------------------------------------------------------

# 40. Important Principle: Separate AI From Actions

Bad architecture:

``` text
LLM
 ↓
Direct Razorpay API
```

Better architecture:

``` text
LLM
 ↓
Structured recommendation
 ↓
Validation
 ↓
Policy Engine
 ↓
Action Service
 ↓
Razorpay
```

The LLM should return structured data such as:

``` json
{
  "diagnosis": "temporary_payment_failure",
  "confidence": 0.94,
  "recommendedAction": "retry_payment",
  "reason": "Temporary UPI timeout and high customer intent"
}
```

Then deterministic backend code decides whether that action is allowed.

------------------------------------------------------------------------

# 41. AI Output Contract

Never rely on free-form text for downstream actions.

Use a schema similar to:

``` json
{
  "scenario": "payment_failure",
  "diagnosis": {
    "category": "temporary_failure",
    "confidence": 0.94
  },
  "recovery": {
    "action": "retry_payment",
    "priority": 84,
    "expectedRecovery": 4549
  },
  "reasoningSummary": "Temporary UPI timeout with high customer intent."
}
```

The backend validates this object before doing anything.

------------------------------------------------------------------------

# 42. Synthetic Data Strategy

For the hackathon, create a realistic synthetic merchant dataset.

Target:

``` text
500+ transactions
```

Include:

``` text
Successful payments
Failed payments
UPI failures
Card failures
Checkout abandonment
Subscription failures
Overdue invoices
Repeat customers
New customers
High-value customers
Low-value customers
```

Example distribution:

``` text
500 total records

300 successful payments
70 payment failures
50 checkout abandonments
35 subscription failures
25 overdue invoices
20 other / edge cases
```

The numbers are examples and can be adjusted.

------------------------------------------------------------------------

# 43. Synthetic Failure Types

Include multiple reasons:

``` text
upi_timeout
bank_decline
insufficient_funds
expired_card
network_error
authentication_failure
customer_abandonment
subscription_payment_failed
invoice_overdue
```

Each should have realistic metadata.

------------------------------------------------------------------------

# 44. Recovery Probability

For a hackathon MVP, recovery probability can be a hybrid:

``` text
Rule-based signals
+
ML model if useful
+
LLM explanation
```

Do not make the LLM invent a probability without evidence.

For example:

``` text
recovery_probability =
weighted historical success rate
+
customer behavior
+
failure category
+
attempt count
```

Then the AI can explain the calculated result.

------------------------------------------------------------------------

# 45. Metrics

The system should measure more than the number of actions.

## Revenue recovered

``` text
Total successful recovered amount
```

## Recovery rate

``` text
Recovered revenue
----------------- × 100
Recoverable revenue
```

## Action success rate

``` text
Successful actions
------------------ × 100
Executed actions
```

## False action rate

Track cases where the system attempted an unsuitable action.

## Human escalation rate

``` text
Human-review cases
------------------ × 100
Total cases
```

## Average recovery time

``` text
Recovery timestamp
-
Detection timestamp
```

------------------------------------------------------------------------

# 46. Expected Recovery Value

A useful decision metric:

``` text
Expected Recovery =
Revenue at Risk × Recovery Probability
```

Example:

``` text
Revenue at risk:
₹10,000

Recovery probability:
0.80

Expected recovery:
₹8,000
```

This can help rank opportunities.

------------------------------------------------------------------------

# 47. Demo Dataset Example

Create records like:

``` text
CASE #001

Scenario:
Payment Failure

Amount:
₹6,999

Reason:
UPI timeout

Recovery probability:
91%

Recommended:
Retry

Result:
Recovered
```

``` text
CASE #002

Scenario:
Checkout Abandonment

Amount:
₹12,999

Intent:
High

Recommended:
Payment link

Result:
Recovered
```

``` text
CASE #003

Scenario:
Subscription Failure

Amount:
₹999

Reason:
Expired card

Recommended:
Update payment method

Result:
Recovered
```

``` text
CASE #004

Scenario:
Invoice Overdue

Amount:
₹2,50,000

Customer history:
Usually pays

Recommended:
Reminder + payment link

Result:
Promise to pay
```

``` text
CASE #005

Scenario:
Payment Failure

Amount:
₹50,000

Previous attempts:
3

Recommended:
Retry

Policy:
BLOCKED

Result:
Human review
```

------------------------------------------------------------------------

# 48. Demo Mode

The application should have a controlled **Demo Mode**.

A button:

``` text
▶ Run Revenue Recovery
```

When clicked:

``` text
Scanning 500 transactions...
```

Then progressively show:

``` text
73 revenue leaks detected

51 recoverable

37 automatically actionable

9 require human review

5 marked unrecoverable
```

Then process a handful of representative cases.

------------------------------------------------------------------------

# 49. Demo Timeline

## 0--15 seconds

Show dashboard:

``` text
₹8.42L Revenue at Risk
₹0 Recovered
```

Click:

``` text
RUN RECOVERY
```

## 15--30 seconds

Show detector:

``` text
Scanning...
73 opportunities found
```

## 30--45 seconds

Show AI diagnosis:

``` text
UPI timeout
Checkout abandonment
Expired card
Overdue invoice
```

## 45--60 seconds

Show strategy:

``` text
Retry
Payment link
Method update
Reminder
```

## 60--75 seconds

Show guardrails:

``` text
37 approved
9 sent for human review
```

## 75--90 seconds

Show recovery:

``` text
₹2.17L recovered
```

## 90--120 seconds

Open a recovered transaction and show its complete audit trail.

Then show one blocked action:

``` text
AI recommended retry
Policy blocked it
Reason: retry limit exceeded
```

------------------------------------------------------------------------

# 50. What Judges Should Understand in the First Minute

The first minute should communicate:

``` text
PROBLEM
Merchants lose money after the customer has already shown purchase intent.

SOLUTION
Our AI finds that revenue, diagnoses the cause, and executes recovery.

SAFETY
AI cannot directly move money.
Every action passes through deterministic policy checks.

RESULT
We measure actual revenue recovered.

PROOF
Every decision has an audit trail.
```

------------------------------------------------------------------------

# 51. The Most Important Demo Story

Use one customer journey.

``` text
Customer wants product
        ↓
Checkout
        ↓
Payment fails
        ↓
Revenue becomes at risk
        ↓
AI detects
        ↓
AI diagnoses
        ↓
AI selects retry
        ↓
Policy approves
        ↓
Razorpay action
        ↓
Payment succeeds
        ↓
₹6,999 recovered
```

Then contrast it with:

``` text
₹50,000 payment
       ↓
AI wants retry
       ↓
Policy detects retry limit
       ↓
BLOCK
       ↓
Human review
```

This demonstrates both **autonomy and restraint**.

------------------------------------------------------------------------

# 52. Edge Cases

The implementation should handle:

## Customer already paid

``` text
Failed payment
+
successful second payment
=
Do not retry
```

## Retry limit reached

``` text
No more automatic retries.
```

## Duplicate action

``` text
Existing idempotency key
=
Do not execute twice.
```

## Low AI confidence

``` text
Confidence < threshold
=
Human review.
```

## High-value transaction

``` text
Amount > automatic limit
=
Human approval.
```

## API timeout

``` text
Unknown execution state
=
Verify before retrying.
```

## Customer opted out

``` text
Do not send recovery communication.
```

## Already recovered

``` text
Case status = RECOVERED
=
No further action.
```

------------------------------------------------------------------------

# 53. Failure Handling

The system must gracefully handle failure.

Example:

``` text
Action Agent
    ↓
Razorpay request
    ↓
Network timeout
```

Do not immediately retry.

Instead:

``` text
UNKNOWN STATE
    ↓
Verification
    ↓
Check actual transaction status
    ↓
SUCCESS?
```

If successful:

``` text
Mark recovered.
```

If not:

``` text
Evaluate retry policy.
```

This prevents duplicate financial actions.

------------------------------------------------------------------------

# 54. Security Requirements

Never expose:

``` text
RAZORPAY_KEY_SECRET
LLM_API_KEY
DATABASE_PASSWORD
```

in frontend code.

Use:

``` text
.env
```

and server-side environment variables.

Never commit `.env`.

Use:

``` text
.env.example
```

with empty placeholders.

------------------------------------------------------------------------

# 55. Logging

Every important operation should be logged.

Example:

``` text
[09:10:01] Payment failure detected
[09:10:02] Revenue risk calculated
[09:10:03] Diagnosis generated
[09:10:04] Recovery strategy selected
[09:10:04] Policy approved
[09:10:05] Action started
[09:10:08] Payment succeeded
[09:10:09] Recovery verified
```

The UI can consume these events for the live agent activity panel.

------------------------------------------------------------------------

# 56. Recommended Technology Stack

## Frontend

Choose a stack the team can implement quickly.

Recommended:

``` text
React
+
Vite / Next.js
+
Tailwind CSS
+
Recharts or equivalent
```

## Backend

``` text
Node.js
+
Express / Fastify
```

## Database

``` text
MongoDB
```

## AI

Use an LLM for:

``` text
Diagnosis
Reasoning summaries
Strategy selection
Natural-language explanations
```

Use deterministic backend code for:

``` text
Policy
Limits
Idempotency
Financial calculations
Final action permission
```

## Payments

``` text
Razorpay Test Mode / APIs
```

------------------------------------------------------------------------

# 57. AI Architecture Principle

Use AI where ambiguity exists.

Use code where certainty is required.

### AI

``` text
"What caused this?"
"What intervention is most appropriate?"
"Why does this customer look recoverable?"
```

### Deterministic code

``` text
"Is retry count < 2?"
"Is amount below automatic limit?"
"Has the customer already paid?"
"Has this action already executed?"
```

This separation is extremely important.

------------------------------------------------------------------------

# 58. Suggested UI Pages

## Page 1 --- Dashboard

``` text
Revenue at Risk
Revenue Recovered
Recovery Rate
Active Recoveries
Human Reviews

Revenue leakage breakdown

Live agent activity

Recent recoveries
```

## Page 2 --- Revenue Opportunities

Table:

``` text
Customer
Scenario
Amount
Probability
Priority
Recommended Action
Status
```

## Page 3 --- Recovery Detail

``` text
Problem
AI diagnosis
Strategy
Policy
Execution
Verification
Audit trail
```

## Page 4 --- Human Review

``` text
Case
Amount
Reason
AI recommendation
Risk
Approve
Reject
```

## Page 5 --- Policies

``` text
Maximum retries
Auto-action threshold
Confidence threshold
High-value threshold
```

------------------------------------------------------------------------

# 59. Dashboard Visual Hierarchy

The most important number should be:

``` text
REVENUE RECOVERED
```

Then:

``` text
REVENUE AT RISK
```

Then:

``` text
RECOVERY RATE
```

Then operational metrics.

Do not make the UI look like a generic AI dashboard.

It should feel like a **financial operations command center**.

------------------------------------------------------------------------

# 60. What NOT to Build

Do not spend most of the hackathon on:

``` text
❌ Fancy chatbot
❌ Generic AI assistant
❌ Complex 3D UI
❌ Huge number of agents
❌ Dozens of recovery scenarios
❌ Real production payments
❌ Unnecessary microservices
```

Focus on:

``` text
✓ Working recovery pipeline
✓ Good synthetic data
✓ Strong agent reasoning
✓ Strict guardrails
✓ Razorpay integration
✓ Verification
✓ Audit trail
✓ Excellent demo
```

------------------------------------------------------------------------

# 61. MVP Definition

The minimum working product should be:

``` text
1. Load transaction dataset
2. Detect revenue-at-risk cases
3. Diagnose the cases
4. Calculate recovery probability
5. Select recovery action
6. Run policy checks
7. Execute safe action
8. Verify result
9. Record audit trail
10. Display recovered revenue
```

------------------------------------------------------------------------

# 62. Version 1 vs Future Features

## V1 --- Hackathon MVP

``` text
Payment failures
Checkout abandonment
Subscription failures
Overdue invoices

AI diagnosis
AI strategy
Policy engine
Razorpay test integration
Verification
Dashboard
Audit trail
Human review
Synthetic data
```

## Future

``` text
Hinglish voice recovery
WhatsApp recovery
Adaptive campaign orchestration
Mandate retry sequencing
Advanced ML recovery prediction
Merchant-specific policies
Multi-agent optimization
A/B testing recovery interventions
Automatic policy learning
```

Do not let future features distract from V1.

------------------------------------------------------------------------

# 63. Final Product Flow

The entire product can be summarized as:

``` text
                         ┌─────────────┐
                         │   MERCHANT  │
                         └──────┬──────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │ PAYMENT / EVENT  │
                      │ DATA             │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ REVENUE DETECTOR │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ DIAGNOSTIC AGENT │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ PRIORITY ENGINE  │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ STRATEGY AGENT   │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │ POLICY ENGINE    │
                      └────────┬─────────┘
                               │
                         ┌─────┴─────┐
                         │           │
                      APPROVE       BLOCK
                         │           │
                         ▼           ▼
                 ┌────────────┐   HUMAN
                 │ ACTION     │   REVIEW
                 │ AGENT      │
                 └─────┬──────┘
                       │
                       ▼
                ┌──────────────┐
                │ RAZORPAY     │
                │ TEST API     │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ VERIFICATION │
                └──────┬───────┘
                       │
                  ┌────┴────┐
                  │         │
               SUCCESS     FAIL
                  │         │
                  ▼         ▼
             RECOVERED   RE-EVALUATE
                  │
                  ▼
             AUDIT TRAIL
                  │
                  ▼
              DASHBOARD
```

------------------------------------------------------------------------

# 64. The Core Hackathon Pitch

Use this as the foundation of the presentation:

> **"Merchants don't just lose revenue when a payment fails. They lose
> it when a customer abandons checkout, a subscription silently fails,
> or an invoice goes overdue. RazorRecover AI finds that revenue at
> risk, understands why it is slipping away, chooses the right recovery
> intervention, executes it through a bounded action layer, verifies the
> result, and records exactly what happened."**

Then demonstrate:

``` text
₹8.42L
Revenue at Risk

        ↓

AI finds
73 opportunities

        ↓

51 are recoverable

        ↓

37 can act automatically

        ↓

9 require human approval

        ↓

₹2.17L recovered
```

------------------------------------------------------------------------

# 65. Antigravity Implementation Instructions

When generating the application, Antigravity should follow these
principles:

1.  Build a **real working application**, not a static mockup.
2.  Keep the frontend and backend clearly separated.
3.  Use MongoDB for persistent recovery state and audit data.
4.  Use synthetic data that resembles realistic payment/revenue events.
5.  Implement the four MVP scenarios.
6.  Keep AI recommendations structured.
7.  Never allow the LLM to directly execute financial actions.
8.  Implement a deterministic policy engine.
9.  Implement idempotency for action execution.
10. Implement verification after actions.
11. Store every important event in an audit trail.
12. Include a human-review queue.
13. Include a demo mode that can process seeded cases.
14. Make the dashboard communicate recovered revenue immediately.
15. Make one successful and one blocked recovery case easy to
    demonstrate.
16. Keep all secrets server-side.
17. Use environment variables for API keys.
18. Make failure states visible and graceful.
19. Do not claim simulated actions are real financial transactions.
20. Clearly label test/synthetic data in the UI.

------------------------------------------------------------------------

# 66. Definition of "Done"

The project is ready for the hackathon demo when we can perform this
sequence live:

``` text
Open dashboard
      ↓
Show revenue at risk
      ↓
Click Run Recovery
      ↓
System scans seeded transactions
      ↓
Revenue opportunities appear
      ↓
AI diagnoses a case
      ↓
AI recommends an intervention
      ↓
Policy engine evaluates it
      ↓
Action executes in test/simulation environment
      ↓
Verification checks outcome
      ↓
Dashboard updates recovered revenue
      ↓
Open audit trail
      ↓
Show exact decision history
      ↓
Open a blocked case
      ↓
Show policy preventing unsafe action
```

If all of this works reliably, we have a strong Track 03 MVP.

------------------------------------------------------------------------

# 67. Final Architecture Principle

The single most important rule for the entire project:

``` text
                AI
                 │
                 │ recommends
                 ▼
        ┌─────────────────┐
        │ POLICY ENGINE   │
        │                 │
        │ deterministic   │
        │ safety checks   │
        └────────┬────────┘
                 │
          approved action
                 │
                 ▼
        ┌─────────────────┐
        │ ACTION SERVICE  │
        └────────┬────────┘
                 │
                 ▼
              RAZORPAY
                 │
                 ▼
            VERIFICATION
```

**AI decides what might be best.\
Code decides what is allowed.\
The action layer executes it.\
Verification decides whether recovery actually happened.**

That separation should be maintained throughout the implementation.

------------------------------------------------------------------------

# 68. Compliant Escalation & Communication Policy

The track explicitly requires **"compliant escalation."** This is a
distinct, separately-scored requirement from the Policy Engine's
financial guardrails (Section 18). Financial guardrails answer *"are we
allowed to move money?"* Compliant escalation answers *"are we allowed
to contact this human, right now, in this way?"* Both must exist as
separate checks. Do not conflate them.

## 68.1 Why this matters for a Razorpay/fintech track

Recovery communication in India sits next to real regulatory context:
RBI's Fair Practices Code for outstanding-dues communication, TRAI's
DND/consent framework for commercial SMS and calls, and basic
data-privacy hygiene. The judges do not expect real regulatory
integration in a hackathon, but they *do* expect the architecture to
show it has been thought about --- i.e., the guardrail exists as a
first-class, named, testable component, not folklore mentioned once in
passing.

## 68.2 Communication Guardrail Checklist (deterministic, code-enforced)

Every outbound recovery communication (SMS / email / notification /
voice-script trigger) must pass **all** of the following before send,
independent of the financial Policy Engine:

``` text
✓ Customer has not opted out (DO_NOT_CONTACT flag = false)
✓ Current local time is within allowed window (e.g. 09:00–19:00 IST)
✓ Frequency cap for this case not exceeded (e.g. max 1 msg / 24h,
  max 3 total per case)
✓ Channel is one the customer has consented to / previously used
✓ Message uses an approved template (no ad-hoc LLM-generated
  collections language)
✓ Tone classifier / template review shows no threatening,
  shaming, or high-pressure language
✓ Case is not already flagged DISPUTED or LEGAL_HOLD
```

If any check fails → **BLOCK**, log the reason, and (for automation
paths) fall through to the human-review queue instead of silently
dropping the case.

## 68.3 Escalation Ladder (bounded, never open-ended)

Escalation must be a fixed, small ladder — not an agent improvising
indefinitely:

``` text
Step 1 — Gentle reminder (automated, Day 0)
Step 2 — Reminder + payment link (automated, Day 2, only if unpaid)
Step 3 — Firmer reminder, still polite, offers assistance
          (automated, Day 5, only if unpaid)
Step 4 — Human relationship-manager review
          (mandatory hand-off, not automatable)
Step 5 — (B2B invoices only) Flag for manual collections/legal
          review — the AGENT NEVER INITIATES THIS STEP ITSELF
```

Rules:
- The agent can only ever *propose* moving one step at a time.
- No step may be skipped automatically (e.g. cannot jump straight
  to Step 4 without Steps 1–3 having occurred or been explicitly
  waived by a human).
- Step 5 requires a human click. This is a hard rule, not a
  suggestion — the system must be architecturally incapable of an
  automated legal/collections action.

## 68.4 Approved Template Library (example)

``` text
TEMPLATE: payment_reminder_gentle
"Hi {name}, your payment of {amount} for {order} didn't go
through. No action needed if this was intentional — otherwise,
here's a quick link to retry: {link}"

TEMPLATE: subscription_card_expired
"Hi {name}, we couldn't renew your {plan} subscription because
your card on file has expired. Update it here: {link}. Your
access continues uninterrupted for the next {grace_days} days."

TEMPLATE: invoice_reminder_b2b
"Hi {contact_name}, a friendly note that invoice {invoice_id}
for {amount} was due on {due_date}. Could you confirm an
expected payment date? {link}"
```

Every message actually sent must be logged verbatim in the audit
trail (Section 25), tied to the template ID and the guardrail check
result, so a judge can open any case and see *exactly* what was said,
when, and why it was allowed.

------------------------------------------------------------------------

# 69. Explicit Stopping Rules

The track names **"stopping rules"** as its own requirement. This
section is the single source of truth for every condition under which
the system must halt automatic recovery on a case — either
permanently or temporarily. Every one of these must be a real,
testable code path, not a comment.

## 69.1 Permanent stops (case closed, never resumes automatically)

``` text
CUSTOMER_PAID       → payment/invoice already settled in full
CUSTOMER_OPT_OUT    → customer explicitly asked not to be contacted
DISPUTE_RAISED      → chargeback / dispute opened — freeze all
                       recovery action pending compliance review
LEGAL_HOLD          → case flagged by a human as legal/collections
UNRECOVERABLE       → max attempts AND max time window both
                       exhausted with no success
```

## 69.2 Temporary stops (case paused, may resume under new conditions)

``` text
RETRY_LIMIT_HIT     → automatic attempts exhausted for now,
                       routes to human queue instead of closing
LOW_CONFIDENCE       → diagnosis confidence below threshold,
                       routes to human review
POLICY_BLOCKED       → Policy Engine rejected the proposed action,
                       routes to human queue
COMMS_BLOCKED        → Section 68 guardrail failed (outside hours,
                       frequency cap, etc.) — retried at next
                       valid window, not abandoned
AWAITING_PROMISE     → customer gave a promise-to-pay date — system
                       stops outbound contact until that date + 1 day
IDEMPOTENCY_CONFLICT → an action for this case is already in flight
                       — new triggers are dropped, not queued
```

## 69.3 Stopping rules as a state machine guard

Every transition in the case State Machine (Section 35) must pass
through a stopping-rule check before firing the next action:

``` text
Next action proposed
        ↓
   Is any PERMANENT stop condition true?
        │
       YES → HALT. Mark terminal state. No further automation ever.
        │
       NO
        ↓
   Is any TEMPORARY stop condition true?
        │
       YES → PAUSE. Route to human queue or scheduled re-check.
        │
       NO
        ↓
   Proceed to Policy Engine (Section 18) →
   Compliant Escalation Check (Section 68) → Action Agent
```

This guard sits **before** the Policy Engine, not after — a case that
should be permanently stopped must never even reach the financial
guardrail, let alone the Action Agent.

## 69.4 Demo value

Stopping rules are one of the easiest, highest-impact things to
demonstrate live: show one case where the agent correctly *refuses to
act further* (e.g., customer opted out, or retry limit hit) with the
reason clearly visible in the UI. Judges specifically look for
restraint, not just action — Section 51 already makes this point;
Section 69 is where it becomes concrete and testable.

------------------------------------------------------------------------

# 70. Batch Processing & Measured Recovery Across a Batch

The track's bar explicitly says **"measured money recovered across a
batch."** A single successful case (Section 23) proves the pipeline
works. A **batch** proves the system generalizes and produces a real,
aggregate financial result — this is what should anchor the demo.

## 70.1 Concept: Recovery Run

A **Recovery Run** (`batch_id`) is one discrete execution of the full
pipeline across a defined set of N transactions/events, at a point in
time. It must be:

``` text
Idempotent   — safe to re-run without double-charging or
               double-messaging any case already acted on
Resumable    — if interrupted, can continue from the last
               committed case, not restart from zero
Bounded      — has a defined start and end, with a final summary
Auditable    — every case's outcome in the run is individually
               inspectable, not just the aggregate number
```

## 70.2 Batch-level metrics to compute and display

``` json
{
  "batch_id": "run_2026_08_31_001",
  "started_at": "2026-08-31T09:00:00Z",
  "completed_at": "2026-08-31T09:01:47Z",
  "cases_scanned": 73,
  "total_revenue_at_risk": 842000,
  "recoverable_cases": 51,
  "auto_actioned": 37,
  "human_review_required": 9,
  "blocked_by_policy": 4,
  "blocked_by_compliance": 1,
  "stopped_by_stopping_rules": 5,
  "verified_recovered_amount": 217000,
  "pending_verification_amount": 68000,
  "recovery_rate_percent": 25.8
}
```

## 70.3 Demo framing (this is your money slide)

``` text
BEFORE the run:
  ₹8.42L sitting at risk across 73 cases, doing nothing

RUN the batch (live, ~2 minutes):
  Detect → Diagnose → Prioritize → Decide → Guard → Act → Verify
  for all 73 cases, streamed into the Live Agent Activity panel
  (Section 29)

AFTER the run:
  ₹2.17L verified recovered
  9 cases correctly routed to a human
  4 cases correctly blocked by policy
  5 cases correctly stopped by stopping rules (opt-out, dispute, etc.)
  1 case correctly blocked by compliance guardrail (outside contact
     window)
  Full per-case audit trail exportable as CSV/JSON
```

This is a stronger story than any single-case walkthrough because it
simultaneously proves recovery **and** restraint at scale — exactly
what "the bar" asks for.

## 70.4 Batch export for judges

Provide a one-click export (CSV or JSON) of every case in the batch
with: case ID, scenario type, amount, diagnosis, action taken,
policy/compliance/stopping-rule result, final status, and recovered
amount. This lets a judge independently verify the aggregate number
by spot-checking individual rows — turning "trust me" into "verify
me," which is far more convincing in a 5-minute judging slot.

------------------------------------------------------------------------

# 71. UPI Autopay / eNACH Mandate Retry --- Mechanics (Stretch Detail)

"Mandate retry sequencer" is listed as an official example direction
and is explicitly scoped to **Future** (Section 62), not V1. If time
permits a stretch build, or if a judge asks about it, this is the
domain detail that makes the answer credible rather than hand-wavy.

## 71.1 What makes mandates different from a normal card/UPI retry

A recurring **mandate** (UPI Autopay or eNACH) has its own failure
taxonomy, distinct from a one-off payment failure:

``` text
INSUFFICIENT_BALANCE     → retry later, same mandate, no new consent
MANDATE_EXPIRED           → cannot retry; must ask customer to
                             re-register a fresh mandate
MANDATE_REVOKED_BY_BANK   → cannot retry; treat like expired
MANDATE_REVOKED_BY_CUSTOMER → PERMANENT STOP (Section 69.1) — this
                             is functionally an opt-out; do not
                             re-request a mandate automatically
MANDATE_LIMIT_EXCEEDED    → amount exceeds the customer's approved
                             per-transaction mandate cap; cannot
                             retry same amount, must ask customer
                             to raise the limit or pay manually
BANK_DOWNTIME / NPCI_ERROR → transient; safe to retry with backoff
```

## 71.2 Sequencing logic

``` text
Mandate charge fails
      ↓
Classify failure reason (above taxonomy)
      ↓
  Transient (balance/downtime)?
        YES → retry with exponential backoff, capped attempts
              (e.g. Day 1, Day 3, Day 5), then stop
        NO  → is it a hard stop (revoked)?
                  YES → Section 69.1 permanent stop, notify customer
                        via approved template only
                  NO  → (expired/limit) → request fresh mandate
                        registration, single reminder, then stop
```

The key discipline: mandate retries must **never** exceed the bank's
own retry-window rules (NPCI typically restricts UPI Autopay retries
to a limited number of attempts within a set window) — so the
Stopping Rules engine (Section 69) is what keeps this compliant even
if not explicitly regulator-integrated in the hackathon build.

------------------------------------------------------------------------

# 72. Final Pre-Submission Checklist (Verbatim Track Language)

Before submitting, walk through the track's own words one more time
and confirm each is demonstrably true, live, in the running product —
not just described in this document:

``` text
[ ] "detects revenue at risk"          → Section 9, live in demo
[ ] "determines the right intervention" → Section 12, live in demo
[ ] "executes a bounded recovery
     workflow"                         → Sections 18–20, bounded by
                                          Policy Engine, not the LLM
[ ] Payment failures covered           → Section 13
[ ] Checkout abandonment covered       → Section 15
[ ] Overdue receivables covered        → Section 17
[ ] "measured money recovered"         → Section 46, real ₹ figure
[ ] "across a batch"                   → Section 70, batch run + export
[ ] "compliant escalation"             → Section 68, guardrail +
                                          escalation ladder
[ ] "stopping rules"                   → Section 69, permanent +
                                          temporary stop conditions
[ ] "an audit trail"                   → Section 25, every decision
                                          traceable end-to-end
[ ] "at least one failure handled
     gracefully"                       → Section 24 + Section 53
```

If every box above can be clicked-through live during the demo, the
product satisfies the official bar exactly as written — not just in
spirit.

------------------------------------------------------------------------

# 73. Test Case Matrix (Edge Cases, All Components)

This section is a concrete test plan, not just a guideline. Each row
is close enough to a real test to be lifted almost directly into unit
/ integration tests. `Expected` is what must happen; `Type` marks
whether it's a unit test (single function/rule), integration test
(multi-component), or a live demo moment worth showing judges.

Use `PASS/FAIL` tracking on this table as your own internal QA
checklist before submission.

## 73.1 Revenue Detection Agent

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| DET-01 | Normal payment failure | status=FAILED, amount=4999 | Case created, revenue_at_risk=4999 | Unit |
| DET-02 | Payment succeeded | status=SUCCESS | No case created | Unit |
| DET-03 | Duplicate event for same payment | Same payment_id ingested twice | Only one case created (dedup by payment_id) | Unit |
| DET-04 | Zero-amount transaction | amount=0 | No case created (nothing at risk) | Unit |
| DET-05 | Negative/refund event | amount=-500 or type=refund | Excluded from detection, logged as non-risk | Unit |
| DET-06 | Missing/null failure reason | reason=null | Case created with reason=UNKNOWN, routed to low-confidence path | Unit |
| DET-07 | Checkout abandoned but payment never initiated | no payment record, only checkout events | Detected via checkout event stream, not payment stream | Integration |
| DET-08 | Invoice exactly on due date (not yet overdue) | due_date = today | NOT flagged as overdue (must be strictly past due) | Unit |
| DET-09 | Invoice 1 second past due (timezone edge) | due_date = today 23:59:59, now = tomorrow 00:00:01 | Correctly flagged overdue using consistent timezone (IST) | Unit |
| DET-10 | Currency/amount as string vs number | amount="4999" (string) | Correctly parsed/coerced, no crash | Unit |
| DET-11 | Extremely high amount (outlier) | amount=99,99,999 | Flagged, but routed straight to human review regardless of AI confidence (Section 69.2) | Integration |

## 73.2 Diagnostic Agent

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| DIA-01 | Clear transient failure | reason=TIMEOUT, 1 attempt | High confidence (>90%), category=Recoverable | Unit |
| DIA-02 | Ambiguous/unknown reason | reason=UNKNOWN or missing | Low confidence, routed to human review, never guessed silently | Unit |
| DIA-03 | Card expired | reason=CARD_EXPIRED | Diagnosis = payment-method issue, suggested action = update method, NOT retry | Unit |
| DIA-04 | Insufficient funds | reason=INSUFFICIENT_FUNDS | Suggested action = delayed retry (not immediate), lower recovery probability | Unit |
| DIA-05 | Fraud/risk-flagged transaction | risk_flag=true | Diagnosis excludes recovery entirely, routes to human/security review, no automated contact | Integration |
| DIA-06 | Same failure reason, different customer history | Reason identical, one customer has 0 prior purchases, other has 20 | Different recovery_probability output — model must use customer history, not just failure reason | Unit |
| DIA-07 | LLM returns malformed/non-JSON output | Simulated bad LLM response | System catches parse error, does not crash, falls back to human review | Unit |
| DIA-08 | LLM output missing required field (e.g. no confidence score) | Partial JSON | Validated against Section 41 output contract, rejected if incomplete, falls back to human review | Unit |

## 73.3 Priority Engine

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| PRI-01 | High amount, low probability vs low amount, high probability | A: ₹50k @ 20%, B: ₹2k @ 95% | Ranked by expected value (A=₹10k > B=₹1.9k), A prioritized | Unit |
| PRI-02 | Two cases with identical expected value | Tie on amount×probability | Tiebreak deterministically (e.g. by urgency/attempt count), not random | Unit |
| PRI-03 | Recovery probability = 0 | probability=0 | Expected value=0, deprioritized to bottom, still logged (not silently dropped) | Unit |
| PRI-04 | Action cost exceeds expected recovery | e.g. human-review cost > ₹200 recovery | Flagged as "not worth pursuing", no action taken, reason logged | Unit |

## 73.4 Policy Engine (Financial Guardrails)

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| POL-01 | Retry within limit | attempt_count=1, max=3 | ALLOW | Unit |
| POL-02 | Retry at exact limit | attempt_count=3, max=3 | BLOCK (limit is inclusive, not exclusive) | Unit |
| POL-03 | Retry one below limit | attempt_count=2, max=3 | ALLOW | Unit |
| POL-04 | Amount exactly at auto-action limit | amount = AUTO_ACTION_LIMIT | ALLOW (boundary is inclusive — define explicitly, test both directions) | Unit |
| POL-05 | Amount ₹1 above auto-action limit | amount = LIMIT + 1 | BLOCK, routed to human approval | Unit |
| POL-06 | Disallowed failure reason for retry | reason=FRAUD_SUSPECTED | BLOCK unconditionally, regardless of amount/attempts | Unit |
| POL-07 | Customer already paid via another channel | second successful payment exists | BLOCK retry, mark case RECOVERED instead | Integration |
| POL-08 | Missing idempotency key | key=null | BLOCK — system must refuse to execute without a key, not generate one silently at action time | Unit |
| POL-09 | Policy engine itself throws an error | Simulated internal exception | Fail CLOSED (treat as BLOCK), never fail open | Unit |
| POL-10 | Two conflicting rules both apply | e.g. amount under limit but reason disallowed | Most restrictive rule wins (BLOCK) | Unit |

## 73.5 Stopping Rules (Section 69)

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| STOP-01 | Customer pays mid-recovery | Payment succeeds while case is IN_PROGRESS | Immediate halt, mark RECOVERED, cancel any queued action | Integration |
| STOP-02 | Customer opts out | opt_out=true received | Permanent stop, DO_NOT_CONTACT flag set, verified this survives future batch runs | Integration |
| STOP-03 | Dispute raised after a retry already succeeded | Chargeback filed post-recovery | Case reopened to DISPUTED state, no further automated action, human flagged | Integration |
| STOP-04 | Promise-to-pay date passes without payment | expected_date < today, still unpaid | Resume outbound contact automatically the day after (not stuck forever) | Integration |
| STOP-05 | Promise-to-pay date is in the past when recorded | Data entry / clock skew edge | Reject the promise date, ask for clarification, do not silently accept | Unit |
| STOP-06 | Stopping rule and Policy Engine disagree | Policy says ALLOW, stopping rule says PERMANENT stop | Stopping rule wins — it is checked *before* Policy Engine (Section 69.3) | Integration |
| STOP-07 | Idempotency conflict — action already in flight | Duplicate trigger while first is executing | Second trigger dropped, not queued, not retried | Unit |
| STOP-08 | Case already marked UNRECOVERABLE, new event arrives | New failed payment on a closed case | New event creates a fresh case, does not reopen or auto-act on the closed one | Integration |

## 73.6 Compliant Escalation (Section 68)

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| COM-01 | Message triggered outside allowed hours | 22:30 IST, window=09:00–19:00 | BLOCKED, queued for next valid window, not dropped | Unit |
| COM-02 | Message triggered exactly at window boundary | 19:00:00 IST | Test both inclusive/exclusive — define once, verify consistently | Unit |
| COM-03 | Frequency cap already hit for the day | 1 msg already sent today, cap=1 | BLOCKED until next allowed period | Unit |
| COM-04 | Frequency cap exactly at limit | msgs_sent=cap | BLOCKED (boundary inclusive) | Unit |
| COM-05 | Customer never consented to SMS, only email on file | channel=SMS requested, no SMS consent | BLOCKED for SMS, falls back to consented channel (email) if available | Integration |
| COM-06 | Escalation ladder tries to skip a step | Attempt to jump Step 1 → Step 4 | Rejected by the ladder controller, must pass through intermediate steps or have explicit human waiver | Unit |
| COM-07 | Attempted automated Step 5 (legal/collections) | Automation tries to trigger legal flag | Hard rejected at the code level — this path must be architecturally unreachable by automation | Unit |
| COM-08 | Non-approved/ad-hoc message text | Message not matching any template ID | BLOCKED — only template-approved content may be sent | Unit |

## 73.7 Action Agent & Idempotency

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| ACT-01 | Same action retried with same idempotency key | Duplicate call, same key | Second call returns cached/original result, no duplicate charge or message | Unit |
| ACT-02 | Same case, different idempotency key (bug simulation) | Two different keys for what should be one action | Detected via case-level lock, second call rejected | Unit |
| ACT-03 | Razorpay API returns success | 200 OK | Action marked EXECUTED, moves to Verification | Unit |
| ACT-04 | Razorpay API returns explicit failure | 4xx/5xx with error body | Action marked FAILED, reason logged, re-evaluated against Policy/Stopping Rules before any retry | Unit |
| ACT-05 | Razorpay API times out (unknown state) | Network timeout, no response | Marked UNKNOWN, routed to Verification to check actual status before any further action (Section 53) | Integration |
| ACT-06 | Action Agent tries to act without Policy Engine approval | Bypass attempt (code path test) | Must be architecturally impossible — Action Agent has no direct path that skips Policy Engine | Unit |
| ACT-07 | Two different cases for the same customer trigger simultaneously | Race condition | Each case processed independently and correctly, no cross-case contamination | Integration |

## 73.8 Verification Engine

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| VER-01 | Action succeeded and payment confirmed | Executed + payment status=SUCCESS | Case marked RECOVERED, amount logged | Unit |
| VER-02 | Action reported success but payment actually failed | Mismatch between action response and true state | Trust the source-of-truth payment status, not the action response; mark FAILED | Unit |
| VER-03 | Verification itself times out | Can't reach status-check API | Case held in PENDING_VERIFICATION, retried on schedule, never silently assumed recovered | Unit |
| VER-04 | Partial payment received | Amount paid < amount due | Case marked PARTIALLY_RECOVERED, remainder still tracked, not closed | Unit |
| VER-05 | Overpayment received | Amount paid > amount due | Flagged for human review (possible duplicate payment or error), not auto-closed | Unit |

## 73.9 Batch Processing (Section 70)

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| BAT-01 | Run batch twice on identical dataset | Same 73 cases, run again | Second run recognizes already-processed cases, does not double-act (idempotent) | Integration |
| BAT-02 | Batch interrupted mid-run (crash/restart) | Kill process at case 40/73 | On restart, resumes from case 41, does not reprocess 1–40 | Integration |
| BAT-03 | Empty batch | 0 cases in dataset | Batch completes cleanly with zero metrics, no crash, UI shows empty state gracefully | Unit |
| BAT-04 | Batch with only unrecoverable cases | All 73 cases fail every guardrail | Batch completes, recovered_amount=0, full breakdown still shown (this is a valid, honest outcome) | Integration |
| BAT-05 | Batch export requested mid-run | Export triggered before completion | Either blocked with "run in progress" message, or exports partial results clearly labeled as partial | Unit |
| BAT-06 | Two batches run concurrently | Overlapping case sets | Case-level locking prevents double-processing across batches | Integration |

## 73.10 Audit Trail

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| AUD-01 | Every state transition logged | Full case lifecycle | Every transition has timestamp, actor (AI/policy/human), reason | Integration |
| AUD-02 | Audit log write fails | Simulated DB write error on log | Action itself is NOT allowed to proceed if its audit entry can't be persisted (no action without a trail) | Unit |
| AUD-03 | Audit trail for a BLOCKED case | Policy blocks an action | Log shows what was proposed, why it was blocked, and by which exact rule | Unit |
| AUD-04 | Audit trail for a stopped case | Stopping rule halts case | Log shows which stopping rule fired and the triggering event | Unit |
| AUD-05 | Attempt to edit/delete an audit entry | Direct DB mutation attempt (dev test) | Audit collection is append-only; edits/deletes are rejected at the data layer | Unit |

## 73.11 Security

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| SEC-01 | Frontend network tab inspected during demo | Browser devtools open | No API keys or secrets visible in any request/response | Manual |
| SEC-02 | `.env` accidentally committed | Git history check | Confirmed absent; only `.env.example` with placeholders present | Manual |
| SEC-03 | API endpoint called without auth | Direct curl to backend | Rejected with 401/403, no data leaked | Unit |
| SEC-04 | SQL/NoSQL injection attempt in customer name field | Malicious string input | Sanitized/parameterized, no injection possible | Unit |

## 73.12 Concurrency & Race Conditions

| ID | Scenario | Input | Expected | Type |
|---|---|---|---|---|
| CON-01 | Customer pays exactly while retry action is executing | Race between manual payment and auto-retry | Only one charge succeeds; system detects and reconciles, never double-charges | Integration |
| CON-02 | Two automated triggers fire for the same case within milliseconds | Duplicate event delivery from upstream | Case-level lock ensures only one is processed | Unit |
| CON-03 | Human approves a case in the review queue at the same moment it auto-expires | Approval vs. timeout race | Deterministic tiebreak rule defined and tested (e.g. approval wins if it lands before expiry timestamp) | Integration |

## 73.13 Scenario-Specific Edge Cases

| ID | Scenario | Expected | Type |
|---|---|---|---|
| SCN-01 | Checkout abandoned, then customer completes purchase organically (no recovery action taken) | Case auto-closes as RECOVERED with action_taken=NONE — must not claim credit for organic recovery | Integration |
| SCN-02 | Subscription fails, customer cancels before recovery completes | Recovery halted immediately (Section 69.1 equivalent — treat cancellation as opt-out) | Integration |
| SCN-03 | B2B invoice customer disputes the invoice amount itself (not just late) | Different from late payment — routes straight to human, not payment reminders | Integration |
| SCN-04 | Payment failure where the "customer" is actually a bot/test transaction | Detected via risk signals, excluded from recovery metrics | Unit |
| SCN-05 | Recurring subscription customer who has failed and recovered 5 times before | Historical pattern should lower recovery probability / raise scrutiny, not treat as a fresh case each time | Unit |

## 73.14 UI / Demo Robustness

| ID | Scenario | Expected | Type |
|---|---|---|---|
| UI-01 | Dashboard loaded with no data yet | Clean empty state, not a blank/broken screen | Manual |
| UI-02 | Live Agent Activity panel during a slow network | Loading state shown, no silent freeze | Manual |
| UI-03 | Judge clicks a blocked case | Clearly shows the exact rule that blocked it, in plain English | Manual |
| UI-04 | Judge clicks "Run Recovery" twice quickly | Second click is a no-op or disabled while first run is in progress, not a duplicate run | Manual |
| UI-05 | Demo run on stage with flaky wifi | Graceful degradation / cached last-known state shown rather than a crash | Manual |

------------------------------------------------------------------------

# 74. How to Use This Test Matrix

1. Before the hackathon deadline, walk every row in Section 73 and
   mark it `PASS`, `FAIL`, or `N/A (not built)`.
2. Any `FAIL` on Sections 73.4, 73.5, or 73.6 (Policy, Stopping
   Rules, Compliant Escalation) is a **blocker** — these are the
   exact clauses of "the bar" (Section 4a) and are the first things
   a technically sharp judge will probe live.
3. For the demo itself, pre-select 2–3 rows to show live:
   one clean recovery (Section 23), one policy block (Section 19),
   and one stopping-rule halt (Section 69.4) — this trio proves
   detection, action, *and* restraint in under two minutes.
4. It is completely fine to submit with some `N/A` rows if scope was
   cut — an honest, tested subset beats an untested "we built
   everything" claim. Judges can usually tell the difference.
