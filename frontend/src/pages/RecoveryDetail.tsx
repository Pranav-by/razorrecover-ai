import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Card, CardBody, Heading, Text, Badge, Button } from '@razorpay/blade/components';
import { RecoveryCase } from '../types';
import { getRecoveryById, approveReviewCase, rejectReviewCase } from '../services/api';
import { AuditTimeline } from '../components/AuditTimeline';
import { ArrowLeft, BrainCircuit, ShieldAlert } from 'lucide-react';

export const RecoveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getRecoveryById(id);
      setCaseData(data);
    } catch (err) {
      console.error('Error fetching case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    await approveReviewCase(id);
    fetchDetail();
  };

  const handleReject = async () => {
    if (!id) return;
    await rejectReviewCase(id, 'Rejected manually from case detail');
    fetchDetail();
  };

  if (loading || !caseData) {
    return (
      <Box padding="spacing.7" display="flex" justifyContent="center">
        <Text size="medium" color="surface.text.gray.muted">
          Loading case telemetry...
        </Text>
      </Box>
    );
  }

  let statusBadgeVariant: 'positive' | 'negative' | 'information' | 'notice' | 'neutral' = 'information';
  if (caseData.status === 'RECOVERED') statusBadgeVariant = 'positive';
  else if (caseData.status === 'BLOCKED' || caseData.status === 'HALTED' || caseData.status === 'FAILED') statusBadgeVariant = 'negative';
  else if (caseData.status === 'HUMAN_REVIEW' || caseData.status === 'PAUSED') statusBadgeVariant = 'notice';

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6" padding="spacing.7">
      {/* Top Back Link */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Link to="/recoveries" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0c8ce9', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Back to Cases List
        </Link>
        {caseData.status === 'HUMAN_REVIEW' && (
          <Box display="flex" gap="spacing.3">
            <Button variant="secondary" size="small" onClick={handleReject}>
              Reject Action
            </Button>
            <Button variant="primary" size="small" onClick={handleApprove}>
              Approve Intervention
            </Button>
          </Box>
        )}
      </Box>

      {/* Case Header Card */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="spacing.4">
            <Box display="flex" flexDirection="column" gap="spacing.2">
              <Box display="flex" alignItems="center" gap="spacing.3">
                <Heading size="xlarge" weight="semibold" color="surface.text.gray.normal">
                  Case {caseData.caseId}
                </Heading>
                <Badge color={statusBadgeVariant} size="medium">
                  {caseData.status}
                </Badge>
                {caseData.stoppingRule && (
                  <Badge color="negative" size="small">
                    STOPPING RULE: {caseData.stoppingRule}
                  </Badge>
                )}
              </Box>
              <Text size="small" color="surface.text.gray.muted">
                Customer: <strong style={{ color: '#f8fafc' }}>{caseData.customerName}</strong> ({caseData.customerId}) • Scenario: <strong style={{ color: '#f8fafc' }}>{caseData.scenario}</strong>
              </Text>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="flex-end" gap="spacing.1">
              <Text size="xsmall" color="surface.text.gray.muted">
                REVENUE AT RISK
              </Text>
              <Heading size="2xlarge" weight="semibold" color="surface.text.gray.normal">
                ₹{caseData.amountAtRisk.toLocaleString('en-IN')}
              </Heading>
              {caseData.recoveredAmount > 0 && (
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>
                  ✓ Recovered: ₹{caseData.recoveredAmount.toLocaleString('en-IN')}
                </span>
              )}
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Main 2-Column Split: AI Decision Panel + Policy vs Audit Trail */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: AI Diagnostic Panel & Guardrails */}
        <Box display="flex" flexDirection="column" gap="spacing.5">
          {/* AI Decision Panel */}
          <Card padding="spacing.5">
            <CardBody>
              <Box display="flex" flexDirection="column" gap="spacing.4">
                <Box display="flex" alignItems="center" gap="spacing.3">
                  <BrainCircuit size={20} color="#8b5cf6" />
                  <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                    AI Decision & Diagnostic Synthesis
                  </Heading>
                </Box>

                <Box display="flex" flexDirection="column" gap="spacing.3">
                  <Box padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle">
                    <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
                      WHY IS THIS REVENUE AT RISK?
                    </Text>
                    <Text size="small" weight="medium" color="surface.text.gray.normal">
                      {caseData.diagnosis?.reasoning || 'Diagnostic synthesis completed via model evaluation.'}
                    </Text>
                  </Box>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Box padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle">
                      <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
                        WINBACK PROBABILITY
                      </Text>
                      <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                        {Math.round((caseData.recoveryProbability || 0) * 100)}%
                      </Heading>
                      <Text size="xsmall" color="surface.text.gray.subtle">
                        Expected Win: ₹{caseData.expectedRecoveryValue}
                      </Text>
                    </Box>

                    <Box padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle">
                      <Text size="xsmall" weight="semibold" color="surface.text.gray.muted">
                        RECOMMENDED INTERVENTION
                      </Text>
                      <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                        {caseData.recommendedAction?.replace(/_/g, ' ') || 'None'}
                      </Heading>
                      <Text size="xsmall" color="surface.text.gray.subtle">
                        Bounded Workflow Action
                      </Text>
                    </Box>
                  </div>
                </Box>
              </Box>
            </CardBody>
          </Card>

          {/* Policy Guardrail Engine Decision */}
          <Card padding="spacing.5">
            <CardBody>
              <Box display="flex" flexDirection="column" gap="spacing.4">
                <Box display="flex" alignItems="center" gap="spacing.3">
                  <ShieldAlert size={20} color={caseData.policyDecision?.allowed ? '#10b981' : '#ef4444'} />
                  <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                    Deterministic Policy Guardrail Evaluation
                  </Heading>
                </Box>

                <Box padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle">
                  <Box display="flex" alignItems="center" gap="spacing.2" marginBottom="spacing.2">
                    <Badge color={caseData.policyDecision?.allowed ? 'positive' : 'negative'} size="medium">
                      {caseData.policyDecision?.allowed ? 'POLICY PERMITTED' : 'POLICY BLOCKED'}
                    </Badge>
                    {caseData.policyDecision?.checkedAt && (
                      <Text size="xsmall" color="surface.text.gray.muted">
                        Evaluated: {new Date(caseData.policyDecision.checkedAt).toLocaleTimeString('en-IN')}
                      </Text>
                    )}
                  </Box>
                  <Text size="small" color="surface.text.gray.normal">
                    {caseData.policyDecision?.reason || 'Evaluated against retry limits and auto-action thresholds.'}
                  </Text>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Right Column: Immutable Audit Trail */}
        <AuditTimeline entries={caseData.auditTrail || []} />
      </div>
    </Box>
  );
};
