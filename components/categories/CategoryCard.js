// Category card — icon, name, score badge. Click to expand and reveal InsightPanel.
'use client';

const SCORE_STYLES = {
  green: {
    backgroundColor: 'var(--score-green-bg)',
    color: 'var(--score-green)',
    border: '0.5px solid var(--score-green-border)',
  },
  red: {
    backgroundColor: 'var(--score-red-bg)',
    color: 'var(--score-red)',
    border: '0.5px solid var(--score-red-border)',
  },
  grey: {
    backgroundColor: 'var(--score-grey-bg)',
    color: 'var(--score-grey)',
    border: '0.5px solid var(--score-grey-border)',
  },
};

export default function CategoryCard({ icon, label, score, isExpanded, onToggle, children }) {
  const badgeStyle = SCORE_STYLES[score] || SCORE_STYLES.grey;

  return (
    <div
      onClick={onToggle}
      style={{ ...styles.card, ...(isExpanded ? styles.cardExpanded : {}), cursor: 'pointer' }}
    >
      <div style={styles.header}>
        <div style={styles.identity}>
          <span style={styles.icon}>{icon}</span>
          <span style={styles.label}>{label}</span>
        </div>
        <span style={{ ...styles.badge, ...badgeStyle }}>
          {(score || 'grey').replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {isExpanded && (
        <div style={styles.content} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '0.5px solid var(--border-default)',
    borderRadius: 'var(--radius-card)',
    padding: 'var(--space-4) var(--space-5)',
    transition: 'border-color var(--transition-fast)',
  },
  cardExpanded: {
    border: '0.5px solid var(--border-accent)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  identity: {
    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
  },
  icon: { fontSize: '16px' },
  label: {
    fontFamily: 'var(--font-display)', fontSize: 'var(--text-category)', fontWeight: 500,
    color: 'var(--text-primary)',
  },
  badge: {
    fontFamily: 'var(--font-ui)', fontSize: 'var(--text-badge)', fontWeight: 500,
    letterSpacing: 'var(--ls-badge)',
    padding: '3px var(--space-2)',
    borderRadius: 'var(--radius-badge)',
  },
  content: {
    marginTop: 'var(--space-4)',
    borderTop: '0.5px solid var(--border-default)',
    paddingTop: 'var(--space-4)',
  },
};
