# RazorRecover AI ⚡
> **Autonomous AI Revenue Recovery Command Center**  
> *Track 03 — AI Revenue Recovery | Built with Razorpay Blade Design System*

[![Blade UI](https://img.shields.io/badge/Blade_UI-12.121.0-blue.svg)](https://blade.razorpay.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://mongodb.com/)
[![AI Engine](https://img.shields.io/badge/OpenAI-gpt--4o--mini-black.svg)](https://openai.com/)

---

## 🎯 Executive Summary & Track 03 Scope

RazorRecover AI is an autonomous, policy-bounded revenue recovery engine that detects revenue leakages across transaction streams, diagnoses root causes with AI models, computes Expected Recovery Value ($Amount \times P$), strictly adheres to regulatory & financial guardrails, and executes automated winback interventions with an immutable audit trail.

### 4 Core MVP Scenarios Handled
1. **Payment Failure at Checkout:** Network dropouts, bank server timeouts, card limit issues.
2. **Abandoned Checkout Intent:** Cart dropoffs with items in basket.
3. **Failed Recurring Subscriptions:** Card expiry, insufficient balance, mandate renewal retries.
4. **Overdue B2B Invoices:** Smart dunning with dynamic terms and payment links.

---

## 🏗️ Multi-Agent Architecture

```
[ Ingest Stream / Webhooks ]
             │
             ▼
    Revenue Detector (Identify Leaks)
             │
             ▼
    Diagnostic Agent (OpenAI gpt-4o-mini Root Cause & Score)
             │
             ▼
    Priority Engine (Calculate Expected Recovery Value)
             │
             ▼
    Stopping Rules Evaluator (Permanent / Dynamic Stops)
             │
             ▼
    Policy Guardrail Engine (Auto-Action Limit & Retry Caps)
       ├── Allowed ──► Action & Verification (Simulate/Settle)
       └── Escalated ─► Human Approval Queue (Manual Sign-Off)
             │
             ▼
    Immutable Audit Log (Append-Only Cryptographic Timeline)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18
- MongoDB Atlas cluster URI
- OpenAI API Key

### 1. Configure Environment
Create `.env` in the root or copy `.env.example`:
```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_key
PORT=5000
```

### 2. Install & Run Backend
```bash
cd backend
npm install
npm run seed     # Seeds 480 synthetic transactions
npm run dev      # Runs on port 5000
```

### 3. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev -- --host --port 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Financial & Regulatory Guardrails

- **₹10,000 Auto-Action Threshold:** Any single recovery action above ₹10,000 requires human sign-off.
- **Maximum 2 Autonomous Retries:** Automatic escalation to human queue on 3rd attempt.
- **Compliant Escalation Window:** 09:00 - 19:00 IST for outbound communications.
- **Immediate Hard Stops:** `CUSTOMER_OPT_OUT`, `DISPUTE_RAISED`, `FRAUD_ALERT`.
- **Append-Only Audit Logs:** Every state change recorded with timestamps, actor IDs, and payload metadata.

---

## 📊 Live Dashboard & Features
- **Real-Time Revenue Telemetry:** Revenue Recovered, Revenue at Risk, Measured Winback %, Active Recoveries.
- **Razorpay Blade UI:** Premium dark-mode operations dashboard adhering strictly to Blade tokens and accessibility standards.
- **Interactive Human Review Queue:** Approve or reject interventions held by safety guardrails.
- **CSV Audit Export:** 1-click export of complete recovery matrices for accounting and compliance.

---

