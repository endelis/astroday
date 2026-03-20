// Tests for GET /api/scores route handler.

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({ _body: data, _status: init?.status ?? 200 }),
  },
}));

jest.mock('../lib/auth/requireAuth', () => ({ requireAuth: jest.fn() }));
jest.mock('../lib/db/profiles', () => ({ getProfileById: jest.fn() }));
jest.mock('../lib/db/scores', () => ({ getCachedScores: jest.fn(), setCachedScores: jest.fn() }));
jest.mock('../lib/astro/calculateNatalChart', () => ({
  calculateNatalChart: jest.fn(() => ({ planets: {}, accuracyTier: 'full' })),
}));
jest.mock('../lib/astro/calculateDailyTransits', () => ({
  calculateDailyTransits: jest.fn(() => ({ date: '2026-03-21', planets: {} })),
}));
jest.mock('../lib/astro/detectAspects', () => ({ detectAspects: jest.fn(() => []) }));
jest.mock('../lib/astro/planetaryEvents', () => ({
  detectPlanetaryEvents: jest.fn(() => ({ activeEvents: [] })),
}));
jest.mock('../lib/scoring/contacts',    () => ({ scoreContacts:    jest.fn(() => ({ score: 'green', reasons: [] })) }));
jest.mock('../lib/scoring/money',       () => ({ scoreMoney:       jest.fn(() => ({ score: 'green', reasons: [] })) }));
jest.mock('../lib/scoring/risk',        () => ({ scoreRisk:        jest.fn(() => ({ score: 'grey',  reasons: [] })) }));
jest.mock('../lib/scoring/newProjects', () => ({ scoreNewProjects: jest.fn(() => ({ score: 'green', reasons: [] })) }));
jest.mock('../lib/scoring/decisions',   () => ({ scoreDecisions:   jest.fn(() => ({ score: 'grey',  reasons: [] })) }));

const { GET } = require('../app/api/scores/route.js');
const { requireAuth } = require('../lib/auth/requireAuth');
const { getProfileById } = require('../lib/db/profiles');
const { getCachedScores, setCachedScores } = require('../lib/db/scores');

const USER_ID = 'user-uuid';
const PROFILE_ID = 'profile-uuid';
const PROFILE = {
  id: PROFILE_ID,
  user_id: USER_ID,
  birth_date: '1990-06-15',
  birth_time: null,
  birth_lat: null,
  birth_lng: null,
  natal_chart: { planets: {}, accuracyTier: 'basic' },
  accuracy_tier: 'basic',
};

function makeRequest(params) {
  return {
    url: 'http://localhost/api/scores?' + new URLSearchParams(params).toString(),
    headers: { get: (h) => h === 'authorization' ? 'Bearer test-token' : null },
  };
}

describe('GET /api/scores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAuth.mockResolvedValue({ user: { id: USER_ID } });
    getProfileById.mockResolvedValue(PROFILE);
    getCachedScores.mockResolvedValue(null);
    setCachedScores.mockResolvedValue(undefined);
  });

  test('returns 401 when auth fails', async () => {
    requireAuth.mockResolvedValue({ error: 'Invalid or expired token', status: 401 });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21' }));
    expect(res._status).toBe(401);
  });

  test('returns 400 when profileId is missing', async () => {
    const res = await GET(makeRequest({ dates: '2026-03-21' }));
    expect(res._status).toBe(400);
  });

  test('returns 400 when dates is missing', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID }));
    expect(res._status).toBe(400);
  });

  test('returns 404 when profile not found', async () => {
    getProfileById.mockResolvedValue(null);
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21' }));
    expect(res._status).toBe(404);
  });

  test('returns 403 when profile belongs to different user', async () => {
    getProfileById.mockResolvedValue({ ...PROFILE, user_id: 'other-user' });
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21' }));
    expect(res._status).toBe(403);
  });

  test('returns scores from cache on cache hit', async () => {
    const cached = { overall: 'green', contacts: 'green', money: 'green', risk: 'grey', new_projects: 'green', decisions: 'grey' };
    getCachedScores.mockResolvedValue(cached);
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21' }));
    expect(res._status).toBe(200);
    expect(res._body.scores['2026-03-21']).toEqual(cached);
    expect(setCachedScores).not.toHaveBeenCalled();
  });

  test('calculates and caches scores on cache miss', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21' }));
    expect(res._status).toBe(200);
    const day = res._body.scores['2026-03-21'];
    expect(day).toHaveProperty('overall');
    expect(day).toHaveProperty('contacts');
    expect(setCachedScores).toHaveBeenCalledWith(
      PROFILE_ID, '2026-03-21', expect.objectContaining({ overall: expect.any(String) })
    );
  });

  test('returns scores for multiple dates', async () => {
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21,2026-03-22' }));
    expect(res._status).toBe(200);
    expect(Object.keys(res._body.scores)).toHaveLength(2);
  });

  test('overall is green when 3+ categories are green', async () => {
    // contacts=green, money=green, risk=grey, new_projects=green, decisions=grey → 3 green
    const res = await GET(makeRequest({ profileId: PROFILE_ID, dates: '2026-03-21' }));
    expect(res._body.scores['2026-03-21'].overall).toBe('green');
  });
});
