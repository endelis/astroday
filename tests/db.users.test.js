const { getUserById, getUserByEmail, createUser, updateUser } = require('../lib/db/users');

function makeQuery(selectResult, mutateResult) {
  // For insert/update: select().single() chains after insert/update
  const q = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(selectResult ?? { data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };
  // insert/update chain: .select().single() — single is already on q
  return q;
}

let mockQuery;

jest.mock('../lib/db/client', () => ({
  getSupabaseClient: () => mockQuery,
}));

const USER = {
  id: 'user-uuid',
  email: 'test@example.com',
  created_at: '2026-03-20T10:00:00Z',
  subscription_tier: 'free',
  subscription_status: 'trialing',
  stripe_customer_id: null,
  trial_ends_at: null,
  onboarding_complete: false,
};

describe('getUserById', () => {
  it('returns user on hit', async () => {
    mockQuery = makeQuery({ data: USER, error: null });
    const result = await getUserById('user-uuid');
    expect(result).toEqual(USER);
  });

  it('returns null on PGRST116', async () => {
    mockQuery = makeQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getUserById('missing-uuid');
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getUserById('user-uuid');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getUserById]', 'db error');
    spy.mockRestore();
  });
});

describe('getUserByEmail', () => {
  it('returns user on hit', async () => {
    mockQuery = makeQuery({ data: USER, error: null });
    const result = await getUserByEmail('test@example.com');
    expect(result).toEqual(USER);
  });

  it('returns null on PGRST116', async () => {
    mockQuery = makeQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getUserByEmail('nobody@example.com');
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getUserByEmail('test@example.com');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getUserByEmail]', 'db error');
    spy.mockRestore();
  });
});

describe('createUser', () => {
  it('returns created user on success', async () => {
    mockQuery = makeQuery({ data: USER, error: null });
    const result = await createUser('test@example.com');
    expect(result).toEqual(USER);
    expect(mockQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com', subscription_tier: 'free', subscription_status: 'trialing' })
    );
  });

  it('returns null and logs on insert error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { message: 'insert failed' } });
    const result = await createUser('test@example.com');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[createUser]', 'insert failed');
    spy.mockRestore();
  });
});

describe('updateUser', () => {
  it('returns updated user on success', async () => {
    const updated = { ...USER, onboarding_complete: true };
    mockQuery = makeQuery({ data: updated, error: null });
    const result = await updateUser('user-uuid', { onboarding_complete: true });
    expect(result).toEqual(updated);
    expect(mockQuery.update).toHaveBeenCalledWith({ onboarding_complete: true });
  });

  it('returns null and logs on update error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { message: 'update failed' } });
    const result = await updateUser('user-uuid', { onboarding_complete: true });
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[updateUser]', 'update failed');
    spy.mockRestore();
  });
});
