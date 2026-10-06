import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration: Academic Calendar API Flow', () => {
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

  it('generates academic calendar, adjusts holiday, and exports PDF', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })

    // Generate
    const genRes = await fetch(`${baseUrl}/api/v1/calendar/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        academicYear: '2026-2027',
        stateCode: 'KA',
      }),
    })
    assert.equal(genRes.status, 200)
    const genData = await genRes.json()
    assert.equal(genData.calendar.academicYear, '2026-2027')

    // Adjust
    const adjRes = await fetch(`${baseUrl}/api/v1/calendar/1/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        adjustmentType: 'EXTEND_HOLIDAY',
        eventId: 2,
        days: 1,
        reason: 'District Collector Declaration',
      }),
    })
    assert.equal(adjRes.status, 200)

    // Export PDF
    const exportRes = await fetch(`${baseUrl}/api/v1/calendar/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ academicYear: '2026-2027' }),
    })
    assert.equal(exportRes.status, 200)
    assert.equal(exportRes.headers.get('content-type'), 'application/pdf')
  })
})
