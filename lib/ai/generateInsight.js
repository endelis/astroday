// Generates a per-category insight by calling the Claude API.
const Anthropic = require('@anthropic-ai/sdk');
const { buildSystemPrompt, buildCategoryInsightPrompt } = require('./prompts');
const { getCachedInsight, setCachedInsight } = require('../db/insights');

const MODEL = 'claude-sonnet-4-20250514';
const FALLBACK = 'Insights temporarily unavailable — your scores are accurate. Full insights will return shortly.';

const VALID_CATEGORIES = ['contacts', 'money', 'risk', 'new_projects', 'decisions'];
const VALID_SCORES = ['green', 'red', 'grey'];

function maxTokens(preference) {
  return preference === 'brief' ? 280 : 650;
}

// category: one of VALID_CATEGORIES
// score:    'green' | 'red' | 'grey'
// reasons:  string[] from the category scorer — the aspects driving the score
// profileId: uuid — used for cache lookup and storage
async function generateInsight(context, category, score, reasons = [], profileId) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }
  if (!VALID_SCORES.includes(score)) {
    throw new Error(`Invalid score: ${score}`);
  }

  const cached = await getCachedInsight(profileId, context.date, category, context.timeOfDay);
  if (cached) return cached;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const prompt = buildCategoryInsightPrompt(context, category, score, reasons);
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens(context.onboarding.preference),
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].text;
    await setCachedInsight(profileId, context.date, category, context.timeOfDay, text);
    return text;
  } catch (error) {
    console.error('[generateInsight]', error.message);
    return FALLBACK;
  }
}

module.exports = { generateInsight };
