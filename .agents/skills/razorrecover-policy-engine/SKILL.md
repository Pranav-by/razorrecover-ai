---
name: razorrecover-policy-engine
description: Policy rules, stopping rules, compliant escalation, guardrails, configurable thresholds, escalation ladder, and message templates for RazorRecover AI. Reference for any guardrail or safety work.
---

# RazorRecover AI — Policy Engine & Guardrails

## Architecture Principle
The guardrail system has THREE separate, independently-checked layers:

```
Proposed Action
     │
     ▼
[1] STOPPING RULES (checked FIRST — can halt permanently or temporarily)
     │
     ▼
[2] POLICY ENGINE (financial guardrails — can block action)
     │
     ▼
[3] COMPLIANT ESCALATION (communication guardrails — can block messaging)
     │
     ▼
ACTION AGENT (executes only if all three layers pass)
```

All three layers are **deterministic code** — no AI involvement.

---

## 1. Stopping Rules

### Permanent Stops (case closed forever, never resumes)
| Rule | Trigger | Effect |
|:---|:---|:---|
| CUSTOMER_PAID | Payment/invoice settled in full | Halt, mark RECOVERED |
| CUSTOMER_OPT_OUT | Customer explicitly asked not to be contacted | Halt, set DO_NOT_CONTACT |
| DISPUTE_RAISED | Chargeback/dispute opened | Freeze all recovery, compliance review |
| LEGAL_HOLD | Human flagged as legal/collections | No automation ever |
| UNRECOVERABLE | Max attempts AND max time window exhausted | Close case |

### Temporary Stops (paused, may resume)
| Rule | Trigger | Effect |
|:---|:---|:---|
| RETRY_LIMIT_HIT | Automatic attempts exhausted | Route to human queue |
| LOW_CONFIDENCE | Diagnosis confidence < threshold | Route to human review |
| POLICY_BLOCKED | Policy Engine rejected action | Route to human queue |
| COMMS_BLOCKED | Communication guardrail failed | Retry at next valid window |
| AWAITING_PROMISE | Customer gave promise-to-pay date | Stop contact until date+1 |
| IDEMPOTENCY_CONFLICT | Action already in flight | Drop new trigger |

### Guard Logic
```
Next action proposed
    ↓
Is any PERMANENT stop true?
    YES → HALT. Terminal state. No automation ever.
    NO ↓
Is any TEMPORARY stop true?
    YES → PAUSE. Route to human queue or scheduled re-check.
    NO ↓
Proceed to Policy Engine → Compliant Escalation → Action Agent
```

---

## 2. Policy Engine (Financial Guardrails)

### Configurable Thresholds
```javascript
const POLICY_CONFIG = {
  MAX_PAYMENT_RETRIES: 2,
  AUTO_ACTION_LIMIT: 10000,       // ₹10,000 — above this requires human approval
  MIN_RECOVERY_CONFIDENCE: 0.75,
  HIGH_VALUE_THRESHOLD: 50000,    // ₹50,000 — always requires human review
  HUMAN_REVIEW_THRESHOLD: 50000,
  ALLOWED_RETRY_REASONS: [
    'upi_timeout',
    'network_error',
    'bank_decline'
  ],
  DISALLOWED_REASONS: [
    'fraud_suspected',
    'customer_requested_cancellation'
  ]
};
```

### Policy Check Logic
```
IF:
  payment_failed = true
  AND customer_not_already_paid = true
  AND attempt_count < MAX_RETRIES
  AND reason IN allowed_retry_reasons
  AND amount <= AUTO_ACTION_LIMIT
  AND idempotency_key IS NOT NULL
  AND transaction NOT under another recovery

THEN: ALLOW

ELSE: BLOCK (with specific reason logged)
```

### Fail-Closed Principle
- If the policy engine itself throws an error → treat as BLOCK
- Never fail open
- Most restrictive rule wins when multiple rules apply

---

## 3. Compliant Escalation (Communication Guardrails)

### 7-Point Checklist (all must pass before any outbound message)
1. ✓ Customer has NOT opted out (DO_NOT_CONTACT = false)
2. ✓ Current time is within allowed window (09:00–19:00 IST)
3. ✓ Frequency cap not exceeded (max 1 msg/24h, max 3 total per case)
4. ✓ Channel is one customer has consented to
5. ✓ Message uses an approved template (no ad-hoc LLM text)
6. ✓ Tone is appropriate (no threatening/shaming language)
7. ✓ Case is NOT flagged DISPUTED or LEGAL_HOLD

If ANY check fails → BLOCK, log reason, route to human queue.

### Escalation Ladder (Fixed, Bounded)
```
Step 1 — Gentle reminder (automated, Day 0)
Step 2 — Reminder + payment link (automated, Day 2, only if unpaid)
Step 3 — Firmer reminder, still polite, offers assistance (automated, Day 5, only if unpaid)
Step 4 — Human relationship-manager review (mandatory hand-off)
Step 5 — (B2B only) Flag for manual collections/legal review
         ⚠ AGENT NEVER INITIATES STEP 5 — architecturally impossible
```

**Rules:**
- Agent can only propose one step at a time
- No step may be skipped automatically
- Step 5 requires human click (hard architectural constraint)

### Approved Message Templates
```
TEMPLATE: payment_reminder_gentle
"Hi {name}, your payment of {amount} for {order} didn't go through.
No action needed if this was intentional — otherwise, here's a quick
link to retry: {link}"

TEMPLATE: subscription_card_expired
"Hi {name}, we couldn't renew your {plan} subscription because your
card on file has expired. Update it here: {link}. Your access continues
uninterrupted for the next {grace_days} days."

TEMPLATE: invoice_reminder_b2b
"Hi {contact_name}, a friendly note that invoice {invoice_id} for
{amount} was due on {due_date}. Could you confirm an expected payment
date? {link}"
```

Every message sent must be logged verbatim in audit trail with template ID and guardrail check result.

---

## 4. Idempotency

### Key Format
```
recovery_{caseId}_attempt_{attemptNumber}
```

### Check Before Execution
```
Has this recovery operation already executed?
  YES → Return cached result, do NOT execute again
  NO → Execute and store with this key
```

This protects against:
- Duplicate retries from agent timeouts
- Double-charging customers
- Duplicate messages

---

## 5. Demo Value
Show judges:
1. **One successful recovery** — full pipeline works
2. **One policy block** — retry limit exceeded, AI blocked
3. **One stopping rule halt** — customer opted out, system correctly refuses

This trio proves detection, action, AND restraint in under 2 minutes.
