// Scores the Risk category (energy, action, willpower, initiative, equipment).
// Governing planet: Mars. Rules from docs/scoring-rules.md exactly.
const { classifyAspect, resolveByWeight, maxScore } = require('./resolveConflicts');

// Relevant aspects: all Mars transits, Jupiter/Sun/Saturn transits to natal Mars.
const OTHER_TRANSIT_PLANETS = new Set(['jupiter', 'sun', 'saturn']);

function isRiskAspect(aspect) {
  if (aspect.transitPlanet === 'mars') return true;
  if (aspect.natalPlanet === 'mars' && OTHER_TRANSIT_PLANETS.has(aspect.transitPlanet)) return true;
  return false;
}

// Special RED override: Mars conjunct natal Saturn → RED (malefic conjunction).
// classifyAspect would return 'red' for 'mars_saturn' key anyway — included explicitly for clarity.
function classifyRiskAspect(aspect) {
  if (
    aspect.transitPlanet === 'mars' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'conjunction'
  ) return 'red';
  return classifyAspect(aspect);
}

function isMarsStressingSaturn(aspect) {
  return (
    aspect.transitPlanet === 'mars' &&
    aspect.natalPlanet === 'saturn' &&
    ['square', 'opposition'].includes(aspect.aspect)
  ) || (
    aspect.transitPlanet === 'saturn' &&
    aspect.natalPlanet === 'mars' &&
    ['square', 'opposition'].includes(aspect.aspect)
  );
}

function isMarsTriningExpansion(aspect) {
  return (
    aspect.transitPlanet === 'mars' &&
    ['jupiter', 'sun'].includes(aspect.natalPlanet) &&
    aspect.aspect === 'trine'
  );
}

// Priority order from scoring-rules.md Conflict Resolution — Risk.
// Note: Mars tension is never simply cancelled — mixed always resolves RED.
function scoreRisk(aspects, planetaryEvents) {
  const relevant = aspects.filter(isRiskAspect);
  const classified = relevant.map(a => ({
    ...a,
    effectiveNature: classifyRiskAspect(a),
  }));

  const greens = classified.filter(a => a.effectiveNature === 'green');
  const reds   = classified.filter(a => a.effectiveNature === 'red');
  const reasons = [];

  // Priority 1: Mars retrograde → minimum GREY (GREEN aspects become GREY).
  if (planetaryEvents.marsRetrograde) {
    if (reds.length > 0) {
      reasons.push('Mars retrograde with active tension — energy is frustrated');
      return { score: 'red', strength: maxScore(reds), reasons };
    }
    reasons.push('Mars retrograde — energy turns inward, plan rather than launch');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 2: Mars square or opposition Saturn → RED (blocked energy).
  const saturnBlock = relevant.filter(isMarsStressingSaturn);
  if (saturnBlock.length > 0) {
    reasons.push(...saturnBlock.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'red', strength: maxScore(saturnBlock), reasons };
  }

  // Priority 3: (Uranus aspects would go here — not in 7-planet set, skipped.)

  // Priority 4: Mars trine Jupiter or Sun → GREEN.
  const expansionTrine = relevant.filter(isMarsTriningExpansion);
  if (expansionTrine.length > 0 && reds.length === 0) {
    reasons.push(...expansionTrine.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'green', strength: maxScore(expansionTrine), reasons };
  }

  // Priority 5: Mixed (one GREEN, one RED) → RED with caution note.
  // Mars tension is never simply cancelled.
  if (greens.length > 0 && reds.length > 0) {
    reasons.push(...reds.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    reasons.push('Mixed energy — tension acknowledged, caution advised');
    return { score: 'red', strength: maxScore(reds), reasons };
  }

  // Priority 4 (general green) / 6 (no aspect).
  const score = resolveByWeight(greens, reds);
  if (score === 'green') {
    reasons.push(...greens.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else {
    reasons.push('No significant aspect active to Mars');
  }

  const winning = score === 'green' ? greens : [];
  return { score, strength: maxScore(winning), reasons };
}

module.exports = { scoreRisk };
