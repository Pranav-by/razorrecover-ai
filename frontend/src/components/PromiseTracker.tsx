import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, DollarSign, Building, AlertCircle, ArrowUpRight, Sparkles, Send, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromiseEntry {
  id: string;
  customerName: string;
  companyName: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  promisedDate: string;
  confidence: number;
  status: 'COMMITTED' | 'SETTLED' | 'FOLLOW_UP_REQUIRED';
  dunningStep: number;
  caseId?: string;
  notes?: string;
}

const PROMISES: PromiseEntry[] = [
  {
    id: 'ptp_001',
    customerName: 'Sanjay Deshmukh',
    companyName: 'TechStar Solutions Pvt Ltd',
    invoiceId: 'inv_demo_004',
    amount: 250000,
    dueDate: '2026-08-25',
    promisedDate: '2026-09-02',
    confidence: 0.92,
    status: 'COMMITTED',
    dunningStep: 2,
    caseId: 'RC_0004',
    notes: 'Finance Director confirmed payout batch scheduled for September 2nd after Q3 budget clearance.'
  },
  {
    id: 'ptp_002',
    customerName: 'Ananya Roy',
    companyName: 'CloudNine Services',
    invoiceId: 'inv_102',
    amount: 180000,
    dueDate: '2026-08-28',
    promisedDate: '2026-09-04',
    confidence: 0.85,
    status: 'COMMITTED',
    dunningStep: 1,
    caseId: 'RC_0005',
    notes: 'Friendly dunning reminder acknowledged. Accounts team scheduled clearance for September 4th.'
  },
  {
    id: 'ptp_003',
    customerName: 'Vikas Malhotra',
    companyName: 'Digital Dynamics Inc',
    invoiceId: 'inv_103',
    amount: 60000,
    dueDate: '2026-08-20',
    promisedDate: '2026-08-30',
    confidence: 0.95,
    status: 'SETTLED',
    dunningStep: 3,
    caseId: 'RC_0006',
    notes: '₹60,000 cleared via Razorpay Smart Collect Virtual Account and reconciled.'
  }
];

export const PromiseTracker: React.FC = () => {
  const [selectedPromise, setSelectedPromise] = useState<PromiseEntry | null>(null);
  const [sentAction, setSentAction] = useState<string | null>(null);

  const handleSimulateAction = (actionName: string) => {
    setSentAction(actionName);
    setTimeout(() => {
      setSentAction(null);
    }, 2500);
  };

  return (
    <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div className="neo-badge neo-badge-blue" style={{ fontSize: '11px', padding: '2px 8px' }}>
              <Calendar size={12} />
              <span>Track 03 Feature</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>B2B Receivables Chaser</span>
          </div>
          <h3 style={{ fontSize: '18px', margin: 0 }}>Active Promise-to-Pay Commitments</h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Click any card to inspect commercial invoice timeline & automated dunning actions
          </span>
        </div>

        <div className="neo-badge neo-badge-yellow">
          <span>₹4.90L Committed Capital</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {PROMISES.map((item) => {
          const isSettled = item.status === 'SETTLED';
          return (
            <div
              key={item.id}
              onClick={() => setSelectedPromise(item)}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: isSettled ? '#f0fdf4' : '#fffdfa',
                boxShadow: '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#121316', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{item.companyName}</span>
                    <ArrowUpRight size={14} color="#64748b" />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.invoiceId} • {item.customerName}</div>
                </div>
                <div className={`neo-badge ${isSettled ? 'neo-badge-green' : 'neo-badge-blue'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {item.status}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: 'var(--border-black)' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                  {Math.round(item.confidence * 100)}% Confidence
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#475569', backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Clock size={12} color="#64748b" />
                  <span><strong>Promised Date:</strong> {item.promisedDate}</span>
                </div>
                <div><strong>Dunning Ladder:</strong> Step {item.dunningStep} of 3 (Auto Sequence)</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Interactive B2B Invoice & Dunning Modal ─── */}
      {selectedPromise && (
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
          onClick={() => setSelectedPromise(null)}
        >
          <div
            className="neo-card"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building size={18} color="#0284c7" />
                  <span className="neo-badge neo-badge-blue" style={{ fontSize: '11px' }}>
                    {selectedPromise.invoiceId}
                  </span>
                  <span className={`neo-badge ${selectedPromise.status === 'SETTLED' ? 'neo-badge-green' : 'neo-badge-yellow'}`} style={{ fontSize: '11px' }}>
                    {selectedPromise.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '22px', margin: 0 }}>{selectedPromise.companyName}</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Finance Contact: {selectedPromise.customerName} • Due Date: {selectedPromise.dueDate}
                </span>
              </div>

              <button onClick={() => setSelectedPromise(null)} className="neo-btn neo-btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Financial Summary Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#fffdfa',
                border: '2px solid var(--border-black)',
                boxShadow: '2px 2px 0px var(--border-black)',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>INVOICE AMOUNT</span>
                <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                  ₹{selectedPromise.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>PROMISED SETTLEMENT</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>
                  {selectedPromise.promisedDate}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>PAYMENT CONFIDENCE</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>
                  {Math.round(selectedPromise.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Notes */}
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '13px', lineHeight: 1.4 }}>
              <strong>AI Conversation & Commitment Notes:</strong>
              <div style={{ color: '#334155', marginTop: '4px' }}>{selectedPromise.notes}</div>
            </div>

            {/* 3-Step Automated Dunning Ladder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
                AUTOMATED DUNNING LADDER PROGRESSION:
              </span>

              {[
                { step: 1, title: 'Step 1: Friendly Invoice Re-Delivery', desc: 'Dispatched automated GST e-invoice with 1-click Razorpay payment link.' },
                { step: 2, title: 'Step 2: Finance Manager Follow-Up & Commitment', desc: 'Secure promise-to-pay commitment date and lock follow-up quiet period.' },
                { step: 3, title: 'Step 3: Executive Escalation & Account Lock Warning', desc: 'Trigger high-priority executive alert if promised date is breached.' },
              ].map((ladder) => {
                const isPassed = selectedPromise.dunningStep >= ladder.step;
                const isCurrent = selectedPromise.dunningStep === ladder.step;

                return (
                  <div
                    key={ladder.step}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isCurrent ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: isPassed ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isPassed ? '#16a34a' : '#cbd5e1',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {isPassed ? '✓' : ladder.step}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#121316' }}>{ladder.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{ladder.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleSimulateAction('Dispatched Razorpay Smart Collect Link')}
                  className="neo-btn neo-btn-sm neo-btn-primary"
                >
                  <Send size={14} />
                  <span>Send Razorpay Payment Link</span>
                </button>

                <button
                  onClick={() => handleSimulateAction('Recorded Extension Request (+3 Days)')}
                  className="neo-btn neo-btn-sm neo-btn-white"
                >
                  <Clock size={14} />
                  <span>Extend Promise Date (+3d)</span>
                </button>
              </div>

              <Link
                to={`/recoveries`}
                onClick={() => setSelectedPromise(null)}
                className="neo-btn neo-btn-sm neo-btn-white"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View in Recoveries</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            {sentAction && (
              <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 700, border: '1px solid #86efac' }}>
                ✓ {sentAction}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
