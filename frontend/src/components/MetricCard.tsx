import React from 'react';
import { Box, Card, CardBody, Heading, Text, Badge } from '@razorpay/blade/components';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'positive' | 'negative' | 'information' | 'notice' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'positive',
  icon,
}) => {
  return (
    <Card padding="spacing.5">
      <CardBody>
        <Box display="flex" flexDirection="column" gap="spacing.3">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text size="small" weight="medium" color="surface.text.gray.muted">
              {label}
            </Text>
            {icon && <Box display="flex" alignItems="center">{icon}</Box>}
          </Box>

          <Box display="flex" alignItems="baseline" gap="spacing.3">
            <Heading size="2xlarge" weight="semibold" color="surface.text.gray.normal">
              {value}
            </Heading>
            {badgeText && (
              <Badge color={badgeVariant} size="medium">
                {badgeText}
              </Badge>
            )}
          </Box>

          {subtitle && (
            <Text size="xsmall" color="surface.text.gray.subtle">
              {subtitle}
            </Text>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};
