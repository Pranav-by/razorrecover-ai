---
name: razorrecover-demo
description: Demo script, timeline, test cases, pre-submission checklist, and judge expectations for RazorRecover AI. Reference before any demo preparation or final polish.
---

# RazorRecover AI — Demo & Testing Guide

## Demo Timeline (120 seconds)

### 0–15 seconds: Opening
Show dashboard:
```
₹8.42L Revenue at Risk
₹0 Recovered
```
Click: **"▶ RUN RECOVERY"**

### 15–30 seconds: Detection
```
Scanning 500 transactions...
73 revenue leaks detected
```

### 30–45 seconds: AI Diagnosis
Show live agent activity:
```
● Revenue Detector → Found ₹8.42L at risk
● Diagnostic Agent → UPI timeout, Expired card, Checkout abandonment...
```

### 45–60 seconds: Strategy
```
● Strategy Agent → Retry, Payment link, Method update, Reminder...
37 approved | 9 human review | 5 stopped by rules
```

### 60–75 seconds: Guardrails
```
● Policy Engine → 37 actions approved, 4 blocked
● Compliance → 1 blocked (outside hours)
```

### 75–90 seconds: Recovery
```
● Action Agent → Executing...
● Verification → Confirming...
₹2.17L recovered ✓
```

### 90–120 seconds: Proof
1. Open a **recovered** transaction → show full audit trail
2. Open a **blocked** transaction → show policy preventing action:
   ```
   AI recommended retry
   Policy blocked it
   Reason: retry limit exceeded (3/2 max)
   ```

## 5 Key Demo Cases

### Case #001 — Successful Payment Recovery
- **Scenario:** Payment Failure (UPI timeout)
- **Amount:** ₹6,999
- **Recovery probability:** 91%
- **Action:** Retry payment
- **Result:** ✅ RECOVERED

### Case #002 — Checkout Abandonment Recovery
- **Scenario:** Checkout Abandonment (high intent)
- **Amount:** ₹12,999
- **Action:** Generate payment link + reminder
- **Result:** ✅ RECOVERED

### Case #003 — Subscription Recovery
- **Scenario:** Subscription Failure (expired card)
- **Amount:** ₹999/month
- **Action:** Request payment method update
- **Result:** ✅ RECOVERED

### Case #004 — B2B Invoice Recovery
- **Scenario:** Invoice Overdue (₹2,50,000)
- **Action:** Polite reminder + payment link
- **Result:** 📝 Promise to pay (September 2)

### Case #005 — Policy Block (Critical Demo Moment)
- **Scenario:** Payment Failure (₹50,000)
- **Previous attempts:** 3 (max is 2)
- **AI recommended:** Retry
- **Policy:** ❌ BLOCKED — retry limit exceeded
- **Result:** 👤 Human review required
- **WHY THIS MATTERS:** Shows the system has restraint, not just action

## What Judges Should Understand in First Minute

```
PROBLEM:   Merchants lose money after customer has shown purchase intent
SOLUTION:  AI finds revenue, diagnoses cause, executes recovery
SAFETY:    AI cannot directly move money — every action passes policy checks
RESULT:    We measure actual revenue recovered (₹ number)
PROOF:     Every decision has an audit trail
```

## Core Demo Pitch
> "Merchants don't just lose revenue when a payment fails. They lose it when a customer abandons checkout, a subscription silently fails, or an invoice goes overdue. RazorRecover AI finds that revenue at risk, understands why it is slipping away, chooses the right recovery intervention, executes it through a bounded action layer, verifies the result, and records exactly what happened."

## Pre-Submission Checklist (from Section 72)

```
[ ] "detects revenue at risk"               → Live in demo
[ ] "determines the right intervention"      → Live in demo
[ ] "executes a bounded recovery workflow"   → Bounded by Policy Engine
[ ] Payment failures covered                 → Case #001
[ ] Checkout abandonment covered             → Case #002
[ ] Subscription failures covered            → Case #003
[ ] Overdue receivables covered              → Case #004
[ ] "measured money recovered"               → Real ₹ figure on dashboard
[ ] "across a batch"                         → 73 cases processed in batch
[ ] "compliant escalation"                   → Guardrail + escalation ladder
[ ] "stopping rules"                         → Permanent + temporary stops
[ ] "an audit trail"                         → Every decision traceable
[ ] "at least one failure handled gracefully"→ Case #005 policy block
```

## Key Test Cases (Priority)

### Must Pass (Blockers)
| ID | Test | Expected |
|:---|:---|:---|
| POL-02 | Retry at exact limit (3/3) | BLOCK |
| POL-05 | Amount ₹1 above auto limit | BLOCK → human |
| POL-09 | Policy engine throws error | Fail CLOSED (BLOCK) |
| STOP-02 | Customer opts out | Permanent stop, DO_NOT_CONTACT |
| STOP-06 | Stopping rule vs Policy disagree | Stopping rule wins (checked first) |
| COM-01 | Message outside 09:00–19:00 IST | BLOCKED, queued |
| COM-07 | Automated Step 5 (legal) | Architecturally impossible |
| ACT-01 | Same idempotency key twice | No duplicate action |
| BAT-01 | Run batch twice on same data | No double-processing |
| AUD-02 | Audit log write fails | Action NOT allowed to proceed |

### Should Show in Demo
| What | Why |
|:---|:---|
| Successful recovery (Case #001) | Proves pipeline works |
| Policy block (Case #005) | Proves restraint |
| Stopping rule halt | Proves safety |
| Batch metrics | Proves scale |
| Audit trail | Proves traceability |
| Human review queue | Proves human-in-loop |

## Batch Metrics Display (The Money Slide)
```
BEFORE the run:
  ₹8.42L at risk across 73 cases

AFTER the run:
  ₹2.17L verified recovered
  9 cases → human review
  4 cases → blocked by policy
  5 cases → stopped by stopping rules
  1 case  → blocked by compliance (outside hours)
  Full per-case audit trail exportable
```

## Export for Judges
One-click CSV/JSON export with:
- Case ID, scenario, amount, diagnosis, action, policy result, final status, recovered amount
- Lets judges independently verify the aggregate number
