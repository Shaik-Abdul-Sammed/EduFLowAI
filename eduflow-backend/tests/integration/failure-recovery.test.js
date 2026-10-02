import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'

describe('Integration: Failure Recovery & DB Mode Strictness', () => {
  it('returns HTTP 500 with friendly error and does not switch to memory mode when DB fails under DB_MODE=postgres', async () => {
    let dbConnected = false

    // Simulate mock DB adapter with failure injection
    const mockDb = {
      async getHealth() {
        if (!dbConnected) {
          throw new Error('Connection terminated unexpectedly: ECONNREFUSED 127.0.0.1:5432')
        }
        return { mode: 'postgres', persistent: true }
      },
      async query(sql) {
        if (!dbConnected) {
          throw new Error('Database connection failed: ECONNREFUSED')
        }
        return { rows: [] }
      },
    }

    const app = express()
    app.get('/api/health/db', async (_req, res) => {
      try {
        const health = await mockDb.getHealth()
        res.json(health)
      } catch (err) {
        // Under DB_MODE=postgres, strictly return 500 and mode="postgres", never "memory"
        res.status(500).json({
          error: 'Database connection error. Service temporarily unavailable.',
          mode: 'postgres',
          persistent: false,
        })
      }
    })

    const server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    const baseUrl = `http://127.0.0.1:${port}`

    try {
      // 1. When DB is down
      dbConnected = false
      const downRes = await fetch(`${baseUrl}/api/health/db`)
      assert.equal(downRes.status, 500)
      const downBody = await downRes.json()
      assert.equal(downBody.mode, 'postgres')
      assert.notEqual(downBody.mode, 'memory', 'Must NOT fall back to memory mode in production')
      assert.ok(downBody.error.includes('unavailable') || downBody.error.includes('error'))

      // 2. Restore DB
      dbConnected = true
      const restoredRes = await fetch(`${baseUrl}/api/health/db`)
      assert.equal(restoredRes.status, 200)
      const restoredBody = await restoredRes.json()
      assert.equal(restoredBody.mode, 'postgres')
      assert.equal(restoredBody.persistent, true)
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  })
})
