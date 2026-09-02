import React, { useState, useEffect } from 'react';
import { getRecoveries, createTestCase, customerPay, customerOptOut, customerPromise, customerDispute } from '../services/api';
import { RecoveryCase } from '../types';
import { ShoppingBag, CreditCard, RefreshCw, Send, CheckCircle2, AlertTriangle, ShieldCheck, Clock, UserX, MessageSquare, Sparkles, ArrowRight, ExternalLink, Calendar, Plus, Smartphone, Building, ShieldAlert, Check, Search, Filter, Hash, User, DollarSign } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CaseInspectModal } from '../components/CaseInspectModal';

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
  const [searchParams] = useSearchParams();
  const queryCaseId = searchParams.get('caseId') || searchParams.get('id');
  const queryCustomerId = searchParams.get('customerId');
  const queryPaymentId = searchParams.get('paymentId');

  const [activeTab, setActiveTab] = useState<'outreach' | 'simulator'>('outreach');
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [inspectingModalCase, setInspectingModalCase] = useState<any | null>(null);

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

  const fetchCases = async (selectId?: string) => {
    setLoading(true);
    try {
      let res = await getRecoveries({ limit: 200 });
      let list = res.cases || [];

      // If query param is requested but not in active recoveries list, fetch catalog to show that specific customer
      const targetQuery = selectId || queryCaseId || queryCustomerId || queryPaymentId;
      if (targetQuery && (!list.length || !list.some((c: any) => c.caseId === targetQuery || c._id === targetQuery || c.customerId === targetQuery || c.paymentId === targetQuery))) {
        const catalogRes = await getRecoveries({ limit: 200, includeCatalog: 'true' } as any);
        if (catalogRes.cases && catalogRes.cases.length) {
          list = catalogRes.cases;
        }
      }

      setCases(list);

      const targetToMatch = selectId || queryCaseId || queryCustomerId || queryPaymentId;
      if (targetToMatch) {
        const found = list.find((c: any) =>
          c.caseId === targetToMatch ||
          c._id === targetToMatch ||
          c.customerId === targetToMatch ||
          c.paymentId === targetToMatch
        );
        if (found) {
          setSelectedCase(found);
          return;
        }
      }

      if (list.length > 0) {
        if (!selectedCase || !list.some((c: any) => c.caseId === selectedCase.caseId)) {
          setSelectedCase(list[0]);
        } else {
          const updated = list.find((c: any) => c.caseId === selectedCase.caseId);
          if (updated) setSelectedCase(updated);
        }
      } else {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error('Failed to load dynamic cases for customer portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [queryCaseId, queryCustomerId, queryPaymentId]);

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
      await customerPay(targetId, selectedMethod);
      const amountVal = selectedCase.amountAtRisk || selectedCase.amount || 0;
      setActionSuccessMessage(`🎉 Payment of ₹${amountVal.toLocaleString('en-IN')} successfully verified via Razorpay API! Transaction status updated to RECOVERED.`);
      
      // Instant synchronous UI update across both right card and left list
      setSelectedCase((prev: any) => ({ ...prev, status: 'RECOVERED', recoveredAmount: amountVal }));
      setCases(prev => prev.map(c => ((c.caseId === selectedCase.caseId || (c as any)._id === selectedCase._id || (c as any).paymentId === selectedCase.paymentId) ? { ...c, status: 'RECOVERED', recoveredAmount: amountVal } : c)));
      
      await fetchCases(selectedCase.caseId);
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
      setActionSuccessMessage('🛑 STOP-02 Activated: Customer consent revoked. All recovery automation for this account is permanently HALTED in MongoDB.');
      
      // Instant synchronous UI update across both right card and left list
      setSelectedCase((prev: any) => ({ ...prev, status: 'HALTED', optedOut: true }));
      setCases(prev => prev.map(c => ((c.caseId === selectedCase.caseId || (c as any)._id === selectedCase._id || (c as any).paymentId === selectedCase.paymentId) ? { ...c, status: 'HALTED', optedOut: true } : c)));
      
      await fetchCases(selectedCase.caseId);
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
      setActionSuccessMessage(`📅 Promise-to-Pay registered for ${promisedDateInput}. Automated follow-up paused until commitment date.`);
      
      // Instant synchronous UI update across both right card and left list
      setSelectedCase((prev: any) => ({ ...prev, status: 'PROMISE_LOGGED' }));
      setCases(prev => prev.map(c => ((c.caseId === selectedCase.caseId || (c as any)._id === selectedCase._id || (c as any).paymentId === selectedCase.paymentId) ? { ...c, status: 'PROMISE_LOGGED' } : c)));
      
      await fetchCases(selectedCase.caseId);
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
      setActionSuccessMessage('⚠️ STOP-03 Activated: Dispute logged. Outreach suspended immediately and case routed to Human Review Queue.');
      
      // Instant synchronous UI update across both right card and left list
      setSelectedCase((prev: any) => ({ ...prev, status: 'HUMAN_REVIEW', hasDispute: true }));
      setCases(prev => prev.map(c => ((c.caseId === selectedCase.caseId || (c as any)._id === selectedCase._id || (c as any).paymentId === selectedCase.paymentId) ? { ...c, status: 'HUMAN_REVIEW', hasDispute: true } : c)));
      
      await fetchCases(selectedCase.caseId);
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
      const createdObj = res.recoveryCase || res.transaction;
      setSimCreatedCase(createdObj);
      await fetchCases(createdObj.caseId);
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

  const filteredCases = cases.filter((c: any) => {
    const matchSearch =
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchScenario = scenarioFilter === 'all' || c.scenario === scenarioFilter;
    return matchSearch && matchScenario;
  });

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
              <span>Customer Action Portal</span>
            </div>
            <div className="neo-badge neo-badge-green">
              <span>{cases.length} Dynamic Live Cases</span>
            </div>
          </div>

          <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: '4px 0 0 0' }}>
            Customer Action Hub & Real-Time Checkout Sandbox
          </h1>

          <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500, margin: 0 }}>
            100% dynamic customer-facing portal linked directly to your tested database cases. Experience two-way interactive actions (pay, switch payment method, promise dates, opt-out) or simulate live merchant checkouts.
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          {/* Left Column: Select Case / Customer Stream */}
          <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Live Customer Incidents ({filteredCases.length})</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Select any tested customer to open their live interactive sheet</span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search customer, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neo-input"
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'payment_failure', label: 'Payments' },
                  { key: 'checkout_abandonment', label: 'Carts' },
                  { key: 'subscription_failure', label: 'Subscriptions' },
                  { key: 'invoice_overdue', label: 'B2B Invoices' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setScenarioFilter(f.key)}
                    className={`neo-btn neo-btn-sm ${scenarioFilter === f.key ? 'neo-btn-primary' : 'neo-btn-white'}`}
                    style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredCases.length > 0 ? (
                filteredCases.map((c: any) => {
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
                        padding: '12px 14px',
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
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#121316' }}>{c.customerName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {c.caseId} • {c.scenario?.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '14px' }}>
                          ₹{(c.amountAtRisk || c.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <div className={`neo-badge ${badgeClass}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {c.status}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Smartphone size={36} color="#94a3b8" />
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#334155' }}>No Active Live Customer Incidents</div>
                  <div style={{ fontSize: '12px', lineHeight: 1.5, maxWidth: '280px' }}>
                    Click <strong>"Run Batch"</strong> in the top bar to evaluate all 180 baseline leaks, or switch to the <strong>"Live Checkout Sandbox"</strong> tab to simulate a live customer checkout drop!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Interactive Mobile/Web Sheet */}
          {selectedCase ? (
            <div className="neo-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-black)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="neo-badge neo-badge-blue" style={{ fontSize: '11px' }}>
                      {selectedCase.caseId}
                    </span>
                    <span className={`neo-badge ${selectedCase.status === 'RECOVERED' ? 'neo-badge-green' : selectedCase.status === 'HUMAN_REVIEW' ? 'neo-badge-yellow' : 'neo-badge-coral'}`} style={{ fontSize: '11px' }}>
                      {selectedCase.status}
                    </span>
                    <span className="neo-badge" style={{ fontSize: '11px' }}>
                      {selectedCase.scenario?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '24px', margin: '4px 0 0 0' }}>{selectedCase.customerName}</h2>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Customer ID: <strong>{selectedCase.customerId || 'CUS_999'}</strong> • Risk: {selectedCase.customerRiskLevel || 'Low'} • Attempts: {selectedCase.attemptCount || 0}/2
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>TOTAL AMOUNT DUE</span>
                  <span style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#121316' }}>
                    ₹{(selectedCase.amountAtRisk || selectedCase.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Dynamic Notification Context Box */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: selectedCase.status === 'RECOVERED' ? '#16a34a' : selectedCase.status === 'HALTED' ? '#dc2626' : selectedCase.status === 'HUMAN_REVIEW' ? '#b45309' : '#0284c7', fontWeight: 800, fontSize: '12px' }}>
                  <MessageSquare size={14} />
                  <span>
                    {selectedCase.status === 'UNPROCESSED'
                      ? `Live Winback Notification Preview (Will dispatch upon pipeline run or test response below):`
                      : selectedCase.status === 'RECOVERED'
                      ? `✓ Live Customer Payment Verified via Razorpay API (Settlement Cleared):`
                      : selectedCase.status === 'PROMISE_LOGGED'
                      ? `📅 Promise-to-Pay Commitment Registered by Customer (Dunning Paused):`
                      : selectedCase.status === 'HALTED'
                      ? `🛑 STOP-02 Activated: Customer Opted Out (Outreach Permanently Halted):`
                      : selectedCase.status === 'HUMAN_REVIEW'
                      ? `⚠️ STOP-03 Activated: Dispute Filed (Routed to Human Review Queue):`
                      : `Live Autonomous Winback Notification Dispatched to ${selectedCase.customerName}:`}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.4 }}>
                  {selectedCase.scenario === 'subscription_failure'
                    ? `Hi ${selectedCase.customerName}, your recurring subscription charge of ₹${(selectedCase.amountAtRisk || 299).toLocaleString('en-IN')} failed due to card token expiration. A non-disruptive 7-day grace period is active. Please update your mandate details below to maintain active service.`
                    : selectedCase.scenario === 'checkout_abandonment'
                    ? `Hi ${selectedCase.customerName}, we noticed you left items in your shopping cart! We saved your items for 24 hours. Click below to complete your checkout with 1-click Razorpay checkout.`
                    : selectedCase.scenario === 'invoice_overdue'
                    ? `Dear Accounts Team at ${selectedCase.customerName}, Commercial Invoice #${selectedCase.caseId} for ₹${(selectedCase.amountAtRisk || 250000).toLocaleString('en-IN')} is overdue. Please select your planned payout date or pay directly via virtual account.`
                    : `Hi ${selectedCase.customerName}, your transaction of ₹${(selectedCase.amountAtRisk || 5000).toLocaleString('en-IN')} experienced a temporary gateway network timeout. Click below to retry seamlessly.`}
                </div>
              </div>

              {/* Success Notification Alert */}
              {actionSuccessMessage && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '13px', border: '1.5px solid #86efac' }}>
                  {actionSuccessMessage}
                </div>
              )}

              {/* Dynamic Interactive Customer Options / State Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#64748b' }}>
                  {selectedCase.status === 'RECOVERED'
                    ? 'SETTLEMENT VERIFICATION STATUS:'
                    : selectedCase.status === 'HALTED' || selectedCase.optedOut
                    ? 'COMPLIANCE CONSENT STATUS:'
                    : selectedCase.status === 'HUMAN_REVIEW' || selectedCase.hasDispute
                    ? 'DISPUTE REVIEW STATUS:'
                    : selectedCase.status === 'PROMISE_LOGGED'
                    ? 'COMMITMENT TRACKING STATUS:'
                    : 'INTERACTIVE TWO-WAY CUSTOMER ACTIONS:'}
                </span>

                {/* State 1: Paid / Settled */}
                {selectedCase.status === 'RECOVERED' ? (
                  <div style={{ padding: '24px', borderRadius: '12px', border: '2px solid #86efac', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: '#14532d' }}>Payment Successfully Settled &amp; Cleared</div>
                      <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                        Verified via Razorpay API • ₹{(selectedCase.amountAtRisk || selectedCase.amount || 0).toLocaleString('en-IN')} paid in full.
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 700, backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      ✓ Transaction Closed • Zero Outstanding Balance • Ledger Sealed
                    </div>
                  </div>
                ) : selectedCase.status === 'HALTED' || selectedCase.optedOut ? (
                  /* State 2: Opted Out (STOP-02) */
                  <div style={{ padding: '24px', borderRadius: '12px', border: '2px solid #fca5a5', backgroundColor: '#fef2f2', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                      <UserX size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: '#7f1d1d' }}>Outreach Permanently Halted (STOP-02)</div>
                      <div style={{ fontSize: '13px', color: '#991b1b', marginTop: '4px', maxWidth: '380px' }}>
                        Customer consent was revoked. Per compliance rules, all automated outreach, payment reminders, and gateway retries are permanently frozen for this customer.
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 700, backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      🛑 DO NOT CONTACT Status Active in Master Record
                    </div>
                  </div>
                ) : selectedCase.status === 'HUMAN_REVIEW' || selectedCase.hasDispute ? (
                  /* State 3: Dispute Active (STOP-03) */
                  <div style={{ padding: '24px', borderRadius: '12px', border: '2px solid #fde047', backgroundColor: '#fffbeb', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                      <AlertTriangle size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: '#78350f' }}>Dispute Escalated to Human Review (STOP-03)</div>
                      <div style={{ fontSize: '13px', color: '#92400e', marginTop: '4px', maxWidth: '380px' }}>
                        Active dispute logged. Automated dunning is frozen, and this case has been assigned to a compliance operator in the Review Queue.
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 700, backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                      ⚠️ Operator Review Required in Human Queue
                    </div>
                  </div>
                ) : selectedCase.status === 'REJECTED' ? (
                  /* State 4: Rejected by Guardrail / Human Reviewer */
                  <div style={{ padding: '24px', borderRadius: '12px', border: '2px solid #fca5a5', backgroundColor: '#fef2f2', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                      <AlertTriangle size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: '#7f1d1d' }}>Intervention Rejected by Policy Guardrail</div>
                      <div style={{ fontSize: '13px', color: '#991b1b', marginTop: '4px', maxWidth: '380px' }}>
                        This intervention was rejected by a compliance reviewer or financial safety policy. All payment links, retries, and dunning sequences have been cancelled and disabled.
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 700, backgroundColor: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      🚫 Outreach Blocked &amp; Cancelled
                    </div>
                  </div>
                ) : selectedCase.status === 'PROMISE_LOGGED' ? (
                  /* State 5: Promise-to-Pay Active */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ padding: '18px', borderRadius: '12px', border: '2px solid #93c5fd', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Clock size={24} color="#1d4ed8" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e3a8a' }}>Promise-to-Pay Commitment Active</div>
                        <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '2px' }}>
                          Scheduled Settlement Target: <strong>{promisedDateInput || '2026-09-05'}</strong>. Automated dunning reminders are paused until this date.
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '12px', border: '2px solid var(--border-black)', backgroundColor: '#fffdfa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13px' }}>Want to settle now ahead of scheduled commitment date?</div>
                      <button onClick={handleCustomerPay} disabled={isProcessingAction} className="neo-btn neo-btn-primary" style={{ fontWeight: 800, width: '100%', justifyContent: 'center' }}>
                        {isProcessingAction ? 'Processing...' : `💳 Pay ₹${(selectedCase.amountAtRisk || 0).toLocaleString('en-IN')} Now`}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* State 5: Active Action Form for Unprocessed / Evaluated cases */
                  <>
                    {/* Option 1: Scenario-Specific Payment / Retry Execution */}
                    <div style={{ padding: '16px', borderRadius: '12px', border: '2px solid var(--border-black)', backgroundColor: '#fffdfa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>
                          {selectedCase.scenario === 'subscription_failure'
                            ? '💳 Update Card Mandate & Re-Authorize'
                            : selectedCase.scenario === 'invoice_overdue'
                            ? '🏢 Clear Commercial Invoice (NEFT / Virtual Account)'
                            : '⚡ 1-Click Pay / Complete Payment Retry'}
                        </div>
                        <span className="neo-badge neo-badge-green" style={{ fontSize: '10px' }}>Instant Settlement</span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <select
                          value={selectedMethod}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 700, fontSize: '12px', flex: 1, minWidth: '180px' }}
                        >
                          <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                          <option value="card">Credit / Debit Card</option>
                          <option value="netbanking">Netbanking (HDFC, ICICI, SBI)</option>
                          {selectedCase.scenario === 'invoice_overdue' && <option value="bank_transfer">NEFT / RTGS Virtual Account</option>}
                        </select>

                        <button
                          onClick={handleCustomerPay}
                          disabled={isProcessingAction}
                          className="neo-btn neo-btn-primary"
                          style={{ fontWeight: 800 }}
                        >
                          {isProcessingAction ? 'Processing...' : `💳 Pay ₹${(selectedCase.amountAtRisk || 0).toLocaleString('en-IN')}`}
                        </button>
                      </div>
                    </div>

                    {/* Option 2: Promise to Pay Date Registration */}
                    <div style={{ padding: '16px', borderRadius: '12px', border: '2px solid var(--border-black)', backgroundColor: '#fffdfa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>📅 Register Promise-to-Pay Date (Pause Dunning)</div>
                        <span className="neo-badge neo-badge-blue" style={{ fontSize: '10px' }}>Holds Escalations</span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                          type="date"
                          value={promisedDateInput}
                          onChange={(e) => setPromisedDateInput(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid var(--border-black)', fontWeight: 700, fontSize: '12px', flex: 1, minWidth: '180px' }}
                        />

                        <button
                          onClick={handleCustomerPromise}
                          disabled={isProcessingAction}
                          className="neo-btn neo-btn-white"
                          style={{ fontWeight: 800 }}
                        >
                          <Calendar size={14} />
                          <span>Submit Commitment Date</span>
                        </button>
                      </div>
                    </div>

                    {/* Option 3: Compliance & Stopping Rules (STOP-02 Opt Out and STOP-03 Dispute) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button
                        onClick={handleCustomerOptOut}
                        disabled={isProcessingAction}
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
                        <span>⚠️ Report Dispute (STOP-03)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  onClick={() => setInspectingModalCase(selectedCase)}
                  className="neo-btn neo-btn-sm neo-btn-white"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
                >
                  <span>⚡ Quick Inspect Audit</span>
                  <ExternalLink size={12} />
                </button>

                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  🔒 100% Real-Time MongoDB Synced
                </span>
              </div>
            </div>
          ) : (
            <div className="neo-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '16px', backgroundColor: '#ffffff', minHeight: '360px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={32} color="#64748b" />
              </div>
              <h3 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Awaiting Customer Incident Stream</h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: 0 }}>
                Click <strong>"Run Batch"</strong> in the top header to run the winback pipeline on your 180 test cases, or switch to the <strong>"Live Checkout Sandbox"</strong> tab to trigger a real-time customer leak!
              </p>
              <button
                onClick={() => setActiveTab('simulator')}
                className="neo-btn neo-btn-primary"
                style={{ fontWeight: 800 }}
              >
                <ShoppingBag size={14} />
                <span>Simulate Drop in Sandbox &gt;</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Global Reusable Quick-Inspect Modal ─── */}
      {inspectingModalCase && (
        <CaseInspectModal
          caseData={inspectingModalCase}
          onClose={() => setInspectingModalCase(null)}
          onUpdate={() => fetchCases(inspectingModalCase.caseId)}
        />
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
                <span style={{ fontSize: '12px', color: '#64748b' }}>Simulate a real shopper checking out on a live e-commerce store</span>
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
