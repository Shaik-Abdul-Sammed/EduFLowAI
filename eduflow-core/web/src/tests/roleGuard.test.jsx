import { describe, it, expect } from '@jest/globals'

describe('Role Guard Verification', () => {
  function checkAccess(user, requiredRole) {
    if (!user) return { allowed: false, redirect: '/login' }
    if (requiredRole && user.role !== requiredRole) return { allowed: false, redirect: '/entry' }
    return { allowed: true, redirect: null }
  }

  it('redirects unauthenticated users to /login', () => {
    const outcome = checkAccess(null, 'admin')
    expect(outcome.allowed).toBe(false)
    expect(outcome.redirect).toBe('/login')
  })

  it('redirects non-admin roles away from admin dashboard', () => {
    const studentUser = { role: 'student', email: 'student@demo.edu' }
    const outcome = checkAccess(studentUser, 'admin')
    expect(outcome.allowed).toBe(false)
    expect(outcome.redirect).toBe('/entry')
  })

  it('allows admin users access to admin routes', () => {
    const adminUser = { role: 'admin', email: 'admin@demo.edu' }
    const outcome = checkAccess(adminUser, 'admin')
    expect(outcome.allowed).toBe(true)
    expect(outcome.redirect).toBeNull()
  })
})
