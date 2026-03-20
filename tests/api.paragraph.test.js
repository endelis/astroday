// Tests for GET /api/paragraph route handler.

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({ _body: data, _status: init?.status ?? 200 }),
  },
}));

jest.mock('../lib/auth/requireAuth', () => ({ requireAuth: jest.fn() }));
jest.mock('../lib/db/profiles', () => ({ getProfileById: jest.fn() }));
jest.mock('../lib/api/resolveDayData', () => ({ resolveDayData: jest.fn() }));
jest.mock('../lib/ai/context', () => ({
  assembleContext: jest.fn(() => ({
    date: '2026-03-21', timeOfDay: 'morning', isLateEvening: false, accuracyTier: 'full',
    onboarding: { workType: 'Sales', focus: null, preference: 'detailed', goal: null },
    scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'grey', newProjects: 'green', decisions: 'grey' },
    significantAspects: [], activeEvents: [], recentParagraphs: null, journalEntries: null,
  })),
}));
jest.mock('../lib/ai/generateDailyParagraph', () => ({
  generateDailyParagraph: jest.fn(async () => 'Today is a strong day for outreach. Astrology reveals tendency, not destiny — you always have the final word.'),
}));

const { GET } = require('../app/api/paragraph/route.js');
const { requireAuth } = require('../lib/auth/requireAuth');
const { getProfileById } = require('../lib/db/profiles');
const { resolveDayData } = require('../lib/api/resolveDayData');
const { generateDailyParagraph } = require('../lib/ai/generateDailyParagraph');

const USER_ID = 'user-uuid';
const PROFILE_ID = 'profile-uuid';
const PROFILE = { id: PROFILE_ID, user_id: USER_ID, accuracy_tier: 'full' };
const DAY_DATA = {
  aspects: [], events: { activeEvents: [] },
  scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'grey', new_projects: 'green', decisions: 'grey' },
};

function makeRequest(params) {
  return {
    url: 'http://localhost/api/paragraph?' + new URLSearchParams(params).toString(),
    headers: { get: (h) => h === 'authorization' ? 'Bearer test-token' : null },
  };
}

describe('GET /api/paragraph', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAuth.mockResolvedValue({ user: { id: USER_ID } });
    getProfileById.mockResolvedValue(PROFILE);
    resolveDayData.mockResolvedValue(DAY_DATA);
  });

  test('returns 401 when auth fails', async () => {
    requireAuth.mockResolvedValue({ error: 'Unauthorized', status: 401 });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', timeOfDay: 'morning' }));
    expect(res._status).toBe(401);
  });

  test('returns 400 when required param is missing', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21' }));
    expect(res._status).toBe(400);
  });

  test('returns 400 for invalid timeOfDay', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', timeOfDay: 'noon' }));
    expect(res._status).toBe(400);
  });

  test('returns 404 when profile not found', async () => {
    getProfileById.mockResolvedValue(null);
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', timeOfDay: 'morning' }));
    expect(res._status).toBe(404);
  });

  test('returns 403 when profile belongs to different user', async () => {
    getProfileById.mockResolvedValue({ ...PROFILE, user_id: 'other' });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', timeOfDay: 'morning' }));
    expect(res._status).toBe(403);
  });

  test('returns paragraph on success', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', timeOfDay: 'morning' }));
    expect(res._status).toBe(200);
    expect(res._body.paragraph).toContain('Astrology reveals tendency');
  });

  test('calls generateDailyParagraph with profileId', async () => {
    await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', timeOfDay: 'afternoon' }));
    expect(generateDailyParagraph).toHaveBeenCalledWith(expect.any(Object), PROFILE_ID);
  });
});
