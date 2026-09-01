import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AgentActivity } from '../components/AgentActivity';
import { RevenueChart } from '../components/RevenueChart';
import { DashboardSummary, RevenueBreakdown, RecoveryCase, BatchRun } from '../types';
import { getDashboardSummary, getRevenueBreakdown, getRecoveries, getLatestBatch, exportAuditMatrix, executeTestCase, deleteTestCase } from '../services/api';
import { IndianRupee, ShieldCheck, UserCheck, TrendingUp, AlertTriangle, Play, Sparkles, ChevronRight, Star, Plus, Download, FlaskConical, X, CheckCircle2, ShieldAlert, BrainCircuit, ExternalLink, Send, Trash2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DemoSandbox } from '../components/DemoSandbox';
import { PromiseTracker } from '../components/PromiseTracker';
import { CaseInspectModal } from '../components/CaseInspectModal';

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

  // Rich Case Inspection Modal State
  const [inspectingCase, setInspectingCase] = useState<any | null>(null);
  const [modalSimulatedAction, setModalSimulatedAction] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      if (inspectingCase && (inspectingCase.caseId === caseId || inspectingCase._id === caseId || inspectingCase.paymentId === caseId)) {
        setInspectingCase((prev: any) => ({
          ...prev,
          status: result.finalStatus,
          recoveredAmount: result.recoveredAmount,
        }));
      }
      await fetchData();
    } catch (err) {
      console.error('Error executing single case from dashboard:', err);
    } finally {
      setExecutingCaseId(null);
    }
  };

  const handleDeleteCase = async (caseObj: any) => {
    const targetId = caseObj._id || caseObj.paymentId || caseObj.caseId;
    if (!window.confirm(`Are you sure you want to delete test case ${caseObj.caseId || caseObj.paymentId || targetId}?`)) return;
    setDeletingId(targetId);
    try {
      await deleteTestCase(targetId);
      setRecentCases(prev => prev.filter(c => 
        (c as any)._id !== targetId && 
        (c as any).paymentId !== targetId && 
        c.caseId !== targetId &&
        c.caseId !== caseObj.caseId
      ));
      if (inspectingCase && (inspectingCase._id === targetId || inspectingCase.caseId === targetId)) {
        setInspectingCase(null);
      }
      await fetchData();
    } catch (err) {
      console.error('Error deleting test case from dashboard:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '16px 24px 80px 24px' }}>
      {/* ─── Hero Autonomous Action Banner ─── */}
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
          border: '3px solid var(--border-black)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="neo-badge neo-badge-blue">
              <FlaskConical size={13} />
              <span>Razorpay AI Hackathon 2026</span>
            </div>
            <div className="neo-badge neo-badge-yellow">
              <span>Track 03 • AI for Customer Winback</span>
            </div>
            <div className="neo-badge neo-badge-green">
              <span>System Status: 100% Deterministic</span>
            </div>
          </div>

          <h1 style={{ fontSize: '32px', lineHeight: 1.15, margin: '6px 0 0 0' }}>
            Autonomous Revenue Winback & Compliance Engine
          </h1>

          <p style={{ fontSize: '15px', color: '#475569', fontWeight: 500, margin: 0 }}>
            Continuously monitors failed checkouts, broken subscription mandates, and overdue commercial invoices. Intervenes dynamically with strict RBI compliance, quiet hours, and 100% financial guardrails.
          </p>
        </div>

        {/* Action Buttons: Fleet Batch vs Single Case Execution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
          <button
            onClick={onRunBatch}
            disabled={isRunning}
            className="neo-btn neo-btn-primary neo-btn-lg"
            style={{
              padding: '16px 24px',
              fontSize: '15px',
              justifyContent: 'center',
              boxShadow: '4px 4px 0px var(--border-black)',
            }}
          >
            {isRunning ? (
              <>
                <Sparkles size={20} className="animate-spin" />
                <span>Running Batch Recovery...</span>
              </>
            ) : (
              <>
                <Play size={20} fill="#121316" />
                <span>▶ Run Fleet Batch (All Cases)</span>
              </>
            )}
          </button>

          <Link
            to="/recoveries"
            className="neo-btn neo-btn-white"
            style={{
              padding: '12px 18px',
              fontSize: '13px',
              justifyContent: 'center',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            <FlaskConical size={16} />
            <span>⚡ Open Revenue Cases & Test Lab</span>
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <MetricCard
          label="Revenue at Risk"
          value={`₹${summary.revenueAtRisk.toLocaleString('en-IN')}`}
          subtitle={`${summary.totalCases} detected leak incidents`}
          icon={<IndianRupee size={22} />}
          accentColor="#0284c7"
          badgeText="Detected"
        />

        <MetricCard
          label="Revenue Recovered"
          value={`₹${summary.revenueRecovered.toLocaleString('en-IN')}`}
          subtitle={`${summary.recoveryRate}% gross recovery conversion`}
          icon={<TrendingUp size={22} />}
          accentColor="#16a34a"
          badgeText="Won Back"
        />

        <MetricCard
          label="Active Interventions"
          value={summary.activeRecoveries}
          subtitle="Autonomous retry / link sequences"
          icon={<ShieldCheck size={22} />}
          accentColor="#ffe600"
          badgeText="In Flight"
        />

        <MetricCard
          label="Review Queue"
          value={summary.humanReviews}
          subtitle="Financial guardrail holds (>₹10k)"
          icon={<UserCheck size={22} />}
          accentColor="#ff6b6b"
          badgeText="Pending Review"
        />
      </div>

      {/* ─── Charts & Agent Activity Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <RevenueChart breakdown={breakdown} />
        <AgentActivity isRunning={isRunning} />
      </div>

      {/* ─── B2B Promise-to-Pay Tracker (Track 03 Feature) ─── */}
      <PromiseTracker />

      {/* ─── Recent Incidents Stream Table ─── */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Recent Revenue Leak Incidents</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Click any customer row to inspect the rich Case Inspection Modal or use 1-click execution
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => exportAuditMatrix()}
              className="neo-btn neo-btn-white neo-btn-sm"
              title="Export all recoveries to CSV"
            >
              <Download size={14} />
              <span>Export Audit CSV</span>
            </button>

            <Link
              to="/recoveries"
              className="neo-btn neo-btn-white neo-btn-sm"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
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
                  <th style={{ padding: '12px 14px' }}>Amount at Risk</th>
                  <th style={{ padding: '12px 14px' }}>Strategy Action</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((item, idx) => {
                  let badgeClass = 'neo-badge-blue';
                  if (item.status === 'RECOVERED') badgeClass = 'neo-badge-green';
                  else if (item.status === 'BLOCKED' || item.status === 'HALTED') badgeClass = 'neo-badge-coral';
                  else if (item.status === 'HUMAN_REVIEW' || item.status === 'PAUSED') badgeClass = 'neo-badge-yellow';

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
                        cursor: 'pointer',
                      }}
                      onClick={() => setInspectingCase(item)}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ color: '#0369a1', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                          {item.caseId}
                        </span>
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
                      <td style={{ padding: '12px 14px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setInspectingCase(item)}
                            className="neo-btn neo-btn-sm neo-btn-white"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '11px', padding: '4px 8px' }}
                            title="Inspect case telemetry"
                          >
                            <span>⚡ Inspect</span>
                            <ChevronRight size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteCase(item)}
                            disabled={deletingId === item.caseId || deletingId === (item as any)._id || deletingId === (item as any).paymentId}
                            className="neo-btn neo-btn-sm"
                            style={{
                              width: '28px',
                              height: '28px',
                              padding: 0,
                              backgroundColor: '#fee2e2',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1.5px solid var(--border-black)',
                              boxShadow: '1px 1px 0px var(--border-black)',
                            }}
                            title="Delete case record"
                          >
                            <Trash2 size={13} color="#dc2626" />
                          </button>
                        </div>
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
          to="/recoveries"
          className="neo-fab"
          title="➕ Ingest Custom Leak / Open Test Suite"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={28} strokeWidth={3} color="#121316" />
        </Link>
      </div>

      {/* ─── 🌟 RICH CASE QUICK-INSPECT MODAL (DASHBOARD) ─── */}
      {inspectingCase && (
        <CaseInspectModal
          caseData={inspectingCase}
          onClose={() => setInspectingCase(null)}
          onUpdate={() => fetchData()}
        />
      )}

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
