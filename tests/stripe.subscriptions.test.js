// Tests for lib/stripe/subscriptions.js
const { handleSubscriptionUpsert, handleSubscriptionDeleted, mapStatus } = require('../lib/stripe/subscriptions');

jest.mock('../lib/db/users');
const { updateUser } = require('../lib/db/users');

const USER_ID = 'user-uuid';

function makeSubscription(overrides = {}) {
  return {
    id: 'sub_test',
    status: 'active',
    customer: 'cus_test',
    trial_end: null,
    metadata: { user_id: USER_ID },
    ...overrides,
  };
}

describe('mapStatus', () => {
  test.each([
    ['active',             'active'],
    ['trialing',           'trialing'],
    ['past_due',           'active'],
    ['unpaid',             'expired'],
    ['canceled',           'cancelled'],
    ['incomplete',         'trialing'],
    ['incomplete_expired', 'expired'],
    ['unknown_status',     'expired'],
  ])('%s → %s', (stripe, expected) => {
    expect(mapStatus(stripe)).toBe(expected);
  });
});

describe('handleSubscriptionUpsert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateUser.mockResolvedValue({});
  });

  test('updates user to pro when status is active', async () => {
    await handleSubscriptionUpsert(makeSubscription({ status: 'active' }));
    expect(updateUser).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
      subscription_tier: 'pro',
      subscription_status: 'active',
      stripe_customer_id: 'cus_test',
    }));
  });

  test('updates user to pro when status is trialing', async () => {
    await handleSubscriptionUpsert(makeSubscription({ status: 'trialing', trial_end: 1800000000 }));
    expect(updateUser).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
      subscription_tier: 'pro',
      subscription_status: 'trialing',
      trial_ends_at: expect.any(String),
    }));
  });

  test('updates user to free when status is canceled', async () => {
    await handleSubscriptionUpsert(makeSubscription({ status: 'canceled' }));
    expect(updateUser).toHaveBeenCalledWith(USER_ID, expect.objectContaining({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
    }));
  });

  test('logs error and skips update when user_id missing from metadata', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleSubscriptionUpsert(makeSubscription({ metadata: {} }));
    expect(updateUser).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('handleSubscriptionDeleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateUser.mockResolvedValue({});
  });

  test('sets user to free + cancelled', async () => {
    await handleSubscriptionDeleted(makeSubscription());
    expect(updateUser).toHaveBeenCalledWith(USER_ID, {
      subscription_tier: 'free',
      subscription_status: 'cancelled',
    });
  });

  test('logs error and skips update when user_id missing', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await handleSubscriptionDeleted(makeSubscription({ metadata: {} }));
    expect(updateUser).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
