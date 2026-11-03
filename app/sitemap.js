import { siteUrl } from '../lib/site';
import { getContent } from '../lib/store';

export default async function sitemap() {
  const base = siteUrl();
  const c = await getContent();
  const pages = [
    { url: base, changeFrequency: 'weekly', priority: 1 }
  ];
  if (c.privacy && c.privacy.show) {
    pages.push({ url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 });
  }
  return pages;
}
