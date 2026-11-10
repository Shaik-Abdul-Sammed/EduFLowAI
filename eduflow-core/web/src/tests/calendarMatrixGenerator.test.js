import {
  computeCalendarMilestones,
  getExecutiveCalendarSummary,
  getOddSemesterGrid,
  getEvenSemesterGrid,
  getOddHolidaysList,
  getEvenHolidaysList,
  STATE_NAMES,
} from '../utils/calendarMatrixGenerator'

describe('calendarMatrixGenerator - Multi-Year & Multi-State Engine', () => {
  test('correctly maps all 8 state jurisdictions', () => {
    expect(STATE_NAMES.AP).toBe('Andhra Pradesh')
    expect(STATE_NAMES.TS).toBe('Telangana')
    expect(STATE_NAMES.KA).toBe('Karnataka')
    expect(STATE_NAMES.TN).toBe('Tamil Nadu')
    expect(STATE_NAMES.MH).toBe('Maharashtra')
    expect(STATE_NAMES.DL).toBe('Delhi NCT')
    expect(STATE_NAMES.UP).toBe('Uttar Pradesh')
    expect(STATE_NAMES.ALL).toBe('Central / Pan-India')
  })

  test('computes exact official RGUKT 2026-2027 AP calendar milestones', () => {
    const m = computeCalendarMilestones(2026, 'AP')
    expect(m.oddDays).toBe(88)
    expect(m.evenDays).toBe(84)
    expect(m.oReg).toBe('29th June, 2026')
    expect(m.eReg).toBe('1st December, 2026')
    expect(m.oMid1).toBe('5th – 7th August, 2026')
    expect(m.eMid1).toBe('6th – 8th January, 2027')
    expect(m.oClosing).toBe('4th November, 2026')
    expect(m.eClosing).toBe('5th April, 2027')
    expect(m.oEst).toBe('16th – 28th November, 2026')
    expect(m.eEst).toBe('19th – 30th April, 2027')
    expect(m.oEndRes).toBe('30th December, 2026')
    expect(m.eEndRes).toBe('1st June, 2027')
  })

  test('dynamically generates 2025-2026 Telangana (TS) calendar milestones', () => {
    const m = computeCalendarMilestones(2025, 'TS')
    expect(m.oddDays).toBe(91)
    expect(m.evenDays).toBe(92)
    expect(m.oReg).toContain('2025')
    expect(m.eReg).toContain('2025')
    expect(m.eMid1).toContain('2026')
    expect(m.eEndRes).toContain('2026')
  })

  test('dynamically generates 2027-2028 Karnataka (KA) calendar milestones', () => {
    const m = computeCalendarMilestones(2027, 'KA')
    expect(m.oddDays).toBe(95)
    expect(m.evenDays).toBe(94)
    expect(m.oReg).toContain('2027')
    expect(m.eEndRes).toContain('2028')
  })

  test('generates exactly 11 milestone rows for Page 1 Executive Summary', () => {
    const summary = getExecutiveCalendarSummary(2026, 'AP')
    expect(summary).toHaveLength(11)
    expect(summary[0].activity).toBe('Number of Instruction days')
    expect(summary[0].odd).toBe('88')
    expect(summary[0].even).toBe('84')
    expect(summary[1].activity).toBe('Semester Registration / Commencement of classes')
    expect(summary[2].activity).toBe('Mid Test-I')
    expect(summary[6].activity).toBe('Instruction closing day')
    expect(summary[9].activity).toBe('EST exams')
    expect(summary[10].activity).toBe('End Semester Result Announcement')
  })

  test('generates 21-week color-coded matrix for Odd Semester', () => {
    const weeks = getOddSemesterGrid(2026, 'AP')
    expect(weeks).toHaveLength(21)

    // Week 1 has 6 instructional days
    expect(weeks[0].days).toHaveLength(6)

    // Mid 1 is on Week 6
    expect(weeks[5].remarks).toBe('MID-I')
    expect(weeks[5].colors[2]).toBe('blue')
    expect(weeks[5].colors[3]).toBe('blue')
    expect(weeks[5].colors[4]).toBe('blue')

    // Dussehra Vacation is on Week 17 (index 16)
    expect(weeks[16].week).toBe('Dussehra Vacation')
    expect(weeks[16].colors[0]).toBe('red')
    expect(weeks[16].colors[5]).toBe('red')

    // EST is on Weeks 20 & 21
    expect(weeks[19].remarks).toBe('EST')
    expect(weeks[20].remarks).toBe('EST')
    expect(weeks[19].colors[0]).toBe('green')
    expect(weeks[20].colors[5]).toBe('green')
  })

  test('generates 21-week color-coded matrix for Even Semester', () => {
    const weeks = getEvenSemesterGrid(2026, 'AP')
    expect(weeks).toHaveLength(21)

    // Mid 1 is on Week 6
    expect(weeks[5].remarks).toBe('MID-I')

    // Pongal/Harvest Vacation is on Week 7 (index 6)
    expect(weeks[6].week).toBe('Pongal Vacation')
    expect(weeks[6].colors[0]).toBe('red')
    expect(weeks[6].colors[5]).toBe('red')

    // Mid 2 is on Week 11
    expect(weeks[10].remarks).toBe('MID-II')

    // EST is on Weeks 20 & 21
    expect(weeks[19].remarks).toBe('EST')
    expect(weeks[20].remarks).toBe('EST')
  })

  test('filters and formats Odd and Even Semester gazetted holidays', () => {
    const mockHolidays = [
      { name: 'Independence Day', date: '2026-08-15', type: 'NATIONAL_HOLIDAY' },
      { name: 'Republic Day', date: '2027-01-26', type: 'NATIONAL_HOLIDAY' },
      { name: 'Varalakshmi Vratam', date: '2026-08-21', type: 'STATE_GAZETTED' },
    ]

    const oddHols = getOddHolidaysList(2026, 'AP', mockHolidays)
    const evenHols = getEvenHolidaysList(2026, 'AP', mockHolidays)

    expect(oddHols).toHaveLength(2)
    expect(oddHols[0].name).toBe('Independence Day')
    expect(oddHols[0].type).toBe('National Holiday')
    expect(oddHols[0].date).toContain('2026-08-15')

    expect(evenHols).toHaveLength(1)
    expect(evenHols[0].name).toBe('Republic Day')
    expect(evenHols[0].type).toBe('National Holiday')
    expect(evenHols[0].date).toContain('2027-01-26')
  })
})
