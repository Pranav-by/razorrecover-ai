import React from 'react';
import { Box, Card, CardBody, Heading, Text, Badge } from '@razorpay/blade/components';
import { AuditLogEntry } from '../types';
import { CheckCircle2, ShieldAlert, Cpu, UserCheck, Activity, AlertOctagon } from 'lucide-react';

interface AuditTimelineProps {
  entries: AuditLogEntry[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding="spacing.7" gap="spacing.3">
            <Activity size={32} color="#64748b" />
            <Text size="medium" color="surface.text.gray.muted">
              No audit log entries recorded yet.
            </Text>
          </Box>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card padding="spacing.5">
      <CardBody>
        <Box display="flex" flexDirection="column" gap="spacing.5">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap="spacing.3">
              <ShieldAlert size={20} color="#10b981" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Immutable Decision & Action Audit Trail
              </Heading>
            </Box>
            <Badge color="positive" size="medium">
              Append-Only Verified ({entries.length} steps)
            </Badge>
          </Box>

          <Box display="flex" flexDirection="column" gap="spacing.4" position="relative">
            {entries.map((entry, index) => {
              let Icon = Activity;
              let iconColor = '#3b82f6';
              let badgeVariant: 'positive' | 'negative' | 'information' | 'notice' | 'neutral' = 'information';

              if (entry.actor === 'ai') {
                Icon = Cpu;
                iconColor = '#8b5cf6';
                badgeVariant = 'information';
              } else if (entry.actor === 'policy_engine' || entry.actor === 'stopping_rules') {
                if (entry.event.includes('blocked') || entry.event.includes('stop')) {
                  Icon = AlertOctagon;
                  iconColor = '#ef4444';
                  badgeVariant = 'negative';
                } else {
                  Icon = CheckCircle2;
                  iconColor = '#10b981';
                  badgeVariant = 'positive';
                }
              } else if (entry.actor === 'human') {
                Icon = UserCheck;
                iconColor = '#f59e0b';
                badgeVariant = 'notice';
              } else if (entry.actor === 'verification') {
                Icon = CheckCircle2;
                iconColor = '#10b981';
                badgeVariant = 'positive';
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
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    borderLeft: `3px solid ${iconColor}`,
                  }}
                >
                  <div style={{ marginTop: '4px' }}>
                    <Icon size={18} color={iconColor} />
                  </div>

                  <Box display="flex" flexDirection="column" gap="spacing.1" flex="1">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap="spacing.2">
                        <Badge color={badgeVariant} size="small">
                          {entry.actor.toUpperCase()}
                        </Badge>
                        <Text size="small" weight="semibold" color="surface.text.gray.normal">
                          {entry.event.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </Box>
                      <Text size="xsmall" color="surface.text.gray.muted">
                        {formattedTime}
                      </Text>
                    </Box>

                    <Text size="small" color="surface.text.gray.muted">
                      {entry.message}
                    </Text>

                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <Box
                        marginTop="spacing.2"
                        padding="spacing.3"
                        borderRadius="small"
                        backgroundColor="surface.background.gray.intense"
                      >
                        <pre style={{ margin: 0, fontSize: '11px', color: '#94a3b8', overflowX: 'auto', fontFamily: 'monospace' }}>
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </Box>
                    )}
                  </Box>
                </div>
              );
            })}
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};
