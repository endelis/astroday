// Scores the New Projects category (new ventures, travel, legal, opportunities).
// Governing planet: Jupiter. Rules from docs/scoring-rules.md exactly.
const { classifyAspect, resolveByWeight, maxScore } = require('./resolveConflicts');

// Relevant: all Jupiter transits, Saturn/Neptune transits to natal Jupiter,
// Sun/Venus transits to natal Jupiter.
const OTHER_TRANSIT_PLANETS = new Set(['saturn', 'neptune', 'sun', 'venus']);

function isNewProjectsAspect(aspect) {
  if (aspect.transitPlanet === 'jupiter') return true;
  if (aspect.natalPlanet === 'jupiter' && OTHER_TRANSIT_PLANETS.has(aspect.transitPlanet)) return true;
  return false;
}

// Jupiter conjunct natal Jupiter (return) → strong GREEN.
// Jupiter conjunct natal Sun → strong GREEN.
// All other conjunctions follow resolveConjunctionNature.
function classifyNewProjectsAspect(aspect) {
  if (aspect.aspect === 'conjunction') {
    if (aspect.transitPlanet === 'jupiter' && aspect.natalPlanet === 'jupiter') return 'green';
    if (aspect.transitPlanet === 'jupiter' && aspect.natalPlanet === 'sun') return 'green';
  }
  return classifyAspect(aspect);
}

function isSaturnBlocking(aspect) {
  return (
    aspect.transitPlanet === 'saturn' &&
    aspect.natalPlanet === 'jupiter' &&
    ['square', 'opposition'].includes(aspect.aspect)
  ) || (
    aspect.transitPlanet === 'jupiter' &&
    aspect.natalPlanet === 'saturn' &&
    ['square', 'opposition'].includes(aspect.aspect)
  );
}

function isJupiterTriningCore(aspect) {
  return (
    aspect.transitPlanet === 'jupiter' &&
    ['sun', 'jupiter'].includes(aspect.natalPlanet) &&
    aspect.aspect === 'trine'
  );
}

function isJupiterSextileOnly(aspect) {
  return aspect.transitPlanet === 'jupiter' && aspect.aspect === 'sextile';
}

// Priority order from scoring-rules.md Conflict Resolution — New Projects.
function scoreNewProjects(aspects, planetaryEvents) {
  const relevant = aspects.filter(isNewProjectsAspect);
  const classified = relevant.map(a => ({
    ...a,
    effectiveNature: classifyNewProjectsAspect(a),
  }));

  const greens = classified.filter(a => a.effectiveNature === 'green');
  const reds   = classified.filter(a => a.effectiveNature === 'red');
  const reasons = [];

  // Priority 1: Jupiter retrograde → minimum GREY.
  if (planetaryEvents.jupiterRetrograde) {
    if (reds.length > 0) {
      reasons.push('Jupiter retrograde with active tension — expansion meets obstacles');
      return { score: 'red', strength: maxScore(reds), reasons };
    }
    reasons.push('Jupiter retrograde — refine existing projects rather than launching new ones');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 2: Saturn square or opposition to Jupiter → RED.
  const saturnBlock = relevant.filter(isSaturnBlocking);
  if (saturnBlock.length > 0) {
    reasons.push(...saturnBlock.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'red', strength: maxScore(saturnBlock), reasons };
  }

  // Priority 3: Jupiter trine Sun or Jupiter (core expansion aspects) → GREEN.
  // Only when no red signals present — priority 5 handles the mixed case.
  const coreTrine = relevant.filter(isJupiterTriningCore);
  if (coreTrine.length > 0 && reds.length === 0) {
    reasons.push(...coreTrine.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'green', strength: maxScore(coreTrine), reasons };
  }

  // Priority 4: Jupiter sextile (without Saturn tension already handled) → moderate green.
  const sextiles = relevant.filter(isJupiterSextileOnly);
  if (sextiles.length > 0 && reds.length === 0) {
    reasons.push(...sextiles.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    reasons.push('Opportunity exists but requires effort');
    return { score: 'green', strength: maxScore(sextiles), reasons };
  }

  // Priority 5: Mixed signals → GREY.
  if (greens.length > 0 && reds.length > 0) {
    reasons.push('Mixed signals — tension between expansion and caution');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 6: No aspect.
  const score = resolveByWeight(greens, reds);
  if (score === 'green') {
    reasons.push(...greens.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else {
    reasons.push('No significant aspect active to Jupiter');
  }

  const winning = score === 'green' ? greens : [];
  return { score, strength: maxScore(winning), reasons };
}

module.exports = { scoreNewProjects };
