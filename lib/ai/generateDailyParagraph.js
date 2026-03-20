// Generates the daily overall paragraph by calling the Claude API.
const Anthropic = require('@anthropic-ai/sdk');
const { buildSystemPrompt, buildDailyParagraphPrompt } = require('./prompts');
const { getCachedInsight, setCachedInsight } = require('../db/insights');

const MODEL = 'claude-sonnet-4-20250514';
const FALLBACK = 'Insights temporarily unavailable — your scores are accurate. Full insights will return shortly.';

// Max tokens by preference: brief = 1 paragraph, detailed = 2–3 paragraphs.
function maxTokens(preference) {
  return preference === 'brief' ? 350 : 750;
}

// profileId: uuid — used for cache lookup and storage
async function generateDailyParagraph(context, profileId) {
  const cached = await getCachedInsight(profileId, context.date, 'overall', context.timeOfDay);
  if (cached) return cached;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const prompt = buildDailyParagraphPrompt(context);
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens(context.onboarding.preference),
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].text;
    await setCachedInsight(profileId, context.date, 'overall', context.timeOfDay, text);
    return text;
  } catch (error) {
    console.error('[generateDailyParagraph]', error.message);
    return FALLBACK;
  }
}

module.exports = { generateDailyParagraph };
