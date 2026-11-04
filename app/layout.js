import './globals.css';
import { getContent } from '../lib/store';
import { siteUrl } from '../lib/site';

export const dynamic = 'force-dynamic';

const safeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export async function generateMetadata() {
  const c = await getContent();
  const s = c.settings || {};
  const base = siteUrl();
  const brand = s.brandName || 'TaskVion';
  const title = s.siteTitle || `${brand} IT Solutions | Property Preservation Back Office Support`;
  const description = s.metaDescription || 'U.S.-focused property preservation back-office support, work order processing, document review, bid preparation, invoicing, BPO and IT solutions.';
  const socialImage = '/opengraph-image';

  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s | ${brand}` },
    description,
    applicationName: brand,
    category: 'business',
    keywords: [
      'property preservation back office support',
      'property preservation work order processing',
      'property preservation BPO services',
      'work order processing outsourcing',
      'property preservation bid processing',
      'property preservation photo and document review',
      'property preservation invoice processing',
      'vendor administration support',
      'real estate back office support',
      'US property preservation support agency'
    ],
    alternates: { canonical: '/' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
    },
    verification: {
      google: '615avidDHiAQZWW5OiJPVMmHbfZwwRAsa6H12GnlOjo'
    },
    openGraph: {
      type: 'website',
      url: base,
      siteName: brand,
      title,
      description,
      locale: 'en_US',
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${brand} — Property Preservation Back Office Support` }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [socialImage] },
    icons: { icon: s.favicon || '/favicon.png', shortcut: s.favicon || '/favicon.png', apple: '/apple-touch-icon.png', other: [{ rel: 'manifest', url: '/site.webmanifest' }] }
  };
}

const validHttpUrl = (value) => /^https:\/\//i.test(value || '');
const absoluteAsset = (value, base) => {
  if (!value) return undefined;
  try { return new URL(value, base).toString(); } catch { return undefined; }
};

export default async function RootLayout({ children }) {
  const c = await getContent();
  const s = c.settings || {};
  const t = c.theme || {};
  const hex = (v, d) => (/^#[0-9a-fA-F]{6}$/.test(v || '') ? v : d);
  const vars = { '--p': hex(t.primary, '#0080fd'), '--d': hex(t.dark, '#03265a'), '--bg': hex(t.background, '#f4f8ff'), '--ink': hex(t.text, '#0a1a33') };
  const base = siteUrl();
  const brand = s.brandName || 'TaskVion';
  const description = s.metaDescription || 'U.S.-focused property preservation back-office support and IT solutions.';
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: brand,
      legalName: s.brandSub ? `${brand} ${s.brandSub}` : brand,
      url: base,
      description,
      ...(absoluteAsset(s.logoFull || s.logoIcon || '/logo-full.png', base) ? { logo: absoluteAsset(s.logoFull || s.logoIcon || '/logo-full.png', base) } : {}),
      ...(s.email && !/yourdomain\.com|example\.com/i.test(s.email) ? { email: s.email } : {}),
      ...(s.phone ? { telephone: s.phone } : {}),
      ...(s.address ? { address: { '@type': 'PostalAddress', addressLocality: s.address, addressCountry: 'BD' } } : {}),
      sameAs: [s.linkedin, s.facebook].filter(validHttpUrl)
    },
    {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      url: base,
      name: brand,
      description,
      publisher: { '@id': `${base}/#organization` },
      inLanguage: 'en'
    },
    ...((c.services && c.services.show) ? (c.services.items || []).map((service, index) => ({
      '@type': 'Service',
      '@id': `${base}/#service-${index + 1}`,
      name: service.title,
      description: service.desc,
      provider: { '@id': `${base}/#organization` },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: service.title
    })) : []),
    ...((c.faq && c.faq.show && Array.isArray(c.faq.items) && c.faq.items.length) ? [{
      '@type': 'FAQPage',
      '@id': `${base}/#faq`,
      mainEntity: c.faq.items.filter(x => x.q && x.a).map(x => ({
        '@type': 'Question', name: x.q,
        acceptedAnswer: { '@type': 'Answer', text: x.a }
      }))
    }] : [])
  ];
  const schema = { '@context': 'https://schema.org', '@graph': graph };

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
