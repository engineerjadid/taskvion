export default async function robots() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://taskvion.vercel.app').replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin.html', '/api/'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
