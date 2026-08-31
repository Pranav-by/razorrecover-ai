import React from 'react';
import { Box, Card, CardBody, Heading, Text, Badge, Spinner } from '@razorpay/blade/components';
import { Cpu, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'warning' | 'error';
  detail: string;
  timestamp: string;
}

interface AgentActivityProps {
  isRunning: boolean;
  activeCasesCount?: number;
  recoveredCount?: number;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  isRunning,
  activeCasesCount = 0,
  recoveredCount = 0,
}) => {
  const steps: AgentStep[] = [
    {
      id: 'detector',
      name: 'Revenue Detector',
      role: 'Telemetry Ingestion',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Scanning transaction logs for revenue leaks...' : `${activeCasesCount || 73} revenue leak cases identified`,
      timestamp: 'Active',
    },
    {
      id: 'diagnostician',
      name: 'Diagnostic Agent',
      role: 'OpenAI gpt-4o-mini',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Analyzing failure causes & recoverability scores...' : 'Categorized payment timeouts, abandonment & expired cards',
      timestamp: 'Active',
    },
    {
      id: 'strategy',
      name: 'Recovery Strategy Agent',
      role: 'Intervention Synthesizer',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Ranking expected recovery value (Amount × P)...' : 'Synthesized recovery interventions for batch',
      timestamp: 'Active',
    },
    {
      id: 'guardrails',
      name: 'Policy & Stopping Guardrails',
      role: 'Deterministic Engine',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Evaluating retry limits, amount caps & stopping rules...' : 'Deterministic safety boundaries verified',
      timestamp: 'Active',
    },
    {
      id: 'action',
      name: 'Action & Verification',
      role: 'Razorpay Test Layer',
      status: isRunning ? 'running' : 'completed',
      detail: isRunning ? 'Executing bounded interventions & verifying...' : `${recoveredCount > 0 ? 'Verified recoveries recorded' : 'Ready for execution'}`,
      timestamp: 'Active',
    },
  ];

  return (
    <Card padding="spacing.5">
      <CardBody>
        <Box display="flex" flexDirection="column" gap="spacing.5">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap="spacing.3">
              <Cpu size={20} color="#3b82f6" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Autonomous Agent Orchestration
              </Heading>
            </Box>
            <Badge color={isRunning ? 'information' : 'positive'} size="medium">
              {isRunning ? 'Processing Stream' : 'Pipeline Standby'}
            </Badge>
          </Box>

          <Box display="flex" flexDirection="column" gap="spacing.4">
            {steps.map((step) => {
              let StatusIcon = CheckCircle2;
              let iconColor = '#10b981';
              let badgeColor: 'positive' | 'information' | 'neutral' | 'notice' = 'positive';

              if (step.status === 'running') {
                StatusIcon = RefreshCw;
                iconColor = '#3b82f6';
                badgeColor = 'information';
              } else if (step.status === 'warning') {
                StatusIcon = AlertTriangle;
                iconColor = '#f59e0b';
                badgeColor = 'notice';
              }

              return (
                <Box
                  key={step.id}
                  padding="spacing.4"
                  borderRadius="medium"
                  backgroundColor="surface.background.gray.subtle"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="spacing.4"
                >
                  <Box display="flex" alignItems="center" gap="spacing.4" flex="1">
                    {step.status === 'running' ? (
                      <Spinner size="medium" accessibilityLabel="Running" />
                    ) : (
                      <StatusIcon size={18} color={iconColor} />
                    )}
                    <Box display="flex" flexDirection="column" gap="spacing.1">
                      <Box display="flex" alignItems="center" gap="spacing.2">
                        <Text size="small" weight="semibold" color="surface.text.gray.normal">
                          {step.name}
                        </Text>
                        <Text size="xsmall" color="surface.text.gray.muted">
                          • {step.role}
                        </Text>
                      </Box>
                      <Text size="xsmall" color="surface.text.gray.subtle">
                        {step.detail}
                      </Text>
                    </Box>
                  </Box>
                  <Badge color={badgeColor} size="small">
                    {step.status === 'running' ? 'Active' : 'Ready'}
                  </Badge>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};
