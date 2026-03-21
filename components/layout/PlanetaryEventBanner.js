// Gold strip shown during active planetary events (retrograde, eclipses, etc.).
// Dismissible per calendar day via sessionStorage — reappears on next day's visit.
'use client';
import { useState, useEffect } from 'react';

export default function PlanetaryEventBanner({ event }) {
  // Start hidden to prevent flash of banner before sessionStorage is read.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!event) return;
    const today = new Date().toISOString().split('T')[0];
    const wasDismissed = sessionStorage.getItem(`astroday_banner_${today}`) === '1';
    setDismissed(wasDismissed);
  }, [event]);

  if (!event || dismissed) return null;

  function dismiss() {
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.setItem(`astroday_banner_${today}`, '1');
    setDismissed(true);
  }

  return (
    <div style={styles.banner}>
      <span style={styles.text}>{event}</span>
      <button onClick={dismiss} style={styles.close} aria-label="Dismiss">×</button>
    </div>
  );
}

const styles = {
  banner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: 'var(--space-3) var(--space-6)',
    backgroundColor: 'var(--gold)',
    marginBottom: 'var(--space-6)',
    borderRadius: 'var(--radius-button)',
  },
  text: {
    fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', fontWeight: 500,
    color: 'var(--bg-primary)',
  },
  close: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '18px', lineHeight: 1, padding: 'var(--space-1)',
    color: 'var(--bg-primary)',
  },
};
