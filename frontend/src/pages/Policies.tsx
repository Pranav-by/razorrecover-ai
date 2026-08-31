import React from 'react';
import { Box, Card, CardBody, Heading, Text, Badge } from '@razorpay/blade/components';
import { Shield, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

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
    <Box display="flex" flexDirection="column" gap="spacing.6" padding="spacing.7">
      <Box display="flex" alignItems="center" gap="spacing.3">
        <Shield size={24} color="#10b981" />
        <Box display="flex" flexDirection="column">
          <Heading size="large" weight="semibold" color="surface.text.gray.normal">
            Financial & Regulatory Guardrail Policy Engine
          </Heading>
          <Text size="small" color="surface.text.gray.muted">
            Explicit deterministic rules governing all autonomous agent actions, financial movement, and compliant communications.
          </Text>
        </Box>
      </Box>

      {/* Financial Guardrails */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <AlertTriangle size={18} color="#f59e0b" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Financial Risk & Action Caps
              </Heading>
            </Box>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {financialRules.map((rule) => (
                <Box key={rule.name} padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle" display="flex" flexDirection="column" gap="spacing.2">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text size="small" weight="semibold" color="surface.text.gray.normal">{rule.name}</Text>
                    <Badge color="positive" size="small">{rule.value}</Badge>
                  </Box>
                  <Text size="xsmall" color="surface.text.gray.muted">{rule.desc}</Text>
                </Box>
              ))}
            </div>
          </Box>
        </CardBody>
      </Card>

      {/* Regulatory & Communication Compliance */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <Clock size={18} color="#3b82f6" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Compliant Escalation & Customer Protection Rules
              </Heading>
            </Box>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {complianceRules.map((rule) => (
                <Box key={rule.name} padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle" display="flex" flexDirection="column" gap="spacing.2">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text size="small" weight="semibold" color="surface.text.gray.normal">{rule.name}</Text>
                    <Badge color="information" size="small">{rule.value}</Badge>
                  </Box>
                  <Text size="xsmall" color="surface.text.gray.muted">{rule.desc}</Text>
                </Box>
              ))}
            </div>
          </Box>
        </CardBody>
      </Card>

      {/* Approved Message Template Library */}
      <Card padding="spacing.5">
        <CardBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            <Box display="flex" alignItems="center" gap="spacing.2">
              <MessageSquare size={18} color="#8b5cf6" />
              <Heading size="medium" weight="semibold" color="surface.text.gray.normal">
                Approved Template Library (No Ad-Hoc LLM Messages)
              </Heading>
            </Box>

            <Box display="flex" flexDirection="column" gap="spacing.3">
              {templates.map((tpl) => (
                <Box key={tpl.id} padding="spacing.4" borderRadius="medium" backgroundColor="surface.background.gray.subtle" display="flex" flexDirection="column" gap="spacing.1">
                  <Badge color="neutral" size="small">{tpl.id}</Badge>
                  <Text size="small" color="surface.text.gray.normal">"{tpl.text}"</Text>
                </Box>
              ))}
            </Box>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};
