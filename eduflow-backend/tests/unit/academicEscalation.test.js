import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { AcademicEscalationService } from '../../src/services/finance/AcademicEscalationService.js'

describe('Unit: AcademicEscalationService', () => {
  beforeEach(() => {
    AcademicEscalationService.resetStore()
  })

  test('escalateToHOD creates a pending escalation for HOD', async () => {
    const item = await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 201,
      studentId: 50,
      studentName: 'Rahul Sharma',
      studentRoll: '1ST22CS050',
      department: 'CSE',
      invoiceNumber: 'EDU-2026-0099',
      amount: 45000,
      raisedBy: 5,
      actionRequested: 'HALL_TICKET_HOLD',
      reason: 'Tuition balance overdue by 45 days'
    })

    assert.ok(item.id)
    assert.equal(item.status, 'PENDING')
    assert.equal(item.action_requested, 'HALL_TICKET_HOLD')
    assert.equal(item.department, 'CSE')
  })

  test('getPendingForHOD returns only matching department escalations', async () => {
    await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 202,
      department: 'CSE',
      studentName: 'CSE Student',
      actionRequested: 'HALL_TICKET_HOLD'
    })
    await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 203,
      department: 'ECE',
      studentName: 'ECE Student',
      actionRequested: 'EXAM_DEBARMENT'
    })

    const csePending = await AcademicEscalationService.getPendingForHOD('CSE', 1)
    assert.equal(csePending.length, 1)
    assert.equal(csePending[0].department, 'CSE')

    const ecePending = await AcademicEscalationService.getPendingForHOD('ECE', 1)
    assert.equal(ecePending.length, 1)
    assert.equal(ecePending[0].department, 'ECE')
  })

  test('approveEscalation updates status to APPROVED with approver ID', async () => {
    const created = await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 204,
      department: 'MECH',
      actionRequested: 'EXAM_DEBARMENT'
    })

    const approved = await AcademicEscalationService.approveEscalation(created.id, 99)
    assert.equal(approved.status, 'APPROVED')
    assert.equal(approved.approved_by, 99)
    assert.ok(approved.approved_at)
  })

  test('rejectEscalation updates status to REJECTED with reason', async () => {
    const created = await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 205,
      department: 'CIVIL',
      actionRequested: 'HALL_TICKET_HOLD'
    })

    const rejected = await AcademicEscalationService.rejectEscalation(created.id, 'Deferred by HOD for student fee counselling')
    assert.equal(rejected.status, 'REJECTED')
    assert.equal(rejected.rejection_reason, 'Deferred by HOD for student fee counselling')
  })
})
