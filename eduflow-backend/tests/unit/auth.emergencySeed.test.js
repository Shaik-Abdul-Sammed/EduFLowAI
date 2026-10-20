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

test('Unit: /api/v1/auth/emergency-seed rejects unauthorized requests without secret', async () => {
  const { server, baseUrl } = await startServer(createApp())
  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/emergency-seed`)
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Unauthorized')
  } finally {
    server.close()
  }
})

test('Unit: /api/v1/auth/emergency-seed rejects invalid secret', async () => {
  const { server, baseUrl } = await startServer(createApp())
  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/emergency-seed?secret=wrongsecret`)
    assert.equal(res.status, 403)
    const json = await res.json()
    assert.equal(json.error, 'Unauthorized')
  } finally {
    server.close()
  }
})
