import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration: NAAC AI Insights & Visit Predictor Flow', () => {
  let server
  let baseUrl
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

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

  function makeToken(role = 'admin') {
    return jwt.sign(
      { id: 1, role, institutionId: 1, email: `${role}@demo.edu` },
      secret,
      { expiresIn: '15m' }
    )
  }

  it('POST /api/v1/naac/explain returns 200 with valid JSON', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/naac/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reportText: 'Criterion 1: Curricular revision is conducted every 3 years with BoS approvals and active student feedback.',
        criterionNumber: 1,
      }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(body.explanation)
    assert.ok(Array.isArray(body.explanation.summary))
    assert.ok(Array.isArray(body.explanation.glossary))
    assert.ok(Array.isArray(body.explanation.keyMetrics))
  })

  it('POST /api/v1/naac/ask returns an answer', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/naac/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reportText: 'Faculty research output currently records 270 Scopus indexed research papers across 85 full-time faculty members.',
        question: 'How many Scopus papers does the faculty have?',
      }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(typeof body.answer === 'string')
    assert.ok(body.answer.length > 0)
  })

  it('POST /api/v1/naac/predict-visit saves to database', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/naac/predict-visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ institutionId: 1 }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(body.prediction)
    assert.ok(typeof body.prediction.predictedGrade === 'string')
    assert.ok(typeof body.prediction.readinessScore === 'number')

    // Verify it is queryable in visit history
    const histRes = await fetch(`${baseUrl}/api/v1/naac/visit-history?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(histRes.status, 200)
    const histBody = await histRes.json()
    assert.ok(Array.isArray(histBody.history))
    assert.ok(histBody.history.length > 0)
  })

  it('POST /api/v1/naac/improvement-plan returns a full plan', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/naac/improvement-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        institutionId: 1,
        targetGrade: 'A++',
      }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(body.plan)
    assert.ok(Array.isArray(body.plan.quickWins))
    assert.ok(Array.isArray(body.plan.mediumTerm))
    assert.ok(Array.isArray(body.plan.longTerm))
    assert.ok(typeof body.plan.gap === 'number')

    // Verify queryable in improvement history
    const planHistRes = await fetch(`${baseUrl}/api/v1/naac/improvement-history?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(planHistRes.status, 200)
    const planHistBody = await planHistRes.json()
    assert.ok(Array.isArray(planHistBody.history))
    assert.ok(planHistBody.history.length > 0)
  })

  it('GET /api/v1/naac/dashboard-insights returns a snapshot', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/naac/dashboard-insights`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.success)
    assert.ok(typeof body.currentPredictedGrade === 'string')
    assert.ok(typeof body.visitReadinessScore === 'number')
    assert.ok(Array.isArray(body.topImprovementActions))
    assert.ok(Array.isArray(body.topEvidenceGaps))
    assert.ok(typeof body.lastUpdateTimestamp === 'string')
  })

  it('All endpoints require admin auth (401 without token)', async () => {
    const endpoints = [
      { method: 'POST', path: '/api/v1/naac/explain', body: { reportText: 'test', criterionNumber: 1 } },
      { method: 'POST', path: '/api/v1/naac/ask', body: { reportText: 'test', question: 'test' } },
      { method: 'POST', path: '/api/v1/naac/compare-ideal', body: { reportText: 'test', criterionNumber: 1 } },
      { method: 'POST', path: '/api/v1/naac/predict-visit', body: { institutionId: 1 } },
      { method: 'GET', path: '/api/v1/naac/visit-history' },
      { method: 'POST', path: '/api/v1/naac/improvement-plan', body: { institutionId: 1, targetGrade: 'A++' } },
      { method: 'GET', path: '/api/v1/naac/improvement-history' },
      { method: 'GET', path: '/api/v1/naac/dashboard-insights' },
    ]

    for (const ep of endpoints) {
      const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } }
      if (ep.body) opts.body = JSON.stringify(ep.body)
      const res = await fetch(`${baseUrl}${ep.path}`, opts)
      assert.equal(res.status, 401, `${ep.method} ${ep.path} should reject unauthenticated request with 401`)
    }
  })
})
