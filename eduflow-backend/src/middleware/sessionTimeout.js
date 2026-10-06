/**
 * Session Timeout Middleware
 * Enforces configured session duration (e.g. 15, 30, 60 minutes) based on lastActivity in token/session
 */
export function sessionTimeout(timeoutMinutes = 30) {
  const maxInactivityMs = timeoutMinutes * 60 * 1000

  return (req, res, next) => {
    // If request has decoded user with lastActivity
    if (req.user && req.user.lastActivity) {
      const now = Date.now()
      const lastActivityTime = Number(req.user.lastActivity)
      
      if (now - lastActivityTime > maxInactivityMs) {
        return res.status(401).json({
          error: 'Session timed out due to inactivity. Please log in again.',
          code: 'SESSION_TIMEOUT'
        })
      }
    }
    next()
  }
}
