import { Pool } from 'pg'
import { HolidayFetcher } from '../src/services/calendar/HolidayFetcher.js'

const isRemote = /render\.com|dpg-/.test(String(process.env.DATABASE_URL || ''))
const poolConfig = { connectionString: process.env.DATABASE_URL }
if (isRemote) {
  poolConfig.ssl = { rejectUnauthorized: false }
}
const pool = process.env.DATABASE_URL ? new Pool(poolConfig) : null

async function seed() {
  console.log('Seeding 2026 Indian Government Holidays for AP, TS, TN, KA, KL, MH, DL, UP...')
  const holidays = await HolidayFetcher.fetchStateGovernmentHolidays(2026, 'ALL')

  if (!pool) {
    console.log(`Memory mode: ${holidays.length} holidays available in HolidayFetcher.`)
    process.exit(0)
  }

  try {
    for (const h of holidays) {
      await pool.query(
        `INSERT INTO holidays (name, date, end_date, type, state_code, year, source, is_optional)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (name, date, state_code) DO NOTHING`,
        [h.name, h.date, h.end_date || null, h.type, h.state_code, h.year, 'gazette_2026', false]
      )
    }
    console.log(`Seeded ${holidays.length} holidays into PostgreSQL database.`)
  } catch (err) {
    console.error('Seed error:', err.message)
  } finally {
    await pool.end()
  }
}

seed().catch(console.error)
