import React from 'react';
import { Shield, Clock, AlertTriangle, MessageSquare, CheckCircle2 } from 'lucide-react';

export const Policies: React.FC = () => {
  const financialRules = [
    { name: 'MAX_PAYMENT_RETRIES', value: '2 retries', desc: 'Maximum autonomous retry attempts per failed transaction before mandatory human escalation.' },
    { name: 'AUTO_ACTION_LIMIT', value: '₹10,000', desc: 'Transactions above this financial threshold require explicit human reviewer sign-off.' },
    { name: 'MIN_RECOVERY_CONFIDENCE', value: '0.75 (75%)', desc: 'Minimum AI model confidence required to execute automated recovery intervention without human review.' },
    { name: 'HIGH_VALUE_THRESHOLD', value: '₹50,000', desc: 'High-value transactions trigger automated hold and executive approval routing.' },
  ];

  const complianceRules = [
    { name: 'CONTACT_WINDOW', value: '09:00 – 19:00 IST', desc: 'Strict RBI/TRAI compliant outbound communication hours; outside hours automatically queue.' },
    { name: 'FREQUENCY_CAP', value: '1 msg / 24h (Max 3 total)', desc: 'Caps per customer to prevent communication fatigue and enforce regulatory fair practice.' },
    { name: 'CHANNEL_CONSENT', value: 'Consented Only', desc: 'Outbound channels strictly checked against customer consent flags (SMS, Email).' },
    { name: 'DO_NOT_CONTACT_FLAG', value: 'Instant Permanent Stop', desc: 'Customer opt-out immediately freezes all autonomous outreach forever.' },
  ];

  const templates = [
    { id: 'payment_reminder_gentle', text: 'Hi {name}, your payment of {amount} for {order} didn\'t go through. No action needed if this was intentional — otherwise, here\'s a quick link to retry: {link}' },
    { id: 'subscription_card_expired', text: 'Hi {name}, we couldn\'t renew your {plan} subscription because your card on file has expired. Update it here: {link}. Your access continues uninterrupted for the next {grace_days} days.' },
    { id: 'invoice_reminder_b2b', text: 'Hi {contact_name}, a friendly note that invoice {invoice_id} for {amount} was due on {due_date}. Could you confirm an expected payment date? {link}' },
  ];

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
              backgroundColor: '#22c55e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--border-black)',
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Financial & Regulatory Guardrail Engine</h2>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Deterministic bounds governing autonomous agent financial movements & customer communications
            </span>
          </div>
        </div>

        <div className="neo-badge neo-badge-green">
          <span>Active & Enforced</span>
        </div>
      </div>

      {/* Financial Risk & Action Caps */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="#f97316" />
          <h3 style={{ fontSize: '18px', margin: 0 }}>Financial Risk & Action Caps</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {financialRules.map((rule) => (
            <div
              key={rule.name}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#ffffff',
                boxShadow: '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--border-black)' }}>
                  {rule.name}
                </span>
                <div className="neo-badge neo-badge-yellow" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {rule.value}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
                {rule.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory & Communication Compliance */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '18px', margin: 0 }}>Compliant Escalation & Customer Protection</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {complianceRules.map((rule) => (
            <div
              key={rule.name}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#ffffff',
                boxShadow: '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--border-black)' }}>
                  {rule.name}
                </span>
                <div className="neo-badge neo-badge-blue" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {rule.value}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
                {rule.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Approved Message Template Library */}
      <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={20} color="#a855f7" />
          <h3 style={{ fontSize: '18px', margin: 0 }}>Approved Template Library (No Unvetted LLM Outbounds)</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: '2px solid var(--border-black)',
                backgroundColor: '#ffffff',
                boxShadow: '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div className="neo-badge neo-badge-yellow" style={{ alignSelf: 'flex-start', fontSize: '11px', padding: '2px 8px' }}>
                {tpl.id}
              </div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#121316', fontStyle: 'italic' }}>
                "{tpl.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
