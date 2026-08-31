import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { AgentActivity } from '../components/AgentActivity';
import { RevenueChart } from '../components/RevenueChart';
import { DashboardSummary, RevenueBreakdown, RecoveryCase, BatchRun } from '../types';
import { getDashboardSummary, getRevenueBreakdown, getRecoveries, getLatestBatch, exportAuditMatrix } from '../services/api';
import { IndianRupee, ShieldCheck, UserCheck, TrendingUp, AlertTriangle, Play, Sparkles, ChevronRight, Star, Plus, Download, FlaskConical } from 'lucide-react';
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

  const formatRupees = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 24px 80px 24px' }}>
      {/* Hero Showcase Card — Inspired by Reference Visual */}
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
            Autonomous AI agent pipeline that identifies leaked revenue across checkouts, subscriptions & invoices, evaluates Expected Recovery Value (Amount × Probability), and settles funds with immutable audit logs.
          </p>
        </div>

        {/* Action Button & Telemetry Mini Counter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="neo-counter-box">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800 }}>
                {latestBatch?.casesScanned || summary.totalCases || 73}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>CASES</span>
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
              style={{ flex: 1, minWidth: '220px' }}
            >
              {isRunning ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  <span>Processing Fleet Batch...</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="#121316" />
                  <span>▶ Run Full Fleet Batch</span>
                </>
              )}
            </button>

            <Link
              to="/test-cases"
              className="neo-btn neo-btn-white neo-btn-lg"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <FlaskConical size={18} color="#0284c7" />
              <span>Single-Case Sandbox</span>
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
          badgeText={summary.recoveryRate > 0 ? `${summary.recoveryRate}% Winback` : 'Measured ₹'}
          badgeVariant="positive"
          accentColor="#ffe600"
          icon={<IndianRupee size={18} color="#121316" />}
        />

        <MetricCard
          label="REVENUE AT RISK"
          value={formatRupees(summary.revenueAtRisk || 275000)}
          subtitle="Detected in transaction stream"
          badgeText="At Risk"
          badgeVariant="negative"
          accentColor="#ff5757"
          icon={<AlertTriangle size={18} color="#ffffff" />}
        />

        <MetricCard
          label="WINBACK RATE"
          value={`${summary.recoveryRate}%`}
          subtitle="Recovered / Total at risk"
          badgeText={summary.recoveryRate > 0 ? 'Success' : '0% Baseline'}
          badgeVariant={summary.recoveryRate > 0 ? 'positive' : 'information'}
          accentColor="#38bdf8"
          icon={<TrendingUp size={18} color="#121316" />}
        />

        <MetricCard
          label="ACTIVE RECOVERIES"
          value={summary.activeRecoveries || (latestBatch ? latestBatch.autoActioned : 37)}
          subtitle="Autonomous interventions"
          badgeText="Bounded"
          badgeVariant="information"
          accentColor="#a855f7"
          icon={<ShieldCheck size={18} color="#ffffff" />}
        />

        <MetricCard
          label="HUMAN REVIEW QUEUE"
          value={summary.humanReviews || (latestBatch ? latestBatch.humanReviewRequired : 9)}
          subtitle="Guardrail escalation hold"
          badgeText={summary.humanReviews > 0 ? 'Review Needed' : 'Queue Clear'}
          badgeVariant={summary.humanReviews > 0 ? 'notice' : 'positive'}
          accentColor="#f97316"
          icon={<UserCheck size={18} color="#ffffff" />}
        />
      </div>

      {/* Analytics & Live Agent Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
        }}
      >
        <RevenueChart breakdown={breakdown} />
        <AgentActivity
          isRunning={isRunning}
          activeCasesCount={summary.totalCases || 73}
          recoveredCount={summary.revenueRecovered}
        />
      </div>

      {/* Interactive Track 03 Canonical Demo Sandbox (With Hinglish Voice AI) */}
      <DemoSandbox />

      {/* B2B Promise-to-Pay Tracker */}
      <PromiseTracker />

      {/* Recent Recovered Transactions Table in Neo-Brutalist Style */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Recent Revenue Recovery Interventions</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Live telemetry stream of AI diagnoses, expected values, and settlement statuses
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => exportAuditMatrix('csv')}
              className="neo-btn neo-btn-sm"
              style={{ backgroundColor: '#c4f0c2', fontWeight: 700 }}
              title="Download full audit matrix CSV for independent verification"
            >
              <Download size={14} />
              <span>Download Audit Matrix</span>
            </button>
            <Link to="/recoveries" className="neo-btn neo-btn-white neo-btn-sm">
              <span>View All Cases</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {recentCases && recentCases.length > 0 ? (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2.5px solid var(--border-black)', color: '#121316', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                  <th style={{ padding: '12px 14px' }}>Case ID</th>
                  <th style={{ padding: '12px 14px' }}>Customer</th>
                  <th style={{ padding: '12px 14px' }}>Scenario</th>
                  <th style={{ padding: '12px 14px' }}>Amount at Risk</th>
                  <th style={{ padding: '12px 14px' }}>Winback Prob.</th>
                  <th style={{ padding: '12px 14px' }}>Recommended Action</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((item, idx) => {
                  let badgeClass = 'neo-badge-blue';
                  if (item.status === 'RECOVERED') badgeClass = 'neo-badge-green';
                  else if (item.status === 'BLOCKED' || item.status === 'HALTED' || item.status === 'FAILED') badgeClass = 'neo-badge-coral';
                  else if (item.status === 'HUMAN_REVIEW' || item.status === 'PAUSED') badgeClass = 'neo-badge-yellow';

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
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)' }}>
                            {Math.round((item.recoveryProbability || 0) * 100)}%
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>EV: ₹{item.expectedRecoveryValue || 0}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className="neo-badge neo-badge-yellow" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {item.recommendedAction ? item.recommendedAction.replace(/_/g, ' ') : 'Analyzing'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div className={`neo-badge ${badgeClass}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {item.status}
                        </div>
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
            No active recovery batch records yet. Click "Run Autonomous Recovery Run" above to start detection & execution.
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
    </div>
  );
};
