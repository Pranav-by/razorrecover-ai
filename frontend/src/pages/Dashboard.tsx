import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AgentActivity } from '../components/AgentActivity';
import { RevenueChart } from '../components/RevenueChart';
import { DashboardSummary, RevenueBreakdown, RecoveryCase, BatchRun } from '../types';
import { getDashboardSummary, getRevenueBreakdown, getRecoveries, getLatestBatch, exportAuditMatrix, executeTestCase } from '../services/api';
import { IndianRupee, ShieldCheck, UserCheck, TrendingUp, AlertTriangle, Play, Sparkles, ChevronRight, Star, Plus, Download, FlaskConical, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DemoSandbox } from '../components/DemoSandbox';
import { PromiseTracker } from '../components/PromiseTracker';

interface DashboardProps {
  isRunning: boolean;
  onRunBatch: () => void;
  onOpenJudgeModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isRunning, onRunBatch }) => {
  const [summary, setSummary] = useState<DashboardSummary>({
    revenueAtRisk: 275000,
    revenueRecovered: 0,
    recoveryRate: 0,
    activeRecoveries: 0,
    humanReviews: 0,
    totalCases: 0,
  });
  const [breakdown, setBreakdown] = useState<RevenueBreakdown[]>([]);
  const [recentCases, setRecentCases] = useState<RecoveryCase[]>([]);
  const [latestBatch, setLatestBatch] = useState<BatchRun | null>(null);

  // Single Execution State
  const [executingCaseId, setExecutingCaseId] = useState<string | null>(null);
  const [singleExecutionResult, setSingleExecutionResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [sum, bkd, rec, bth] = await Promise.all([
        getDashboardSummary(),
        getRevenueBreakdown(),
        getRecoveries({ limit: 8 }),
        getLatestBatch(),
      ]);
      setSummary(sum);
      setBreakdown(bkd.breakdown);
      setRecentCases(rec.cases);
      setLatestBatch(bth.batch);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, isRunning ? 2000 : 5000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleExecuteSingleCase = async (caseId: string) => {
    setExecutingCaseId(caseId);
    try {
      const result = await executeTestCase(caseId);
      setSingleExecutionResult(result);
      await fetchData();
    } catch (err) {
      console.error('Error executing single case from dashboard:', err);
    } finally {
      setExecutingCaseId(null);
    }
  };

  const formatRupees = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 24px 80px 24px' }}>
      {/* Hero Showcase Card */}
      <div
        className="neo-card"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          background: 'linear-gradient(135deg, #fffdfa 0%, #fff7d6 100%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="neo-badge neo-badge-yellow">
              <Star size={12} fill="#121316" color="#121316" />
              <span>AI Revenue Recovery Engine</span>
            </div>
            <div className="neo-badge neo-badge-green">
              <span>{summary.revenueRecovered > 0 ? '✓ Winback Verified' : '● Telemetry Ingest Live'}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: 0 }}>
            Autonomous Revenue Recovery Command Center
          </h1>

          <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500, margin: 0 }}>
            Choose between <strong>Full Fleet Batch Execution</strong> (recovering 180+ merchant leaks simultaneously) or <strong>Single-Case 1-Click Evaluation</strong> with real-time 10-step telemetry.
          </p>
        </div>

        {/* Action Buttons & Execution Mode Split */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="neo-counter-box">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800 }}>
                {latestBatch?.casesScanned || summary.totalCases || 73}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>FLEET</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>:</span>
            <div className="neo-counter-box">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#22c55e' }}>
                {summary.recoveryRate}%
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>WIN %</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>:</span>
            <div className="neo-counter-box">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: '#3b82f6' }}>
                {summary.activeRecoveries || (latestBatch ? latestBatch.autoActioned : 37)}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>ACTIVE</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
            <button
              onClick={onRunBatch}
              disabled={isRunning}
              className="neo-btn neo-btn-primary neo-btn-lg"
              style={{ flex: 1, minWidth: '180px' }}
              title="Execute full autonomous recovery across all 180 pending cases"
            >
              {isRunning ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  <span>Processing Fleet Batch...</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="#121316" />
                  <span>▶ Run Fleet Batch</span>
                </>
              )}
            </button>

            <Link
              to="/test-cases"
              className="neo-btn neo-btn-white neo-btn-lg"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px', justifyContent: 'center' }}
              title="Test single cases with interactive 10-step telemetry"
            >
              <FlaskConical size={18} color="#0284c7" />
              <span>⚡ Single Case Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
        }}
      >
        <MetricCard
          label="REVENUE RECOVERED"
          value={formatRupees(summary.revenueRecovered)}
          subtitle={summary.revenueRecovered > 0 ? 'Verified in merchant settlement' : 'Ready to execute recovery run'}
          accentColor="#ffe600"
          badgeText={summary.revenueRecovered > 0 ? `${summary.recoveryRate}% Winback` : 'Pending Run'}
          icon={<IndianRupee size={22} color="var(--border-black)" />}
        />

        <MetricCard
          label="REVENUE AT RISK"
          value={formatRupees(summary.revenueAtRisk)}
          subtitle="Detected in transaction stream"
          accentColor="#ff5757"
          badgeText="At Risk"
          icon={<AlertTriangle size={22} color="var(--border-black)" />}
        />

        <MetricCard
          label="WINBACK RATE"
          value={`${summary.recoveryRate}%`}
          subtitle="Recovered / Total at risk"
          accentColor="#38bdf8"
          badgeText={summary.recoveryRate > 0 ? 'Success' : 'Ready'}
          icon={<TrendingUp size={22} color="var(--border-black)" />}
        />

        <MetricCard
          label="ACTIVE RECOVERIES"
          value={summary.activeRecoveries}
          subtitle="Autonomous interventions"
          accentColor="#3b82f6"
          badgeText="Bounded"
          icon={<ShieldCheck size={22} color="var(--border-black)" />}
        />

        <MetricCard
          label="HUMAN REVIEW QUEUE"
          value={summary.humanReviews}
          subtitle="Guardrail escalation hold"
          accentColor="#f59e0b"
          badgeText="Review Needed"
          icon={<UserCheck size={22} color="var(--border-black)" />}
        />
      </div>

      {/* Track 03 Canonical Demo Scenarios Sandbox */}
      <DemoSandbox />

      {/* Main Content 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left: Scenario Breakdown Chart */}
        <RevenueChart breakdown={breakdown} />

        {/* Right: Live Agent Pipeline Execution View */}
        <AgentActivity
          isRunning={isRunning}
          activeCasesCount={summary.activeRecoveries}
          recoveredCount={summary.revenueRecovered > 0 ? (latestBatch?.autoActioned || 30) : 0}
        />
      </div>

      {/* B2B Promise-to-Pay Tracker & Receivables Chaser */}
      <PromiseTracker />

      {/* Active Incidents Table */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Recent Revenue Leak Incidents</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Live telemetry stream with 1-click single case execution
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => exportAuditMatrix()}
              className="neo-btn neo-btn-white neo-btn-sm"
              title="Download ISO-Compliant Audit Matrix as CSV"
            >
              <Download size={14} />
              <span>Export Audit CSV</span>
            </button>

            <Link to="/recoveries" className="neo-btn neo-btn-white neo-btn-sm">
              <span>View All 180+ Cases</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {recentCases.length > 0 ? (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2.5px solid var(--border-black)', color: '#121316', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                  <th style={{ padding: '12px 14px' }}>Case ID</th>
                  <th style={{ padding: '12px 14px' }}>Customer</th>
                  <th style={{ padding: '12px 14px' }}>Scenario</th>
                  <th style={{ padding: '12px 14px' }}>Amount</th>
                  <th style={{ padding: '12px 14px' }}>Strategy Action</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>1-Click Execute</th>
                  <th style={{ padding: '12px 14px' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((item, idx) => {
                  let badgeClass = 'neo-badge-blue';
                  if (item.status === 'RECOVERED') badgeClass = 'neo-badge-green';
                  else if (item.status === 'BLOCKED' || item.status === 'HALTED' || item.status === 'FAILED') badgeClass = 'neo-badge-coral';
                  else if (item.status === 'HUMAN_REVIEW' || item.status === 'PAUSED') badgeClass = 'neo-badge-yellow';

                  const isRowExecuting = executingCaseId === item.caseId || executingCaseId === (item as any)._id;

                  const strategy = item.recommendedAction
                    ? item.recommendedAction.replace(/_/g, ' ')
                    : item.scenario === 'payment_failure'
                    ? 'retry payment'
                    : item.scenario === 'checkout_abandonment'
                    ? 'generate link'
                    : item.scenario === 'subscription_failure'
                    ? 'update method'
                    : 'send reminder';

                  return (
                    <tr
                      key={item._id || idx}
                      style={{
                        borderBottom: '1.5px solid #e2e8f0',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fffdfa',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <Link to={`/recoveries/${item.caseId}`} style={{ color: '#121316', fontWeight: 800, fontFamily: 'var(--font-heading)', textDecoration: 'none' }}>
                          {item.caseId}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#fff7d6',
                              border: '1.5px solid var(--border-black)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            {item.customerName ? item.customerName.charAt(0) : 'C'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#121316' }}>{item.customerName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.customerId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="neo-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {item.scenario.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                        ₹{item.amountAtRisk.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="neo-badge neo-badge-yellow" style={{ fontSize: '10px', padding: '2px 8px', textTransform: 'uppercase' }}>
                          {strategy}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className={`neo-badge ${badgeClass}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {item.status}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => handleExecuteSingleCase(item.caseId)}
                          disabled={isRowExecuting}
                          className="neo-btn neo-btn-sm"
                          style={{ backgroundColor: '#c4f0c2', fontWeight: 800 }}
                          title="Execute full 10-agent pipeline on this single case"
                        >
                          {isRowExecuting ? (
                            <Sparkles size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Play size={12} fill="#121316" />
                              <span>⚡ Run Single</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Link
                          to={`/recoveries/${item.caseId}`}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--border-black)',
                            backgroundColor: '#ffe600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '1px 1px 0px var(--border-black)',
                          }}
                        >
                          <ChevronRight size={16} color="#121316" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            No active recovery batch records yet. Click "Run Fleet Batch" above to start detection & execution.
          </div>
        )}
      </div>

      {/* Floating Action Button (+) — Ingest Custom Leak / Test Suite */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 99,
        }}
      >
        <Link
          to="/test-cases"
          className="neo-fab"
          title="➕ Ingest Custom Leak / Open Test Suite"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={28} strokeWidth={3} color="#121316" />
        </Link>
      </div>

      {/* ─── Live Single Execution Stepper Modal (Dashboard 1-Click Trigger) ─── */}
      {singleExecutionResult && (
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
          onClick={() => setSingleExecutionResult(null)}
        >
          <div
            className="neo-card"
            style={{
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`neo-badge ${singleExecutionResult.finalStatus === 'RECOVERED' ? 'neo-badge-green' : singleExecutionResult.finalStatus === 'HUMAN_REVIEW' ? 'neo-badge-yellow' : 'neo-badge-coral'}`}>
                    {singleExecutionResult.finalStatus}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{singleExecutionResult.caseId}</span>
                </div>
                <h2 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>Single-Case Autonomous Execution Result</h2>
              </div>

              <button onClick={() => setSingleExecutionResult(null)} className="neo-btn neo-btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Outcome Banner */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid var(--border-black)',
                backgroundColor: singleExecutionResult.finalStatus === 'RECOVERED' ? '#f0fdf4' : singleExecutionResult.finalStatus === 'HUMAN_REVIEW' ? '#fff7d6' : '#fff1f2',
                boxShadow: '2px 2px 0px var(--border-black)',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                {singleExecutionResult.finalStatus === 'RECOVERED' ? `💰 Won Back ₹${singleExecutionResult.recoveredAmount?.toLocaleString('en-IN')}` : `Status: ${singleExecutionResult.finalStatus}`}
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                {singleExecutionResult.finalStatus === 'RECOVERED'
                  ? 'All 10 agent pipeline steps executed autonomously and verified with direct settlement.'
                  : singleExecutionResult.finalStatus === 'HUMAN_REVIEW'
                  ? 'Financial guardrails held action safely and routed transaction to Human Review Queue.'
                  : 'Safety stopping rule halted outreach immediately to protect customer compliance.'}
              </div>
            </div>

            {/* Stepper Trace */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
                LIVE 10-AGENT EXECUTION TRACE:
              </span>
              {singleExecutionResult.executionTrace?.map((step: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fffdfa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: '#0369a1', fontFamily: 'monospace', marginRight: '8px' }}>
                      {step.step}:
                    </span>
                    <span style={{ color: '#121316' }}>{step.detail}</span>
                  </div>
                  <span className="neo-badge neo-badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setSingleExecutionResult(null)} className="neo-btn neo-btn-primary">
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
