// Generates quick tool outputs (email opener, what to avoid, action prompt).
// These are utility outputs — practical, specific, not labelled as AI.
const Anthropic = require('@anthropic-ai/sdk');
const { buildSystemPrompt, buildQuickToolPrompt } = require('./prompts');

const MODEL = 'claude-sonnet-4-20250514';
const FALLBACK = 'Tool temporarily unavailable — please try again shortly.';

const VALID_TOOLS = ['email_opener', 'what_to_avoid', 'action_prompt'];
const VALID_CATEGORIES = ['contacts', 'money', 'risk', 'new_projects', 'decisions'];
const VALID_SCORES = ['green', 'red', 'grey'];

// Quick tool outputs are short by design — 150 tokens covers all three types.
const MAX_TOKENS = 150;

// toolType: 'email_opener' | 'what_to_avoid' | 'action_prompt'
// category: one of the 5 scoring categories
// score:    'green' | 'red' | 'grey'
async function generateQuickTool(context, toolType, category, score) {
  if (!VALID_TOOLS.includes(toolType)) {
    throw new Error(`Invalid tool type: ${toolType}`);
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }
  if (!VALID_SCORES.includes(score)) {
    throw new Error(`Invalid score: ${score}`);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const prompt = buildQuickToolPrompt(context, toolType, category, score);
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content[0].text;
  } catch (error) {
    console.error('[generateQuickTool]', error.message);
    return FALLBACK;
  }
}

module.exports = { generateQuickTool };
