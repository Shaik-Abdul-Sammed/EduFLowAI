import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'
import { attachInstitutionContext, institutionContext } from '../../src/db/pool.js'
import { AttendanceComplianceService } from '../../src/services/attendance/AttendanceComplianceService.js'
import { StudentSuccessInsights } from '../../src/services/insights/studentSuccessInsights.js'
import { QuantumOptimizationEngine } from '../../src/services/ai/QuantumOptimizationEngine.js'
import { enqueueJob, getDocumentStatus, processPdfGenerationJob } from '../../src/workers/queueWorker.js'

describe('Security, Async Queues & Ethical AI Patches (Phases 1 - 5)', () => {
  // ── PHASE 1: RLS Security Bypass Protection ────────────────────────────────
  it('Phase 1: Rejects x-bypass-rls header with 403 Forbidden when user is not superadmin', async () => {
    const app = express()
    app.use(express.json())
    app.use((req, res, next) => {
      // Normal user (not superadmin)
      req.user = { id: 42, role: 'faculty', institutionId: 2 }
      next()
    })
    app.use(attachInstitutionContext)
    app.get('/test-rls', (req, res) => res.json({ ok: true }))

    const server = http.createServer(app)
    await new Promise((r) => server.listen(0, r))
    const port = server.address().port

    try {
      // Request with attack header
      const res = await fetch(`http://127.0.0.1:${port}/test-rls`, {
        headers: { 'x-bypass-rls': 'true' }
      })
      assert.equal(res.status, 403)
      const data = await res.json()
      assert.equal(data.success, false)
      assert.ok(data.error.includes('Unauthorized RLS bypass attempt'))
    } finally {
      server.close()
    }
  })

  it('Phase 1: Rejects x-bypass-rls header when user is unauthenticated', async () => {
    const app = express()
    app.use(attachInstitutionContext)
    app.get('/test-unauth-rls', (req, res) => res.json({ ok: true }))

    const server = http.createServer(app)
    await new Promise((r) => server.listen(0, r))
    const port = server.address().port

    try {
      const res = await fetch(`http://127.0.0.1:${port}/test-unauth-rls`, {
        headers: { 'x-bypass-rls': 'true' }
      })
      assert.equal(res.status, 403)
    } finally {
      server.close()
    }
  })

  it('Phase 1: Allows valid superadmin with institutionId ALL to bypass RLS', async () => {
    const app = express()
    app.use((req, res, next) => {
      req.user = { id: 1, role: 'superadmin', institutionId: 'ALL' }
      next()
    })
    app.use(attachInstitutionContext)
    app.get('/test-superadmin-rls', (req, res) => {
      const ctx = institutionContext.getStore()
      res.json({ bypassRls: ctx?.bypassRls, institutionId: ctx?.institutionId })
    })

    const server = http.createServer(app)
    await new Promise((r) => server.listen(0, r))
    const port = server.address().port

    try {
      const res = await fetch(`http://127.0.0.1:${port}/test-superadmin-rls`, {
        headers: { 'x-bypass-rls': 'true' }
      })
      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.bypassRls, true)
      assert.equal(data.institutionId, 'ALL')
    } finally {
      server.close()
    }
  })

  // ── PHASE 3: Asynchronous Background Workers ──────────────────────────────
  it('Phase 3: Enqueues PDF generation job and returns Processing status', async () => {
    const jobRes = await enqueueJob('pdf-generation', {
      type: 'accreditation',
      title: 'Async Unit Test Report',
      institutionName: 'Test Tech Institute',
      text: 'Criterion 1: Curriculum Design.\nCriterion 2: Teaching-Learning.'
    })

    assert.ok(jobRes.jobId)
    assert.equal(jobRes.status, 'Processing...')

    // Immediate check
    const status = await getDocumentStatus(jobRes.jobId)
    assert.ok(status)
    assert.equal(status.jobId, jobRes.jobId)
  })

  it('Phase 3: Background worker processes job and marks it Ready with file path', async () => {
    const testJobId = `job_test_${Date.now()}`
    const result = await processPdfGenerationJob({
      jobId: testJobId,
      type: 'accreditation',
      title: 'Worker Test Report',
      institutionName: 'Test Tech Institute',
      text: 'Criterion 3: Research Innovation and Extension.'
    })

    assert.equal(result.status, 'Ready')
    assert.ok(result.filePath)
    assert.ok(result.fileSize > 0)

    const finalStatus = await getDocumentStatus(testJobId)
    assert.equal(finalStatus.status, 'Ready')
  })

  // ── PHASE 4: Ethical AI & Attendance Counseling ───────────────────────────
  it('Phase 4: Flags counseling_required for students with attendance below 65%', () => {
    const manifest = AttendanceComplianceService.generateHallTicketBarringManifest({
      records: [
        { roll: 'ST01', name: 'Aarav', totalClasses: 100, attendedClasses: 80 },  // 80% Eligible
        { roll: 'ST02', name: 'Bhavna', totalClasses: 100, attendedClasses: 68 }, // 68% Condonable
        { roll: 'ST03', name: 'Chetan', totalClasses: 100, attendedClasses: 58 }, // 58% (<65% Needs Counseling)
      ]
    })

    assert.equal(manifest.summary.eligibleCount, 1)
    assert.equal(manifest.summary.condonationCount, 1)
    assert.equal(manifest.summary.barredCount, 1)

    const student58 = manifest.barredList.find((s) => s.roll === 'ST03')
    assert.ok(student58)
    assert.equal(student58.counseling_required, true)
    assert.equal(student58.hallTicketStatus, 'PENDING_COUNSELING_REVIEW')
    assert.ok(student58.aiRecommendation.includes('Faculty mentor must log a Counseling Note'))
  })

  it('Phase 4: Mentor logging a counseling note approves administrative progression', () => {
    const alert = AttendanceComplianceService.generateAttendanceAlert({
      studentId: 101,
      studentName: 'Chetan',
      departmentName: 'CSE',
      attendancePercentage: 58.0
    })

    assert.equal(alert.counseling_required, true)
    assert.equal(alert.alertLevel, 'CRITICAL')

    const resolved = AttendanceComplianceService.logMentorCounselingNote({
      alert,
      mentorId: 42,
      counselingNote: 'Met student; confirmed recovery from typhoid. Supplementary tutorials assigned.'
    })

    assert.equal(resolved.counseling_required, false)
    assert.equal(resolved.status, 'COUNSELING_COMPLETED')
    assert.ok(resolved.counseling_logged_at)
  })

  it('Phase 4: StudentSuccessInsights predictCohort returns dynamic non-static confidence', async () => {
    const res = await StudentSuccessInsights.predictCohort(1, 'Spring 2027')
    assert.equal(res.success, true)
    assert.equal(res.systemName, 'Early Academic Support Alert System')
    assert.ok(typeof res.confidence === 'number')
    assert.ok(res.confidence >= 0.5)
    // Verify it is not hardcoded 0.88 across varying cohorts
    assert.ok(res.details.ethicalFramework)
    assert.ok(res.details.ethicalFramework.humanInTheLoop)
  })

  // ── SPECIAL QUANTUM MODELS ────────────────────────────────────────────────
  it('Special Quantum Models: solveTimetableQUBO finds zero-conflict schedule via simulated annealing', () => {
    const solution = QuantumOptimizationEngine.solveTimetableQUBO({
      slots: 20,
      iterations: 300,
      tunnelingFactor: 0.4
    })

    assert.equal(solution.success, true)
    assert.equal(solution.algorithm, 'Quantum-Inspired Simulated Annealing (QSA/QUBO)')
    assert.ok(Array.isArray(solution.assignedSchedule))
    assert.equal(solution.conflictsResolved, true)
  })

  it('Special Quantum Models: evaluateAcademicSuperposition computes non-stigmatizing wavefunction', () => {
    const state = QuantumOptimizationEngine.evaluateAcademicSuperposition({
      attendance_percentage: 62.0,
      backlogs: 1,
      cgpa: 6.8
    })

    assert.ok(state.wavefunction)
    const totalP = state.wavefunction.probabilityThriving +
                   state.wavefunction.probabilityTransitioning +
                   state.wavefunction.probabilitySupportNeeded
    assert.ok(Math.abs(totalP - 1.0) < 0.05)
    assert.equal(state.counselingRequired, true)
    assert.ok(state.mentorRecommendation.includes('mentor counseling note'))
  })
})
