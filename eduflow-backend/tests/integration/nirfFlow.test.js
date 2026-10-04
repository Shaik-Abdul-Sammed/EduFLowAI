import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'
import { seedNirfData } from '../../scripts/seed-nirf-data.js'

describe('Integration: NIRF & Benchmarking Flow', () => {
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

  it('Seed script runs without errors and populates 50 peer institutions', async () => {
    const seeded = await seedNirfData()
    assert.ok(Array.isArray(seeded), 'Seed function should return an array')
    assert.equal(seeded.length, 50, 'Must seed exactly 50 peer institutions')
  })

  it('GET /api/v1/nirf/score returns valid scores and parameters', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/nirf/score?category=Engineering`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.category, 'Engineering')
    assert.ok(typeof body.totalScore === 'number' && body.totalScore > 0)
    assert.ok(body.parameterScores.TLR)
    assert.ok(body.parameterScores.RP)
    assert.ok(body.parameterScores.GO)
    assert.ok(body.parameterScores.OI)
    assert.ok(body.parameterScores.PR)
    assert.ok(typeof body.predictedRank === 'number')
  })

  it('POST /api/v1/nirf/benchmark returns peer comparison and gap analysis', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/nirf/benchmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category: 'Engineering', topN: 10 }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.ok(Array.isArray(body.topPeers))
    assert.equal(body.topPeers.length, 10)
    assert.ok(body.gapAnalysis)
    assert.ok(typeof body.institutionRank === 'number')
  })

  it('POST /api/v1/nirf/improve returns a structured roadmap with milestones', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/nirf/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetRank: 50, category: 'Engineering' }),
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.targetRank, 50)
    assert.ok(Array.isArray(body.priorityParameters))
    assert.ok(Array.isArray(body.quickWins) && body.quickWins.length > 0)
    assert.ok(Array.isArray(body.mediumTerm) && body.mediumTerm.length > 0)
    assert.ok(Array.isArray(body.longTerm) && body.longTerm.length > 0)
  })

  it('GET /api/v1/nirf/compare-naac returns alignment and discrepancy analysis', async () => {
    const token = makeToken('admin')
    const res = await fetch(`${baseUrl}/api/v1/nirf/compare-naac`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.equal(body.naacGrade, 'A+')
    assert.ok(typeof body.nirfRank === 'number')
    assert.ok(body.expectedNirfForGrade)
    assert.ok(body.explanation)
    assert.ok(Array.isArray(body.keyDifferences))
  })

  it('All NIRF endpoints require admin auth (401 unauthenticated, 403 non-admin)', async () => {
    // 1. Unauthenticated request -> 401
    const unauthRes = await fetch(`${baseUrl}/api/v1/nirf/score`)
    assert.equal(unauthRes.status, 401)

    // 2. Non-admin request (student) -> 403
    const studentToken = makeToken('student')
    const forbidRes = await fetch(`${baseUrl}/api/v1/nirf/score`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.equal(forbidRes.status, 403)
  })
})
