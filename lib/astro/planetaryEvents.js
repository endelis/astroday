// Detects active planetary events (retrogrades, moon phases, eclipses) for a given date.
const swisseph = require('swisseph');
const { angularDistance } = require('./detectAspects');

const CALC_FLAGS = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
const SHADOW_DAYS = 14;
const MOON_PHASE_ORB = 12;  // degrees from exact full/new moon to still count as that day
const ECLIPSE_NODE_ORB = 1; // degrees Moon must be from True Node for eclipse

const BANNERS = {
  mercuryRetrograde: 'Mercury retrograde — communications need extra care',
  mercuryShadow:     'Mercury retrograde shadow — communications need gentle care',
  venusRetrograde:   'Venus retrograde — review finances and existing agreements rather than initiating',
  marsRetrograde:    'Mars retrograde — energy turns inward. Plan and prepare rather than push forward',
  jupiterRetrograde: 'Jupiter retrograde — a period for refining existing projects rather than new launches',
  saturnRetrograde:  'Saturn retrograde — review commitments and audit existing agreements',
  fullMoon:          'Full moon — emotions and situations reach a peak. A natural time for completion and release',
  newMoon:           'New moon — a natural window for setting intentions and beginning new cycles',
  eclipse:           'Eclipse — significant turning point energy. Avoid rushed decisions for the next few days',
};

function dateToJulday(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return swisseph.swe_julday(year, month, day, 12.0, swisseph.SE_GREG_CAL);
}

function calcPlanetSpeedAsync(julday, planetId) {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(julday, planetId, CALC_FLAGS, (result) => {
      if (result.error) return reject(new Error(result.error));
      resolve({ longitude: result.longitude, isRetrograde: result.longitudeSpeed < 0 });
    });
  });
}

async function detectMercuryShadow(date, isMercuryNowRetrograde) {
  if (isMercuryNowRetrograde) return false;
  const jd = dateToJulday(date);
  const [past, future] = await Promise.all([
    calcPlanetSpeedAsync(jd - SHADOW_DAYS, swisseph.SE_MERCURY),
    calcPlanetSpeedAsync(jd + SHADOW_DAYS, swisseph.SE_MERCURY),
  ]);
  return past.isRetrograde || future.isRetrograde;
}

async function detectEclipse(date, sunLong, moonLong, isFullMoon, isNewMoon) {
  if (!isFullMoon && !isNewMoon) return { eclipse: false, eclipseType: null };
  const jd = dateToJulday(date);
  const node = await calcPlanetSpeedAsync(jd, swisseph.SE_TRUE_NODE);
  const moonToNode = angularDistance(moonLong, node.longitude);
  if (moonToNode > ECLIPSE_NODE_ORB) return { eclipse: false, eclipseType: null };
  return { eclipse: true, eclipseType: isFullMoon ? 'lunar' : 'solar' };
}

async function detectPlanetaryEvents(date, transitPlanets) {
  const { sun, moon, mercury, venus, mars, jupiter, saturn } = transitPlanets;

  const sunMoonDist = angularDistance(sun.longitude, moon.longitude);
  const isFullMoon = Math.abs(sunMoonDist - 180) <= MOON_PHASE_ORB;
  const isNewMoon  = sunMoonDist <= MOON_PHASE_ORB;

  const [shadowResult, eclipseResult] = await Promise.all([
    detectMercuryShadow(date, mercury.isRetrograde),
    detectEclipse(date, sun.longitude, moon.longitude, isFullMoon, isNewMoon),
  ]);

  const activeEvents = [];
  if (mercury.isRetrograde)                   activeEvents.push(BANNERS.mercuryRetrograde);
  else if (shadowResult)                       activeEvents.push(BANNERS.mercuryShadow);
  if (venus.isRetrograde)                      activeEvents.push(BANNERS.venusRetrograde);
  if (mars.isRetrograde)                       activeEvents.push(BANNERS.marsRetrograde);
  if (jupiter.isRetrograde)                    activeEvents.push(BANNERS.jupiterRetrograde);
  if (saturn.isRetrograde)                     activeEvents.push(BANNERS.saturnRetrograde);
  if (isFullMoon)                              activeEvents.push(BANNERS.fullMoon);
  if (isNewMoon)                               activeEvents.push(BANNERS.newMoon);
  if (eclipseResult.eclipse)                   activeEvents.push(BANNERS.eclipse);

  return {
    mercuryRetrograde:       mercury.isRetrograde,
    mercuryRetrogradeShadow: !mercury.isRetrograde && shadowResult,
    venusRetrograde:         venus.isRetrograde,
    marsRetrograde:          mars.isRetrograde,
    jupiterRetrograde:       jupiter.isRetrograde,
    saturnRetrograde:        saturn.isRetrograde,
    fullMoon:                isFullMoon,
    newMoon:                 isNewMoon,
    eclipse:                 eclipseResult.eclipse,
    eclipseType:             eclipseResult.eclipseType,
    activeEvents,
  };
}

module.exports = { detectPlanetaryEvents, BANNERS };
