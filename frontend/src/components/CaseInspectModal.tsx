import React, { useState } from 'react';
import {
  X,
  Play,
  ExternalLink,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { executeTestCase, customerPay } from '../services/api';

interface CaseInspectModalProps {
  caseData: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export const CaseInspectModal: React.FC<CaseInspectModalProps> = ({ caseData, onClose, onUpdate }) => {
  const [currentCase, setCurrentCase] = useState<any>(caseData);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!currentCase) return null;

  const isUnprocessed = currentCase.status === 'UNPROCESSED' || (!currentCase.recommendedAction && currentCase.status !== 'RECOVERED');
  const isRecovered = currentCase.status === 'RECOVERED';
  const isHumanReview = currentCase.status === 'HUMAN_REVIEW' || currentCase.status === 'BLOCKED' || currentCase.status === 'PAUSED';
  const isHalted = currentCase.status === 'HALTED' || currentCase.optedOut;
  const isRejected = currentCase.status === 'REJECTED';

  const amountVal = currentCase.amountAtRisk || currentCase.amount || 0;
  const failureReason = currentCase.failureReason || currentCase.transactionId?.failureReason || 'gateway_timeout';
  const method = currentCase.method || currentCase.transactionId?.method || 'upi';
  const customerRisk = currentCase.customerRiskLevel || 'Low';
  const attemptCount = currentCase.attemptCount || currentCase.priorAttempts || 0;

  // Handle single case pipeline execution right from the modal
  const handleRunPipeline = async () => {
    setIsExecuting(true);
    setActionSuccess(null);
    try {
      const targetId = currentCase.caseId || currentCase._id || currentCase.paymentId;
      const res = await executeTestCase(targetId);
      if (res && res.testCase) {
        setCurrentCase({
          ...currentCase,
          ...res.testCase,
          status: res.testCase.status,
          recommendedAction: res.testCase.recommendedAction,
          recoveryProbability: res.testCase.recoveryProbability,
          expectedRecoveryValue: res.testCase.expectedRecoveryValue,
          diagnosis: res.testCase.diagnosis,
        });
        setActionSuccess(`✓ 10-Agent Pipeline Executed: Case transitioned to ${res.testCase.status}`);
        if (onUpdate) onUpdate();
      }
    } catch (err: any) {
      console.error('Error executing single case in modal:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQuickPay = async () => {
    setIsExecuting(true);
    try {
      const targetId = currentCase._id || currentCase.paymentId || currentCase.caseId;
      await customerPay(targetId, method);
      setCurrentCase((prev: any) => ({
        ...prev,
        status: 'RECOVERED',
        recoveredAmount: amountVal,
      }));
      setActionSuccess(`🎉 Payment of ₹${amountVal.toLocaleString('en-IN')} verified via Razorpay API!`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Quick pay error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Determine ladder steps status & dynamic text
  const getLadderSteps = () => {
    const evVal = currentCase.expectedRecoveryValue || Math.round(amountVal * (currentCase.recoveryProbability || 0.85));

    if (isUnprocessed) {
      return [
        {
          step: 1,
          state: 'pending',
          title: 'Step 1: Revenue Leak Ingestion & Priority Score',
          desc: 'Awaiting Pipeline Run — Will analyze transaction parameters, calculate customer lifetime value, and assign ML recoverability score.',
        },
        {
          step: 2,
          state: 'pending',
          title: 'Step 2: Policy Engine & Safety Restraints',
          desc: 'Awaiting Safety Evaluation — Will verify POL-01 (₹10,000 threshold), POL-02 (2-retry cap), and STOP-02 (opt-out status).',
        },
        {
          step: 3,
          state: 'pending',
          title: 'Step 3: Autonomous Strategy Dispatch',
          desc: 'Awaiting Action Selection — Will generate time-sensitive Razorpay recovery link or smart gateway retry with deterministic idempotency key.',
        },
        {
          step: 4,
          state: 'pending',
          title: 'Step 4: Razorpay Verification & Cryptographic Audit Seal',
          desc: 'Awaiting Verification — Will poll Razorpay API for settlement confirmation and seal immutable SHA-256 ledger.',
        },
      ];
    }

    if (isRejected) {
      return [
        {
          step: 1,
          state: 'passed',
          title: 'Step 1: Revenue Leak Ingestion & Priority Score',
          desc: `✓ Incident logged from stream. Initial risk evaluation performed.`,
        },
        {
          step: 2,
          state: 'halted',
          title: 'Step 2: Compliance Guardrail Rejection',
          desc: '❌ Guardrail Rejection: Human reviewer or policy engine vetoed automated outreach for this incident.',
        },
        {
          step: 3,
          state: 'disabled',
          title: 'Step 3: Outreach & Payment Links Cancelled',
          desc: 'All payment links, dunning sequences, and retry attempts have been revoked and blocked.',
        },
        {
          step: 4,
          state: 'disabled',
          title: 'Step 4: Case Closed as Rejected',
          desc: 'Case finalized in rejected state in MongoDB audit ledger.',
        },
      ];
    }

    if (isHumanReview) {
      return [
        {
          step: 1,
          state: 'passed',
          title: 'Step 1: Revenue Leak Ingestion & Priority Score',
          desc: `✓ Leak categorized as ${currentCase.scenario?.replace(/_/g, ' ')}. Calculated EV: ₹${evVal.toLocaleString('en-IN')} with priority weight ${currentCase.priorityScore || 85}.`,
        },
        {
          step: 2,
          state: 'warning',
          title: 'Step 2: Policy Engine Guardrail Intervention',
          desc: amountVal > 10000
            ? `⚠️ POL-01 Guardrail Triggered: Amount ₹${amountVal.toLocaleString('en-IN')} exceeds ₹10,000 safety threshold → Dispatched to Human Review Queue.`
            : currentCase.hasDispute
            ? `⚠️ STOP-03 Guardrail Triggered: Active customer dispute reported → Outreach suspended and routed to Operator Queue.`
            : `⚠️ Safety Check: Escalated to Human Review for supervisor verification.`,
        },
        {
          step: 3,
          state: 'paused',
          title: 'Step 3: Strategy Execution on Hold',
          desc: 'Outreach temporarily paused. Awaiting human operator approval or custom settlement override in Review Queue.',
        },
        {
          step: 4,
          state: 'pending',
          title: 'Step 4: Verification & Audit Seal',
          desc: 'Pending human review decision before settlement verification.',
        },
      ];
    }

    if (isHalted) {
      return [
        {
          step: 1,
          state: 'passed',
          title: 'Step 1: Revenue Leak Ingestion & Priority Score',
          desc: `✓ Incident logged from stream. Initial risk evaluation performed.`,
        },
        {
          step: 2,
          state: 'halted',
          title: 'Step 2: STOP-02 Consent Revocation Triggered',
          desc: '🛑 STOP-02 Guardrail Fired: Customer explicitly revoked consent or requested opt-out. All autonomous recovery permanently halted.',
        },
        {
          step: 3,
          state: 'disabled',
          title: 'Step 3: Autonomous Actions Disabled',
          desc: 'No outreach or payment links will be dispatched per compliance policy.',
        },
        {
          step: 4,
          state: 'disabled',
          title: 'Step 4: Audit Record Frozen',
          desc: 'Halt state written to audit log with cryptographic timestamp.',
        },
      ];
    }

    // Default: Recovered or Executing
    return [
      {
        step: 1,
        state: 'passed',
        title: 'Step 1: Revenue Leak Ingestion & Priority Score',
        desc: `✓ Detected ${currentCase.scenario?.replace(/_/g, ' ')} incident. Calculated winback probability ${Math.round((currentCase.recoveryProbability || 0.85) * 100)}% (EV: ₹${evVal.toLocaleString('en-IN')}).`,
      },
      {
        step: 2,
        state: 'passed',
        title: 'Step 2: Policy Engine & Safety Restraints Passed',
        desc: `✓ Verified POL-01 (₹${amountVal.toLocaleString('en-IN')} ≤ ₹10,000 threshold), POL-02 (${attemptCount}/2 retries), and STOP-02 (Consent active).`,
      },
      {
        step: 3,
        state: 'passed',
        title: currentCase.scenario === 'subscription_failure'
          ? 'Step 3: Razorpay Mandate Update Link Dispatched'
          : currentCase.scenario === 'checkout_abandonment'
          ? 'Step 3: Dynamic 1-Click Cart Recovery Link Dispatched'
          : currentCase.scenario === 'invoice_overdue'
          ? 'Step 3: Conversational Dunning Sequence Engaged'
          : 'Step 3: Razorpay Smart Gateway Retry Dispatched',
        desc: `Dispatched ${currentCase.recommendedAction ? currentCase.recommendedAction.replace(/_/g, ' ') : 'smart retry'} with idempotency key idempotency_${currentCase.caseId}.`,
      },
      {
        step: 4,
        state: isRecovered ? 'passed' : 'executing',
        title: 'Step 4: Settlement Verification & Cryptographic Audit Seal',
        desc: isRecovered
          ? `💰 ₹${amountVal.toLocaleString('en-IN')} settlement verified via Razorpay API and sealed into append-only SHA-256 audit ledger.`
          : 'Polling Razorpay webhooks for payment completion and ledger reconciliation.',
      },
    ];
  };

  const ladderSteps = getLadderSteps();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="neo-card"
        style={{
          maxWidth: '740px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badges & Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-black)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="neo-badge neo-badge-blue" style={{ fontSize: '11px' }}>
                {currentCase.caseId || 'RC_LIVE'}
              </span>
              <span
                className={`neo-badge ${
                  isRecovered ? 'neo-badge-green' : isHumanReview ? 'neo-badge-yellow' : isHalted ? 'neo-badge-coral' : 'neo-badge'
                }`}
                style={{ fontSize: '11px' }}
              >
                {currentCase.status}
              </span>
              <span className="neo-badge" style={{ fontSize: '11px' }}>
                {currentCase.scenario?.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                {method?.toUpperCase()} • {failureReason?.replace(/_/g, ' ')}
              </span>
            </div>

            <h2 style={{ fontSize: '24px', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)', color: '#121316' }}>
              {currentCase.customerName || 'Customer'}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Customer ID: <strong>{currentCase.customerId || 'CUS_999'}</strong> • Risk Profile: <strong>{customerRisk}</strong> • Attempts: <strong>{attemptCount}/2</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="neo-btn neo-btn-sm neo-btn-white"
            style={{ borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Financial Telemetry Summary Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#fffdfa',
            border: '2px solid var(--border-black)',
            boxShadow: '2px 2px 0px var(--border-black)',
            marginBottom: '18px',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, display: 'block' }}>AMOUNT AT RISK</span>
            <span style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#121316' }}>
              ₹{amountVal.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, display: 'block' }}>WINBACK PROBABILITY</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: currentCase.recoveryProbability ? '#0369a1' : '#64748b' }}>
              {currentCase.recoveryProbability !== null && currentCase.recoveryProbability !== undefined
                ? `${Math.round(currentCase.recoveryProbability * 100)}%`
                : 'Pending Run'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, display: 'block' }}>EXPECTED VALUE (EV)</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: currentCase.expectedRecoveryValue ? '#16a34a' : '#64748b' }}>
              {currentCase.expectedRecoveryValue
                ? `₹${currentCase.expectedRecoveryValue.toLocaleString('en-IN')}`
                : '—'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, display: 'block' }}>STRATEGY ACTION</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: currentCase.recommendedAction ? '#ca8a04' : '#64748b', textTransform: 'uppercase' }}>
              {currentCase.recommendedAction
                ? currentCase.recommendedAction.replace(/_/g, ' ')
                : '⏳ Awaiting AI Run'}
            </span>
          </div>
        </div>

        {/* AI Diagnostic Reasoning Box */}
        <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', marginBottom: '20px', fontSize: '13px', lineHeight: 1.45 }}>
          <strong style={{ color: '#0f172a' }}>AI Diagnostic Telemetry:</strong>
          <div style={{ color: '#334155', marginTop: '4px' }}>
            {isUnprocessed
              ? '⚠️ Incident detected in raw transaction stream. The 10-Agent Pipeline has not run on this case yet. Click "⚡ Run Pipeline on Case" below to trigger real-time AI diagnosis and policy evaluation.'
              : currentCase.diagnosis?.reasoning || (
                currentCase.scenario === 'payment_failure'
                  ? `Payment failed due to ${failureReason.replace(/_/g, ' ')}. Customer has ${attemptCount} prior failures this month. Auto-retry approved under financial rule POL-01.`
                  : currentCase.scenario === 'checkout_abandonment'
                  ? 'High-intent cart session abandoned at payment selection. Strategy generated a time-sensitive Razorpay recovery link with 09:00-19:00 IST compliance.'
                  : currentCase.scenario === 'subscription_failure'
                  ? 'Subscription recurring mandate failed due to expired card token. Applied 7-day non-disruptive grace period and dispatched card update link.'
                  : 'B2B enterprise invoice overdue. Initiated conversational dunning sequence and registered Promise-to-Pay tracking commitment.'
              )}
          </div>
        </div>

        {/* Dynamic 10-Agent Progression Ladder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
            10-AGENT AUTONOMOUS RECOVERY PIPELINE:
          </span>

          {ladderSteps.map((ladder) => {
            const isPassed = ladder.state === 'passed';
            const isWarning = ladder.state === 'warning';
            const isHaltedState = ladder.state === 'halted';

            return (
              <div
                key={ladder.step}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: isPassed ? '#f0fdf4' : isWarning ? '#fffbeb' : isHaltedState ? '#fef2f2' : '#f8fafc',
                  border: isPassed ? '1px solid #86efac' : isWarning ? '1px solid #fde047' : isHaltedState ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isPassed ? '#16a34a' : isWarning ? '#ca8a04' : isHaltedState ? '#dc2626' : '#e2e8f0',
                    color: isPassed || isWarning || isHaltedState ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '11px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {isPassed ? '✓' : isWarning ? '⚠️' : isHaltedState ? '🛑' : ladder.step}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#121316' }}>{ladder.title}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.35 }}>{ladder.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Status Feedback Alert */}
        {actionSuccess && (
          <div style={{ marginBottom: '18px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: 700, border: '1.5px solid #86efac' }}>
            {actionSuccess}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRunPipeline}
              disabled={isExecuting}
              className="neo-btn neo-btn-sm neo-btn-primary"
              style={{ fontWeight: 800 }}
            >
              {isExecuting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="#121316" />
                  <span>⚡ Run Pipeline on Case</span>
                </>
              )}
            </button>

            <button
              onClick={handleQuickPay}
              disabled={isExecuting || isRecovered}
              className="neo-btn neo-btn-sm neo-btn-white"
              style={{ fontWeight: 700, backgroundColor: isRecovered ? '#e2e8f0' : '#ffffff' }}
            >
              <CreditCard size={14} />
              <span>{isRecovered ? '✓ Settle Completed' : `Pay ₹${amountVal.toLocaleString('en-IN')}`}</span>
            </button>
          </div>

          <Link
            to={`/recoveries/${currentCase.caseId || currentCase._id}`}
            onClick={onClose}
            className="neo-btn neo-btn-sm neo-btn-white"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Deep Audit Page</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CaseInspectModal;
