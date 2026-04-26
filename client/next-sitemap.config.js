/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://skillswap.io',
  generateRobotsTxt: true,
  exclude: ['/chat', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/chat', '/api/*'],
      },
    ],
  },
};
