/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://rajjobs.com', // Change to your production URL if needed
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [],
  // Dynamic routes like /exams/[slug] can be handled with additional config if needed
};
