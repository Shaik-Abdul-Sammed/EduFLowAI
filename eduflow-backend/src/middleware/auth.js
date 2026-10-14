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

/**
 * Middleware to enforce department scope and finance scope.
 * Validates that users with departmental or financial restrictions operate strictly within their assigned boundaries.
 */
function handleDepartmentScope(allowedScopes, req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const { role, departmentId, department, departmentCode, finance_scope, financeScope } = req.user
  const effectiveFinanceScope = finance_scope || financeScope

  // Global administrative roles bypass specific departmental constraints
  if (role === 'admin' || role === 'registrar') {
    return next()
  }

  // Finance roles validation
  if (role === 'finance_officer' || role === 'accounts_staff') {
    if (allowedScopes.length > 0) {
      if (!effectiveFinanceScope || (!allowedScopes.includes(effectiveFinanceScope) && effectiveFinanceScope !== 'INSTITUTION')) {
        return res.status(403).json({
          error: `Forbidden: User finance_scope (${effectiveFinanceScope || 'NONE'}) lacks required scope (${allowedScopes.join(', ')})`
        })
      }
    }
    return next()
  }

  // HOD or faculty departmental validation
  if (role === 'hod' || role === 'faculty') {
    const userDept = departmentId || department || departmentCode
    const targetDept = req.params?.departmentId || req.query?.departmentId || req.body?.departmentId ||
                       req.params?.department || req.query?.department || req.body?.department
    if (targetDept && userDept && String(targetDept) !== String(userDept)) {
      return res.status(403).json({ error: 'Forbidden: Cannot access departmental resources outside assigned department' })
    }
    return next()
  }

  next()
}

export function requireDepartmentScope(allowedScopes = [], maybeRes, maybeNext) {
  if (allowedScopes && typeof allowedScopes === 'object' && ('user' in allowedScopes || 'headers' in allowedScopes || 'query' in allowedScopes)) {
    return handleDepartmentScope([], allowedScopes, maybeRes, maybeNext)
  }
  const scopes = Array.isArray(allowedScopes) ? allowedScopes : [allowedScopes].filter(Boolean)
  return (req, res, next) => handleDepartmentScope(scopes, req, res, next)
}

/**
 * Explicit middleware for finance scope checking
 * Allowed scopes: 'INSTITUTION', 'DEPARTMENT', 'HOSTEL', 'EXAMINATION', 'SCHOLARSHIP'
 */
export function requireFinanceScope(...scopes) {
  const allowed = scopes.flat()
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (req.user.role === 'admin' || req.user.role === 'registrar') {
      return next()
    }

    const userScope = req.user.finance_scope || req.user.financeScope
    if (!userScope) {
      return res.status(403).json({ error: 'Forbidden: Insufficient finance scope. User has no finance scope assigned' })
    }

    if (userScope === 'INSTITUTION') {
      return next()
    }

    if (allowed.length > 0 && !allowed.includes(userScope)) {
      return res.status(403).json({
        error: `Forbidden: Insufficient finance scope. Finance scope ${userScope} not authorized for required scope(s): ${allowed.join(', ')}`
      })
    }

    next()
  }
}

