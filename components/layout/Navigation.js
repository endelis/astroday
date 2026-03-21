// Left sidebar navigation (desktop) and bottom tab bar (mobile).
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard/today',    label: 'Today'    },
  { href: '/dashboard/calendar', label: 'Calendar' },
  { href: '/dashboard/journal',  label: 'Journal'  },
  { href: '/dashboard/profile',  label: 'Profile'  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .nav-sidebar  { display: flex; }
        .nav-bottom   { display: none; }
        @media (max-width: 768px) {
          .nav-sidebar { display: none; }
          .nav-bottom  { display: flex; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <nav className="nav-sidebar" style={styles.sidebar}>
        <p style={styles.brand}>Astroday</p>
        <div style={styles.navList}>
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
              >
                {active && <span style={styles.activeDot} />}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="nav-bottom" style={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ ...styles.bottomItem, ...(active ? styles.bottomItemActive : {}) }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed', left: 0, top: 0, bottom: 0,
    width: 'var(--nav-width)',
    flexDirection: 'column',
    padding: 'var(--space-8) var(--space-6)',
    backgroundColor: 'var(--bg-primary)',
    borderRight: '0.5px solid var(--border-default)',
    zIndex: 10,
  },
  brand: {
    fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 600,
    color: 'var(--gold)', marginBottom: 'var(--space-10)',
  },
  navList:      { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-button)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)',
    textDecoration: 'none', transition: 'color var(--transition-fast)',
  },
  navItemActive: { color: 'var(--gold)' },
  activeDot: {
    width: '4px', height: '4px', borderRadius: '50%',
    backgroundColor: 'var(--gold)', flexShrink: 0,
  },
  bottomNav: {
    position: 'fixed', left: 0, right: 0, bottom: 0,
    height: '60px',
    borderTop: '0.5px solid var(--border-default)',
    backgroundColor: 'var(--bg-primary)',
    justifyContent: 'space-around', alignItems: 'center',
    zIndex: 10,
  },
  bottomItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-ui)', fontSize: 'var(--text-small)',
    textDecoration: 'none', padding: 'var(--space-2)',
  },
  bottomItemActive: { color: 'var(--gold)' },
};
