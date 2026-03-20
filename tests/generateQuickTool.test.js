// Tests for generateQuickTool — Anthropic SDK and db/insights mocked.
const MOCK_TEXT = 'Lead with curiosity rather than pitch today — the energy supports rapport over persuasion.';
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

const mockGetCachedQuickTool = jest.fn();
const mockSetCachedQuickTool = jest.fn();

jest.mock('../lib/db/insights', () => ({
  getCachedQuickTool: mockGetCachedQuickTool,
  setCachedQuickTool: mockSetCachedQuickTool,
}));

const { generateQuickTool } = require('../lib/ai/generateQuickTool');
const Anthropic = require('@anthropic-ai/sdk');

const baseContext = {
  date: '2026-03-20',
  timeOfDay: 'morning',
  isLateEvening: false,
  accuracyTier: 'full',
  onboarding: { workType: 'Sales', focus: 'Timing decisions', preference: 'brief', goal: null },
  scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'red', newProjects: 'green', decisions: 'grey' },
  significantAspects: [],
  activeEvents: [],
  recentParagraphs: null,
  journalEntries: null,
};

describe('generateQuickTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockGetCachedQuickTool.mockResolvedValue(null);
    mockSetCachedQuickTool.mockResolvedValue(undefined);
  });

  test('returns cached text without calling API on cache hit', async () => {
    mockGetCachedQuickTool.mockResolvedValue('Cached tool output.');
    const result = await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green', PROFILE_ID);
    expect(result).toBe('Cached tool output.');
    expect(Anthropic).not.toHaveBeenCalled();
  });

  test('calls API on cache miss and stores result', async () => {
    const result = await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green', PROFILE_ID);
    expect(result).toBe(MOCK_TEXT);
    expect(mockSetCachedQuickTool).toHaveBeenCalledWith(PROFILE_ID, baseContext.date, 'email_opener', 'contacts', MOCK_TEXT);
  });

  test('checks cache with correct keys', async () => {
    await generateQuickTool(baseContext, 'what_to_avoid', 'decisions', 'red', PROFILE_ID);
    expect(mockGetCachedQuickTool).toHaveBeenCalledWith(PROFILE_ID, '2026-03-20', 'what_to_avoid', 'decisions');
  });

  test('returns text from Claude API on cache miss', async () => {
    const result = await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green', PROFILE_ID);
    expect(result).toBe(MOCK_TEXT);
  });

  test('calls API with correct model', async () => {
    await generateQuickTool(baseContext, 'action_prompt', 'contacts', 'green', PROFILE_ID);
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-sonnet-4-20250514');
  });

  test('uses 150 max tokens (short output by design)', async () => {
    await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green', PROFILE_ID);
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.max_tokens).toBe(150);
  });

  test('throws on invalid tool type', async () => {
    await expect(generateQuickTool(baseContext, 'invalid_tool', 'contacts', 'green', PROFILE_ID)).rejects.toThrow('Invalid tool type');
  });

  test('throws on invalid category', async () => {
    await expect(generateQuickTool(baseContext, 'email_opener', 'invalid', 'green', PROFILE_ID)).rejects.toThrow('Invalid category');
  });

  test('throws on invalid score', async () => {
    await expect(generateQuickTool(baseContext, 'email_opener', 'contacts', 'orange', PROFILE_ID)).rejects.toThrow('Invalid score');
  });

  test('accepts all 3 valid tool types', async () => {
    const tools = ['email_opener', 'what_to_avoid', 'action_prompt'];
    for (const tool of tools) {
      const result = await generateQuickTool(baseContext, tool, 'contacts', 'green', PROFILE_ID);
      expect(result).toBe(MOCK_TEXT);
    }
  });

  test('returns fallback text when API throws', async () => {
    Anthropic.mockImplementationOnce(() => ({
      messages: { create: jest.fn().mockRejectedValue(new Error('timeout')) },
    }));
    const result = await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green', PROFILE_ID);
    expect(result).toContain('temporarily unavailable');
  });
});
