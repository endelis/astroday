// CRUD for daily_insights and quick_tool_cache tables.
// Cache rule: never regenerate same profile + date + category + time_of_day.
const { getSupabaseClient } = require('./client');

// Returns cached insight text or null if not found.
async function getCachedInsight(profileId, date, category, timeOfDay) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('daily_insights')
    .select('insight_text')
    .eq('profile_id', profileId)
    .eq('date', date)
    .eq('category', category)
    .eq('time_of_day', timeOfDay)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getCachedInsight]', error.message);
    return null;
  }
  return data?.insight_text ?? null;
}

// Stores a generated insight. Upserts to handle any duplicates safely.
async function setCachedInsight(profileId, date, category, timeOfDay, insightText) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('daily_insights')
    .upsert(
      { profile_id: profileId, date, category, time_of_day: timeOfDay, insight_text: insightText, generated_at: new Date().toISOString() },
      { onConflict: 'profile_id,date,category,time_of_day' }
    );

  if (error) console.error('[setCachedInsight]', error.message);
}

// Returns cached quick tool output text or null if not found.
async function getCachedQuickTool(profileId, date, toolType, category) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('quick_tool_cache')
    .select('output_text')
    .eq('profile_id', profileId)
    .eq('date', date)
    .eq('tool_type', toolType)
    .eq('category', category)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getCachedQuickTool]', error.message);
    return null;
  }
  return data?.output_text ?? null;
}

// Stores a quick tool output. Upserts to handle duplicates safely.
async function setCachedQuickTool(profileId, date, toolType, category, outputText) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('quick_tool_cache')
    .upsert(
      { profile_id: profileId, date, tool_type: toolType, category, output_text: outputText, generated_at: new Date().toISOString() },
      { onConflict: 'profile_id,date,tool_type,category' }
    );

  if (error) console.error('[setCachedQuickTool]', error.message);
}

module.exports = { getCachedInsight, setCachedInsight, getCachedQuickTool, setCachedQuickTool };
