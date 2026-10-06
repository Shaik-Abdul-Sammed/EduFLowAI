import { HolidayFetcher } from './HolidayFetcher.js'
import { logger } from '../../utils/logger.js'

export class CalendarGenerator {
  /**
   * Generates a complete academic year calendar.
   */
  static async generateAcademicYear(institutionId, academicYear = '2026-2027', stateCode = 'KA', options = {}) {
    const yearStart = parseInt(academicYear.split('-')[0], 10) || 2026
    const holidays = await HolidayFetcher.fetchStateGovernmentHolidays(yearStart, stateCode)

    // ODD Semester: July 1 to Dec 15
    const oddStart = `${yearStart}-07-01`
    const oddEnd = `${yearStart}-12-15`

    // EVEN Semester: Jan 5 to May 25 of next year
    const evenStart = `${yearStart + 1}-01-05`
    const evenEnd = `${yearStart + 1}-05-25`

    const holidayDates = new Set(holidays.map((h) => h.date))

    // Helper: calculate working days (Monday-Friday or Monday-Saturday) excluding holidays
    const isSixDayWeek = options.sixDayWeek || false
    const calculateWorkingDays = (startDateStr, endDateStr) => {
      let count = 0
      let current = new Date(startDateStr)
      const end = new Date(endDateStr)

      while (current <= end) {
        const dayOfWeek = current.getDay() // 0 = Sun, 6 = Sat
        const isoDate = current.toISOString().slice(0, 10)

        const isWeekend = isSixDayWeek ? dayOfWeek === 0 : (dayOfWeek === 0 || dayOfWeek === 6)
        const isHoliday = holidayDates.has(isoDate)

        if (!isWeekend && !isHoliday) {
          count++
        }
        current.setDate(current.getDate() + 1)
      }
      return count
    }

    const oddWorkingDays = calculateWorkingDays(oddStart, oddEnd)
    const evenWorkingDays = calculateWorkingDays(evenStart, evenEnd)

    // Schedule Milestones & Events
    const events = [
      // ODD Semester
      { event_type: 'SEMESTER_START', name: 'Commencement of ODD Semester Classes', start_date: oddStart, end_date: oddStart, is_mandatory: true },
      { event_type: 'MID_EXAM', name: 'Continuous Internal Assessment - Mid Term 1', start_date: `${yearStart}-08-25`, end_date: `${yearStart}-08-29`, is_mandatory: true },
      { event_type: 'VACATION', name: 'Dussehra / Autumn Break', start_date: `${yearStart}-10-18`, end_date: `${yearStart}-10-25`, is_mandatory: false },
      { event_type: 'MID_EXAM', name: 'Continuous Internal Assessment - Mid Term 2', start_date: `${yearStart}-11-02`, end_date: `${yearStart}-11-06`, is_mandatory: true },
      { event_type: 'LAB_EXAM', name: 'Practical & Laboratory End Examinations', start_date: `${yearStart}-11-23`, end_date: `${yearStart}-11-28`, is_mandatory: true },
      { event_type: 'END_EXAM', name: 'Semester End Theory Examinations (ODD)', start_date: `${yearStart}-12-01`, end_date: `${yearStart}-12-15`, is_mandatory: true },
      { event_type: 'VACATION', name: 'Winter Vacation / Semester Break', start_date: `${yearStart}-12-16`, end_date: `${yearStart + 1}-01-04`, is_mandatory: false },

      // EVEN Semester
      { event_type: 'SEMESTER_START', name: 'Commencement of EVEN Semester Classes', start_date: evenStart, end_date: evenStart, is_mandatory: true },
      { event_type: 'MID_EXAM', name: 'Mid Term 1 Examination (EVEN)', start_date: `${yearStart + 1}-02-23`, end_date: `${yearStart + 1}-02-27`, is_mandatory: true },
      { event_type: 'MID_EXAM', name: 'Mid Term 2 Examination (EVEN)', start_date: `${yearStart + 1}-04-13`, end_date: `${yearStart + 1}-04-17`, is_mandatory: true },
      { event_type: 'LAB_EXAM', name: 'End Semester Practical Examinations', start_date: `${yearStart + 1}-05-04`, end_date: `${yearStart + 1}-05-08`, is_mandatory: true },
      { event_type: 'END_EXAM', name: 'Semester End Theory Examinations (EVEN)', start_date: `${yearStart + 1}-05-11`, end_date: `${yearStart + 1}-05-25`, is_mandatory: true },
      { event_type: 'VACATION', name: 'Summer Vacation & Internship Window', start_date: `${yearStart + 1}-05-26`, end_date: `${yearStart + 1}-06-30`, is_mandatory: false },
    ]

    logger.info(`Generated Academic Calendar for ${academicYear}: ${oddWorkingDays} ODD days, ${evenWorkingDays} EVEN days`)

    return {
      academicYear,
      stateCode,
      institutionId,
      oddSemester: {
        startDate: oddStart,
        endDate: oddEnd,
        totalWorkingDays: oddWorkingDays,
        targetMinimumDays: 90,
        compliant: oddWorkingDays >= 90,
      },
      evenSemester: {
        startDate: evenStart,
        endDate: evenEnd,
        totalWorkingDays: evenWorkingDays,
        targetMinimumDays: 90,
        compliant: evenWorkingDays >= 90,
      },
      holidaysCount: holidays.length,
      holidays,
      events,
      status: 'DRAFT',
      generatedAt: new Date().toISOString(),
    }
  }
}

export default CalendarGenerator
