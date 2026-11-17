import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { classifyPresence } from '../../src/services/presence.js'

describe('P0.3 — Presence 3-Band Confidence Classifier', () => {
  const SESSION_SECONDS = 3600 // 1 hour

  test('ratio 0.85 + valid code + in-room → present/high', () => {
    const result = classifyPresence({
      dwellSeconds: 0.85 * SESSION_SECONDS,
      sessionSeconds: SESSION_SECONDS,
      inRoomRssi: true,
      validCodeCount: 1
    })

    assert.strictEqual(result.status, 'present')
    assert.strictEqual(result.confidence, 'high')
    assert.strictEqual(result.reason, 'dwell_ok')
  })

  test('ratio 0.55 + valid code + in-room → needs_review/medium', () => {
    const result = classifyPresence({
      dwellSeconds: 0.55 * SESSION_SECONDS,
      sessionSeconds: SESSION_SECONDS,
      inRoomRssi: true,
      validCodeCount: 1
    })

    assert.strictEqual(result.status, 'needs_review')
    assert.strictEqual(result.confidence, 'medium')
    assert.strictEqual(result.reason, 'partial_dwell')
  })

  test('ratio 0.55 + no valid code → needs_review/low', () => {
    const result = classifyPresence({
      dwellSeconds: 0.55 * SESSION_SECONDS,
      sessionSeconds: SESSION_SECONDS,
      inRoomRssi: true,
      validCodeCount: 0
    })

    assert.strictEqual(result.status, 'needs_review')
    assert.strictEqual(result.confidence, 'low')
    assert.strictEqual(result.reason, 'no_session_code')
  })

  test('out-of-room RSSI → absent/high regardless of dwell', () => {
    const result = classifyPresence({
      dwellSeconds: 0.95 * SESSION_SECONDS,
      sessionSeconds: SESSION_SECONDS,
      inRoomRssi: false,
      validCodeCount: 2
    })

    assert.strictEqual(result.status, 'absent')
    assert.strictEqual(result.confidence, 'high')
    assert.strictEqual(result.reason, 'out_of_zone')
  })
})
