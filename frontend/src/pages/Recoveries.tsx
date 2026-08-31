import React, { useEffect, useState } from 'react';
import { RecoveryCase } from '../types';
import { getRecoveries } from '../services/api';
import { Layers, Filter, Search, ChevronRight, Download, Star } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 24px 80px 24px' }}>
      {/* Header */}
      <div
        className="neo-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '2px solid var(--border-black)',
              backgroundColor: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--border-black)',
            }}
          >
            <Layers size={22} color="#121316" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Revenue Leakage Cases & Interventions</h2>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              AI diagnosis, Expected Recovery Value ($Amount \times P$) & settlement tracking
            </span>
          </div>
        </div>

        <button onClick={exportCSV} className="neo-btn neo-btn-white">
          <Download size={16} />
          <span>Export Audit Matrix (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="neo-card-flat"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Scenario Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Scenario:</span>
          {[
            { id: 'all', label: 'All Leaks' },
            { id: 'payment_failure', label: 'Payment Failures' },
            { id: 'checkout_abandonment', label: 'Checkout Dropoff' },
            { id: 'subscription_failure', label: 'Subscriptions' },
            { id: 'invoice_overdue', label: 'B2B Invoices' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                border: '2px solid var(--border-black)',
                backgroundColor: selectedScenario === sc.id ? 'var(--accent-yellow)' : '#ffffff',
                boxShadow: selectedScenario === sc.id ? '2px 2px 0px var(--border-black)' : 'none',
                color: '#121316',
                transition: 'all 0.15s ease',
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          <input
            type="text"
            placeholder="Search customer, case ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input"
            style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Cases Table */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
            Showing {filteredCases.length} of {total} detected revenue leak cases
          </span>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2.5px solid var(--border-black)', color: '#121316', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                <th style={{ padding: '12px 14px' }}>Case ID</th>
                <th style={{ padding: '12px 14px' }}>Customer</th>
                <th style={{ padding: '12px 14px' }}>Scenario</th>
                <th style={{ padding: '12px 14px' }}>Amount at Risk</th>
                <th style={{ padding: '12px 14px' }}>Winback Prob.</th>
                <th style={{ padding: '12px 14px' }}>Strategy Action</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((item, idx) => {
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
                      <div className="neo-badge neo-badge-yellow" style={{ fontSize: '10px', padding: '2px 8px', textTransform: 'uppercase' }}>
                        {item.recommendedAction
                          ? item.recommendedAction.replace(/_/g, ' ')
                          : item.scenario === 'payment_failure'
                          ? 'retry payment'
                          : item.scenario === 'checkout_abandonment'
                          ? 'generate link'
                          : item.scenario === 'subscription_failure'
                          ? 'update method'
                          : 'send reminder'}
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
      </div>
    </div>
  );
};
