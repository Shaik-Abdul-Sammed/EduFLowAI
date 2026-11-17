import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  roomCalibrations,
  computeCalibration,
  isRssiInRoom
} from '../../src/services/presence.js'

describe('P1.1 — Per-room RSSI Calibration', () => {
  beforeEach(() => {
    roomCalibrations.clear()
  })

  test('calibration requires >=10 samples; rejects fewer with 400', () => {
    const insufficientSamples = [
      { rssi: -65 },
      { rssi: -66 },
      { rssi: -67 }
    ]

    assert.throws(
      () => computeCalibration(insufficientSamples),
      (err) => {
        assert.strictEqual(err.statusCode, 400)
        assert.match(err.message, /at least 10 samples/i)
        return true
      }
    )

    assert.throws(
      () => computeCalibration([]),
      (err) => {
        assert.strictEqual(err.statusCode, 400)
        return true
      }
    )
  })

  test('calibration computes minDbm/maxDbm correctly from samples', () => {
    // 10 samples: [-60, -62, -64, -66, -68, -70, -72, -74, -76, -78]
    // mean = -69
    // sum squared diffs = 9^2 + 7^2 + 5^2 + 3^2 + 1^2 + 1^2 + 3^2 + 5^2 + 7^2 + 9^2 = 81+49+25+9+1 + 1+9+25+49+81 = 330
    // variance = 330 / 10 = 33
    // stddev = sqrt(33) = ~5.74456...
    // minDbm = mean - 2*stddev = -69 - 11.49 = -80.49
    // maxDbm = mean + stddev = -69 + 5.74 = -63.26
    const samples = [-60, -62, -64, -66, -68, -70, -72, -74, -76, -78]
    const result = computeCalibration(samples)

    assert.strictEqual(result.sampleCount, 10)
    assert.strictEqual(result.meanDbm, -69)
    assert.ok(Math.abs(result.stddevDbm - 5.74) < 0.05)
    assert.strictEqual(result.minDbm, -80.49)
    assert.strictEqual(result.maxDbm, -63.26)
  })

  test('uses room-specific calibration when present', () => {
    const roomId = 'ROOM-LH-201'
    roomCalibrations.set(roomId, {
      roomId,
      minDbm: -82.0,
      maxDbm: -60.0,
      calibratedAt: new Date().toISOString()
    })

    // Inside calibrated range
    const checkInside = isRssiInRoom({ roomId, rssi: -70 })
    assert.strictEqual(checkInside.calibrated, true)
    assert.strictEqual(checkInside.inRoom, true)
    assert.strictEqual(checkInside.minDbm, -82.0)
    assert.strictEqual(checkInside.maxDbm, -60.0)

    // Outside calibrated range
    const checkOutside = isRssiInRoom({ roomId, rssi: -85 })
    assert.strictEqual(checkOutside.calibrated, true)
    assert.strictEqual(checkOutside.inRoom, false)
  })

  test('falls back to global default with a warning log when room uncalibrated', () => {
    const warnings = []
    const mockLogger = {
      warn: (msg) => warnings.push(msg)
    }

    const check = isRssiInRoom({
      roomId: 'ROOM-UNCALIBRATED-999',
      rssi: -72,
      fallbackMinDbm: -75,
      fallbackMaxDbm: -30,
      logger: mockLogger
    })

    assert.strictEqual(check.calibrated, false)
    assert.strictEqual(check.inRoom, true)
    assert.strictEqual(check.minDbm, -75)
    assert.strictEqual(check.maxDbm, -30)
    assert.ok(warnings.length > 0)
    assert.match(warnings[0], /not calibrated/i)
    assert.match(check.warning, /not calibrated/i)
  })
})
