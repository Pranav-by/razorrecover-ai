import React, { useState } from 'react';
import {
  Layers,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Smartphone,
  Lock,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Clock,
  FileCheck,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  description: string;
  highlights: string[];
  linkTo?: string;
  linkLabel?: string;
}

export const FeaturesShowcase: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('detection');

  const features: FeatureItem[] = [
    {
      id: 'detection',
      icon: <Layers size={22} />,
      iconBg: '#e0f2fe',
      iconColor: '#0369a1',
      title: '4-Track Revenue Leak Ingestion',
      badge: '4 MVP Scenarios',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      description:
        'Continuous ingestion and classification of payment dropoffs across e-commerce, SaaS, and B2B commercial accounts.',
      highlights: [
        '1. Transient Payment Failures (UPI timeouts, bank authorization drops)',
        '2. Checkout Abandonment (high-intent cart recovery with dynamic coupons)',
        '3. Subscription Mandate Failures (expired card tokens, grace periods)',
        '4. Overdue B2B Commercial Invoices (enterprise dunning & promise tracking)',
      ],
      linkTo: '/recoveries',
      linkLabel: 'Explore 180+ Cases',
    },
    {
      id: 'diagnostics',
      icon: <BrainCircuit size={22} />,
      iconBg: '#f3e8ff',
      iconColor: '#7e22ce',
      title: 'AI Diagnostics & Expected Value ($EV$)',
      badge: 'GPT-4o + EV Priority',
      badgeBg: '#f3e8ff',
      badgeColor: '#7e22ce',
      description:
        'Analyzes 16+ granular failure root causes and computes dynamic winback probabilities to maximize recovered value.',
      highlights: [
        'Deep root-cause synthesis with LLM reasoning + heuristic fallback',
        'Mathematical Expected Value ranking: EV = Amount × Winback Probability',
        'Customer risk tier assessment (low, medium, high) & prior attempt analysis',
        'Intelligent multi-channel routing (WhatsApp, SMS, Email, In-App)',
      ],
      linkTo: '/recoveries',
      linkLabel: 'Inspect EV Scores',
    },
    {
      id: 'guardrails',
      icon: <ShieldCheck size={22} />,
      iconBg: '#dcfce7',
      iconColor: '#15803d',
      title: 'Deterministic Policy Engine & Guardrails',
      badge: 'Zero Policy Breaches',
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
      description:
        'Guarantees strict financial boundaries, prevents aggressive customer spamming, and complies with TRAI / RBI norms.',
      highlights: [
        'Financial Threshold: Incidents >₹10,000 held for human-in-the-loop review',
        'Velocity Limit: Max 2 automated retries per failure incident',
        'Non-Negotiable Stopping Rules: STOP-01 (Paid), STOP-02 (Opt-Out Freeze), STOP-03 (Dispute)',
        'TRAI Contact Window: Strict 09:00–19:00 IST communication enforcement',
      ],
      linkTo: '/policies',
      linkLabel: 'View Policy Rules',
    },
    {
      id: 'action',
      icon: <Zap size={22} />,
      iconBg: '#fef9c3',
      iconColor: '#854d0e',
      title: 'Autonomous Razorpay Action Dispatch',
      badge: '100% Idempotent',
      badgeBg: '#fef9c3',
      badgeColor: '#854d0e',
      description:
        'Executes non-disruptive interventions via official Razorpay APIs with deterministic idempotency keys.',
      highlights: [
        '1-Click Dynamic Payment Links generated via Razorpay Checkout API',
        'UPI Instant Payment Link & Smart Collect Virtual Account generation',
        'Mandate update URLs with 7-day non-disruptive SaaS grace periods',
        'Deterministic Idempotency Key format (idempotency_RC_XXXX_attempt_YY) preventing double charges',
      ],
      linkTo: '/recoveries',
      linkLabel: 'Test 1-Click Runs',
    },
    {
      id: 'portal',
      icon: <Smartphone size={22} />,
      iconBg: '#eff6ff',
      iconColor: '#1d4ed8',
      title: 'Interactive Customer Action Portal',
      badge: 'Deep-Linked UX',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      description:
        'Customer-side portal empowering users to settle payments, log promise dates, request mandate updates, or opt out.',
      highlights: [
        '1-Click deep-linking from merchant telemetry directly to individual customer views',
        'Instant Razorpay Checkout simulation with real-time settlement verification',
        'B2B Promise-to-Pay calendar commitment registration',
        'Instant STOP-02 consent opt-out permanently freezing AI automation in MongoDB',
      ],
      linkTo: '/customer-portal',
      linkLabel: 'Open Customer Portal',
    },
    {
      id: 'audit',
      icon: <Lock size={22} />,
      iconBg: '#fee2e2',
      iconColor: '#b91c1c',
      title: 'Cryptographic SHA-256 Audit Trail',
      badge: 'ISO-27001 Ready',
      badgeBg: '#fee2e2',
      badgeColor: '#b91c1c',
      description:
        'Append-only immutable event ledger logging every diagnostic step, policy check, communication, and settlement.',
      highlights: [
        'Tamper-proof SHA-256 hash chaining of every state transition & actor action',
        'Full transparency: AI reasoning, confidence scores, and compliance decisions',
        'Real-time verification sealing recovered revenue into permanent MongoDB records',
        '1-Click ISO-compliant Audit Matrix CSV export for finance and audit readiness',
      ],
      linkTo: '/recoveries',
      linkLabel: 'Export Audit Matrix',
    },
  ];

  return (
    <div className="neo-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div className="neo-badge neo-badge-yellow" style={{ fontSize: '11px', padding: '2px 8px' }}>
              <Sparkles size={12} />
              <span>Track 03 Autonomous Revenue Winback Engine</span>
            </div>
            <div className="neo-badge neo-badge-green" style={{ fontSize: '11px', padding: '2px 8px' }}>
              <span>6 Core Pillars</span>
            </div>
          </div>
          <h2 style={{ fontSize: '22px', margin: 0, fontFamily: 'var(--font-heading)' }}>
            System Architecture & Core Platform Features
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Deterministic multi-agent pipeline executing policy-bounded revenue recovery across 4 critical failure tracks
          </span>
        </div>

        <Link
          to="/recoveries"
          className="neo-btn neo-btn-primary neo-btn-sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
        >
          <span>🧪 Open Live Test Suite</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* 6 Core Feature Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        {features.map((feat) => {
          const isSelected = selectedFeature === feat.id;

          return (
            <div
              key={feat.id}
              onClick={() => setSelectedFeature(feat.id)}
              style={{
                padding: '20px',
                borderRadius: '14px',
                border: `2px solid var(--border-black)`,
                backgroundColor: isSelected ? '#fffdf5' : '#ffffff',
                boxShadow: isSelected ? '4px 4px 0px var(--border-black)' : '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <div>
                {/* Card Top: Icon + Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '2px solid var(--border-black)',
                      backgroundColor: feat.iconBg,
                      color: feat.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '2px 2px 0px var(--border-black)',
                    }}
                  >
                    {feat.icon}
                  </div>

                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: feat.badgeBg,
                      color: feat.badgeColor,
                      border: `1.5px solid ${feat.badgeColor}40`,
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {feat.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)', color: '#121316' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  {feat.description}
                </p>

                {/* Granular Bullet Highlights */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {feat.highlights.map((hl, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: '#334155' }}>
                      <CheckCircle2 size={12} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.3 }}>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                  Feature Pillar #{features.indexOf(feat) + 1}
                </span>

                {feat.linkTo && (
                  <Link
                    to={feat.linkTo}
                    className="neo-btn neo-btn-sm neo-btn-white"
                    style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <span>{feat.linkLabel}</span>
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
