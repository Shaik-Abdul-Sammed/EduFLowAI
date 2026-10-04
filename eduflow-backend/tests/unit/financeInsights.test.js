import { test, describe } from 'node:test'
import assert from 'node:assert'
import { FinanceInsights } from '../../src/services/insights/financeInsights.js'

describe('Finance Insights Unit Tests', () => {
  test('explainVariance returns mismatch reason', async () => {
    const res = await FinanceInsights.explainVariance('TXN-9021')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'finance')
    assert.strictEqual(res.insightType, 'explain')
    assert.ok(res.details.mismatchReason, 'Must include mismatch reason')
    assert.ok(res.details.varianceAmount !== undefined)
    assert.ok(res.recommendations.length > 0)
  })

  test('predictCashFlow returns monthly forecasts', async () => {
    const res = await FinanceInsights.predictCashFlow(1, 6)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'finance')
    assert.strictEqual(res.insightType, 'predict')
    assert.ok(Array.isArray(res.details.monthlyForecasts))
    assert.strictEqual(res.details.monthlyForecasts.length, 6, 'Must contain 6 monthly forecasts')
    for (const m of res.details.monthlyForecasts) {
      assert.ok(m.month)
      assert.ok(typeof m.expectedInflow === 'number')
      assert.ok(typeof m.projectedClosingCash === 'number')
    }
  })

  test('auditReadiness flags GST issues', async () => {
    const res = await FinanceInsights.auditReadiness(1)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'finance')
    assert.strictEqual(res.insightType, 'audit-readiness')
    assert.ok(Array.isArray(res.details.gstIssuesFlagged), 'Must flag GST issues')
    assert.ok(res.details.gstIssuesFlagged.length > 0)
    assert.ok(Array.isArray(res.details.complianceChecks))
  })

  test('improveCollection returns recovery blueprint and steps', async () => {
    const res = await FinanceInsights.improveCollection(1, '50 percent defaulter reduction')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'finance')
    assert.strictEqual(res.insightType, 'improve')
    assert.ok(Array.isArray(res.details.actionSteps))
    assert.ok(res.details.actionSteps.length >= 3)
  })
})
