import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Unit: Officer Streaming Edge Cases', () => {
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

  it('empty prompt returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/officers/accreditation/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ prompt: '' }),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('prompt over 5000 characters returns 400', async () => {
    const oversizedPrompt = 'A'.repeat(5001)
    const res = await fetch(`${baseUrl}/api/v1/officers/accreditation/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ prompt: oversizedPrompt }),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('invalid officer type returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/officers/non-existent-officer/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ prompt: 'Generate report' }),
    })

    assert.equal(res.status, 404)
  })

  it('client disconnect mid-stream does not crash backend', async () => {
    const controller = new AbortController()
    const resPromise = fetch(`${baseUrl}/api/v1/officers/student-success/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reportType: 'Dropout risk analysis' }),
      signal: controller.signal,
    })

    // Abort after 50ms while streaming
    setTimeout(() => controller.abort(), 50)

    try {
      await resPromise
    } catch {
      // Fetch aborted as expected
    }

    // Verify backend is alive and responsive
    const health = await fetch(`${baseUrl}/api/health`)
    assert.equal(health.status, 200)
  })

  it('concurrent 5 streams do not interleave tokens', async () => {
    const officerTypes = ['accreditation', 'student-success', 'timetable', 'admissions', 'finance']

    const streamPromises = officerTypes.map(async (type) => {
      const res = await fetch(`${baseUrl}/api/v1/officers/${type}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ reportType: `${type} analysis` }),
      })

      assert.equal(res.status, 200)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let streamText = ''
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (readerDone) break
        streamText += decoder.decode(value, { stream: true })
        if (streamText.includes('"type":"done"')) {
          done = true
        }
      }

      return { type, streamText }
    })

    const results = await Promise.all(streamPromises)
    assert.equal(results.length, 5)

    for (const res of results) {
      assert.ok(res.streamText.length > 0, `Expected content for stream ${res.type}`)
      // Each stream must parse cleanly into valid SSE data chunks
      const lines = res.streamText.split('\n').filter((l) => l.startsWith('data: '))
      for (const line of lines) {
        const json = JSON.parse(line.replace('data: ', ''))
        assert.ok(['thinking', 'token', 'done', 'error'].includes(json.type))
      }
    }
  })
})
