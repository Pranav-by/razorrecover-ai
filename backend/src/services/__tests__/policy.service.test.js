/**
 * Policy Engine Tests — Proves deterministic guardrails work correctly.
 * These tests verify the judging criteria:
 * - Amount limits block correctly
 * - Retry limits are enforced
 * - High-value transactions require human approval
 * - Fail-closed on errors
 */

// Mock dependencies before requiring the service
jest.mock('../../models/Transaction', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../audit.service', () => ({
  log: jest.fn().mockResolvedValue({}),
}));

const Transaction = require('../../models/Transaction');
const PolicyService = require('../policy.service');

// Helper to create a mock recovery case
function mockCase(overrides = {}) {
  return {
    _id: 'test_case_id',
    caseId: 'RC_TEST',
    customerId: 'CUS_101',
    amountAtRisk: 5000,
    recommendedAction: 'retry_payment',
    attemptCount: 0,
    policyDecision: null,
    status: 'STRATEGY_SELECTED',
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('PolicyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POL-01: Approves a valid low-amount retry', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => ({ status: 'failed', failureReason: 'upi_timeout', customerId: 'CUS_101', amount: 5000, createdAt: new Date() }),
    });
    Transaction.findOne.mockReturnValue(null);

    const rc = mockCase({ amountAtRisk: 5000, attemptCount: 0 });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(true);
    expect(result.reason).toContain('All policy checks passed');
  });

  test('POL-02: Blocks retry at exact limit (2/2 max)', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => ({ status: 'failed', failureReason: 'upi_timeout', customerId: 'CUS_101', amount: 5000, createdAt: new Date() }),
    });
    Transaction.findOne.mockReturnValue(null);

    const rc = mockCase({ amountAtRisk: 5000, attemptCount: 2, recommendedAction: 'retry_payment' });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Retry limit');
  });

  test('POL-05: Blocks amount ₹1 above auto-action limit (₹10,001)', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => ({ status: 'failed', failureReason: 'upi_timeout', customerId: 'CUS_101', amount: 10001, createdAt: new Date() }),
    });
    Transaction.findOne.mockReturnValue(null);

    const rc = mockCase({ amountAtRisk: 10001, attemptCount: 0 });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('auto-action limit');
  });

  test('POL-06: Blocks high-value transaction (₹50,000+) for human review', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => ({ status: 'failed', failureReason: 'bank_decline', customerId: 'CUS_106', amount: 55000, createdAt: new Date() }),
    });
    Transaction.findOne.mockReturnValue(null);

    const rc = mockCase({ amountAtRisk: 55000, attemptCount: 0, recommendedAction: 'generate_link' });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(false);
  });

  test('POL-07: Blocks retry for already-succeeded transaction', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => ({ status: 'success', failureReason: null, customerId: 'CUS_101', amount: 5000, createdAt: new Date() }),
    });

    const rc = mockCase({ amountAtRisk: 5000, attemptCount: 0 });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('already succeeded');
  });

  test('POL-08: Blocks retry for disallowed failure reason (fraud_suspected)', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => ({ status: 'failed', failureReason: 'fraud_suspected', customerId: 'CUS_105', amount: 3000, createdAt: new Date() }),
    });
    Transaction.findOne.mockReturnValue(null);

    const rc = mockCase({ amountAtRisk: 3000, attemptCount: 0, recommendedAction: 'retry_payment' });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('does not permit');
  });

  test('POL-09: Fails CLOSED on database error (no action without trail)', async () => {
    Transaction.findById.mockReturnValue({
      lean: () => { throw new Error('Database connection lost'); },
    });

    const rc = mockCase({ amountAtRisk: 5000, attemptCount: 0 });
    const result = await PolicyService.check(rc, 'batch_test');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Policy engine error');
  });
});
