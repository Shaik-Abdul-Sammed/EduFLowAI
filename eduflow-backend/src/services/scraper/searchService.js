import axios from 'axios';
import { scraperConfig } from '../../config/scraperConfig.js';

const BLOCKED_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'youtube.com',
];

const DIRECTORY_DOMAINS = [
  'shiksha.com',
  'collegedunia.com',
  'careers360.com',
  'targetstudy.com',
  'jagranjosh.com',
  'wikipedia.org',
];

/**
 * Checks if a domain or URL is a forbidden social network
 */
export function isBlockedSocialDomain(urlOrDomain) {
  try {
    const hostname = urlOrDomain.startsWith('http')
      ? new URL(urlOrDomain).hostname.toLowerCase()
      : urlOrDomain.toLowerCase();
    return BLOCKED_DOMAINS.some((b) => hostname.includes(b));
  } catch {
    return false;
  }
}

/**
 * Calculates a relevance score for a search result candidate
 */
export function scoreCandidate(url, title = '', snippet = '', institutionName = '') {
  let score = 0;
  let hostname = '';
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    hostname = url.toLowerCase();
  }

  // +10 if domain ends with educational TLDs
  if (
    hostname.endsWith('.edu') ||
    hostname.endsWith('.ac.in') ||
    hostname.endsWith('.edu.in') ||
    hostname.endsWith('.org.in') ||
    hostname.includes('.edu.') ||
    hostname.includes('.ac.')
  ) {
    score += 10;
  }

  // Institution name slug or acronym match
  const cleanName = institutionName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  const tokens = cleanName.split(/\s+/).filter((t) => t.length > 2);
  const acronym = tokens.map((t) => t[0]).join('');
  const slug = tokens.join('-');

  const urlLower = url.toLowerCase();
  if (
    urlLower.includes(slug) ||
    (acronym.length >= 3 && hostname.includes(acronym)) ||
    tokens.filter((t) => urlLower.includes(t)).length >= Math.min(2, tokens.length)
  ) {
    score += 5;
  }

  // -5 if domain is a social network
  if (BLOCKED_DOMAINS.some((d) => hostname.includes(d))) {
    score -= 5;
  }

  // -10 if domain is a directory site
  if (DIRECTORY_DOMAINS.some((d) => hostname.includes(d))) {
    score -= 10;
  }

  return score;
}

/**
 * Discovers the official website for an educational institution using Google Custom Search JSON API
 *
 * @param {string} institutionName
 * @param {string} city
 * @returns {Promise<{success: boolean, website?: string, confidence?: number, alternates?: Array, query: string, error?: string}>}
 */
export async function discoverInstitutionWebsite(institutionName, city = '') {
  const query = `${institutionName || ''} ${city || ''} official website`.replace(/\s+/g, ' ').trim();

  // Validate API configuration
  const apiKey = scraperConfig.googleCseApiKey;
  const cx = scraperConfig.googleCseCx;

  if (!apiKey || !cx) {
    return {
      success: false,
      error: 'Search API is not configured. Please set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX in .env',
      query,
    };
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: cx,
        q: query,
        num: 5,
      },
      timeout: scraperConfig.timeoutMs,
      headers: {
        'User-Agent': scraperConfig.userAgent,
      },
    });

    const items = response.data?.items || [];
    if (!items.length) {
      return {
        success: true,
        website: null,
        confidence: 0,
        alternates: [],
        query,
      };
    }

    const scored = items.map((item) => {
      const url = item.link;
      const score = scoreCandidate(url, item.title, item.snippet, institutionName);
      return {
        url,
        title: item.title,
        snippet: item.snippet,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    let confidence = 50;
    if (best.score >= 15) {
      confidence = 95;
    } else if (best.score >= 10) {
      confidence = 85;
    } else if (best.score >= 5) {
      confidence = 70;
    } else if (best.score > 0) {
      confidence = 55;
    } else {
      confidence = Math.max(10, 30 + best.score * 5);
    }

    return {
      success: true,
      website: best.url,
      confidence,
      alternates: scored.slice(1).map((s) => ({
        url: s.url,
        title: s.title,
        score: s.score,
      })),
      query,
    };
  } catch (err) {
    if (err.response?.status === 429 || err.response?.data?.error?.code === 429) {
      return {
        success: false,
        error: 'Google Custom Search API quota exhausted for today. The free tier allows 100 queries per day.',
        query,
      };
    }
    if (err.response?.status === 403 || err.response?.data?.error?.code === 403) {
      return {
        success: false,
        error: 'Search API authentication failed. Please verify GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX.',
        query,
      };
    }
    return {
      success: false,
      error: `Search error: ${err.message || 'Unknown network error'}`,
      query,
    };
  }
}

export default {
  discoverInstitutionWebsite,
  scoreCandidate,
  isBlockedSocialDomain,
};
