import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_ACCOUNTS } from '../config/demoCredentials.js'

describe('Demo Credentials Configuration', () => {
  test('DEMO_ACCOUNTS contains exactly 2 entries', () => {
    assert.strictEqual(DEMO_ACCOUNTS.length, 2)
  })

  test('Admin entry has correct email and password', () => {
    const admin = DEMO_ACCOUNTS.find(a => a.id === 'admin')
    assert.ok(admin, 'Admin account must exist')
    assert.strictEqual(admin.email, 'admin@demo.edu')
    assert.strictEqual(admin.password, 'Demo@2026')
  })

  test('Dean entry has correct email and password', () => {
    const dean = DEMO_ACCOUNTS.find(a => a.id === 'dean')
    assert.ok(dean, 'Dean account must exist')
    assert.strictEqual(dean.email, 's9010150809@gmail.com')
    assert.strictEqual(dean.password, 'Demo@2026')
    assert.strictEqual(dean.phone, '9010150809')
  })

  test('Both entries have an id, label, description', () => {
    for (const account of DEMO_ACCOUNTS) {
      assert.ok(account.id && typeof account.id === 'string', 'Account must have an id string')
      assert.ok(account.label && typeof account.label === 'string', 'Account must have a label string')
      assert.ok(account.description && typeof account.description === 'string', 'Account must have a description string')
    }
  })
})
