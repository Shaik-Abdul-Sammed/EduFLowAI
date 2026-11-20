import { test, describe, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'
import { AttendanceController } from '../../src/controllers/AttendanceController.js'
import { classifyPresence, isRssiInRoom, registerApRoomMapping, matchApToSessionRoom } from '../../src/services/presence.js'

describe('Grey-Box Testing Suite: Faculty Wi-Fi & Bluetooth RF Boundary Isolation', () => {

  before(() => {
    // Setup physical AP room mapping calibration in memory
    registerApRoomMapping('00:1A:2B:3C:4D:01', 'ROOM-CSE-6A', 20.0, 'Classroom 101 Access Point')
  })

  test('GREY-BOX 1: Strict Course/Section Roster Boundary Isolation', async () => {
    // Test Scenario: In a real lecture hall, devices belonging to students of other sections
    // (e.g. CSE-6B student 2023CSE201) and unknown guest MACs are detected by the BLE beacon.
    // The grey-box test validates that internal state ONLY processes enrolled students of CSE-6A.

    const enrolledRoster = await AttendanceController._getCourseRoster('CS301', 1, 'CSE-6A')
    const enrolledRolls = enrolledRoster.map(s => s.rollNumber)

    assert.ok(enrolledRolls.includes('2023CSE001'), 'Enrolled student 2023CSE001 must be on CSE-6A roster')
    assert.ok(enrolledRolls.includes('2023CSE002'), 'Enrolled student 2023CSE002 must be on CSE-6A roster')
    assert.ok(!enrolledRolls.includes('2023CSE201'), 'Student 2023CSE201 from Section B must NOT be on Section A roster')

    // Simulate scanning in the room:
    // Detected devices include 2 enrolled students + 1 student from Section B + 1 rogue guest device
    const detectedRaw = [
      '2023CSE001', // Enrolled (Present)
      '2023CSE002', // Enrolled (Present)
      '2023CSE201', // Foreign Section B Student (Present in corridor)
      'GUEST-MAC-AA:BB:CC:DD:EE:FF' // Rogue unknown device
    ]

    const req = {
      user: { role: 'faculty', institutionId: 1, assignedCourses: ['CS301'] },
      body: {
        ble_hashes: detectedRaw,
        course_id: 'CS301',
        section: 'CSE-6A',
        teacher_id: 1,
        date: new Date().toISOString().split('T')[0]
      }
    }

    let responsePayload = null
    let responseCode = null
    const res = {
      status(code) {
        responseCode = code
        return this
      },
      json(data) {
        responsePayload = data
        return this
      }
    }

    await AttendanceController.bleSync(req, res)

    assert.strictEqual(responseCode, 200, 'bleSync must return HTTP 200')
    assert.strictEqual(responsePayload.success, true)
    assert.strictEqual(responsePayload.section, 'CSE-6A')

    // Validate that the attendance records returned ONLY include enrolled students of CSE-6A
    const returnedRolls = responsePayload.records.map(r => r.rollNumber)
    for (const roll of returnedRolls) {
      assert.ok(enrolledRolls.includes(roll), `Returned record ${roll} must belong to enrolled roster`)
    }

    // Verify foreign devices were strictly quarantined and never given attendance
    assert.ok(!returnedRolls.includes('2023CSE201'), 'Section B student must NEVER receive attendance in Section A')
    assert.ok(!returnedRolls.includes('GUEST-MAC-AA:BB:CC:DD:EE:FF'), 'Guest device must NEVER be in attendance register')

    // Verify quarantine telemetry reports the foreign devices
    assert.strictEqual(responsePayload.foreignDevicesDetectedCount, 2, 'Must quarantine exactly 2 foreign devices')
    assert.strictEqual(responsePayload.perimeterIntegrity, '100% ISOLATED (Only enrolled students marked)')
  })

  test('GREY-BOX 2: Cryptographic Roll Hash Matching with Privacy Preservation', async () => {
    // Test that the engine resolves SHA-256 hashes of roll numbers seamlessly without storing cleartext MACs
    const targetRoll = '2023CSE001'
    const sha256Upper = crypto.createHash('sha256').update(targetRoll.toUpperCase()).digest('hex')
    const sha256Lower = crypto.createHash('sha256').update(targetRoll.toLowerCase()).digest('hex')

    const req = {
      user: { role: 'faculty', institutionId: 1, assignedCourses: ['CS301'] },
      body: {
        ble_hashes: [sha256Upper],
        course_id: 'CS301',
        section: 'CSE-6A'
      }
    }

    let responsePayload = null
    const res = {
      status() { return this },
      json(data) { responsePayload = data; return this }
    }

    await AttendanceController.bleSync(req, res)
    const studentRecord = responsePayload.records.find(r => r.rollNumber === targetRoll)
    assert.ok(studentRecord, 'Student must be located')
    assert.strictEqual(studentRecord.status, 'PRESENT', 'Hashed roll advertisement must mark student PRESENT')
    assert.strictEqual(studentRecord.bleDetected, true)
  })

  test('GREY-BOX 3: RSSI Signal Containment & Wall Leakage Prevention', () => {
    // Physical signal test: Ensure devices with weak RSSI (e.g. -88 dBm leaking through corridor)
    // are classified as out of zone or weak signal, while in-room signals (-65 dBm) are accepted.
    const inRoomSignal = isRssiInRoom({ roomId: 'ROOM-101', rssi: -65, fallbackMinDbm: -75, fallbackMaxDbm: -30 })
    assert.strictEqual(inRoomSignal.inRoom, true, 'RSSI -65 dBm must be recognized as inside the classroom')

    const leakingCorridorSignal = isRssiInRoom({ roomId: 'ROOM-101', rssi: -88, fallbackMinDbm: -75, fallbackMaxDbm: -30 })
    assert.strictEqual(leakingCorridorSignal.inRoom, false, 'RSSI -88 dBm through wall must be rejected as out of zone')

    const presenceResult = classifyPresence({
      dwellSeconds: 3000,
      sessionSeconds: 3600,
      inRoomRssi: false,
      validCodeCount: 1
    })
    assert.strictEqual(presenceResult.status, 'absent', 'Out-of-zone RSSI must override dwell time to absent')
    assert.strictEqual(presenceResult.reason, 'out_of_zone')
  })

  test('GREY-BOX 4: Cross-Room AP Mapping Bounding', () => {
    // AP physical mapping: Ensure AP from Room 102 cannot validate attendance in Room 101
    const matchSuccess = matchApToSessionRoom({ apBssid: '00:1A:2B:3C:4D:01', sessionRoomId: 'ROOM-CSE-6A' })
    assert.strictEqual(matchSuccess.status, 'accepted', 'Mapped AP must match session room')

    const matchWrongRoom = matchApToSessionRoom({ apBssid: '00:1A:2B:3C:4D:01', sessionRoomId: 'ROOM-CSE-6B' })
    assert.strictEqual(matchWrongRoom.status, 'wrong_room', 'AP from another room must be rejected')
    assert.strictEqual(matchWrongRoom.confidence, 'low')
  })
})
