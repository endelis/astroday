// Root layout — shell for all routes. Full design system applied in Phase 5.
import './globals.css';

export const metadata = {
  title: 'Astroday',
  description: 'Personalized business astrology — daily clarity for decisions, timing, and energy.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
