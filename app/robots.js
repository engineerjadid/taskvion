import { siteUrl } from '../lib/site';

export default function robots() {
  const base = siteUrl();
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin.html', '/api/'] }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
