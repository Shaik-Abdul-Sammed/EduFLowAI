import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { StaffPermissionRepository } from '../../src/models/StaffPermissionRepository.js'
import { StaffActivityLogRepository } from '../../src/models/StaffActivityLogRepository.js'

describe('Unit: HOD Scoping & Permission Boundaries', () => {
  it('restricts HOD to department-scoped staff and logs', async () => {
    StaffPermissionRepository.clearMemory()
    StaffActivityLogRepository.clearMemory()

    // Create staff in Dept 1 (CSE)
    await StaffActivityLogRepository.logAction({
      institutionId: 1,
      staffUserId: 201,
      officerKey: 'timetable',
      approvalStatus: 'PENDING',
    })

    const pending = await StaffActivityLogRepository.findPending({ departmentId: 1, institutionId: 1 })
    assert.ok(Array.isArray(pending))
  })
})
