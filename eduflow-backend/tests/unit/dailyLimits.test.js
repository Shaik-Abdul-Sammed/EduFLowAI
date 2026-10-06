import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { DailyLimitService } from '../../src/services/staff/DailyLimitService.js'

describe('Unit: Daily Limit Service for Staff', () => {
  beforeEach(() => {
    DailyLimitService.resetDailyCounters()
  })

  it('increments usage counter and returns remaining count', () => {
    const res1 = DailyLimitService.checkAndIncrement(10, 'timetable', 5)
    assert.equal(res1.allowed, true)
    assert.equal(res1.current, 1)
    assert.equal(res1.remaining, 4)

    const res2 = DailyLimitService.checkAndIncrement(10, 'timetable', 5)
    assert.equal(res2.allowed, true)
    assert.equal(res2.current, 2)
    assert.equal(res2.remaining, 3)
  })

  it('blocks requests once maximum daily requests per officer is reached', () => {
    for (let i = 0; i < 5; i++) {
      DailyLimitService.checkAndIncrement(10, 'timetable', 5)
    }

    const blocked = DailyLimitService.checkAndIncrement(10, 'timetable', 5)
    assert.equal(blocked.allowed, false)
    assert.equal(blocked.current, 5)
    assert.equal(blocked.remaining, 0)
  })

  it('resets counters across all staff users and officers', () => {
    DailyLimitService.checkAndIncrement(10, 'timetable', 5)
    DailyLimitService.checkAndIncrement(12, 'finance', 5)

    assert.equal(DailyLimitService.getTodayUsage(10, 'timetable'), 1)
    assert.equal(DailyLimitService.getTodayUsage(12, 'finance'), 1)

    DailyLimitService.resetDailyCounters()

    assert.equal(DailyLimitService.getTodayUsage(10, 'timetable'), 0)
    assert.equal(DailyLimitService.getTodayUsage(12, 'finance'), 0)
  })
})
