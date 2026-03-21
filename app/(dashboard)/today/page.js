// Today view — daily paragraph, 5 category cards, week bar chart.
'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/db/browser';
import PlanetaryEventBanner from '../../../components/layout/PlanetaryEventBanner';
import CategoryCard          from '../../../components/categories/CategoryCard';
import InsightPanel          from '../../../components/categories/InsightPanel';
import WeekBarChart          from '../../../components/categories/WeekBarChart';

const CATEGORIES = [
  { key: 'contacts',     label: 'Contacts',     icon: '📬', index: 0 },
  { key: 'money',        label: 'Money',         icon: '💰', index: 1 },
  { key: 'risk',         label: 'Risk',          icon: '⚡', index: 2 },
  { key: 'new_projects', label: 'New Projects',  icon: '🌱', index: 3 },
  { key: 'decisions',    label: 'Decisions',     icon: '📋', index: 4 },
];

function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

function getWeekDates() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 3 + i);
    return d.toISOString().split('T')[0];
  });
}

export default function TodayPage() {
  const [token, setToken]               = useState(null);
  const [profileId, setProfileId]       = useState(null);
  const [isPro, setIsPro]               = useState(false);
  const [scores, setScores]             = useState(null);
  const [paragraph, setParagraph]       = useState('');
  const [weekScores, setWeekScores]     = useState([]);
  const [expandedCategory, setExpanded] = useState(null);

  const today     = new Date().toISOString().split('T')[0];
  const timeOfDay = getTimeOfDay();
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    async function init() {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const accessToken = session.access_token;
      setToken(accessToken);

      const { data: userData } = await supabase
        .from('users').select('subscription_tier').eq('id', session.user.id).single();
      setIsPro(userData?.subscription_tier === 'pro');

      const { data: profile } = await supabase
        .from('profiles').select('id').eq('user_id', session.user.id).eq('is_primary', true).single();
      if (!profile) return;
      setProfileId(profile.id);

      const headers = { Authorization: `Bearer ${accessToken}` };
      const pid = profile.id;

      const [scoresRes, paraRes, weekRes] = await Promise.all([
        fetch(`/api/scores?profileId=${pid}&dates=${today}`, { headers }),
        fetch(`/api/paragraph?profileId=${pid}&date=${today}&timeOfDay=${timeOfDay}`, { headers }),
        fetch(`/api/scores?profileId=${pid}&dates=${getWeekDates().join(',')}`, { headers }),
      ]);

      if (scoresRes.ok) {
        const data = await scoresRes.json();
        setScores(data.scores?.[today] || null);
      }
      if (paraRes.ok) {
        const data = await paraRes.json();
        setParagraph(data.paragraph || '');
      }
      if (weekRes.ok) {
        const data = await weekRes.json();
        const weekDates = getWeekDates();
        setWeekScores(weekDates.map(date => ({ date, overall: data.scores?.[date]?.overall || 'grey' })));
      }
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const overall   = scores?.overall || 'grey';
  const warmthBg  = overall === 'green' ? 'rgba(76,175,122,0.025)' : overall === 'red' ? 'rgba(224,92,92,0.025)' : 'transparent';

  return (
    <div style={styles.page}>
      <div style={{ ...styles.warmthOverlay, backgroundColor: warmthBg }} />
      <div style={styles.content}>
        <PlanetaryEventBanner event={null} />

        <p style={styles.dateLabel}>{dateLabel}</p>

        {paragraph
          ? <p style={styles.paragraph}>{paragraph}</p>
          : <p style={styles.paragraphPlaceholder}>Calculating your chart for today…</p>
        }

        <div style={styles.categoryList}>
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              score={scores?.[cat.key] || 'grey'}
              isExpanded={expandedCategory === cat.key}
              onToggle={() => setExpanded(prev => prev === cat.key ? null : cat.key)}
            >
              {token && profileId && (
                <InsightPanel
                  categoryKey={cat.key}
                  categoryIndex={cat.index}
                  date={today}
                  profileId={profileId}
                  token={token}
                  isPro={isPro}
                  timeOfDay={timeOfDay}
                />
              )}
            </CategoryCard>
          ))}
        </div>

        <WeekBarChart weekScores={weekScores} />
      </div>
    </div>
  );
}

const styles = {
  page:                { minHeight: '100vh', position: 'relative' },
  warmthOverlay:       { position: 'fixed', inset: 0, pointerEvents: 'none', transition: 'background-color var(--transition-bg)', zIndex: 0 },
  content:             { position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' },
  dateLabel:           { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-label)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-6)' },
  paragraph:           { fontFamily: 'var(--font-display)', fontSize: 'var(--text-paragraph)', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 'var(--lh-paragraph)', marginBottom: 'var(--space-8)' },
  paragraphPlaceholder: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-section)', color: 'var(--text-muted)', lineHeight: 'var(--lh-paragraph)', marginBottom: 'var(--space-8)' },
  categoryList:        { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' },
};
