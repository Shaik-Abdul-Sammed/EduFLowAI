/**
 * Request timeout middleware
 * Wraps routes with a timeout (default: 45 seconds).
 * If a request exceeds the timeout, responds with HTTP 504.
 * Does not apply to streaming endpoints (/stream).
 */
export function requestTimeout(timeoutMs = 45000) {
  return (req, res, next) => {
    // Do NOT apply to /stream endpoints
    if (req.path && (req.path.endsWith('/stream') || req.originalUrl?.includes('/stream'))) {
      return next()
    }

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: "Request timed out. Please try again." })
      }
    }, timeoutMs)

    res.on('finish', () => clearTimeout(timer))
    res.on('close', () => clearTimeout(timer))

    next()
  }
}
