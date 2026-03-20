// Calculates today's (or any given date's) planetary transit positions using Swiss Ephemeris.
const swisseph = require('swisseph');
const { longitudeToSign } = require('./calculateNatalChart');

const PLANET_IDS = {
  sun: swisseph.SE_SUN,
  moon: swisseph.SE_MOON,
  mercury: swisseph.SE_MERCURY,
  venus: swisseph.SE_VENUS,
  mars: swisseph.SE_MARS,
  jupiter: swisseph.SE_JUPITER,
  saturn: swisseph.SE_SATURN,
};

const CALC_FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;

function parseDateToJulday(date) {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00Z') : date;
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return swisseph.swe_julday(year, month, day, 12.0, swisseph.SE_GREG_CAL);
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

async function calculateDailyTransits(date) {
  const julday = parseDateToJulday(date);

  const planetEntries = await Promise.all(
    Object.entries(PLANET_IDS).map(async ([name, id]) => [name, await calcPlanetAsync(julday, id)])
  );

  return {
    date: typeof date === 'string' ? date : date.toISOString().split('T')[0],
    planets: Object.fromEntries(planetEntries),
  };
}

module.exports = { calculateDailyTransits, parseDateToJulday };
