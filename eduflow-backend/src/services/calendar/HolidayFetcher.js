import { pool } from '../../db/pool.js'
import { logger } from '../../utils/logger.js'

// Standard 2026 Indian holidays dataset
const STATIC_HOLIDAYS_2026 = [
  { name: 'Republic Day', date: '2026-01-26', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Maha Shivratri', date: '2026-02-15', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Holi', date: '2026-03-04', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Ugadi / Gudi Padwa', date: '2026-03-20', type: 'FESTIVAL', state_code: 'AP,TS,KA,MH', year: 2026 },
  { name: 'Good Friday', date: '2026-04-03', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Dr. B.R. Ambedkar Jayanti', date: '2026-04-14', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Eid-ul-Fitr (Ramzan)', date: '2026-03-21', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Independence Day', date: '2026-08-15', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Ganesh Chaturthi', date: '2026-09-14', type: 'FESTIVAL', state_code: 'MH,KA,AP,TS', year: 2026 },
  { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Maha Navami / Dussehra', date: '2026-10-20', end_date: '2026-10-21', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Diwali (Deepavali)', date: '2026-11-08', end_date: '2026-11-10', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  { name: 'Christmas', date: '2026-12-25', type: 'GAZETTED', state_code: 'ALL', year: 2026 },
  // State specific
  { name: 'Pongal / Makar Sankranti', date: '2026-01-14', end_date: '2026-01-16', type: 'STATE', state_code: 'TN,AP,TS', year: 2026 },
  { name: 'Kannada Rajyotsava', date: '2026-11-01', type: 'STATE', state_code: 'KA', year: 2026 },
  { name: 'Maharashtra Day', date: '2026-05-01', type: 'STATE', state_code: 'MH', year: 2026 },
]

export class HolidayFetcher {
  static async fetchCentralGovernmentHolidays(year = 2026) {
    return STATIC_HOLIDAYS_2026.filter((h) => h.year === year && h.state_code === 'ALL')
  }

  static async fetchStateGovernmentHolidays(year = 2026, stateCode = 'KA') {
    return STATIC_HOLIDAYS_2026.filter(
      (h) => h.year === year && (h.state_code === 'ALL' || h.state_code.includes(stateCode))
    )
  }

  static async fetchFestivalHolidays(year = 2026) {
    return STATIC_HOLIDAYS_2026.filter((h) => h.year === year && h.type === 'FESTIVAL')
  }

  static mergeAndDeduplicate(allHolidays) {
    const map = new Map()
    for (const h of allHolidays) {
      const key = `${h.name.toLowerCase()}_${h.date}`
      if (!map.has(key)) {
        map.set(key, h)
      }
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  static async saveHolidaysToDatabase(holidays) {
    let saved = 0
    for (const h of holidays) {
      try {
        await pool.query(
          `INSERT INTO holidays (name, date, end_date, type, state_code, year, source, is_optional)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (name, date, state_code) DO NOTHING`,
          [
            h.name,
            h.date,
            h.end_date || null,
            h.type || 'GAZETTED',
            h.state_code || 'ALL',
            h.year,
            h.source || 'gov_gazette',
            Boolean(h.is_optional),
          ]
        )
        saved++
      } catch (err) {
        logger.warn(`Could not save holiday '${h.name}': ${err.message}`)
      }
    }
    return { total: holidays.length, saved }
  }
}

export default HolidayFetcher
