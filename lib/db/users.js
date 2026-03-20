// CRUD for users table. All user lookups and updates go through here.
const { getSupabaseClient } = require('./client');

async function getUserById(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, created_at, subscription_tier, subscription_status, stripe_customer_id, trial_ends_at, onboarding_complete')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getUserById]', error.message);
    return null;
  }
  return data ?? null;
}

async function getUserByEmail(email) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, created_at, subscription_tier, subscription_status, stripe_customer_id, trial_ends_at, onboarding_complete')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[getUserByEmail]', error.message);
    return null;
  }
  return data ?? null;
}

async function createUser(email) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert({ email, subscription_tier: 'free', subscription_status: 'trialing' })
    .select('id, email, created_at, subscription_tier, subscription_status, stripe_customer_id, trial_ends_at, onboarding_complete')
    .single();

  if (error) {
    console.error('[createUser]', error.message);
    return null;
  }
  return data ?? null;
}

async function updateUser(userId, fields) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', userId)
    .select('id, email, created_at, subscription_tier, subscription_status, stripe_customer_id, trial_ends_at, onboarding_complete')
    .single();

  if (error) {
    console.error('[updateUser]', error.message);
    return null;
  }
  return data ?? null;
}

module.exports = { getUserById, getUserByEmail, createUser, updateUser };
