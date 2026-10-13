import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../../src/app.js'
import { FeeReminderController } from '../../src/controllers/FeeReminderController.js'
import { FeeReminderService } from '../../src/services/finance/FeeReminderService.js'
import { runFeeReminderDailyJob } from '../../src/workers/feeReminderScheduler.js'

describe('Fee Reminder Integration Flow', () => {
  const app = createApp()

  beforeEach(() => {
    FeeReminderService.clearReminderLogStore()
  })

  test('GET /api/v1/fee-reminders/pending returns metrics and categorized tiers', async () => {
    let resBody = null
    let statusCode = null

    await FeeReminderController.getPending({
      user: { institutionId: 1 }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.ok(resBody.totalOverdue > 0)
    assert.ok(resBody.overdueCount > 0)
    assert.ok(resBody.tiers.tier1)
    assert.ok(resBody.tiers.tier2)
    assert.ok(resBody.tiers.tier3)
    assert.ok(resBody.tiers.tier4)
  })

  test('POST /api/v1/fee-reminders/send-now dispatches batch reminders across channels', async () => {
    let resBody = null
    let statusCode = null

    await FeeReminderController.sendNow({
      user: { institutionId: 1 },
      body: {
        channel: 'ALL'
      }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.equal(resBody.success, true)
    assert.ok(resBody.sentCount > 0)
  })

  test('GET /api/v1/fee-reminders/history returns recorded dispatches', async () => {
    // Send one reminder first
    await FeeReminderController.sendNow({
      user: { institutionId: 1 },
      body: { channel: 'EMAIL' }
    }, {
      status: () => ({ json: () => {} })
    })

    let resBody = null
    await FeeReminderController.getHistory({
      user: { institutionId: 1 },
      query: { limit: 50 }
    }, {
      status: () => ({ json: (d) => { resBody = d } })
    })

    assert.ok(Array.isArray(resBody.history))
    assert.ok(resBody.history.length > 0)
  })

  test('daily scheduled job executes automated batch run', async () => {
    const jobRes = await runFeeReminderDailyJob(1)
    assert.equal(jobRes.success, true)
    assert.ok(jobRes.sentCount > 0)
  })
})
