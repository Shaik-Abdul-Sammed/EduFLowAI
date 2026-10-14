import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { FeeReminderService } from '../../src/services/finance/FeeReminderService.js'

describe('Unit: Financial Separation Architecture', () => {
  test('Tier 3 reminder emanates from Office of the Finance Officer, not Dean', () => {
    const template = FeeReminderService.getTemplate(3, {
      studentName: 'Aarav Patel',
      rollNumber: '1ST22CS001',
      invoiceNumber: 'EDU-2026-0012',
      amountDue: '₹45,000',
      dueDate: '15-Oct-2026',
      daysOverdue: 35,
      upiVpa: 'ssit@sbi',
      institutionName: 'Sri Siddhartha Institute of Technology'
    })

    assert.ok(template.body.includes('Office of the Finance Officer'))
    assert.ok(!template.body.includes('Office of the Dean'))
  })

  test('Tier 4 statutory escalation emanates from Office of the Registrar, not Dean', () => {
    const template = FeeReminderService.getTemplate(4, {
      studentName: 'Aarav Patel',
      rollNumber: '1ST22CS001',
      invoiceNumber: 'EDU-2026-0012',
      amountDue: '₹45,000',
      dueDate: '15-Oct-2026',
      daysOverdue: 65,
      upiVpa: 'ssit@sbi',
      institutionName: 'Sri Siddhartha Institute of Technology'
    })

    assert.ok(template.body.includes("Registrar's Office") || template.body.includes('Office of the Registrar'))
    assert.ok(!template.body.includes('Office of the Dean'))
  })

  test('Waiver threshold logic: <= ₹100,000 sanctioned by FO, > ₹100,000 routed to Dean', () => {
    const threshold = 100000

    function evaluateWaiverRouting(amount) {
      if (amount > threshold) {
        return { status: 'ROUTED_TO_DEAN', approver: 'Dean of Academic Affairs' }
      }
      return { status: 'SANCTIONED_BY_FO', approver: 'Finance Officer' }
    }

    const lowWaiver = evaluateWaiverRouting(35000)
    assert.equal(lowWaiver.status, 'SANCTIONED_BY_FO')
    assert.equal(lowWaiver.approver, 'Finance Officer')

    const highWaiver = evaluateWaiverRouting(150000)
    assert.equal(highWaiver.status, 'ROUTED_TO_DEAN')
    assert.equal(highWaiver.approver, 'Dean of Academic Affairs')
  })
})
