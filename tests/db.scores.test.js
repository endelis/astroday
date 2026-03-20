const { getCachedScores, setCachedScores } = require('../lib/db/scores');

// Build a chainable Supabase query mock
function makeQuery(result) {
  const q = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    upsert: jest.fn().mockResolvedValue(result),
  };
  return q;
}

let mockQuery;

jest.mock('../lib/db/client', () => ({
  getSupabaseClient: () => mockQuery,
}));

const PROFILE_ID = 'profile-uuid';
const DATE = '2026-03-20';

const SCORES = {
  overall: 'green',
  contacts: 'green',
  money: 'grey',
  risk: 'red',
  new_projects: 'green',
  decisions: 'grey',
};

describe('getCachedScores', () => {
  it('returns data on cache hit', async () => {
    mockQuery = makeQuery({ data: SCORES, error: null });
    const result = await getCachedScores(PROFILE_ID, DATE);
    expect(result).toEqual(SCORES);
  });

  it('returns null on PGRST116 (no row found)', async () => {
    mockQuery = makeQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getCachedScores(PROFILE_ID, DATE);
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getCachedScores(PROFILE_ID, DATE);
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getCachedScores]', 'db error');
    spy.mockRestore();
  });
});

describe('setCachedScores', () => {
  it('calls upsert with all score fields', async () => {
    mockQuery = makeQuery({ data: null, error: null });
    await setCachedScores(PROFILE_ID, DATE, SCORES);
    expect(mockQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        profile_id: PROFILE_ID,
        date: DATE,
        overall: 'green',
        contacts: 'green',
        money: 'grey',
        risk: 'red',
        new_projects: 'green',
        decisions: 'grey',
      }),
      { onConflict: 'profile_id,date' }
    );
  });

  it('logs error if upsert fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { message: 'upsert failed' } });
    await setCachedScores(PROFILE_ID, DATE, SCORES);
    expect(spy).toHaveBeenCalledWith('[setCachedScores]', 'upsert failed');
    spy.mockRestore();
  });
});
