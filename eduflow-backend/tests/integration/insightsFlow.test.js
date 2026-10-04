import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration: Multi-Officer AI Insights Flow', () => {
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

  function makeToken(role = 'admin') {
    return jwt.sign(
      { id: 1, role, institutionId: 1, email: `${role}@demo.edu` },
      secret,
      { expiresIn: '15m' }
    )
  }

  it('POST /api/v1/insights/accreditation/predict returns 200', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/insights/accreditation/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ institutionId: 1 }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.domain, 'accreditation')
    assert.equal(body.insightType, 'predict')
    assert.ok(body.summary)
    assert.ok(body.details)
  })

  it('POST /api/v1/insights/student-success/explain returns 200', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/insights/student-success/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: '2024-CSE-001',
        context: { studentId: 1 },
      }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.domain, 'student-success')
    assert.equal(body.insightType, 'explain')
    assert.ok(body.details.student)
    assert.ok(Array.isArray(body.recommendations))
  })

  it('POST /api/v1/insights/invalid-domain/ask returns 404', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/insights/invalid-domain/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question: 'How is our status?' }),
    })

    assert.equal(res.status, 404)
    const body = await res.json()
    assert.ok(body.error)
    assert.match(body.error, /Unknown domain/i)
  })

  it('GET /api/v1/insights/dashboard returns all 5 domains', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/insights/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.ok(Array.isArray(body.domains))
    assert.equal(body.domains.length, 5)

    const domainNames = body.domains.map((d) => d.name)
    assert.ok(domainNames.includes('accreditation'))
    assert.ok(domainNames.includes('student-success'))
    assert.ok(domainNames.includes('timetable'))
    assert.ok(domainNames.includes('admissions'))
    assert.ok(domainNames.includes('finance'))

    assert.ok(typeof body.overallHealth === 'number')
    assert.ok(Array.isArray(body.topPriorities))
    assert.ok(body.topPriorities.length >= 3)
  })

  it('All endpoints require admin auth (401 without token, 403 with student token)', async () => {
    // 1. Unauthenticated request
    const noAuthRes = await fetch(`${baseUrl}/api/v1/insights/dashboard`)
    assert.equal(noAuthRes.status, 401)

    // 2. Student role request
    const studentToken = makeToken('student')
    const forbiddenRes = await fetch(`${baseUrl}/api/v1/insights/dashboard`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    })
    assert.equal(forbiddenRes.status, 403)
  })

  it('POST /api/v1/insights/timetable/improve and GET history return 200', async () => {
    const token = makeToken('admin')
    const improveRes = await fetch(`${baseUrl}/api/v1/insights/timetable/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ institutionId: 1, target: 'zero conflicts' }),
    })

    assert.equal(improveRes.status, 200)
    const improveBody = await improveRes.json()
    assert.equal(improveBody.success, true)
    assert.equal(improveBody.domain, 'timetable')

    const historyRes = await fetch(`${baseUrl}/api/v1/insights/timetable/history?limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    assert.equal(historyRes.status, 200)
    const historyBody = await historyRes.json()
    assert.equal(historyBody.success, true)
    assert.ok(Array.isArray(historyBody.history))
  })
})
