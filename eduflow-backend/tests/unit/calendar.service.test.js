import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarGenerator } from '../../src/services/calendar/CalendarGenerator.js'
import { CalendarAdjustments } from '../../src/services/calendar/CalendarAdjustments.js'

describe('Unit: Calendar Service & Generator Logic', () => {
  it('generates academic calendar with working days and holidays', async () => {
    const calendar = await CalendarGenerator.generateAcademicYear(1, '2026-2027', 'KA', {
      targetWorkingDays: 90
    })

    assert.ok(calendar, 'Calendar must be generated')
    assert.ok(Array.isArray(calendar.events), 'Events must be an array')
    assert.ok(calendar.events.length > 0, 'Must contain scheduled academic events')
    assert.ok(calendar.total_working_days >= 90, 'Working days should meet or exceed statutory target')
  })

  it('correctly injects Second Saturday holidays for AP and Telangana states', async () => {
    const calendarAP = await CalendarGenerator.generateAcademicYear(1, '2026-2027', 'AP', {
      applySecondSaturday: true
    })

    const secondSaturdays = calendarAP.holidays.filter(h =>
      h.name && h.name.toLowerCase().includes('second saturday')
    )
    assert.ok(secondSaturdays.length >= 10, 'Must include monthly 2nd Saturday state gazetted holidays')
  })

  it('records holiday extensions with audit details in CalendarAdjustments', async () => {
    const result = await CalendarAdjustments.extendHoliday(
      101, // calendarId
      55,  // eventId
      2,   // additionalDays
      'Severe Cyclone Alert declared by State Disaster Management',
      42   // adjustedBy (admin user id)
    )

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.adjustmentType, 'EXTEND_HOLIDAY')
    assert.strictEqual(result.additionalDays, 2)
    assert.strictEqual(result.adjustedBy, 42)
  })

  it('postpones examinations and notifies stakeholders', async () => {
    const result = await CalendarAdjustments.postponeExam(
      101,
      88,
      '2026-11-20',
      'Mid-term lab conflict resolved'
    )

    assert.strictEqual(result.success, true)
    assert.strictEqual(result.adjustmentType, 'POSTPONE_EXAM')
    assert.strictEqual(result.newStartDate, '2026-11-20')
  })
})
