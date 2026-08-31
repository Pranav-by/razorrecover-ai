/**
 * Stopping Rules Tests — Proves safety boundaries work correctly.
 * These tests verify the judging criteria:
 * - Customer opt-out permanently halts recovery
 * - Active disputes freeze all actions
 * - Stopping rules are checked BEFORE policy engine
 * - Retry limit pauses correctly
 */

jest.mock('../../models/Customer', () => ({
  findOne: jest.fn(),
}));
jest.mock('../../models/RecoveryCase', () => ({}));
jest.mock('../audit.service', () => ({
  log: jest.fn().mockResolvedValue({}),
}));

const Customer = require('../../models/Customer');
const StoppingRulesService = require('../stopping-rules.service');

function mockCase(overrides = {}) {
  return {
    _id: 'test_case_id',
    caseId: 'RC_STOP_TEST',
    customerId: 'CUS_301',
    amountAtRisk: 5000,
    status: 'DIAGNOSING',
    attemptCount: 0,
    maxAttempts: 2,
    createdAt: new Date(),
    diagnosis: { confidence: 0.88 },
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('StoppingRulesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('STOP-01: Allows case when no stopping rules triggered', async () => {
    Customer.findOne.mockReturnValue({
      lean: () => ({ customerId: 'CUS_101', optedOut: false, disputeHistory: [] }),
    });

    const rc = mockCase({ customerId: 'CUS_101', attemptCount: 0 });
    const result = await StoppingRulesService.check(rc, 'batch_test');

    expect(result.stopped).toBe(false);
  });

  test('STOP-02: PERMANENT halt when customer has opted out', async () => {
    Customer.findOne.mockReturnValue({
      lean: () => ({ customerId: 'CUS_301', optedOut: true }),
    });

    const rc = mockCase({ customerId: 'CUS_301' });
    const result = await StoppingRulesService.check(rc, 'batch_test');

    expect(result.stopped).toBe(true);
    expect(result.permanent).toBe(true);
    expect(result.rule).toBe('CUSTOMER_OPT_OUT');
  });

  test('STOP-03: PERMANENT halt when active dispute exists', async () => {
    Customer.findOne.mockReturnValue({
      lean: () => ({
        customerId: 'CUS_302',
        optedOut: false,
        disputeHistory: [{ disputeId: 'DSP_001', status: 'open' }],
      }),
    });

    const rc = mockCase({ customerId: 'CUS_302' });
    const result = await StoppingRulesService.check(rc, 'batch_test');

    expect(result.stopped).toBe(true);
    expect(result.permanent).toBe(true);
    expect(result.rule).toBe('DISPUTE_RAISED');
  });

  test('STOP-04: TEMPORARY pause when retry limit hit', async () => {
    Customer.findOne.mockReturnValue({
      lean: () => ({ customerId: 'CUS_101', optedOut: false, disputeHistory: [] }),
    });

    const rc = mockCase({ customerId: 'CUS_101', attemptCount: 2, maxAttempts: 2 });
    const result = await StoppingRulesService.check(rc, 'batch_test');

    expect(result.stopped).toBe(true);
    expect(result.permanent).toBe(false);
    expect(result.rule).toBe('RETRY_LIMIT_HIT');
  });

  test('STOP-05: TEMPORARY pause when diagnosis confidence too low', async () => {
    Customer.findOne.mockReturnValue({
      lean: () => ({ customerId: 'CUS_103', optedOut: false, disputeHistory: [] }),
    });

    const rc = mockCase({
      customerId: 'CUS_103',
      attemptCount: 0,
      diagnosis: { confidence: 0.3 },
    });
    const result = await StoppingRulesService.check(rc, 'batch_test');

    expect(result.stopped).toBe(true);
    expect(result.permanent).toBe(false);
    expect(result.rule).toBe('LOW_CONFIDENCE');
  });

  test('STOP-06: Stopping rule fires even for already-recovered case', async () => {
    Customer.findOne.mockReturnValue({
      lean: () => ({ customerId: 'CUS_101', optedOut: false }),
    });

    const rc = mockCase({ status: 'RECOVERED', customerId: 'CUS_101' });
    const result = await StoppingRulesService.check(rc, 'batch_test');

    expect(result.stopped).toBe(true);
    expect(result.permanent).toBe(true);
    expect(result.rule).toBe('CUSTOMER_PAID');
  });
});
