# RazorRecover AI — Run Instructions & Commands

**Track 03:** AI Revenue Recovery  
**Application Stack:** React (Vite) + Razorpay Blade Design System (Frontend) | Node.js + Express (Backend) | MongoDB Atlas | OpenAI `gpt-4o-mini`

---

## ⚡ Quick Start (2 Commands)

### 1. Start the Backend Server (Port 5000)
Open a terminal and run:
```bash
cd /home/pranav/Documents/hackathon/backend
node src/server.js
```
> **Backend will be live at:** `http://localhost:5000`  
> **Health check:** `http://localhost:5000/api/health`

---

### 2. Start the Frontend Application (Port 3000)
Open a second terminal and run:
```bash
cd /home/pranav/Documents/hackathon/frontend
npm run dev -- --host --port 3000
```
> **Frontend Web App will be live at:** `http://localhost:3000`

---

## 🛠️ Additional Useful Commands

### Seed / Reset Demo Transactions
Populates 480+ synthetic records across all 4 MVP scenarios (Payment Failures, Checkout Dropoffs, Subscriptions, Overdue Invoices):
```bash
cd /home/pranav/Documents/hackathon/backend
npm run seed
```

### Build Production Bundles
```bash
# Build Frontend
cd /home/pranav/Documents/hackathon/frontend
npm run build

# Preview Production Build
npm run preview
```

---

## 🎯 Live Demo Walkthrough (120-Second Judge Script)

1. **Open Dashboard:** Navigate to [http://localhost:3000](http://localhost:3000).
2. **View Initial Telemetry:**
   - Notice **Revenue at Risk** detected from unrecovered checkout dropoffs and failed payments.
3. **Execute Autonomous Recovery:**
   - Click the blue **"▶ Run Autonomous Batch Recovery"** button in the top bar.
   - Watch the **Autonomous Agent Orchestration** card live:
     - 🔍 **Revenue Detector:** Scans raw telemetry
     - 🧠 **Diagnostic Agent:** Leverages OpenAI `gpt-4o-mini` to categorize root causes
     - 📊 **Priority Engine:** Computes Expected Value ($Amount \times P$)
     - 🛑 **Stopping Rules:** Halts on permanent stops (`CUSTOMER_OPT_OUT`, `DISPUTE_RAISED`)
     - 🛡️ **Policy Engine:** Bounded by ₹10,000 auto limits and retry caps
     - ⚡ **Action & Verification:** Simulates Razorpay settlement and confirms money won back
     - 📜 **Append-Only Audit:** Immutable decision trail
4. **Explore Case Details:**
   - Click on **Revenue Cases** (`/recoveries`) and select any case (e.g. `RC_0001`).
   - View the **AI Decision Synthesis** vs **Deterministic Guardrail Evaluation** and the full **Immutable Audit Timeline**.
5. **Human-in-the-Loop Review:**
   - Go to **Human Review Queue** (`/review`) to review and approve/reject cases held by policy caps.
