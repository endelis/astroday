// All prompt templates for Claude API calls. Never use the word "AI" in any output.

const CAVEAT = 'Astrology reveals tendency, not destiny — you always have the final word.';

const ACCURACY_NOTES = {
  good:  'Note at the end: this reading is based on birth date and location. Adding birth time would improve accuracy.',
  basic: 'Note at the end: this reading is based on birth date only. Adding birth time and location would significantly improve accuracy.',
};

const TIME_INSTRUCTIONS = {
  morning:   'Write forward-looking — here is what today holds and how to approach it. Be orienting.',
  afternoon: 'Write in present tense — here is how the day is unfolding and what the evening window looks like.',
  evening:   'Write reflectively — here is what today was about and what it means in context.',
};

function buildSystemPrompt() {
  return `You are a trusted personal advisor with deep knowledge of how planetary configurations affect business timing and energy. You have known this person for years. You speak directly and plainly — not like a fortune teller.

Rules:
- Write in second person (you, your)
- Be practical and specific, never vague or mystical
- Never identify yourself as a software system, algorithm, or automated tool
- Never make specific financial or legal predictions
- Tone: a trusted advisor who tells the truth, including on hard days
- End every insight with exactly: "${CAVEAT}"`;
}

function scoreBlock(scores) {
  return `Today's scores — Contacts: ${scores.contacts}, Money: ${scores.money}, Risk: ${scores.risk}, New Projects: ${scores.newProjects}, Decisions: ${scores.decisions}, Overall: ${scores.overall}`;
}

function contextBlock(context) {
  const lines = [
    `Date: ${context.date}`,
    `Work type: ${context.onboarding.workType || 'not specified'}`,
    `Focus area: ${context.onboarding.focus || 'not specified'}`,
    `Insight preference: ${context.onboarding.preference === 'brief' ? 'brief (1 paragraph, single action)' : 'detailed (2–3 paragraphs)'}`,
    scoreBlock(context.scores),
    `Active planetary aspects: ${context.significantAspects.join(' | ') || 'none'}`,
  ];
  if (context.activeEvents.length > 0) lines.push(`Active planetary events: ${context.activeEvents.join(', ')}`);
  if (context.recentParagraphs) lines.push(`\nRecent daily readings (for continuity):\n${context.recentParagraphs}`);
  if (context.journalEntries)   lines.push(`\nThis person's recent journal observations:\n${context.journalEntries}`);
  return lines.join('\n');
}

function buildDailyParagraphPrompt(context) {
  const timeNote = TIME_INSTRUCTIONS[context.timeOfDay];
  const lateNote = context.isLateEvening ? ' It is late evening — begin bridging gently toward tomorrow.' : '';
  const accuracyNote = ACCURACY_NOTES[context.accuracyTier] || '';

  return `${contextBlock(context)}

${timeNote}${lateNote}

Write a single synthesised reading for today that gives one human view across all categories. This is the headline — the scores are the supporting detail. Do not list scores explicitly. Make it feel written specifically for this person.${accuracyNote ? '\n' + accuracyNote : ''}

End with: "${CAVEAT}"`;
}

function buildCategoryInsightPrompt(context, category, score, reasons) {
  const scoreGuidance = {
    green: 'Explain why this area is favourable today and what specifically to do with it.',
    red:   'Explain the tension clearly and what to avoid or postpone. Be honest without being alarming.',
    grey:  'Find something purposeful — an upcoming window, a pattern worth noticing, or a reflective prompt. Never suggest there is nothing worth saying.',
  };

  return `${contextBlock(context)}

Category: ${category}
Score: ${score}
Driving aspects: ${reasons.join(', ') || 'none significant'}

${scoreGuidance[score]}

End with one concrete actionable suggestion specific to this category and this person's work type.
End the final sentence with: "${CAVEAT}"`;
}

function buildQuickToolPrompt(context, toolType, category, score) {
  const tools = {
    email_opener: `Write a short email opening line (2–3 sentences max) that reflects today's ${category} energy (${score}). Practical and specific to today's conditions. No greetings, no sign-offs — just the opening content.`,
    what_to_avoid: `List 2–3 specific things to avoid today in the area of ${category} given the ${score} conditions. Be concrete and practical. Each item one sentence.`,
    action_prompt: `Give one specific action to take today in the area of ${category} that makes the most of today's ${score} conditions. One sentence. Direct and actionable.`,
  };

  return `${contextBlock(context)}
Category: ${category}, Score: ${score}

${tools[toolType]}`;
}

module.exports = {
  buildSystemPrompt,
  buildDailyParagraphPrompt,
  buildCategoryInsightPrompt,
  buildQuickToolPrompt,
  CAVEAT,
};
