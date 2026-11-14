import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createApp } from '../../src/app.js'
import { memoryAuditLogs, _clearAuditLogs } from '../../src/middleware/auditLogger.js'
import { cacheService } from '../../src/services/CacheService.js'
import { ProctoringController } from '../../src/controllers/ProctoringController.js'

describe('Enterprise Hardening: SOC2 Audit Logging, LTI 1.3 JWKS, AI Procurement, & Cache', () => {
  let server
  let baseUrl

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  beforeEach(async () => {
    _clearAuditLogs()
    await cacheService.flush()
    ProctoringController._resetMemory()
  })

  // ─── 1. SOC 2 Audit Logger Tests ───────────────────────────────────────────
  it('audit logger intercepts successful mutating requests and logs to immutable_audit_logs', async () => {
    const res = await fetch(`${baseUrl}/api/v1/exams/1/violation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-42',
        'x-institution-id': '1'
      },
      body: JSON.stringify({
        student_roll: 'TEST-ROLL-01',
        student_name: 'Audit Test Student',
        violation_type: 'TAB_SWITCH',
        details: 'Switched window during test.'
      })
    })

    assert.equal(res.status, 201)

    // Wait short tick for res.on('finish') async callback
    await new Promise((r) => setTimeout(r, 60))

    assert.ok(memoryAuditLogs.length >= 1, 'Audit log must record mutating action')
    const latest = memoryAuditLogs[0]
    assert.equal(latest.user_id, 'test-user-42')
    assert.equal(latest.institution_id, 1)
    assert.ok(latest.endpoint.includes('/violation'))
    assert.equal(latest.status_code, 201)
    assert.ok(latest.timestamp)
  })

  it('audit logger ignores read-only GET requests', async () => {
    const initialCount = memoryAuditLogs.length
    const res = await fetch(`${baseUrl}/api/health`)
    assert.equal(res.status, 200)

    await new Promise((r) => setTimeout(r, 40))
    assert.equal(memoryAuditLogs.length, initialCount)
  })

  // ─── 2. LTI 1.3 Advantage JWKS & OIDC Login Tests ─────────────────────────
  it('GET /api/v1/lti/.well-known/jwks.json serves valid RSA public JWK for LMS verification', async () => {
    const res = await fetch(`${baseUrl}/api/v1/lti/.well-known/jwks.json`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.keys && Array.isArray(body.keys))
    assert.ok(body.keys.length > 0)

    const key = body.keys[0]
    assert.equal(key.kty, 'RSA')
    assert.equal(key.alg, 'RS256')
    assert.equal(key.use, 'sig')
    assert.ok(key.kid)
    assert.ok(key.n)
    assert.equal(key.e, 'AQAB')
  })

  it('GET /api/v1/lti/login with iss and login_hint generates 302 redirect URL to LMS auth endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/v1/lti/login?iss=https://canvas.instructure.com&login_hint=user_canvas_99`, {
      redirect: 'manual'
    })

    assert.equal(res.status, 302)
    const location = res.headers.get('location')
    assert.ok(location)
    assert.ok(location.includes('https://canvas.instructure.com'))
    assert.ok(location.includes('response_type=id_token'))
    assert.ok(location.includes('state='))
    assert.ok(location.includes('nonce='))
  })

  it('POST /api/v1/lti/launch parses Instructor role to faculty and Learner to student with session JWT', async () => {
    const instructorRes = await fetch(`${baseUrl}/api/v1/lti/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'inst-101',
        role: 'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
        course_id: 'CSE-501'
      })
    })

    assert.equal(instructorRes.status, 200)
    const instBody = await instructorRes.json()
    assert.equal(instBody.role, 'faculty')
    assert.ok(instBody.sessionToken)
    assert.ok(instBody.redirectUrl.includes('/staff-dashboard'))

    const learnerRes = await fetch(`${baseUrl}/api/v1/lti/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'stud-202',
        role: 'Learner',
        course_id: 'CSE-501'
      })
    })

    assert.equal(learnerRes.status, 200)
    const learnerBody = await learnerRes.json()
    assert.equal(learnerBody.role, 'student')
    assert.ok(learnerBody.sessionToken)
    assert.ok(learnerBody.redirectUrl.includes('/student-dashboard'))
  })

  // ─── 3. AI Procurement & Vendor Negotiator Tests ──────────────────────────
  it('POST /api/v1/procurement/analyze-quote calculates markup and produces an email draft', async () => {
    const res = await fetch(`${baseUrl}/api/v1/procurement/analyze-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: 'Lab PCs',
        vendorName: 'Apex Computer Systems',
        quantity: 50,
        vendorQuote: 700000
      })
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.itemName, 'Lab PCs')
    assert.equal(body.quantity, 50)
    assert.equal(body.currentQuote, 700000)
    assert.ok(body.historicalRecord)
    assert.equal(body.historicalRecord.amount, 500000)
    assert.equal(body.analysis.percentageIncrease, 40)
    assert.ok(body.analysis.suggestedTargetPrice < 700000)
    assert.ok(typeof body.emailDraft === 'string')
    assert.ok(body.emailDraft.includes('Subject:'))
    assert.ok(body.emailDraft.includes('Apex Computer Systems'))
  })

  // ─── 4. High-Scalability Cache Service Tests ──────────────────────────────
  it('CacheService stores and retrieves keys with TTL and invalidates prefixes', async () => {
    await cacheService.set('test:key1', { metric: 123 }, 60)
    const cached = await cacheService.get('test:key1')
    assert.deepEqual(cached, { metric: 123 })

    await cacheService.invalidatePrefix('test:')
    const afterInvalidate = await cacheService.get('test:key1')
    assert.equal(afterInvalidate, null)
  })

  // ─── 5. Proctoring Controller Auto-Locking Tests ──────────────────────────
  it('POST /api/v1/exams/:id/violation locks the exam upon 3 infractions', async () => {
    const v1Res = await fetch(`${baseUrl}/api/v1/exams/10/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_roll: 'SS26', violation_type: 'TAB_SWITCH' })
    })
    assert.equal(v1Res.status, 201)
    const v1 = await v1Res.json()
    assert.equal(v1.violationsCount, 1)
    assert.equal(v1.locked, false)

    const v2Res = await fetch(`${baseUrl}/api/v1/exams/10/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_roll: 'SS26', violation_type: 'FACE_MISSING' })
    })
    assert.equal(v2Res.status, 201)
    const v2 = await v2Res.json()
    assert.equal(v2.violationsCount, 2)
    assert.equal(v2.locked, false)

    const v3Res = await fetch(`${baseUrl}/api/v1/exams/10/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_roll: 'SS26', violation_type: 'FACE_MISSING' })
    })
    assert.equal(v3Res.status, 201)
    const v3 = await v3Res.json()
    assert.equal(v3.violationsCount, 3)
    assert.equal(v3.locked, true)
    assert.equal(v3.autoSubmitted, true)
  })
})
