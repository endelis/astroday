// Register page — email/password signup. Redirects to /onboarding after signup.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../lib/db/browser';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    router.push('/onboarding');
  }

  async function handleGoogleSignup() {
    setError('');
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (authError) setError(authError.message);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.appName}>Astroday</p>
        <h1 style={styles.heading}>Start your 7-day free trial</h1>
        <p style={styles.subheading}>No credit card required.</p>

        <button onClick={handleGoogleSignup} style={styles.oauthButton}>
          Continue with Google
        </button>

        <div style={styles.divider}><span style={styles.dividerText}>or</span></div>

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required style={styles.input} placeholder="you@example.com"
          />
          <label style={styles.label}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={8} style={styles.input} placeholder="At least 8 characters"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-6)' },
  card: { width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-secondary)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 'var(--space-8)' },
  appName: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 600, color: 'var(--gold)', marginBottom: 'var(--space-1)', textAlign: 'center' },
  heading: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)', textAlign: 'center' },
  subheading: { color: 'var(--text-muted)', fontSize: 'var(--text-small)', textAlign: 'center', marginBottom: 'var(--space-6)' },
  oauthButton: { width: '100%', padding: 'var(--space-3) var(--space-4)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-button)', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', cursor: 'pointer', transition: 'var(--transition-fast)', backgroundColor: 'transparent', marginBottom: 'var(--space-4)' },
  divider: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' },
  dividerText: { color: 'var(--text-muted)', fontSize: 'var(--text-small)', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' },
  label: { fontSize: 'var(--text-label)', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)' },
  input: { padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--bg-tertiary)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-button)', color: 'var(--text-primary)', outline: 'none', marginBottom: 'var(--space-2)', width: '100%' },
  primaryButton: { marginTop: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', border: '0.5px solid var(--gold)', borderRadius: 'var(--radius-button)', color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', fontWeight: 500, cursor: 'pointer', backgroundColor: 'transparent', transition: 'var(--transition-fast)', width: '100%' },
  error: { color: 'var(--score-red)', fontSize: 'var(--text-small)', marginTop: 'var(--space-1)' },
  footer: { marginTop: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-small)' },
  link: { color: 'var(--gold)' },
};
