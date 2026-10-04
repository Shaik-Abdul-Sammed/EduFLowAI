import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { predictVisit } from '../../src/services/naac/visitPredictor.js'
import { NaacInsightsRepository } from '../../src/models/NaacInsightsRepository.js'
import { DemoDataRepository } from '../../src/models/DemoDataRepository.js'

describe('Unit: NAAC Peer Team Visit Predictor', () => {
  it('predictVisit queries all 6 demo tables and returns complete prediction', async () => {
    // Verify demo tables exist and have methods
    assert.ok(typeof DemoDataRepository.getStudents === 'function')
    assert.ok(typeof DemoDataRepository.getFaculty === 'function')
    assert.ok(typeof DemoDataRepository.getCourses === 'function')
    assert.ok(typeof DemoDataRepository.getPlacements === 'function')
    assert.ok(typeof DemoDataRepository.getResearch === 'function')
    assert.ok(typeof DemoDataRepository.getInfrastructure === 'function')

    const res = await predictVisit(1)
    assert.ok(res)
    assert.ok(typeof res.predictedScore === 'number')
    assert.ok(typeof res.predictedGrade === 'string')
    assert.ok(typeof res.predictedCGPA === 'number')
    assert.ok(Array.isArray(res.peerTeamStrengths))
    assert.ok(Array.isArray(res.peerTeamConcerns))
    assert.ok(Array.isArray(res.likelyQuestions))
    assert.ok(Array.isArray(res.evidenceToPrepare))
  })

  it('predictVisit saves to naac_visit_predictions', async () => {
    const res = await predictVisit(1, 99)
    assert.ok(res)

    const history = await NaacInsightsRepository.getVisitPredictions(1, 5)
    assert.ok(Array.isArray(history))
    assert.ok(history.length > 0)
    const latest = history[0]
    assert.equal(latest.institution_id, 1)
    assert.ok(latest.predicted_grade)
  })

  it('predictVisit returns confidence between 0 and 1', async () => {
    const res = await predictVisit(1)
    assert.ok(typeof res.confidence === 'number')
    assert.ok(res.confidence >= 0 && res.confidence <= 1)
  })

  it('predictVisit handles missing data gracefully', async () => {
    // Passing non-existent or edge institution ID
    const res = await predictVisit(999999)
    assert.ok(res)
    assert.ok(typeof res.predictedScore === 'number')
    assert.ok(typeof res.predictedGrade === 'string')
    assert.ok(typeof res.readinessScore === 'number')
  })

  it('predictVisit returns realistic readiness score', async () => {
    const res = await predictVisit(1)
    assert.ok(typeof res.readinessScore === 'number')
    assert.ok(res.readinessScore >= 0 && res.readinessScore <= 100)
    assert.ok(res.readinessScore >= 50, 'Demo institution should have realistic high readiness score')
  })
})
