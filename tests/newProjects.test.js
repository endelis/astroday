// Tests for newProjects scorer — no swisseph dependency.
const { scoreNewProjects } = require('../lib/scoring/newProjects');

const noEvents = {
  mercuryRetrograde: false, mercuryRetrogradeShadow: false,
  venusRetrograde: false, marsRetrograde: false,
  jupiterRetrograde: false, saturnRetrograde: false,
};
const jupiterRetroEvents = { ...noEvents, jupiterRetrograde: true };

const makeAspect = (transitPlanet, natalPlanet, aspect, nature, score = 8) => ({
  transitPlanet, natalPlanet, aspect, nature, score,
  weight: 8, natalModifier: 1.0,
});

describe('scoreNewProjects — basic', () => {
  test('Jupiter trine natal Jupiter → green', () => {
    const aspects = [makeAspect('jupiter', 'jupiter', 'trine', 'harmonious', 8)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('green');
  });

  test('Jupiter opposition natal Jupiter → red', () => {
    const aspects = [makeAspect('jupiter', 'jupiter', 'opposition', 'tense', 7)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('red');
  });

  test('No relevant aspects → grey', () => {
    expect(scoreNewProjects([], noEvents).score).toBe('grey');
  });
});

describe('scoreNewProjects — benefic conjunctions', () => {
  test('Jupiter conjunct natal Jupiter (return) → green', () => {
    const aspects = [makeAspect('jupiter', 'jupiter', 'conjunction', 'variable', 10)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('green');
  });

  test('Jupiter conjunct natal Sun → green', () => {
    const aspects = [makeAspect('jupiter', 'sun', 'conjunction', 'variable', 15)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreNewProjects — Jupiter retrograde (priority 1)', () => {
  test('Jupiter retrograde with green → grey', () => {
    const aspects = [makeAspect('jupiter', 'sun', 'trine', 'harmonious', 12)];
    expect(scoreNewProjects(aspects, jupiterRetroEvents).score).toBe('grey');
  });

  test('Jupiter retrograde with Saturn block → red (red stays red)', () => {
    const aspects = [makeAspect('saturn', 'jupiter', 'square', 'tense', 7)];
    expect(scoreNewProjects(aspects, jupiterRetroEvents).score).toBe('red');
  });
});

describe('scoreNewProjects — Saturn blocking (priority 2)', () => {
  test('Saturn square natal Jupiter → red', () => {
    const aspects = [makeAspect('saturn', 'jupiter', 'square', 'tense', 7)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('red');
  });

  test('Jupiter square natal Saturn → red', () => {
    const aspects = [makeAspect('jupiter', 'saturn', 'square', 'tense', 7)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('red');
  });

  test('Saturn opposition natal Jupiter → red', () => {
    const aspects = [makeAspect('saturn', 'jupiter', 'opposition', 'tense', 7)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('red');
  });
});

describe('scoreNewProjects — core trines (priority 3)', () => {
  test('Jupiter trine natal Sun → green', () => {
    const aspects = [makeAspect('jupiter', 'sun', 'trine', 'harmonious', 12)];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreNewProjects — sextile (moderate green, priority 4)', () => {
  test('Jupiter sextile natal Sun with no red → green', () => {
    const aspects = [makeAspect('jupiter', 'sun', 'sextile', 'harmonious', 7.5)];
    const result = scoreNewProjects(aspects, noEvents);
    expect(result.score).toBe('green');
    expect(result.reasons.some(r => r.includes('effort'))).toBe(true);
  });
});

describe('scoreNewProjects — mixed signals (priority 5)', () => {
  test('Jupiter green + another red → grey', () => {
    const aspects = [
      makeAspect('jupiter', 'sun', 'trine', 'harmonious', 12),
      makeAspect('jupiter', 'jupiter', 'square', 'tense', 7),
    ];
    expect(scoreNewProjects(aspects, noEvents).score).toBe('grey');
  });
});
