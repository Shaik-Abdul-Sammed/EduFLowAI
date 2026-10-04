import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateImprovementPlan } from '../../src/services/naac/improvementAdvisor.js'
import { NaacInsightsRepository } from '../../src/models/NaacInsightsRepository.js'

describe('Unit: NAAC Grade Improvement Advisor', () => {
  it('generateImprovementPlan calculates gap correctly', async () => {
    const plan = await generateImprovementPlan(1, 'A++')
    assert.ok(plan)
    assert.ok(typeof plan.currentCgpa === 'number')
    assert.ok(typeof plan.targetCgpa === 'number')
    assert.ok(typeof plan.gap === 'number')
    // Target for A++ is 3.51
    const expectedGap = Math.max(0, Number((plan.targetCgpa - plan.currentCgpa).toFixed(2)))
    assert.equal(plan.gap, expectedGap)
  })

  it('generateImprovementPlan returns quick wins, medium term, long term', async () => {
    const plan = await generateImprovementPlan(1, 'A++')
    assert.ok(Array.isArray(plan.quickWins))
    assert.ok(plan.quickWins.length >= 3)
    assert.ok(Array.isArray(plan.mediumTerm))
    assert.ok(plan.mediumTerm.length >= 2)
    assert.ok(Array.isArray(plan.longTerm))
    assert.ok(plan.longTerm.length >= 2)
    assert.ok(typeof plan.realisticTargetDate === 'string')
    assert.ok(typeof plan.estimatedTotalInvestment === 'string')
  })

  it('generateImprovementPlan handles impossible targets', async () => {
    // If target grade is lower than current standing (e.g. C or D) or invalid
    const impossiblePlan = await generateImprovementPlan(1, 'D')
    assert.ok(impossiblePlan)
    assert.equal(impossiblePlan.gap, 0)
    assert.ok(Array.isArray(impossiblePlan.quickWins))
    assert.ok(impossiblePlan.quickWins.length > 0)

    const invalidPlan = await generateImprovementPlan(1, 'INVALID_GRADE')
    assert.ok(invalidPlan)
    assert.ok(typeof invalidPlan.targetCgpa === 'number')
  })

  it('generateImprovementPlan saves to naac_improvement_plans', async () => {
    const plan = await generateImprovementPlan(1, 'A++', 42)
    assert.ok(plan)

    const plans = await NaacInsightsRepository.getImprovementPlans(1, 5)
    assert.ok(Array.isArray(plans))
    assert.ok(plans.length > 0)
    const latest = plans[0]
    assert.equal(latest.institution_id, 1)
    assert.equal(latest.target_grade, 'A++')
  })
})
