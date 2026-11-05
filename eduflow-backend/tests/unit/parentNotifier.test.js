import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'
import { JWT_SECRET } from '../../src/middleware/auth.js'

async function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address()
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      })
    })
  })
}

function makeToken(role = 'admin') {
  return jwt.sign(
    { id: 1, email: 'admin@college.edu', role, institutionId: 101 },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

describe('Parent Notifier & GuardianWatch API Suite', () => {
  it('triggers automated parent alerts for attendance below threshold (default 75%)', async () => {
    const app = createApp({ db: { query: async () => ({ rows: [] }) } })
    const { server, baseUrl } = await startServer(app)
    const token = makeToken('admin')

    try {
      const res = await fetch(`${baseUrl}/api/v1/guardianwatch/trigger-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threshold: 75 }),
      })

      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.success, true)
      assert.match(data.message, /Threshold: <75%/)
      assert.equal(typeof data.details.flaggedStudents, 'number')
      assert.equal(typeof data.details.alertsDispatched, 'number')
      assert.ok(data.details.alertsDispatched > 0, 'Should dispatch simulated SMS/WhatsApp alerts')
    } finally {
      server.close()
    }
  })

  it('triggers automated parent alerts with custom critical threshold (< 65%)', async () => {
    const app = createApp({ db: { query: async () => ({ rows: [] }) } })
    const { server, baseUrl } = await startServer(app)
    const token = makeToken('faculty')

    try {
      const res = await fetch(`${baseUrl}/api/v1/guardianwatch/trigger-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threshold: 65 }),
      })

      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.success, true)
      assert.match(data.message, /Threshold: <65%/)
    } finally {
      server.close()
    }
  })

  it('generates an AI-synthesized monthly progress report for a student', async () => {
    const app = createApp({ db: { query: async () => ({ rows: [] }) } })
    const { server, baseUrl } = await startServer(app)
    const token = makeToken('admin')

    try {
      const res = await fetch(`${baseUrl}/api/v1/guardianwatch/generate-progress-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: 'STU-2026-042', month: 'October 2026' }),
      })

      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.success, true)
      assert.equal(data.report.studentId, 'STU-2026-042')
      assert.equal(data.report.month, 'October 2026')
      assert.ok(data.report.attendance, 'Should report attendance percentage')
      assert.ok(data.report.aiInsights, 'Should contain AI insights for guardians')
      assert.ok(data.report.reportUrl, 'Should provide downloadable PDF progress report URL')
    } finally {
      server.close()
    }
  })

  it('rejects progress report generation when studentId or month is missing', async () => {
    const app = createApp({ db: { query: async () => ({ rows: [] }) } })
    const { server, baseUrl } = await startServer(app)
    const token = makeToken('faculty')

    try {
      const res = await fetch(`${baseUrl}/api/v1/guardianwatch/generate-progress-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: 'STU-2026-042' }),
      })

      assert.equal(res.status, 400)
      const data = await res.json()
      assert.equal(data.error, 'studentId and month are required')
    } finally {
      server.close()
    }
  })

  it('blocks unauthorized access when no JWT token is supplied', async () => {
    const app = createApp({ db: { query: async () => ({ rows: [] }) } })
    const { server, baseUrl } = await startServer(app)

    try {
      const res = await fetch(`${baseUrl}/api/v1/guardianwatch/trigger-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: 75 }),
      })

      assert.equal(res.status, 401)
    } finally {
      server.close()
    }
  })

  it('forbids student accounts from triggering guardian watch alerts', async () => {
    const app = createApp({ db: { query: async () => ({ rows: [] }) } })
    const { server, baseUrl } = await startServer(app)
    const token = makeToken('student')

    try {
      const res = await fetch(`${baseUrl}/api/v1/guardianwatch/trigger-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threshold: 75 }),
      })

      assert.equal(res.status, 403)
    } finally {
      server.close()
    }
  })
})
