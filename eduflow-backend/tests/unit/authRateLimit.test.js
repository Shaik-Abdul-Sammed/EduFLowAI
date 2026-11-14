import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'

describe('Unit: Auth Rate Limiting & Brute-Force Defense', () => {
  let server
  let baseUrl
  let originalMax

  before(async () => {
    originalMax = process.env.AUTH_RATE_LIMIT_MAX
    process.env.AUTH_RATE_LIMIT_MAX = '10'

    const { createApp } = await import('../../src/app.js')
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}`
  })

  after(async () => {
    if (originalMax !== undefined) {
      process.env.AUTH_RATE_LIMIT_MAX = originalMax
    } else {
      delete process.env.AUTH_RATE_LIMIT_MAX
    }
    await new Promise((resolve) => server.close(resolve))
  })

  it('fires 11 rapid requests to /api/v1/auth/student-login and verifies the 11th request returns HTTP 429', async () => {
    const responses = []

    // Fire 10 allowed requests across unique accounts to test IP-level authLimiter window
    for (let i = 1; i <= 10; i++) {
      const res = await fetch(`${baseUrl}/api/v1/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: `2024-STUDENT-${i}`, dob: '15082004' })
      })
      responses.push(res.status)
      assert.notEqual(res.status, 429, `Request ${i} should be permitted by IP rate limiter`)
    }

    // Fire the 11th request (must exceed the 10-request threshold)
    const rateLimitedRes = await fetch(`${baseUrl}/api/v1/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber: '2024-STUDENT-11', dob: '15082004' })
    })

    assert.equal(
      rateLimitedRes.status,
      429,
      `Expected 11th request to return HTTP 429 Too Many Requests, got ${rateLimitedRes.status}`
    )

    const data = await rateLimitedRes.json()
    assert.ok(
      data.error?.toLowerCase().includes('too many') || data.message?.toLowerCase().includes('too many'),
      'Expected rate limit error message in response body'
    )
  })
})
