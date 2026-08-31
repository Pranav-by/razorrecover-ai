import React, { useEffect, useState } from 'react';
import { Box, Card, CardBody, Heading, Text, Badge, Button } from '@razorpay/blade/components';
import { RecoveryCase } from '../types';
import { getRecoveries } from '../services/api';
import { Layers, Filter, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Recoveries: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (selectedScenario !== 'all') params.scenario = selectedScenario;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      const res = await getRecoveries(params);
      setCases(res.cases);
      setTotal(res.total);
    } catch (err) {
      console.error('Error fetching recovery cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedScenario, selectedStatus]);

  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.scenario?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const exportCSV = () => {
    window.open('/api/recovery/batch/latest/export?format=csv', '_blank');
  };

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6" padding="spacing.7">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="spacing.4">
        <Box display="flex" alignItems="center" gap="spacing.3">
          <Layers size={24} color="#0c8ce9" />
          <Box display="flex" flexDirection="column">
            <Heading size="large" weight="semibold" color="surface.text.gray.normal">
              Revenue Leakage Cases & Interventions
            </Heading>
            <Text size="small" color="surface.text.gray.muted">
              Explore detected revenue risks, AI probability models, policy outcomes, and execution status.
            </Text>
          </Box>
        </Box>

        <Box display="flex" gap="spacing.3">
          <Button variant="secondary" size="medium" onClick={exportCSV}>
            Export Audit Matrix (CSV)
          </Button>
        </Box>
      </Box>

      {/* Filter Toolbar */}
      <Card padding="spacing.4">
        <CardBody>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="spacing.4">
            <Box display="flex" alignItems="center" gap="spacing.3" flexWrap="wrap">
              <Filter size={18} color="#94a3b8" />
              <Text size="small" weight="semibold" color="surface.text.gray.normal">
                Scenario:
              </Text>
              {['all', 'payment_failure', 'checkout_abandonment', 'subscription_failure', 'invoice_overdue'].map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScenario(sc)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: selectedScenario === sc ? 700 : 500,
                    cursor: 'pointer',
                    border: selectedScenario === sc ? '1px solid #0c8ce9' : '1px solid #334155',
                    backgroundColor: selectedScenario === sc ? 'rgba(12, 140, 233, 0.2)' : '#1e293b',
                    color: selectedScenario === sc ? '#38bdf8' : '#94a3b8',
                  }}
                >
                  {sc.replace(/_/g, ' ').toUpperCase()}
                </button>
              ))}
            </Box>

            {/* Search Box */}
            <Box display="flex" alignItems="center" gap="spacing.2">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search customer, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Table */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Text size="small" weight="semibold" color="surface.text.gray.normal">
                Displaying {filteredCases.length} of {total} detected cases
              </Text>
            </Box>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '12px 16px' }}>Case ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Scenario</th>
                    <th style={{ padding: '12px 16px' }}>Amount at Risk</th>
                    <th style={{ padding: '12px 16px' }}>Winback Prob.</th>
                    <th style={{ padding: '12px 16px' }}>Strategy Intervention</th>
                    <th style={{ padding: '12px 16px' }}>State Machine Status</th>
                    <th style={{ padding: '12px 16px' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((item) => {
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
                            {item.recommendedAction ? item.recommendedAction.replace(/_/g, ' ') : 'N/A'}
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
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};
