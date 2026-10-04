import { test, describe } from 'node:test'
import assert from 'node:assert'
import { NirfScoreCalculator } from '../../src/services/nirf/nirfScoreCalculator.js'
import { NirfRepository } from '../../src/models/NirfRepository.js'
import { PEER_INSTITUTIONS } from '../../scripts/seed-nirf-data.js'

describe('NIRF Score Calculator Unit Tests', () => {
  test('Calculates TLR score correctly with standard weights', async () => {
    const res = await NirfScoreCalculator.calculateNirfScore(1, 'Engineering')
    assert.ok(res.success, 'Calculation should succeed')
    const tlr = res.parameterScores.TLR
    assert.ok(tlr, 'TLR parameter score must exist')
    assert.strictEqual(tlr.weight, 0.30, 'TLR weight must be 0.30')
    assert.ok(tlr.score >= 40 && tlr.score <= 100, `TLR score ${tlr.score} should be within 40-100`)
    assert.ok(tlr.subMetrics.SS !== undefined, 'Sub-metric SS must be present')
    assert.ok(tlr.subMetrics.FSR !== undefined, 'Sub-metric FSR must be present')
    assert.ok(tlr.subMetrics.FQE !== undefined, 'Sub-metric FQE must be present')
    assert.ok(tlr.subMetrics.FRU !== undefined, 'Sub-metric FRU must be present')

    // Verify submetric weighted sum: 0.20*SS + 0.30*FSR + 0.20*FQE + 0.30*FRU
    const expectedTlr = Number((0.20 * tlr.subMetrics.SS + 0.30 * tlr.subMetrics.FSR + 0.20 * tlr.subMetrics.FQE + 0.30 * tlr.subMetrics.FRU).toFixed(2))
    assert.strictEqual(tlr.score, expectedTlr, 'TLR score should equal weighted sum of its sub-metrics')
  })

  test('Calculates RP score correctly with publications, quality, IPR, FPPP', async () => {
    const res = await NirfScoreCalculator.calculateNirfScore(1, 'Engineering')
    const rp = res.parameterScores.RP
    assert.ok(rp, 'RP parameter score must exist')
    assert.strictEqual(rp.weight, 0.30, 'RP weight must be 0.30')
    assert.ok(rp.score >= 30 && rp.score <= 100, `RP score ${rp.score} must be valid`)
    assert.ok(rp.subMetrics.PU !== undefined, 'Sub-metric PU must be present')
    assert.ok(rp.subMetrics.QP !== undefined, 'Sub-metric QP must be present')
    assert.ok(rp.subMetrics.IPR !== undefined, 'Sub-metric IPR must be present')
    assert.ok(rp.subMetrics.FPPP !== undefined, 'Sub-metric FPPP must be present')

    // Verify submetric weighted sum: 0.35*PU + 0.35*QP + 0.15*IPR + 0.15*FPPP
    const expectedRp = Number((0.35 * rp.subMetrics.PU + 0.35 * rp.subMetrics.QP + 0.15 * rp.subMetrics.IPR + 0.15 * rp.subMetrics.FPPP).toFixed(2))
    assert.strictEqual(rp.score, expectedRp, 'RP score should equal weighted sum of its sub-metrics')
  })

  test('Calculates total score with correct NIRF 2024 parameter weights', async () => {
    const res = await NirfScoreCalculator.calculateNirfScore(1, 'Engineering')
    const { TLR, RP, GO, OI, PR } = res.parameterScores
    assert.strictEqual(TLR.weight, 0.30)
    assert.strictEqual(RP.weight, 0.30)
    assert.strictEqual(GO.weight, 0.20)
    assert.strictEqual(OI.weight, 0.10)
    assert.strictEqual(PR.weight, 0.10)

    const expectedTotal = Number((0.30 * TLR.score + 0.30 * RP.score + 0.20 * GO.score + 0.10 * OI.score + 0.10 * PR.score).toFixed(2))
    assert.strictEqual(res.totalScore, expectedTotal, 'Total score must accurately reflect NIRF formula')
  })

  test('Determines category rank from peer data', async () => {
    // Seed in-memory peer institutions
    await NirfRepository.seedPeerInstitutions(PEER_INSTITUTIONS)
    const res = await NirfScoreCalculator.calculateNirfScore(1, 'Engineering')
    assert.ok(typeof res.predictedRank === 'number', 'Predicted rank must be a number')
    assert.ok(res.predictedRank >= 1 && res.predictedRank <= 200, `Rank ${res.predictedRank} should be within valid bounds`)
  })

  test('Handles missing data gracefully without throwing', async () => {
    // Institution ID with no existing records
    const res = await NirfScoreCalculator.calculateNirfScore(99999, 'Engineering')
    assert.ok(res.success, 'Calculation should succeed with fallback heuristics')
    assert.ok(res.totalScore > 0, 'Total score should be calculated')
    assert.ok(res.parameterScores.TLR.score > 0)
    assert.ok(res.parameterScores.RP.score > 0)
    assert.ok(res.parameterScores.GO.score > 0)
  })
})
