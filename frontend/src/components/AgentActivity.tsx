import React from 'react';
import { Cpu, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, BrainCircuit } from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'warning' | 'error';
  detail: string;
  badge: string;
  badgeColor: string;
}

interface AgentActivityProps {
  isRunning: boolean;
  activeCasesCount?: number;
  recoveredCount?: number;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  isRunning,
  activeCasesCount = 0,
  recoveredCount = 0,
}) => {
  const steps: AgentStep[] = [
    {
      id: 'detector',
      name: 'Revenue Leak Detector',
      role: 'Telemetry Stream Ingestion',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Scanning transaction logs for revenue dropoffs...' : `${activeCasesCount || 73} revenue leak incidents identified`,
      badge: 'Ingest 100%',
      badgeColor: '#38bdf8',
    },
    {
      id: 'diagnostician',
      name: 'Diagnostic Agent (GPT-4o)',
      role: 'Root Cause Classification',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Analyzing failure telemetry & recoverability...' : 'Evaluated bank timeouts, mandate drops & card expiries',
      badge: '92% Acc',
      badgeColor: '#ffe600',
    },
    {
      id: 'strategy',
      name: 'Recovery Strategy Agent',
      role: 'Expected Value Synthesis (Amount × P)',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Ranking intervention strategies by priority...' : 'Synthesized dynamic retry, paylink & dunning actions',
      badge: 'EV Ranked',
      badgeColor: '#a855f7',
    },
    {
      id: 'guardrails',
      name: 'Policy & Stopping Rules Engine',
      role: 'Deterministic Safety Boundaries',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Checking ₹10k caps, retry bounds & opt-out rules...' : 'All actions validated against compliance boundaries',
      badge: 'Safe Guard',
      badgeColor: '#22c55e',
    },
    {
      id: 'action',
      name: 'Action Execution & Verification',
      role: 'Razorpay Test Layer Simulator',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Executing bounded interventions & settlement...' : `${recoveredCount > 0 ? 'Verified recovered funds recorded' : 'Standby for execution'}`,
      badge: 'Settled',
      badgeColor: '#ffe600',
    },
  ];

  return (
    <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Live execution stream & guardrail verification
            </span>
          </div>
        </div>

        <div
          className="neo-badge"
          style={{
            backgroundColor: isRunning ? '#ffe600' : '#22c55e',
            color: isRunning ? '#121316' : '#ffffff',
          }}
        >
          {isRunning ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          <span>{isRunning ? 'Processing Stream' : 'Pipeline Ready'}</span>
        </div>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              border: '2px solid var(--border-black)',
              backgroundColor: '#ffffff',
              boxShadow: '2px 2px 0px var(--border-black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '2px solid var(--border-black)',
                  backgroundColor: step.badgeColor,
                  color: step.badgeColor === '#a855f7' ? '#fff' : '#121316',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--border-black)' }}>
                    {step.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>• {step.role}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                  {step.detail}
                </span>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1.5px solid var(--border-black)',
                backgroundColor: step.badgeColor,
                color: step.badgeColor === '#a855f7' ? '#fff' : '#121316',
                boxShadow: '1px 1px 0px var(--border-black)',
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
