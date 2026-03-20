// Shared helper — resolves natal chart, transits, aspects, events, and scores
// for a given profile + date. Checks score cache before recalculating.
const { calculateNatalChart } = require('../astro/calculateNatalChart');
const { calculateDailyTransits } = require('../astro/calculateDailyTransits');
const { detectAspects } = require('../astro/detectAspects');
const { detectPlanetaryEvents } = require('../astro/planetaryEvents');
const { scoreContacts } = require('../scoring/contacts');
const { scoreMoney } = require('../scoring/money');
const { scoreRisk } = require('../scoring/risk');
const { scoreNewProjects } = require('../scoring/newProjects');
const { scoreDecisions } = require('../scoring/decisions');
const { getCachedScores, setCachedScores } = require('../db/scores');

function calcOverall(scores) {
  const counts = { green: 0, red: 0, grey: 0 };
  for (const s of [scores.contacts, scores.money, scores.risk, scores.new_projects, scores.decisions]) {
    counts[s] = (counts[s] ?? 0) + 1;
  }
  if (counts.green >= 3) return 'green';
  if (counts.red >= 3) return 'red';
  return 'grey';
}

// Returns { natal, aspects, events, scores, categoryReasons }
// categoryReasons: { contacts, money, risk, new_projects, decisions } — arrays of reason strings
async function resolveDayData(profile, date) {
  const natal = profile.natal_chart ?? calculateNatalChart({
    birthDate: profile.birth_date,
    birthTime: profile.birth_time,
    latitude: profile.birth_lat,
    longitude: profile.birth_lng,
  });

  const transits = calculateDailyTransits(date);
  const aspects = detectAspects(natal, transits);
  const events = detectPlanetaryEvents(natal, transits);

  let scores = await getCachedScores(profile.id, date);

  if (!scores) {
    const contactsResult    = scoreContacts(aspects, events);
    const moneyResult       = scoreMoney(aspects, events);
    const riskResult        = scoreRisk(aspects, events);
    const newProjectsResult = scoreNewProjects(aspects, events);
    const decisionsResult   = scoreDecisions(aspects, events);

    scores = {
      contacts:     contactsResult.score,
      money:        moneyResult.score,
      risk:         riskResult.score,
      new_projects: newProjectsResult.score,
      decisions:    decisionsResult.score,
    };
    scores.overall = calcOverall(scores);
    await setCachedScores(profile.id, date, scores);
  }

  // Always recalculate reasons (cheap, not cached).
  const categoryReasons = {
    contacts:     scoreContacts(aspects, events).reasons,
    money:        scoreMoney(aspects, events).reasons,
    risk:         scoreRisk(aspects, events).reasons,
    new_projects: scoreNewProjects(aspects, events).reasons,
    decisions:    scoreDecisions(aspects, events).reasons,
  };

  return { natal, aspects, events, scores, categoryReasons };
}

module.exports = { resolveDayData };
