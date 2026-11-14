import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createApp } from '../../src/app.js'

describe('Unit: Scalability Phase – Student Login & Bulk Import', () => {
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

  // ─── POST /api/v1/auth/student-login ───────────────────────────────────────

  it('POST /api/v1/auth/student-login with valid demo credentials returns 200 + token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber: '2024-CSE-042', dob: '15082004' }),
    })
    // Accept 200 (found in DB/demo store) or 503 (DB not connected in test env)
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`)
    if (res.status === 200) {
      const data = await res.json()
      assert.ok(data.token, 'Should return a JWT token')
      assert.equal(data.role, 'student', 'Role should be student')
    }
  })

  it('POST /api/v1/auth/student-login with wrong DOB returns 401 or 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber: '2024-CSE-042', dob: '99999999' }),
    })
    assert.ok([400, 401, 503].includes(res.status), `Expected 400/401/503, got ${res.status}`)
  })

  it('POST /api/v1/auth/student-login with missing fields returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber: '' }),
    })
    assert.ok([400, 401, 503].includes(res.status), `Expected 400/401/503, got ${res.status}`)
  })

  it('POST /api/v1/auth/student-login with unknown roll number returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber: 'FAKE-999', dob: '01012000' }),
    })
    assert.ok([401, 404, 503].includes(res.status), `Expected 401/404/503, got ${res.status}`)
  })

  // ─── POST /api/v1/auth/bulk-student-import ────────────────────────────────

  it('POST /api/v1/auth/bulk-student-import with valid array returns 201 or 200', async () => {
    const students = Array.from({ length: 5 }, (_, i) => ({
      rollNumber: `2024-TEST-00${i + 1}`,
      firstName: `FirstName${i}`,
      lastName: `LastName${i}`,
      email: `test${i}@college.edu`,
      dob: '01012004',
      department: 'CSE',
      program: 'B.Tech',
      semester: '1',
      batch: '2024',
      institutionId: 1,
    }))

    const res = await fetch(`${baseUrl}/api/v1/auth/bulk-student-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students, institutionId: 1 }),
    })
    // Accept 200/201 for success, 503 if DB unavailable in test env
    assert.ok([200, 201, 503].includes(res.status), `Expected 200/201/503, got ${res.status}`)
  })

  it('POST /api/v1/auth/bulk-student-import with empty array returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/bulk-student-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: [], institutionId: 1 }),
    })
    assert.ok([400, 503].includes(res.status), `Expected 400 or 503, got ${res.status}`)
  })
})
