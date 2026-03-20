// Tests for risk scorer — no swisseph dependency.
const { scoreRisk } = require('../lib/scoring/risk');

const noEvents = {
  mercuryRetrograde: false, mercuryRetrogradeShadow: false,
  venusRetrograde: false, marsRetrograde: false,
  jupiterRetrograde: false, saturnRetrograde: false,
};
const marsRetroEvents = { ...noEvents, marsRetrograde: true };

const makeAspect = (transitPlanet, natalPlanet, aspect, nature, score = 8) => ({
  transitPlanet, natalPlanet, aspect, nature, score,
  weight: 8, natalModifier: 1.0,
});

describe('scoreRisk — basic scoring', () => {
  test('Mars trine natal Mars → green', () => {
    const aspects = [makeAspect('mars', 'mars', 'trine', 'harmonious', 8)];
    expect(scoreRisk(aspects, noEvents).score).toBe('green');
  });

  test('Mars square natal Mars → red', () => {
    const aspects = [makeAspect('mars', 'mars', 'square', 'tense', 7)];
    expect(scoreRisk(aspects, noEvents).score).toBe('red');
  });

  test('No Mars aspects → grey', () => {
    const aspects = [makeAspect('venus', 'jupiter', 'trine', 'harmonious', 8)]; // irrelevant
    expect(scoreRisk(aspects, noEvents).score).toBe('grey');
  });
});

describe('scoreRisk — malefic conjunction', () => {
  test('Mars conjunct natal Saturn → red (malefic)', () => {
    const aspects = [makeAspect('mars', 'saturn', 'conjunction', 'variable', 10)];
    expect(scoreRisk(aspects, noEvents).score).toBe('red');
  });
});

describe('scoreRisk — Mars retrograde (priority 1)', () => {
  test('Mars retrograde with green aspects → grey', () => {
    const aspects = [makeAspect('mars', 'sun', 'trine', 'harmonious', 12)];
    expect(scoreRisk(aspects, marsRetroEvents).score).toBe('grey');
  });

  test('Mars retrograde with red aspects → red (tension remains)', () => {
    const aspects = [makeAspect('mars', 'saturn', 'square', 'tense', 7)];
    expect(scoreRisk(aspects, marsRetroEvents).score).toBe('red');
  });

  test('Mars retrograde with no aspects → grey', () => {
    expect(scoreRisk([], marsRetroEvents).score).toBe('grey');
  });
});

describe('scoreRisk — Saturn blocking (priority 2)', () => {
  test('Mars square natal Saturn → red', () => {
    const aspects = [makeAspect('mars', 'saturn', 'square', 'tense', 7)];
    expect(scoreRisk(aspects, noEvents).score).toBe('red');
  });

  test('Saturn square natal Mars → red', () => {
    const aspects = [makeAspect('saturn', 'mars', 'square', 'tense', 7)];
    expect(scoreRisk(aspects, noEvents).score).toBe('red');
  });

  test('Mars opposition natal Saturn → red', () => {
    const aspects = [makeAspect('mars', 'saturn', 'opposition', 'tense', 7)];
    expect(scoreRisk(aspects, noEvents).score).toBe('red');
  });
});

describe('scoreRisk — best energy aspects (priority 4)', () => {
  test('Mars trine natal Jupiter → green', () => {
    const aspects = [makeAspect('mars', 'jupiter', 'trine', 'harmonious', 8)];
    expect(scoreRisk(aspects, noEvents).score).toBe('green');
  });

  test('Mars trine natal Sun → green', () => {
    const aspects = [makeAspect('mars', 'sun', 'trine', 'harmonious', 12)];
    expect(scoreRisk(aspects, noEvents).score).toBe('green');
  });
});

describe('scoreRisk — mixed always resolves RED (scoring-rules.md)', () => {
  test('One green, one red → red (Mars tension never cancelled)', () => {
    // Use Mars square natal Sun (red) — does NOT trigger the Saturn-blocking priority 2,
    // so the mixed scenario reaches priority 5 where tension is explicitly acknowledged.
    const aspects = [
      makeAspect('mars', 'jupiter', 'trine', 'harmonious', 8),
      makeAspect('mars', 'sun',     'square', 'tense',      7),
    ];
    const result = scoreRisk(aspects, noEvents);
    expect(result.score).toBe('red');
    expect(result.reasons.some(r => r.includes('tension'))).toBe(true);
  });
});
