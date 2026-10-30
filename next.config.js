/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [{ source: '/admin', destination: '/admin.html' }];
  },
  async headers() {
    return [{ source: '/admin.html', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }, { key: 'Cache-Control', value: 'no-store' }] }];
  },
};
