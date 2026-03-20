// Tests for prompt templates — verifies structure and critical rules.
const {
  buildSystemPrompt,
  buildDailyParagraphPrompt,
  buildCategoryInsightPrompt,
  buildQuickToolPrompt,
  CAVEAT,
} = require('../lib/ai/prompts');

const baseContext = {
  date: '2026-03-20',
  timeOfDay: 'morning',
  isLateEvening: false,
  accuracyTier: 'full',
  onboarding: { workType: 'Sales', focus: 'Timing decisions', preference: 'detailed', goal: 'Close deals' },
  scores: { overall: 'green', contacts: 'green', money: 'grey', risk: 'red', newProjects: 'green', decisions: 'grey' },
  significantAspects: ['mercury trine natal sun (harmonious, orb 2.1°)'],
  activeEvents: [],
  recentParagraphs: null,
  journalEntries: null,
};

describe('CAVEAT', () => {
  test('contains the required closing sentence', () => {
    expect(CAVEAT).toContain('Astrology reveals tendency, not destiny');
    expect(CAVEAT).toContain('you always have the final word');
  });
});

describe('buildSystemPrompt', () => {
  test('never contains the word "AI"', () => {
    const prompt = buildSystemPrompt();
    expect(prompt.toLowerCase()).not.toMatch(/\bai\b/);
  });

  test('instructs to end with the caveat', () => {
    expect(buildSystemPrompt()).toContain('Astrology reveals tendency, not destiny');
  });

  test('instructs second person voice', () => {
    expect(buildSystemPrompt()).toMatch(/second person/i);
  });
});

describe('buildDailyParagraphPrompt', () => {
  test('includes the date', () => {
    expect(buildDailyParagraphPrompt(baseContext)).toContain('2026-03-20');
  });

  test('includes work type', () => {
    expect(buildDailyParagraphPrompt(baseContext)).toContain('Sales');
  });

  test('includes caveat instruction', () => {
    expect(buildDailyParagraphPrompt(baseContext)).toContain(CAVEAT);
  });

  test('includes score information', () => {
    const prompt = buildDailyParagraphPrompt(baseContext);
    expect(prompt).toContain('green');
  });

  test('morning context uses forward-looking language', () => {
    const prompt = buildDailyParagraphPrompt({ ...baseContext, timeOfDay: 'morning' });
    expect(prompt.toLowerCase()).toMatch(/forward|today holds|approach/);
  });

  test('evening context uses reflective language', () => {
    const prompt = buildDailyParagraphPrompt({ ...baseContext, timeOfDay: 'evening' });
    expect(prompt.toLowerCase()).toMatch(/reflect|today was|context/);
  });

  test('late evening adds bridging note', () => {
    const prompt = buildDailyParagraphPrompt({ ...baseContext, timeOfDay: 'evening', isLateEvening: true });
    expect(prompt.toLowerCase()).toContain('tomorrow');
  });

  test('good accuracy adds accuracy note', () => {
    const prompt = buildDailyParagraphPrompt({ ...baseContext, accuracyTier: 'good' });
    expect(prompt.toLowerCase()).toContain('birth time');
  });

  test('full accuracy has no accuracy note', () => {
    const prompt = buildDailyParagraphPrompt(baseContext);
    expect(prompt).not.toContain('birth time');
  });

  test('includes planetary aspects', () => {
    const prompt = buildDailyParagraphPrompt(baseContext);
    expect(prompt).toContain('mercury trine natal sun');
  });

  test('includes active events when present', () => {
    const ctx = { ...baseContext, activeEvents: ['Mercury retrograde'] };
    expect(buildDailyParagraphPrompt(ctx)).toContain('Mercury retrograde');
  });

  test('includes recent paragraphs for continuity', () => {
    const ctx = { ...baseContext, recentParagraphs: '2026-03-19: Yesterday was calm.' };
    expect(buildDailyParagraphPrompt(ctx)).toContain('Yesterday was calm.');
  });
});

describe('buildCategoryInsightPrompt', () => {
  test('includes category name', () => {
    const prompt = buildCategoryInsightPrompt(baseContext, 'contacts', 'green', ['mercury trine sun']);
    expect(prompt).toContain('contacts');
  });

  test('includes score', () => {
    const prompt = buildCategoryInsightPrompt(baseContext, 'contacts', 'green', []);
    expect(prompt).toContain('green');
  });

  test('includes driving aspects', () => {
    const prompt = buildCategoryInsightPrompt(baseContext, 'money', 'red', ['venus square saturn']);
    expect(prompt).toContain('venus square saturn');
  });

  test('grey score prompts purposeful framing', () => {
    const prompt = buildCategoryInsightPrompt(baseContext, 'risk', 'grey', []);
    expect(prompt.toLowerCase()).toMatch(/purposeful|upcoming|pattern|reflective/);
  });

  test('includes caveat instruction', () => {
    expect(buildCategoryInsightPrompt(baseContext, 'decisions', 'green', [])).toContain(CAVEAT);
  });
});

describe('buildQuickToolPrompt', () => {
  test('email_opener prompt includes category and score', () => {
    const prompt = buildQuickToolPrompt(baseContext, 'email_opener', 'contacts', 'green');
    expect(prompt).toContain('contacts');
    expect(prompt).toContain('green');
  });

  test('what_to_avoid prompt references avoiding', () => {
    const prompt = buildQuickToolPrompt(baseContext, 'what_to_avoid', 'money', 'red');
    expect(prompt.toLowerCase()).toContain('avoid');
  });

  test('action_prompt requests single action', () => {
    const prompt = buildQuickToolPrompt(baseContext, 'action_prompt', 'risk', 'green');
    expect(prompt.toLowerCase()).toMatch(/one specific action|action to take/);
  });

  test('no prompt contains the word "AI"', () => {
    const tools = ['email_opener', 'what_to_avoid', 'action_prompt'];
    for (const tool of tools) {
      const prompt = buildQuickToolPrompt(baseContext, tool, 'contacts', 'green');
      expect(prompt.toLowerCase()).not.toMatch(/\bai\b/);
    }
  });
});
