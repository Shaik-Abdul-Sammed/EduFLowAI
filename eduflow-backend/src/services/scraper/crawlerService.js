import axios from 'axios';
import * as cheerio from 'cheerio';
import { scraperConfig } from '../../config/scraperConfig.js';
import { canScrape } from './robotsService.js';

const PRIORITY_KEYWORDS = [
  '/about',
  '/about-us',
  '/courses',
  '/programs',
  '/academics',
  '/admissions',
  '/fee',
  '/fees',
  '/faculty',
  '/departments',
  '/contact',
  '/placements',
  '/facilities',
  '/infrastructure',
];

const IGNORED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.xlsx',
  '.xls',
  '.zip',
  '.rar',
  '.tar',
  '.gz',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.mp4',
  '.mp3',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if a URL should be skipped based on file extension
 */
export function hasIgnoredExtension(pathname = '') {
  const lower = pathname.toLowerCase();
  return IGNORED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Normalizes an internal link against a base URL
 */
export function normalizeLink(href, currentUrl, baseHostname) {
  if (!href) return null;
  const cleanHref = href.trim();
  if (
    cleanHref.startsWith('#') ||
    cleanHref.startsWith('javascript:') ||
    cleanHref.startsWith('mailto:') ||
    cleanHref.startsWith('tel:')
  ) {
    return null;
  }

  try {
    const resolved = new URL(cleanHref, currentUrl);
    // Strict domain check: must match base hostname
    if (resolved.hostname.toLowerCase() !== baseHostname.toLowerCase()) {
      return null;
    }
    // Filter out file extensions
    if (hasIgnoredExtension(resolved.pathname)) {
      return null;
    }
    // Remove hash and trailing slash for deduplication
    resolved.hash = '';
    let normalized = resolved.toString();
    if (normalized.endsWith('/') && resolved.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Scores a URL path to prioritize important institutional pages
 */
function getPathPriority(pathname) {
  const lower = pathname.toLowerCase();
  for (let i = 0; i < PRIORITY_KEYWORDS.length; i++) {
    if (lower.includes(PRIORITY_KEYWORDS[i])) {
      return PRIORITY_KEYWORDS.length - i;
    }
  }
  return 0;
}

/**
 * Crawls public institutional pages within the same domain
 *
 * @param {string} baseUrl
 * @param {number} maxPages
 * @returns {Promise<Array<{url: string, title: string, text: string, wordCount: number}>>}
 */
export async function crawlWebsite(baseUrl, maxPages = 20) {
  if (!baseUrl) throw new Error('Base URL is required');

  const parsedBase = new URL(baseUrl);
  const baseHostname = parsedBase.hostname;
  const maxToVisit = Math.min(maxPages, scraperConfig.maxPages);

  const visited = new Set();
  const queue = [{ url: baseUrl, priority: 100 }];
  const pages = [];

  while (queue.length > 0 && pages.length < maxToVisit) {
    // Sort queue by priority descending
    queue.sort((a, b) => b.priority - a.priority);
    const current = queue.shift();
    const currentUrl = current.url;

    if (visited.has(currentUrl)) {
      continue;
    }
    visited.add(currentUrl);

    // Robots.txt check
    const robotsCheck = await canScrape(currentUrl);
    if (!robotsCheck.allowed) {
      continue;
    }

    try {
      const response = await axios.get(currentUrl, {
        headers: {
          'User-Agent': scraperConfig.userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
        timeout: scraperConfig.timeoutMs,
        maxContentLength: 5 * 1024 * 1024, // 5 MB max
        validateStatus: (status) => status === 200,
      });

      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        continue;
      }

      const html = typeof response.data === 'string' ? response.data : '';
      if (!html) continue;

      const $ = cheerio.load(html);

      // Extract title and meta
      const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled Page';
      const metaDesc =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '';

      // Remove unwanted elements
      $('script, style, nav, footer, noscript, svg, iframe, form').remove();

      // Extract clean text content
      const bodyText = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      const combinedText = metaDesc ? `${metaDesc}. ${bodyText}` : bodyText;
      const words = combinedText.split(/\s+/).filter(Boolean);

      pages.push({
        url: currentUrl,
        title,
        text: combinedText,
        wordCount: words.length,
      });

      // Find internal links to expand queue
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const normalized = normalizeLink(href, currentUrl, baseHostname);
        if (normalized && !visited.has(normalized)) {
          const priority = getPathPriority(new URL(normalized).pathname);
          queue.push({ url: normalized, priority });
        }
      });
    } catch {
      // Gracefully continue crawling other pages if a specific URL fails
    }

    // Rate limiting: 1 second delay between requests
    if (pages.length < maxToVisit && queue.length > 0) {
      const delayMs = robotsCheck.crawlDelay || scraperConfig.rateLimitMs || 1000;
      await sleep(delayMs);
    }
  }

  return pages;
}

export default {
  crawlWebsite,
  normalizeLink,
  hasIgnoredExtension,
};
