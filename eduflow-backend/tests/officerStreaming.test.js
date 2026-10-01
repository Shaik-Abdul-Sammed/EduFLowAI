import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { createApp } from '../src/app.js'

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

function makeAdminToken() {
  return jwt.sign(
    { id: 1, email: 'admin@ssit.edu.in', role: 'admin', institutionId: '1' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

function startServer(app) {
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

async function parseSSEStream(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const events = []
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('data:')) {
        const jsonStr = trimmed.slice(5).trim()
        if (jsonStr) {
          try {
            events.push(JSON.parse(jsonStr))
          } catch {}
        }
      }
    }
  }
  return events
}

test('Streaming SSE: all 5 AI officer streaming endpoints return valid event streams', async (t) => {
  const fakeDb = {
    query: async () => ({ rows: [] }),
  }
  const app = createApp({ db: fakeDb })
  const { server, baseUrl } = await startServer(app)
  const token = makeAdminToken()

  try {
    await t.test('POST /api/v1/officers/accreditation/stream', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/accreditation/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportType: 'NAAC Criteria 3 SSR Analysis for SSIT' }),
      })

      assert.equal(res.status, 200)
      assert.ok(res.headers.get('content-type')?.includes('text/event-stream'))

      const events = await parseSSEStream(res)
      assert.ok(events.length > 0)
      assert.equal(events[0].type, 'thinking')

      const doneEvent = events.find((e) => e.type === 'done')
      assert.ok(doneEvent, 'Must include done event')
      assert.equal(doneEvent.officerType, 'accreditation')
      assert.equal(doneEvent.roi.hoursSaved, 120)
      assert.equal(doneEvent.roi.moneySaved, 300000)
    })

    await t.test('POST /api/v1/officers/student-success/stream', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/student-success/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'Run institutional dropout risk analysis for semester 4' }),
      })

      assert.equal(res.status, 200)
      assert.ok(res.headers.get('content-type')?.includes('text/event-stream'))

      const events = await parseSSEStream(res)
      const doneEvent = events.find((e) => e.type === 'done')
      assert.ok(doneEvent)
      assert.equal(doneEvent.officerType, 'student-success')
      assert.equal(doneEvent.roi.hoursSaved, 10)
    })

    await t.test('POST /api/v1/officers/timetable/stream', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/timetable/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'Generate conflict-free timetable for CSE Department' }),
      })

      assert.equal(res.status, 200)
      assert.ok(res.headers.get('content-type')?.includes('text/event-stream'))

      const events = await parseSSEStream(res)
      const doneEvent = events.find((e) => e.type === 'done')
      assert.ok(doneEvent)
      assert.equal(doneEvent.officerType, 'timetable')
      assert.equal(doneEvent.roi.hoursSaved, 40)
    })

    await t.test('POST /api/v1/officers/admissions/stream', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/admissions/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'Analyze application yield and predict final enrollment' }),
      })

      assert.equal(res.status, 200)
      assert.ok(res.headers.get('content-type')?.includes('text/event-stream'))

      const events = await parseSSEStream(res)
      const doneEvent = events.find((e) => e.type === 'done')
      assert.ok(doneEvent)
      assert.equal(doneEvent.officerType, 'admissions')
      assert.equal(doneEvent.roi.hoursSaved, 0.5)
    })

    await t.test('POST /api/v1/officers/finance/stream', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/finance/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'Reconcile fee collection against bank deposits for March 2026' }),
      })

      assert.equal(res.status, 200)
      assert.ok(res.headers.get('content-type')?.includes('text/event-stream'))

      const events = await parseSSEStream(res)
      const doneEvent = events.find((e) => e.type === 'done')
      assert.ok(doneEvent)
      assert.equal(doneEvent.officerType, 'finance')
      assert.equal(doneEvent.roi.hoursSaved, 4)
    })

    await t.test('POST /api/v1/officers/accreditation/stream rejects without auth', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/accreditation/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: 'Test' }),
      })
      assert.equal(res.status, 401)
    })

    await t.test('POST /api/v1/officers/accreditation/export-pdf returns valid PDF binary', async () => {
      const res = await fetch(`${baseUrl}/api/v1/officers/accreditation/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: 'Criterion 3 SSR Analysis\nMetric 3.1: 14 seed grants disbursed.',
          institutionName: 'Sri Siddhartha Institute of Technology',
        }),
      })

      assert.equal(res.status, 200)
      assert.equal(res.headers.get('content-type'), 'application/pdf')
      assert.ok(res.headers.get('content-disposition')?.includes('attachment; filename='))

      const buf = await res.arrayBuffer()
      const header = Buffer.from(buf).subarray(0, 8).toString()
      assert.ok(header.startsWith('%PDF-1.'))
    })
  } finally {
    server.close()
  }

})
