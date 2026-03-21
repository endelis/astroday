// AuthGuard — server component. Wraps protected pages and redirects to /login if no session.
// Usage: wrap any server page export with <AuthGuard>{children}</AuthGuard>
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '../../lib/db/server';

export default async function AuthGuard({ children }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return children;
}
