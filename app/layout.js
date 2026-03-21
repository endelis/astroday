// Root layout — loads design system fonts and tokens for all routes.
import './globals.css';
import '../styles/tokens.css';

export const metadata = {
  title: 'Astroday',
  description: 'Personalized business astrology — daily clarity for decisions, timing, and energy.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
