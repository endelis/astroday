const { getCachedInsight, setCachedInsight, getCachedQuickTool, setCachedQuickTool } = require('../lib/db/insights');

function makeQuery(result) {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    upsert: jest.fn().mockResolvedValue(result),
  };
}

let mockQuery;

jest.mock('../lib/db/client', () => ({
  getSupabaseClient: () => mockQuery,
}));

const PROFILE_ID = 'profile-uuid';
const DATE = '2026-03-20';

describe('getCachedInsight', () => {
  it('returns insight_text on hit', async () => {
    mockQuery = makeQuery({ data: { insight_text: 'Today looks strong.' }, error: null });
    const result = await getCachedInsight(PROFILE_ID, DATE, 'contacts', 'morning');
    expect(result).toBe('Today looks strong.');
  });

  it('returns null on PGRST116', async () => {
    mockQuery = makeQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getCachedInsight(PROFILE_ID, DATE, 'contacts', 'morning');
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getCachedInsight(PROFILE_ID, DATE, 'contacts', 'morning');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getCachedInsight]', 'db error');
    spy.mockRestore();
  });
});

describe('setCachedInsight', () => {
  it('calls upsert with correct fields', async () => {
    mockQuery = makeQuery({ data: null, error: null });
    await setCachedInsight(PROFILE_ID, DATE, 'money', 'afternoon', 'Insight text here.');
    expect(mockQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        profile_id: PROFILE_ID,
        date: DATE,
        category: 'money',
        time_of_day: 'afternoon',
        insight_text: 'Insight text here.',
      }),
      { onConflict: 'profile_id,date,category,time_of_day' }
    );
  });

  it('logs error if upsert fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { message: 'upsert failed' } });
    await setCachedInsight(PROFILE_ID, DATE, 'money', 'afternoon', 'text');
    expect(spy).toHaveBeenCalledWith('[setCachedInsight]', 'upsert failed');
    spy.mockRestore();
  });
});

describe('getCachedQuickTool', () => {
  it('returns output_text on hit', async () => {
    mockQuery = makeQuery({ data: { output_text: 'Avoid signing contracts today.' }, error: null });
    const result = await getCachedQuickTool(PROFILE_ID, DATE, 'what_to_avoid', 'decisions');
    expect(result).toBe('Avoid signing contracts today.');
  });

  it('returns null on PGRST116', async () => {
    mockQuery = makeQuery({ data: null, error: { code: 'PGRST116', message: 'not found' } });
    const result = await getCachedQuickTool(PROFILE_ID, DATE, 'what_to_avoid', 'decisions');
    expect(result).toBeNull();
  });

  it('returns null and logs on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { code: 'OTHER', message: 'db error' } });
    const result = await getCachedQuickTool(PROFILE_ID, DATE, 'what_to_avoid', 'decisions');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('[getCachedQuickTool]', 'db error');
    spy.mockRestore();
  });
});

describe('setCachedQuickTool', () => {
  it('calls upsert with correct fields', async () => {
    mockQuery = makeQuery({ data: null, error: null });
    await setCachedQuickTool(PROFILE_ID, DATE, 'email_opener', 'contacts', 'Opening line here.');
    expect(mockQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        profile_id: PROFILE_ID,
        date: DATE,
        tool_type: 'email_opener',
        category: 'contacts',
        output_text: 'Opening line here.',
      }),
      { onConflict: 'profile_id,date,tool_type,category' }
    );
  });

  it('logs error if upsert fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery = makeQuery({ data: null, error: { message: 'upsert failed' } });
    await setCachedQuickTool(PROFILE_ID, DATE, 'email_opener', 'contacts', 'text');
    expect(spy).toHaveBeenCalledWith('[setCachedQuickTool]', 'upsert failed');
    spy.mockRestore();
  });
});
