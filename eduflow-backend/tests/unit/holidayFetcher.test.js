import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { HolidayFetcher } from '../../src/services/calendar/HolidayFetcher.js'

describe('Unit: Holiday Fetcher Service', () => {
  it('fetches central government national holidays for 2026', async () => {
    const holidays = await HolidayFetcher.fetchCentralGovernmentHolidays(2026)
    assert.ok(Array.isArray(holidays))
    assert.ok(holidays.length > 5)

    const names = holidays.map((h) => h.name)
    assert.ok(names.includes('Republic Day'))
    assert.ok(names.includes('Independence Day'))
    assert.ok(names.includes('Gandhi Jayanti'))
  })

  it('fetches state specific holidays including Pongal and Kannada Rajyotsava', async () => {
    const kaHolidays = await HolidayFetcher.fetchStateGovernmentHolidays(2026, 'KA')
    const kaNames = kaHolidays.map((h) => h.name)
    assert.ok(kaNames.includes('Kannada Rajyotsava'))

    const tnHolidays = await HolidayFetcher.fetchStateGovernmentHolidays(2026, 'TN')
    const tnNames = tnHolidays.map((h) => h.name)
    assert.ok(tnNames.includes('Pongal / Makar Sankranti'))
  })

  it('merges and deduplicates multiple holiday lists', () => {
    const list1 = [
      { name: 'Diwali', date: '2026-11-08' },
      { name: 'Holi', date: '2026-03-04' },
    ]
    const list2 = [
      { name: 'Diwali', date: '2026-11-08' },
      { name: 'Christmas', date: '2026-12-25' },
    ]
    const merged = HolidayFetcher.mergeAndDeduplicate([...list1, ...list2])
    assert.equal(merged.length, 3)
  })
})
