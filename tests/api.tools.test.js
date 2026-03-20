// Tests for GET /api/tools route handler. Requires Pro subscription.

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({ _body: data, _status: init?.status ?? 200 }),
  },
}));

jest.mock('../lib/auth/requireAuth', () => ({ requireAuth: jest.fn() }));
jest.mock('../lib/db/users', () => ({ getUserById: jest.fn() }));
jest.mock('../lib/db/profiles', () => ({ getProfileById: jest.fn() }));
jest.mock('../lib/api/resolveDayData', () => ({ resolveDayData: jest.fn() }));
jest.mock('../lib/ai/context', () => ({
  assembleContext: jest.fn(() => ({
    date: '2026-03-21', timeOfDay: 'morning', isLateEvening: false, accuracyTier: 'full',
    onboarding: { workType: 'Sales', focus: null, preference: 'brief', goal: null },
    scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'grey', newProjects: 'green', decisions: 'grey' },
    significantAspects: [], activeEvents: [], recentParagraphs: null, journalEntries: null,
  })),
}));
jest.mock('../lib/ai/generateQuickTool', () => ({
  generateQuickTool: jest.fn(async () => 'Lead with rapport over persuasion today.'),
}));

const { GET } = require('../app/api/tools/route.js');
const { requireAuth } = require('../lib/auth/requireAuth');
const { getUserById } = require('../lib/db/users');
const { getProfileById } = require('../lib/db/profiles');
const { resolveDayData } = require('../lib/api/resolveDayData');
const { generateQuickTool } = require('../lib/ai/generateQuickTool');

const USER_ID = 'user-uuid';
const PROFILE_ID = 'profile-uuid';
const PRO_USER = { id: USER_ID, subscription_tier: 'pro', subscription_status: 'active' };
const PROFILE = { id: PROFILE_ID, user_id: USER_ID, accuracy_tier: 'full' };
const DAY_DATA = {
  aspects: [], events: { activeEvents: [] },
  scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'grey', new_projects: 'green', decisions: 'grey' },
};

function makeRequest(params) {
  return {
    url: 'http://localhost/api/tools?' + new URLSearchParams(params).toString(),
    headers: { get: (h) => h === 'authorization' ? 'Bearer test-token' : null },
  };
}

describe('GET /api/tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAuth.mockResolvedValue({ user: { id: USER_ID } });
    getUserById.mockResolvedValue(PRO_USER);
    getProfileById.mockResolvedValue(PROFILE);
    resolveDayData.mockResolvedValue(DAY_DATA);
  });

  test('returns 401 when auth fails', async () => {
    requireAuth.mockResolvedValue({ error: 'Unauthorized', status: 401 });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'email_opener' }));
    expect(res._status).toBe(401);
  });

  test('returns 403 when user is on free tier', async () => {
    getUserById.mockResolvedValue({ ...PRO_USER, subscription_tier: 'free' });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'email_opener' }));
    expect(res._status).toBe(403);
    expect(res._body.error).toContain('Pro subscription required');
  });

  test('returns 403 when user not found', async () => {
    getUserById.mockResolvedValue(null);
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'email_opener' }));
    expect(res._status).toBe(403);
  });

  test('returns 400 when required param is missing', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts' }));
    expect(res._status).toBe(400);
  });

  test('returns 400 for invalid category', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'invalid', toolType: 'email_opener' }));
    expect(res._status).toBe(400);
  });

  test('returns 400 for invalid toolType', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'bad_tool' }));
    expect(res._status).toBe(400);
  });

  test('returns 404 when profile not found', async () => {
    getProfileById.mockResolvedValue(null);
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'email_opener' }));
    expect(res._status).toBe(404);
  });

  test('returns 403 when profile belongs to different user', async () => {
    getProfileById.mockResolvedValue({ ...PROFILE, user_id: 'other' });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'email_opener' }));
    expect(res._status).toBe(403);
  });

  test('returns output on success', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'email_opener' }));
    expect(res._status).toBe(200);
    expect(res._body.output).toBe('Lead with rapport over persuasion today.');
  });

  test('passes correct args to generateQuickTool', async () => {
    await GET(makeRequest({ profileId: PROFILE_ID, date: '2026-03-21', category: 'contacts', toolType: 'what_to_avoid' }));
    expect(generateQuickTool).toHaveBeenCalledWith(
      expect.any(Object), 'what_to_avoid', 'contacts', 'green', PROFILE_ID
    );
  });
});
