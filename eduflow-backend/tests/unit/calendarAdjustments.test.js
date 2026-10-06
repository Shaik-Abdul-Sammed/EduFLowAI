import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarAdjustments } from '../../src/services/calendar/CalendarAdjustments.js'

describe('Unit: Calendar Adjustments & Notification', () => {
  it('extends a holiday and returns updated adjustment object', async () => {
    const res = await CalendarAdjustments.extendHoliday(1, 10, 2, 'Unseasonal Heavy Rainfall Alert', 2)
    assert.equal(res.success, true)
    assert.equal(res.adjustmentType, 'EXTEND_HOLIDAY')
    assert.equal(res.additionalDays, 2)
  })

  it('postpones an exam due to local election or conflict', async () => {
    const res = await CalendarAdjustments.postponeExam(1, 5, '2026-09-02', 'State Election Date Clashed')
    assert.equal(res.success, true)
    assert.equal(res.adjustmentType, 'POSTPONE_EXAM')
    assert.equal(res.newStartDate, '2026-09-02')
  })

  it('notifies stakeholders across email, banner, and sms', async () => {
    const notif = await CalendarAdjustments.notifyStakeholders(1, 'EXTEND_HOLIDAY', { days: 1 })
    assert.equal(notif.success, true)
    assert.ok(notif.channels.includes('EMAIL'))
  })
})
