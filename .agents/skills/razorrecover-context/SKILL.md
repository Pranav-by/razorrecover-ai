---
name: razorrecover-context
description: Master project context for RazorRecover AI — product vision, track requirements, judging bar, 4 MVP scenarios, and philosophy. Read this skill first for any task on this project.
---

# RazorRecover AI — Project Context

## Product
- **Name:** RazorRecover AI
- **Track:** Track 03 — AI Revenue Recovery (Razorpay Buildathon)
- **Theme:** Find revenue that is slipping away and win it back.

## One-Line Description
> An autonomous AI revenue-recovery agent that detects money at risk, diagnoses why it is being lost, chooses a bounded intervention, executes the permitted action, verifies the result, and maintains a complete audit trail.

## The Judging Bar (Verbatim)
> "Don't just identify the problem. Show measured money recovered across a batch, with compliant escalation, stopping rules, and an audit trail."

### Bar Checklist
| Requirement | What It Demands |
|:---|:---|
| "Don't just identify the problem" | Must act, not just detect |
| "measured money recovered" | Real ₹ number, before vs. after |
| "across a batch" | Aggregate result over a set of transactions |
| "compliant escalation" | Respect consent, timing, tone, regulation |
| "stopping rules" | Explicit conditions that halt automatic recovery |
| "an audit trail" | Every decision traceable end-to-end |

## 4 MVP Scenarios
1. **Payment failure recovery** — detect failed payment → diagnose → retry via Razorpay API
2. **Checkout abandonment** — detect high-intent drop-off → generate payment link + reminder
3. **Failed subscription** — detect recurring payment failure (e.g., expired card) → request method update
4. **Overdue B2B invoice** — detect past-due invoice → polite reminder + payment link → promise-to-pay tracking

## Core Problem
Merchants lose revenue across multiple categories:
- Payment failures: ₹80,000
- Checkout abandonment: ₹45,000
- Subscription failures: ₹30,000
- Overdue invoices: ₹1,20,000
- **Total at risk: ₹2,75,000**

Normal dashboards tell merchants **what happened**. Our product answers:
- How much money is at risk?
- Why is it at risk?
- Which revenue is most recoverable?
- What should we do?
- Are we allowed to do it?
- Did the action work?
- How much money did we recover?

## Product Philosophy
**IS**: Agentic workflow, revenue-risk detector, diagnostic engine, recovery decision engine, policy/guardrail layer, action executor, verification layer, audit system.

**IS NOT**: Chatbot, static analytics dashboard, generic LLM wrapper, blind payment retrier.

## Operational Loop
```
Detect → Understand → Decide → Apply guardrails → Execute → Verify → Record outcome
```

## Tech Stack
| Layer | Technology |
|:---|:---|
| Frontend | React + Vite + Razorpay Blade Design System |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (cluster0.lkee1f1.mongodb.net, db: razorrecover) |
| AI | OpenAI gpt-4o-mini |
| Payments | Razorpay Test Mode APIs |
| Charts | Recharts |

## Key Architecture Principle
> **AI decides what might be best. Code decides what is allowed. The action layer executes it. Verification decides whether recovery actually happened.**

- AI is used where **ambiguity** exists (diagnosis, strategy selection, reasoning)
- Deterministic code is used where **certainty** is required (policy limits, idempotency, amount checks)
- LLM never directly controls financial actions

## Environment Variables
All secrets in `/home/pranav/Documents/hackathon/.env`:
- `OPENAI_API_KEY` — OpenAI API key
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay test mode
- `MONGODB_URI` — MongoDB Atlas connection string
- `PORT` — Backend server port (5000)

## MCP Servers Available
- `mongodb` — Direct MongoDB queries
- `razorpay-mcp-server` — Razorpay API operations
- `razorpay-blade-mcp` — Blade Design System docs
- `postman` — API testing
- `github-mcp-server` — Version control
- `chrome-devtools` — Browser testing
