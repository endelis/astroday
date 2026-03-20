// Tests for context assembly — no external dependencies.
const { assembleContext, getTimeOfDay } = require('../lib/ai/context');

describe('getTimeOfDay', () => {
  test('hour 0 → morning', ()  => expect(getTimeOfDay(0)).toBe('morning'));
  test('hour 11 → morning', () => expect(getTimeOfDay(11)).toBe('morning'));
  test('hour 12 → afternoon', () => expect(getTimeOfDay(12)).toBe('afternoon'));
  test('hour 17 → afternoon', () => expect(getTimeOfDay(17)).toBe('afternoon'));
  test('hour 18 → evening', ()  => expect(getTimeOfDay(18)).toBe('evening'));
  test('hour 23 → evening', ()  => expect(getTimeOfDay(23)).toBe('evening'));
});

const baseProfile = {
  accuracy_tier: 'full',
  onboarding_work_type: 'Sales',
  onboarding_focus: 'Timing decisions',
  onboarding_preference: 'detailed',
  onboarding_goal: 'Close more deals',
};

const baseScores = {
  overall: 'green', contacts: 'green', money: 'grey',
  risk: 'red', new_projects: 'green', decisions: 'grey',
};

const baseAspects = [
  { transitPlanet: 'mercury', natalPlanet: 'sun', aspect: 'trine', nature: 'harmonious', orb: 2.1, score: 12 },
  { transitPlanet: 'mars', natalPlanet: 'saturn', aspect: 'square', nature: 'tense', orb: 3.4, score: 7 },
];

const baseEvents = { activeEvents: ['Mercury retrograde — communications need extra care'] };

describe('assembleContext', () => {
  test('returns correct timeOfDay from hour', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 9 });
    expect(ctx.timeOfDay).toBe('morning');
  });

  test('isLateEvening is true at hour 22+', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 22 });
    expect(ctx.isLateEvening).toBe(true);
  });

  test('isLateEvening is false before 22', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 21 });
    expect(ctx.isLateEvening).toBe(false);
  });

  test('scores are mapped with new_projects → newProjects', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 10 });
    expect(ctx.scores.newProjects).toBe('green');
    expect(ctx.scores.contacts).toBe('green');
  });

  test('onboarding fields mapped correctly', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 10 });
    expect(ctx.onboarding.workType).toBe('Sales');
    expect(ctx.onboarding.preference).toBe('detailed');
  });

  test('accuracyTier passed through', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 10 });
    expect(ctx.accuracyTier).toBe('full');
  });

  test('significantAspects capped at 6', () => {
    const manyAspects = Array.from({ length: 10 }, (_, i) => ({
      transitPlanet: 'mercury', natalPlanet: 'sun', aspect: 'trine', nature: 'harmonious', orb: i, score: 12 - i,
    }));
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: manyAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 10 });
    expect(ctx.significantAspects.length).toBe(6);
  });

  test('activeEvents array passed through', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 10 });
    expect(ctx.activeEvents).toHaveLength(1);
    expect(ctx.activeEvents[0]).toContain('Mercury retrograde');
  });

  test('recentParagraphs formatted as labelled text', () => {
    const paragraphs = [{ date: '2026-03-19', text: 'Yesterday was steady.' }];
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, recentParagraphs: paragraphs, date: '2026-03-20', hour: 10 });
    expect(ctx.recentParagraphs).toContain('2026-03-19');
    expect(ctx.recentParagraphs).toContain('Yesterday was steady.');
  });

  test('empty recentParagraphs → null', () => {
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, date: '2026-03-20', hour: 10 });
    expect(ctx.recentParagraphs).toBeNull();
  });

  test('journalEntries capped at 5', () => {
    const entries = Array.from({ length: 8 }, (_, i) => ({
      date: `2026-03-${10 + i}`, entry_text: `Entry ${i}`, forecast_match: 'matched',
    }));
    const ctx = assembleContext({ profile: baseProfile, dailyScores: baseScores, aspects: baseAspects, planetaryEvents: baseEvents, journalEntries: entries, date: '2026-03-20', hour: 10 });
    const lineCount = ctx.journalEntries.split('\n').length;
    expect(lineCount).toBe(5);
  });

  test('null onboarding fields default to null', () => {
    const sparseProfile = { accuracy_tier: 'basic' };
    const ctx = assembleContext({ profile: sparseProfile, dailyScores: baseScores, aspects: [], planetaryEvents: { activeEvents: [] }, date: '2026-03-20', hour: 10 });
    expect(ctx.onboarding.workType).toBeNull();
    expect(ctx.onboarding.preference).toBe('detailed');
  });
});
