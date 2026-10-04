import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { explainSection, answerQuestion, compareToIdeal } from '../../src/services/naac/reportExplainer.js'

describe('Unit: NAAC Report Explainer Service', () => {
  const sampleReportText = `
Criterion 1: Curricular Aspects
Sri Sudha Institute of Technology follows CBCS pattern across all undergraduate engineering programs.
Over 25% of the courses underwent syllabus revision in the last academic cycle.
Continuous assessment and CO-PO mapping ensure outcome-based education.
Student satisfaction survey indicates 88% overall contentment.
`

  it('explainSection returns summary, glossary, keyMetrics, weakClaims, evidenceSuggestions', async () => {
    const result = await explainSection(sampleReportText, 1)

    assert.ok(result, 'Result should exist')
    assert.ok(Array.isArray(result.summary), 'Summary should be an array')
    assert.ok(result.summary.length >= 1, 'Summary should have bullet points')

    assert.ok(Array.isArray(result.glossary), 'Glossary should be an array')
    for (const item of result.glossary) {
      assert.ok(typeof item.term === 'string')
      assert.ok(typeof item.meaning === 'string')
    }

    assert.ok(Array.isArray(result.keyMetrics), 'KeyMetrics should be an array')
    for (const metric of result.keyMetrics) {
      assert.ok(typeof metric.metric === 'string')
      assert.ok(typeof metric.value === 'string')
      assert.ok(typeof metric.why === 'string')
    }

    assert.ok(Array.isArray(result.weakClaims), 'WeakClaims should be an array')
    assert.ok(Array.isArray(result.evidenceSuggestions), 'EvidenceSuggestions should be an array')
  })

  it('explainSection handles empty report text gracefully', async () => {
    const emptyResult = await explainSection('', 2)
    assert.ok(emptyResult, 'Should handle empty string without crashing')
    assert.ok(Array.isArray(emptyResult.summary))
    assert.ok(emptyResult.summary.length > 0)
    assert.ok(Array.isArray(emptyResult.glossary))
    assert.ok(Array.isArray(emptyResult.keyMetrics))
    assert.ok(Array.isArray(emptyResult.weakClaims))
    assert.ok(Array.isArray(emptyResult.evidenceSuggestions))
  })

  it('answerQuestion returns a clear answer with cited sections', async () => {
    const res = await answerQuestion(sampleReportText, 'What curriculum system does the institution follow?')
    assert.ok(res, 'Response should exist')
    assert.ok(typeof res.answer === 'string')
    assert.ok(res.answer.length > 0)
    assert.ok(Array.isArray(res.citedSections))
  })

  it('answerQuestion refuses to invent answers when info is missing', async () => {
    const res = await answerQuestion(sampleReportText, 'What was the exact cafeteria menu in 1995?')
    assert.ok(res)
    assert.ok(typeof res.answer === 'string')
    assert.ok(
      res.answer.toLowerCase().includes('not present in the current report') ||
      res.answer.toLowerCase().includes('information is not present')
    )
  })

  it('compareToIdeal returns a gap list', async () => {
    const res = await compareToIdeal(sampleReportText, 1)
    assert.ok(res, 'Comparison result should exist')
    assert.equal(res.criterion, 1)
    assert.ok(typeof res.idealStandard === 'string')
    assert.ok(Array.isArray(res.gaps), 'Gaps should be an array')
    assert.ok(res.gaps.length > 0)
    for (const gap of res.gaps) {
      assert.ok(typeof gap.area === 'string')
      assert.ok(typeof gap.currentStatus === 'string')
      assert.ok(typeof gap.idealBenchmark === 'string')
      assert.ok(typeof gap.recommendation === 'string')
    }
    assert.ok(typeof res.gapScore === 'number')
  })
})
