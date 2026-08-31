import React from 'react';
import { Box, Card, CardBody, Heading, Text, Badge } from '@razorpay/blade/components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { RevenueBreakdown } from '../types';
import { PieChart as ChartIcon } from 'lucide-react';

interface RevenueChartProps {
  breakdown: RevenueBreakdown[];
}

const scenarioLabels: Record<string, string> = {
  payment_failure: 'Payment Failures',
  checkout_abandonment: 'Checkout Dropoff',
  subscription_failure: 'Failed Subscriptions',
  invoice_overdue: 'Overdue Invoices',
};

const scenarioColors: Record<string, string> = {
  payment_failure: '#3b82f6',
  checkout_abandonment: '#8b5cf6',
  subscription_failure: '#f59e0b',
  invoice_overdue: '#10b981',
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
    <Card padding="spacing.5">
      <CardBody>
        <Box display="flex" flexDirection="column" gap="spacing.5">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap="spacing.3">
              <ChartIcon size={20} color="#8b5cf6" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Revenue at Risk Breakdown
              </Heading>
            </Box>
            <Badge color="information" size="medium">
              Total: ₹{(totalAtRisk / 100000).toFixed(2)}L
            </Badge>
          </Box>

          <Box height="260px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount at Risk']}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap="spacing.3">
            {chartData.map((item) => (
              <Box key={item.name} display="flex" alignItems="center" gap="spacing.2">
                <span style={{ width: '10px', height: '10px', borderRadius: '4px', backgroundColor: item.color, display: 'inline-block' }} />
                <Text size="xsmall" color="surface.text.gray.muted">
                  {item.name}: <strong style={{ color: '#f8fafc' }}>₹{item.amount.toLocaleString('en-IN')}</strong> ({item.count})
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};
