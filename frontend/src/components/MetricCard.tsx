import React from 'react';
import { Star } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'positive' | 'negative' | 'information' | 'notice' | 'neutral';
  icon?: React.ReactNode;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'positive',
  icon,
  accentColor = '#ffe600',
}) => {
  let badgeBg = '#ffffff';
  let badgeColor = '#121316';

  if (badgeVariant === 'positive') {
    badgeBg = '#ffe600';
  } else if (badgeVariant === 'negative') {
    badgeBg = '#ff5757';
    badgeColor = '#ffffff';
  } else if (badgeVariant === 'notice') {
    badgeBg = '#f97316';
    badgeColor = '#ffffff';
  } else if (badgeVariant === 'information') {
    badgeBg = '#38bdf8';
  }

  return (
    <div
      className="neo-card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '140px',
      }}
    >
      {/* Top Row: Label & Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#64748b',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '2px solid var(--border-black)',
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--border-black)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Center Row: Big Chunky Value & Badge */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--border-black)',
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>

        {badgeText && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              padding: '3px 8px',
              borderRadius: '999px',
              border: '1.5px solid var(--border-black)',
              backgroundColor: badgeBg,
              color: badgeColor,
              boxShadow: '1.5px 1.5px 0px var(--border-black)',
            }}
          >
            <Star size={10} fill={badgeColor} color={badgeColor} />
            <span>{badgeText}</span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '8px' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
