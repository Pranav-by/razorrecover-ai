/**
 * Idempotency Tests — Proves no duplicate financial actions.
 * These tests verify:
 * - Same idempotency key twice → cached result (no duplicate action)
 * - Unique keys generate properly
 * - Fail-closed on check errors
 */

jest.mock('../../models/RecoveryAction', () => ({
  findOne: jest.fn(),
}));

const RecoveryAction = require('../../models/RecoveryAction');
const { generateIdempotencyKey, checkIdempotency } = require('../../utils/idempotency');

describe('Idempotency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ACT-01: Generates deterministic idempotency key format', () => {
    const key = generateIdempotencyKey('RC_0001', 1);
    expect(key).toBe('recovery_RC_0001_attempt_01');
  });

  test('ACT-02: Different attempt numbers produce different keys', () => {
    const key1 = generateIdempotencyKey('RC_0001', 1);
    const key2 = generateIdempotencyKey('RC_0001', 2);
    expect(key1).not.toBe(key2);
  });

  test('ACT-03: Returns null when no existing action (first attempt)', async () => {
    RecoveryAction.findOne.mockResolvedValue(null);
    const result = await checkIdempotency('recovery_RC_0001_attempt_01');
    expect(result).toBeNull();
  });

  test('ACT-04: Returns cached result when duplicate key detected', async () => {
    RecoveryAction.findOne.mockResolvedValue({
      result: 'success',
      executedAt: new Date(),
    });

    const result = await checkIdempotency('recovery_RC_0001_attempt_01');
    expect(result).not.toBeNull();
    expect(result.result).toBe('success');
  });

  test('ACT-05: Fails CLOSED on database error (treats as conflict)', async () => {
    RecoveryAction.findOne.mockRejectedValue(new Error('DB connection lost'));

    const result = await checkIdempotency('recovery_RC_0001_attempt_01');
    expect(result).not.toBeNull();
    expect(result.result).toBe('conflict_error');
  });
});
