// Scores the Contacts category (communication, calls, emails, documents).
// Governing planet: Mercury. Rules from docs/scoring-rules.md exactly.
const { classifyAspect, resolveByWeight, maxScore } = require('./resolveConflicts');

// Aspects relevant to Contacts: all Mercury transits, plus other planets aspecting natal Mercury.
const OTHER_TRANSIT_PLANETS = new Set(['jupiter', 'sun', 'venus', 'mars', 'saturn', 'neptune']);

function isContactsAspect(aspect) {
  if (aspect.transitPlanet === 'mercury') return true;
  if (aspect.natalPlanet === 'mercury' && OTHER_TRANSIT_PLANETS.has(aspect.transitPlanet)) return true;
  return false;
}

// Special GREY overrides per scoring-rules.md:
// Transit Mercury conjunct natal Saturn → GREY (cautious, not red).
function classifyContactsAspect(aspect) {
  if (
    aspect.transitPlanet === 'mercury' &&
    aspect.natalPlanet === 'saturn' &&
    aspect.aspect === 'conjunction'
  ) return 'grey';
  return classifyAspect(aspect);
}

// Priority order from scoring-rules.md Conflict Resolution — Contacts.
function scoreContacts(aspects, planetaryEvents) {
  const relevant = aspects.filter(isContactsAspect);
  const classified = relevant.map(a => ({
    ...a,
    effectiveNature: classifyContactsAspect(a),
  }));

  const greens = classified.filter(a => a.effectiveNature === 'green');
  const reds   = classified.filter(a => a.effectiveNature === 'red');
  const reasons = [];

  // Priority 1: Mercury retrograde — GREEN → GREY, RED stays RED (intensified).
  if (planetaryEvents.mercuryRetrograde) {
    if (reds.length > 0) {
      reasons.push('Mercury retrograde intensifies communication friction');
      return { score: 'red', strength: maxScore(reds), reasons };
    }
    reasons.push('Mercury retrograde — outward communication turns inward');
    return { score: 'grey', strength: 0, reasons };
  }

  // Priority 2: RED aspect from Mars or Saturn transit → RED overrides GREEN.
  const heavyReds = reds.filter(a => ['mars', 'saturn'].includes(a.transitPlanet));
  if (heavyReds.length > 0) {
    reasons.push(...heavyReds.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
    return { score: 'red', strength: maxScore(heavyReds), reasons };
  }

  // Priorities 3–6: weight-based resolution.
  const score = resolveByWeight(greens, reds);

  if (score === 'green') {
    reasons.push(...greens.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else if (score === 'red') {
    reasons.push(...reds.map(a => `transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`));
  } else {
    reasons.push(greens.length === 0 && reds.length === 0
      ? 'No significant aspect active'
      : 'Mixed signals — energy is complex');
  }

  // Shadow: note it but do not change score (scoring-rules.md: gentle caution only).
  if (planetaryEvents.mercuryRetrogradeShadow) {
    reasons.push('Mercury retrograde shadow — slight caution with communications');
  }

  const winning = score === 'green' ? greens : score === 'red' ? reds : [];
  return { score, strength: maxScore(winning), reasons };
}

module.exports = { scoreContacts };
