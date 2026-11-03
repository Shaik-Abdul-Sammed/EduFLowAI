import { pool } from '../../db/pool.js'
import { logger } from '../../utils/logger.js'

export const LUNAR_FESTIVAL_CALENDAR = {
  2020: { shivratri: '2020-02-21', holi: '2020-03-10', ugadi: '2020-03-25', ramNavami: '2020-04-02', eidFitr: '2020-05-24', eidAdha: '2020-08-01', muharram: '2020-08-30', ganesh: '2020-08-22', dussehra: '2020-10-25', diwali: '2020-11-14', guruNanak: '2020-11-30' },
  2021: { shivratri: '2021-03-11', holi: '2021-03-29', ugadi: '2021-04-13', ramNavami: '2021-04-21', eidFitr: '2021-05-13', eidAdha: '2021-07-20', muharram: '2021-08-19', ganesh: '2021-09-10', dussehra: '2021-10-15', diwali: '2021-11-04', guruNanak: '2021-11-19' },
  2022: { shivratri: '2022-03-01', holi: '2022-03-18', ugadi: '2022-04-02', ramNavami: '2022-04-10', eidFitr: '2022-05-02', eidAdha: '2022-07-10', muharram: '2022-08-09', ganesh: '2022-08-31', dussehra: '2022-10-05', diwali: '2022-10-24', guruNanak: '2022-11-08' },
  2023: { shivratri: '2023-02-18', holi: '2023-03-08', ugadi: '2023-03-22', ramNavami: '2023-03-30', eidFitr: '2023-04-21', eidAdha: '2023-06-29', muharram: '2023-07-29', ganesh: '2023-09-19', dussehra: '2023-10-24', diwali: '2023-11-12', guruNanak: '2023-11-27' },
  2024: { shivratri: '2024-03-08', holi: '2024-03-25', ugadi: '2024-04-09', ramNavami: '2024-04-17', eidFitr: '2024-04-10', eidAdha: '2024-06-17', muharram: '2024-07-17', ganesh: '2024-09-07', dussehra: '2024-10-12', diwali: '2024-11-01', guruNanak: '2024-11-15' },
  2025: { shivratri: '2025-02-26', holi: '2025-03-14', ugadi: '2025-03-30', ramNavami: '2025-04-06', eidFitr: '2025-03-31', eidAdha: '2025-06-07', muharram: '2025-07-06', ganesh: '2025-08-27', dussehra: '2025-10-02', diwali: '2025-10-20', guruNanak: '2025-11-05' },
  2026: { shivratri: '2026-02-17', holi: '2026-03-04', ugadi: '2026-03-20', ramNavami: '2026-03-27', eidFitr: '2026-03-20', eidAdha: '2026-05-27', muharram: '2026-06-26', ganesh: '2026-09-14', dussehra: '2026-10-20', diwali: '2026-11-08', guruNanak: '2026-11-24' },
  2027: { shivratri: '2027-03-07', holi: '2027-03-23', ugadi: '2027-04-08', ramNavami: '2027-04-15', eidFitr: '2027-03-10', eidAdha: '2027-05-17', muharram: '2027-06-16', ganesh: '2027-09-04', dussehra: '2027-10-10', diwali: '2027-10-29', guruNanak: '2027-11-13' },
  2028: { shivratri: '2028-02-24', holi: '2028-03-11', ugadi: '2028-03-27', ramNavami: '2028-04-03', eidFitr: '2028-02-27', eidAdha: '2028-05-05', muharram: '2028-06-04', ganesh: '2028-08-24', dussehra: '2028-09-28', diwali: '2028-10-17', guruNanak: '2028-11-01' },
  2029: { shivratri: '2029-02-12', holi: '2029-03-01', ugadi: '2029-03-17', ramNavami: '2029-03-24', eidFitr: '2029-02-15', eidAdha: '2029-04-24', muharram: '2029-05-24', ganesh: '2029-09-12', dussehra: '2029-10-17', diwali: '2029-11-05', guruNanak: '2029-11-21' },
  2030: { shivratri: '2030-03-03', holi: '2030-03-20', ugadi: '2030-04-05', ramNavami: '2030-04-12', eidFitr: '2030-02-05', eidAdha: '2030-04-14', muharram: '2030-05-14', ganesh: '2030-09-01', dussehra: '2030-10-06', diwali: '2030-10-26', guruNanak: '2030-11-10' },
  2031: { shivratri: '2031-02-21', holi: '2031-03-09', ugadi: '2031-03-25', ramNavami: '2031-04-01', eidFitr: '2031-01-25', eidAdha: '2031-04-03', muharram: '2031-05-03', ganesh: '2031-09-19', dussehra: '2031-10-25', diwali: '2031-11-14', guruNanak: '2031-11-29' },
  2032: { shivratri: '2032-02-10', holi: '2032-02-27', ugadi: '2032-03-14', ramNavami: '2032-03-21', eidFitr: '2032-01-14', eidAdha: '2032-03-22', muharram: '2032-04-21', ganesh: '2032-09-08', dussehra: '2032-10-13', diwali: '2032-11-02', guruNanak: '2032-11-17' },
  2033: { shivratri: '2033-02-28', holi: '2033-03-16', ugadi: '2033-04-01', ramNavami: '2033-04-08', eidFitr: '2033-01-03', eidAdha: '2033-03-11', muharram: '2033-04-10', ganesh: '2033-08-29', dussehra: '2033-10-03', diwali: '2033-10-23', guruNanak: '2033-11-06' },
  2034: { shivratri: '2034-02-17', holi: '2034-03-05', ugadi: '2034-03-21', ramNavami: '2034-03-29', eidFitr: '2034-12-13', eidAdha: '2034-03-01', muharram: '2034-03-30', ganesh: '2034-09-17', dussehra: '2034-10-21', diwali: '2034-11-10', guruNanak: '2034-11-25' },
  2035: { shivratri: '2035-03-08', holi: '2035-03-24', ugadi: '2035-04-09', ramNavami: '2035-04-16', eidFitr: '2035-12-02', eidAdha: '2035-02-18', muharram: '2035-03-20', ganesh: '2035-09-06', dussehra: '2035-10-11', diwali: '2035-10-30', guruNanak: '2035-11-15' },
}

function calculateGoodFriday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  const easter = new Date(Date.UTC(year, month - 1, day))
  easter.setUTCDate(easter.getUTCDate() - 2)
  return easter.toISOString().slice(0, 10)
}

function shiftIso(isoDateStr, days) {
  if (!isoDateStr) return ''
  const d = new Date(`${isoDateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export class HolidayFetcher {
  static getFestivalDates(year) {
    const y = parseInt(year, 10) || 2026
    if (LUNAR_FESTIVAL_CALENDAR[y]) {
      return LUNAR_FESTIVAL_CALENDAR[y]
    }
    const base = LUNAR_FESTIVAL_CALENDAR[2026]
    const diff = y - 2026
    const shiftDays = Math.round(((diff * 365.2425) % 29.530588))
    const computeDate = (baseIso) => {
      const d = new Date(`${baseIso}T00:00:00Z`)
      d.setUTCFullYear(y)
      d.setUTCDate(d.getUTCDate() - shiftDays)
      return d.toISOString().slice(0, 10)
    }
    return {
      shivratri: computeDate(base.shivratri),
      holi: computeDate(base.holi),
      ugadi: computeDate(base.ugadi),
      ramNavami: computeDate(base.ramNavami),
      eidFitr: computeDate(base.eidFitr),
      eidAdha: computeDate(base.eidAdha),
      muharram: computeDate(base.muharram),
      ganesh: computeDate(base.ganesh),
      dussehra: computeDate(base.dussehra),
      diwali: computeDate(base.diwali),
      guruNanak: computeDate(base.guruNanak),
    }
  }

  static async fetchCentralGovernmentHolidays(year = 2026) {
    const y = parseInt(year, 10) || 2026
    const f = HolidayFetcher.getFestivalDates(y)
    const gf = calculateGoodFriday(y)

    return [
      { name: 'Republic Day', date: `${y}-01-26`, type: 'NATIONAL_HOLIDAY', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Maha Shivratri', date: f.shivratri, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Holi', date: f.holi, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Good Friday', date: gf, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Dr. B.R. Ambedkar Jayanti', date: `${y}-04-14`, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Eid-ul-Fitr (Ramzan)', date: f.eidFitr, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Buddha Purnima', date: `${y}-05-12`, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Bakrid / Eid-ul-Adha', date: f.eidAdha, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Muharram', date: f.muharram, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Independence Day', date: `${y}-08-15`, type: 'NATIONAL_HOLIDAY', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Milad-un-Nabi (Id-e-Milad)', date: `${y}-09-04`, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Gandhi Jayanti', date: `${y}-10-02`, type: 'NATIONAL_HOLIDAY', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Maha Navami / Dussehra', date: f.dussehra, end_date: shiftIso(f.dussehra, 1), type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Diwali (Deepavali)', date: f.diwali, end_date: shiftIso(f.diwali, 2), type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Guru Nanak Jayanti', date: f.guruNanak, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
      { name: 'Christmas', date: `${y}-12-25`, type: 'GAZETTED', state_code: 'ALL', year: y, is_optional: false },
    ]
  }

  static async fetchStateGovernmentHolidays(year = 2026, stateCode = 'KA') {
    const y = parseInt(year, 10) || 2026
    const central = await HolidayFetcher.fetchCentralGovernmentHolidays(y)
    const f = HolidayFetcher.getFestivalDates(y)

    const stateAndOptionalHolidays = [
      // State Public Holidays
      { name: 'Pongal / Makar Sankranti', date: `${y}-01-14`, end_date: `${y}-01-16`, type: 'STATE', state_code: 'TN,AP,TS,KA', year: y, is_optional: false },
      { name: 'Ugadi / Gudi Padwa', date: f.ugadi, type: 'STATE', state_code: 'AP,TS,KA,MH', year: y, is_optional: false },
      { name: 'Chhatrapati Shivaji Maharaj Jayanti', date: `${y}-02-19`, type: 'STATE', state_code: 'MH', year: y, is_optional: false },
      { name: 'Sri Rama Navami', date: f.ramNavami, type: 'STATE', state_code: 'AP,TS', year: y, is_optional: false },
      { name: 'Maharashtra Day / May Day', date: `${y}-05-01`, type: 'STATE', state_code: 'MH,ALL', year: y, is_optional: false },
      { name: 'Telangana Formation Day', date: `${y}-06-02`, type: 'STATE', state_code: 'TS', year: y, is_optional: false },
      { name: 'Ganesh Chaturthi', date: f.ganesh, type: 'FESTIVAL', state_code: 'MH,KA,AP,TS', year: y, is_optional: false },
      { name: 'Ayudha Puja', date: shiftIso(f.dussehra, -1), type: 'STATE', state_code: 'KA,TN,AP', year: y, is_optional: false },
      { name: 'Kannada Rajyotsava', date: `${y}-11-01`, type: 'STATE', state_code: 'KA', year: y, is_optional: false },
      { name: 'Kanakadasa Jayanti', date: shiftIso(f.guruNanak, 2), type: 'STATE', state_code: 'KA', year: y, is_optional: false },

      // Optional / Restricted Holidays (RH)
      { name: 'New Year Day', date: `${y}-01-01`, type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Guru Gobind Singh Jayanti', date: `${y}-01-05`, type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Holika Dahan', date: shiftIso(f.holi, -1), type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Basava Jayanti', date: `${y}-04-29`, type: 'OPTIONAL', state_code: 'KA', year: y, is_optional: true },
      { name: 'Varalakshmi Vratam', date: `${y}-08-21`, type: 'OPTIONAL', state_code: 'AP,TS,KA,TN', year: y, is_optional: true },
      { name: 'Raksha Bandhan', date: shiftIso(f.ganesh, -16), type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Krishna Janmashtami', date: shiftIso(f.ganesh, -8), type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Bathukamma / Floral Festival', date: shiftIso(f.dussehra, -1), type: 'OPTIONAL', state_code: 'TS', year: y, is_optional: true },
      { name: 'Karwa Chauth', date: shiftIso(f.diwali, -9), type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Govardhan Puja', date: shiftIso(f.diwali, 1), type: 'OPTIONAL', state_code: 'KA,MH,DL,ALL', year: y, is_optional: true },
      { name: 'Bhai Dooj', date: shiftIso(f.diwali, 2), type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
      { name: 'Chhath Puja', date: shiftIso(f.diwali, 6), type: 'OPTIONAL', state_code: 'DL,ALL', year: y, is_optional: true },
      { name: 'Christmas Eve', date: `${y}-12-24`, type: 'OPTIONAL', state_code: 'ALL', year: y, is_optional: true },
    ]

    const all = [...central, ...stateAndOptionalHolidays]
    const filtered = all.filter((h) => {
      if (!stateCode || stateCode === 'ALL') return true
      if (h.state_code === 'ALL') return true
      const codes = h.state_code.split(',').map((c) => c.trim())
      return codes.includes(stateCode)
    })

    return HolidayFetcher.mergeAndDeduplicate(filtered)
  }

  static async fetchFestivalHolidays(year = 2026) {
    const list = await HolidayFetcher.fetchStateGovernmentHolidays(year, 'ALL')
    return list.filter((h) => h.type === 'FESTIVAL' || h.type === 'GAZETTED' || h.type === 'STATE')
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
