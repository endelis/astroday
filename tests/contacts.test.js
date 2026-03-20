// Tests for contacts scorer — no swisseph dependency.
const { scoreContacts } = require('../lib/scoring/contacts');

const noEvents = {
  mercuryRetrograde: false, mercuryRetrogradeShadow: false,
  venusRetrograde: false, marsRetrograde: false,
  jupiterRetrograde: false, saturnRetrograde: false,
};

const makeAspect = (transitPlanet, natalPlanet, aspect, nature, score = 8) => ({
  transitPlanet, natalPlanet, aspect, nature, score,
  weight: 8, natalModifier: 1.0,
});

describe('scoreContacts — basic scoring', () => {
  test('Mercury trine natal Sun → green', () => {
    const aspects = [makeAspect('mercury', 'sun', 'trine', 'harmonious', 12)];
    const result = scoreContacts(aspects, noEvents);
    expect(result.score).toBe('green');
    expect(result.strength).toBe(12);
  });

  test('Mercury square natal Sun → red', () => {
    const aspects = [makeAspect('mercury', 'sun', 'square', 'tense', 10.5)];
    const result = scoreContacts(aspects, noEvents);
    expect(result.score).toBe('red');
  });

  test('No relevant aspects → grey', () => {
    const aspects = [makeAspect('mars', 'saturn', 'trine', 'harmonious', 8)]; // irrelevant
    const result = scoreContacts(aspects, noEvents);
    expect(result.score).toBe('grey');
  });

  test('Empty aspects → grey', () => {
    expect(scoreContacts([], noEvents).score).toBe('grey');
  });

  test('Jupiter trine natal Mercury → green', () => {
    const aspects = [makeAspect('jupiter', 'mercury', 'trine', 'harmonious', 8)];
    expect(scoreContacts(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreContacts — special grey overrides', () => {
  test('Mercury conjunct natal Saturn → grey (not green)', () => {
    const aspects = [makeAspect('mercury', 'saturn', 'conjunction', 'variable', 10)];
    expect(scoreContacts(aspects, noEvents).score).toBe('grey');
  });
});

describe('scoreContacts — Mercury retrograde priority', () => {
  const retroEvents = { ...noEvents, mercuryRetrograde: true };

  test('Mercury retrograde with no red aspects → grey', () => {
    const aspects = [makeAspect('mercury', 'sun', 'trine', 'harmonious', 12)];
    expect(scoreContacts(aspects, retroEvents).score).toBe('grey');
  });

  test('Mercury retrograde with Mars square → red (retrograde intensifies)', () => {
    const aspects = [makeAspect('mars', 'mercury', 'square', 'tense', 7)];
    expect(scoreContacts(aspects, retroEvents).score).toBe('red');
  });

  test('Mercury retrograde overrides green — score is grey not green', () => {
    const aspects = [
      makeAspect('mercury', 'moon', 'trine', 'harmonious', 10.4),
      makeAspect('jupiter', 'mercury', 'trine', 'harmonious', 8),
    ];
    expect(scoreContacts(aspects, retroEvents).score).toBe('grey');
  });
});

describe('scoreContacts — Mars/Saturn override', () => {
  test('Mars square natal Mercury → red overrides green from Mercury trine', () => {
    const aspects = [
      makeAspect('mercury', 'sun', 'trine', 'harmonious', 12),
      makeAspect('mars', 'mercury', 'square', 'tense', 7),
    ];
    expect(scoreContacts(aspects, noEvents).score).toBe('red');
  });

  test('Saturn opposition natal Mercury → red', () => {
    const aspects = [makeAspect('saturn', 'mercury', 'opposition', 'tense', 7)];
    expect(scoreContacts(aspects, noEvents).score).toBe('red');
  });

  test('Regular red aspect (not Mars/Saturn) with stronger green → resolved by weight', () => {
    // Mercury square natal Moon is a mercury transit — doesn't trigger Mars/Saturn priority 2
    const aspects = [
      makeAspect('mercury', 'sun', 'trine', 'harmonious', 18),   // score 18
      makeAspect('mercury', 'moon', 'square', 'tense', 9.1),      // score 9.1
    ];
    // Gap > 2, green wins
    expect(scoreContacts(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreContacts — weight tie-break', () => {
  test('Green and red within 2 points → grey', () => {
    const aspects = [
      makeAspect('mercury', 'sun', 'trine', 'harmonious', 8),
      makeAspect('mercury', 'moon', 'square', 'tense', 7),
    ];
    expect(scoreContacts(aspects, noEvents).score).toBe('grey');
  });

  test('Green 3+ ahead of red → green wins', () => {
    const aspects = [
      makeAspect('mercury', 'sun', 'trine', 'harmonious', 12),
      makeAspect('mercury', 'moon', 'square', 'tense', 7),
    ];
    expect(scoreContacts(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreContacts — shadow note', () => {
  test('Shadow period noted but does not change score', () => {
    const shadowEvents = { ...noEvents, mercuryRetrogradeShadow: true };
    const aspects = [makeAspect('mercury', 'sun', 'trine', 'harmonious', 12)];
    const result = scoreContacts(aspects, shadowEvents);
    expect(result.score).toBe('green');
    expect(result.reasons.some(r => r.includes('shadow'))).toBe(true);
  });
});
