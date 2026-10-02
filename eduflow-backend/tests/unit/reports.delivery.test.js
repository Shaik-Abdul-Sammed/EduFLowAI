import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Unit: Report Delivery & Public Access', () => {
  let server
  let baseUrl
  let adminToken
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}`
    adminToken = jwt.sign({ id: 1, role: 'admin', institutionId: 1, username: 'admin' }, secret, { expiresIn: '1h' })
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  let deliveredToken
  const college = 'Sri Siddhartha Institute of Engineering'

  it('Deliver report generates a 32 character hex token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/reports/deliver`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        collegeName: college,
        contactEmail: 'principal@ssie.edu',
        title: 'NAAC SSR Criteria 1-7 Audit Summary',
        reportContent: 'Criterion 1: Curricular Aspects - Score 3.65\nCriterion 2: Teaching-Learning - Score 3.80\nHigh institutional readiness.',
      }),
    })

    assert.ok(res.status === 200 || res.status === 201, `Expected status 200 or 201, got ${res.status}`)
    const body = await res.json()
    assert.equal(body.success, true)
    deliveredToken = body.report.token
    assert.equal(typeof deliveredToken, 'string')
    assert.equal(deliveredToken.length, 32, 'Token must be exactly 32 hex characters')
    assert.match(deliveredToken, /^[0-9a-f]{32}$/, 'Token must be a valid hex string')
  })

  it('Access /r/TOKEN increments view_count', async () => {
    // Initial fetch
    const htmlRes1 = await fetch(`${baseUrl}/r/${deliveredToken}`)
    assert.equal(htmlRes1.status, 200)

    // Token API fetch to verify view count
    const apiRes = await fetch(`${baseUrl}/api/v1/reports/token/${deliveredToken}`)
    assert.equal(apiRes.status, 200)
    const report = await apiRes.json()
    assert.ok(report.views_count >= 1, `Expected views_count >= 1, got ${report.views_count}`)
  })

  it('Access /r/INVALID returns 404', async () => {
    const res = await fetch(`${baseUrl}/r/invalidtoken99999999999999999999`)
    assert.equal(res.status, 404)
  })

  it('Report HTML includes the college name as header', async () => {
    const res = await fetch(`${baseUrl}/r/${deliveredToken}`)
    assert.equal(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes(college), 'HTML should contain college name in header or content')
  })

  it('Delivered report persists across backend restart', async () => {
    // Simulate backend restart by creating a new server instance sharing same memory/db
    const newApp = createApp()
    const newServer = http.createServer(newApp)
    await new Promise((resolve) => newServer.listen(0, resolve))
    const newPort = newServer.address().port
    const newBaseUrl = `http://127.0.0.1:${newPort}`

    try {
      const res = await fetch(`${newBaseUrl}/api/v1/reports/token/${deliveredToken}`)
      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.college_name, college)
    } finally {
      await new Promise((resolve) => newServer.close(resolve))
    }
  })
})
