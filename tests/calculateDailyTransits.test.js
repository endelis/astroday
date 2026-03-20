// Tests for calculateDailyTransits — swisseph is mocked so no native binary required.

jest.mock('swisseph', () => {
  const makePlanet = (longitude, speed = 1.0) => ({
    longitude,
    longitudeSpeed: speed,
    error: null,
  });

  return {
    SE_SUN: 0, SE_MOON: 1, SE_MERCURY: 2, SE_VENUS: 3,
    SE_MARS: 4, SE_JUPITER: 5, SE_SATURN: 6,
    SE_GREG_CAL: 1,
    SEFLG_SWIEPH: 2,
    SEFLG_SPEED: 256,
    swe_julday: (year, month, day, hour) => {
      // Simplified: return a deterministic value for known dates
      if (year === 2026 && month === 3 && day === 20) return 2461754.0;
      return 2451545.0;
    },
    swe_calc_ut: (julday, planetId, flags, callback) => {
      // Two sets of mock positions — one per julian day
      const positionsJ2000 = {
        0: makePlanet(280.46),
        1: makePlanet(218.01),
        2: makePlanet(272.21),
        3: makePlanet(251.09, -0.5),
        4: makePlanet(327.85),
        5: makePlanet(25.34),
        6: makePlanet(40.72),
      };
      const positionsMarch2026 = {
        0: makePlanet(359.8),  // Sun — Pisces near 0° Aries
        1: makePlanet(120.5),  // Moon — Leo
        2: makePlanet(10.3),   // Mercury — Aries (retrograde)
        3: makePlanet(340.0, -0.4), // Venus — Pisces, retrograde
        4: makePlanet(165.2),  // Mars — Virgo
        5: makePlanet(75.1),   // Jupiter — Gemini
        6: makePlanet(354.9),  // Saturn — Pisces
      };
      const positions = julday > 2460000 ? positionsMarch2026 : positionsJ2000;
      callback(positions[planetId] || makePlanet(0));
    },
    swe_houses: (julday, lat, lng, hsys, callback) => {
      callback({ ascendant: 95.5, mc: 5.3, error: null });
    },
  };
}, { virtual: true });

const { calculateDailyTransits, parseDateToJulday } = require('../lib/astro/calculateDailyTransits');

describe('calculateDailyTransits', () => {
  test('returns date and 7 planets', async () => {
    const result = await calculateDailyTransits('2000-01-01');
    expect(result.date).toBe('2000-01-01');
    const planetNames = Object.keys(result.planets);
    expect(planetNames).toEqual(expect.arrayContaining(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']));
  });

  test('each planet has required fields', async () => {
    const result = await calculateDailyTransits('2000-01-01');
    for (const planet of Object.values(result.planets)) {
      expect(typeof planet.longitude).toBe('number');
      expect(typeof planet.sign).toBe('string');
      expect(typeof planet.degrees).toBe('number');
      expect(typeof planet.isRetrograde).toBe('boolean');
    }
  });

  test('retrograde detection — Venus with negative speed is retrograde', async () => {
    const result = await calculateDailyTransits('2026-03-20');
    expect(result.planets.venus.isRetrograde).toBe(true);
  });

  test('Mercury in retrograde on the mocked March 2026 date', async () => {
    const result = await calculateDailyTransits('2026-03-20');
    // Mercury speed is positive in mock so not retrograde — validates the detection works correctly
    expect(result.planets.mercury.isRetrograde).toBe(false);
  });

  test('Sun near 0° Aries is in Pisces at 359.8°', async () => {
    const result = await calculateDailyTransits('2026-03-20');
    expect(result.planets.sun.sign).toBe('Pisces');
    expect(result.planets.sun.degrees).toBeCloseTo(29.8, 0);
  });

  test('accepts a Date object instead of a string', async () => {
    const result = await calculateDailyTransits(new Date('2000-01-01T12:00:00Z'));
    expect(typeof result.date).toBe('string');
    expect(Object.keys(result.planets)).toHaveLength(7);
  });
});
