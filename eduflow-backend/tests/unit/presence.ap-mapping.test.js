import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  apRoomMap,
  registerApRoomMapping,
  matchApToSessionRoom
} from '../../src/services/presence.js'

describe('P1.2 — Physical AP-to-Room Mapping', () => {
  const AP_ROOM_101_2GHZ = '00:14:22:01:23:45'
  const AP_ROOM_101_5GHZ = '00:14:22:01:23:46'
  const AP_ROOM_102 = '00:14:22:99:88:77'
  const UNMAPPED_AP = '00:14:22:00:00:00'

  beforeEach(() => {
    apRoomMap.clear()
    // Register dual-band APs for ROOM-101
    registerApRoomMapping(AP_ROOM_101_2GHZ, 'ROOM-101', 20.0, 'Cisco Catalyst 2.4GHz')
    registerApRoomMapping(AP_ROOM_101_5GHZ, 'ROOM-101', 23.0, 'Cisco Catalyst 5GHz')
    // Register AP for ROOM-102
    registerApRoomMapping(AP_ROOM_102, 'ROOM-102', 20.0, 'Aruba AP-505')
  })

  test('AP matching session room is accepted', () => {
    const result = matchApToSessionRoom({
      apBssid: AP_ROOM_101_2GHZ,
      sessionRoomId: 'ROOM-101'
    })

    assert.strictEqual(result.status, 'accepted')
    assert.strictEqual(result.confidence, 'high')
    assert.strictEqual(result.reason, 'room_matched')
    assert.strictEqual(result.roomId, 'ROOM-101')
  })

  test('AP matching different room classified as wrong_room', () => {
    // Student connected to ROOM-102 AP during a ROOM-101 class session
    const result = matchApToSessionRoom({
      apBssid: AP_ROOM_102,
      sessionRoomId: 'ROOM-101'
    })

    assert.strictEqual(result.status, 'wrong_room')
    assert.strictEqual(result.confidence, 'low')
    assert.strictEqual(result.mappedRoomId, 'ROOM-102')
    assert.strictEqual(result.sessionRoomId, 'ROOM-101')
  })

  test('unmapped AP classified as unknown_ap with low confidence', () => {
    const result = matchApToSessionRoom({
      apBssid: UNMAPPED_AP,
      sessionRoomId: 'ROOM-101'
    })

    assert.strictEqual(result.status, 'unknown_ap')
    assert.strictEqual(result.confidence, 'low')
    assert.strictEqual(result.reason, 'unmapped_ap')
  })

  test('supports multi-BSSID per room (e.g., dual-band APs)', () => {
    // Both 2.4GHz and 5GHz radios in ROOM-101 should match ROOM-101
    const res2G = matchApToSessionRoom({
      apBssid: AP_ROOM_101_2GHZ,
      sessionRoomId: 'ROOM-101'
    })
    const res5G = matchApToSessionRoom({
      apBssid: AP_ROOM_101_5GHZ,
      sessionRoomId: 'ROOM-101'
    })

    assert.strictEqual(res2G.status, 'accepted')
    assert.strictEqual(res2G.confidence, 'high')
    assert.strictEqual(res5G.status, 'accepted')
    assert.strictEqual(res5G.confidence, 'high')
  })
})
