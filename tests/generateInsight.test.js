// Tests for generateInsight — Anthropic SDK and db/insights mocked.
const MOCK_TEXT = 'Your communication channels are unusually clear this morning. Astrology reveals tendency, not destiny — you always have the final word.';
const PROFILE_ID = 'profile-uuid';

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: MOCK_TEXT }],
      }),
    },
  }));
});

const mockGetCachedInsight = jest.fn();
const mockSetCachedInsight = jest.fn();

jest.mock('../lib/db/insights', () => ({
  getCachedInsight: mockGetCachedInsight,
  setCachedInsight: mockSetCachedInsight,
}));

const { generateInsight } = require('../lib/ai/generateInsight');
const Anthropic = require('@anthropic-ai/sdk');

const baseContext = {
  date: '2026-03-20',
  timeOfDay: 'morning',
  isLateEvening: false,
  accuracyTier: 'full',
  onboarding: { workType: 'Sales', focus: 'Timing decisions', preference: 'detailed', goal: null },
  scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'red', newProjects: 'green', decisions: 'grey' },
  significantAspects: ['mercury trine natal sun (harmonious, orb 2.1°)'],
  activeEvents: [],
  recentParagraphs: null,
  journalEntries: null,
};

describe('generateInsight', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockGetCachedInsight.mockResolvedValue(null);
    mockSetCachedInsight.mockResolvedValue(undefined);
  });

  test('returns cached text without calling API on cache hit', async () => {
    mockGetCachedInsight.mockResolvedValue('Cached insight.');
    const result = await generateInsight(baseContext, 'contacts', 'green', [], PROFILE_ID);
    expect(result).toBe('Cached insight.');
    expect(Anthropic).not.toHaveBeenCalled();
  });

  test('calls API on cache miss and stores result', async () => {
    const result = await generateInsight(baseContext, 'contacts', 'green', ['mercury trine natal sun'], PROFILE_ID);
    expect(result).toBe(MOCK_TEXT);
    expect(mockSetCachedInsight).toHaveBeenCalledWith(PROFILE_ID, baseContext.date, 'contacts', 'morning', MOCK_TEXT);
  });

  test('checks cache with correct keys', async () => {
    await generateInsight(baseContext, 'money', 'grey', [], PROFILE_ID);
    expect(mockGetCachedInsight).toHaveBeenCalledWith(PROFILE_ID, '2026-03-20', 'money', 'morning');
  });

  test('returns text from Claude API on cache miss', async () => {
    const result = await generateInsight(baseContext, 'contacts', 'green', ['mercury trine natal sun'], PROFILE_ID);
    expect(result).toBe(MOCK_TEXT);
  });

  test('calls API with correct model', async () => {
    await generateInsight(baseContext, 'contacts', 'green', [], PROFILE_ID);
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-sonnet-4-20250514');
  });

  test('throws on invalid category', async () => {
    await expect(generateInsight(baseContext, 'invalid_category', 'green', [], PROFILE_ID)).rejects.toThrow('Invalid category');
  });

  test('throws on invalid score', async () => {
    await expect(generateInsight(baseContext, 'contacts', 'purple', [], PROFILE_ID)).rejects.toThrow('Invalid score');
  });

  test('accepts all 5 valid categories', async () => {
    const categories = ['contacts', 'money', 'risk', 'new_projects', 'decisions'];
    for (const category of categories) {
      const result = await generateInsight(baseContext, category, 'green', [], PROFILE_ID);
      expect(result).toBe(MOCK_TEXT);
    }
  });

  test('returns fallback text when API throws', async () => {
    Anthropic.mockImplementationOnce(() => ({
      messages: { create: jest.fn().mockRejectedValue(new Error('network error')) },
    }));
    const result = await generateInsight(baseContext, 'contacts', 'green', [], PROFILE_ID);
    expect(result).toContain('temporarily unavailable');
  });

  test('brief preference uses fewer tokens than detailed', async () => {
    const briefCtx = { ...baseContext, onboarding: { ...baseContext.onboarding, preference: 'brief' } };
    await generateInsight(briefCtx, 'contacts', 'green', [], PROFILE_ID);
    await generateInsight(baseContext, 'contacts', 'green', [], PROFILE_ID);

    const [briefCall, detailCall] = Anthropic.mock.results.map(r => r.value.messages.create.mock.calls[0][0]);
    expect(briefCall.max_tokens).toBeLessThan(detailCall.max_tokens);
  });
});
