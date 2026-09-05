import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { RevenueBreakdown } from '../types';
import { PieChart as ChartIcon, Sparkles, TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  breakdown: RevenueBreakdown[];
}

const scenarioLabels: Record<string, string> = {
  payment_failure: 'Failures',
  checkout_abandonment: 'Abandonment',
  subscription_failure: 'Subscriptions',
  invoice_overdue: 'B2B Invoices',
};

const scenarioFullNames: Record<string, string> = {
  payment_failure: 'Payment Gateway Failures',
  checkout_abandonment: 'Checkout Cart Drop-offs',
  subscription_failure: 'Recurring Subscriptions',
  invoice_overdue: 'Commercial B2B Invoices',
};

const scenarioColors: Record<string, string> = {
  payment_failure: '#3b82f6',
  checkout_abandonment: '#a855f7',
  subscription_failure: '#f97316',
  invoice_overdue: '#10b981',
};

const formatCurrencyTick = (val: number): string => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ breakdown }) => {
  const chartData = (breakdown && breakdown.length > 0
    ? breakdown
    : [
        { scenario: 'payment_failure', count: 70, totalAmount: 80000 },
        { scenario: 'checkout_abandonment', count: 50, totalAmount: 45000 },
        { scenario: 'subscription_failure', count: 35, totalAmount: 30000 },
        { scenario: 'invoice_overdue', count: 25, totalAmount: 120000 },
      ]
  ).map((item) => ({
    name: scenarioLabels[item.scenario] || item.scenario,
    fullName: scenarioFullNames[item.scenario] || item.scenario,
    scenario: item.scenario,
    amount: item.totalAmount || 0,
    count: item.count || 0,
    color: scenarioColors[item.scenario] || '#3b82f6',
  }));

  const totalAtRisk = chartData.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncidents = chartData.reduce((acc, curr) => acc + curr.count, 0);

  const formattedTotal =
    totalAtRisk >= 10000000
      ? `₹${(totalAtRisk / 10000000).toFixed(2)}Cr`
      : totalAtRisk >= 100000
      ? `₹${(totalAtRisk / 100000).toFixed(2)}L`
      : `₹${(totalAtRisk || 0).toLocaleString('en-IN')}`;

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
              backgroundColor: '#ffe600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--border-black)',
            }}
          >
            <ChartIcon size={20} color="#121316" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Revenue at Risk by Scenario</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Live telemetry distribution across 4 leak scenarios ({totalIncidents} total incidents)
            </span>
          </div>
        </div>

        <div className="neo-badge neo-badge-yellow" style={{ fontSize: '12px', padding: '4px 10px' }}>
          <Sparkles size={13} />
          <span>Total: {formattedTotal}</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#121316"
              fontSize={12}
              fontWeight={700}
              tickLine={false}
              axisLine={{ stroke: '#121316', strokeWidth: 2 }}
            />
            <YAxis
              stroke="#121316"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: '#121316', strokeWidth: 2 }}
              tickFormatter={formatCurrencyTick}
              width={65}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const share = totalAtRisk > 0 ? ((data.amount / totalAtRisk) * 100).toFixed(1) : '0';
                  const avgPerIncident = data.count > 0 ? Math.round(data.amount / data.count) : 0;

                  return (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #121316',
                        borderRadius: '12px',
                        boxShadow: '4px 4px 0px #121316',
                        padding: '12px 14px',
                        fontFamily: 'var(--font-heading)',
                        minWidth: '200px',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#121316', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: data.color, display: 'inline-block' }} />
                        <span>{data.fullName}</span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#121316' }}>
                        ₹{(data?.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                        <span>Portfolio Share:</span>
                        <strong style={{ color: '#0369a1' }}>{share}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        <span>Incidents:</span>
                        <strong>{data?.count || 0} cases</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        <span>Avg Ticket:</span>
                        <strong>₹{(avgPerIncident || 0).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} stroke="#121316" strokeWidth={2}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {chartData.map((item) => {
          const share = totalAtRisk > 0 ? (((item.amount || 0) / totalAtRisk) * 100).toFixed(1) : '0';
          return (
            <div
              key={item.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-black)',
                backgroundColor: '#ffffff',
                boxShadow: '2px 2px 0px var(--border-black)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      border: '1px solid var(--border-black)',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>{item.name}</span>
                </div>
                <span className="neo-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  {item.count || 0} cases
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                  ₹{(item.amount || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>{share}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
