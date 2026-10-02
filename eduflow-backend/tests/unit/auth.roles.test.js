import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Unit: Role-Based Authorization', () => {
  let server
  let baseUrl
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

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

  function makeToken(role) {
    return jwt.sign({ id: 1, role, institutionId: 1, username: `${role}-user` }, secret, { expiresIn: '15m' })
  }

  it('Admin can access /api/v1/leads', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.leads))
  })

  it('Faculty cannot access /api/v1/leads (403)', async () => {
    const token = makeToken('faculty')
    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 403)
    const body = await res.json()
    assert.ok(body.error.includes('Insufficient') || body.error.includes('Forbidden'))
  })

  it('Student cannot access /api/v1/leads (403)', async () => {
    const token = makeToken('student')
    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 403)
    const body = await res.json()
    assert.ok(body.error.includes('Insufficient') || body.error.includes('Forbidden'))
  })

  it('Parent cannot access /api/v1/leads (403)', async () => {
    const token = makeToken('parent')
    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 403)
    const body = await res.json()
    assert.ok(body.error.includes('Insufficient') || body.error.includes('Forbidden'))
  })
})
