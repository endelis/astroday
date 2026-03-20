// Scores the Decisions category (contracts, long-term commitments, agreements).
// Governing planet: Saturn. Rules from docs/scoring-rules.md exactly.
const { classifyAspect, resolveByWeight, maxScore } = require('./resolveConflicts');

// Relevant: all Saturn transits, Jupiter/Sun/Pluto transits to natal Saturn,
// Mercury retrograde has a secondary effect (handled via planetaryEvents).
const OTHER_TRANSIT_PLANETS = new Set(['jupiter', 'sun', 'pluto']);

function isDecisionsAspect(aspect) {
  if (aspect.transitPlanet === 'saturn') return true;
  if (aspect.natalPlanet === 'saturn' && OTHER_TRANSIT_PLANETS.has(aspect.transitPlanet)) return true;
  return false;
}

// Saturn conjunct natal Saturn (return) → RED always (special priority 1).
// Pluto square natal Saturn → RED (but Pluto not in 7-planet set, skipped).
function classifyDecisionsAspect(aspect) {
  if (
    aspect.transitPlanet === 'saturn' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'conjunction'
  ) return 'red'; // Saturn return — always RED
  return classifyAspect(aspect);
}

function isSaturnReturn(aspect) {
  return (
    aspect.transitPlanet === 'saturn' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'conjunction'
  );
}

function isSaturnOpposingSaturn(aspect) {
  return (
    aspect.transitPlanet === 'saturn' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'opposition'
  );
}

function isSaturnStressingSunOrSaturn(aspect) {
  return (
    aspect.transitPlanet === 'saturn' &&
    ['sun', 'saturn'].includes(aspect.natalPlanet) &&
    ['square'].includes(aspect.aspect)
  );
}

function isSaturnTriningCore(aspect) {
  return (
    aspect.transitPlanet === 'saturn' &&
    ['saturn', 'sun'].includes(aspect.natalPlanet) &&
    aspect.aspect === 'trine'
  );
}

function isJupiterTriningNatalSaturn(aspect) {
  return (
    aspect.transitPlanet === 'jupiter' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'trine'
  );
}

// Priority order from scoring-rules.md Conflict Resolution — Decisions.
function scoreDecisions(aspects, planetaryEvents) {
  const relevant = aspects.filter(isDecisionsAspect);
  const classified = relevant.map(a => ({
    ...a,
    effectiveNature: classifyDecisionsAspect(a),
  }));

  const greens = classified.filter(a => a.effectiveNature === 'green');
  const reds   = classified.filter(a => a.effectiveNature === 'red');
  const reasons = [];

  // Priority 1: Saturn return → RED always.
  if (relevant.some(isSaturnReturn)) {
    reasons.push('Saturn return — major life restructuring, not the time for new long-term commitments');
    return { score: 'red', strength: 10, reasons };
  }

  // Priority 2: Saturn opposition natal Saturn → RED.
  if (relevant.some(isSaturnOpposingSaturn)) {
    reasons.push('Saturn opposing natal Saturn — existing structures restructuring, avoid new commitments');
    return { score: 'red', strength: 7 * 1.0, reasons };
  }

  // Priority 3: Mercury retrograde + Saturn GREEN → GREY with warning.
  if (planetaryEvents.mercuryRetrograde && greens.length > 0 && reds.length === 0) {
    reasons.push('Saturn supports this decision but Mercury retrograde means communications around this agreement may be unclear. Review every word before signing.');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 4: Saturn square Sun or Saturn → RED.
  const squareStress = relevant.filter(isSaturnStressingSunOrSaturn);
  if (squareStress.length > 0) {
    reasons.push(...squareStress.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'red', strength: maxScore(squareStress), reasons };
  }

  // Priority 5 / 6 are only reached when Saturn is NOT retrograde.
  // Foundational rule: governing planet retrograde → GREEN aspects become GREY.
  if (planetaryEvents.saturnRetrograde) {
    if (reds.length > 0) {
      reasons.push(...reds.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
      return { score: 'red', strength: maxScore(reds), reasons };
    }
    reasons.push('Saturn retrograde — review existing agreements rather than making new commitments');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 5: Saturn trine Saturn or Sun, no tension → GREEN.
  const saturnTrine = relevant.filter(isSaturnTriningCore);
  if (saturnTrine.length > 0 && reds.length === 0) {
    reasons.push(...saturnTrine.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'green', strength: maxScore(saturnTrine), reasons };
  }

  // Priority 6: Jupiter trine natal Saturn, no tension → GREEN.
  const jupiterTrine = relevant.filter(isJupiterTriningNatalSaturn);
  if (jupiterTrine.length > 0 && reds.length === 0) {
    reasons.push(...jupiterTrine.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'green', strength: maxScore(jupiterTrine), reasons };
  }

  // Priority 7 (original): no retrograde, no trine, no significant aspect.
  if (planetaryEvents.saturnRetrograde && reds.length === 0) {
    reasons.push('Saturn retrograde — review existing agreements rather than making new commitments');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 8: No significant aspect.
  const score = resolveByWeight(greens, reds);
  if (score === 'green') {
    reasons.push(...greens.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else if (score === 'red') {
    reasons.push(...reds.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else {
    reasons.push('No significant aspect active to Saturn');
  }

  const winning = score === 'green' ? greens : score === 'red' ? reds : [];
  return { score, strength: maxScore(winning), reasons };
}

module.exports = { scoreDecisions };
