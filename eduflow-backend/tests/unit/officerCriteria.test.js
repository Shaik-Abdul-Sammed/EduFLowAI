import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveAccreditationFallback, NAAC_CRITERIA_FALLBACKS } from '../../src/services/AIService.js'

describe('Unit: NAAC Accreditation Criteria Distinct Outputs', () => {
  it('returns distinct report content for Criteria 1, Criteria 2, Criteria 3, and All Criteria', () => {
    const report1 = resolveAccreditationFallback('', { criterion: '1' })
    const report2 = resolveAccreditationFallback('', { criterion: '2' })
    const report3 = resolveAccreditationFallback('', { criterion: '3' })
    const reportAll = resolveAccreditationFallback('', { criterion: 'all' })

    // All must be non-empty strings
    assert.ok(typeof report1 === 'string' && report1.length > 50)
    assert.ok(typeof report2 === 'string' && report2.length > 50)
    assert.ok(typeof report3 === 'string' && report3.length > 50)
    assert.ok(typeof reportAll === 'string' && reportAll.length > 50)

    // Verify all four reports are completely distinct from one another
    assert.notEqual(report1, report2, 'Criteria 1 and Criteria 2 reports must differ')
    assert.notEqual(report1, report3, 'Criteria 1 and Criteria 3 reports must differ')
    assert.notEqual(report1, reportAll, 'Criteria 1 and All Criteria reports must differ')
    assert.notEqual(report2, report3, 'Criteria 2 and Criteria 3 reports must differ')
    assert.notEqual(report2, reportAll, 'Criteria 2 and All Criteria reports must differ')
    assert.notEqual(report3, reportAll, 'Criteria 3 and All Criteria reports must differ')

    // Verify criteria specific titles / headers exist
    assert.match(report1, /NAAC Criterion 1: Curricular Aspects/i)
    assert.match(report2, /NAAC Criterion 2: Teaching-Learning and Evaluation/i)
    assert.match(report3, /NAAC Criterion 3: Research, Innovations and Extension/i)
    assert.match(reportAll, /Comprehensive NAAC Self-Study Report/i)
  })

  it('correctly maps various prompt and context formats to the expected criteria', () => {
    // By context string
    assert.equal(resolveAccreditationFallback('', { criterion: 'criterion 1' }), NAAC_CRITERIA_FALLBACKS.criterion1)
    assert.equal(resolveAccreditationFallback('', { criterion: 'criteria 2' }), NAAC_CRITERIA_FALLBACKS.criterion2)
    assert.equal(resolveAccreditationFallback('', { criterion: '4' }), NAAC_CRITERIA_FALLBACKS.criterion4)
    assert.equal(resolveAccreditationFallback('', { criterion: '5' }), NAAC_CRITERIA_FALLBACKS.criterion5)
    assert.equal(resolveAccreditationFallback('', { criterion: '6' }), NAAC_CRITERIA_FALLBACKS.criterion6)
    assert.equal(resolveAccreditationFallback('', { criterion: '7' }), NAAC_CRITERIA_FALLBACKS.criterion7)
    assert.equal(resolveAccreditationFallback('', { criterion: 'all criteria' }), NAAC_CRITERIA_FALLBACKS.allCriteria)

    // By prompt string keywords
    assert.equal(resolveAccreditationFallback('Generate analysis for criterion 1'), NAAC_CRITERIA_FALLBACKS.criterion1)
    assert.equal(resolveAccreditationFallback('Audit for teaching-learning metrics'), NAAC_CRITERIA_FALLBACKS.criterion2)
    assert.equal(resolveAccreditationFallback('Full SSR report for criteria 1 to 7'), NAAC_CRITERIA_FALLBACKS.allCriteria)
  })
})
