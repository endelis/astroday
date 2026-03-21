// 7-day week bar chart. Today gets a gold border ring. Past days render at 60% opacity.
'use client';

const SCORE_COLORS = {
  green: 'var(--score-green)',
  red:   'var(--score-red)',
  grey:  'var(--score-grey)',
};

function formatDay(dateStr) {
  // Parse as noon local time to avoid UTC offset shifting the day.
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
}

export default function WeekBarChart({ weekScores }) {
  if (!weekScores || weekScores.length === 0) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <p style={styles.label}>This week</p>
      <div style={styles.chart}>
        {weekScores.map(day => {
          const isToday  = day.date === today;
          const isPast   = day.date < today;
          const color    = SCORE_COLORS[day.overall] || SCORE_COLORS.grey;

          return (
            <div key={day.date} style={styles.barWrapper}>
              <div
                style={{
                  ...styles.bar,
                  backgroundColor: color,
                  opacity: isPast ? 0.6 : 1,
                  border: isToday ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'opacity var(--transition-fast)',
                }}
              />
              <span style={{ ...styles.dayLabel, ...(isToday ? styles.dayLabelToday : {}) }}>
                {formatDay(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container:    { marginTop: 'var(--space-8)' },
  label:        { fontSize: 'var(--text-label)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', fontFamily: 'var(--font-ui)', marginBottom: 'var(--space-4)' },
  chart:        { display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' },
  barWrapper:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', flex: 1 },
  bar:          { width: '100%', height: '40px', borderRadius: 'var(--radius-badge)' },
  dayLabel:     { fontSize: 'var(--text-label)', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' },
  dayLabelToday: { color: 'var(--gold)' },
};
