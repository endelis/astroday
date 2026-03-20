// Assembles the full context object passed to every Claude API call.

// Determines time-of-day register from the current hour (0–23).
function getTimeOfDay(hour) {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// Top aspects by score — capped at 6 to keep context tight.
function formatAspects(aspects) {
  return aspects.slice(0, 6).map(
    (a) => `${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet} (${a.nature}, orb ${a.orb}°)`
  );
}

// Recent paragraphs as labelled text block for narrative continuity.
function formatRecentParagraphs(recentParagraphs) {
  if (!recentParagraphs || recentParagraphs.length === 0) return null;
  return recentParagraphs
    .map((p) => `${p.date}: ${p.text}`)
    .join('\n\n');
}

// Most recent 5 journal entries as labelled text block.
function formatJournalEntries(journalEntries) {
  if (!journalEntries || journalEntries.length === 0) return null;
  return journalEntries
    .slice(0, 5)
    .map((e) => `${e.date} (${e.forecast_match || 'unrated'}): ${e.entry_text}`)
    .join('\n');
}

// Main assembly function. hour defaults to current system hour if omitted.
function assembleContext({
  profile,
  dailyScores,
  aspects,
  planetaryEvents,
  recentParagraphs = [],
  journalEntries = [],
  date,
  hour,
}) {
  const resolvedHour = hour !== undefined ? hour : new Date().getHours();
  const timeOfDay = getTimeOfDay(resolvedHour);
  const isLateEvening = resolvedHour >= 22;

  return {
    date,
    timeOfDay,
    isLateEvening,
    accuracyTier: profile.accuracy_tier,
    onboarding: {
      workType:   profile.onboarding_work_type   || null,
      focus:      profile.onboarding_focus       || null,
      preference: profile.onboarding_preference  || 'detailed',
      goal:       profile.onboarding_goal        || null,
    },
    scores: {
      overall:     dailyScores.overall,
      contacts:    dailyScores.contacts,
      money:       dailyScores.money,
      risk:        dailyScores.risk,
      newProjects: dailyScores.new_projects,
      decisions:   dailyScores.decisions,
    },
    significantAspects:  formatAspects(aspects),
    activeEvents:        planetaryEvents.activeEvents || [],
    recentParagraphs:    formatRecentParagraphs(recentParagraphs),
    journalEntries:      formatJournalEntries(journalEntries),
  };
}

module.exports = { assembleContext, getTimeOfDay };
