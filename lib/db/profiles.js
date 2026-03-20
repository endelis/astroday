// CRUD for profiles table. Each user can have multiple natal chart profiles.
const { getSupabaseClient } = require('./client');

const PROFILE_FIELDS = 'id, user_id, label, birth_date, birth_time, birth_city, birth_lat, birth_lng, natal_chart, accuracy_tier, is_primary, onboarding_work_type, onboarding_focus, onboarding_preference, onboarding_goal, created_at';

async function getProfileById(profileId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', profileId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getProfileById]', error.message);
    return null;
  }
  return data ?? null;
}

async function getProfilesByUserId(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });

  if (error) {
    console.error('[getProfilesByUserId]', error.message);
    return [];
  }
  return data ?? [];
}

async function getPrimaryProfile(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getPrimaryProfile]', error.message);
    return null;
  }
  return data ?? null;
}

async function createProfile(userId, profileData) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, ...profileData })
    .select(PROFILE_FIELDS)
    .single();

  if (error) {
    console.error('[createProfile]', error.message);
    return null;
  }
  return data ?? null;
}

async function updateProfile(profileId, fields) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', profileId)
    .select(PROFILE_FIELDS)
    .single();

  if (error) {
    console.error('[updateProfile]', error.message);
    return null;
  }
  return data ?? null;
}

module.exports = { getProfileById, getProfilesByUserId, getPrimaryProfile, createProfile, updateProfile };
