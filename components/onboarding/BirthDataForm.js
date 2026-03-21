// Birth data entry — final onboarding step. Saves profile to Supabase on submit.
// Shows accuracy tier message based on data provided.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../lib/db/browser';

const ACCURACY_MESSAGES = {
  full:  'Full accuracy — your readings will include rising sign and house placements.',
  good:  'Good accuracy — adding your birth time would further improve precision.',
  basic: 'Basic accuracy — readings are based on your Sun sign. Adding birth time and location improves this significantly.',
};

function getAccuracyTier(birthTime, birthCity) {
  if (birthTime && birthCity) return 'full';
  if (birthCity) return 'good';
  return 'basic';
}

function mapPreference(displayValue) {
  return displayValue === 'Direct and brief' ? 'brief' : 'detailed';
}

export default function BirthDataForm({ quizAnswers, onComplete }) {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const accuracyTier = getAccuracyTier(birthTime, birthCity);

  async function handleSave(e) {
    e.preventDefault();
    if (!birthDate) { setError('Birth date is required.'); return; }
    setError('');
    setSaving(true);

    const supabase = getSupabaseBrowserClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { setError('Session expired. Please log in again.'); setSaving(false); return; }

    // Ensure user record exists in our users table.
    await supabase.from('users').upsert(
      { id: user.id, email: user.email },
      { onConflict: 'id' }
    );

    // Create the primary profile with all onboarding data.
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id:                user.id,
      label:                  'My Chart',
      birth_date:             birthDate,
      birth_time:             birthTime || null,
      birth_city:             birthCity || null,
      accuracy_tier:          accuracyTier,
      is_primary:             true,
      onboarding_work_type:   quizAnswers.workType,
      onboarding_focus:       quizAnswers.focus,
      onboarding_preference:  mapPreference(quizAnswers.preference),
      onboarding_goal:        quizAnswers.goal || null,
    });

    if (profileError) { setError('Could not save your profile. Please try again.'); setSaving(false); return; }

    // Mark onboarding complete.
    await supabase.from('users').update({ onboarding_complete: true }).eq('id', user.id);

    onComplete();
    router.push('/dashboard');
  }

  return (
    <>
      <h1 style={styles.heading}>One last thing</h1>
      <p style={styles.subheading}>Your birth date unlocks your personal chart. Everything else improves the precision.</p>

      <form onSubmit={handleSave} style={styles.form}>
        <label style={styles.label}>Birth date <span style={styles.required}>required</span></label>
        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required style={styles.input} />

        <label style={styles.label}>Birth time <span style={styles.optional}>optional</span></label>
        <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} style={styles.input} />
        <p style={styles.hint}>Find it on your birth certificate if you can.</p>

        <label style={styles.label}>Birth city <span style={styles.optional}>optional</span></label>
        <input type="text" value={birthCity} onChange={e => setBirthCity(e.target.value)} style={styles.input} placeholder="e.g. Riga, Latvia" />

        {birthDate && (
          <div style={styles.accuracyCard}>
            <p style={styles.accuracyTier}>{accuracyTier.charAt(0).toUpperCase() + accuracyTier.slice(1)} accuracy</p>
            <p style={styles.accuracyText}>{ACCURACY_MESSAGES[accuracyTier]}</p>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.primaryButton} disabled={saving}>
          {saving ? 'Saving…' : 'Show me my chart'}
        </button>
      </form>
    </>
  );
}

const styles = {
  heading: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)', lineHeight: 'var(--lh-display)' },
  subheading: { color: 'var(--text-secondary)', fontSize: 'var(--text-body)', marginBottom: 'var(--space-6)', lineHeight: 'var(--lh-body)' },
  form: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' },
  label: { fontSize: 'var(--text-label)', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' },
  required: { color: 'var(--gold)', textTransform: 'none', letterSpacing: 0, fontSize: 'var(--text-small)', fontWeight: 400 },
  optional: { color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, fontSize: 'var(--text-small)', fontWeight: 400 },
  input: { padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--bg-tertiary)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-button)', color: 'var(--text-primary)', width: '100%', marginBottom: 'var(--space-1)', outline: 'none' },
  hint: { color: 'var(--text-muted)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-2)' },
  accuracyCard: { marginTop: 'var(--space-2)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-tertiary)', border: '0.5px solid var(--border-subtle)', borderRadius: 'var(--radius-button)', marginBottom: 'var(--space-2)' },
  accuracyTier: { fontSize: 'var(--text-label)', fontWeight: 500, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-1)' },
  accuracyText: { color: 'var(--text-secondary)', fontSize: 'var(--text-small)', lineHeight: 'var(--lh-body)' },
  error: { color: 'var(--score-red)', fontSize: 'var(--text-small)' },
  primaryButton: { marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', border: '0.5px solid var(--gold)', borderRadius: 'var(--radius-button)', color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', fontWeight: 500, cursor: 'pointer', backgroundColor: 'transparent', width: '100%' },
};
