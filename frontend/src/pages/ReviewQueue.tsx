import React, { useEffect, useState } from 'react';
import { Box, Card, CardBody, Heading, Text, Badge, Button } from '@razorpay/blade/components';
import { RecoveryCase } from '../types';
import { getReviewQueue, approveReviewCase, rejectReviewCase } from '../services/api';
import { UserCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewQueue: React.FC = () => {
  const [queueCases, setQueueCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getReviewQueue();
      setQueueCases(res.cases);
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    await approveReviewCase(id);
    fetchQueue();
  };

  const handleReject = async (id: string) => {
    await rejectReviewCase(id, 'Rejected by compliance reviewer');
    fetchQueue();
  };

  return (
    <Box display="flex" flexDirection="column" gap="spacing.6" padding="spacing.7">
      {/* Header */}
      <Box display="flex" alignItems="center" gap="spacing.3">
        <UserCheck size={24} color="#f59e0b" />
        <Box display="flex" flexDirection="column">
          <Heading size="large" weight="semibold" color="surface.text.gray.normal">
            Human Approval & Escalation Queue
          </Heading>
          <Text size="small" color="surface.text.gray.muted">
            Cases routed to human decision due to financial caps, retry limits, or compliance threshold rules.
          </Text>
        </Box>
      </Box>

      {/* Queue Items */}
      {queueCases.length === 0 ? (
        <Card padding="spacing.5">
          <CardBody>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="spacing.3" padding="spacing.7">
              <CheckCircle2 size={40} color="#10b981" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Review Queue Clear
              </Heading>
              <Text size="small" color="surface.text.gray.muted">
                All autonomous actions are currently executing within verified guardrail bounds.
              </Text>
            </Box>
          </CardBody>
        </Card>
      ) : (
        <Box display="flex" flexDirection="column" gap="spacing.4">
          {queueCases.map((item) => (
            <Card key={item._id} padding="spacing.5">
              <CardBody>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="spacing.4">
                  <Box display="flex" flexDirection="column" gap="spacing.3" flex="1">
                    <Box display="flex" alignItems="center" gap="spacing.3">
                      <Link to={`/recoveries/${item.caseId}`} style={{ color: '#0c8ce9', fontWeight: 700, textDecoration: 'none', fontSize: '16px' }}>
                        {item.caseId}
                      </Link>
                      <Badge color="notice" size="medium">
                        {item.status}
                      </Badge>
                      {item.stoppingRule && (
                        <Badge color="negative" size="small">
                          STOP: {item.stoppingRule}
                        </Badge>
                      )}
                    </Box>

                    <Box display="flex" gap="spacing.6" flexWrap="wrap">
                      <Box display="flex" flexDirection="column">
                        <Text size="xsmall" color="surface.text.gray.muted">CUSTOMER</Text>
                        <Text size="small" weight="semibold" color="surface.text.gray.normal">{item.customerName}</Text>
                      </Box>
                      <Box display="flex" flexDirection="column">
                        <Text size="xsmall" color="surface.text.gray.muted">AMOUNT AT RISK</Text>
                        <Text size="small" weight="semibold" color="surface.text.gray.normal">₹{item.amountAtRisk.toLocaleString('en-IN')}</Text>
                      </Box>
                      <Box display="flex" flexDirection="column">
                        <Text size="xsmall" color="surface.text.gray.muted">AI RECOMMENDED ACTION</Text>
                        <Text size="small" weight="semibold" color="surface.text.gray.normal">{item.recommendedAction?.replace(/_/g, ' ') || 'None'}</Text>
                      </Box>
                    </Box>

                    <Box padding="spacing.3" borderRadius="small" backgroundColor="surface.background.gray.subtle">
                      <Text size="xsmall" color="surface.text.gray.muted">
                        GUARDRAIL BLOCK REASON: <strong style={{ color: '#fca5a5' }}>{item.policyDecision?.reason || item.stoppingRule || 'Routed for compliance check'}</strong>
                      </Text>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap="spacing.3">
                    <Button variant="secondary" size="medium" onClick={() => handleReject(item.caseId)}>
                      Reject Action
                    </Button>
                    <Button variant="primary" size="medium" onClick={() => handleApprove(item.caseId)}>
                      Approve Intervention
                    </Button>
                  </Box>
                </Box>
              </CardBody>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};
