import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarGenerator } from '../../src/services/calendar/CalendarGenerator.js'
import { CalendarAdjustments } from '../../src/services/calendar/CalendarAdjustments.js'
import { HolidayFetcher } from '../../src/services/calendar/HolidayFetcher.js'
import { AcademicSchedulingService } from '../../src/services/calendar/AcademicSchedulingService.js'
import { generateAcademicCalendarPdfBuffer, computeMilestones } from '../../src/services/calendar/AcademicCalendarPdfBuilder.js'

describe('Unit: Calendar Edge Cases & Academic Scheduling', () => {
  it('handles leap year academic year (2027-2028 has Feb 29 in even semester)', async () => {
    const calendar = await CalendarGenerator.generateAcademicYear(1, '2027-2028', 'KA', {
      targetWorkingDays: 90
    })
    assert.ok(calendar)
    assert.strictEqual(calendar.academicYear, '2027-2028')
    assert.ok(calendar.evenSemester.workingDays >= 85)
  })

  it('handles multi-day gazetted holidays (Sankranti / Dussehra vacation window extensions)', async () => {
    const calendar = await CalendarGenerator.generateAcademicYear(1, '2026-2027', 'AP', {
      extendHolidayDays: 3,
      midTermStartDate: '2026-09-01',
      examGapDays: 3
    })
    const dussehraEvent = calendar.events.find(e => e.name && e.name.includes('Dussehra'))
    assert.ok(dussehraEvent, 'Dussehra event must be scheduled')
    assert.ok(dussehraEvent.end_date >= '2026-10-25', 'Dussehra end date must be extended by 3 days')
  })

  it('avoids scheduling examinations on Sundays and resolves holiday clashes', async () => {
    const milestones = computeMilestones(2026, 'AP')
    assert.ok(milestones)
    assert.ok(milestones.oddDays > 0)
    assert.ok(milestones.evenDays > 0)
    assert.ok(milestones.oMid1)
  })

  it('schedules compensatory working Saturdays to recover lost instruction days', () => {
    const result = AcademicSchedulingService.scheduleCompensatoryWorkingSaturdays({
      lostInstructionDaysCount: 2,
      lostDates: ['2026-08-20', '2026-08-21'],
      reasons: ['Bandh', 'Monsoon Flooding'],
      candidateSaturdays: ['2026-09-05', '2026-09-19']
    })
    assert.strictEqual(result.totalLostDays, 2)
    assert.strictEqual(result.totalCompensatedDays, 2)
    assert.strictEqual(result.deficitRecovered, true)
    assert.strictEqual(result.assignedCompensations.length, 2)
  })

  it('handles empty candidates or zero lost days gracefully in compensatory scheduling', () => {
    const zeroDays = AcademicSchedulingService.scheduleCompensatoryWorkingSaturdays({
      lostInstructionDaysCount: 0
    })
    assert.strictEqual(zeroDays.totalCompensatedDays, 0)
    assert.strictEqual(zeroDays.deficitRecovered, true)
  })

  it('synchronizes multidisciplinary open elective slots without departmental clashes', () => {
    const result = AcademicSchedulingService.synchronizeElectiveTimeSlots({
      branches: ['CSE', 'ECE'],
      electives: [
        { code: 'OE01', title: 'Intro to AI', faculty: 'Dr. Kumar' }
      ]
    })
    assert.strictEqual(result.totalElectivesSynchronized, 1)
    assert.strictEqual(result.schedule[0].clashFree, true)
  })

  it('generates continuous internal assessment (CIE) milestone schedule', () => {
    const cie = AcademicSchedulingService.generateCIEMilestoneSchedule({
      semesterStartDate: '2026-07-06',
      semesterEndDate: '2026-11-28'
    })
    assert.ok(Array.isArray(cie.milestones))
    assert.ok(cie.milestones.length >= 6)
  })

  it('handles CalendarAdjustments: reduce holiday, add compensatory class, and notify', async () => {
    const red = await CalendarAdjustments.reduceHoliday(1, 10, 1, 'Recover syllabus', 1)
    assert.strictEqual(red.success, true)
    assert.strictEqual(red.adjustmentType, 'REDUCE_HOLIDAY')

    const comp = await CalendarAdjustments.addCompensatoryClass(1, 10, '2026-10-10', 1)
    assert.strictEqual(comp.success, true)
    assert.strictEqual(comp.adjustmentType, 'COMPENSATORY_CLASS')

    const notif = await CalendarAdjustments.notifyStakeholders(1, 'SCHEDULE_SHIFT', {})
    assert.strictEqual(notif.success, true)
    assert.ok(notif.channels.includes('EMAIL'))
  })

  it('fetches festival holidays and saves deduplicated holidays to DB', async () => {
    const festivals = await HolidayFetcher.fetchFestivalHolidays(2026)
    assert.ok(Array.isArray(festivals))
    assert.ok(festivals.length > 0)

    const saved = await HolidayFetcher.saveHolidaysToDatabase(festivals.slice(0, 3))
    assert.strictEqual(saved.total, 3)
  })

  it('generates authentic multi-page PDF buffer in grid and gazette formats', () => {
    const gridPdf = generateAcademicCalendarPdfBuffer({
      academicYear: '2026-2027',
      stateCode: 'AP',
      format: 'grid'
    })
    assert.ok(Buffer.isBuffer(gridPdf))
    assert.ok(gridPdf.length > 500)
    assert.strictEqual(gridPdf.slice(0, 8).toString(), '%PDF-1.4')

    const gazettePdf = generateAcademicCalendarPdfBuffer({
      academicYear: '2026-2027',
      stateCode: 'KA',
      format: 'gazette'
    })
    assert.ok(Buffer.isBuffer(gazettePdf))
    assert.ok(gazettePdf.length > 500)
  })
})
