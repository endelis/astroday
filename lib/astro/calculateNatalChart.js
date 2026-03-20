// Calculates natal planet positions from birth data using Swiss Ephemeris.
const swisseph = require('swisseph');

const PLANET_IDS = {
  sun: swisseph.SE_SUN,
  moon: swisseph.SE_MOON,
  mercury: swisseph.SE_MERCURY,
  venus: swisseph.SE_VENUS,
  mars: swisseph.SE_MARS,
  jupiter: swisseph.SE_JUPITER,
  saturn: swisseph.SE_SATURN,
};

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const CALC_FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;

function getAccuracyTier(birthTime, latitude) {
  if (birthTime && latitude !== null && latitude !== undefined) return 'full';
  if (latitude !== null && latitude !== undefined) return 'good';
  return 'basic';
}

function parseBirthHour(birthTime) {
  if (!birthTime) return 12.0;
  const [hours, minutes] = birthTime.split(':').map(Number);
  return hours + minutes / 60;
}

function longitudeToSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return {
    sign: SIGNS[signIndex],
    degrees: parseFloat((normalized % 30).toFixed(4)),
  };
}

function calcPlanetAsync(julday, planetId) {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(julday, planetId, CALC_FLAGS, (result) => {
      if (result.error) return reject(new Error(`swisseph error: ${result.error}`));
      const { sign, degrees } = longitudeToSign(result.longitude);
      resolve({
        longitude: parseFloat(result.longitude.toFixed(6)),
        sign,
        degrees,
        isRetrograde: result.longitudeSpeed < 0,
      });
    });
  });
}

function calcHousesAsync(julday, latitude, longitude) {
  return new Promise((resolve, reject) => {
    swisseph.swe_houses(julday, latitude, longitude, 'P', (result) => {
      if (result.error) return reject(new Error(`swisseph houses error: ${result.error}`));
      resolve(result);
    });
  });
}

async function calculateNatalChart({ birthDate, birthTime = null, latitude = null, longitude = null }) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const hourDecimal = parseBirthHour(birthTime);
  const accuracyTier = getAccuracyTier(birthTime, latitude);

  const julday = swisseph.swe_julday(year, month, day, hourDecimal, swisseph.SE_GREG_CAL);

  const planetEntries = await Promise.all(
    Object.entries(PLANET_IDS).map(async ([name, id]) => [name, await calcPlanetAsync(julday, id)])
  );
  const planets = Object.fromEntries(planetEntries);

  const chart = { planets, accuracyTier };

  if (accuracyTier === 'full' && latitude !== null && longitude !== null) {
    const houses = await calcHousesAsync(julday, latitude, longitude);
    chart.ascendant = {
      longitude: parseFloat(houses.ascendant.toFixed(6)),
      ...longitudeToSign(houses.ascendant),
    };
    chart.midheaven = {
      longitude: parseFloat(houses.mc.toFixed(6)),
      ...longitudeToSign(houses.mc),
    };
  }

  return chart;
}

module.exports = { calculateNatalChart, longitudeToSign, getAccuracyTier };
