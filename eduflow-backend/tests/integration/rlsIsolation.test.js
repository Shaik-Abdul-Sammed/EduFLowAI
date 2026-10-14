import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { pool, runWithInstitutionContext } from '../../src/db/pool.js'

describe('Integration: Multi-Tenant Database Row-Level Security (RLS)', () => {
  test('User from Institution 1 only receives Institution 1 rows', async () => {
    await runWithInstitutionContext({ institutionId: 1, bypassRls: false }, async () => {
      const res = await pool.query('SELECT * FROM invoices')
      assert.ok(res.rows.length > 0)
      for (const row of res.rows) {
        assert.equal(Number(row.institution_id), 1)
      }
    })
  })

  test('User from Institution 2 only receives Institution 2 rows', async () => {
    await runWithInstitutionContext({ institutionId: 2, bypassRls: false }, async () => {
      const res = await pool.query('SELECT * FROM invoices')
      assert.ok(res.rows.length > 0)
      for (const row of res.rows) {
        assert.equal(Number(row.institution_id), 2)
      }
    })
  })

  test('SQL injection removing WHERE clause is still contained by database RLS', async () => {
    // Malicious query attempting to fetch all records across all institutions:
    // SELECT * FROM invoices WHERE 1=1 OR 1=1
    await runWithInstitutionContext({ institutionId: 1, bypassRls: false }, async () => {
      const res = await pool.query("SELECT * FROM invoices WHERE '1'='1' OR 'admin'='admin'")
      assert.ok(res.rows.length > 0)
      // Database-level RLS policy ensures NO rows from institution 2 leak
      for (const row of res.rows) {
        assert.equal(Number(row.institution_id), 1)
      }
    })
  })

  test('Cross-tenant query allowed only when app.bypass_rls is explicitly enabled', async () => {
    await runWithInstitutionContext({ institutionId: 1, bypassRls: true }, async () => {
      const res = await pool.query('SELECT * FROM invoices')
      // When explicitly bypassed for superadmin/analytics, all tenant rows can be viewed
      assert.ok(res.rows.length >= 2)
      const institutionIds = res.rows.map(r => Number(r.institution_id))
      assert.ok(institutionIds.includes(1))
      assert.ok(institutionIds.includes(2))
    })
  })
})
