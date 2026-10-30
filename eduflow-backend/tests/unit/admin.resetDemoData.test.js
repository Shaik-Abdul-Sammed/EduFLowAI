import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../../src/app.js'

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address()
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` })
    })
  })
}

test('Unit: /api/v1/admin/reset-demo-data rejects unauthorized GET requests without secret', async () => {
  const { server, baseUrl } = await startServer(createApp())
  try {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data`)
    assert.equal(res.status, 401)
    const json = await res.json()
    assert.match(json.error, /Unauthorized/)
  } finally {
    server.close()
  }
})

test('Unit: /api/v1/admin/reset-demo-data rejects invalid secret', async () => {
  const { server, baseUrl } = await startServer(createApp())
  try {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data?secret=wrongsecret`)
    assert.equal(res.status, 401)
    const json = await res.json()
    assert.match(json.error, /Unauthorized/)
  } finally {
    server.close()
  }
})

test('Unit: /api/v1/admin/reset-demo-data allows GET request with secret=eduflow2026', async () => {
  const { server, baseUrl } = await startServer(createApp())
  try {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data?secret=eduflow2026`)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.success, true)
    assert.match(json.message, /Demo dataset successfully wiped and re-seeded/)
  } finally {
    server.close()
  }
})

test('Unit: /api/v1/admin/reset-demo-data allows POST request with secret=eduflow2026', async () => {
  const { server, baseUrl } = await startServer(createApp())
  try {
    const res = await fetch(`${baseUrl}/api/v1/admin/reset-demo-data?secret=eduflow2026`, {
      method: 'POST',
    })
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.success, true)
  } finally {
    server.close()
  }
})
