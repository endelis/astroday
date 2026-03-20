const { getSupabaseClient, resetClient } = require('../lib/db/client');

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ mock: 'client' })),
}));

const { createClient } = require('@supabase/supabase-js');

describe('getSupabaseClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetClient();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('creates a client with the env vars', () => {
    const client = getSupabaseClient();
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'service-role-key');
    expect(client).toEqual({ mock: 'client' });
  });

  it('returns the same memoized client on second call', () => {
    const first = getSupabaseClient();
    const second = getSupabaseClient();
    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it('throws if env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(() => getSupabaseClient()).toThrow('Supabase environment variables');
  });

  it('resetClient allows a fresh client to be created', () => {
    getSupabaseClient();
    resetClient();
    getSupabaseClient();
    expect(createClient).toHaveBeenCalledTimes(2);
  });
});
