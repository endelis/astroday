// Dashboard shell — auth guard + navigation wrapper for all dashboard pages.
import AuthGuard from '../../components/layout/AuthGuard';
import Navigation from '../../components/layout/Navigation';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <style>{`
        .dash-main { margin-left: var(--nav-width); min-height: 100vh; background-color: var(--bg-primary); }
        @media (max-width: 768px) { .dash-main { margin-left: 0; padding-bottom: 64px; } }
      `}</style>
      <Navigation />
      <main className="dash-main">{children}</main>
    </AuthGuard>
  );
}
