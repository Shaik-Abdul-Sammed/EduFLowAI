export const scraperConfig = {
  googleCseApiKey: process.env.GOOGLE_CSE_API_KEY || '',
  googleCseCx: process.env.GOOGLE_CSE_CX || '',
  userAgent: process.env.SCRAPER_USER_AGENT || 'EduFlowBot/1.0 (+https://eduflow-web.onrender.com/about)',
  maxPages: parseInt(process.env.SCRAPER_MAX_PAGES, 10) || 20,
  timeoutMs: parseInt(process.env.SCRAPER_TIMEOUT_MS, 10) || 15000,
  rateLimitMs: parseInt(process.env.SCRAPER_RATE_LIMIT_MS, 10) || 1000,
};

export default scraperConfig;
