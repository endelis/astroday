// CRUD for daily_scores table. Caches calculated scores per profile + date.
const { getSupabaseClient } = require('./client');

// Returns the full scores row for a profile on a given date, or null if not cached.
async function getCachedScores(profileId, date) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('daily_scores')
    .select('overall, contacts, money, risk, new_projects, decisions, calculated_at')
    .eq('profile_id', profileId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getCachedScores]', error.message);
    return null;
  }
  return data ?? null;
}

// Stores calculated scores for a profile + date. Upserts on conflict.
async function setCachedScores(profileId, date, scores) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('daily_scores')
    .upsert(
      {
        profile_id: profileId,
        date,
        overall:      scores.overall,
        contacts:     scores.contacts,
        money:        scores.money,
        risk:         scores.risk,
        new_projects: scores.new_projects,
        decisions:    scores.decisions,
        calculated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,date' }
    );

  if (error) console.error('[setCachedScores]', error.message);
}

module.exports = { getCachedScores, setCachedScores };
