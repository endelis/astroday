// Detects active aspects between transit and natal planet positions.
// Orbs and aspect definitions follow docs/scoring-rules.md exactly.

// Aspect definitions — angle, orb, weight, and nature per scoring-rules.md
const ASPECTS = [
  { name: 'conjunction',   angle: 0,   orb: 8, weight: 10, nature: 'variable' },
  { name: 'sextile',       angle: 60,  orb: 6, weight: 5,  nature: 'harmonious' },
  { name: 'square',        angle: 90,  orb: 6, weight: 7,  nature: 'tense' },
  { name: 'trine',         angle: 120, orb: 6, weight: 8,  nature: 'harmonious' },
  { name: 'opposition',    angle: 180, orb: 6, weight: 7,  nature: 'tense' },
  { name: 'semi-sextile',  angle: 30,  orb: 3, weight: 2,  nature: 'minor' },
  { name: 'quincunx',      angle: 150, orb: 3, weight: 2,  nature: 'minor' },
];

// Planet importance modifiers per scoring-rules.md aspect weight table
const PLANET_MODIFIERS = {
  sun:       1.5,
  moon:      1.3,
  ascendant: 1.2,
  midheaven: 1.2,
};

function angularDistance(long1, long2) {
  const diff = Math.abs(long1 - long2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function getPlanetModifier(planetName) {
  return PLANET_MODIFIERS[planetName] ?? 1.0;
}

// Returns all active aspects between a single transit planet and all natal planets.
function detectAspectsForPlanet(transitPlanetName, transitLongitude, natalPlanets, natalAngles) {
  const activeAspects = [];
  const allNatalPoints = { ...natalPlanets };

  if (natalAngles) {
    if (natalAngles.ascendant) allNatalPoints.ascendant = natalAngles.ascendant;
    if (natalAngles.midheaven) allNatalPoints.midheaven = natalAngles.midheaven;
  }

  for (const [natalName, natalData] of Object.entries(allNatalPoints)) {
    const natalLong = typeof natalData === 'object' ? natalData.longitude : natalData;
    const distance = angularDistance(transitLongitude, natalLong);

    for (const aspect of ASPECTS) {
      const actualOrb = Math.abs(distance - aspect.angle);
      if (actualOrb <= aspect.orb) {
        const natalModifier = getPlanetModifier(natalName);
        const score = aspect.weight * natalModifier;
        activeAspects.push({
          transitPlanet: transitPlanetName,
          natalPlanet: natalName,
          aspect: aspect.name,
          angle: aspect.angle,
          orb: parseFloat(actualOrb.toFixed(4)),
          nature: aspect.nature,
          weight: aspect.weight,
          natalModifier,
          score: parseFloat(score.toFixed(4)),
        });
        break; // only match the tightest-angle aspect (aspects are ordered loosely)
      }
    }
  }

  return activeAspects;
}

// Main function: compare all transit planets against all natal planets.
// Returns flat array of all active aspects sorted by score descending.
function detectAspects(natalChart, transitData) {
  const natalPlanets = natalChart.planets;
  const natalAngles = {
    ascendant: natalChart.ascendant || null,
    midheaven: natalChart.midheaven || null,
  };
  const transitPlanets = transitData.planets;

  const allAspects = [];

  for (const [transitName, transitPlanet] of Object.entries(transitPlanets)) {
    const aspects = detectAspectsForPlanet(
      transitName,
      transitPlanet.longitude,
      natalPlanets,
      natalAngles
    );
    allAspects.push(...aspects);
  }

  return allAspects.sort((a, b) => b.score - a.score);
}

module.exports = { detectAspects, detectAspectsForPlanet, angularDistance, ASPECTS };
