import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  apSecretStore,
  computeHmacSignature,
  verifyWebhookAuth,
  rotateApSecret
} from '../../src/services/webhookAuth.js'

describe('P1.4 — HMAC Secret Rotation for AP Webhooks', () => {
  const INITIAL_SECRET = 'test-secret-alpha-2026'
  const payload = { apBssid: '00:14:22:01:02:03', deviceInstallId: 'dev-1', rssi: -65 }

  beforeEach(() => {
    apSecretStore.current = INITIAL_SECRET
    apSecretStore.previous = null
    apSecretStore.rotatedAt = null
    apSecretStore.rotationHistory = []
  })

  test('signature matching current secret is accepted', () => {
    const signature = computeHmacSignature(payload, apSecretStore.current)
    const result = verifyWebhookAuth({
      payload,
      signature
    })

    assert.strictEqual(result.valid, true)
    assert.strictEqual(result.secretUsed, 'current')
  })

  test('signature matching previous secret (during rotation) is accepted', () => {
    // Perform secret rotation
    const rotation = rotateApSecret('admin-security')
    assert.strictEqual(apSecretStore.previous, INITIAL_SECRET)
    assert.notStrictEqual(apSecretStore.current, INITIAL_SECRET)

    // Sign with previous secret (simulating AP fleet that hasn't received new key yet)
    const prevSignature = computeHmacSignature(payload, INITIAL_SECRET)
    const result = verifyWebhookAuth({
      payload,
      signature: prevSignature
    })

    assert.strictEqual(result.valid, true)
    assert.strictEqual(result.secretUsed, 'previous')
    assert.ok(result.warning)
  })

  test('signature matching stale/revoked secret is rejected (401)', () => {
    const STALE_SECRET = 'ancient-leaked-secret-2024'
    const staleSignature = computeHmacSignature(payload, STALE_SECRET)

    const logs = []
    const mockLogger = {
      warn: (msg) => logs.push(msg)
    }

    const result = verifyWebhookAuth({
      payload,
      signature: staleSignature,
      logger: mockLogger
    })

    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.code, 'STALE_WEBHOOK_SECRET')
    assert.ok(logs.some(l => l.includes('STALE_WEBHOOK_SECRET')))
  })

  test('rotate endpoint rotates current to previous and sets fresh current', () => {
    const oldCurrent = apSecretStore.current
    const res = rotateApSecret('admin-auditor')

    assert.strictEqual(res.success, true)
    assert.strictEqual(apSecretStore.previous, oldCurrent)
    assert.strictEqual(typeof apSecretStore.current, 'string')
    assert.strictEqual(apSecretStore.current.length, 64) // 32 bytes hex = 64 chars
    assert.notStrictEqual(apSecretStore.current, oldCurrent)
    assert.ok(apSecretStore.rotatedAt)
    assert.strictEqual(apSecretStore.rotationHistory.length, 1)
  })
})
