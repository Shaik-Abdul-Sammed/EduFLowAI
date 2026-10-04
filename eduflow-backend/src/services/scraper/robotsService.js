import axios from 'axios';
import robotsParser from 'robots-parser';
import { scraperConfig } from '../../config/scraperConfig.js';
import { isBlockedSocialDomain } from './searchService.js';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const robotsCache = new Map();

/**
 * Clear the in-memory robots cache (useful for testing)
 */
export function clearRobotsCache() {
  robotsCache.clear();
}

/**
 * Checks whether a given URL can be scraped based on legal rules and robots.txt
 *
 * @param {string} targetUrl
 * @returns {Promise<{allowed: boolean, crawlDelay?: number, reason?: string}>}
 */
export async function canScrape(targetUrl) {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { allowed: false, reason: 'Invalid URL provided' };
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { allowed: false, reason: 'Malformed URL provided' };
  }

  // Legal guardrail: blocked social networks
  if (isBlockedSocialDomain(parsed.hostname)) {
    return {
      allowed: false,
      reason: 'Instagram, LinkedIn, and Facebook do not permit automated data collection. Please use their official APIs.',
    };
  }

  const origin = parsed.origin;
  const now = Date.now();

  // Check in-memory cache
  if (robotsCache.has(origin)) {
    const cached = robotsCache.get(origin);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return evaluateRobots(cached.parser, targetUrl);
    }
  }

  const robotsUrl = `${origin}/robots.txt`;
  let robotsText = '';

  try {
    const res = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': scraperConfig.userAgent,
      },
      maxRedirects: 3,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
    });

    if (res.status === 200 && typeof res.data === 'string') {
      robotsText = res.data;
    } else {
      // 404 or empty content defaults to allowing scraping
      robotsText = '';
    }
  } catch (err) {
    if (err.response?.status === 404) {
      robotsText = '';
    } else {
      // Network failure reaching robots.txt: allow conservatively with standard rate limit
      robotsText = '';
    }
  }

  const parser = robotsParser(robotsUrl, robotsText);
  robotsCache.set(origin, {
    parser,
    timestamp: now,
  });

  return evaluateRobots(parser, targetUrl);
}

function evaluateRobots(parser, targetUrl) {
  const userAgent = scraperConfig.userAgent;
  const allowed = parser.isAllowed(targetUrl, userAgent) ?? parser.isAllowed(targetUrl, '*') ?? true;

  if (!allowed) {
    return {
      allowed: false,
      reason: 'Disallowed by robots.txt',
    };
  }

  const delaySec = parser.getCrawlDelay(userAgent) ?? parser.getCrawlDelay('*');
  const crawlDelay = delaySec ? Math.max(1000, Math.round(delaySec * 1000)) : 1000;

  return {
    allowed: true,
    crawlDelay,
  };
}

export default {
  canScrape,
  clearRobotsCache,
};
