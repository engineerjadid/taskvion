export const siteUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taskvionit.com';
  return configured.trim().replace(/\/$/, '');
};
