/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://krakenengine.org',
  generateRobotsTxt: true,
  additionalPaths: async () => [
    { loc: '/docs' },
    { loc: '/docs/manual' },
    { loc: '/docs/classes' },
    { loc: '/docs/functions' },
    { loc: '/guides' },
    { loc: '/guides/getting-started' },
    { loc: '/guides/using-the-renderer' },
    { loc: '/guides/implementing-shaders' },
    { loc: '/guides/game-essentials' },
  ],
};
