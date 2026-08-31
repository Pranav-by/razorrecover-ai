import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RecoveryCase } from '../types';
import { getRecoveryById, approveReviewCase, rejectReviewCase } from '../services/api';
import { AuditTimeline } from '../components/AuditTimeline';
import { ArrowLeft, BrainCircuit, ShieldAlert, CheckCircle2, AlertOctagon, Star } from 'lucide-react';

export const RecoveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getRecoveryById(id);
      setCaseData(data);
    } catch (err) {
      console.error('Error fetching case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    await approveReviewCase(id);
    fetchDetail();
  };

  const handleReject = async () => {
    if (!id) return;
    await rejectReviewCase(id, 'Rejected manually from case detail');
    fetchDetail();
  };

  if (loading || !caseData) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
        Loading recovery telemetry...
      </div>
    );
  }

  let statusBadgeClass = 'neo-badge-blue';
  if (caseData.status === 'RECOVERED') statusBadgeClass = 'neo-badge-green';
  else if (caseData.status === 'BLOCKED' || caseData.status === 'HALTED' || caseData.status === 'FAILED') statusBadgeClass = 'neo-badge-coral';
  else if (caseData.status === 'HUMAN_REVIEW' || caseData.status === 'PAUSED') statusBadgeClass = 'neo-badge-yellow';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 24px 80px 24px' }}>
      {/* Top Nav Link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/recoveries" className="neo-btn neo-btn-white neo-btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Revenue Cases</span>
        </Link>

        {caseData.status === 'HUMAN_REVIEW' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleReject} className="neo-btn neo-btn-coral neo-btn-sm">
              Reject Action
            </button>
            <button onClick={handleApprove} className="neo-btn neo-btn-green neo-btn-sm">
              Approve Intervention
            </button>
          </div>
        )}
      </div>

      {/* Case Header Card */}
      <div
        className="neo-card"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', margin: 0 }}>Case {caseData.caseId}</h1>
            <div className={`neo-badge ${statusBadgeClass}`}>
              <span>{caseData.status}</span>
            </div>
            {caseData.stoppingRule && (
              <div className="neo-badge neo-badge-coral">
                <AlertOctagon size={12} />
                <span>STOPPING RULE: {caseData.stoppingRule}</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Customer: <strong style={{ color: '#121316' }}>{caseData.customerName}</strong> ({caseData.customerId}) • Scenario: <strong style={{ color: '#121316' }}>{caseData.scenario.toUpperCase()}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b', textTransform: 'uppercase' }}>
            REVENUE AT RISK
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: 'var(--border-black)' }}>
            ₹{caseData.amountAtRisk.toLocaleString('en-IN')}
          </span>
          {caseData.recoveredAmount > 0 && (
            <div className="neo-badge neo-badge-green" style={{ marginTop: '4px' }}>
              <span>✓ Won Back: ₹{caseData.recoveredAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: AI Decision Panel & Guardrails */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Decision Panel */}
          <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-black)',
                  backgroundColor: '#a855f7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '2px 2px 0px var(--border-black)',
                }}
              >
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>AI Decision & Diagnostic Synthesis</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>OpenAI gpt-4o-mini Evaluation</span>
              </div>
            </div>

            {/* Diagnostic Reasoning Quote */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#fffdfa',
                boxShadow: '2px 2px 0px var(--border-black)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                ROOT CAUSE DIAGNOSIS
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#121316', lineHeight: 1.5 }}>
                {caseData.diagnosis?.reasoning || 'Evaluated telemetry signatures and identified recoverable payment state.'}
              </div>
            </div>

            {/* Metrics Split */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid var(--border-black)',
                  backgroundColor: '#fff7d6',
                  boxShadow: '2px 2px 0px var(--border-black)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
                  WINBACK PROBABILITY
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                  {Math.round((caseData.recoveryProbability || 0) * 100)}%
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  Expected Win: ₹{caseData.expectedRecoveryValue}
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px solid var(--border-black)',
                  backgroundColor: '#e0f2fe',
                  boxShadow: '2px 2px 0px var(--border-black)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
                  RECOMMENDED ACTION
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#0369a1' }}>
                  {caseData.recommendedAction?.replace(/_/g, ' ') || 'None'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  Autonomous Intervention
                </div>
              </div>
            </div>
          </div>

          {/* Deterministic Policy Guardrail Engine Decision */}
          <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-black)',
                  backgroundColor: caseData.policyDecision?.allowed ? '#22c55e' : '#ff5757',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '2px 2px 0px var(--border-black)',
                }}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Deterministic Guardrail Policy</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Financial limits & stopping rule evaluation
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#ffffff',
                boxShadow: '2px 2px 0px var(--border-black)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div className={`neo-badge ${caseData.policyDecision?.allowed ? 'neo-badge-green' : 'neo-badge-coral'}`}>
                  <span>{caseData.policyDecision?.allowed ? 'POLICY PERMITTED' : 'POLICY BLOCKED'}</span>
                </div>
                {caseData.policyDecision?.checkedAt && (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Evaluated: {new Date(caseData.policyDecision.checkedAt).toLocaleTimeString('en-IN')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#121316' }}>
                {caseData.policyDecision?.reason || 'Evaluated against retry limits and auto-action thresholds.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Audit Trail */}
        <AuditTimeline entries={caseData.auditTrail || []} />
      </div>
    </div>
  );
};
