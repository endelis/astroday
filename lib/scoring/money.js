// Scores the Money category (finances, income, expenses, resources).
// Governing planets: Venus (primary), Jupiter (secondary). Rules from docs/scoring-rules.md.
const { classifyAspect, resolveByWeight, maxScore } = require('./resolveConflicts');

// Relevant aspects: Venus transits (any natal), Jupiter transits (any natal),
// Saturn/Mars transits to natal Venus or Jupiter, Sun transits to natal Venus.
const VENUS_NATAL_TRANSITS  = new Set(['venus', 'jupiter', 'saturn', 'mars', 'sun']);
const JUPITER_NATAL_TRANSITS = new Set(['venus', 'jupiter', 'saturn', 'sun']);

function isMoneyAspect(aspect) {
  if (aspect.transitPlanet === 'venus') return true;
  if (aspect.transitPlanet === 'jupiter') return true;
  if (aspect.natalPlanet === 'venus'   && VENUS_NATAL_TRANSITS.has(aspect.transitPlanet)) return true;
  if (aspect.natalPlanet === 'jupiter' && JUPITER_NATAL_TRANSITS.has(aspect.transitPlanet)) return true;
  return false;
}

// Special GREY override: Venus conjunct natal Saturn → cautious grey, not red.
function classifyMoneyAspect(aspect) {
  if (
    aspect.transitPlanet === 'venus' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'conjunction'
  ) return 'grey';
  return classifyAspect(aspect);
}

// Determines if an aspect involves Saturn square/opposition to Venus (the hard override).
function isSaturnStressingVenus(aspect) {
  return (
    aspect.transitPlanet === 'saturn' &&
    aspect.natalPlanet === 'venus' &&
    ['square', 'opposition'].includes(aspect.aspect)
  ) || (
    aspect.transitPlanet === 'venus' &&
    aspect.natalPlanet === 'saturn' &&
    ['square', 'opposition'].includes(aspect.aspect)
  );
}

// Priority order from scoring-rules.md Conflict Resolution — Money.
function scoreMoney(aspects, planetaryEvents) {
  const relevant = aspects.filter(isMoneyAspect);
  const classified = relevant.map(a => ({
    ...a,
    effectiveNature: classifyMoneyAspect(a),
  }));

  const greens = classified.filter(a => a.effectiveNature === 'green');
  const reds   = classified.filter(a => a.effectiveNature === 'red');
  const reasons = [];

  // Priority 1: Venus retrograde → minimum GREY (same rules as Mercury retro for this category).
  if (planetaryEvents.venusRetrograde) {
    if (reds.length > 0) {
      reasons.push('Venus retrograde intensifies financial friction');
      return { score: 'red', strength: maxScore(reds), reasons };
    }
    reasons.push('Venus retrograde — re-evaluate finances, avoid new financial commitments');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 2: Saturn square or opposition to Venus → RED overrides Jupiter GREEN.
  const saturnStress = relevant.filter(isSaturnStressingVenus);
  if (saturnStress.length > 0) {
    reasons.push(...saturnStress.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'red', strength: maxScore(saturnStress), reasons };
  }

  // Priorities 3–5: Jupiter GREEN vs Venus RED via weight-based resolution.
  const score = resolveByWeight(greens, reds);

  if (score === 'green') {
    reasons.push(...greens.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else if (score === 'red') {
    reasons.push(...reds.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else {
    reasons.push(greens.length === 0 && reds.length === 0
      ? 'No significant aspect active to Venus or Jupiter'
      : 'Mixed signals — tension between opportunity and caution');
  }

  const winning = score === 'green' ? greens : score === 'red' ? reds : [];
  return { score, strength: maxScore(winning), reasons };
}

module.exports = { scoreMoney };
