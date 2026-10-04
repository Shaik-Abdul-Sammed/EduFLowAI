import { test, describe } from 'node:test'
import assert from 'node:assert'
import { AdmissionsInsights } from '../../src/services/insights/admissionsInsights.js'

describe('Admissions Insights Unit Tests', () => {
  test('explainFunnel identifies drop-off stages', async () => {
    const res = await AdmissionsInsights.explainFunnel(1)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'admissions')
    assert.strictEqual(res.insightType, 'explain')
    assert.ok(Array.isArray(res.details.funnelStages))
    assert.ok(res.details.funnelStages.length >= 3, 'Must identify multiple stages')
    assert.ok(res.details.criticalDropOffStage)
    for (const stage of res.details.funnelStages) {
      assert.ok(stage.stage)
      assert.ok(stage.count !== undefined)
    }
  })

  test('predictYield returns percent between 0 and 100', async () => {
    const res = await AdmissionsInsights.predictYield(1, '2026-27')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'admissions')
    assert.strictEqual(res.insightType, 'predict')
    assert.ok(typeof res.details.predictedYield === 'number')
    assert.ok(res.details.predictedYield >= 0 && res.details.predictedYield <= 100)
    assert.ok(Array.isArray(res.details.branchForecasts))
  })

  test('improveConversion returns at least 3 actions', async () => {
    const res = await AdmissionsInsights.improveConversion(1, '15 percent yield increase')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'admissions')
    assert.strictEqual(res.insightType, 'improve')
    assert.ok(Array.isArray(res.details.actionItems))
    assert.ok(res.details.actionItems.length >= 3, 'Must return at least 3 actions')
    for (const act of res.details.actionItems) {
      assert.ok(act.title)
      assert.ok(act.expectedImpact)
    }
  })

  test('benchmarkAgainstPeers returns competitive comparisons', async () => {
    const res = await AdmissionsInsights.benchmarkAgainstPeers(1)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'admissions')
    assert.strictEqual(res.insightType, 'benchmark')
    assert.ok(Array.isArray(res.details.peerComparisons))
    assert.ok(res.details.peerComparisons.length >= 2)
  })
})
