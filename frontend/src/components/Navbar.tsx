import React from 'react';
import { Box, Button, Badge } from '@razorpay/blade/components';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, UserCheck, Shield, Zap } from 'lucide-react';

interface NavbarProps {
  onRunBatch?: () => void;
  onResetData?: () => void;
  isRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRunBatch, onResetData, isRunning }) => {
  const navItems = [
    { label: 'Live Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Revenue Cases', path: '/recoveries', icon: Layers },
    { label: 'Human Review Queue', path: '/review', icon: UserCheck },
    { label: 'Guardrail Policies', path: '/policies', icon: Shield },
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Track */}
      <Box display="flex" alignItems="center" gap="spacing.4">
        <Box display="flex" alignItems="center" gap="spacing.3">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0c8ce9 0%, #024194 100%)',
              boxShadow: '0 4px 12px rgba(12, 140, 233, 0.4)',
            }}
          >
            <Zap size={20} color="#ffffff" />
          </div>
          <Box display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                RazorRecover <span style={{ color: '#0c8ce9' }}>AI</span>
              </span>
              <Badge color="information" size="small">
                TRACK 03
              </Badge>
            </Box>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Autonomous Revenue Recovery & Guardrail System
            </span>
          </Box>
        </Box>
      </Box>

      {/* Nav Links */}
      <Box display="flex" alignItems="center" gap="spacing.3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? '#0c8ce9' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(12, 140, 233, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(12, 140, 233, 0.3)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </Box>

      {/* Global Actions */}
      <Box display="flex" alignItems="center" gap="spacing.3">
        {onResetData && (
          <Button
            variant="tertiary"
            size="small"
            onClick={onResetData}
          >
            Reset Test Run
          </Button>
        )}
        {onRunBatch && (
          <Button
            variant="primary"
            size="medium"
            isLoading={isRunning}
            onClick={onRunBatch}
          >
            {isRunning ? 'Executing Batch...' : '▶ Run Autonomous Recovery'}
          </Button>
        )}
      </Box>
    </header>
  );
};
