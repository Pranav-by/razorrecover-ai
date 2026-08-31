import React, { useState } from 'react';
import { Play, Volume2, VolumeX, CheckCircle, ShieldAlert, Clock, ArrowRight, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScenarioDemo {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: 'green' | 'yellow' | 'coral' | 'blue';
  amount: string;
  customer: string;
  riskReason: string;
  expectedOutcome?: string;
  agentDecision: string;
  caseId: string;
  hinglishScript?: string;
}

const DEMO_SCENARIOS: ScenarioDemo[] = [
  {
    id: 'pay_demo_001',
    title: '1. Transient Payment Degradation (UPI Timeout)',
    subtitle: 'High-probability temporary network glitch during checkout authorization',
    tag: 'Auto-Recovered',
    tagColor: 'green',
    amount: '₹6,999',
    customer: 'Rahul Sharma (CUS_101)',
    riskReason: 'UPI gateway bank timeout during peak load (91% winback probability)',
    agentDecision: 'Strategy: retry_payment → Policy: Passed (₹6,999 ≤ ₹10k) → Verified Won Back',
    caseId: 'RC_0001',
    hinglishScript: 'Namaste Rahul ji, aapka Wireless Headphones ke liye ₹6,999 ka UPI payment gateway timeout ki wajah se pause ho gaya tha. RazorRecover AI ne transaction verify karke payment successfully complete kar diya hai. Dhanyawad!'
  },
  {
    id: 'pay_demo_002',
    title: '2. High-Intent Checkout Drop-off',
    subtitle: 'Customer reached final checkout step with items in basket then abandoned',
    tag: 'Cart Won Back',
    tagColor: 'green',
    amount: '₹12,999',
    customer: 'Neha Singh (CUS_104)',
    riskReason: 'Payment page opened → customer left without completing payment',
    agentDecision: 'Strategy: generate_link → Compliance: Passed (IST 11:30) → Link Converted',
    caseId: 'RC_0002',
    hinglishScript: 'Hi Neha, aapke Smart Watch Pro ka cart save kar liya gaya hai! ₹12,999 ka special 1-click payment link aapke SMS aur email pe bhej diya gaya hai.'
  },
  {
    id: 'pay_demo_003',
    title: '3. Failed Recurring Subscription (Expired Card)',
    subtitle: 'SaaS recurring billing failed due to expired card on file',
    tag: 'Method Updated',
    tagColor: 'green',
    amount: '₹999 / mo',
    customer: 'Priya Patel (CUS_102)',
    riskReason: 'Card token expired on recurring mandate cycle',
    agentDecision: 'Strategy: update_method → 7-day grace window applied → Mandate restored',
    caseId: 'RC_0003',
    hinglishScript: 'Namaste Priya ji, aapke Pro Monthly Subscription ka card expire ho gaya hai. Aapki service 7 dino tak chalu rahegi. Kripya niche diye gaye link se apna card update karein.'
  },
  {
    id: 'pay_demo_004',
    title: '4. B2B Receivables Chaser & Promise-to-Pay',
    subtitle: 'Overdue commercial invoice with smart escalation and payment commitment',
    tag: 'Promise Tracked',
    tagColor: 'blue',
    amount: '₹2,50,000',
    customer: 'TechStar Solutions Pvt Ltd (CUS_201)',
    riskReason: 'Invoice overdue by 6 days on Q3 Cloud Infrastructure Contract',
    agentDecision: 'Strategy: send_reminder → Dynamic payment terms → Promise to Pay logged for Sept 2',
    caseId: 'RC_0004',
    hinglishScript: 'Hello TechStar Accounts Team, invoice inv_demo_004 for ₹2,50,000 is overdue. We have logged your commitment for payment on Sept 2nd. Instant settlement link attached.'
  },
  {
    id: 'pay_demo_005',
    title: '5. Policy Guardrail Safety Block (Restraint)',
    subtitle: 'High-value transaction exceeding ₹10,000 auto limit + 3 prior retries',
    tag: 'Policy Blocked',
    tagColor: 'coral',
    amount: '₹50,000',
    customer: 'Ananya Gupta (CUS_106)',
    riskReason: 'Card declined + 3 prior retries + ₹50,000 exceeds ₹10,000 autonomous threshold',
    agentDecision: 'AI wanted retry → Policy Engine BLOCKED (Rule POL-02 & POL-05) → Routed to Human Review',
    caseId: 'RC_0005'
  },
  {
    id: 'pay_demo_optout',
    title: '6. Hard Stopping Rule (Customer Opt-Out)',
    subtitle: 'Customer explicitly unsubscribed from recovery outreach',
    tag: 'Permanently Halted',
    tagColor: 'coral',
    amount: '₹3,500',
    customer: 'Suresh Iyer (CUS_301)',
    riskReason: 'Customer opted out of contact channel',
    agentDecision: 'Stopping Rules check executed FIRST → Halted (Rule STOP-02) → 0 messages sent',
    caseId: 'RC_0006'
  }
];

export const DemoSandbox: React.FC = () => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handlePlayVoice = (id: string, text?: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (playingVoiceId === id) {
        setPlayingVoiceId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
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
            Inspect how the multi-agent pipeline balances aggressive autonomous winbacks with strict guardrail restraint
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
                  <div><strong>Customer:</strong> {scenario.customer}</div>
                  <div><strong>Risk Signature:</strong> {scenario.riskReason}</div>
                  <div style={{ color: scenario.tagColor === 'coral' ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    <strong>Pipeline Action:</strong> {scenario.agentDecision}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                {scenario.hinglishScript && (
                  <button
                    onClick={() => handlePlayVoice(scenario.id, scenario.hinglishScript)}
                    className="neo-btn neo-btn-sm"
                    style={{
                      backgroundColor: isPlaying ? '#ff5757' : '#fff7d6',
                      fontWeight: 700,
                      flex: 1,
                    }}
                    title="Play Hinglish Voice Recovery AI Simulation"
                  >
                    {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    <span>{isPlaying ? 'Stop Voice' : '🔊 Hinglish AI Voice'}</span>
                  </button>
                )}

                <Link
                  to={`/recoveries`}
                  className="neo-btn neo-btn-white neo-btn-sm"
                  style={{ flex: scenario.hinglishScript ? 'initial' : 1, textAlign: 'center' }}
                >
                  <span>Inspect</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
