import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { requireFinanceScope, requireDepartmentScope } from '../../src/middleware/auth.js'

describe('Unit: Finance Role Scoping Middleware', () => {
  test('requireFinanceScope allows user with matching finance_scope', () => {
    let nextCalled = false
    const req = {
      user: {
        id: 10,
        role: 'finance_officer',
        financeScope: 'INSTITUTION'
      }
    }
    const res = {
      status: () => res,
      json: () => {}
    }
    const next = () => { nextCalled = true }

    const middleware = requireFinanceScope('INSTITUTION')
    middleware(req, res, next)

    assert.equal(nextCalled, true)
  })

  test('requireFinanceScope allows user with INSTITUTION scope access to any scope', () => {
    let nextCalled = false
    const req = {
      user: {
        id: 11,
        role: 'finance_officer',
        financeScope: 'INSTITUTION'
      }
    }
    const res = {
      status: () => res,
      json: () => {}
    }
    const next = () => { nextCalled = true }

    const middleware = requireFinanceScope('HOSTEL')
    middleware(req, res, next)

    assert.equal(nextCalled, true)
  })

  test('requireFinanceScope rejects user without required scope', () => {
    let statusCode = null
    let responseBody = null
    const req = {
      user: {
        id: 12,
        role: 'accounts_staff',
        financeScope: 'HOSTEL'
      }
    }
    const res = {
      status: (code) => {
        statusCode = code
        return res
      },
      json: (data) => {
        responseBody = data
      }
    }
    const next = () => {}

    const middleware = requireFinanceScope('EXAMINATION')
    middleware(req, res, next)

    assert.equal(statusCode, 403)
    assert.ok(responseBody.error.includes('Insufficient finance scope'))
  })

  test('requireDepartmentScope allows matching department and blocks mismatch', () => {
    let nextCalled = false
    const reqMatch = {
      user: { id: 20, role: 'hod', department: 'CSE' },
      query: { department: 'CSE' }
    }
    const res = { status: () => res, json: () => {} }
    requireDepartmentScope(reqMatch, res, () => { nextCalled = true })
    assert.equal(nextCalled, true)

    let blockedCode = null
    const reqMismatch = {
      user: { id: 20, role: 'hod', department: 'CSE' },
      query: { department: 'ECE' }
    }
    const resBlocked = {
      status: (c) => { blockedCode = c; return resBlocked },
      json: () => {}
    }
    requireDepartmentScope(reqMismatch, resBlocked, () => {})
    assert.equal(blockedCode, 403)
  })
})
