import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { NAAC_SSR_TEMPLATES, generateFullSSRReport } from '../../src/services/ai/NAAC_SSR_Templates.js'

describe('NAAC SSR Output Quality Unit Tests', () => {
  test('Criterion 1 output includes Curricular Aspects heading and 4 sub-criteria', () => {
    const report = generateFullSSRReport(1)
    assert.ok(report.includes('Curricular Aspects'))
    assert.ok(report.includes('1.1 Curricular Planning'))
    assert.ok(report.includes('1.2 Academic Flexibility'))
    assert.ok(report.includes('1.3 Curriculum Enrichment'))
    assert.ok(report.includes('1.4 Feedback System'))
    assert.equal(NAAC_SSR_TEMPLATES[1].weightage, 100)
  })

  test('Criterion 2 output includes Teaching-Learning and Evaluation and SFR table', () => {
    const report = generateFullSSRReport(2)
    assert.ok(report.includes('Teaching-Learning and Evaluation'))
    assert.ok(report.includes('Student - Full Time Teacher Ratio (SFR)'))
    assert.ok(report.includes('15:1'))
    assert.equal(NAAC_SSR_TEMPLATES[2].weightage, 350)
  })

  test('Criterion 3 output includes Research, Innovations and Extension and publication table', () => {
    const report = generateFullSSRReport(3)
    assert.ok(report.includes('Research, Innovations and Extension'))
    assert.ok(report.includes('Scopus / WoS Indexed Journal Articles'))
    assert.equal(NAAC_SSR_TEMPLATES[3].weightage, 120)
  })

  test('Criterion 4 output includes Infrastructure and Learning Resources and facility counts', () => {
    const report = generateFullSSRReport(4)
    assert.ok(report.includes('Infrastructure and Learning Resources'))
    assert.ok(report.includes('ICT-enabled Smart Classrooms'))
    assert.ok(report.includes('Internet Leased-line Bandwidth'))
    assert.equal(NAAC_SSR_TEMPLATES[4].weightage, 100)
  })

  test('Criterion 5 output includes Student Support and Progression and placement table', () => {
    const report = generateFullSSRReport(5)
    assert.ok(report.includes('Student Support and Progression'))
    assert.ok(report.includes('Placed Students in Tier-1/Tier-2'))
    assert.equal(NAAC_SSR_TEMPLATES[5].weightage, 130)
  })

  test('Criterion 6 output includes Governance, Leadership and Management and IQAC details', () => {
    const report = generateFullSSRReport(6)
    assert.ok(report.includes('Governance, Leadership and Management'))
    assert.ok(report.includes('Internal Quality Assurance System (IQAC)'))
    assert.equal(NAAC_SSR_TEMPLATES[6].weightage, 100)
  })

  test('Criterion 7 output includes Institutional Values and Best Practices and gender equity table', () => {
    const report = generateFullSSRReport(7)
    assert.ok(report.includes('Institutional Values and Best Practices'))
    assert.ok(report.includes('Gender Equity Promotion Activities'))
    assert.ok(report.includes('Solar'))
    assert.equal(NAAC_SSR_TEMPLATES[7].weightage, 100)
  })

  test('Verifies correct total points weightage across all 7 criteria', () => {
    const totalPoints = Object.values(NAAC_SSR_TEMPLATES).reduce((sum, c) => sum + c.weightage, 0)
    assert.equal(totalPoints, 1000)
  })
})
