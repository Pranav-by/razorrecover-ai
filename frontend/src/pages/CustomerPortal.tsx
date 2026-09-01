import React, { useState, useEffect } from 'react';
import { getRecoveries, createTestCase, customerPay, customerOptOut, customerPromise, customerDispute } from '../services/api';
import { RecoveryCase } from '../types';
import { ShoppingBag, CreditCard, RefreshCw, Send, CheckCircle2, AlertTriangle, ShieldCheck, Clock, UserX, MessageSquare, Sparkles, ArrowRight, ExternalLink, Calendar, Plus, Smartphone, Building, ShieldAlert, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const SCENARIO_CONFIG: Record<string, {
  label: string;
  reasons: { value: string; label: string }[];
  methods: { value: string; label: string }[];
  defaultReason: string;
  defaultMethod: string;
}> = {
  payment_failure: {
    label: 'Payment Failure',
    reasons: [
      { value: 'upi_timeout', label: 'UPI Gateway Timeout (Recoverable)' },
      { value: 'bank_decline', label: 'Bank Authorization Decline' },
      { value: 'insufficient_funds', label: 'Insufficient Balance on Account' },
      { value: '2fa_timeout', label: '2FA / OTP Verification Timeout' },
      { value: 'network_drop', label: 'Gateway Network Drop' },
      { value: 'fraud_suspected', label: 'High-Risk Fraud Suspected (Policy Blocked)' },
    ],
    methods: [
      { value: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
      { value: 'card', label: 'Credit / Debit Card' },
      { value: 'netbanking', label: 'Netbanking (HDFC, ICICI, SBI)' },
    ],
    defaultReason: 'upi_timeout',
    defaultMethod: 'upi',
  },
  checkout_abandonment: {
    label: 'Checkout Abandonment (Cart Drop)',
    reasons: [
      { value: 'cart_abandoned_pricing', label: 'Price Objection / Cart Drop' },
      { value: 'cart_abandoned_shipping', label: 'High Shipping Friction Drop' },
      { value: 'payment_sheet_closed', label: 'Payment Sheet Closed Prematurely' },
      { value: 'session_expired', label: 'Checkout Session Timeout' },
    ],
    methods: [
      { value: 'upi', label: 'UPI Instant Checkout' },
      { value: 'card', label: 'Saved Card' },
      { value: 'emi', label: 'No-Cost EMI / PayLater' },
      { value: 'wallet', label: 'Digital Wallets' },
    ],
    defaultReason: 'cart_abandoned_pricing',
    defaultMethod: 'upi',
  },
  subscription_failure: {
    label: 'Subscription Mandate Failure',
    reasons: [
      { value: 'expired_card', label: 'Card Mandate Token Expired' },
      { value: 'mandate_insufficient_funds', label: 'Insufficient Funds on Renewal' },
      { value: 'token_revoked', label: 'Customer Revoked Mandate Token' },
      { value: 'bank_mandate_declined', label: 'Bank Declined Recurring Autodebit' },
    ],
    methods: [
      { value: 'card', label: 'Recurring Card Mandate' },
      { value: 'upi_autopay', label: 'UPI AutoPay Mandate' },
      { value: 'enach', label: 'eNACH Bank Autodebit' },
    ],
    defaultReason: 'expired_card',
    defaultMethod: 'card',
  },
  invoice_overdue: {
    label: 'Overdue Commercial B2B Invoice',
    reasons: [
      { value: 'net30_delayed_clearance', label: 'Net-30 Enterprise Terms Delayed' },
      { value: 'po_approval_pending', label: 'Purchase Order Approval Hold' },
      { value: 'finance_audit_hold', label: 'Corporate Finance Batch Audit Delay' },
      { value: 'disputed_line_item', label: 'Disputed Line Item on Contract' },
    ],
    methods: [
      { value: 'bank_transfer', label: 'Bank Transfer (NEFT / RTGS)' },
      { value: 'smart_collect', label: 'Razorpay Smart Collect (Virtual Account)' },
      { value: 'corporate_card', label: 'Commercial Corporate Card' },
    ],
    defaultReason: 'net30_delayed_clearance',
    defaultMethod: 'bank_transfer',
  },
};

export const CustomerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'outreach' | 'simulator'>('outreach');
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Customer Action States
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [promisedDateInput, setPromisedDateInput] = useState<string>('2026-09-05');
  const [disputeReasonInput, setDisputeReasonInput] = useState<string>('Disputed unexpected service renewal charge');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Live Checkout Simulator State
  const [simData, setSimData] = useState({
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav@example.com',
    amount: 4999,
    scenario: 'payment_failure',
    failureReason: 'upi_timeout',
    method: 'upi',
    orderDescription: 'Apple AirTags (4-Pack) - Priority Express Delivery',
    attempts: 0,
    optedOut: false,
    hasDispute: false,
  });
  const [simCreatedCase, setSimCreatedCase] = useState<any | null>(null);
  const [simSuccessPaid, setSimSuccessPaid] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await getRecoveries({ limit: 50 });
      setCases(res.cases);
      if (res.cases.length > 0 && !selectedCase) {
        setSelectedCase(res.cases[0]);
      }
    } catch (err) {
      console.error('Failed to load cases for customer portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleScenarioChange = (newScenario: string) => {
    const cfg = SCENARIO_CONFIG[newScenario] || SCENARIO_CONFIG.payment_failure;
    setSimData({
      ...simData,
      scenario: newScenario,
      failureReason: cfg.defaultReason,
      method: cfg.defaultMethod,
    });
  };

  const handleCustomerPay = async () => {
    if (!selectedCase) return;
    setIsProcessingAction(true);
    try {
      const targetId = selectedCase._id || selectedCase.paymentId || selectedCase.caseId;
      const res = await customerPay(targetId, selectedMethod);
      setActionSuccessMessage(`🎉 Payment of ₹${selectedCase.amountAtRisk?.toLocaleString('en-IN') || selectedCase.amount} completed successfully! Transaction status updated to RECOVERED.`);
      setSelectedCase((prev: any) => ({ ...prev, status: 'RECOVERED', recoveredAmount: prev.amountAtRisk }));
      await fetchCases();
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCustomerOptOut = async () => {
    if (!selectedCase) return;
    if (!window.confirm('Are you sure you want to opt-out from all notifications? (STOP-02 Guardrail will permanently freeze AI recovery)')) return;
    setIsProcessingAction(true);
    try {
      const targetId = selectedCase._id || selectedCase.paymentId || selectedCase.caseId;
      await customerOptOut(targetId);
      setActionSuccessMessage('🛑 STOP-02 Activated: You have been opted out. All automated winback notifications are now permanently frozen.');
      setSelectedCase((prev: any) => ({ ...prev, status: 'HALTED', optedOut: true }));
      await fetchCases();
    } catch (err) {
      console.error('Opt-out error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCustomerPromise = async () => {
    if (!selectedCase) return;
    setIsProcessingAction(true);
    try {
      const targetId = selectedCase._id || selectedCase.paymentId || selectedCase.caseId;
      await customerPromise(targetId, promisedDateInput);
      setActionSuccessMessage(`📅 Promise-to-Pay registered for ${promisedDateInput}. Automated reminders are paused until the promised date.`);
      setSelectedCase((prev: any) => ({ ...prev, status: 'PROMISE_LOGGED' }));
      await fetchCases();
    } catch (err) {
      console.error('Promise error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCustomerDispute = async () => {
    if (!selectedCase) return;
    setIsProcessingAction(true);
    try {
      const targetId = selectedCase._id || selectedCase.paymentId || selectedCase.caseId;
      await customerDispute(targetId, disputeReasonInput);
      setActionSuccessMessage('⚠️ STOP-03 Activated: Billing dispute registered. Outreach halted and transaction routed to human support.');
      setSelectedCase((prev: any) => ({ ...prev, status: 'HUMAN_REVIEW', hasDispute: true }));
      await fetchCases();
    } catch (err) {
      console.error('Dispute error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSimulateCheckoutFailure = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimSuccessPaid(false);
    setSimCreatedCase(null);
    try {
      const res = await createTestCase(simData);
      setSimCreatedCase(res.recoveryCase || res.transaction);
      await fetchCases();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateNormalSuccess = () => {
    setSimSuccessPaid(true);
    setSimCreatedCase(null);
  };

  const currentCfg = SCENARIO_CONFIG[simData.scenario] || SCENARIO_CONFIG.payment_failure;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 24px 80px 24px' }}>
      {/* ─── Hero Header Banner ─── */}
      <div
        className="neo-card"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, #fffdfa 0%, #fef08a 100%)',
          border: '3px solid var(--border-black)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="neo-badge neo-badge-blue">
              <Smartphone size={13} />
              <span>Customer-Facing Experience</span>
            </div>
            <div className="neo-badge neo-badge-green">
              <span>Real-Time Two-Way Interaction</span>
            </div>
          </div>

          <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: '4px 0 0 0' }}>
            Customer Action Portal & Live Checkout Simulator
          </h1>

          <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500, margin: 0 }}>
            Interact with automated agent winback outreach from the customer’s perspective (complete payment, update cards, commit promise dates, opt out) OR simulate checkout drops as a live shopper to watch RazorRecover AI detect and recover leaks in real-time.
          </p>
        </div>

        {/* Tab Switchers */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`neo-btn ${activeTab === 'outreach' ? 'neo-btn-primary' : 'neo-btn-white'}`}
            style={{ padding: '12px 18px', fontWeight: 800 }}
          >
            <MessageSquare size={16} />
            <span>Customer Action Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`neo-btn ${activeTab === 'simulator' ? 'neo-btn-primary' : 'neo-btn-white'}`}
            style={{ padding: '12px 18px', fontWeight: 800 }}
          >
            <ShoppingBag size={16} />
            <span>Live Checkout Sandbox</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: Customer Outreach & Action Hub ─── */}
      {activeTab === 'outreach' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Left Column: Select Case / Customer Stream */}
          <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Select Active Customer Outreach</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Pick a transaction to simulate the customer receiving agent messages</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {cases.map((c: any) => {
                const isSelected = selectedCase?.caseId === c.caseId || selectedCase?._id === c._id;
                let badgeClass = 'neo-badge-blue';
                if (c.status === 'RECOVERED') badgeClass = 'neo-badge-green';
                else if (c.status === 'HUMAN_REVIEW' || c.status === 'PAUSED') badgeClass = 'neo-badge-yellow';
                else if (c.status === 'HALTED' || c.status === 'BLOCKED') badgeClass = 'neo-badge-coral';

                return (
                  <div
                    key={c._id || c.caseId}
                    onClick={() => {
                      setSelectedCase(c);
                      setActionSuccessMessage(null);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: isSelected ? '2.5px solid #0284c7' : '1.5px solid var(--border-black)',
                      backgroundColor: isSelected ? '#e0f2fe' : '#ffffff',
                      boxShadow: isSelected ? '3px 3px 0px #0284c7' : '1.5px 1.5px 0px var(--border-black)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#121316' }}>{c.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {c.caseId} • {c.scenario?.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '15px' }}>
                        ₹{(c.amountAtRisk || c.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className={`neo-badge ${badgeClass}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {c.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Customer Interactive Mobile/Web Sheet */}
          {selectedCase && (
            <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-black)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="neo-badge neo-badge-blue" style={{ fontSize: '10px' }}>
                      {selectedCase.caseId}
                    </span>
                    <span className={`neo-badge ${selectedCase.status === 'RECOVERED' ? 'neo-badge-green' : selectedCase.status === 'HUMAN_REVIEW' ? 'neo-badge-yellow' : 'neo-badge-coral'}`} style={{ fontSize: '10px' }}>
                      {selectedCase.status}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', margin: 0 }}>Razorpay Customer Recovery Sheet</h2>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Recipient: <strong>{selectedCase.customerName}</strong> ({selectedCase.customerId || 'CUS_999'})
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>TOTAL PAYABLE</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                    ₹{(selectedCase.amountAtRisk || selectedCase.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Simulated Agent Notification Box */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #86efac',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '12px' }}>
                  <MessageSquare size={14} />
                  <span>Agent Recovery Message (Received by Customer):</span>
                </div>
                <div style={{ fontSize: '13px', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {selectedCase.scenario === 'subscription_failure'
                    ? `Hi ${selectedCase.customerName}, your subscription auto-debit of ₹${(selectedCase.amountAtRisk || 299).toLocaleString('en-IN')} could not be processed due to card token expiration. A 7-day grace period is active. Please update your payment method to avoid service interruption.`
                    : selectedCase.scenario === 'checkout_abandonment'
                    ? `Hi ${selectedCase.customerName}, we noticed you left items in your cart! Complete your order within 24 hours with your saved items via our fast 1-click Razorpay checkout link.`
                    : selectedCase.scenario === 'invoice_overdue'
                    ? `Dear Finance Team at ${selectedCase.customerName}, Invoice #${selectedCase.caseId} for ₹${(selectedCase.amountAtRisk || 250000).toLocaleString('en-IN')} is due. Please confirm your planned payout date or pay instantly.`
                    : `Hi ${selectedCase.customerName}, your recent payment of ₹${(selectedCase.amountAtRisk || 5000).toLocaleString('en-IN')} experienced a temporary bank timeout. Click below to retry seamlessly.`}
                </div>
              </div>

              {/* Success Notification Alert */}
              {actionSuccessMessage && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '13px', border: '1.5px solid #86efac' }}>
                  {actionSuccessMessage}
                </div>
              )}

              {/* Interactive Customer Action Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
                  CHOOSE YOUR ACTION AS THE CUSTOMER:
                </span>

                {/* Option 1: Pay / Retry Now */}
                <div style={{ padding: '16px', borderRadius: '12px', border: '2px solid var(--border-black)', backgroundColor: '#fffdfa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Option A: Pay Now / Complete Retry</div>
                    <span className="neo-badge neo-badge-green" style={{ fontSize: '10px' }}>Instant Settlement</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 700, fontSize: '12px', flex: 1 }}
                    >
                      <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="netbanking">Netbanking</option>
                    </select>

                    <button
                      onClick={handleCustomerPay}
                      disabled={isProcessingAction || selectedCase.status === 'RECOVERED'}
                      className="neo-btn neo-btn-primary"
                      style={{ fontWeight: 800 }}
                    >
                      {isProcessingAction ? 'Processing...' : selectedCase.status === 'RECOVERED' ? '✓ Paid' : '💳 Complete Payment'}
                    </button>
                  </div>
                </div>

                {/* Option 2: Promise to Pay (For B2B / Subscriptions) */}
                <div style={{ padding: '16px', borderRadius: '12px', border: '2px solid var(--border-black)', backgroundColor: '#fffdfa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Option B: Commit to a Promise-to-Pay Date</div>
                    <span className="neo-badge neo-badge-blue" style={{ fontSize: '10px' }}>Pause Dunning</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="date"
                      value={promisedDateInput}
                      onChange={(e) => setPromisedDateInput(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 700, fontSize: '12px', flex: 1 }}
                    />

                    <button
                      onClick={handleCustomerPromise}
                      disabled={isProcessingAction}
                      className="neo-btn neo-btn-white"
                      style={{ fontWeight: 800 }}
                    >
                      <Calendar size={14} />
                      <span>Register Promise</span>
                    </button>
                  </div>
                </div>

                {/* Compliance & Safety Actions: Opt Out (STOP-02) and Dispute (STOP-03) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={handleCustomerOptOut}
                    disabled={isProcessingAction || selectedCase.status === 'HALTED'}
                    className="neo-btn neo-btn-coral"
                    style={{ fontSize: '12px', justifyContent: 'center' }}
                    title="Triggers STOP-02 policy rule: customer consent revoked"
                  >
                    <UserX size={14} />
                    <span>🛑 Opt-Out (STOP-02)</span>
                  </button>

                  <button
                    onClick={handleCustomerDispute}
                    disabled={isProcessingAction}
                    className="neo-btn neo-btn-white"
                    style={{ fontSize: '12px', justifyContent: 'center', backgroundColor: '#fff7d6' }}
                    title="Triggers STOP-03 policy rule: dispute routed to human review"
                  >
                    <AlertTriangle size={14} color="#b45309" />
                    <span>⚠️ File Dispute (STOP-03)</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <Link to={`/recoveries/${selectedCase.caseId}`} className="neo-btn neo-btn-sm neo-btn-white" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Inspect Case in Dashboard</span>
                  <ExternalLink size={12} />
                </Link>

                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  🔒 256-Bit Encrypted Razorpay Checkout
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Live Checkout Simulator (Create New Leaks in Real-Time) ─── */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Merchant Store Form */}
          <div className="neo-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--border-black)', paddingBottom: '12px' }}>
              <ShoppingBag size={20} color="#0284c7" />
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>RazorFlow Merchant Checkout</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Simulate a shopper checking out on a live e-commerce / SaaS store</span>
              </div>
            </div>

            <form onSubmit={handleSimulateCheckoutFailure} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '4px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={simData.customerName}
                    onChange={(e) => setSimData({ ...simData, customerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '4px' }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={simData.amount}
                    onChange={(e) => setSimData({ ...simData, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '4px' }}>
                  Item / Order Description
                </label>
                <input
                  type="text"
                  required
                  value={simData.orderDescription}
                  onChange={(e) => setSimData({ ...simData, orderDescription: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 600 }}
                />
              </div>

              {/* Scenario Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '4px' }}>
                  Scenario Type
                </label>
                <select
                  value={simData.scenario}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 700 }}
                >
                  <option value="payment_failure">1. Payment Failure (UPI / Card decline)</option>
                  <option value="checkout_abandonment">2. Checkout Abandonment (Cart drop)</option>
                  <option value="subscription_failure">3. Subscription Failure (Mandate expiration)</option>
                  <option value="invoice_overdue">4. Overdue B2B Commercial Invoice</option>
                </select>
              </div>

              {/* Dynamic Failure Reason Dropdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '4px' }}>
                    Failure Reason Code ({currentCfg.label})
                  </label>
                  <select
                    value={simData.failureReason}
                    onChange={(e) => setSimData({ ...simData, failureReason: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 600 }}
                  >
                    {currentCfg.reasons.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={simData.method}
                    onChange={(e) => setSimData({ ...simData, method: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 600 }}
                  >
                    {currentCfg.methods.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleSimulateNormalSuccess}
                  className="neo-btn"
                  style={{ backgroundColor: '#c4f0c2', fontWeight: 800, justifyContent: 'center' }}
                >
                  <Check size={16} />
                  <span>✅ Simulate Success</span>
                </button>

                <button
                  type="submit"
                  disabled={isSimulating}
                  className="neo-btn neo-btn-coral"
                  style={{ fontWeight: 800, justifyContent: 'center' }}
                >
                  {isSimulating ? 'Triggering...' : '⚡ Trigger Leak Incident'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Real-Time Outcome Screen */}
          <div className="neo-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffdfa', textAlign: 'center', gap: '16px' }}>
            {simSuccessPaid ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', border: '3px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={36} color="#16a34a" />
                </div>
                <h2 style={{ fontSize: '22px', margin: 0, color: '#15803d' }}>Payment Successful!</h2>
                <p style={{ fontSize: '14px', color: '#475569', maxWidth: '380px' }}>
                  Standard checkout completed smoothly for ₹{simData.amount.toLocaleString('en-IN')}. No revenue leakage occurred.
                </p>
              </div>
            ) : simCreatedCase ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', border: '3px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={36} color="#dc2626" />
                </div>

                <div>
                  <h2 style={{ fontSize: '22px', margin: 0, color: '#991b1b' }}>Checkout Failed / Abandoned!</h2>
                  <span className="neo-badge neo-badge-coral" style={{ fontSize: '11px', marginTop: '6px' }}>
                    Revenue Leak Registered in Real-Time
                  </span>
                </div>

                <div style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#ffffff', border: '2px solid var(--border-black)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div><strong>Case ID:</strong> <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>{simCreatedCase.caseId || 'RC_LIVE_TEST'}</span></div>
                  <div><strong>Customer:</strong> {simData.customerName}</div>
                  <div><strong>Amount at Risk:</strong> ₹{simData.amount.toLocaleString('en-IN')}</div>
                  <div><strong>Detected Scenario:</strong> {simData.scenario?.replace(/_/g, ' ').toUpperCase()}</div>
                  <div><strong>Failure Reason:</strong> {simData.failureReason}</div>
                </div>

                <Link
                  to={`/recoveries`}
                  className="neo-btn neo-btn-primary neo-btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Sparkles size={16} />
                  <span>⚡ Watch RazorRecover AI Intervene & Recover &gt;</span>
                </Link>
              </div>
            ) : (
              <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={48} color="#94a3b8" />
                <span style={{ fontWeight: 700, fontSize: '15px' }}>Checkout Simulator Idle</span>
                <span style={{ fontSize: '13px', maxWidth: '320px' }}>
                  Fill out the form on the left and click "⚡ Trigger Leak Incident" to watch a live transaction failure become an autonomous recovery case.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
