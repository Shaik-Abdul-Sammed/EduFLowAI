import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { computeSessionHealth } from '../../src/services/presence.js'

describe('P2.2 — Low-Confidence Session Health Banner', () => {
  test('computes session health accurately from pulses', () => {
    const health = computeSessionHealth({
      totalStudents: 100,
      needsReviewCount: 15,
      validCodeCount: 85
    })

    assert.strictEqual(health.totalStudents, 100)
    assert.strictEqual(health.needsReviewCount, 15)
    assert.strictEqual(health.validCodeCount, 85)
    assert.strictEqual(health.needsReviewPct, 15.0)
    assert.strictEqual(health.validCodeCoverage, 85.0)
    assert.strictEqual(health.isDegraded, false)
  })

  test('flags degraded health when needs_review > 20%', () => {
    // 25 students out of 100 need review (25% > 20%)
    const health = computeSessionHealth({
      totalStudents: 100,
      needsReviewCount: 25,
      validCodeCount: 75
    })

    assert.strictEqual(health.isDegraded, true)
    assert.match(health.reason, /Session signal quality degraded/i)
    assert.match(health.reason, /25% students need review/)
  })

  test('flags degraded health when valid_code_coverage < 60%', () => {
    // only 50 out of 100 students have valid codes (50% < 60%)
    const health = computeSessionHealth({
      totalStudents: 100,
      needsReviewCount: 10,
      validCodeCount: 50
    })

    assert.strictEqual(health.isDegraded, true)
    assert.match(health.reason, /Session signal quality degraded/i)
    assert.match(health.reason, /50% code coverage/)
  })

  test('healthy session does NOT flag degradation', () => {
    // 5% need review, 95% valid codes
    const health = computeSessionHealth({
      totalStudents: 100,
      needsReviewCount: 5,
      validCodeCount: 95
    })

    assert.strictEqual(health.isDegraded, false)
    assert.strictEqual(health.reason, 'Session signal quality healthy')
  })
})
