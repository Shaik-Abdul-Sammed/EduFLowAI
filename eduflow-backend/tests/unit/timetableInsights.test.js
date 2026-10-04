import { test, describe } from 'node:test'
import assert from 'node:assert'
import { TimetableInsights } from '../../src/services/insights/timetableInsights.js'

describe('Timetable Insights Unit Tests', () => {
  test('explainConflict returns root cause and fix', async () => {
    const res = await TimetableInsights.explainConflict('C-101')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'timetable')
    assert.strictEqual(res.insightType, 'explain')
    assert.ok(res.details.rootCause, 'Must include root cause')
    assert.ok(res.details.fix, 'Must include fix')
    assert.ok(res.details.affectedFaculty)
    assert.ok(res.recommendations.length > 0)
  })

  test('predictUtilization returns room and faculty utilization', async () => {
    const res = await TimetableInsights.predictUtilization(1, 4)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'timetable')
    assert.strictEqual(res.insightType, 'predict')
    assert.ok(typeof res.details.roomUtilization === 'number')
    assert.ok(res.details.roomUtilization > 0 && res.details.roomUtilization <= 100)
    assert.ok(typeof res.details.facultyUtilization === 'number')
    assert.ok(res.details.facultyUtilization > 0 && res.details.facultyUtilization <= 100)
    assert.ok(Array.isArray(res.details.roomTypeBreakdown))
  })

  test('balanceWorkload reduces max weekly hours', async () => {
    const res = await TimetableInsights.balanceWorkload(1)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'timetable')
    assert.strictEqual(res.insightType, 'workload-balance')
    assert.ok(typeof res.details.initialMaxWeeklyHours === 'number')
    assert.ok(typeof res.details.reducedMaxWeeklyHours === 'number')
    assert.ok(
      res.details.reducedMaxWeeklyHours < res.details.initialMaxWeeklyHours,
      'reducedMaxWeeklyHours must be strictly less than initialMaxWeeklyHours'
    )
    assert.ok(Array.isArray(res.details.redistributionPlan))
  })

  test('improveSchedule returns optimization interventions', async () => {
    const res = await TimetableInsights.improveSchedule(1, 'zero conflicts')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.domain, 'timetable')
    assert.strictEqual(res.insightType, 'improve')
    assert.ok(Array.isArray(res.details.improvements))
    assert.strictEqual(res.details.projectedConflicts, 0)
  })
})
