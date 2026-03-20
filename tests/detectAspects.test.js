// Tests for detectAspects — pure math, no swisseph dependency.
const { detectAspects, detectAspectsForPlanet, angularDistance, ASPECTS } = require('../lib/astro/detectAspects');

describe('angularDistance', () => {
  test('0° to 120° is 120°', () => {
    expect(angularDistance(0, 120)).toBeCloseTo(120);
  });

  test('0° to 350° shortest arc is 10°', () => {
    expect(angularDistance(0, 350)).toBeCloseTo(10);
  });

  test('180° opposition is symmetric', () => {
    expect(angularDistance(0, 180)).toBeCloseTo(180);
    expect(angularDistance(180, 0)).toBeCloseTo(180);
  });

  test('same longitude is 0°', () => {
    expect(angularDistance(45, 45)).toBeCloseTo(0);
  });

  test('crosses 360° boundary correctly', () => {
    expect(angularDistance(10, 350)).toBeCloseTo(20);
  });
});

const buildChart = (planets, angles = {}) => ({
  planets: Object.fromEntries(Object.entries(planets).map(([k, v]) => [k, { longitude: v, sign: 'Aries', degrees: 0, isRetrograde: false }])),
  ascendant: angles.ascendant ? { longitude: angles.ascendant } : undefined,
  midheaven: angles.midheaven ? { longitude: angles.midheaven } : undefined,
});

const buildTransits = (planets) => ({
  date: '2000-01-01',
  planets: Object.fromEntries(Object.entries(planets).map(([k, v]) => [k, { longitude: v, sign: 'Aries', degrees: 0, isRetrograde: false }])),
});

describe('detectAspectsForPlanet', () => {
  const natalPlanets = { sun: { longitude: 0 }, mercury: { longitude: 90 }, moon: { longitude: 180 } };

  test('detects exact trine (120°)', () => {
    const aspects = detectAspectsForPlanet('mars', 120, natalPlanets, null);
    const trine = aspects.find(a => a.aspect === 'trine' && a.natalPlanet === 'sun');
    expect(trine).toBeDefined();
    expect(trine.orb).toBeCloseTo(0, 1);
  });

  test('detects trine within 6° orb', () => {
    const aspects = detectAspectsForPlanet('mars', 125, natalPlanets, null);
    const trine = aspects.find(a => a.aspect === 'trine' && a.natalPlanet === 'sun');
    expect(trine).toBeDefined();
    expect(trine.orb).toBeCloseTo(5, 0);
  });

  test('does not detect trine outside 6° orb', () => {
    const aspects = detectAspectsForPlanet('mars', 127, natalPlanets, null);
    const trine = aspects.find(a => a.aspect === 'trine' && a.natalPlanet === 'sun');
    expect(trine).toBeUndefined();
  });

  test('detects exact conjunction (0°)', () => {
    const aspects = detectAspectsForPlanet('venus', 2, natalPlanets, null);
    const conj = aspects.find(a => a.aspect === 'conjunction' && a.natalPlanet === 'sun');
    expect(conj).toBeDefined();
  });

  test('conjunction orb is 8° (wider than other majors)', () => {
    const aspects = detectAspectsForPlanet('venus', 7, natalPlanets, null);
    const conj = aspects.find(a => a.aspect === 'conjunction' && a.natalPlanet === 'sun');
    expect(conj).toBeDefined();
    // Would miss with 6° orb — confirms 8° orb is applied
    const tightAspects = detectAspectsForPlanet('venus', 6.5, natalPlanets, null);
    const conj2 = tightAspects.find(a => a.aspect === 'conjunction' && a.natalPlanet === 'sun');
    expect(conj2).toBeDefined();
  });

  test('detects opposition (180°)', () => {
    const aspects = detectAspectsForPlanet('saturn', 0, natalPlanets, null);
    const opp = aspects.find(a => a.aspect === 'opposition' && a.natalPlanet === 'moon');
    expect(opp).toBeDefined();
  });

  test('detects square (90°)', () => {
    const aspects = detectAspectsForPlanet('jupiter', 90, natalPlanets, null);
    const sq = aspects.find(a => a.aspect === 'square' && a.natalPlanet === 'sun');
    expect(sq).toBeDefined();
  });

  test('detects minor semi-sextile (30°) within 3° orb', () => {
    const aspects = detectAspectsForPlanet('sun', 32, natalPlanets, null);
    const ss = aspects.find(a => a.aspect === 'semi-sextile' && a.natalPlanet === 'sun');
    expect(ss).toBeDefined();
    expect(ss.nature).toBe('minor');
  });

  test('semi-sextile outside 3° orb is not detected', () => {
    const aspects = detectAspectsForPlanet('sun', 34, natalPlanets, null);
    const ss = aspects.find(a => a.aspect === 'semi-sextile' && a.natalPlanet === 'sun');
    expect(ss).toBeUndefined();
  });

  test('Sun natal modifier is 1.5', () => {
    const aspects = detectAspectsForPlanet('mars', 120, natalPlanets, null);
    const trine = aspects.find(a => a.natalPlanet === 'sun');
    expect(trine.natalModifier).toBe(1.5);
    expect(trine.score).toBeCloseTo(8 * 1.5, 4); // trine weight 8 × 1.5
  });
});

describe('detectAspects (full chart)', () => {
  test('returns all aspects between transit and natal planets', () => {
    const natal = buildChart({ sun: 0, moon: 180, mercury: 60 });
    const transit = buildTransits({ mars: 120, venus: 0 });

    const aspects = detectAspects(natal, transit);
    expect(Array.isArray(aspects)).toBe(true);
    expect(aspects.length).toBeGreaterThan(0);
  });

  test('results are sorted by score descending', () => {
    const natal = buildChart({ sun: 0, moon: 120, mercury: 60 });
    const transit = buildTransits({ mars: 120, venus: 60 });

    const aspects = detectAspects(natal, transit);
    for (let i = 1; i < aspects.length; i++) {
      expect(aspects[i - 1].score).toBeGreaterThanOrEqual(aspects[i].score);
    }
  });

  test('includes aspects to ascendant when provided', () => {
    const natal = buildChart({ sun: 0 }, { ascendant: 120 });
    const transit = buildTransits({ mars: 120 });

    const aspects = detectAspects(natal, transit);
    const ascAspect = aspects.find(a => a.natalPlanet === 'ascendant');
    expect(ascAspect).toBeDefined();
  });

  test('Ascendant natal modifier is 1.2', () => {
    const natal = buildChart({ sun: 0 }, { ascendant: 120 });
    const transit = buildTransits({ mars: 120 });

    const aspects = detectAspects(natal, transit);
    const conj = aspects.find(a => a.natalPlanet === 'ascendant' && a.aspect === 'conjunction');
    expect(conj.natalModifier).toBe(1.2);
  });

  test('no aspects when all planets are out of orb', () => {
    const natal = buildChart({ sun: 0 });
    const transit = buildTransits({ mars: 45 }); // 45° — not a recognized aspect

    const aspects = detectAspects(natal, transit);
    expect(aspects).toHaveLength(0);
  });
});
