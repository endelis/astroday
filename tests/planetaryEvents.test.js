// Tests for planetaryEvents — swisseph mocked.
jest.mock('swisseph', () => ({
  SE_SUN: 0, SE_MOON: 1, SE_MERCURY: 2, SE_VENUS: 3,
  SE_MARS: 4, SE_JUPITER: 5, SE_SATURN: 6,
  SE_TRUE_NODE: 11,
  SE_GREG_CAL: 1, SEFLG_SWIEPH: 2, SEFLG_SPEED: 256,
  swe_julday: () => 2451545.0,
  swe_calc_ut: (julday, planetId, flags, callback) => {
    // Shadow check: Mercury retrograde 14 days in future (julday + 14)
    if (planetId === 2 && julday > 2451545.5) {
      callback({ longitude: 10, longitudeSpeed: -0.5, error: null }); // retrograde in future
      return;
    }
    if (planetId === 11) {
      callback({ longitude: 5, longitudeSpeed: 0, error: null }); // node at 5°
      return;
    }
    callback({ longitude: 100, longitudeSpeed: 1.0, error: null });
  },
}), { virtual: true });

const { detectPlanetaryEvents, BANNERS } = require('../lib/astro/planetaryEvents');

function makeTransits(overrides = {}) {
  const base = {
    sun:     { longitude: 0,   isRetrograde: false },
    moon:    { longitude: 90,  isRetrograde: false },
    mercury: { longitude: 50,  isRetrograde: false },
    venus:   { longitude: 80,  isRetrograde: false },
    mars:    { longitude: 120, isRetrograde: false },
    jupiter: { longitude: 200, isRetrograde: false },
    saturn:  { longitude: 300, isRetrograde: false },
  };
  return { ...base, ...overrides };
}

describe('detectPlanetaryEvents — retrograde detection', () => {
  test('detects Mercury retrograde', async () => {
    const transits = makeTransits({ mercury: { longitude: 50, isRetrograde: true } });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.mercuryRetrograde).toBe(true);
    expect(result.activeEvents).toContain(BANNERS.mercuryRetrograde);
  });

  test('Mercury not retrograde and no shadow → mercuryRetrogradeShadow false', async () => {
    // Override swe_calc_ut to return prograde Mercury in all cases
    const swisseph = require('swisseph');
    swisseph.swe_calc_ut = (julday, planetId, flags, cb) => {
      if (planetId === 11) return cb({ longitude: 5, longitudeSpeed: 0, error: null });
      cb({ longitude: 100, longitudeSpeed: 1.0, error: null });
    };
    const transits = makeTransits({ mercury: { longitude: 50, isRetrograde: false } });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.mercuryRetrograde).toBe(false);
    expect(result.mercuryRetrogradeShadow).toBe(false);
  });

  test('detects Venus retrograde', async () => {
    const transits = makeTransits({ venus: { longitude: 80, isRetrograde: true } });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.venusRetrograde).toBe(true);
    expect(result.activeEvents).toContain(BANNERS.venusRetrograde);
  });

  test('detects Mars retrograde', async () => {
    const transits = makeTransits({ mars: { longitude: 120, isRetrograde: true } });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.marsRetrograde).toBe(true);
  });

  test('detects Jupiter retrograde', async () => {
    const transits = makeTransits({ jupiter: { longitude: 200, isRetrograde: true } });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.jupiterRetrograde).toBe(true);
  });

  test('detects Saturn retrograde', async () => {
    const transits = makeTransits({ saturn: { longitude: 300, isRetrograde: true } });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.saturnRetrograde).toBe(true);
  });
});

describe('detectPlanetaryEvents — moon phases', () => {
  test('detects full moon (Sun-Moon ≈ 180°)', async () => {
    const transits = makeTransits({
      sun:  { longitude: 0,   isRetrograde: false },
      moon: { longitude: 180, isRetrograde: false },
    });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.fullMoon).toBe(true);
    expect(result.activeEvents).toContain(BANNERS.fullMoon);
  });

  test('detects new moon (Sun-Moon ≈ 0°)', async () => {
    const transits = makeTransits({
      sun:  { longitude: 10, isRetrograde: false },
      moon: { longitude: 5,  isRetrograde: false },
    });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.newMoon).toBe(true);
    expect(result.activeEvents).toContain(BANNERS.newMoon);
  });

  test('does not flag full moon when Sun-Moon distance is 90°', async () => {
    const transits = makeTransits({
      sun:  { longitude: 0,  isRetrograde: false },
      moon: { longitude: 90, isRetrograde: false },
    });
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.fullMoon).toBe(false);
    expect(result.newMoon).toBe(false);
  });
});

describe('detectPlanetaryEvents — quiet day', () => {
  test('no events on a plain day', async () => {
    const swisseph = require('swisseph');
    swisseph.swe_calc_ut = (julday, planetId, flags, cb) => {
      if (planetId === 11) return cb({ longitude: 5, longitudeSpeed: 0, error: null });
      cb({ longitude: 100, longitudeSpeed: 1.0, error: null });
    };
    const transits = makeTransits();
    const result = await detectPlanetaryEvents('2000-01-01', transits);
    expect(result.activeEvents).toHaveLength(0);
    expect(result.mercuryRetrograde).toBe(false);
    expect(result.fullMoon).toBe(false);
    expect(result.eclipse).toBe(false);
  });
});
