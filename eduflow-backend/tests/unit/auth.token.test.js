import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../../src/middleware/auth.js'

describe('Unit: Auth Token Middleware', () => {
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

  function createMockRes() {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(data) {
        this.jsonData = data
        return this
      },
    }
    return res
  }

  it('valid JWT passes auth middleware', () => {
    const token = jwt.sign({ id: 1, role: 'admin', username: 'admin' }, secret, { expiresIn: '15m' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = createMockRes()
    let nextCalled = false

    authMiddleware(req, res, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user.role, 'admin')
    assert.equal(req.user.id, 1)
  })

  it('expired JWT returns 401', () => {
    const token = jwt.sign({ id: 1, role: 'admin' }, secret, { expiresIn: '-1s' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = createMockRes()
    let nextCalled = false

    authMiddleware(req, res, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
    assert.equal(res.jsonData.error, 'Token expired')
  })

  it('invalid signature returns 401', () => {
    const wrongSecret = 'wrong-secret-key-totally-different-987'
    const token = jwt.sign({ id: 1, role: 'admin' }, wrongSecret, { expiresIn: '15m' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = createMockRes()
    let nextCalled = false

    authMiddleware(req, res, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
    assert.equal(res.jsonData.error, 'Invalid token')
  })

  it('missing Authorization header returns 401', () => {
    const req = { headers: {} }
    const res = createMockRes()
    let nextCalled = false

    authMiddleware(req, res, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
    assert.ok(res.jsonData.error)
  })

  it('malformed Bearer prefix returns 401', () => {
    const token = jwt.sign({ id: 1, role: 'admin' }, secret)
    const req = { headers: { authorization: `Basic ${token}` } }
    const res = createMockRes()
    let nextCalled = false

    authMiddleware(req, res, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, false)
    assert.equal(res.statusCode, 401)
    assert.ok(res.jsonData.error)
  })
})
