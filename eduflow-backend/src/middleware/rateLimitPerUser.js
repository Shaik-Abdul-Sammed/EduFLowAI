/**
 * In-memory user rate limiter tracking per-user limits across 15-minute sliding windows:
 * - admin: 100 req / 15m
 * - hod: 50 req / 15m
 * - staff / faculty: 30 req / 15m
 * - student / parent / other: 25 req / 15m
 */

const userRequestMap = new Map()

const ROLE_LIMITS = {
  admin: 100,
  hod: 50,
  staff: 30,
  faculty: 30,
  student: 25,
  parent: 25,
  default: 20
}

export function rateLimitPerUser(req, res, next) {
  // If no user attached to req (unauthenticated), skip to IP rate limiter
  if (!req.user || !req.user.id) {
    return next()
  }

  const userId = req.user.id
  const role = req.user.role || 'default'
  const maxRequests = ROLE_LIMITS[role] || ROLE_LIMITS.default
  const windowMs = 15 * 60 * 1000
  const now = Date.now()

  let userBucket = userRequestMap.get(userId)
  if (!userBucket) {
    userBucket = { timestamps: [] }
    userRequestMap.set(userId, userBucket)
  }

  // Filter timestamps within current 15 min window
  userBucket.timestamps = userBucket.timestamps.filter(ts => now - ts < windowMs)

  if (userBucket.timestamps.length >= maxRequests) {
    return res.status(429).json({
      error: `Per-user rate limit exceeded (${maxRequests} requests per 15 minutes for role ${role}). Please try again later.`,
      code: 'USER_RATE_LIMIT_EXCEEDED',
      limit: maxRequests,
      role
    })
  }

  userBucket.timestamps.push(now)
  next()
}
