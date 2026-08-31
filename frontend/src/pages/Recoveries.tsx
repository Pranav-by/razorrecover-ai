import React, { useEffect, useState } from 'react';
import { RecoveryCase } from '../types';
import { getRecoveries, executeTestCase } from '../services/api';
import { Layers, Filter, Search, ChevronRight, Download, Star, Play, Sparkles, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Recoveries: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Single Execution State
  const [executingCaseId, setExecutingCaseId] = useState<string | null>(null);
  const [singleExecutionResult, setSingleExecutionResult] = useState<any | null>(null);

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

  const handleExecuteSingleCase = async (caseId: string) => {
    setExecutingCaseId(caseId);
    try {
      const result = await executeTestCase(caseId);
      setSingleExecutionResult(result);
      await fetchCases();
    } catch (err) {
      console.error('Error executing single case from recoveries:', err);
    } finally {
      setExecutingCaseId(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.scenario?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 24px 80px 24px' }}>
      {/* Header */}
      <div
        className="neo-card"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="neo-badge neo-badge-blue">
              <Layers size={12} />
              <span>Telemetry Explorer</span>
            </div>
          </div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Revenue Leak Inventory</h1>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            {total} detected leak incidents • Execute single cases with 1-click or inspect full audit trails
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/test-cases" className="neo-btn neo-btn-primary neo-btn-sm">
            <span>⚡ Open Test Suite Sandbox</span>
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div
        className="neo-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Scenario Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="#64748b" />
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="neo-input"
              style={{ height: '38px', fontSize: '12px', fontWeight: 700 }}
            >
              <option value="all">All Scenarios</option>
              <option value="payment_failure">Payment Failures</option>
              <option value="checkout_abandonment">Checkout Drops</option>
              <option value="subscription_failure">Subscriptions</option>
              <option value="invoice_overdue">B2B Invoices</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="neo-input"
            style={{ height: '38px', fontSize: '12px', fontWeight: 700 }}
          >
            <option value="all">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="STRATEGY_SELECTED">Strategy Selected</option>
            <option value="RECOVERED">Recovered</option>
            <option value="HUMAN_REVIEW">Human Review</option>
            <option value="BLOCKED">Blocked</option>
            <option value="HALTED">Halted</option>
          </select>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
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
                <th style={{ padding: '12px 14px' }}>1-Click Execute</th>
                <th style={{ padding: '12px 14px' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((item, idx) => {
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
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)' }}>
                          {Math.round((item.recoveryProbability || 0) * 100)}%
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>EV: ₹{item.expectedRecoveryValue || 0}</span>
                      </div>
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
      </div>

      {/* ─── Live Single Execution Stepper Modal (1-Click Trigger) ─── */}
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
