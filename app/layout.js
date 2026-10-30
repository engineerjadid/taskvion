import './globals.css';
import { getContent } from '../lib/store';

export const dynamic = 'force-dynamic';

const siteUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  return 'https://taskvion.vercel.app';
};

const safeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export async function generateMetadata() {
  const c = await getContent();
  const s = c.settings || {};
  const base = siteUrl();
  const title = s.siteTitle || `${s.brandName || 'TaskVion'} | IT & BPO Services`;
  const description = s.metaDescription || 'Professional technology and back-office support services.';
  const logo = s.logoFull || s.logoIcon || '/logo-full.png';

  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s | ${s.brandName || 'TaskVion'}` },
    description,
    applicationName: s.brandName || 'TaskVion',
    category: 'business',
    keywords: [
      'property preservation back office support',
      'property preservation work order processing',
      'property preservation BPO services',
      'bid and estimate processing',
      'vendor management support',
      'real estate back office support',
    ],
    alternates: { canonical: '/' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type: 'website',
      url: base,
      siteName: s.brandName || 'TaskVion',
      title,
      description,
      locale: 'en_US',
      images: [{ url: logo, alt: `${s.brandName || 'TaskVion'} logo` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [logo] },
    icons: s.favicon ? { icon: s.favicon, shortcut: s.favicon } : { icon: '/favicon.png' },
  };
}

const hex = (v, d) => (/^#[0-9a-fA-F]{6}$/.test(v || '') ? v : d);

export default async function RootLayout({ children }) {
  const c = await getContent();
  const s = c.settings || {};
  const t = c.theme || {};
  const vars = { '--p': hex(t.primary, '#0080fd'), '--d': hex(t.dark, '#03265a'), '--bg': hex(t.background, '#f4f8ff'), '--ink': hex(t.text, '#0a1a33') };
  const base = siteUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.brandName || 'TaskVion',
    url: base,
    description: s.metaDescription || '',
    ...(s.logoFull ? { logo: new URL(s.logoFull, base).toString() } : {}),
    ...(s.email && !/yourdomain\.com|example\.com/i.test(s.email) ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.address ? { address: { '@type': 'PostalAddress', addressLocality: s.address, addressCountry: 'BD' } } : {}),
    sameAs: [s.linkedin, s.facebook].filter((url) => /^https:\/\//i.test(url || '')),
  };

  return (
    <html lang="en" style={vars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
