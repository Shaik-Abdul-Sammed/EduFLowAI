import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration: Multi-Server Persistence', () => {
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
  const adminToken = jwt.sign({ id: 1, role: 'admin', institutionId: 1, username: 'admin' }, secret, { expiresIn: '1h' })

  async function withServer(fn) {
    const app = createApp()
    const server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    const baseUrl = `http://127.0.0.1:${port}`
    try {
      return await fn(baseUrl)
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  }

  it('lead persists across server restart', async () => {
    let leadId
    const college = `Persistence College ${Date.now()}`

    // Server Instance 1: Create lead
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/v1/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeName: college,
          contactName: 'Prof. Persist',
          email: 'persist@test.edu',
          phone: '9876543210',
          cityState: 'Pune',
        }),
      })
      assert.equal(res.status, 201)
      const body = await res.json()
      leadId = body.leadId
    })

    // Server Instance 2 (after restart): Verify lead exists
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/v1/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      assert.equal(res.status, 200)
      const body = await res.json()
      assert.equal(body.college_name, college)
    })
  })

  it('invoice persists across server restart', async () => {
    let invoiceId

    // Server Instance 1: Create invoice
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          institutionName: 'Restart College',
          contactEmail: 'restart@test.edu',
          amount: 40000,
        }),
      })
      assert.equal(res.status, 201)
      const body = await res.json()
      invoiceId = body.invoice.id
    })

    // Server Instance 2: Verify invoice exists
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/v1/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      assert.equal(res.status, 200)
      const body = await res.json()
      assert.equal(body.institution_name, 'Restart College')
    })
  })

  it('view_count on delivered reports persists across server restart', async () => {
    let token

    // Server Instance 1: Deliver report and access twice
    await withServer(async (baseUrl) => {
      const delRes = await fetch(`${baseUrl}/api/v1/reports/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          collegeName: 'View Count College',
          contactEmail: 'view@count.edu',
          title: 'Persisted Report',
          reportContent: 'Report content for persistence verification',
        }),
      })
      const delBody = await delRes.json()
      token = delBody.report.token

      // Access twice to increment view_count
      await fetch(`${baseUrl}/r/${token}`)
      await fetch(`${baseUrl}/r/${token}`)
    })

    // Server Instance 2: Verify view_count persisted
    await withServer(async (baseUrl) => {
      const checkRes = await fetch(`${baseUrl}/api/v1/reports/token/${token}`)
      assert.equal(checkRes.status, 200)
      const report = await checkRes.json()
      assert.ok(report.views_count >= 2, `Expected views_count >= 2, got ${report.views_count}`)
    })
  })
})
