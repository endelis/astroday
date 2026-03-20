// Creates and memoizes the Supabase service-role client for all server-side db operations.
const { createClient } = require('@supabase/supabase-js');

let client = null;

function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not set');
  }

  client = createClient(url, key);
  return client;
}

// Allows tests to reset the memoized client between test runs.
function resetClient() {
  client = null;
}

module.exports = { getSupabaseClient, resetClient };
