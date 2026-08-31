import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Play, RotateCcw, ShieldCheck, Layers, UserCheck, LayoutDashboard, Star, Sparkles, FlaskConical } from 'lucide-react';

interface NavbarProps {
  isRunning: boolean;
  onRunBatch: () => void;
  onResetData: () => void;
  onOpenJudgeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isRunning, onRunBatch, onResetData, onOpenJudgeModal }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/recoveries', label: 'Revenue Cases', icon: Layers },
    { path: '/test-cases', label: 'Test Suite', icon: FlaskConical },
    { path: '/review', label: 'Review Queue', icon: UserCheck },
    { path: '/policies', label: 'Guardrails', icon: ShieldCheck },
  ];

  return (
    <header style={{ padding: '18px 24px 8px 24px', maxWidth: '1440px', margin: '0 auto' }}>
      <div
        className="neo-card"
        style={{
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand / Profile Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="neo-avatar" style={{ backgroundColor: '#ffe600' }}>
            <span style={{ fontSize: '22px', fontWeight: 900 }}>⚡</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, color: 'var(--border-black)' }}>
              RazorRecover AI
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
              Autonomous Revenue Winback Engine
            </span>
          </div>
        </div>

        {/* Neo-Brutalist Pill Tabs Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            padding: '6px 10px',
            borderRadius: '999px',
            border: '2px solid var(--border-black)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--border-black)',
                  textDecoration: 'none',
                  borderRadius: '999px',
                  backgroundColor: isActive ? 'var(--accent-yellow)' : 'transparent',
                  border: isActive ? '2px solid var(--border-black)' : '2px solid transparent',
                  boxShadow: isActive ? '2px 2px 0px var(--border-black)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Button Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenJudgeModal}
            className="neo-btn neo-btn-sm"
            style={{ backgroundColor: '#e0f2fe', fontWeight: 800 }}
            title="View Track 03 Judging Rubric & Evidence Matrix"
          >
            <Star size={14} fill="#0284c7" color="#0284c7" />
            <span>Judge Rubric</span>
          </button>

          <button
            onClick={onResetData}
            className="neo-btn neo-btn-white neo-btn-sm"
            title="Reset Mock Telemetry"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={onRunBatch}
            disabled={isRunning}
            className={`neo-btn ${isRunning ? 'neo-btn-white' : 'neo-btn-primary'}`}
            style={{ padding: '10px 18px' }}
          >
            {isRunning ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="var(--border-black)" />
                <span>Run Batch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
