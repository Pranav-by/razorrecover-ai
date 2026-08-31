# 🏆 Winning Track 03 Demo Script & Pitch Strategy

## The 30-Second Hook (Opening)
> *"Judges, merchants don't just lose revenue when a payment fails at checkout. They lose it silently when a customer drops off a cart, when a recurring SaaS card expires, or when an enterprise invoice sits overdue. Most tools just show analytics dashboards or blind auto-retriers. **RazorRecover AI** is an autonomous, policy-bounded agentic system that detects leaked capital, uses AI to diagnose root causes, computes Expected Recovery Value, enforces strict financial guardrails, executes winbacks, and proves every single recovered Rupee with an immutable audit trail."*

---

## ⏱️ 120-Second Live Demo Walkthrough

### 0:00 – 0:25: The Command Center & Revenue Telemetry
1. Open **`http://localhost:3000`**.
2. Point out:
   - **Revenue at Risk:** ₹89.40L identified across transaction streams.
   - **Autonomous Pipeline:** 10 distinct agents (Revenue Detector → AI Diagnosis → Priority Engine → Stopping Rules → Policy Engine → Compliance → Action → Verification → Audit).
3. Click **"▶ Run Autonomous Recovery Run"**.

### 0:25 – 0:50: Live Autonomous Winback Execution
1. Watch the telemetry update live:
   - **Revenue Recovered:** Updates to verified amounts (e.g. ₹37,462+ won back).
   - **Winback Rate:** Telemetry displays conversion rate.
2. Show the **"Recent Revenue Recovery Interventions"** table:
   - Point out green **`RECOVERED`** badges for autonomous recoveries.
   - Point out blue **`HUMAN_REVIEW`** badges for cases safely held by guardrails.

### 0:50 – 1:15: The 6-Scenario Sandbox & Hinglish Voice AI (Differentiation!)
1. Scroll to the **"Interactive Recovery Scenario Sandbox"**:
   - **Scenario 1 (UPI Timeout):** ₹6,999 auto-actioned & recovered.
   - **Scenario 2 (Cart Drop-off):** ₹12,999 smart 1-click cart link sent.
   - **Scenario 3 (Subscription Failure):** ₹999/mo expired card restored with 7-day grace window.
   - **Scenario 4 (B2B Receivables):** ₹2,50,000 promise-to-pay tracked on calendar.
2. Click **"🔊 Hinglish AI Voice"** on Scenario 1 or 2:
   - *Let the judges hear the synthesized Hinglish voice recovery prompt directly in the browser!*

### 1:15 – 1:40: The Safety Moat — Financial Guardrails & Restraint (Case #005)
1. Click **"Guardrails"** (or click into Case 005 / Ananya Gupta, ₹50,000):
   - Show the **Policy Engine decision**: AI wanted to retry, but Policy Engine **BLOCKED** it because:
     - Amount (₹50,000) exceeds ₹10,000 autonomous threshold.
     - Attempt count reached maximum 2 retries.
   - Show it safely routed to the **Human Review Queue** (`/review`).
   - Click **"Approve Intervention"** to show human-in-the-loop sign-off!

### 1:40 – 2:00: Verification, Audit Trail & Mic-Drop Proof
1. Click **"Download Audit Matrix"** on the Dashboard to download the CSV file in 1 click.
2. Click **"⭐ Judge Rubric"** in the top navbar:
   - Show the live **18/18 Automated Test Suite** checkmark proving fail-closed safety, idempotency, and stopping rules.
3. **Closing line:**
   > *"We didn't just build a demo. We built a production-ready, bounded revenue recovery engine that makes merchants money safely."*

---

## 🎯 Answers to Tough Judge Questions

| Judge Question | Your Winning Answer |
|:---------------|:--------------------|
| **"Why not just retry every failed payment?"** | *"Blind retries cause bank fatigue, high merchant decline penalties, and customer annoyance. RazorRecover AI diagnoses root causes first (e.g. distinguishing expired card vs network glitch vs fraud) and respects strict 2-retry caps."* |
| **"What if the AI hallucinates or tries to move too much money?"** | *"Our architecture enforces strict separation of concerns: AI handles ambiguity (diagnosis & root cause), while deterministic code handles certainty (Policy Engine & financial limits). The LLM never touches financial execution."* |
| **"How do you ensure customer compliance?"** | *"ComplianceService enforces 09:00-19:00 IST communication windows, frequency caps (max 1/day, 3/case), channel consent verification, and hard stopping rules for opt-outs and disputes."* |
| **"How do we know the numbers are real?"** | *"Every state transition is stored in an append-only AuditLog database. If the audit write fails, the action is blocked. You can download the complete CSV audit matrix with one click."* |
