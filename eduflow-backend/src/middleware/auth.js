import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.slice(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER authMiddleware.
 * @param {string[]} roles Array of allowed roles (e.g., ['admin', 'faculty'])
 */
export function requireRole(...roles) {
  const allowed = roles.flat()
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' })
    }
    next()
  }
}
