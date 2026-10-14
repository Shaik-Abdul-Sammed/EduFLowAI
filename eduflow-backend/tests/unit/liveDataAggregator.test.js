import { test } from 'node:test'
import assert from 'node:assert'
import { LiveDataAggregator } from '../../src/services/live/LiveDataAggregator.js'

test('LiveDataAggregator - fetchNIRFRankings returns score metrics and rank band', async () => {
  const data = await LiveDataAggregator.fetchNIRFRankings('Sri Siddhartha Institute of Technology', 2024)
  assert.strictEqual(data.rankingYear, 2024)
  assert(data.tlrScore > 0)
  assert(data.rpcScore > 0)
  assert.strictEqual(data.rankBand, '151-200')
  assert(Array.isArray(data.verifiedSources))
})

test('LiveDataAggregator - fetchNAACAnnouncements returns binary accreditation notices', async () => {
  const data = await LiveDataAggregator.fetchNAACAnnouncements()
  assert.strictEqual(data.category, 'NAAC_REFORMS')
  assert(data.announcements.length >= 2)
  assert(data.announcements.some(a => a.title.includes('Binary Accreditation')))
})

test('LiveDataAggregator - fetchAICTENotifications returns 1:20 SFR rule', async () => {
  const data = await LiveDataAggregator.fetchAICTENotifications()
  assert.strictEqual(data.category, 'AICTE_REGULATIONS')
  assert(data.circulars.some(c => c.title.includes('1:20')))
})

test('LiveDataAggregator - fetchGovernmentHolidays returns gazetted calendar', async () => {
  const data = await LiveDataAggregator.fetchGovernmentHolidays('Karnataka', 2026)
  assert.strictEqual(data.state, 'Karnataka')
  assert.strictEqual(data.year, 2026)
  assert(data.holidays.length >= 5)
  assert(data.holidays.some(h => h.name.includes('Republic Day')))
})

test('LiveDataAggregator - refreshAllSources syncs all 6 channels simultaneously', async () => {
  const summary = await LiveDataAggregator.refreshAllSources(1)
  assert(summary.nirf)
  assert(summary.naac)
  assert(summary.aicte)
  assert(summary.ugc)
  assert(summary.holidays)
  assert(summary.news)
  assert(summary.refreshedAt)
})
