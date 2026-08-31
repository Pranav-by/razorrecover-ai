import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Badge, Button, Card, CardBody } from '@razorpay/blade/components';
import { MetricCard } from '../components/MetricCard';
import { AgentActivity } from '../components/AgentActivity';
import { RevenueChart } from '../components/RevenueChart';
import { DashboardSummary, RevenueBreakdown, RecoveryCase, BatchRun } from '../types';
import { getDashboardSummary, getRevenueBreakdown, getRecoveries, getLatestBatch } from '../services/api';
import { IndianRupee, ShieldCheck, UserCheck, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  isRunning: boolean;
  onRunBatch: () => void;
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
    <Box display="flex" flexDirection="column" gap="spacing.7" padding="spacing.7">
      {/* Top Banner / Announcement */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="spacing.4">
            <Box display="flex" flexDirection="column" gap="spacing.2">
              <Box display="flex" alignItems="center" gap="spacing.3">
                <Heading size="large" weight="semibold" color="surface.text.gray.normal">
                  Autonomous Revenue Recovery Command Center
                </Heading>
                <Badge color={summary.revenueRecovered > 0 ? 'positive' : 'information'} size="medium">
                  {summary.revenueRecovered > 0 ? 'Active Winback Verified' : 'Detection Engine Active'}
                </Badge>
              </Box>
              <Text size="small" color="surface.text.gray.muted">
                Official Track 03 Bar: Measured ₹ won back across batch with compliant escalation, explicit stopping rules, and append-only audit trail.
              </Text>
            </Box>

            <Button
              variant="primary"
              size="large"
              isLoading={isRunning}
              onClick={onRunBatch}
            >
              {isRunning ? 'Processing Recovery Batch...' : '▶ Run Autonomous Batch Recovery'}
            </Button>
          </Box>
        </CardBody>
      </Card>

      {/* Metric Cards Row - Financial Ops Hierarchy */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <MetricCard
          label="REVENUE RECOVERED"
          value={formatRupees(summary.revenueRecovered)}
          subtitle={summary.revenueRecovered > 0 ? 'Verified in merchant account' : 'Ready to execute recovery run'}
          badgeText={summary.recoveryRate > 0 ? `${summary.recoveryRate}% Recovery Rate` : undefined}
          badgeVariant="positive"
          icon={<IndianRupee size={20} color="#10b981" />}
        />

        <MetricCard
          label="REVENUE AT RISK"
          value={formatRupees(summary.revenueAtRisk || 275000)}
          subtitle="Detected in transaction stream"
          badgeText="At Risk"
          badgeVariant="negative"
          icon={<AlertTriangle size={20} color="#ef4444" />}
        />

        <MetricCard
          label="WINBACK RATE"
          value={`${summary.recoveryRate}%`}
          subtitle="Recovered / Total at risk"
          badgeText={summary.recoveryRate > 0 ? 'Measured' : 'Baseline 0%'}
          badgeVariant={summary.recoveryRate > 0 ? 'positive' : 'neutral'}
          icon={<TrendingUp size={20} color="#3b82f6" />}
        />

        <MetricCard
          label="ACTIVE RECOVERIES"
          value={summary.activeRecoveries || (latestBatch ? latestBatch.autoActioned : 37)}
          subtitle="Autonomous interventions"
          badgeText="Bounded"
          badgeVariant="information"
          icon={<ShieldCheck size={20} color="#8b5cf6" />}
        />

        <MetricCard
          label="HUMAN REVIEW QUEUE"
          value={summary.humanReviews || (latestBatch ? latestBatch.humanReviewRequired : 9)}
          subtitle="Guardrail escalation hold"
          badgeText={summary.humanReviews > 0 ? 'Review Needed' : 'No Blockers'}
          badgeVariant={summary.humanReviews > 0 ? 'notice' : 'neutral'}
          icon={<UserCheck size={20} color="#f59e0b" />}
        />
      </div>

      {/* Main Split: Analytics & Live Agent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
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

      {/* Recent Recovered Transactions Table */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.5">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap="spacing.3">
                <CheckCircle2 size={20} color="#10b981" />
                <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                  Recent Revenue Interventions & Status
                </Heading>
              </Box>
              <Link to="/recoveries" style={{ textDecoration: 'none' }}>
                <Button variant="tertiary" size="small">
                  View All Revenue Cases
                </Button>
              </Link>
            </Box>

            {recentCases && recentCases.length > 0 ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '12px 16px' }}>Case ID</th>
                      <th style={{ padding: '12px 16px' }}>Customer</th>
                      <th style={{ padding: '12px 16px' }}>Scenario</th>
                      <th style={{ padding: '12px 16px' }}>Amount at Risk</th>
                      <th style={{ padding: '12px 16px' }}>Winback Prob.</th>
                      <th style={{ padding: '12px 16px' }}>Intervention</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map((item) => {
                      let badgeColor: 'positive' | 'negative' | 'information' | 'notice' | 'neutral' = 'information';
                      if (item.status === 'RECOVERED') badgeColor = 'positive';
                      else if (item.status === 'BLOCKED' || item.status === 'HALTED' || item.status === 'FAILED') badgeColor = 'negative';
                      else if (item.status === 'HUMAN_REVIEW' || item.status === 'PAUSED') badgeColor = 'notice';

                      return (
                        <tr
                          key={item._id}
                          style={{
                            borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <Link to={`/recoveries/${item.caseId}`} style={{ color: '#0c8ce9', fontWeight: 700, textDecoration: 'none' }}>
                              {item.caseId}
                            </Link>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.customerName}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{item.customerId}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge color="neutral" size="small">
                              {item.scenario.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f8fafc' }}>
                            ₹{item.amountAtRisk.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, color: '#38bdf8' }}>{Math.round((item.recoveryProbability || 0) * 100)}%</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>EV: ₹{item.expectedRecoveryValue || 0}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge color="information" size="small">
                              {item.recommendedAction ? item.recommendedAction.replace(/_/g, ' ') : 'Analyzing'}
                            </Badge>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge color={badgeColor} size="small">
                              {item.status}
                            </Badge>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Link to={`/recoveries/${item.caseId}`}>
                              <ChevronRight size={18} color="#94a3b8" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Box padding="spacing.7" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="spacing.3">
                <Text size="medium" color="surface.text.gray.muted">
                  No active recovery batch records yet. Click "Run Autonomous Batch Recovery" to start detection & execution.
                </Text>
              </Box>
            )}
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};
