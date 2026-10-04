import { test, describe } from 'node:test'
import assert from 'node:assert'
import { StudentSuccessInsights } from '../../src/services/insights/studentSuccessInsights.js'

describe('Student Success Insights Unit Tests', () => {
  test('explainRisk returns valid explanation', async () => {
    const res = await StudentSuccessInsights.explainRisk('2024-CSE-001')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'student-success')
    assert.strictEqual(res.insightType, 'explain')
    assert.ok(typeof res.summary === 'string' && res.summary.length > 0)
    assert.ok(res.details)
    assert.ok(res.details.student)
    assert.ok(Array.isArray(res.details.riskFactors))
    assert.ok(Array.isArray(res.recommendations) && res.recommendations.length > 0)
    assert.ok(typeof res.confidence === 'number' && res.confidence > 0)
  })

  test('predictCohort returns dropout percent and confidence', async () => {
    const res = await StudentSuccessInsights.predictCohort(1, 'Fall 2026')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'student-success')
    assert.strictEqual(res.insightType, 'predict')
    assert.ok(typeof res.details.predictedDropoutRate === 'number')
    assert.ok(res.details.predictedDropoutRate >= 0 && res.details.predictedDropoutRate <= 100)
    assert.ok(typeof res.confidence === 'number' && res.confidence >= 0.5)
    assert.ok(Array.isArray(res.details.departmentBreakdown))
  })

  test('improveRetention returns plan with milestones', async () => {
    const res = await StudentSuccessInsights.improveRetention(1, 30)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'student-success')
    assert.strictEqual(res.insightType, 'improve')
    assert.ok(Array.isArray(res.details.milestones))
    assert.ok(res.details.milestones.length >= 3)
    assert.strictEqual(res.details.targetReductionPercent, 30)
    assert.ok(res.recommendations.length > 0)
  })

  test('identifyInterventions returns at least one per at-risk student', async () => {
    const res = await StudentSuccessInsights.identifyInterventions(1)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'student-success')
    assert.strictEqual(res.insightType, 'interventions')
    assert.ok(Array.isArray(res.details.interventions))
    assert.ok(res.details.interventions.length >= 1, 'Must return at least one intervention')
    for (const item of res.details.interventions) {
      assert.ok(item.studentId || item.rollNumber)
      assert.ok(item.recommendedAction)
      assert.ok(item.urgency)
    }
  })
})
