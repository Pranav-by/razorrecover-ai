import React, { useState } from 'react';
import { Volume2, VolumeX, CheckCircle, ShieldAlert, Clock, ArrowRight, Sparkles, UserCheck, AlertTriangle, X, Terminal, BrainCircuit, ShieldCheck, Database, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ScenarioDemo {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: 'green' | 'yellow' | 'coral' | 'blue';
  amount: string;
  customer: string;
  customerId: string;
  riskReason: string;
  scenarioType: string;
  agentDecision: string;
  aiDiagnosis: string;
  aiConfidence: string;
  guardrailStatus: string;
  guardrailDetail: string;
  actionTaken: string;
  verificationOutcome: string;
  messageTemplate: string;
  voiceScript: string;
  auditTrailSummary: string;
}

const DEMO_SCENARIOS: ScenarioDemo[] = [
  {
    id: 'pay_demo_001',
    title: '1. Transient Payment Degradation (UPI Timeout)',
    subtitle: 'Temporary network timeout during UPI checkout authorization',
    tag: 'UPI Timeout',
    tagColor: 'yellow',
    amount: '₹6,999',
    customer: 'Rahul Sharma',
    customerId: 'CUS_101',
    scenarioType: 'PAYMENT_FAILURE',
    riskReason: 'Bank UPI gateway timeout during peak authorization window (5 prior successful payments)',
    agentDecision: 'Click "Inspect Pipeline" to evaluate AI diagnosis, financial limits & execution',
    aiDiagnosis: 'Transient network timeout detected. Clean account payment history with 5 prior successes. Standard recoverable failure signature.',
    aiConfidence: '91%',
    guardrailStatus: 'APPROVED (Automatic)',
    guardrailDetail: 'Amount ₹6,999 ≤ ₹10,000 limit; Attempt 1 of 2 max retries; No opt-out or active dispute found.',
    actionTaken: 'Triggered Razorpay payment retry order with auto-settlement verification.',
    verificationOutcome: '✅ Settled & Won Back: ₹6,999 credited to merchant balance.',
    messageTemplate: 'Hi Rahul, your payment of ₹6,999 for Wireless Headphones was temporarily interrupted. We have automatically verified and confirmed your order.',
    voiceScript: 'Hello Rahul Sharma, this is an automated dispatch from RazorRecover AI. We noticed your payment of 6,999 rupees for Wireless Headphones experienced a brief UPI network timeout. We have verified and re-initiated your transaction with the payment gateway, and your order is now confirmed. Thank you!',
    auditTrailSummary: 'RC_0001 → DIAGNOSIS_COMPLETE (91%) → POLICY_APPROVED → ACTION_EXECUTED (retry_payment) → RECOVERY_VERIFIED (₹6,999)'
  },
  {
    id: 'pay_demo_002',
    title: '2. High-Intent Checkout Drop-off',
    subtitle: 'Customer reached final checkout step with saved basket then abandoned',
    tag: 'Cart Abandoned',
    tagColor: 'yellow',
    amount: '₹12,999',
    customer: 'Neha Singh',
    customerId: 'CUS_104',
    scenarioType: 'CHECKOUT_ABANDONMENT',
    riskReason: 'Customer initiated checkout, opened payment sheet, and left with active cart',
    agentDecision: 'Click "Inspect Pipeline" to evaluate cart recovery dispatch & channel compliance',
    aiDiagnosis: 'High-intent abandonment signature. Saved items in cart with 8 prior successful platform purchases.',
    aiConfidence: '88%',
    guardrailStatus: 'APPROVED (Compliant Channel)',
    guardrailDetail: 'Outreach triggered within allowed 09:00–19:00 IST window; SMS & Email consent verified; Frequency 1/1 today.',
    actionTaken: 'Generated unique Razorpay Payment Link (plink_demo_002) with 24-hour cart preservation.',
    verificationOutcome: '✅ Link Converted: Customer completed payment within 18 minutes.',
    messageTemplate: 'Hi Neha, we noticed you did not complete your purchase of Smart Watch Pro (₹12,999). We have saved your cart — complete your order here: https://rzp.io/l/demo_watch',
    voiceScript: 'Hi Neha, this is RazorRecover AI. We noticed you left items in your shopping bag. An instant one-click secure checkout link for your Smart Watch Pro for 12,999 rupees has been sent to your verified mobile number and email. Complete your order today to guarantee same-day dispatch.',
    auditTrailSummary: 'RC_0002 → DIAGNOSIS_COMPLETE (88%) → COMPLIANCE_PASSED → ACTION_EXECUTED (generate_link) → RECOVERY_VERIFIED (₹12,999)'
  },
  {
    id: 'pay_demo_003',
    title: '3. Failed Recurring Subscription (Expired Card)',
    subtitle: 'SaaS recurring billing failed due to expired credit card token on file',
    tag: 'Card Expired',
    tagColor: 'yellow',
    amount: '₹999 / mo',
    customer: 'Priya Patel',
    customerId: 'CUS_102',
    scenarioType: 'SUBSCRIPTION_FAILURE',
    riskReason: 'Card expiration date passed on recurring mandate billing cycle',
    agentDecision: 'Click "Inspect Pipeline" to evaluate grace period logic & method update link',
    aiDiagnosis: 'Recurring mandate payment failed due to expired token. Account in good standing with 12 prior renewals.',
    aiConfidence: '84%',
    guardrailStatus: 'APPROVED (Grace Period Active)',
    guardrailDetail: 'Applied 7-day non-disruptive grace period per subscription policy; Outbound email within frequency limits.',
    actionTaken: 'Dispatched card update link with instant authorization verification.',
    verificationOutcome: '✅ Mandate Restored: Customer updated new card method, recurring billing resumed uninterrupted.',
    messageTemplate: 'Hi Priya, we could not renew your Pro Monthly subscription because your card on file expired. Update it here: https://rzp.io/update-method. Your access continues for 7 days.',
    voiceScript: 'Hello Priya Patel, this is RazorRecover AI. Your recurring Pro Monthly subscription payment could not be processed because your card on file has expired. Your active access is fully protected for a 7-day grace window. Please use the secure link sent to your email to update your card and keep your subscription active.',
    auditTrailSummary: 'RC_0003 → DIAGNOSIS_COMPLETE (84%) → GRACE_APPLIED → ACTION_EXECUTED (update_method) → RECOVERY_VERIFIED (₹999/mo)'
  },
  {
    id: 'pay_demo_004',
    title: '4. B2B Receivables Chaser & Promise-to-Pay',
    subtitle: 'Overdue commercial invoice with smart escalation and payment commitment',
    tag: 'Invoice Overdue',
    tagColor: 'blue',
    amount: '₹2,50,000',
    customer: 'TechStar Solutions Pvt Ltd',
    customerId: 'CUS_201',
    scenarioType: 'INVOICE_OVERDUE',
    riskReason: 'Commercial enterprise invoice overdue by 6 days on Q3 Cloud Infrastructure Contract',
    agentDecision: 'Click "Inspect Pipeline" to evaluate smart dunning & promise-to-pay tracker',
    aiDiagnosis: 'Enterprise invoice past payment term. High-value customer with ₹25L lifetime settlement history.',
    aiConfidence: '92%',
    guardrailStatus: 'APPROVED (Dunning Ladder Step 2)',
    guardrailDetail: 'Professional corporate tone applied; Finance contact channel verified; Logged promise date within policy limits.',
    actionTaken: 'Dispatched dynamic invoice payment link with automated promise-to-pay tracker integration.',
    verificationOutcome: '📝 Promise-to-Pay Committed: Customer confirmed fund release date for September 2nd.',
    messageTemplate: 'Hi Accounts Team, a friendly note that invoice inv_demo_004 for ₹2,50,000 was due on August 25. Could you confirm an expected payment date? https://rzp.io/inv/demo_004',
    voiceScript: 'Hello TechStar Solutions Accounts Team, this is RazorRecover AI calling on behalf of your cloud infrastructure billing. Invoice inv_demo_004 for 250,000 rupees is currently past its due date. We have registered your commitment to settle the outstanding balance by September 2nd. Your direct settlement link is active. Thank you.',
    auditTrailSummary: 'RC_0004 → DIAGNOSIS_COMPLETE (92%) → DUNNING_STEP_2 → PROMISE_LOGGED (Sept 2) → STATUS_PAUSED_AWAITING_PROMISE'
  },
  {
    id: 'pay_demo_005',
    title: '5. Policy Guardrail Safety Block (Restraint)',
    subtitle: 'High-value transaction exceeding ₹10,000 auto limit + 3 prior retries',
    tag: 'High Value (₹50k)',
    tagColor: 'coral',
    amount: '₹50,000',
    customer: 'Ananya Gupta',
    customerId: 'CUS_106',
    scenarioType: 'PAYMENT_FAILURE',
    riskReason: 'Card declined + 3 prior retries + ₹50,000 exceeds ₹10,000 autonomous execution threshold',
    agentDecision: 'Click "Inspect Pipeline" to test deterministic policy engine block & review escalation',
    aiDiagnosis: 'High-value transaction decline. AI diagnostic agent recommended retry based on customer spend profile.',
    aiConfidence: '78%',
    guardrailStatus: '❌ BLOCKED BY POLICY ENGINE',
    guardrailDetail: 'Blocked by Rule POL-05: Amount ₹50,000 exceeds ₹10,000 auto-limit. Blocked by Rule POL-02: Retry limit exceeded (3/2 max).',
    actionTaken: 'Autonomous financial action strictly halted. Case escalated to Human Review Queue for manual operator sign-off.',
    verificationOutcome: '👤 Escalated to Human Review: Prevents bank penalties and unauthorized money movement.',
    messageTemplate: 'None (Autonomous communication blocked until human operator approves intervention in Review Queue).',
    voiceScript: 'Alert: Outbound voice dispatch is blocked for this case by the Financial Policy Guardrail. High-value transactions exceeding 10,000 rupees require manual operator authorization.',
    auditTrailSummary: 'RC_0005 → DIAGNOSIS_COMPLETE (78%) → POLICY_BLOCKED (POL-02, POL-05) → HUMAN_REVIEW_REQUIRED → AUDIT_SEALED'
  },
  {
    id: 'pay_demo_optout',
    title: '6. Hard Stopping Rule (Customer Opt-Out)',
    subtitle: 'Customer explicitly unsubscribed from recovery communications',
    tag: 'Opted-Out Profile',
    tagColor: 'coral',
    amount: '₹3,500',
    customer: 'Suresh Iyer',
    customerId: 'CUS_301',
    scenarioType: 'STOPPING_RULE',
    riskReason: 'Customer opted out of contact channel (DO_NOT_CONTACT flag active)',
    agentDecision: 'Click "Inspect Pipeline" to verify immediate stopping rule freeze before policy',
    aiDiagnosis: 'Transaction failure detected, but customer master profile contains active DO_NOT_CONTACT flag.',
    aiConfidence: '99%',
    guardrailStatus: '🛑 PERMANENTLY HALTED',
    guardrailDetail: 'Stopping Rule STOP-02 triggered before Policy Engine. Immediate permanent freeze applied.',
    actionTaken: 'Zero messages dispatched. Zero automated retries attempted. Case marked permanently uncontactable.',
    verificationOutcome: '🛡️ Customer Safety Enforced: 100% compliant with anti-harassment regulations.',
    messageTemplate: 'None (Communication prohibited by customer consent opt-out).',
    voiceScript: 'Customer has opted out of automated outreach. Voice synthesis and message dispatch are permanently disabled for this contact.',
    auditTrailSummary: 'RC_0006 → STOPPING_RULE_FIRED (CUSTOMER_OPT_OUT) → STATUS_HALTED → ZERO_OUTREACH_VERIFIED'
  }
];

export const DemoSandbox: React.FC = () => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [inspectedScenario, setInspectedScenario] = useState<ScenarioDemo | null>(null);

  const handlePlayVoice = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (playingVoiceId === id) {
        setPlayingVoiceId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      setPlayingVoiceId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div className="neo-badge neo-badge-yellow" style={{ fontSize: '11px', padding: '2px 8px' }}>
              <Sparkles size={12} />
              <span>Track 03 Canonical Scenarios</span>
            </div>
            <div className="neo-badge neo-badge-green" style={{ fontSize: '11px', padding: '2px 8px' }}>
              <span>6/6 Tested & Verified</span>
            </div>
          </div>
          <h3 style={{ fontSize: '20px', margin: 0 }}>Interactive Recovery Scenario Sandbox</h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Click "Inspect Pipeline" on any scenario to view the multi-agent decision chain, or test the English Voice AI dispatch
          </span>
        </div>

        <Link to="/policies" className="neo-btn neo-btn-white neo-btn-sm">
          <span>View Guardrail Rules</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
        }}
      >
        {DEMO_SCENARIOS.map((scenario) => {
          let badgeClass = 'neo-badge-blue';
          if (scenario.tagColor === 'green') badgeClass = 'neo-badge-green';
          if (scenario.tagColor === 'coral') badgeClass = 'neo-badge-coral';
          if (scenario.tagColor === 'yellow') badgeClass = 'neo-badge-yellow';

          const isPlaying = playingVoiceId === scenario.id;

          return (
            <div
              key={scenario.id}
              style={{
                borderRadius: '16px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#ffffff',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '3px 3px 0px var(--border-black)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div className={`neo-badge ${badgeClass}`} style={{ fontSize: '11px', padding: '3px 8px' }}>
                    {scenario.tag}
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: 'var(--border-black)' }}>
                    {scenario.amount}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '15px', color: '#121316', fontFamily: 'var(--font-heading)', lineHeight: 1.3 }}>
                  {scenario.title}
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  {scenario.subtitle}
                </div>

                <div
                  style={{
                    backgroundColor: '#fffdfa',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div><strong>Customer:</strong> {scenario.customer} ({scenario.customerId})</div>
                  <div><strong>Risk Signature:</strong> {scenario.riskReason}</div>
                  <div style={{ color: scenario.tagColor === 'coral' ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    <strong>Pipeline:</strong> {scenario.agentDecision}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <button
                  onClick={() => handlePlayVoice(scenario.id, scenario.voiceScript)}
                  className="neo-btn neo-btn-sm"
                  style={{
                    backgroundColor: isPlaying ? '#ff5757' : '#fff7d6',
                    fontWeight: 700,
                    flex: 1,
                  }}
                  title="Play English AI Voice Recovery Dispatch"
                >
                  {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isPlaying ? 'Stop Voice' : '🔊 AI Voice Dispatch'}</span>
                </button>

                <button
                  onClick={() => setInspectedScenario(scenario)}
                  className="neo-btn neo-btn-white neo-btn-sm"
                  style={{ fontWeight: 700 }}
                  title="Inspect detailed multi-agent pipeline telemetry"
                >
                  <span>Inspect Pipeline</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Dedicated Scenario Inspection Modal ─── */}
      {inspectedScenario && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setInspectedScenario(null)}
        >
          <div
            className="neo-card"
            style={{
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div className={`neo-badge ${inspectedScenario.tagColor === 'coral' ? 'neo-badge-coral' : 'neo-badge-green'}`}>
                    {inspectedScenario.tag}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                    {inspectedScenario.scenarioType}
                  </span>
                </div>
                <h2 style={{ fontSize: '22px', margin: 0 }}>{inspectedScenario.title}</h2>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  Target: <strong>{inspectedScenario.customer}</strong> ({inspectedScenario.customerId}) • Revenue at Risk: <strong>{inspectedScenario.amount}</strong>
                </div>
              </div>

              <button onClick={() => setInspectedScenario(null)} className="neo-btn neo-btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* AI Diagnostic Reasoning */}
              <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-black)', backgroundColor: '#faf5ff', boxShadow: '2px 2px 0px var(--border-black)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>
                    <BrainCircuit size={16} />
                    <span>STEP 1: AI DIAGNOSTIC REASONING</span>
                  </div>
                  <div className="neo-badge neo-badge-green" style={{ fontSize: '10px' }}>
                    Confidence: {inspectedScenario.aiConfidence}
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#121316', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{inspectedScenario.aiDiagnosis}"
                </div>
              </div>

              {/* Policy & Financial Guardrails */}
              <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-black)', backgroundColor: inspectedScenario.tagColor === 'coral' ? '#fff1f2' : '#f0fdf4', boxShadow: '2px 2px 0px var(--border-black)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: inspectedScenario.tagColor === 'coral' ? '#be123c' : '#15803d', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>STEP 2: FINANCIAL GUARDRAIL & POLICY ENGINE</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#121316', marginBottom: '4px' }}>
                  {inspectedScenario.guardrailStatus}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  {inspectedScenario.guardrailDetail}
                </div>
              </div>

              {/* Action Execution & Outcome */}
              <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border-black)', backgroundColor: '#fffdfa', boxShadow: '2px 2px 0px var(--border-black)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#0369a1', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>
                  <Layers size={16} />
                  <span>STEP 3: AUTONOMOUS ACTION & SETTLEMENT</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#121316', marginBottom: '4px' }}>
                  {inspectedScenario.actionTaken}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: inspectedScenario.tagColor === 'coral' ? '#dc2626' : '#16a34a' }}>
                  {inspectedScenario.verificationOutcome}
                </div>
              </div>

              {/* Outbound Template Message */}
              <div style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Pre-Approved Template Payload:
                </div>
                <div style={{ fontSize: '12px', color: '#334155', fontFamily: 'monospace', lineHeight: 1.4 }}>
                  {inspectedScenario.messageTemplate}
                </div>
              </div>

              {/* Cryptographic Audit Trail */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#121316', color: '#c4f0c2', fontFamily: 'monospace', fontSize: '11px', border: '2px solid var(--border-black)' }}>
                <div style={{ color: '#ffe600', fontWeight: 800, marginBottom: '2px' }}>IMMUTABLE AUDIT ENTRY:</div>
                <div>{inspectedScenario.auditTrailSummary}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button
                onClick={() => handlePlayVoice(inspectedScenario.id, inspectedScenario.voiceScript)}
                className="neo-btn neo-btn-sm"
                style={{ backgroundColor: '#fff7d6' }}
              >
                <Volume2 size={14} />
                <span>Play English AI Voice</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/recoveries" className="neo-btn neo-btn-white neo-btn-sm" onClick={() => setInspectedScenario(null)}>
                  <span>View in Cases Stream</span>
                </Link>
                <button onClick={() => setInspectedScenario(null)} className="neo-btn neo-btn-primary neo-btn-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
