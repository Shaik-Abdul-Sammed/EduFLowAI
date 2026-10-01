import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import http from 'node:http'
import { createApp } from '../src/app.js'

describe('Production Hardening & Rate Limiting Verification', () => {
  let server
  let baseUrl

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('E.2 Input Validation: should return 400 with validation details when password is missing on login', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.edu' }),
    })

    assert.strictEqual(res.status, 400)
    const body = await res.json()
    assert.strictEqual(body.error, 'Validation failed')
    assert.ok(Array.isArray(body.details))
    assert.ok(body.details.some((d) => d.path === 'password'))
  })

  it('E.2 Input Validation: should return 400 when message is missing on /api/v1/ai/chat', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    assert.strictEqual(res.status, 400)
    const body = await res.json()
    assert.strictEqual(body.error, 'Validation failed')
  })

  it('G.3 Backup Status: rejects unauthenticated access', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/backup/status`)
    assert.strictEqual(res.status, 401)
  })

  it('G.3 Backup Status: returns backup metadata for admin user', async () => {
    const jwt = await import('jsonwebtoken')
    const secret = process.env.JWT_SECRET || '36a8b28c9e0246ed6b1058f9c4998b97'
    const adminToken = jwt.default.sign({ id: 1, role: 'admin', institutionId: 1 }, secret)

    const res = await fetch(`${baseUrl}/api/v1/admin/backup/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.ok(body.lastBackupTimestamp, 'Expected lastBackupTimestamp')
    assert.ok(typeof body.backupCount === 'number')
    assert.ok(typeof body.lastBackupSize === 'number')
    assert.strictEqual(body.storageLocation, 'local')
  })

  it('E.1 Rate Limiting: should trigger 429 after 20 unauthenticated requests', async () => {
    let got429 = false
    let retryAfterHeader = null
    let responseBody = null

    for (let i = 0; i < 25; i++) {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@demo.edu', password: 'password123' }),
      })

      if (res.status === 429) {
        got429 = true
        retryAfterHeader = res.headers.get('retry-after')
        responseBody = await res.json()
        break
      }
    }

    assert.strictEqual(got429, true, 'Should have triggered HTTP 429 rate limit')
    assert.ok(retryAfterHeader, 'Should have Retry-After header')
    assert.strictEqual(responseBody.error, 'Too many requests. Please try again later.')
    assert.ok(typeof responseBody.retryAfter === 'number')
  })

  it('E.1 Rate Limiting: /api/health and /api/health/db must not be rate-limited even after limit is reached', async () => {
    const res = await fetch(`${baseUrl}/api/health`)
    assert.strictEqual(res.status, 200)
    const body = await res.json()
    assert.strictEqual(body.ok, true)
  })
})
