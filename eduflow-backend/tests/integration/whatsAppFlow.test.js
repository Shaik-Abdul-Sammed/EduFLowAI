import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../../src/app.js'
import { WhatsAppWebhookController } from '../../src/controllers/WhatsAppWebhookController.js'
import { WhatsAppAttendance } from '../../src/services/attendance/WhatsAppAttendance.js'
import { processConfirmedStagedAttendance } from '../../src/workers/whatsappAttendanceProcessor.js'

describe('WhatsApp Attendance Integration Flow', () => {
  const app = createApp()

  beforeEach(() => {
    WhatsAppAttendance.clearStores()
  })

  test('GET /api/v1/whatsapp/webhook responds to Meta challenge verification', () => {
    let sentChallenge = null
    let statusCode = null
    WhatsAppWebhookController.verifyWebhook({
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'eduflow_verify_token',
        'hub.challenge': 'CHALLENGE_ACCEPTED_12345'
      }
    }, {
      status: (code) => {
        statusCode = code
        return { send: (c) => { sentChallenge = c } }
      }
    })

    assert.equal(statusCode, 200)
    assert.equal(sentChallenge, 'CHALLENGE_ACCEPTED_12345')
  })

  test('POST /api/v1/whatsapp/webhook stages attendance and replies with confirmation prompt', async () => {
    let resBody = null
    let statusCode = null

    await WhatsAppWebhookController.handleInboundMessage({
      body: {
        From: 'whatsapp:+919876543210',
        To: 'whatsapp:+919900011222',
        Body: 'CSE 3A present 45 absent 5'
      }
    }, {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    })

    assert.equal(statusCode, 200)
    assert.equal(resBody.success, true)
    assert.equal(resBody.staged, true)
    assert.ok(resBody.reply.includes('Reply YES to confirm or NO to cancel'))
  })

  test('POST /api/v1/whatsapp/webhook with YES confirms staged attendance and processor marks PROCESSED', async () => {
    // 1. Stage message
    await WhatsAppWebhookController.handleInboundMessage({
      body: {
        From: 'whatsapp:+919876543210',
        Body: 'CS301 25/30'
      }
    }, {
      status: () => ({ json: () => {} })
    })

    // 2. Confirm with YES
    let confirmBody = null
    await WhatsAppWebhookController.handleInboundMessage({
      body: {
        From: 'whatsapp:+919876543210',
        Body: 'YES'
      }
    }, {
      status: () => ({ json: (d) => { confirmBody = d } })
    })

    assert.equal(confirmBody.success, true)
    assert.equal(confirmBody.action, 'CONFIRMED')

    // 3. Background processor ensures record is processed
    await processConfirmedStagedAttendance()

    // Check memory store status is now PROCESSED
    const stagedList = WhatsAppAttendance.getStagedStore()
    const found = stagedList.find(s => s.status === 'PROCESSED')
    assert.ok(found, 'Record should be marked PROCESSED')
  })

  test('GET /api/v1/whatsapp/status returns system status and simulator mode', () => {
    let resBody = null
    WhatsAppWebhookController.getStatus({}, {
      status: () => ({ json: (d) => { resBody = d } })
    })

    assert.ok(resBody.service)
    assert.ok(resBody.webhookUrl)
    assert.equal(resBody.activeFacultyCount, 5)
  })
})
