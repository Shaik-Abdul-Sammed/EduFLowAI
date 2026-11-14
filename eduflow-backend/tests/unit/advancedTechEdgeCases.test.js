import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createApp } from '../../src/app.js'

describe('Unit: Advanced Tech Edge Cases (Degree Audit & LTI 1.3)', () => {
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

  it('GET /api/v1/students/:rollNumber/degree-audit with non-existent roll returns clean 404, not a 500 crash', async () => {
    const res = await fetch(`${baseUrl}/api/v1/students/NONEXISTENT-9999/degree-audit`)
    assert.equal(res.status, 404, `Expected HTTP 404 for non-existent student, got ${res.status}`)
    const data = await res.json()
    assert.ok(data.error, 'Response must include clean error message')
    assert.ok(data.error.includes('NONEXISTENT-9999') || data.error.toLowerCase().includes('not found'))
  })

  it('GET /api/v1/students/:rollNumber/degree-audit with valid demo roll returns 200 with credit requirements', async () => {
    const res = await fetch(`${baseUrl}/api/v1/students/2024-CSE-042/degree-audit`)
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.success, true)
    assert.ok(data.genEd && typeof data.genEd.required === 'number')
    assert.ok(data.major && typeof data.major.required === 'number')
    assert.ok(data.totalCredits && typeof data.totalCredits.required === 'number')
    assert.ok(['ON_TRACK', 'NEEDS_ADVISEMENT', 'CRITICAL_REVIEW'].includes(data.status))
  })

  it('POST /api/v1/lti/login validates required LTI 1.3 initiation parameters', async () => {
    const badRes = await fetch(`${baseUrl}/api/v1/lti/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    assert.equal(badRes.status, 400)
    const errData = await badRes.json()
    assert.ok(errData.error?.includes('iss'))

    // Valid login initiation
    const goodRes = await fetch(`${baseUrl}/api/v1/lti/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        iss: 'https://canvas.instructure.com',
        login_hint: 'user_12345',
        target_link_uri: 'http://localhost:5173/speedgrader'
      })
    })
    assert.equal(goodRes.status, 200)
    const authData = await goodRes.json()
    assert.ok(authData.authUrl)
    assert.ok(authData.state)
    assert.ok(authData.nonce)
  })

  it('POST /api/v1/lti/launch rejects unauthenticated or missing id_token launch attempts with clean 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/lti/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    assert.equal(res.status, 400)
    const data = await res.json()
    assert.ok(data.error?.includes('id_token') || data.error?.includes('launch'))
  })
})
