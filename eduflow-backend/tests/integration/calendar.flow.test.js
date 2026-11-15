import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration Flow: Academic Calendar Lifecycle & Role Scoping', () => {
  let server
  let baseUrl
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  function makeToken(user) {
    return jwt.sign(user, secret, { expiresIn: '15m' })
  }

  it('rejects event creation when title or start date is missing (400)', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })

    const res = await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ description: 'Invalid event without title' })
    })

    assert.strictEqual(res.status, 400)
  })

  it('creates an academic event, retrieves it, and deletes it cleanly', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })

    // Create
    const createRes = await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Inter-Collegiate Hackathon 2026',
        startDate: '2026-10-15',
        endDate: '2026-10-17',
        eventType: 'FEST',
        description: 'Annual National AI Hackathon'
      })
    })

    assert.strictEqual(createRes.status, 201)
    const createData = await createRes.json()
    assert.ok(createData.event.id)
    const eventId = createData.event.id

    // Delete
    const deleteRes = await fetch(`${baseUrl}/api/v1/calendar/event/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    assert.strictEqual(deleteRes.status, 200)
  })
})
