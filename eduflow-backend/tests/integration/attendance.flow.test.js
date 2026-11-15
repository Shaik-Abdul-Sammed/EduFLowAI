import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration Flow: Attendance Linkage (Teacher ↔ Student ↔ Admin)', () => {
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

  it('student cannot mark or tamper with attendance records (403 Forbidden)', async () => {
    const studentToken = makeToken({ id: 80, role: 'student', email: 'ananya@demo.edu' })

    const res = await fetch(`${baseUrl}/api/v1/attendance/upload-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ csvContent: 'student_id,date,status,course_code\n80,2026-09-01,PRESENT,CS301' })
    })

    assert.strictEqual(res.status, 403, 'Student must receive 403 Forbidden when attempting attendance write')
  })

  it('admin audits attendance stats and at-risk students below statutory threshold', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })

    // Ingest sample
    await fetch(`${baseUrl}/api/v1/attendance/ingest/sample`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    })

    // Fetch stats
    const statsRes = await fetch(`${baseUrl}/api/v1/attendance/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    assert.strictEqual(statsRes.status, 200)
    const statsData = await statsRes.json()
    assert.ok(statsData.overallAttendance > 0, 'overallAttendance should be > 0')

    // Fetch at-risk list
    const atRiskRes = await fetch(`${baseUrl}/api/v1/attendance/at-risk`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    assert.strictEqual(atRiskRes.status, 200)
    const atRiskData = await atRiskRes.json()
    assert.ok(Array.isArray(atRiskData.students))
  })

  it('student can read their own attendance ledger', async () => {
    const studentToken = makeToken({ id: 80, role: 'student', email: 'ananya@demo.edu' })

    const res = await fetch(`${baseUrl}/api/v1/student/attendance`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.ok(Array.isArray(data), 'Student attendance ledger must return array')
  })
})
