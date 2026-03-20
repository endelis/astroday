// Tests for generateDailyParagraph — Anthropic SDK mocked.
const MOCK_TEXT = 'Today carries a clear sense of forward movement. Mercury aligns well with your natal Sun, making this an ideal morning to reach out. Astrology reveals tendency, not destiny — you always have the final word.';

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: MOCK_TEXT }],
      }),
    },
  }));
});

const { generateDailyParagraph } = require('../lib/ai/generateDailyParagraph');
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

describe('generateDailyParagraph', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  test('returns text from Claude API', async () => {
    const result = await generateDailyParagraph(baseContext);
    expect(result).toBe(MOCK_TEXT);
  });

  test('calls API with correct model', async () => {
    await generateDailyParagraph(baseContext);
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-sonnet-4-20250514');
  });

  test('uses fewer tokens for brief preference', async () => {
    const briefContext = { ...baseContext, onboarding: { ...baseContext.onboarding, preference: 'brief' } };
    await generateDailyParagraph(briefContext);
    const detailedContext = baseContext;
    await generateDailyParagraph(detailedContext);

    const [briefCall, detailedCall] = Anthropic.mock.results.map(r => r.value.messages.create.mock.calls[0][0]);
    expect(briefCall.max_tokens).toBeLessThan(detailedCall.max_tokens);
  });

  test('returns fallback text when API throws', async () => {
    const Anthropic = require('@anthropic-ai/sdk');
    Anthropic.mockImplementationOnce(() => ({
      messages: { create: jest.fn().mockRejectedValue(new Error('API error')) },
    }));
    const result = await generateDailyParagraph(baseContext);
    expect(result).toContain('temporarily unavailable');
  });

  test('includes system prompt in API call', async () => {
    await generateDailyParagraph(baseContext);
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.system).toBeDefined();
    expect(callArgs.system).toContain('trusted personal advisor');
  });
});
