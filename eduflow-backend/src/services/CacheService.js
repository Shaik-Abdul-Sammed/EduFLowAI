import { LRUCache } from 'lru-cache'

// Configure a robust LRU Cache as a fallback for Redis in this phase
const cache = new LRUCache({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes Time To Live
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false
})

export class CacheService {
  /**
   * Get an item from the cache
   * @param {string} key 
   * @returns {any}
   */
  static get(key) {
    return cache.get(key)
  }

  /**
   * Set an item in the cache
   * @param {string} key 
   * @param {any} value 
   * @param {number} [ttlMs] - Optional specific TTL in milliseconds
   */
  static set(key, value, ttlMs) {
    if (ttlMs) {
      cache.set(key, value, { ttl: ttlMs })
    } else {
      cache.set(key, value)
    }
  }

  /**
   * Delete an item from the cache
   * @param {string} key 
   */
  static delete(key) {
    cache.delete(key)
  }

  /**
   * Clear the entire cache
   */
  static clear() {
    cache.clear()
  }

  /**
   * Wraps an async function with caching logic
   * @param {string} key - Cache key
   * @param {Function} fetcher - Async function to fetch data if cache misses
   * @param {number} [ttlMs] - Cache duration
   */
  static async getOrSet(key, fetcher, ttlMs) {
    try {
      const cached = this.get(key)
      if (cached !== undefined) return cached
    } catch {
      // cache read failure should not block fetching
    }

    const data = await fetcher()

    try {
      this.set(key, data, ttlMs)
    } catch {
      // cache write failure should not break response
    }

    return data
  }
}
