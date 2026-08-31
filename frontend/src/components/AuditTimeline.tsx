import React from 'react';
import { AuditLogEntry } from '../types';
import { ShieldAlert, Activity, CheckCircle2, AlertOctagon, BrainCircuit, UserCheck } from 'lucide-react';

interface AuditTimelineProps {
  entries: AuditLogEntry[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="neo-card" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
        <Activity size={32} style={{ margin: '0 auto 12px auto' }} />
        <h4 style={{ margin: 0 }}>No audit log entries recorded yet</h4>
      </div>
    );
  }

  return (
    <div className="neo-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '2px solid var(--border-black)',
              backgroundColor: '#22c55e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--border-black)',
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Immutable Decision Audit Trail</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Append-only cryptographic state verification
            </span>
          </div>
        </div>

        <div className="neo-badge neo-badge-green">
          <span>{entries.length} Steps Logged</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {entries.map((entry, index) => {
          let badgeClass = 'neo-badge-blue';
          let borderAccent = '#38bdf8';

          if (entry.actor === 'ai') {
            badgeClass = 'neo-badge-purple';
            borderAccent = '#a855f7';
          } else if (entry.actor === 'policy_engine' || entry.actor === 'stopping_rules') {
            if (entry.event.includes('blocked') || entry.event.includes('stop')) {
              badgeClass = 'neo-badge-coral';
              borderAccent = '#ff5757';
            } else {
              badgeClass = 'neo-badge-green';
              borderAccent = '#22c55e';
            }
          } else if (entry.actor === 'human') {
            badgeClass = 'neo-badge-yellow';
            borderAccent = '#ffe600';
          } else if (entry.actor === 'verification') {
            badgeClass = 'neo-badge-green';
            borderAccent = '#22c55e';
          }

          const formattedTime = new Date(entry.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={entry._id || index}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid var(--border-black)',
                borderLeft: `6px solid ${borderAccent}`,
                backgroundColor: '#ffffff',
                boxShadow: '2px 2px 0px var(--border-black)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`neo-badge ${badgeClass}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {entry.actor.toUpperCase()}
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: 'var(--border-black)' }}>
                    {entry.event.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  {formattedTime}
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                {entry.message}
              </div>

              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fffdfa',
                    border: '1.5px solid var(--border-black)',
                  }}
                >
                  <pre style={{ margin: 0, fontSize: '11px', color: '#121316', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
