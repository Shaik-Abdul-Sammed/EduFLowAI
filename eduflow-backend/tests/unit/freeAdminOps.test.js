import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import { createApp } from '../../src/app.js'

describe('Phase 5: Free Administrative & Operational Features', () => {
  let app
  let server
  let baseUrl

  before(async () => {
    app = createApp()
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port
        baseUrl = `http://127.0.0.1:${port}`
        resolve()
      })
    })
  })

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  describe('Faculty & Course Bulk Import (Feature 64)', () => {
    test('POST /api/v1/faculty/bulk-import succeeds with valid faculty payload', async () => {
      const payload = {
        faculty: [
          {
            name: 'Dr. Priya Sundaram',
            email: 'priya.sundaram@test.edu',
            department: 'Computer Science',
            designation: 'Associate Professor',
            employeeId: 'FAC-T101'
          },
          {
            name: 'Prof. Rajesh Menon',
            email: 'rajesh.menon@test.edu',
            department: 'Electronics',
            designation: 'Assistant Professor',
            employeeId: 'FAC-T102'
          }
        ]
      }

      const res = await fetch(`${baseUrl}/api/v1/faculty/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      assert.strictEqual(res.status, 201)
      const data = await res.json()
      assert.strictEqual(data.success, true)
      assert.strictEqual(data.count, 2)
      assert.strictEqual(data.faculty.length, 2)
    })

    test('POST /api/v1/faculty/bulk-import rejects empty or invalid payload', async () => {
      const res = await fetch(`${baseUrl}/api/v1/faculty/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faculty: [] })
      })

      assert.strictEqual(res.status, 400)
    })

    test('POST /api/v1/courses/bulk-import successfully imports course catalog', async () => {
      const payload = {
        courses: [
          {
            code: 'CS301',
            name: 'Database Management Systems',
            department: 'Computer Science',
            credits: 4,
            semester: 5
          },
          {
            code: 'EC204',
            name: 'Digital Signal Processing',
            department: 'Electronics',
            credits: 3,
            semester: 4
          }
        ]
      }

      const res = await fetch(`${baseUrl}/api/v1/courses/bulk-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      assert.strictEqual(res.status, 201)
      const data = await res.json()
      assert.strictEqual(data.success, true)
      assert.strictEqual(data.count, 2)
    })
  })

  describe('Bonafide Certificate Generator & Trust Gateway (Feature 45)', () => {
    let generatedCertId

    test('POST /api/v1/certificates/generate generates cert with dynamic QR code', async () => {
      const payload = {
        studentName: 'Ananya Sharma',
        rollNumber: 'SS26-CSE-042',
        courseName: 'B.Tech Computer Science',
        academicYear: '2025-2026',
        issuePurpose: 'Passport Application',
        cgpa: 9.24
      }

      const res = await fetch(`${baseUrl}/api/v1/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      assert.strictEqual(res.status, 201)
      const data = await res.json()
      assert.strictEqual(data.success, true)
      assert.ok(data.certificate.certId.startsWith('BONA-'))
      assert.ok(data.certificate.qrCodeDataUrl.startsWith('data:image/png;base64,'))
      assert.strictEqual(data.certificate.studentName, 'Ananya Sharma')
      generatedCertId = data.certificate.certId
    })

    test('GET /api/v1/certificates/verify/:certId verifies newly generated certificate', async () => {
      assert.ok(generatedCertId)
      const res = await fetch(`${baseUrl}/api/v1/certificates/verify/${generatedCertId}`)

      assert.strictEqual(res.status, 200)
      const data = await res.json()
      assert.strictEqual(data.verified, true)
      assert.strictEqual(data.certificate.certId, generatedCertId)
      assert.strictEqual(data.certificate.status, 'VALID')
    })

    test('GET /api/v1/certificates/verify/:certId returns 404 for nonexistent certificate', async () => {
      const res = await fetch(`${baseUrl}/api/v1/certificates/verify/NONEXISTENT-ID`)
      assert.strictEqual(res.status, 404)
      const data = await res.json()
      assert.strictEqual(data.verified, false)
    })
  })

  describe('Fee Defaulter Auto-Escalation (Feature 58)', () => {
    test('POST /api/v1/fee-reminders/auto-escalate flags defaulters with >= 60 days overdue', async () => {
      const res = await fetch(`${baseUrl}/api/v1/fee-reminders/auto-escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      assert.strictEqual(res.status, 200)
      const data = await res.json()
      assert.strictEqual(data.success, true)
      assert.ok(data.escalationCount >= 1)
      assert.ok(data.escalations.some((e) => e.daysOverdue >= 60))
      assert.ok(data.escalations.every((e) => e.escalatedTo.includes('HOD')))
    })
  })
})
