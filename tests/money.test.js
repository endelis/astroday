// Tests for money scorer — no swisseph dependency.
const { scoreMoney } = require('../lib/scoring/money');

const noEvents = {
  mercuryRetrograde: false, mercuryRetrogradeShadow: false,
  venusRetrograde: false, marsRetrograde: false,
  jupiterRetrograde: false, saturnRetrograde: false,
};

const makeAspect = (transitPlanet, natalPlanet, aspect, nature, score = 8) => ({
  transitPlanet, natalPlanet, aspect, nature, score,
  weight: 8, natalModifier: 1.0,
});

describe('scoreMoney — basic scoring', () => {
  test('Venus trine natal Venus → green', () => {
    const aspects = [makeAspect('venus', 'venus', 'trine', 'harmonious', 8)];
    expect(scoreMoney(aspects, noEvents).score).toBe('green');
  });

  test('Jupiter trine natal Jupiter → green', () => {
    const aspects = [makeAspect('jupiter', 'jupiter', 'trine', 'harmonious', 8)];
    expect(scoreMoney(aspects, noEvents).score).toBe('green');
  });

  test('Venus square natal Venus → red', () => {
    const aspects = [makeAspect('venus', 'venus', 'square', 'tense', 8)];
    expect(scoreMoney(aspects, noEvents).score).toBe('red');
  });

  test('No relevant aspects → grey', () => {
    expect(scoreMoney([], noEvents).score).toBe('grey');
  });
});

describe('scoreMoney — special grey overrides', () => {
  test('Venus conjunct natal Saturn → grey (not red)', () => {
    const aspects = [makeAspect('venus', 'saturn', 'conjunction', 'variable', 10)];
    expect(scoreMoney(aspects, noEvents).score).toBe('grey');
  });

  test('Venus conjunct natal Jupiter → green (benefic conjunction)', () => {
    const aspects = [makeAspect('venus', 'jupiter', 'conjunction', 'variable', 10)];
    expect(scoreMoney(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreMoney — Venus retrograde', () => {
  const retroEvents = { ...noEvents, venusRetrograde: true };

  test('Venus retrograde with no red → grey', () => {
    const aspects = [makeAspect('venus', 'venus', 'trine', 'harmonious', 8)];
    expect(scoreMoney(aspects, retroEvents).score).toBe('grey');
  });

  test('Venus retrograde with Saturn stress → red', () => {
    const aspects = [makeAspect('saturn', 'venus', 'square', 'tense', 7)];
    expect(scoreMoney(aspects, retroEvents).score).toBe('red');
  });
});

describe('scoreMoney — Saturn override (priority 2)', () => {
  test('Saturn square natal Venus overrides Jupiter green', () => {
    const aspects = [
      makeAspect('jupiter', 'venus', 'trine', 'harmonious', 8),
      makeAspect('saturn', 'venus', 'square', 'tense', 7),
    ];
    expect(scoreMoney(aspects, noEvents).score).toBe('red');
  });

  test('Venus opposition natal Saturn → red', () => {
    const aspects = [makeAspect('venus', 'saturn', 'opposition', 'tense', 7)];
    expect(scoreMoney(aspects, noEvents).score).toBe('red');
  });

  test('Saturn trine natal Venus (no stress) → green', () => {
    // Saturn trine is harmonious — allowed for money
    const aspects = [makeAspect('saturn', 'venus', 'trine', 'harmonious', 8)];
    expect(scoreMoney(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreMoney — mixed Jupiter GREEN + Venus RED', () => {
  test('Jupiter green + Venus red with close scores → grey', () => {
    const aspects = [
      makeAspect('jupiter', 'venus', 'trine', 'harmonious', 8),
      makeAspect('venus', 'venus', 'square', 'tense', 7),
    ];
    // Gap of 1 (within 2) → grey
    expect(scoreMoney(aspects, noEvents).score).toBe('grey');
  });

  test('Strong Jupiter green clearly ahead of weak Venus stress → green', () => {
    const aspects = [
      makeAspect('jupiter', 'venus', 'trine', 'harmonious', 15),
      makeAspect('venus', 'venus', 'square', 'tense', 5),
    ];
    expect(scoreMoney(aspects, noEvents).score).toBe('green');
  });
});
