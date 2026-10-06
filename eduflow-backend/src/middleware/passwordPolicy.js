/**
 * Password Policy Enforcement
 * Requires:
 * - Minimum 10 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' }
  }

  if (password.length < 10) {
    return { valid: false, message: 'Password must be at least 10 characters long' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one digit (0-9)' }
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' }
  }

  return { valid: true }
}

export function passwordPolicyMiddleware(req, res, next) {
  const password = req.body?.password || req.body?.newPassword
  if (password) {
    const check = validatePasswordStrength(password)
    if (!check.valid) {
      return res.status(400).json({
        error: check.message,
        code: 'WEAK_PASSWORD'
      })
    }
  }
  next()
}
