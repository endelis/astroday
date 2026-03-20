const { getProfileById, getProfilesByUserId, getPrimaryProfile, createProfile, updateProfile } = require('../lib/db/profiles');

function makeSingleQuery(result) {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue(result),
    single: jest.fn().mockResolvedValue(result),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };
}

let mockQuery;

jest.mock('../lib/db/client', () => ({
  getSupabaseClient: () => mockQuery,
}));

const PROFILE = {
  id: 'profile-uuid',
  user_id: 'user-uuid',
  label: 'My Profile',
  birth_date: '1990-06-15',
  birth_time: '08:30',
  birth_city: 'Riga',
  birth_lat: 56.9496,
  birth_lng: 24.1052,
  natal_chart: { sun: 84.5 },
  accuracy_tier: 'full',
  is_primary: true,
  onboarding_work_type: 'Sales',
  onboarding_focus: 'Timing decisions',
  onboarding_preference: 'detailed',
  onboarding_goal: 'Scale to 10 clients',
  created_at: '2026-03-20T10:00:00Z',
};

describe('getProfileById', () => {
  it('returns profile on hit', async () => {
    mockQuery = makeSingleQuery({ data: PROFILE, error: null });
    const result = await getProfileById('profile-uuid');
    expect(result).toEqual(PROFILE);
  });

  it('returns null on PGRST116', async () => {
    mockQuery = makeSingleQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getProfileById('missing-uuid');
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeSingleQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getProfileById('profile-uuid');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getProfileById]', 'db error');
    spy.mockRestore();
  });
});

describe('getProfilesByUserId', () => {
  it('returns array of profiles on success', async () => {
    mockQuery = makeSingleQuery({ data: [PROFILE], error: null });
    const result = await getProfilesByUserId('user-uuid');
    expect(result).toEqual([PROFILE]);
  });

  it('returns empty array on error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeSingleQuery({ data: null, error: { message: 'db error' } });
    const result = await getProfilesByUserId('user-uuid');
    expect(result).toEqual([]);
    spy.mockRestore();
  });

  it('returns empty array when data is null', async () => {
    mockQuery = makeSingleQuery({ data: null, error: null });
    const result = await getProfilesByUserId('user-uuid');
    expect(result).toEqual([]);
  });
});

describe('getPrimaryProfile', () => {
  it('returns primary profile on hit', async () => {
    mockQuery = makeSingleQuery({ data: PROFILE, error: null });
    const result = await getPrimaryProfile('user-uuid');
    expect(result).toEqual(PROFILE);
  });

  it('returns null on PGRST116', async () => {
    mockQuery = makeSingleQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getPrimaryProfile('user-uuid');
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeSingleQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getPrimaryProfile('user-uuid');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getPrimaryProfile]', 'db error');
    spy.mockRestore();
  });
});

describe('createProfile', () => {
  it('returns created profile on success', async () => {
    mockQuery = makeSingleQuery({ data: PROFILE, error: null });
    const result = await createProfile('user-uuid', { birth_date: '1990-06-15', is_primary: true });
    expect(result).toEqual(PROFILE);
    expect(mockQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-uuid', birth_date: '1990-06-15' })
    );
  });

  it('returns null and logs on insert error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeSingleQuery({ data: null, error: { message: 'insert failed' } });
    const result = await createProfile('user-uuid', {});
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[createProfile]', 'insert failed');
    spy.mockRestore();
  });
});

describe('updateProfile', () => {
  it('returns updated profile on success', async () => {
    const updated = { ...PROFILE, label: 'Updated' };
    mockQuery = makeSingleQuery({ data: updated, error: null });
    const result = await updateProfile('profile-uuid', { label: 'Updated' });
    expect(result).toEqual(updated);
    expect(mockQuery.update).toHaveBeenCalledWith({ label: 'Updated' });
  });

  it('returns null and logs on update error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeSingleQuery({ data: null, error: { message: 'update failed' } });
    const result = await updateProfile('profile-uuid', { label: 'Updated' });
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[updateProfile]', 'update failed');
    spy.mockRestore();
  });
});
