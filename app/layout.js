import './globals.css';
import { getContent } from '../lib/store';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const c = await getContent(); const s = c.settings || {};
  return { title: s.siteTitle, description: s.metaDescription, icons: s.favicon ? { icon: s.favicon } : undefined };
}
const hex = (v, d) => (/^#[0-9a-fA-F]{6}$/.test(v || '') ? v : d);
export default async function RootLayout({ children }) {
  const c = await getContent(); const t = c.theme || {};
  const vars = { '--p': hex(t.primary, '#0080fd'), '--d': hex(t.dark, '#03265a'), '--bg': hex(t.background, '#f4f8ff'), '--ink': hex(t.text, '#0a1a33') };
  return (
    <html lang="en" style={vars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
