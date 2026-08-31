import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { RevenueBreakdown } from '../types';
import { PieChart as ChartIcon, Sparkles } from 'lucide-react';

interface RevenueChartProps {
  breakdown: RevenueBreakdown[];
}

const scenarioLabels: Record<string, string> = {
  payment_failure: 'Failures',
  checkout_abandonment: 'Abandonment',
  subscription_failure: 'Subscriptions',
  invoice_overdue: 'B2B Invoices',
};

const scenarioColors: Record<string, string> = {
  payment_failure: '#3b82f6',
  checkout_abandonment: '#a855f7',
  subscription_failure: '#f97316',
  invoice_overdue: '#22c55e',
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
    scenario: item.scenario,
    amount: item.totalAmount,
    amountFormatted: `₹${(item.totalAmount / 1000).toFixed(1)}k`,
    count: item.count,
    color: scenarioColors[item.scenario] || '#3b82f6',
  }));

  const totalAtRisk = chartData.reduce((acc, curr) => acc + curr.amount, 0);

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
              Telemetry distribution across 4 MVP leak tracks
            </span>
          </div>
        </div>

        <div className="neo-badge neo-badge-yellow">
          <Sparkles size={12} />
          <span>Total: ₹{(totalAtRisk / 100000).toFixed(2)}L</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '2px solid #121316',
                borderRadius: '12px',
                boxShadow: '4px 4px 0px #121316',
                color: '#121316',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
              }}
              formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount at Risk']}
              labelStyle={{ color: '#64748b', fontWeight: 600 }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} stroke="#121316" strokeWidth={2}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {chartData.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-black)',
              backgroundColor: '#ffffff',
              boxShadow: '1.5px 1.5px 0px var(--border-black)',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.color,
                border: '1px solid var(--border-black)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#121316' }}>
              {item.name}: <strong>₹{item.amount.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
