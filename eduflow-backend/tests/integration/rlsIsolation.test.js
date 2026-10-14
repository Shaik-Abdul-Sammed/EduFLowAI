import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { pool, runWithInstitutionContext } from '../../src/db/pool.js'

describe('Integration: Multi-Tenant Database Row-Level Security (RLS)', () => {
  before(async () => {
    if (!pool.isMemoryMode) {
      try {
        await pool.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS institution_id INTEGER DEFAULT 1')
        await pool.query('UPDATE invoices SET institution_id = 1 WHERE institution_id IS NULL')
        const res1 = await pool.query('SELECT id FROM invoices WHERE institution_id = 1')
        if (res1.rows.length === 0) {
          await pool.query("INSERT INTO invoices (invoice_number, institution_name, contact_email, total_amount, institution_id) VALUES ('INV-RLS-001', 'Inst 1', 'test1@demo.edu', 1000, 1) ON CONFLICT DO NOTHING")
        }
        const res2 = await pool.query('SELECT id FROM invoices WHERE institution_id = 2')
        if (res2.rows.length === 0) {
          await pool.query("INSERT INTO invoices (invoice_number, institution_name, contact_email, total_amount, institution_id) VALUES ('INV-RLS-002', 'Inst 2', 'test2@demo.edu', 2000, 2) ON CONFLICT DO NOTHING")
        }
      } catch (e) {
        console.warn('RLS test seed warning:', e.message)
      }
    }
  })

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
    await runWithInstitutionContext({ institutionId: 1, bypassRls: false }, async () => {
      const res = await pool.query("SELECT * FROM invoices WHERE '1'='1' OR 'admin'='admin'")
      assert.ok(res.rows.length > 0)
      for (const row of res.rows) {
        assert.equal(Number(row.institution_id), 1)
      }
    })
  })

  test('Cross-tenant query allowed only when app.bypass_rls is explicitly enabled', async () => {
    await runWithInstitutionContext({ institutionId: 1, bypassRls: true }, async () => {
      const res = await pool.query('SELECT * FROM invoices')
      assert.ok(res.rows.length >= 2)
      const institutionIds = res.rows.map(r => Number(r.institution_id))
      assert.ok(institutionIds.includes(1))
      assert.ok(institutionIds.includes(2))
    })
  })
})
