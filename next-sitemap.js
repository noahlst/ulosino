// Configuration for the next-sitemap package and robots.txt

module.exports = {
  siteUrl: "https://ulosino.com",
  changefreq: "daily",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
