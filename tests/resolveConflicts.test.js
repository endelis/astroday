// Tests for resolveConflicts shared utilities.
const {
  resolveConjunctionNature,
  applyRetrogradeRule,
  classifyAspect,
  resolveByWeight,
  maxScore,
} = require('../lib/scoring/resolveConflicts');

describe('resolveConjunctionNature', () => {
  test('Venus conjunct Jupiter → green', () => {
    expect(resolveConjunctionNature('venus', 'jupiter')).toBe('green');
  });
  test('Jupiter conjunct Venus → green', () => {
    expect(resolveConjunctionNature('jupiter', 'venus')).toBe('green');
  });
  test('Venus conjunct Sun → green', () => {
    expect(resolveConjunctionNature('venus', 'sun')).toBe('green');
  });
  test('Jupiter conjunct Sun → green', () => {
    expect(resolveConjunctionNature('jupiter', 'sun')).toBe('green');
  });
  test('Mercury conjunct Sun → grey', () => {
    expect(resolveConjunctionNature('mercury', 'sun')).toBe('grey');
  });
  test('Saturn conjunct Mercury → grey', () => {
    expect(resolveConjunctionNature('saturn', 'mercury')).toBe('grey');
  });
  test('Mercury conjunct Saturn → grey', () => {
    expect(resolveConjunctionNature('mercury', 'saturn')).toBe('grey');
  });
  test('Mars conjunct Saturn → red', () => {
    expect(resolveConjunctionNature('mars', 'saturn')).toBe('red');
  });
  test('Saturn conjunct Mars → red', () => {
    expect(resolveConjunctionNature('saturn', 'mars')).toBe('red');
  });
  test('Mars conjunct Sun → red', () => {
    expect(resolveConjunctionNature('mars', 'sun')).toBe('red');
  });
  test('Unlisted pair falls back to grey', () => {
    expect(resolveConjunctionNature('jupiter', 'moon')).toBe('grey');
  });
});

describe('applyRetrogradeRule', () => {
  test('green → grey', () => expect(applyRetrogradeRule('green')).toBe('grey'));
  test('red stays red', () => expect(applyRetrogradeRule('red')).toBe('red'));
  test('grey stays grey', () => expect(applyRetrogradeRule('grey')).toBe('grey'));
});

const makeAspect = (overrides) => ({
  transitPlanet: 'mercury', natalPlanet: 'sun',
  aspect: 'trine', nature: 'harmonious', score: 12, weight: 8, ...overrides,
});

describe('classifyAspect', () => {
  test('harmonious → green', () => {
    expect(classifyAspect(makeAspect({ nature: 'harmonious' }))).toBe('green');
  });
  test('tense → red', () => {
    expect(classifyAspect(makeAspect({ nature: 'tense' }))).toBe('red');
  });
  test('minor → grey', () => {
    expect(classifyAspect(makeAspect({ nature: 'minor' }))).toBe('grey');
  });
  test('variable venus_jupiter conjunction → green', () => {
    expect(classifyAspect(makeAspect({
      nature: 'variable', transitPlanet: 'venus', natalPlanet: 'jupiter', aspect: 'conjunction',
    }))).toBe('green');
  });
  test('variable mars_saturn conjunction → red', () => {
    expect(classifyAspect(makeAspect({
      nature: 'variable', transitPlanet: 'mars', natalPlanet: 'saturn', aspect: 'conjunction',
    }))).toBe('red');
  });
  test('variable mercury_sun conjunction → grey', () => {
    expect(classifyAspect(makeAspect({
      nature: 'variable', transitPlanet: 'mercury', natalPlanet: 'sun', aspect: 'conjunction',
    }))).toBe('grey');
  });
});

describe('resolveByWeight', () => {
  const g = (score) => ({ score });
  const r = (score) => ({ score });

  test('no signals → grey', () => expect(resolveByWeight([], [])).toBe('grey'));
  test('green only → green', () => expect(resolveByWeight([g(8)], [])).toBe('green'));
  test('red only → red', () => expect(resolveByWeight([], [r(7)])).toBe('red'));
  test('green wins clearly (gap > 2) → green', () => {
    expect(resolveByWeight([g(10)], [r(5)])).toBe('green');
  });
  test('red wins clearly (gap > 2) → red', () => {
    expect(resolveByWeight([g(5)], [r(10)])).toBe('red');
  });
  test('within 2 points → grey (mixed signal)', () => {
    expect(resolveByWeight([g(8)], [r(7)])).toBe('grey');
  });
  test('equal scores → grey', () => {
    expect(resolveByWeight([g(8)], [r(8)])).toBe('grey');
  });
  test('exactly 2 apart → grey (boundary)', () => {
    expect(resolveByWeight([g(9)], [r(7)])).toBe('grey');
  });
  test('3 apart → winner', () => {
    expect(resolveByWeight([g(10)], [r(7)])).toBe('green');
  });
});

describe('maxScore', () => {
  test('empty → 0', () => expect(maxScore([])).toBe(0));
  test('returns max', () => expect(maxScore([{ score: 5 }, { score: 12 }, { score: 8 }])).toBe(12));
});
