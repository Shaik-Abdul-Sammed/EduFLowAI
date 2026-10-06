import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'
import { StaffPermissionRepository } from '../../src/models/StaffPermissionRepository.js'
import { StaffActivityLogRepository } from '../../src/models/StaffActivityLogRepository.js'
import { DailyLimitService } from '../../src/services/staff/DailyLimitService.js'

describe('Integration: Staff Delegated Workflow & Approval Lifecycle', () => {
  let server
  let baseUrl
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

  before(async () => {
    StaffPermissionRepository.clearMemory()
    StaffActivityLogRepository.clearMemory()
    DailyLimitService.resetDailyCounters()

    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  function makeToken(user) {
    return jwt.sign(user, secret, { expiresIn: '15m' })
  }

  it('executes full flow: grant -> staff submit draft -> hod approve', async () => {
    const hodToken = makeToken({ id: 2, role: 'hod', departmentId: 1, email: 'hod@demo.edu' })
    const staffUser = { id: 105, role: 'staff', departmentId: 1, email: 'priya.staff@demo.edu' }
    const staffToken = makeToken(staffUser)

    // Step 1: HOD grants timetable DRAFT permission to Priya
    const grantRes = await fetch(`${baseUrl}/api/v1/staff/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hodToken}`,
      },
      body: JSON.stringify({
        staffUserId: staffUser.id,
        officerKey: 'timetable',
        permissionLevel: 'DRAFT',
        departmentId: 1,
        maxRequestsPerDay: 15,
        requiresApproval: true,
      }),
    })
    assert.equal(grantRes.status, 201)
    const grantBody = await grantRes.json()
    assert.equal(grantBody.permission.permission_level, 'DRAFT')

    // Step 2: Priya checks her own permissions
    const myPermsRes = await fetch(`${baseUrl}/api/v1/staff/my-permissions`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    })
    assert.equal(myPermsRes.status, 200)
    const myPerms = await myPermsRes.json()
    assert.ok(myPerms.permissions.some((p) => p.officer_key === 'timetable'))

    // Step 3: Priya submits a timetable prompt
    const officerRes = await fetch(`${baseUrl}/api/v1/officers/timetable/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        reportType: 'Generate 2026 odd semester CSE timetable',
      }),
    })
    assert.equal(officerRes.status, 200)

    // Priya manually logs her draft generation or officer controller creates log
    const logEntry = await StaffActivityLogRepository.logAction({
      institutionId: 1,
      staffUserId: staffUser.id,
      officerKey: 'timetable',
      actionType: 'GENERATE',
      promptText: 'Generate 2026 odd semester CSE timetable',
      outputSummary: '40 periods conflict-free',
      approvalStatus: 'PENDING',
    })
    assert.ok(logEntry.id)

    // Step 4: HOD fetches pending approvals
    const pendingRes = await fetch(`${baseUrl}/api/v1/approvals/pending`, {
      headers: { Authorization: `Bearer ${hodToken}` },
    })
    assert.equal(pendingRes.status, 200)
    const pendingData = await pendingRes.json()
    assert.ok(pendingData.approvals.some((a) => a.id === logEntry.id))

    // Step 5: HOD approves Priya's submission
    const approveRes = await fetch(`${baseUrl}/api/v1/approvals/${logEntry.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hodToken}` },
    })
    assert.equal(approveRes.status, 200)
    const approveBody = await approveRes.json()
    assert.equal(approveBody.approval.approval_status, 'APPROVED')
    assert.equal(approveBody.approval.approved_by, 2)
  })

  it('rejects unauthorized officer access for staff without permission', async () => {
    const staffUser = { id: 105, role: 'staff', departmentId: 1, email: 'priya.staff@demo.edu' }
    const staffToken = makeToken(staffUser)

    // Priya tries to access Finance officer without permission
    const financeRes = await fetch(`${baseUrl}/api/v1/officers/finance/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        reportType: 'Audit fee collections',
      }),
    })

    assert.equal(financeRes.status, 403)
    const body = await financeRes.json()
    assert.match(body.error, /permission/i)
  })
})
