// Tests for calculateNatalChart — swisseph is mocked so no native binary required.

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
    swe_julday: () => 2451545.0, // J2000.0
    swe_calc_ut: (julday, planetId, flags, callback) => {
      // Known approximate longitudes for J2000.0 (Jan 1 2000 noon UT)
      const positions = {
        0: makePlanet(280.46),  // Sun — Capricorn
        1: makePlanet(218.01),  // Moon — Scorpio
        2: makePlanet(272.21),  // Mercury — Capricorn (retrograde)
        3: makePlanet(251.09, -0.5),  // Venus — Sagittarius, retrograde
        4: makePlanet(327.85),  // Mars — Aquarius
        5: makePlanet(25.34),   // Jupiter — Aries
        6: makePlanet(40.72),   // Saturn — Taurus
      };
      callback(positions[planetId] || makePlanet(0));
    },
    swe_houses: (julday, lat, lng, hsys, callback) => {
      callback({ ascendant: 95.5, mc: 5.3, error: null });
    },
  };
}, { virtual: true });

const { calculateNatalChart, longitudeToSign, getAccuracyTier } = require('../lib/astro/calculateNatalChart');

describe('longitudeToSign', () => {
  test('280.46° maps to Capricorn', () => {
    const result = longitudeToSign(280.46);
    expect(result.sign).toBe('Capricorn');
    expect(result.degrees).toBeCloseTo(10.46, 1);
  });

  test('0° maps to Aries', () => {
    expect(longitudeToSign(0).sign).toBe('Aries');
  });

  test('359° wraps correctly into Pisces', () => {
    expect(longitudeToSign(359).sign).toBe('Pisces');
  });

  test('negative longitude normalizes correctly', () => {
    expect(longitudeToSign(-30).sign).toBe('Pisces');
  });

  test('360° wraps to Aries (0°)', () => {
    expect(longitudeToSign(360).sign).toBe('Aries');
  });
});

describe('getAccuracyTier', () => {
  test('returns full when birthTime and latitude provided', () => {
    expect(getAccuracyTier('07:30', -25.7)).toBe('full');
  });

  test('returns good when latitude provided but no birthTime', () => {
    expect(getAccuracyTier(null, -25.7)).toBe('good');
  });

  test('returns basic when only birthDate available', () => {
    expect(getAccuracyTier(null, null)).toBe('basic');
  });
});

describe('calculateNatalChart', () => {
  test('returns 7 planets with basic accuracy tier (date only)', async () => {
    const chart = await calculateNatalChart({ birthDate: '2000-01-01' });
    expect(chart.accuracyTier).toBe('basic');
    const planetNames = Object.keys(chart.planets);
    expect(planetNames).toEqual(expect.arrayContaining(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']));
  });

  test('each planet has longitude, sign, degrees, isRetrograde', async () => {
    const chart = await calculateNatalChart({ birthDate: '2000-01-01' });
    for (const planet of Object.values(chart.planets)) {
      expect(typeof planet.longitude).toBe('number');
      expect(typeof planet.sign).toBe('string');
      expect(typeof planet.degrees).toBe('number');
      expect(typeof planet.isRetrograde).toBe('boolean');
    }
  });

  test('Sun is in Capricorn on J2000.0', async () => {
    const chart = await calculateNatalChart({ birthDate: '2000-01-01' });
    expect(chart.planets.sun.sign).toBe('Capricorn');
  });

  test('retrograde detection — Venus with negative speed is retrograde', async () => {
    const chart = await calculateNatalChart({ birthDate: '2000-01-01' });
    expect(chart.planets.venus.isRetrograde).toBe(true);
  });

  test('non-retrograde planet — Sun is not retrograde', async () => {
    const chart = await calculateNatalChart({ birthDate: '2000-01-01' });
    expect(chart.planets.sun.isRetrograde).toBe(false);
  });

  test('full accuracy returns ascendant and midheaven', async () => {
    const chart = await calculateNatalChart({
      birthDate: '2000-01-01',
      birthTime: '12:00',
      latitude: -25.7,
      longitude: 28.2,
    });
    expect(chart.accuracyTier).toBe('full');
    expect(chart.ascendant).toBeDefined();
    expect(chart.midheaven).toBeDefined();
    expect(typeof chart.ascendant.longitude).toBe('number');
  });

  test('good accuracy (no birthTime) does not return ascendant', async () => {
    const chart = await calculateNatalChart({
      birthDate: '2000-01-01',
      latitude: -25.7,
      longitude: 28.2,
    });
    expect(chart.accuracyTier).toBe('good');
    expect(chart.ascendant).toBeUndefined();
  });
});
