/**
 * IP Whitelist Middleware
 * When enabled in institution settings, restricts access to designated network CIDRs / IP addresses
 */
export function ipWhitelist(allowedIps = []) {
  return (req, res, next) => {
    // If no whitelist configured or empty, pass through
    if (!allowedIps || allowedIps.length === 0) {
      return next()
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1'
    const normalizedClient = String(clientIp).split(',')[0].trim()

    const isAllowed = allowedIps.some(ip => {
      return ip === '*' || normalizedClient === ip || normalizedClient.includes(ip) || ip === '127.0.0.1' || ip === '::1'
    })

    if (!isAllowed) {
      return res.status(403).json({
        error: 'Access denied: Client IP address not in institution whitelist.',
        code: 'IP_NOT_WHITELISTED',
        ip: normalizedClient
      })
    }

    next()
  }
}
