import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import path from 'path'
import fs from 'fs'
import { ProspectusExtractor } from '../../src/services/onboarding/ProspectusExtractor.js'

describe('ProspectusExtractor Unit Tests', () => {
  const samplePdfPath = path.resolve(process.cwd(), '../eduflow-core/web/public/sample-prospectus.pdf')

  beforeEach(() => {
    ProspectusExtractor.clearCache()
  })

  test('extraction from a sample PDF returns all required fields', async () => {
    assert.ok(fs.existsSync(samplePdfPath), 'Sample prospectus PDF must exist')
    const result = await ProspectusExtractor.extractInstitutionData(samplePdfPath)

    assert.ok(result.data, 'Data object should be returned')
    assert.ok(result.data.name, 'Institution name should be extracted')
    assert.ok(result.data.departments.length > 0, 'Departments should be extracted')
    assert.ok(result.data.courses.length > 0, 'Courses should be extracted')
    assert.ok(result.data.email, 'Email should be extracted')
    assert.ok(result.data.website, 'Website should be extracted')
    assert.ok(result.data.establishedYear, 'Year should be extracted')
    assert.ok(result.confidence, 'Confidence object should be present')
  })

  test('missing fields are marked with low confidence', async () => {
    // Sparse input with minimal text
    const sparseText = 'Generic Academy of Arts\nOnly some text here.'
    const result = await ProspectusExtractor.extractInstitutionData(Buffer.from(sparseText))

    assert.equal(result.confidence.email, 'low', 'Missing email must have low confidence')
    assert.equal(result.confidence.phone, 'low', 'Missing phone must have low confidence')
    assert.equal(result.confidence.pincode, 'low', 'Missing pincode must have low confidence')
    assert.equal(result.confidence.establishedYear, 'low', 'Missing year must have low confidence')
  })

  test('caching works (second call is significantly faster)', async () => {
    const t0 = Date.now()
    const firstCall = await ProspectusExtractor.extractInstitutionData(samplePdfPath)
    const firstDuration = Date.now() - t0
    assert.equal(firstCall.fromCache, false)

    const t1 = Date.now()
    const secondCall = await ProspectusExtractor.extractInstitutionData(samplePdfPath)
    const secondDuration = Date.now() - t1
    assert.equal(secondCall.fromCache, true)
    assert.ok(secondDuration <= Math.max(firstDuration, 10), 'Cached call should return instantly')
  })
})
