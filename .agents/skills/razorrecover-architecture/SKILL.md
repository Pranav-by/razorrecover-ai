---
name: razorrecover-architecture
description: System architecture for RazorRecover AI — agent pipeline, state machine, data flow, backend layers, and component responsibilities. Reference for any structural or flow-related task.
---

# RazorRecover AI — System Architecture

## Complete System Flow
```
MERCHANT DATA
     │
     ▼
DATA INGESTION (Payments, Checkout Events, Subscriptions, Invoices, Customer History)
     │
     ▼
REVENUE DETECTOR → Find money at risk
     │
     ▼
DIAGNOSTIC AGENT → Why is revenue being lost? (OpenAI)
     │
     ▼
PRIORITY ENGINE → Which recovery matters most? (Expected Value)
     │
     ▼
STRATEGY AGENT → What should we do? (OpenAI)
     │
     ▼
STOPPING RULES → Should we halt? (deterministic, checked BEFORE policy)
     │
     ├── PERMANENT STOP → Case closed forever
     ├── TEMPORARY STOP → Paused / Human queue
     │
     ▼
POLICY ENGINE → Are we allowed to do it? (deterministic)
     │
     ├── BLOCK → Human Review Queue
     │
     ▼
COMPLIANT ESCALATION → Can we contact this person now? (deterministic)
     │
     ▼
ACTION AGENT → Execute approved action via Razorpay
     │
     ▼
VERIFICATION ENGINE → Did recovery actually happen?
     │
     ├── SUCCESS → RECOVERED
     ├── FAILURE → Re-evaluate
     │
     ▼
AUDIT TRAIL → Every decision logged
     │
     ▼
DASHBOARD → Show results
```

## State Machine
Every recovery case transitions through these states:
```
DETECTED → DIAGNOSING → STRATEGY_SELECTED → STOPPING_CHECK
  → HALTED (permanent stop, terminal)
  → PAUSED (temporary stop, → HUMAN_REVIEW)
  → POLICY_CHECK
      → BLOCKED → HUMAN_REVIEW
      → APPROVED → EXECUTING → VERIFYING
          → RECOVERED (terminal)
          → PARTIALLY_RECOVERED
          → FAILED → re-evaluate (back to STOPPING_CHECK if retries left)
          → UNKNOWN_STATE → verify actual status
  HUMAN_REVIEW → APPROVED | REJECTED (terminal)
```

## Agent Responsibilities

### Revenue Detection Agent
- **Input:** Payment status, amount, method, failure reason, checkout state, subscription status, invoice status, timestamps
- **Output:** `{ revenue_at_risk, scenario, recoverability, recovery_probability, priority }`
- **Rules:** Dedup by paymentId, exclude zero/negative amounts, exclude successful payments

### Diagnostic Agent (AI-powered)
- **Input:** Transaction details + customer history
- **Output:** `{ category, confidence, recoverability, suggestedAction, reasoning }`
- **LLM:** OpenAI gpt-4o-mini with structured JSON output
- **Fallback:** If LLM returns malformed output → human review

### Priority Engine
- **Formula:** `expectedRecovery = amount × recoveryProbability`
- **Factors:** Customer value, urgency, attempt count, action cost, risk
- **Output:** Sorted ranking by expected recovery value

### Strategy Agent (AI-powered)
- **Input:** Diagnosis + customer history + scenario
- **Output:** `{ action, priority, expectedRecovery, reasoning }`
- **Allowed actions:** retry_payment, generate_link, send_reminder, update_method, escalate_human, stop_recovery

### Policy Engine (Deterministic)
- Never uses AI
- Checks: retry limits, amount limits, allowed failure reasons, customer payment status, idempotency key
- **Fail-closed:** Any error = BLOCK

### Stopping Rules Engine (Deterministic)
- Checked BEFORE Policy Engine
- Permanent: CUSTOMER_PAID, CUSTOMER_OPT_OUT, DISPUTE_RAISED, LEGAL_HOLD, UNRECOVERABLE
- Temporary: RETRY_LIMIT_HIT, LOW_CONFIDENCE, COMMS_BLOCKED, AWAITING_PROMISE, IDEMPOTENCY_CONFLICT

### Compliant Escalation (Deterministic)
- 7-point checklist before any outbound communication
- Escalation ladder: 5 steps, Step 5 (legal) is architecturally unreachable by automation

### Action Agent
- Executes approved actions only
- Never decides permission
- Uses idempotency keys: `recovery_{caseId}_attempt_{N}`

### Verification Engine
- Checks actual payment status from Razorpay
- Handles: success, failure, timeout, partial payment, overpayment

## Backend Architecture
```
backend/
├── src/
│   ├── server.js                    # Express app + MongoDB connection
│   ├── controllers/
│   │   ├── dashboard.controller.js  # GET /api/dashboard/*
│   │   ├── recovery.controller.js   # GET/POST /api/recoveries/*, /api/recovery/run-batch
│   │   ├── review.controller.js     # GET/POST /api/review-queue/*
│   │   └── demo.controller.js       # POST /api/demo/seed, /api/demo/reset
│   ├── routes/
│   │   ├── dashboard.routes.js
│   │   ├── recovery.routes.js
│   │   ├── review.routes.js
│   │   └── demo.routes.js
│   ├── services/
│   │   ├── orchestrator.service.js       # Master pipeline
│   │   ├── revenue-detector.service.js   # Find revenue at risk
│   │   ├── diagnosis.service.js          # AI diagnosis (OpenAI)
│   │   ├── strategy.service.js           # AI strategy (OpenAI)
│   │   ├── priority.service.js           # Expected value ranking
│   │   ├── policy.service.js             # Deterministic guardrails
│   │   ├── stopping-rules.service.js     # Halt conditions
│   │   ├── compliance.service.js         # Communication guardrails
│   │   ├── action.service.js             # Execute approved actions
│   │   ├── verification.service.js       # Verify outcomes
│   │   ├── razorpay.service.js           # Razorpay SDK wrapper
│   │   └── audit.service.js              # Append-only audit logging
│   ├── models/
│   │   ├── Transaction.js
│   │   ├── RecoveryCase.js
│   │   ├── RecoveryAction.js
│   │   ├── AuditLog.js
│   │   ├── Customer.js
│   │   └── BatchRun.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── idempotency.js
│   └── data/
│       └── seed-data.js             # 500+ synthetic transactions
└── .env
```

## Frontend Architecture
```
frontend/
├── src/
│   ├── App.jsx                      # BladeProvider + Router + SideNav
│   ├── pages/
│   │   ├── Dashboard.jsx            # Metrics + Charts + Activity + CTA
│   │   ├── Recoveries.jsx           # Filterable table of all cases
│   │   ├── RecoveryDetail.jsx       # AI Decision Panel + Audit Timeline
│   │   ├── ReviewQueue.jsx          # Human approval cards
│   │   └── Policies.jsx             # Configurable thresholds
│   ├── components/
│   │   ├── MetricCard.jsx
│   │   ├── AgentActivity.jsx
│   │   ├── AuditTimeline.jsx
│   │   ├── RevenueChart.jsx
│   │   ├── RecoveryTable.jsx
│   │   └── PolicyDecision.jsx
│   └── services/
│       └── api.js                   # Axios wrapper for all endpoints
```

## API Endpoints
```
GET    /api/dashboard/summary          # Top metrics
GET    /api/dashboard/breakdown        # Revenue by scenario
GET    /api/recoveries                 # List all cases
GET    /api/recoveries/:id             # Case detail + audit trail
POST   /api/recovery/run-batch         # Trigger batch recovery
GET    /api/recovery/batch/:batchId    # Batch results
GET    /api/recovery/batch/:batchId/export  # CSV/JSON export
GET    /api/review-queue               # Human review cases
POST   /api/review-queue/:id/approve   # Approve case
POST   /api/review-queue/:id/reject    # Reject case
POST   /api/demo/seed                  # Seed synthetic data
POST   /api/demo/reset                 # Clear and re-seed
```

## Integration Flow
```
Frontend (React + Blade)
    ↓ REST API (axios)
Backend API (Express)
    ↓
Recovery Orchestrator
    ↓
Policy Engine (deterministic)
    ↓
Razorpay Service (SDK wrapper)
    ↓
Razorpay Test APIs
```

All secrets are server-side only. Frontend never sees API keys.
