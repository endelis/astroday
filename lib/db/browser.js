// Supabase browser client — for use in client components ('use client') only.
// Uses the anon key; relies on Supabase Auth for user-level access.
import { createBrowserClient } from '@supabase/ssr';

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
