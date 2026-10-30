const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://taskvion.vercel.app').replace(/\/$/, '');

export default function sitemap() {
  return [{ url: siteUrl(), changeFrequency: 'weekly', priority: 1 }];
}
