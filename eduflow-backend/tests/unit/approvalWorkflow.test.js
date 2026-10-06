import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { StaffActivityLogRepository } from '../../src/models/StaffActivityLogRepository.js'

describe('Unit: Staff Workflow Approval & Activity Log', () => {
  beforeEach(() => {
    StaffActivityLogRepository.clearMemory()
  })

  it('logs a new activity entry in PENDING status', async () => {
    const entry = await StaffActivityLogRepository.logAction({
      institutionId: 1,
      staffUserId: 15,
      officerKey: 'timetable',
      actionType: 'GENERATE',
      promptText: 'Generate CSE 4th semester timetable',
      outputSummary: '40 periods scheduled',
      approvalStatus: 'PENDING',
    })

    assert.ok(entry.id)
    assert.equal(entry.approval_status, 'PENDING')
    assert.equal(entry.officer_key, 'timetable')
  })

  it('updates activity status to APPROVED with approver metadata', async () => {
    const entry = await StaffActivityLogRepository.logAction({
      institutionId: 1,
      staffUserId: 15,
      officerKey: 'timetable',
      promptText: 'Draft timetable',
      approvalStatus: 'PENDING',
    })

    const approved = await StaffActivityLogRepository.updateApproval(entry.id, {
      status: 'APPROVED',
      approvedBy: 2,
    })

    assert.equal(approved.approval_status, 'APPROVED')
    assert.equal(approved.approved_by, 2)
    assert.ok(approved.approved_at)
  })

  it('updates activity status to REJECTED with rejection reason', async () => {
    const entry = await StaffActivityLogRepository.logAction({
      institutionId: 1,
      staffUserId: 15,
      officerKey: 'finance',
      promptText: 'Process fee waiver draft',
      approvalStatus: 'PENDING',
    })

    const rejected = await StaffActivityLogRepository.updateApproval(entry.id, {
      status: 'REJECTED',
      approvedBy: 2,
      rejectionReason: 'Exceeds budget allowance',
    })

    assert.equal(rejected.approval_status, 'REJECTED')
    assert.equal(rejected.rejection_reason, 'Exceeds budget allowance')
  })
})
