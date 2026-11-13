import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../../src/app.js'

describe('Unit: /api/v1/admin/reset-demo-data', () => {
  let server
  let baseUrl

  before(async () => {
    const app = createApp()
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address()
        baseUrl = `http://127.0.0.1:${port}`
        resolve()
      })
    })
  })

  after(async () => {
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections()
      }
      await new Promise((resolve) => server.close(resolve))
    }
  })

  it('rejects unauthorized GET requests without secret', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data`)
    assert.equal(res.status, 401)
    const json = await res.json()
    assert.match(json.error, /Unauthorized/)
  })

  it('rejects invalid secret', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data?secret=wrongsecret`)
    assert.equal(res.status, 401)
    const json = await res.json()
    assert.match(json.error, /Unauthorized/)
  })

  it('allows GET request with secret=eduflow2026', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data?secret=eduflow2026`)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.success, true)
    assert.match(json.message, /Demo dataset successfully wiped and re-seeded/)
  })

  it('allows POST request with secret=eduflow2026', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data?secret=eduflow2026`, {
      method: 'POST',
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.success, true)
  })
})
