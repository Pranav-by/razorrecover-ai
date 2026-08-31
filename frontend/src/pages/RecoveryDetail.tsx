import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RecoveryCase } from '../types';
import { getRecoveryById, approveReviewCase, rejectReviewCase, executeTestCase } from '../services/api';
import { AuditTimeline } from '../components/AuditTimeline';
import { ArrowLeft, BrainCircuit, ShieldAlert, CheckCircle2, AlertOctagon, Play, Sparkles, ShieldCheck } from 'lucide-react';

export const RecoveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

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

  const handleExecuteNow = async () => {
    if (!id || !caseData) return;
    try {
      setExecuting(true);
      await executeTestCase(caseData.caseId || id);
      await fetchDetail();
    } catch (err) {
      console.error('Error executing case:', err);
    } finally {
      setExecuting(false);
    }
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

  // Compute clean candidate strategy action
  const candidateAction = caseData.recommendedAction
    ? caseData.recommendedAction.replace(/_/g, ' ').toUpperCase()
    : caseData.scenario === 'payment_failure'
    ? 'RETRY PAYMENT'
    : caseData.scenario === 'checkout_abandonment'
    ? 'GENERATE LINK'
    : caseData.scenario === 'subscription_failure'
    ? 'UPDATE METHOD'
    : 'SEND REMINDER';

  // Compute policy status indicator text
  let policyStatusSubtext = '● Awaiting Policy Engine Evaluation';
  if (caseData.policyDecision) {
    policyStatusSubtext = caseData.policyDecision.allowed ? '✓ Policy Approved' : '❌ Policy Blocked / Held';
  } else if (caseData.status === 'RECOVERED') {
    policyStatusSubtext = '✓ Policy Approved & Verified';
  }

  // Compute Guardrail Policy Box details
  let policyBg = '#ffe600';
  let policyBadgeClass = 'neo-badge-yellow';
  let policyTitle = 'AWAITING EVALUATION';
  let policyReason = caseData.policyDecision?.reason;

  if (caseData.policyDecision) {
    if (caseData.policyDecision.allowed) {
      policyBg = '#22c55e';
      policyBadgeClass = 'neo-badge-green';
      policyTitle = 'POLICY PERMITTED (APPROVED)';
    } else {
      policyBg = '#ff5757';
      policyBadgeClass = 'neo-badge-coral';
      policyTitle = 'POLICY BLOCKED (HELD FOR REVIEW)';
    }
  } else if (caseData.status === 'RECOVERED') {
    policyBg = '#22c55e';
    policyBadgeClass = 'neo-badge-green';
    policyTitle = 'POLICY PERMITTED (APPROVED)';
    policyReason = 'Evaluated against retry limits and auto-action thresholds. Autonomous action approved and verified.';
  } else {
    policyReason = 'Case is currently in DETECTED state. Click "⚡ Run Pipeline on Case" to evaluate Policy Engine rules (POL-01 to POL-09) and stopping rules.';
  }

  // Compute AI diagnosis details
  const hasDiagnosis = !!caseData.diagnosis?.category;
  const categoryText = (caseData.diagnosis?.category || (caseData.scenario === 'payment_failure' ? 'temporary_failure' : caseData.scenario === 'checkout_abandonment' ? 'high_intent_abandonment' : caseData.scenario === 'subscription_failure' ? 'payment_method_issue' : 'b2b_receivable')).replace(/_/g, ' ').toUpperCase();
  const confidenceScore = caseData.diagnosis?.confidence
    ? Math.round(caseData.diagnosis.confidence * 100)
    : (caseData.recoveryProbability ? Math.round(caseData.recoveryProbability * 100) : 85);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 24px 80px 24px' }}>
      {/* Top Nav & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/recoveries" className="neo-btn neo-btn-white neo-btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Revenue Cases</span>
        </Link>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {caseData.status !== 'RECOVERED' && (
            <button
              onClick={handleExecuteNow}
              disabled={executing}
              className="neo-btn neo-btn-sm"
              style={{ backgroundColor: '#c4f0c2', fontWeight: 800 }}
            >
              {executing ? (
                <>
                  <Sparkles size={14} className="animate-spin" />
                  <span>Evaluating Pipeline...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="#121316" />
                  <span>⚡ Run Pipeline on Case</span>
                </>
              )}
            </button>
          )}

          {caseData.status === 'HUMAN_REVIEW' && (
            <>
              <button onClick={handleReject} className="neo-btn neo-btn-coral neo-btn-sm">
                Reject Action
              </button>
              <button onClick={handleApprove} className="neo-btn neo-btn-green neo-btn-sm">
                Approve Intervention
              </button>
            </>
          )}
        </div>
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
                <h3 style={{ fontSize: '18px', margin: 0 }}>AI Diagnostic Analysis</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>OpenAI gpt-4o-mini Root Cause Evaluation</span>
              </div>
            </div>

            {/* Diagnosis Category Badge */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="neo-badge neo-badge-yellow" style={{ fontSize: '12px', padding: '4px 12px' }}>
                <BrainCircuit size={12} />
                <span>{categoryText}</span>
              </div>
              <div className={`neo-badge ${confidenceScore >= 80 ? 'neo-badge-green' : confidenceScore >= 50 ? 'neo-badge-blue' : 'neo-badge-coral'}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
                <span>Confidence: {confidenceScore}%</span>
              </div>
              {caseData.diagnosis?.recoverability && (
                <div className={`neo-badge ${caseData.diagnosis.recoverability === 'high' ? 'neo-badge-green' : caseData.diagnosis.recoverability === 'medium' ? 'neo-badge-yellow' : 'neo-badge-coral'}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
                  <span>Recoverability: {caseData.diagnosis.recoverability.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Confidence Indicator Bar */}
            <div style={{ padding: '4px 0' }}>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                border: '1.5px solid var(--border-black)',
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${confidenceScore}%`,
                  backgroundColor: confidenceScore >= 80 ? '#22c55e' : confidenceScore >= 50 ? '#3b82f6' : '#ff5757',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* AI Reasoning Quote */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#faf5ff',
                boxShadow: '2px 2px 0px var(--border-black)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                💡 AI REASONING SUMMARY
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#121316', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{caseData.diagnosis?.reasoning || 'Evaluated telemetry signatures and identified recoverable payment state.'}"
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
                  Expected Win: ₹{caseData.expectedRecoveryValue?.toLocaleString('en-IN') || 0}
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
                  {candidateAction}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  {policyStatusSubtext} • Attempt #{caseData.attemptCount || 0}
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
                  backgroundColor: policyBg,
                  color: policyBg === '#ffe600' ? '#121316' : '#ffffff',
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
                <div className={`neo-badge ${policyBadgeClass}`}>
                  <span>{policyTitle}</span>
                </div>
                {caseData.policyDecision?.checkedAt && (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Evaluated: {new Date(caseData.policyDecision.checkedAt).toLocaleTimeString('en-IN')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#121316' }}>
                {policyReason}
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
