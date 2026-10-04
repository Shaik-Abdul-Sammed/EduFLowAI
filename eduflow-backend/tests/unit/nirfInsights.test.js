import { test, describe } from 'node:test'
import assert from 'node:assert'
import { NirfInsights } from '../../src/services/nirf/nirfInsights.js'
import { NirfRepository } from '../../src/models/NirfRepository.js'
import { PEER_INSTITUTIONS } from '../../scripts/seed-nirf-data.js'

describe('NIRF Insights Unit Tests', () => {
  test('explainScore returns root causes and quick fixes', async () => {
    const res = await NirfInsights.explainScore(1, 'RP')
    assert.ok(res.success, 'explainScore must succeed')
    assert.strictEqual(res.parameter, 'RP')
    assert.ok(Array.isArray(res.rootCauses) && res.rootCauses.length >= 2, 'Must return at least 2 root causes')
    assert.ok(Array.isArray(res.quickFixes) && res.quickFixes.length >= 2, 'Must return at least 2 quick fixes')
    assert.ok(res.summary && res.summary.length > 20, 'Summary must be non-empty')
    assert.ok(res.comparisonToPeerAverage, 'Must return comparisonToPeerAverage')
  })

  test('predictRank returns a numeric rank and confidence', async () => {
    await NirfRepository.seedPeerInstitutions(PEER_INSTITUTIONS)
    const res = await NirfInsights.predictRank(1, 'Engineering', 12)
    assert.ok(res.success, 'predictRank must succeed')
    assert.ok(typeof res.predictedRank === 'number', 'predictedRank must be a number')
    assert.ok(res.predictedRank >= 1 && res.predictedRank <= 200, 'predictedRank must be valid')
    assert.ok(typeof res.confidence === 'number' && res.confidence > 0.8, 'confidence must exceed 0.8')
    assert.ok(res.trajectory === 'UPWARD' || res.trajectory === 'STABLE')
    assert.ok(Array.isArray(res.likelyPeersToOvertake))
  })

  test('benchmarkAgainstPeers identifies peers ahead and behind', async () => {
    await NirfRepository.seedPeerInstitutions(PEER_INSTITUTIONS)
    const res = await NirfInsights.benchmarkAgainstPeers(1, 'Engineering', 10)
    assert.ok(res.success, 'benchmarkAgainstPeers must succeed')
    assert.ok(typeof res.institutionRank === 'number')
    assert.ok(typeof res.peersAhead === 'number')
    assert.ok(typeof res.peersBehind === 'number')
    assert.ok(Array.isArray(res.topPeers) && res.topPeers.length > 0)
    assert.ok(res.gapAnalysis && res.gapAnalysis.totalGap !== undefined)
    assert.ok(Array.isArray(res.strengthAreas) && res.strengthAreas.length > 0)
    assert.ok(Array.isArray(res.weaknessAreas) && res.weaknessAreas.length > 0)
  })

  test('improveRank returns prioritized parameters', async () => {
    await NirfRepository.seedPeerInstitutions(PEER_INSTITUTIONS)
    const res = await NirfInsights.improveRank(1, 50, 'Engineering')
    assert.ok(res.success, 'improveRank must succeed')
    assert.strictEqual(res.targetRank, 50)
    assert.ok(Array.isArray(res.priorityParameters) && res.priorityParameters.length > 0)
    assert.ok(Array.isArray(res.quickWins) && res.quickWins.length > 0)
    assert.ok(Array.isArray(res.mediumTerm) && res.mediumTerm.length > 0)
    assert.ok(Array.isArray(res.longTerm) && res.longTerm.length > 0)
    assert.ok(typeof res.timelineMonths === 'number' && res.timelineMonths > 0)
  })

  test('compareNaacToNirf explains discrepancies', async () => {
    const res = await NirfInsights.compareNaacToNirf(1)
    assert.ok(res.success, 'compareNaacToNirf must succeed')
    assert.ok(res.naacGrade, 'NAAC grade must be present')
    assert.ok(typeof res.nirfRank === 'number', 'NIRF rank must be a number')
    assert.ok(res.expectedNirfForGrade, 'expectedNirfForGrade must exist')
    assert.ok(res.explanation && res.explanation.length > 50, 'Detailed explanation must be provided')
    assert.ok(Array.isArray(res.keyDifferences) && res.keyDifferences.length >= 3, 'Key differences must cover evaluation focus, research, and perception')
  })
})
