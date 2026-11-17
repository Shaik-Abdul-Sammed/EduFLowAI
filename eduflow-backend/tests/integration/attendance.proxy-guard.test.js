import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AttendanceController,
  activeSessionCodes,
  sessionReportedDevices,
  sessionPulses
} from '../../src/controllers/AttendanceController.js'

function createMockRes() {
  const mock = {
    statusCode: 200,
    data: null,
    status(code) {
      mock.statusCode = code
      return mock
    },
    json(payload) {
      mock.data = payload
      return mock
    }
  }
  return mock
}

describe('P0.2 — Rotating Session Code Proxy Guard', () => {
  const SESSION_ID = 'session-math101-2026'

  beforeEach(() => {
    activeSessionCodes.clear()
    sessionReportedDevices.clear()
    sessionPulses.clear()
  })

  test('presence report without a valid session code is rejected (400)', async () => {
    // 1. Generate active session code
    const reqGen = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen = createMockRes()
    await AttendanceController.generateSessionCode(reqGen, resGen)
    assert.strictEqual(resGen.statusCode, 200)

    // 2. Report without code
    const reqNoCode = {
      body: {
        deviceInstallId: 'device-inst-1',
        sessionId: SESSION_ID,
        studentRoll: 'R190001'
      }
    }
    const resNoCode = createMockRes()
    await AttendanceController.reportPresence(reqNoCode, resNoCode)
    assert.strictEqual(resNoCode.statusCode, 400)

    // 3. Report with invalid code
    const reqWrongCode = {
      body: {
        deviceInstallId: 'device-inst-1',
        sessionId: SESSION_ID,
        code: '000000',
        studentRoll: 'R190001'
      }
    }
    const resWrongCode = createMockRes()
    await AttendanceController.reportPresence(reqWrongCode, resWrongCode)
    assert.strictEqual(resWrongCode.statusCode, 400)
    assert.match(resWrongCode.data.error, /Invalid or missing session code/)
  })

  test('expired code is rejected', async () => {
    // Generate code
    const reqGen = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen = createMockRes()
    await AttendanceController.generateSessionCode(reqGen, resGen)
    const validCode = resGen.data.code

    // Manually expire the code
    const active = activeSessionCodes.get(SESSION_ID)
    active.expiresAt = new Date(Date.now() - 5000) // 5 seconds in the past

    const reqReport = {
      body: {
        deviceInstallId: 'device-inst-1',
        sessionId: SESSION_ID,
        code: validCode,
        studentRoll: 'R190001'
      }
    }
    const resReport = createMockRes()
    await AttendanceController.reportPresence(reqReport, resReport)
    assert.strictEqual(resReport.statusCode, 400)
    assert.match(resReport.data.error, /expired/i)
  })

  test('valid code marks presence pulse but NOT final attendance', async () => {
    const reqGen = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen = createMockRes()
    await AttendanceController.generateSessionCode(reqGen, resGen)
    const validCode = resGen.data.code

    const reqReport = {
      body: {
        deviceInstallId: 'device-inst-1',
        sessionId: SESSION_ID,
        code: validCode,
        rssi: -65,
        apBssid: 'AP-ROOM-101',
        studentRoll: 'R190001'
      }
    }
    const resReport = createMockRes()
    await AttendanceController.reportPresence(reqReport, resReport)

    assert.strictEqual(resReport.statusCode, 200)
    assert.strictEqual(resReport.data.status, 'pulse_recorded')
    assert.strictEqual(resReport.data.finalAttendanceMarked, false)
    assert.strictEqual(resReport.data.pulseCount, 1)

    // Pulse map check
    const sessionPulseMap = sessionPulses.get(SESSION_ID)
    assert.ok(sessionPulseMap)
    const record = sessionPulseMap.get('device-inst-1')
    assert.strictEqual(record.pulseCount, 1)
    assert.strictEqual(record.validCodeCount, 1)
  })

  test('faculty can regenerate code mid-session; old code fails immediately', async () => {
    // 1. Initial code
    const reqGen1 = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen1 = createMockRes()
    await AttendanceController.generateSessionCode(reqGen1, resGen1)
    const oldCode = resGen1.data.code

    // 2. Regenerate new code
    const reqGen2 = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen2 = createMockRes()
    await AttendanceController.generateSessionCode(reqGen2, resGen2)
    const newCode = resGen2.data.code

    // 3. Old code fails immediately
    const reqOld = {
      body: {
        deviceInstallId: 'device-inst-1',
        sessionId: SESSION_ID,
        code: oldCode,
        studentRoll: 'R190001'
      }
    }
    const resOld = createMockRes()
    await AttendanceController.reportPresence(reqOld, resOld)
    assert.strictEqual(resOld.statusCode, 400)

    // 4. New code succeeds
    const reqNew = {
      body: {
        deviceInstallId: 'device-inst-1',
        sessionId: SESSION_ID,
        code: newCode,
        studentRoll: 'R190001'
      }
    }
    const resNew = createMockRes()
    await AttendanceController.reportPresence(reqNew, resNew)
    assert.strictEqual(resNew.statusCode, 200)
    assert.strictEqual(resNew.data.status, 'pulse_recorded')
  })

  test('two students reporting the same deviceInstallId → second is rejected as duplicate', async () => {
    const reqGen = { params: { sessionId: SESSION_ID }, user: { id: 'faculty-01' } }
    const resGen = createMockRes()
    await AttendanceController.generateSessionCode(reqGen, resGen)
    const validCode = resGen.data.code

    // Student A reports using device-inst-shared
    const reqA = {
      body: {
        deviceInstallId: 'device-inst-shared',
        sessionId: SESSION_ID,
        code: validCode,
        studentRoll: 'R190001'
      }
    }
    const resA = createMockRes()
    await AttendanceController.reportPresence(reqA, resA)
    assert.strictEqual(resA.statusCode, 200)

    // Student B attempts to report using the same device-inst-shared
    const reqB = {
      body: {
        deviceInstallId: 'device-inst-shared',
        sessionId: SESSION_ID,
        code: validCode,
        studentRoll: 'R190002' // Different student!
      }
    }
    const resB = createMockRes()
    await AttendanceController.reportPresence(reqB, resB)
    assert.strictEqual(resB.statusCode, 400)
    assert.strictEqual(resB.data.code, 'DUPLICATE_DEVICE_INSTALL_ID')
    assert.match(resB.data.error, /Proxy attempt flagged/)
  })
})
