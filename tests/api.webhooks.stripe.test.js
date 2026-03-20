// Tests for POST /api/webhooks/stripe route handler.

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({ _body: data, _status: init?.status ?? 200 }),
  },
}));

jest.mock('../lib/stripe/subscriptions', () => ({
  handleSubscriptionUpsert: jest.fn(),
  handleSubscriptionDeleted: jest.fn(),
}));

const mockConstructEvent = jest.fn();
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  }));
});

const { POST } = require('../app/api/webhooks/stripe/route.js');
const { handleSubscriptionUpsert, handleSubscriptionDeleted } = require('../lib/stripe/subscriptions');

function makeRequest({ body = '{}', signature = 'valid-sig' } = {}) {
  return {
    headers: { get: (h) => h === 'stripe-signature' ? signature : null },
    text: async () => body,
  };
}

const SUBSCRIPTION = {
  id: 'sub_test',
  status: 'active',
  customer: 'cus_test',
  trial_end: null,
  metadata: { user_id: 'user-uuid' },
};

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    handleSubscriptionUpsert.mockResolvedValue(undefined);
    handleSubscriptionDeleted.mockResolvedValue(undefined);
  });

  test('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(makeRequest({ signature: null }));
    expect(res._status).toBe(400);
    expect(res._body.error).toContain('stripe-signature');
  });

  test('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
    const res = await POST(makeRequest());
    expect(res._status).toBe(400);
    expect(res._body.error).toContain('Invalid signature');
  });

  test('returns 200 for unhandled event types', async () => {
    mockConstructEvent.mockReturnValue({ type: 'payment_intent.created', data: { object: {} } });
    const res = await POST(makeRequest());
    expect(res._status).toBe(200);
    expect(res._body.received).toBe(true);
    expect(handleSubscriptionUpsert).not.toHaveBeenCalled();
  });

  test('calls handleSubscriptionUpsert for subscription.created', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.created', data: { object: SUBSCRIPTION } });
    const res = await POST(makeRequest());
    expect(res._status).toBe(200);
    expect(handleSubscriptionUpsert).toHaveBeenCalledWith(SUBSCRIPTION);
  });

  test('calls handleSubscriptionUpsert for subscription.updated', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.updated', data: { object: SUBSCRIPTION } });
    const res = await POST(makeRequest());
    expect(res._status).toBe(200);
    expect(handleSubscriptionUpsert).toHaveBeenCalledWith(SUBSCRIPTION);
  });

  test('calls handleSubscriptionDeleted for subscription.deleted', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.deleted', data: { object: SUBSCRIPTION } });
    const res = await POST(makeRequest());
    expect(res._status).toBe(200);
    expect(handleSubscriptionDeleted).toHaveBeenCalledWith(SUBSCRIPTION);
  });

  test('returns 500 when handler throws', async () => {
    mockConstructEvent.mockReturnValue({ type: 'customer.subscription.created', data: { object: SUBSCRIPTION } });
    handleSubscriptionUpsert.mockRejectedValue(new Error('DB error'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await POST(makeRequest());
    expect(res._status).toBe(500);
    spy.mockRestore();
  });
});
