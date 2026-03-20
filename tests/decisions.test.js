// Tests for decisions scorer — no swisseph dependency.
const { scoreDecisions } = require('../lib/scoring/decisions');

const noEvents = {
  mercuryRetrograde: false, mercuryRetrogradeShadow: false,
  venusRetrograde: false, marsRetrograde: false,
  jupiterRetrograde: false, saturnRetrograde: false,
};
const mercuryRetroEvents  = { ...noEvents, mercuryRetrograde: true };
const saturnRetroEvents   = { ...noEvents, saturnRetrograde: true };

const makeAspect = (transitPlanet, natalPlanet, aspect, nature, score = 8) => ({
  transitPlanet, natalPlanet, aspect, nature, score,
  weight: 8, natalModifier: 1.0,
});

describe('scoreDecisions — basic scoring', () => {
  test('Saturn trine natal Saturn → green', () => {
    const aspects = [makeAspect('saturn', 'saturn', 'trine', 'harmonious', 8)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('green');
  });

  test('Saturn square natal Saturn → red', () => {
    const aspects = [makeAspect('saturn', 'saturn', 'square', 'tense', 7)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('red');
  });

  test('Jupiter trine natal Saturn → green', () => {
    const aspects = [makeAspect('jupiter', 'saturn', 'trine', 'harmonious', 8)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('green');
  });

  test('No relevant aspects → grey', () => {
    expect(scoreDecisions([], noEvents).score).toBe('grey');
  });
});

describe('scoreDecisions — priority 1: Saturn return always RED', () => {
  test('Saturn conjunct natal Saturn → red always', () => {
    const aspects = [
      makeAspect('saturn', 'saturn', 'conjunction', 'variable', 10),
      makeAspect('jupiter', 'saturn', 'trine', 'harmonious', 8), // green won't save it
    ];
    expect(scoreDecisions(aspects, noEvents).score).toBe('red');
  });
});

describe('scoreDecisions — priority 2: Saturn opposition natal Saturn → RED', () => {
  test('Saturn opposition natal Saturn → red', () => {
    const aspects = [makeAspect('saturn', 'saturn', 'opposition', 'tense', 7)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('red');
  });
});

describe('scoreDecisions — priority 3: Mercury retrograde + Saturn GREEN → GREY', () => {
  test('Mercury retrograde with Saturn trine → grey with warning', () => {
    const aspects = [makeAspect('saturn', 'saturn', 'trine', 'harmonious', 8)];
    const result = scoreDecisions(aspects, mercuryRetroEvents);
    expect(result.score).toBe('grey');
    expect(result.reasons.some(r => r.includes('Mercury retrograde'))).toBe(true);
  });

  test('Mercury retrograde with Saturn RED → stays red', () => {
    const aspects = [makeAspect('saturn', 'sun', 'square', 'tense', 10.5)];
    // Priority 4 (Saturn square Sun) fires before priority 3 check resolves to green
    expect(scoreDecisions(aspects, mercuryRetroEvents).score).toBe('red');
  });
});

describe('scoreDecisions — priority 4: Saturn square Sun or Saturn → RED', () => {
  test('Saturn square natal Sun → red', () => {
    const aspects = [makeAspect('saturn', 'sun', 'square', 'tense', 10.5)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('red');
  });
});

describe('scoreDecisions — priorities 5 & 6: trine GREEN', () => {
  test('Saturn trine natal Sun, no tension → green', () => {
    const aspects = [makeAspect('saturn', 'sun', 'trine', 'harmonious', 12)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('green');
  });

  test('Jupiter trine natal Saturn, no tension → green', () => {
    const aspects = [makeAspect('jupiter', 'saturn', 'trine', 'harmonious', 8)];
    expect(scoreDecisions(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreDecisions — priority 7: Saturn retrograde', () => {
  test('Saturn retrograde with no red → grey', () => {
    const aspects = [makeAspect('saturn', 'saturn', 'trine', 'harmonious', 8)];
    // Saturn retrograde: GREEN → GREY
    expect(scoreDecisions(aspects, saturnRetroEvents).score).toBe('grey');
  });

  test('Saturn retrograde with red aspect → red stays red', () => {
    const aspects = [makeAspect('saturn', 'sun', 'square', 'tense', 10.5)];
    expect(scoreDecisions(aspects, saturnRetroEvents).score).toBe('red');
  });
});
