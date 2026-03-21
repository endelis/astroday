// Insight text and quick tools for one category. Blurs content for free users.
// Free users see 1 rotating category unlocked per day (day-of-year mod 5).
'use client';
import { useState, useEffect } from 'react';

const CATEGORY_ORDER = ['contacts', 'money', 'risk', 'new_projects', 'decisions'];
const TOOL_LABELS    = { email_opener: 'Email opener', what_to_avoid: 'What to avoid', action_prompt: 'Action prompt' };

function freeUnlockIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return dayOfYear % 5;
}

export default function InsightPanel({ categoryKey, categoryIndex, date, profileId, token, isPro, timeOfDay }) {
  const [insight, setInsight]         = useState('');
  const [tools, setTools]             = useState({});
  const [activeToolType, setActiveTool] = useState(null);
  const [loading, setLoading]         = useState(true);

  const canView = isPro || freeUnlockIndex() === categoryIndex;

  useEffect(() => {
    if (!token || !profileId) return;
    fetch(`/api/insights?profileId=${profileId}&date=${date}&category=${categoryKey}&timeOfDay=${timeOfDay}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setInsight(data.insight || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, profileId, date, categoryKey, timeOfDay]);

  async function fetchTool(toolType) {
    if (!isPro || !profileId) return;
    if (tools[toolType]) { setActiveTool(toolType); return; }
    const r = await fetch(`/api/tools?profileId=${profileId}&date=${date}&category=${categoryKey}&toolType=${toolType}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    setTools(prev => ({ ...prev, [toolType]: data.output || '' }));
    setActiveTool(toolType);
  }

  if (loading) return <p style={styles.muted}>Loading…</p>;

  if (!canView) {
    return (
      <div style={styles.lockedWrapper}>
        <p style={styles.blurred}>{insight.slice(0, 140) || 'Your insight for today is ready.'}</p>
        <div style={styles.overlay}>
          <p style={styles.upgradeText}>Upgrade to Pro to read your full insight.</p>
          <a href="/dashboard/upgrade" style={styles.upgradeLink}>Unlock Pro</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={styles.insightText}>{insight}</p>

      {isPro && (
        <div style={styles.toolsSection}>
          <p style={styles.toolsLabel}>Quick tools</p>
          <div style={styles.toolButtons}>
            {Object.entries(TOOL_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => fetchTool(type)}
                style={{ ...styles.toolButton, ...(activeToolType === type ? styles.toolButtonActive : {}) }}
              >
                {label}
              </button>
            ))}
          </div>
          {activeToolType && tools[activeToolType] && (
            <p style={styles.toolOutput}>{tools[activeToolType]}</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  muted:           { color: 'var(--text-muted)', fontSize: 'var(--text-body)', fontFamily: 'var(--font-ui)' },
  lockedWrapper:   { position: 'relative', minHeight: '80px', overflow: 'hidden' },
  blurred:         { color: 'var(--text-secondary)', fontSize: 'var(--text-body)', lineHeight: 'var(--lh-body)', fontFamily: 'var(--font-ui)', filter: 'blur(4px)', userSelect: 'none' },
  overlay:         { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' },
  upgradeText:     { color: 'var(--text-primary)', fontSize: 'var(--text-body)', fontFamily: 'var(--font-ui)', textAlign: 'center' },
  upgradeLink:     { color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', border: '0.5px solid var(--gold)', borderRadius: 'var(--radius-button)', padding: 'var(--space-2) var(--space-4)', textDecoration: 'none' },
  insightText:     { color: 'var(--text-secondary)', fontSize: 'var(--text-body)', lineHeight: 'var(--lh-body)', fontFamily: 'var(--font-ui)' },
  toolsSection:    { marginTop: 'var(--space-5)' },
  toolsLabel:      { fontSize: 'var(--text-label)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-ui)' },
  toolButtons:     { display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' },
  toolButton:      { padding: 'var(--space-2) var(--space-3)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-button)', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-small)', cursor: 'pointer', backgroundColor: 'transparent' },
  toolButtonActive: { border: '0.5px solid var(--gold-subtle)', color: 'var(--gold)' },
  toolOutput:      { color: 'var(--text-secondary)', fontSize: 'var(--text-body)', lineHeight: 'var(--lh-body)', fontFamily: 'var(--font-ui)', fontStyle: 'italic' },
};
