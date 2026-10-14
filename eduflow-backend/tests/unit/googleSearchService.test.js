import { test } from 'node:test'
import assert from 'node:assert'
import { GoogleSearchService } from '../../src/services/live/GoogleSearchService.js'

test('GoogleSearchService - fallback search returns structured results with metadata', async () => {
  const res = await GoogleSearchService.search('NIRF 2024 ranking Sri Siddhartha', { category: 'nirf', num: 2 })
  assert.strictEqual(res.query, 'NIRF 2024 ranking Sri Siddhartha')
  assert(res.items.length <= 2)
  assert(res.items.length > 0)
  assert(res.items[0].title.includes('NIRF') || res.items[0].title.includes('Ranking'))
  assert(res.items[0].link.startsWith('http'))
  assert.strictEqual(res.fallback, true)
})

test('GoogleSearchService - caching returns fast cached result on identical query', async () => {
  const q = 'NAAC Binary Accreditation Guidelines'
  const first = await GoogleSearchService.search(q, { category: 'naac', num: 3 })
  assert.strictEqual(first.cached, false)

  const second = await GoogleSearchService.search(q, { category: 'naac', num: 3 })
  assert.strictEqual(second.cached, true)
  assert.strictEqual(second.items.length, first.items.length)
})

test('GoogleSearchService - searchNews formats higher education news query', async () => {
  const news = await GoogleSearchService.searchNews('AICTE faculty recruitment')
  assert(news.items.length > 0)
  assert(news.query.includes('higher education news India'))
})

test('GoogleSearchService - handles empty query gracefully', async () => {
  const res = await GoogleSearchService.search('')
  assert.strictEqual(res.totalResults, 0)
  assert.strictEqual(res.items.length, 0)
})
