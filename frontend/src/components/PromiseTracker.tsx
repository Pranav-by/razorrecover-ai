import React from 'react';
import { Calendar, CheckCircle2, Clock, DollarSign, Building, AlertCircle, ArrowUpRight } from 'lucide-react';
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
  }
];

export const PromiseTracker: React.FC = () => {
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
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: isSettled ? '#f0fdf4' : '#fffdfa',
                boxShadow: '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#121316' }}>{item.companyName}</div>
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
    </div>
  );
};
