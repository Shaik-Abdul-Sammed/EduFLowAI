import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { WhatsAppAttendance } from '../../src/services/attendance/WhatsAppAttendance.js'

describe('WhatsAppAttendance Unit Tests', () => {
  beforeEach(() => {
    WhatsAppAttendance.clearStores()
  })

  test('parses message format "CSE 3A present 45 absent 5"', () => {
    const parsed = WhatsAppAttendance.parseAttendanceMessage('CSE 3A present 45 absent 5', '+919876543210')
    assert.equal(parsed.courseCode, 'CSE')
    assert.equal(parsed.section, '3A')
    assert.equal(parsed.presentCount, 45)
    assert.equal(parsed.absentCount, 5)
    assert.equal(parsed.totalCount, 50)
    assert.ok(parsed.confirmationReply.includes('45 present, 5 absent'))
    assert.ok(parsed.confirmationReply.includes('Reply YES to confirm or NO to cancel'))
  })

  test('parses ratio format "CS301 23/30"', () => {
    const parsed = WhatsAppAttendance.parseAttendanceMessage('CS301 23/30', '+919876543210')
    assert.equal(parsed.courseCode, 'CS301')
    assert.equal(parsed.presentCount, 23)
    assert.equal(parsed.absentCount, 7) // 30 - 23
    assert.equal(parsed.totalCount, 30)
    assert.ok(parsed.confirmationReply.includes('23 present, 7 absent'))
  })

  test('parses keyword format "attendance CSE-3A today 48 present"', () => {
    const parsed = WhatsAppAttendance.parseAttendanceMessage('attendance CSE-3A today 48 present', '+919876543210')
    assert.equal(parsed.courseCode, 'CSE')
    assert.equal(parsed.section, '3A')
    assert.equal(parsed.presentCount, 48)
    assert.equal(parsed.absentCount, 0)
    assert.ok(parsed.confirmationReply.includes('48 present, 0 absent'))
  })

  test('stages attendance with PENDING status and updates to CONFIRMED on YES', async () => {
    const parsed = WhatsAppAttendance.parseAttendanceMessage('CS101 20/25', '+919876543210')
    const staged = await WhatsAppAttendance.stageAttendance(parsed)
    assert.ok(staged.id)
    assert.equal(staged.status, 'PENDING')

    const confirmRes = await WhatsAppAttendance.updateStagedStatusByPhone('+919876543210', 'YES')
    assert.equal(confirmRes.status, 'CONFIRMED')
    assert.ok(confirmRes.replyText.includes('confirmed'))
  })

  test('updates staged attendance to REJECTED on NO', async () => {
    const parsed = WhatsAppAttendance.parseAttendanceMessage('ECE 2B present 30 absent 2', '+919876543299')
    await WhatsAppAttendance.stageAttendance(parsed)

    const rejectRes = await WhatsAppAttendance.updateStagedStatusByPhone('+919876543299', 'NO')
    assert.equal(rejectRes.status, 'REJECTED')
    assert.ok(rejectRes.replyText.includes('cancelled'))
  })

  test('logs inbound and outbound messages into message log', async () => {
    const log1 = await WhatsAppAttendance.logMessage('INBOUND', '+919876543210', '+919900011222', 'Hello')
    assert.equal(log1.direction, 'INBOUND')

    const sendRes = await WhatsAppAttendance.sendMessage('+919876543210', 'Confirmation text')
    assert.equal(sendRes.success, true)

    const logs = WhatsAppAttendance.getMessageLogStore()
    assert.ok(logs.length >= 2)
  })
})
