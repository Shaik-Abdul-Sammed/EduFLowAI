/**
 * CacheService.js
 * High-Scalability Redis Caching Layer with In-Memory Resilient Fallback.
 * Powered by ioredis for distributed caching of expensive analytical queries
 * (e.g. Dashboard metrics, Executive ROI summaries) with a 5-minute TTL.
 */

import Redis from 'ioredis'

class CacheService {
  constructor() {
    this.redisClient = null
    this.memoryStore = new Map() // key -> { value, expiresAt }
    this.isRedisConnected = false
    this._init()
  }

  _init() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL
    const redisHost = process.env.REDIS_HOST

    if (redisUrl || redisHost) {
      try {
        this.redisClient = redisUrl ? new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 }) : new Redis({ host: redisHost, port: process.env.REDIS_PORT || 6379, lazyConnect: true, maxRetriesPerRequest: 1 })

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true
        })

        this.redisClient.on('error', () => {
          this.isRedisConnected = false
        })

        this.redisClient.connect().catch(() => {
          this.isRedisConnected = false
        })
      } catch (_err) {
        this.isRedisConnected = false
      }
    }
  }

  /**
   * Retrieves a value by key.
   */
  async get(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key)
        return raw ? JSON.parse(raw) : null
      } catch (_err) {
        // Fall back to memoryStore
      }
    }

    const item = this.memoryStore.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key)
      return null
    }
    return item.value
  }

  /**
   * Stores a value with a TTL in seconds (default 300s = 5 minutes).
   */
  async set(key, value, ttlSeconds = 300) {
    const serialized = JSON.stringify(value)

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds)
      } catch (_err) {
        // Fall back to memoryStore
      }
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    })
    return true
  }

  /**
   * Deletes a specific key.
   */
  async del(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key)
      } catch (_err) {}
    }
    this.memoryStore.delete(key)
    return true
  }

  /**
   * Invalidates all keys starting with prefix.
   */
  async invalidatePrefix(prefix) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${prefix}*`)
        if (keys && keys.length > 0) {
          await this.redisClient.del(...keys)
        }
      } catch (_err) {}
    }

    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryStore.delete(key)
      }
    }
    return true
  }

  /**
   * Flushes all cached data.
   */
  async flush() {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushdb()
      } catch (_err) {}
    }
    this.memoryStore.clear()
    return true
  }

  // Backward compatibility static helpers
  static get(key) {
    return cacheService.get(key)
  }

  static set(key, value, ttlMs) {
    const ttlSeconds = typeof ttlMs === 'number' ? Math.max(1, Math.round(ttlMs / 1000)) : 300
    return cacheService.set(key, value, ttlSeconds)
  }

  static delete(key) {
    return cacheService.del(key)
  }

  static del(key) {
    return cacheService.del(key)
  }

  static clear() {
    return cacheService.flush()
  }

  static flush() {
    return cacheService.flush()
  }

  static async getOrSet(key, fetcher, ttlMs) {
    try {
      const cached = await cacheService.get(key)
      if (cached !== null && cached !== undefined) return cached
    } catch {
      // cache read failure should not block fetching
    }

    const data = await fetcher()

    try {
      const ttlSeconds = typeof ttlMs === 'number' ? Math.max(1, Math.round(ttlMs / 1000)) : 300
      await cacheService.set(key, data, ttlSeconds)
    } catch {
      // cache write failure should not break response
    }

    return data
  }

  /**
   * Express Middleware for Caching expensive GET routes.
   * @param {string} prefix
   * @param {number} ttlSeconds Default: 300 (5 mins)
   */
  middleware(prefix = 'cache', ttlSeconds = 300) {
    return async (req, res, next) => {
      if (req.method !== 'GET') return next()

      const cacheKey = `${prefix}:${req.originalUrl || req.url}`
      try {
        const cached = await this.get(cacheKey)
        if (cached !== null && cached !== undefined) {
          res.setHeader('X-Cache', 'HIT')
          return res.status(200).json(cached)
        }
      } catch (_err) {}

      // Intercept res.json to cache response
      const originalJson = res.json.bind(res)
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, body, ttlSeconds).catch(() => {})
        }
        res.setHeader('X-Cache', 'MISS')
        return originalJson(body)
      }

      next()
    }
  }

  /**
   * Invalidation Middleware
   * Automatically invalidates cached prefixes on mutating POST/PUT/DELETE actions.
   */
  invalidateOnMutation(prefixes = []) {
    return (req, res, next) => {
      const mutating = ['POST', 'PUT', 'PATCH', 'DELETE']
      if (!mutating.includes(req.method)) return next()

      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          prefixes.forEach((p) => this.invalidatePrefix(p).catch(() => {}))
        }
      })
      next()
    }
  }
}

export { CacheService }
export const cacheService = new CacheService()
export default cacheService
