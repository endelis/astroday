// Tests for GET /api/insights route handler.

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
jest.mock('../lib/ai/generateInsight', () => ({ generateInsight: jest.fn(async () => 'Insight text here.') }));

const { GET } = require('../app/api/insights/route.js');
const { requireAuth } = require('../lib/auth/requireAuth');
const { getProfileById } = require('../lib/db/profiles');
const { resolveDayData } = require('../lib/api/resolveDayData');
const { generateInsight } = require('../lib/ai/generateInsight');

const USER_ID = 'user-uuid';
const PROFILE_ID = 'profile-uuid';
const PROFILE = { id: PROFILE_ID, user_id: USER_ID, accuracy_tier: 'full', onboarding_preference: 'detailed' };
const DAY_DATA = {
  aspects: [], events: { activeEvents: [] },
  scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'grey', new_projects: 'green', decisions: 'grey' },
  categoryReasons: { contacts: ['mercury trine natal sun'], money: [], risk: [], new_projects: [], decisions: [] },
};

function makeRequest(params) {
  return {
    url: 'http://localhost/api/insights?' + new URLSearchParams(params).toString(),
    headers: { get: (h) => h === 'authorization' ? 'Bearer test-token' : null },
  };
}

describe('GET /api/insights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAuth.mockResolvedValue({ user: { id: USER_ID } });
    getProfileById.mockResolvedValue(PROFILE);
    resolveDayData.mockResolvedValue(DAY_DATA);
  });

  test('returns 401 when auth fails', async () => {
    requireAuth.mockResolvedValue({ error: 'Unauthorized', status: 401 });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', timeOfDay: 'morning' }));
    expect(res._status).toBe(401);
  });

  test('returns 400 when timeOfDay is missing', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts' }));
    expect(res._status).toBe(400);
  });

  test('returns 400 for invalid category', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'invalid', timeOfDay: 'morning' }));
    expect(res._status).toBe(400);
  });

  test('returns 400 for invalid timeOfDay', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', timeOfDay: 'midnight' }));
    expect(res._status).toBe(400);
  });

  test('returns 404 when profile not found', async () => {
    getProfileById.mockResolvedValue(null);
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', timeOfDay: 'morning' }));
    expect(res._status).toBe(404);
  });

  test('returns 403 when profile belongs to different user', async () => {
    getProfileById.mockResolvedValue({ ...PROFILE, user_id: 'other' });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', timeOfDay: 'morning' }));
    expect(res._status).toBe(403);
  });

  test('returns insight on success', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', timeOfDay: 'morning' }));
    expect(res._status).toBe(200);
    expect(res._body.insight).toBe('Insight text here.');
  });

  test('passes correct score and reasons to generateInsight', async () => {
    await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', timeOfDay: 'morning' }));
    expect(generateInsight).toHaveBeenCalledWith(
      expect.any(Object), 'contacts', 'green', ['mercury trine natal sun'], PROFILE_ID
    );
  });

  test('accepts all 3 timeOfDay values', async () => {
    for (const tod of ['morning', 'afternoon', 'evening']) {
      const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'money', timeOfDay: tod }));
      expect(res._status).toBe(200);
    }
  });
});
