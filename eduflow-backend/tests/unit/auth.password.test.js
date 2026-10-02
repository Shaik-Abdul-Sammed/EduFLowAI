import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createApp } from '../../src/app.js'

describe('Unit: Auth Password & Validation', () => {
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

  it('correct password returns 200 with token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eduflow.edu',
        password: 'admin123',
      }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.accessToken, 'Expected accessToken')
    assert.ok(body.refreshToken, 'Expected refreshToken')
    assert.equal(body.user.role, 'admin')
  })

  it('wrong password returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eduflow.edu',
        password: 'WrongPassword!@#',
      }),
    })

    assert.equal(res.status, 401)
    const body = await res.json()
    assert.equal(body.error, 'Invalid credentials')
  })

  it('missing email returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'admin123',
      }),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('missing password returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@eduflow.edu',
      }),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('malformed email returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email-address',
        password: 'admin123',
      }),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('case-insensitive email matching', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ADMIN@EduFlow.EDU',
        password: 'admin123',
      }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.accessToken, 'Expected accessToken on case-insensitive login')
  })
})
