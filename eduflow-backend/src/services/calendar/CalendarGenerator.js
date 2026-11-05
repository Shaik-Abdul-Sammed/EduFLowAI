import { HolidayFetcher } from './HolidayFetcher.js'
import { logger } from '../../utils/logger.js'

export class CalendarGenerator {
  /**
   * Generates a complete academic year calendar.
   * Supports (institutionId, academicYear, stateCode, options) or (stateCode, year, options).
   */
  static async generateAcademicYear(...args) {
    let institutionId = 1
    let academicYear = '2026-2027'
    let stateCode = 'KA'
    let options = {}

    if (typeof args[0] === 'object' && args[0] !== null) {
      institutionId = args[0].institutionId || 1
      academicYear = args[0].academicYear || (args[0].year ? `${args[0].year}-${Number(args[0].year) + 1}` : '2026-2027')
      stateCode = args[0].stateCode || args[0].state || 'KA'
      options = args[0].options || {}
    } else if (typeof args[0] === 'string' && (args[0].length === 2 || ['KA', 'MH', 'TN', 'TS', 'AP', 'DL', 'ALL'].includes(args[0].toUpperCase()))) {
      stateCode = args[0].toUpperCase()
      const rawYear = args[1] || '2026'
      academicYear = String(rawYear).includes('-') ? String(rawYear) : `${rawYear}-${Number(rawYear) + 1}`
      options = args[2] || {}
    } else {
      institutionId = args[0] || 1
      academicYear = args[1] || '2026-2027'
      stateCode = args[2] || 'KA'
      options = args[3] || {}
    }

    const yearStart = parseInt(String(academicYear).split('-')[0], 10) || 2026
    const baseHolidays = await HolidayFetcher.fetchStateGovernmentHolidays(yearStart, stateCode)
    const holidays = [...baseHolidays]

    // Rule 1: applySecondSaturday (AP/Telangana Rule)
    const applySecondSaturday =
      options.applySecondSaturday === true ||
      options.applySecondSaturday === 'true' ||
      stateCode === 'AP' ||
      stateCode === 'TS'
    if (applySecondSaturday) {
      // Academic year spans 12 months: July of yearStart to June of yearStart + 1
      for (let m = 6; m < 18; m++) {
        const yr = m < 12 ? yearStart : yearStart + 1
        const monthIndex = m % 12
        // Find 2nd Saturday of this month
        for (let day = 8; day <= 14; day++) {
          const testDate = new Date(yr, monthIndex, day)
          if (testDate.getDay() === 6) {
            const pad = (n) => String(n).padStart(2, '0')
            const dateStr = `${yr}-${pad(monthIndex + 1)}-${pad(day)}`
            if (!holidays.some((h) => h.date === dateStr)) {
              holidays.push({
                name: 'Second Saturday Holiday (AP/Telangana Rule)',
                date: dateStr,
                type: 'STATE_GAZETTED',
                significance: 'Mandatory State Rule for Educational Institutions',
              })
            }
            break
          }
        }
      }
      holidays.sort((a, b) => (a.date > b.date ? 1 : -1))
    }

    // ODD Semester dates: customizable or standard
    const oddStart = options.startDate || `${yearStart}-07-01`
    const oddEnd = options.endDate || `${yearStart}-12-15`

    // EVEN Semester dates: customizable or standard
    const evenStart = options.evenStartDate || `${yearStart + 1}-01-05`
    const evenEnd = options.evenEndDate || `${yearStart + 1}-05-25`

    const targetMinDays = Number(options.targetWorkingDays) || 90

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

    // Rule 2: Mid-Term Start Date
    let mid1Start = `${yearStart}-08-25`
    let mid1End = `${yearStart}-08-29`
    if (options.midTermStartDate && /^\d{4}-\d{2}-\d{2}$/.test(options.midTermStartDate)) {
      mid1Start = options.midTermStartDate
      const d = new Date(options.midTermStartDate)
      d.setDate(d.getDate() + 4)
      mid1End = d.toISOString().slice(0, 10)
    }

    // Rule 4: extendHolidayDays (Dussehra / Diwali vacation blocks)
    const extendDays = Number(options.extendHolidayDays) || 0
    let dussehraEnd = `${yearStart}-10-25`
    if (extendDays > 0) {
      const d = new Date(dussehraEnd)
      d.setDate(d.getDate() + extendDays)
      dussehraEnd = d.toISOString().slice(0, 10)
    }

    // Rule 3: examGapDays between Lab and Semester exams
    const examGap = Number(options.examGapDays ?? 2)
    const oddLabEnd = `${yearStart}-11-28`
    const oddEndExamStartObj = new Date(oddLabEnd)
    oddEndExamStartObj.setDate(oddEndExamStartObj.getDate() + examGap + 1)
    const oddEndExamStart = oddEndExamStartObj.toISOString().slice(0, 10)
    const oddEndExamEndObj = new Date(oddEndExamStartObj)
    oddEndExamEndObj.setDate(oddEndExamEndObj.getDate() + 14)
    const oddEndExamEnd = oddEndExamEndObj.toISOString().slice(0, 10)

    // Schedule Milestones & Events
    const events = [
      // ODD Semester
      { event_type: 'SEMESTER_START', name: 'Commencement of ODD Semester Classes', start_date: oddStart, end_date: oddStart, is_mandatory: true },
      { event_type: 'MID_EXAM', name: 'Continuous Internal Assessment - Mid Term 1', start_date: mid1Start, end_date: mid1End, is_mandatory: true },
      { event_type: 'VACATION', name: 'Dussehra / Autumn Break', start_date: `${yearStart}-10-18`, end_date: dussehraEnd, is_mandatory: false },
      { event_type: 'MID_EXAM', name: 'Continuous Internal Assessment - Mid Term 2', start_date: `${yearStart}-11-02`, end_date: `${yearStart}-11-06`, is_mandatory: true },
      { event_type: 'LAB_EXAM', name: 'Practical & Laboratory End Examinations', start_date: `${yearStart}-11-23`, end_date: oddLabEnd, is_mandatory: true },
      { event_type: 'END_EXAM', name: 'Semester End Theory Examinations (ODD)', start_date: oddEndExamStart, end_date: oddEndExamEnd, is_mandatory: true },
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
      total_working_days: oddWorkingDays + evenWorkingDays,
      total_holidays: holidays.length,
      oddSemester: {
        startDate: oddStart,
        endDate: oddEnd,
        totalWorkingDays: oddWorkingDays,
        workingDays: oddWorkingDays,
        targetMinimumDays: targetMinDays,
        compliant: oddWorkingDays >= targetMinDays,
      },
      evenSemester: {
        startDate: evenStart,
        endDate: evenEnd,
        totalWorkingDays: evenWorkingDays,
        workingDays: evenWorkingDays,
        targetMinimumDays: targetMinDays,
        compliant: evenWorkingDays >= targetMinDays,
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
