import React, { useEffect, useState } from 'react';
import { RecoveryCase } from '../types';
import { getReviewQueue, approveReviewCase, rejectReviewCase } from '../services/api';
import { UserCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CaseInspectModal } from '../components/CaseInspectModal';

export const ReviewQueue: React.FC = () => {
  const [queueCases, setQueueCases] = useState<RecoveryCase[]>([]);
  const [inspectingCase, setInspectingCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getReviewQueue();
      setQueueCases(res.cases);
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    await approveReviewCase(id);
    fetchQueue();
  };

  const handleReject = async (id: string) => {
    await rejectReviewCase(id, 'Rejected by compliance reviewer');
    fetchQueue();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 24px 80px 24px' }}>
      {/* Header */}
      <div
        className="neo-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '2px solid var(--border-black)',
              backgroundColor: '#f97316',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--border-black)',
            }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Human Approval & Escalation Queue</h2>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Cases held by financial limits (₹10,000 threshold) or retry stopping caps
            </span>
          </div>
        </div>

        <div className="neo-badge neo-badge-yellow">
          <span>{queueCases.length} Requiring Sign-Off</span>
        </div>
      </div>

      {/* Queue Items */}
      {queueCases.length === 0 ? (
        <div className="neo-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Review Queue Clear!</h3>
          <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, margin: 0 }}>
            All autonomous interventions are executing within safe, verified guardrail limits.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {queueCases.map((item) => (
            <div
              key={item._id}
              className="neo-card"
              style={{
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Link to={`/recoveries/${item.caseId}`} style={{ color: '#121316', fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '18px', textDecoration: 'none' }}>
                    {item.caseId}
                  </Link>
                  <div className="neo-badge neo-badge-yellow">
                    <span>{item.status}</span>
                  </div>
                  {item.stoppingRule && (
                    <div className="neo-badge neo-badge-coral">
                      <span>STOP: {item.stoppingRule}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>CUSTOMER</div>
                    <Link
                      to={`/customer-portal?caseId=${item.caseId}&customerId=${item.customerId}`}
                      style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1', textDecoration: 'underline' }}
                      title={`Open Customer Portal for ${item.customerName}`}
                    >
                      {item.customerName} ↗
                    </Link>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>AMOUNT AT RISK</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                      ₹{item.amountAtRisk.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>RECOMMENDED ACTION</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1' }}>
                      {item.recommendedAction?.replace(/_/g, ' ') || 'None'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#fff7d6',
                    border: '1.5px solid var(--border-black)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  HOLD REASON: <strong style={{ color: '#dc2626' }}>{item.policyDecision?.reason || item.stoppingRule || 'Routed for human compliance sign-off'}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setInspectingCase(item)}
                  className="neo-btn neo-btn-white neo-btn-sm"
                  style={{ fontWeight: 800 }}
                  title="Inspect full case telemetry"
                >
                  ⚡ Inspect
                </button>
                <button onClick={() => handleReject(item.caseId)} className="neo-btn neo-btn-coral neo-btn-sm">
                  Reject Action
                </button>
                <button onClick={() => handleApprove(item.caseId)} className="neo-btn neo-btn-green neo-btn-sm">
                  Approve Intervention
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Global Reusable Quick-Inspect Modal ─── */}
      {inspectingCase && (
        <CaseInspectModal
          caseData={inspectingCase}
          onClose={() => setInspectingCase(null)}
          onUpdate={() => fetchQueue()}
        />
      )}
    </div>
  );
};
