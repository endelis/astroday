// Tests for generateQuickTool — Anthropic SDK mocked.
const MOCK_TEXT = 'Lead with curiosity rather than pitch today — the energy supports rapport over persuasion.';

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: MOCK_TEXT }],
      }),
    },
  }));
});

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
  });

  test('returns text from Claude API', async () => {
    const result = await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green');
    expect(result).toBe(MOCK_TEXT);
  });

  test('calls API with correct model', async () => {
    await generateQuickTool(baseContext, 'action_prompt', 'contacts', 'green');
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-sonnet-4-20250514');
  });

  test('uses 150 max tokens (short output by design)', async () => {
    await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green');
    const instance = Anthropic.mock.results[0].value;
    const callArgs = instance.messages.create.mock.calls[0][0];
    expect(callArgs.max_tokens).toBe(150);
  });

  test('throws on invalid tool type', async () => {
    await expect(generateQuickTool(baseContext, 'invalid_tool', 'contacts', 'green')).rejects.toThrow('Invalid tool type');
  });

  test('throws on invalid category', async () => {
    await expect(generateQuickTool(baseContext, 'email_opener', 'invalid', 'green')).rejects.toThrow('Invalid category');
  });

  test('throws on invalid score', async () => {
    await expect(generateQuickTool(baseContext, 'email_opener', 'contacts', 'orange')).rejects.toThrow('Invalid score');
  });

  test('accepts all 3 valid tool types', async () => {
    const tools = ['email_opener', 'what_to_avoid', 'action_prompt'];
    for (const tool of tools) {
      const result = await generateQuickTool(baseContext, tool, 'contacts', 'green');
      expect(result).toBe(MOCK_TEXT);
    }
  });

  test('returns fallback text when API throws', async () => {
    Anthropic.mockImplementationOnce(() => ({
      messages: { create: jest.fn().mockRejectedValue(new Error('timeout')) },
    }));
    const result = await generateQuickTool(baseContext, 'email_opener', 'contacts', 'green');
    expect(result).toContain('temporarily unavailable');
  });
});
