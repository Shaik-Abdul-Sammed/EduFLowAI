import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration Flow: Grievance Lifecycle (Student ↔ Admin)', () => {
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

  it('rejects invalid grievance payloads missing subject or description (400)', async () => {
    const studentToken = makeToken({ id: 80, role: 'student', email: 'ananya@demo.edu' })

    const res = await fetch(`${baseUrl}/api/v1/grievances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ category: 'Academic' })
    })

    assert.strictEqual(res.status, 400, 'Payload without subject/description must return 400')
  })

  it('student submits grievance → appears in admin queue → admin resolves it', async () => {
    const studentToken = makeToken({ id: 80, role: 'student', email: 'ananya@demo.edu', name: 'Ananya Sharma' })
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu', name: 'Dean Academics' })

    // 1. Submit
    const submitRes = await fetch(`${baseUrl}/api/v1/grievances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        category: 'Infrastructure',
        subject: 'Robotics Lab 3 Workbench Oscilloscope Fault',
        description: 'Channel 2 on digital oscilloscope #4 displays continuous 50Hz ground ripple noise.',
        priority: 'MEDIUM',
        student_roll: '22BCE1044',
        student_name: 'Ananya Sharma'
      })
    })

    assert.strictEqual(submitRes.status, 201)
    const submitData = await submitRes.json()
    assert.ok(submitData.success)
    assert.ok(submitData.grievance.id)
    const grievanceId = submitData.grievance.id

    // 2. Fetch list as Admin
    const listRes = await fetch(`${baseUrl}/api/v1/grievances`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    assert.strictEqual(listRes.status, 200)
    const listData = await listRes.json()
    const found = listData.grievances.find(g => String(g.id) === String(grievanceId))
    assert.ok(found, 'Submitted grievance must appear in admin list')

    // 3. Resolve as Admin
    const resolveRes = await fetch(`${baseUrl}/api/v1/grievances/${grievanceId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'RESOLVED',
        resolution_notes: 'BNC probe replaced and bench ground terminal re-soldered by lab technician.'
      })
    })

    assert.strictEqual(resolveRes.status, 200)
    const resolveData = await resolveRes.json()
    assert.strictEqual(resolveData.grievance.status, 'RESOLVED')
    assert.ok(resolveData.grievance.resolution_notes.includes('BNC probe replaced'))
  })
})
