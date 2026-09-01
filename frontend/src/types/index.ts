export interface RecoveryCase {
  id?: string;
  _id: string;
  caseId: string;
  transactionId: {
    _id: string;
    paymentId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    failureReason: string | null;
    scenario: string;
    orderDescription?: string;
    checkoutEvents?: string[];
    subscriptionId?: string;
    invoiceId?: string;
    dueDate?: string;
    createdAt: string;
  };
  customerId: string;
  customerName: string;
  scenario: 'payment_failure' | 'checkout_abandonment' | 'subscription_failure' | 'invoice_overdue';
  amountAtRisk: number;
  recoveryProbability: number;
  expectedRecoveryValue: number;
  priorityScore: number;
  diagnosis?: {
    category: string;
    confidence: number;
    recoverability: 'high' | 'medium' | 'low' | 'unrecoverable';
    reasoning: string;
  };
  recommendedAction?: 'retry_payment' | 'generate_link' | 'send_reminder' | 'update_method' | 'escalate_human' | 'stop_recovery';
  status:
    | 'UNPROCESSED'
    | 'DETECTED'
    | 'DIAGNOSING'
    | 'STRATEGY_SELECTED'
    | 'STOPPING_CHECK'
    | 'HALTED'
    | 'PAUSED'
    | 'POLICY_CHECK'
    | 'BLOCKED'
    | 'APPROVED'
    | 'EXECUTING'
    | 'VERIFYING'
    | 'RECOVERED'
    | 'PARTIALLY_RECOVERED'
    | 'FAILED'
    | 'UNKNOWN_STATE'
    | 'HUMAN_REVIEW'
    | 'REJECTED'
    | 'PROMISE_LOGGED'
    | 'UNRECOVERABLE';
  stoppingRule?: string | null;
  policyDecision?: {
    allowed: boolean;
    reason: string;
    checkedAt: string;
  };
  complianceDecision?: {
    passed: boolean;
    reason: string;
    checkedAt: string;
  };
  recoveredAmount: number;
  attemptCount: number;
  maxAttempts: number;
  batchId?: string;
  escalationStep: number;
  promiseToPayDate?: string;
  actionHistory?: Array<{
    action: string;
    result: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  auditTrail?: AuditLogEntry[];
}

export interface AuditLogEntry {
  _id: string;
  recoveryCaseId?: string;
  batchId?: string;
  event: string;
  actor: 'system' | 'ai' | 'policy_engine' | 'stopping_rules' | 'compliance' | 'action_agent' | 'verification' | 'human';
  message: string;
  metadata?: any;
  timestamp: string;
}

export interface DashboardSummary {
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
  activeRecoveries: number;
  humanReviews: number;
  totalCases: number;
}

export interface RevenueBreakdown {
  scenario: string;
  count: number;
  totalAmount: number;
}

export interface BatchRun {
  batchId: string;
  status: 'running' | 'completed' | 'failed' | 'interrupted';
  startedAt: string;
  completedAt?: string;
  casesScanned: number;
  totalRevenueAtRisk: number;
  recoverableCases: number;
  autoActioned: number;
  humanReviewRequired: number;
  blockedByPolicy: number;
  blockedByCompliance: number;
  stoppedByStoppingRules: number;
  verifiedRecoveredAmount: number;
  pendingVerificationAmount: number;
  recoveryRatePercent: number;
}
