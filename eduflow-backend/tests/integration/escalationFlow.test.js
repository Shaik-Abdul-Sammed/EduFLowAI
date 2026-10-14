import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { AcademicEscalationController } from '../../src/controllers/AcademicEscalationController.js'
import { AcademicEscalationService } from '../../src/services/finance/AcademicEscalationService.js'

describe('Integration: Academic Escalation Flow (Finance to HOD)', () => {
  beforeEach(() => {
    AcademicEscalationService.resetStore()
  })

  test('Finance Officer creates academic escalation for overdue student', async () => {
    let statusCode = null
    let resBody = null

    const req = {
      user: { id: 2, institutionId: 1, role: 'finance_officer', financeScope: 'INSTITUTION' },
      body: {
        invoiceId: 501,
        studentId: 88,
        studentName: 'Vikram Joshi',
        studentRoll: '1ST22CS088',
        department: 'CSE',
        invoiceNumber: 'EDU-2026-0501',
        amount: 55000,
        actionRequested: 'HALL_TICKET_HOLD',
        reason: 'Tuition arrears unpaid despite Tier 3 notice'
      }
    }

    const res = {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    }

    await AcademicEscalationController.createEscalation(req, res)

    assert.equal(statusCode, 201)
    assert.equal(resBody.success, true)
    assert.equal(resBody.escalation.action_requested, 'HALL_TICKET_HOLD')
    assert.equal(resBody.escalation.department, 'CSE')
  })

  test('HOD of CSE views pending escalations for their department', async () => {
    // Seed two escalations
    await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 502,
      department: 'CSE',
      studentName: 'CSE Student 1',
      actionRequested: 'HALL_TICKET_HOLD'
    })
    await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 503,
      department: 'MECH',
      studentName: 'MECH Student 1',
      actionRequested: 'EXAM_DEBARMENT'
    })

    let statusCode = null
    let resBody = null

    const req = {
      user: { id: 10, institutionId: 1, role: 'hod', department: 'CSE' }
    }
    const res = {
      status: (code) => {
        statusCode = code
        return { json: (d) => { resBody = d } }
      }
    }

    await AcademicEscalationController.getPendingForHOD(req, res)

    assert.equal(statusCode, 200)
    assert.equal(resBody.success, true)
    assert.equal(resBody.escalations.length, 1)
    assert.equal(resBody.escalations[0].department, 'CSE')
  })

  test('HOD approves hall ticket hold and rejects another with counselling reason', async () => {
    const esc1 = await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 504,
      department: 'CSE',
      actionRequested: 'HALL_TICKET_HOLD'
    })
    const esc2 = await AcademicEscalationService.escalateToHOD({
      institutionId: 1,
      invoiceId: 505,
      department: 'CSE',
      actionRequested: 'EXAM_DEBARMENT'
    })

    // Approve esc1
    let approveBody = null
    await AcademicEscalationController.approveEscalation(
      { user: { id: 10 }, params: { id: esc1.id } },
      { status: () => ({ json: (d) => { approveBody = d } }) }
    )
    assert.equal(approveBody.escalation.status, 'APPROVED')

    // Reject esc2
    let rejectBody = null
    await AcademicEscalationController.rejectEscalation(
      { user: { id: 10 }, params: { id: esc2.id }, body: { reason: 'Student offered EMI payment schedule' } },
      { status: () => ({ json: (d) => { rejectBody = d } }) }
    )
    assert.equal(rejectBody.escalation.status, 'REJECTED')
    assert.equal(rejectBody.escalation.rejection_reason, 'Student offered EMI payment schedule')
  })
})
