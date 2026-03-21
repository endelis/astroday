// Handles the OAuth callback from Supabase — exchanges the auth code for a session.
// Supabase redirects here after Google login completes.
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/db/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error('[auth/callback] Code exchange failed:', error.message);
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
}
