// Tests for lib/auth/requireAuth.js

const mockGetUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

const { requireAuth } = require('../lib/auth/requireAuth');

function makeRequest(authHeader) {
  return {
    headers: {
      get: (h) => h === 'authorization' ? authHeader : null,
    },
  };
}

describe('requireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  test('returns error 401 when Authorization header is missing', async () => {
    const result = await requireAuth(makeRequest(null));
    expect(result).toEqual({ error: 'Missing authorization header', status: 401 });
  });

  test('returns error 401 when header does not start with Bearer', async () => {
    const result = await requireAuth(makeRequest('Basic abc123'));
    expect(result).toEqual({ error: 'Missing authorization header', status: 401 });
  });

  test('returns error 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid token' } });
    const result = await requireAuth(makeRequest('Bearer bad-token'));
    expect(result).toEqual({ error: 'Invalid or expired token', status: 401 });
  });

  test('returns user when token is valid', async () => {
    const user = { id: 'user-uuid', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });
    const result = await requireAuth(makeRequest('Bearer valid-token'));
    expect(result).toEqual({ user });
  });

  test('extracts token correctly from Bearer header', async () => {
    const user = { id: 'user-uuid' };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });
    await requireAuth(makeRequest('Bearer my-actual-token'));
    expect(mockGetUser).toHaveBeenCalledWith('my-actual-token');
  });
});
