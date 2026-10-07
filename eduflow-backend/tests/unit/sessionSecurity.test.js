import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { sessionTimeout } from '../../src/middleware/sessionTimeout.js'
import { ipWhitelist } from '../../src/middleware/ipWhitelist.js'
import { validatePasswordStrength, passwordPolicyMiddleware } from '../../src/middleware/passwordPolicy.js'
import { rateLimitPerUser } from '../../src/middleware/rateLimitPerUser.js'

describe('Session Security Hardening Unit Tests', () => {
  test('sessionTimeout rejects request if inactivity exceeds timeout window', () => {
    const middleware = sessionTimeout(15) // 15 mins
    const expiredTime = Date.now() - (20 * 60 * 1000) // 20 mins ago

    let resJson = null
    let resStatus = null
    const req = { user: { lastActivity: expiredTime } }
    const res = {
      status: (c) => {
        resStatus = c
        return { json: (d) => { resJson = d } }
      }
    }
    let nextCalled = false

    middleware(req, res, () => { nextCalled = true })
    assert.equal(resStatus, 401)
    assert.equal(resJson.code, 'SESSION_TIMEOUT')
    assert.equal(nextCalled, false)
  })

  test('sessionTimeout permits active requests within timeout window', () => {
    const middleware = sessionTimeout(30)
    const activeTime = Date.now() - (5 * 60 * 1000) // 5 mins ago

    const req = { user: { lastActivity: activeTime } }
    let nextCalled = false
    middleware(req, {}, () => { nextCalled = true })
    assert.equal(nextCalled, true)
  })

  test('ipWhitelist permits matching or localhost IPs and denies outside IPs', () => {
    const middleware = ipWhitelist(['192.168.1.100', '10.0.0.1'])
    
    let deniedStatus = null
    const blockedReq = { ip: '203.0.113.19' }
    const res = {
      status: (c) => {
        deniedStatus = c
        return { json: () => {} }
      }
    }
    middleware(blockedReq, res, () => {})
    assert.equal(deniedStatus, 403)

    let allowed = false
    const allowedReq = { ip: '192.168.1.100' }
    middleware(allowedReq, {}, () => { allowed = true })
    assert.equal(allowed, true)
  })

  test('password policy enforces 10 chars, upper, lower, number, and special char', () => {
    assert.equal(validatePasswordStrength('short').valid, false)
    assert.equal(validatePasswordStrength('alllowercase123!').valid, false)
    assert.equal(validatePasswordStrength('ALLUPPERCASE123!').valid, false)
    assert.equal(validatePasswordStrength('NoSpecialChar123').valid, false)
    assert.equal(validatePasswordStrength('NoNumberPass!').valid, false)
    assert.equal(validatePasswordStrength('StrongPass@2026').valid, true)
  })

  test('rateLimitPerUser tracks sliding window per role', () => {
    const req = { user: { id: 9999, role: 'staff' } } // 30 req limit
    let passedCount = 0
    let blocked = false

    for (let i = 0; i < 35; i++) {
      rateLimitPerUser(req, {
        status: (c) => {
          if (c === 429) blocked = true
          return { json: () => {} }
        }
      }, () => {
        passedCount++
      })
    }

    assert.equal(passedCount, 30)
    assert.equal(blocked, true)
  })
})
