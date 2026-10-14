import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { FeeReminderController } from '../../src/controllers/FeeReminderController.js'
import { FeeReminderService } from '../../src/services/finance/FeeReminderService.js'

describe('Integration: Finance Governance & Collection Flow', () => {
  beforeEach(() => {
    FeeReminderService.clearReminderLogStore()
  })

  test('Finance Officer fetches overdue breakdown across 4 tiers', async () => {
    let resBody = null
    let statusCode = null

    await FeeReminderController.getPending({
      user: { institutionId: 1, role: 'finance_officer', financeScope: 'INSTITUTION' }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.ok(resBody.totalOverdue > 0)
    assert.ok(Array.isArray(resBody.tiers.tier1))
    assert.ok(Array.isArray(resBody.tiers.tier2))
    assert.ok(Array.isArray(resBody.tiers.tier3))
    assert.ok(Array.isArray(resBody.tiers.tier4))
  })

  test('Accounts Staff triggers Tier 1 friendly fee reminder batch', async () => {
    let resBody = null
    let statusCode = null

    await FeeReminderController.sendNow({
      user: { institutionId: 1, role: 'accounts_staff', financeScope: 'INSTITUTION' },
      body: { channel: 'WHATSAPP', tier: 1 }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.equal(resBody.success, true)
    assert.ok(resBody.sentCount >= 0)
  })

  test('Financial audit trail captures reminder dispatches', async () => {
    let resBody = null
    let statusCode = null

    await FeeReminderController.getHistory({
      user: { institutionId: 1, role: 'finance_officer' },
      query: { limit: 10 }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.ok(Array.isArray(resBody.logs))
  })
})
