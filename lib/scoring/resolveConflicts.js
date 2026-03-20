// Shared conflict resolution utilities used by all 5 category scorers.

// Conjunction nature table per scoring-rules.md Conjunction Rules Summary.
// Key format: 'transitPlanet_natalPlanet'
const CONJUNCTION_NATURE = {
  'venus_jupiter':  'green',
  'jupiter_venus':  'green',
  'venus_sun':      'green',
  'jupiter_sun':    'green',
  'mercury_sun':    'grey',
  'saturn_mercury': 'grey',
  'mercury_saturn': 'grey',
  'mars_saturn':    'red',
  'saturn_mars':    'red',
  'mars_sun':       'red',
};

// Resolves conjunction nature from the planets involved.
// Falls back to grey for any unlisted pair (neutral, assess by context).
function resolveConjunctionNature(transitPlanet, natalPlanet) {
  const key = `${transitPlanet}_${natalPlanet}`;
  return CONJUNCTION_NATURE[key] ?? 'grey';
}

// Applies the general retrograde rule: GREEN → GREY, RED stays RED, GREY stays GREY.
function applyRetrogradeRule(nature) {
  return nature === 'green' ? 'grey' : nature;
}

// Classifies a single aspect's effective nature.
// Handles minor aspects (always GREY) and variable conjunctions.
function classifyAspect(aspect) {
  if (aspect.nature === 'minor') return 'grey';
  if (aspect.nature === 'harmonious') return 'green';
  if (aspect.nature === 'tense') return 'red';
  if (aspect.nature === 'variable') {
    return resolveConjunctionNature(aspect.transitPlanet, aspect.natalPlanet);
  }
  return 'grey';
}

// Resolves competing GREEN and RED signals using the aspect weight table.
// scoring-rules.md: if top green score and top red score are within 2 points → GREY (mixed).
// Otherwise highest score wins.
function resolveByWeight(greenAspects, redAspects) {
  if (greenAspects.length === 0 && redAspects.length === 0) return 'grey';
  if (greenAspects.length === 0) return 'red';
  if (redAspects.length === 0) return 'green';

  const topGreen = Math.max(...greenAspects.map(a => a.score));
  const topRed   = Math.max(...redAspects.map(a => a.score));

  if (Math.abs(topGreen - topRed) <= 2) return 'grey';
  return topGreen > topRed ? 'green' : 'red';
}

// Returns the max score among a list of aspects (used for strength output).
function maxScore(aspects) {
  if (aspects.length === 0) return 0;
  return Math.max(...aspects.map(a => a.score));
}

module.exports = {
  resolveConjunctionNature,
  applyRetrogradeRule,
  classifyAspect,
  resolveByWeight,
  maxScore,
};
