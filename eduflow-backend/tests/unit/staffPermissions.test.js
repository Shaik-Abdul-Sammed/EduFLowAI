import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { StaffPermissionRepository } from '../../src/models/StaffPermissionRepository.js'
import { checkOfficerPermission } from '../../src/middleware/staffPermissions.js'
import { DailyLimitService } from '../../src/services/staff/DailyLimitService.js'

describe('Unit: Staff Permissions Middleware & Repository', () => {
  beforeEach(() => {
    StaffPermissionRepository.clearMemory()
    DailyLimitService.resetDailyCounters()
  })

  it('allows admin and hod roles with no permission record needed', async () => {
    const adminMiddleware = checkOfficerPermission('accreditation')
    let nextCalled = false
    const req = { user: { id: 1, role: 'admin' }, method: 'POST' }
    const res = {}
    await adminMiddleware(req, res, () => { nextCalled = true })
    assert.equal(nextCalled, true)

    let hodNext = false
    const hodReq = { user: { id: 2, role: 'hod', departmentId: 1 }, method: 'POST' }
    await adminMiddleware(hodReq, res, () => { hodNext = true })
    assert.equal(hodNext, true)
  })

  it('blocks staff user without granted permission with 403', async () => {
    const middleware = checkOfficerPermission('finance')
    let statusSet = null
    let responseBody = null
    const req = { user: { id: 10, role: 'staff', departmentId: 1 }, method: 'POST' }
    const res = {
      status(s) { statusSet = s; return this },
      json(b) { responseBody = b; return this },
    }
    await middleware(req, res, () => {})
    assert.equal(statusSet, 403)
    assert.match(responseBody.error, /permission/i)
  })

  it('allows staff user with FULL permission and attaches metadata', async () => {
    await StaffPermissionRepository.create({
      staffUserId: 10,
      officerKey: 'timetable',
      permissionLevel: 'FULL',
      departmentId: 1,
      maxRequestsPerDay: 20,
      requiresApproval: false,
    })

    const middleware = checkOfficerPermission('timetable')
    let nextCalled = false
    const req = { user: { id: 10, role: 'staff', departmentId: 1 }, method: 'POST' }
    const res = {}
    await middleware(req, res, () => { nextCalled = true })
    assert.equal(nextCalled, true)
    assert.equal(req.requiresApproval, false)
    assert.equal(req.staffPermission.permission_level, 'FULL')
  })

  it('blocks mutation when staff user has VIEW_ONLY permission', async () => {
    await StaffPermissionRepository.create({
      staffUserId: 10,
      officerKey: 'accreditation',
      permissionLevel: 'VIEW_ONLY',
      departmentId: 1,
    })

    const middleware = checkOfficerPermission('accreditation')
    let statusSet = null
    let responseBody = null
    const req = { user: { id: 10, role: 'staff', departmentId: 1 }, method: 'POST' }
    const res = {
      status(s) { statusSet = s; return this },
      json(b) { responseBody = b; return this },
    }
    await middleware(req, res, () => {})
    assert.equal(statusSet, 403)
    assert.match(responseBody.error, /VIEW_ONLY/i)
  })

  it('flags request for approval when permission level is DRAFT', async () => {
    await StaffPermissionRepository.create({
      staffUserId: 10,
      officerKey: 'timetable',
      permissionLevel: 'DRAFT',
      departmentId: 1,
      requiresApproval: true,
    })

    const middleware = checkOfficerPermission('timetable')
    let nextCalled = false
    const req = { user: { id: 10, role: 'staff', departmentId: 1 }, method: 'POST' }
    const res = {}
    await middleware(req, res, () => { nextCalled = true })
    assert.equal(nextCalled, true)
    assert.equal(req.requiresApproval, true)
  })
})
