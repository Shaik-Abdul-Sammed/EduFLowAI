import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarGenerator } from '../../src/services/calendar/CalendarGenerator.js'

describe('Unit: Academic Calendar Generator', () => {
  it('generates academic calendar with ODD and EVEN semesters and working days >= 90', async () => {
    const calendar = await CalendarGenerator.generateAcademicYear(1, '2026-2027', 'KA')

    assert.equal(calendar.academicYear, '2026-2027')
    assert.ok(calendar.oddSemester.totalWorkingDays >= 90, 'ODD semester should meet 90 days minimum')
    assert.ok(calendar.evenSemester.totalWorkingDays >= 90, 'EVEN semester should meet 90 days minimum')
    assert.ok(calendar.events.length > 5)

    const eventTypes = calendar.events.map((e) => e.event_type)
    assert.ok(eventTypes.includes('MID_EXAM'))
    assert.ok(eventTypes.includes('LAB_EXAM'))
    assert.ok(eventTypes.includes('END_EXAM'))
    assert.ok(eventTypes.includes('VACATION'))
  })
})
