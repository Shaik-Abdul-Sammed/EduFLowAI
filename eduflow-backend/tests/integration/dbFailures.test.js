import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AuthController } from '../../src/controllers/AuthController.js'
import { pool } from '../../src/db/pool.js'

describe('Integration: Database Transaction Failures & Rollback', () => {
  it('mocks a database failure halfway through bulkImportStudents and verifies ROLLBACK is executed without partial saves', async () => {
    const executedQueries = []
    let rollbackCalled = false
    let commitCalled = false
    let releasedCalled = false

    // Mock client simulating failure on the second batch insert
    const mockClient = {
      query: async (sql, params) => {
        const normalized = typeof sql === 'string' ? sql.trim().toUpperCase() : ''
        executedQueries.push({ sql: normalized, params })

        if (normalized === 'BEGIN') {
          return { rowCount: 0 }
        }
        if (normalized.startsWith('INSERT INTO STUDENTS')) {
          // If query has second batch, simulate constraint / deadlock failure halfway
          if (executedQueries.filter(q => q.sql.startsWith('INSERT INTO STUDENTS')).length >= 2) {
            throw new Error('Deadlock detected / DB connection lost halfway through batch 2')
          }
          return { rowCount: 500 }
        }
        if (normalized === 'COMMIT') {
          commitCalled = true
          return { rowCount: 0 }
        }
        if (normalized === 'ROLLBACK') {
          rollbackCalled = true
          return { rowCount: 0 }
        }
        return { rows: [] }
      },
      release: () => {
        releasedCalled = true
      }
    }

    // Preserve original connect
    const originalConnect = pool.connect
    pool.connect = async () => mockClient

    try {
      // Create dataset with 600 students to force at least 2 batches (batch size = 500)
      const students = Array.from({ length: 600 }, (_, idx) => ({
        rollNumber: `2024-TEST-${String(idx).padStart(4, '0')}`,
        name: `Test Scholar ${idx}`,
        email: `scholar${idx}@demo.edu`,
        dob: '15082004',
        department: 'Computer Science'
      }))

      const req = {
        body: {
          students,
          institutionId: 1
        }
      }

      let responseStatusCode = null
      let responseBody = null

      const res = {
        status: (code) => {
          responseStatusCode = code
          return {
            json: (payload) => {
              responseBody = payload
              return payload
            }
          }
        }
      }

      await AuthController.bulkImportStudents(req, res)

      // Assertions
      assert.equal(responseStatusCode, 500, 'Expected 500 status on database failure')
      assert.ok(responseBody?.error?.includes('Bulk import failed'), 'Should return structured bulk import failure error')
      assert.ok(rollbackCalled, 'Expected ROLLBACK query to be explicitly executed on failure')
      assert.equal(commitCalled, false, 'COMMIT must NOT be executed on partial transaction failure')
      assert.ok(releasedCalled, 'Database client must be released cleanly back to the pool')
    } finally {
      // Restore original connect
      pool.connect = originalConnect
    }
  })

  it('rejects empty student payloads without opening or leaking database transactions', async () => {
    let connectCalled = false
    const originalConnect = pool.connect
    pool.connect = async () => {
      connectCalled = true
      return {}
    }

    try {
      const req = { body: { students: [] } }
      let statusCode = null
      let jsonPayload = null

      const res = {
        status: (code) => {
          statusCode = code
          return {
            json: (p) => {
              jsonPayload = p
              return p
            }
          }
        }
      }

      await AuthController.bulkImportStudents(req, res)
      assert.equal(statusCode, 400)
      assert.equal(connectCalled, false, 'No DB connection should be acquired for invalid request')
      assert.ok(jsonPayload?.error)
    } finally {
      pool.connect = originalConnect
    }
  })
})
