import React from 'react';
import { RefreshCw, CheckCircle2, Sparkles, BrainCircuit, ShieldAlert, Zap, Lock } from 'lucide-react';
import { DashboardSummary, BatchRun, RevenueBreakdown } from '../types';

interface AgentStep {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'warning';
  detail: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
}

interface AgentActivityProps {
  isRunning: boolean;
  summary?: DashboardSummary;
  latestBatch?: BatchRun | null;
  breakdown?: RevenueBreakdown[];
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  isRunning,
  summary,
  latestBatch,
  breakdown,
}) => {
  const totalIncidents = summary?.totalCases || latestBatch?.casesScanned || 181;
  const totalRisk = summary?.revenueAtRisk || latestBatch?.totalRevenueAtRisk || 0;
  const recoveredAmt = summary?.revenueRecovered || latestBatch?.verifiedRecoveredAmount || 0;
  const recoveryRate = summary?.recoveryRate || latestBatch?.recoveryRatePercent || 0;
  const reviewCount = summary?.humanReviews || latestBatch?.humanReviewRequired || 0;
  const activeCount = summary?.activeRecoveries || latestBatch?.autoActioned || 0;

  const formattedRisk =
    totalRisk >= 10000000
      ? `₹${(totalRisk / 10000000).toFixed(2)}Cr`
      : totalRisk >= 100000
      ? `₹${(totalRisk / 100000).toFixed(1)}L`
      : `₹${totalRisk.toLocaleString('en-IN')}`;

  const steps: AgentStep[] = [
    {
      id: 'detector',
      name: 'Revenue Leak Detector',
      role: 'Real-Time Telemetry Stream Ingestion',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning
        ? 'Scanning live Razorpay webhooks & telemetry stream...'
        : `${totalIncidents} revenue leak incidents identified (${formattedRisk} gross volume across 4 scenarios)`,
      badge: `${totalIncidents} Ingested`,
      badgeColor: '#0369a1',
      badgeBg: '#e0f2fe',
    },
    {
      id: 'diagnostician',
      name: 'Diagnostic Agent (GPT-4o)',
      role: 'Root Cause Classification & Recoverability',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning
        ? 'Analyzing failure error codes & customer recoverability...'
        : `Classified ${totalIncidents} root causes (gateway dropoffs, card expiries, cart friction & B2B aging)`,
      badge: '100% Root Caused',
      badgeColor: '#854d0e',
      badgeBg: '#fef9c3',
    },
    {
      id: 'strategy',
      name: 'Recovery Strategy Agent',
      role: 'Expected Value Synthesis (EV = Amount × P)',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning
        ? 'Computing dynamic winback probability and action ranking...'
        : `Optimized strategy matrix • ${activeCount > 0 ? `${activeCount} sequences currently in flight` : 'Smart-routing active'}`,
      badge: activeCount > 0 ? `${activeCount} In Flight` : 'EV Ranked',
      badgeColor: '#6b21a8',
      badgeBg: '#f3e8ff',
    },
    {
      id: 'guardrails',
      name: 'Policy & Stopping Rules Engine',
      role: 'Deterministic Safety Boundaries & Compliance',
      status: reviewCount > 0 ? 'warning' : isRunning ? 'running' : 'completed',
      detail: isRunning
        ? 'Verifying ₹10k auto-action limits, retry caps & STOP-02 consent...'
        : `${reviewCount} high-value cases held in Review Queue (>₹10k) • Auto-retry caps & opt-out rules enforced`,
      badge: reviewCount > 0 ? `${reviewCount} In Review` : 'Safe Guarded',
      badgeColor: reviewCount > 0 ? '#991b1b' : '#15803d',
      badgeBg: reviewCount > 0 ? '#fee2e2' : '#dcfce7',
    },
    {
      id: 'action',
      name: 'Action Execution & Ledger Sealing',
      role: 'Razorpay API Dispatch & Audit Ledger',
      status: recoveredAmt > 0 ? 'completed' : isRunning ? 'running' : 'idle',
      detail: isRunning
        ? 'Dispatching 1-click links, reminders & registering commitments...'
        : recoveredAmt > 0
        ? `₹${recoveredAmt.toLocaleString('en-IN')} recovered (${recoveryRate}% conversion) • Cryptographically sealed`
        : 'Standby for customer portal settlements & API interventions',
      badge: recoveredAmt > 0 ? `₹${(recoveredAmt / 1000).toFixed(0)}k Won` : 'Standby',
      badgeColor: recoveredAmt > 0 ? '#15803d' : '#475569',
      badgeBg: recoveredAmt > 0 ? '#dcfce7' : '#f1f5f9',
    },
  ];

  return (
    <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
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
            <h3 style={{ fontSize: '18px', margin: 0 }}>Autonomous Multi-Agent Pipeline</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Live execution stream & real-time guardrail verification
            </span>
          </div>
        </div>

        <div
          className="neo-badge"
          style={{
            backgroundColor: isRunning ? '#ffe600' : '#22c55e',
            color: isRunning ? '#121316' : '#ffffff',
            fontWeight: 800,
            fontSize: '12px',
            padding: '4px 10px',
          }}
        >
          {isRunning ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          <span>{isRunning ? 'Processing Live Stream' : 'Pipeline Operational'}</span>
        </div>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '2px solid var(--border-black)',
              backgroundColor: '#ffffff',
              boxShadow: '2px 2px 0px var(--border-black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-black)',
                  backgroundColor: step.badgeBg,
                  color: step.badgeColor,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isRunning && step.status === 'running' ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  idx + 1
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#121316', fontFamily: 'var(--font-heading)' }}>
                    {step.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    • {step.role}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step.detail}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: step.badgeBg,
                color: step.badgeColor,
                border: `1.5px solid ${step.badgeColor}40`,
                fontSize: '11px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {step.badge}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
