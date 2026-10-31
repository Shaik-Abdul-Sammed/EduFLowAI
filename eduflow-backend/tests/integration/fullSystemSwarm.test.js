import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration Swarm: Full System Route Swarm Audit', () => {
  let server
  let baseUrl
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
  let adminToken

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`

    adminToken = jwt.sign(
      {
        id: 1,
        role: 'admin',
        username: 'admin',
        institutionId: 1,
        email: 'admin@demo.edu',
      },
      secret,
      { expiresIn: '1h' }
    )
  })

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  // Predefined GET endpoints covering all system modules
  const getEndpoints = [
    // Health & System
    { path: '/api/health' },
    { path: '/api/health/render' },
    { path: '/api/health/db' },

    // Officers
    { path: '/api/v1/officers' },
    { path: '/api/v1/officers/' },
    { path: '/api/v1/officers/roi/summary' },

    // Calendar
    { path: '/api/v1/calendar/holidays/2026' },
    { path: '/api/v1/calendar/1/2026-2027' },
    { path: '/api/v1/calendar/1/2026-2027/events' },

    // Live Data
    { path: '/api/v1/live-data/status' },
    { path: '/api/v1/live-data/nirf' },
    { path: '/api/v1/live-data/naac' },
    { path: '/api/v1/live-data/holidays' },

    // Leads & Invoices
    { path: '/api/v1/leads' },
    { path: '/api/v1/invoices' },

    // Attendance
    { path: '/api/v1/attendance/stats' },
    { path: '/api/v1/attendance/at-risk' },

    // Portal
    { path: '/api/v1/portal/sources' },
    { path: '/api/v1/portal/sync-logs' },

    // SSO
    { path: '/api/v1/sso/1/providers' },
    { path: '/api/v1/sso/admin/logs' },

    // Compliance
    { path: '/api/v1/compliance/access-review' },
    { path: '/api/v1/compliance/change-log' },
    { path: '/api/v1/compliance/data-inventory' },
    { path: '/api/v1/compliance/dpia' },

    // Insights & Benchmarking
    { path: '/api/v1/insights/dashboard' },
    { path: '/api/v1/insights/activity' },
    { path: '/api/v1/naac/dashboard-insights' },
    { path: '/api/v1/naac/visit-history' },
    { path: '/api/v1/nirf/score' },
    { path: '/api/v1/nirf/predict-rank' },
    { path: '/api/v1/nirf/peers' },

    // Monitoring & Support
    { path: '/api/v1/monitoring/health' },
    { path: '/api/v1/support/tickets' },

    // Fee Reminders
    { path: '/api/v1/fee-reminders/pending' },
    { path: '/api/v1/fee-reminders/settings' },
    { path: '/api/v1/fee-reminders/history' },

    // Approvals & Staff
    { path: '/api/v1/approvals/pending' },
    { path: '/api/v1/approvals/history' },
    { path: '/api/v1/staff/my-permissions' },
    { path: '/api/v1/staff/activity' },

    // Academic Escalation
    { path: '/api/v1/escalations/pending' },
    { path: '/api/v1/escalations/summary' },

    // Admin Tools
    { path: '/api/v1/admin/dashboard-metrics' },
    { path: '/api/v1/admin/system-stats' },
    { path: '/api/v1/admin/audit-logs' },
    { path: '/api/v1/admin/reset-demo-data?secret=eduflow2026' },
  ]

  // Predefined POST endpoints covering key operations
  const postEndpoints = [
    // Officers
    {
      path: '/api/v1/officers/accreditation/generate',
      payload: { reportType: 'NAAC SSR Criterion 2', prompt: 'Generate NAAC SSR Criterion 2 analysis' },
    },
    {
      path: '/api/v1/officers/student-success/predict-risk',
      payload: { prompt: 'Predict student dropout risk' },
    },
    {
      path: '/api/v1/officers/timetable/generate',
      payload: { prompt: 'Generate conflict-free timetable for CSE' },
    },
    {
      path: '/api/v1/officers/admissions/predict-yield',
      payload: { prompt: 'Predict admissions yield for 2026' },
    },
    {
      path: '/api/v1/officers/finance/reconcile',
      payload: { prompt: 'Reconcile semester fee collection' },
    },

    // Academic Calendar
    {
      path: '/api/v1/calendar/generate',
      payload: { academicYear: '2026-2027', stateCode: 'KA' },
    },

    // Live Data Refresh
    {
      path: '/api/v1/live-data/refresh',
      payload: {},
    },

    // Institutional Leads
    {
      path: '/api/v1/leads',
      payload: {
        collegeName: 'Swarm Test College',
        contactName: 'Dean QA Swarm',
        email: `swarm-${Date.now()}@demo.edu`,
        phone: '+919876543210',
        cityState: 'Bengaluru, KA',
      },
    },

    // Invoices
    {
      path: '/api/v1/invoices',
      payload: {
        automationType: 'accreditation',
        institutionName: 'Swarm Engineering College',
        contactPerson: 'Dean QA',
        contactEmail: 'qa@demo.edu',
        amount: 50000,
      },
    },

    // Attendance Sample Ingestion
    {
      path: '/api/v1/attendance/ingest/sample',
      payload: { count: 5 },
    },

    // Portal Connection Test
    {
      path: '/api/v1/portal/test-connection',
      payload: { sourceType: 'postgres', config: { host: 'localhost', database: 'eduflow' } },
    },

    // SSO Configuration
    {
      path: '/api/v1/sso/admin/config',
      payload: {
        providerName: 'Swarm SAML',
        providerType: 'saml',
        entityId: 'https://demo.edu/saml',
        entryPoint: 'https://demo.edu/login',
      },
    },

    // Compliance Purge
    {
      path: '/api/v1/compliance/purge',
      payload: { days: 30 },
    },

    // Insights AI Explanation
    {
      path: '/api/v1/insights/accreditation/explain',
      payload: { text: 'Criterion 2.2 Student Teacher ratio of 18:1' },
    },

    // Monitoring Client Error Capture
    {
      path: '/api/v1/monitoring/client-error',
      payload: { error: 'Swarm automated test client error', url: '/swarm' },
    },

    // Support Ticket Generation
    {
      path: '/api/v1/support/tickets',
      payload: {
        subject: 'Swarm QA Ticket',
        description: 'Automated swarm test ticket verification',
        category: 'general',
        priority: 'low',
      },
    },

    // Reset Demo Data
    {
      path: '/api/v1/admin/reset-demo-data',
      payload: { secret: 'eduflow2026' },
    },
  ]

  describe('GET Endpoints Swarm', () => {
    for (const ep of getEndpoints) {
      it(`GET ${ep.path} -> returns 200 OK without 401/404/500`, async () => {
        const url = `${baseUrl}${ep.path}`
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            Accept: 'application/json',
          },
        })

        const status = res.status
        const text = await res.text()

        assert.notEqual(
          status,
          401,
          `GET ${ep.path} failed with 401 Unauthorized! Response: ${text}`
        )
        assert.notEqual(
          status,
          404,
          `GET ${ep.path} failed with 404 Not Found! Response: ${text}`
        )
        assert.notEqual(
          status,
          500,
          `GET ${ep.path} failed with 500 Internal Server Error! Response: ${text}`
        )
        assert.ok(
          status >= 200 && status < 300,
          `GET ${ep.path} returned unexpected status ${status}. Response: ${text}`
        )
      })
    }
  })

  describe('POST Endpoints Swarm', () => {
    for (const ep of postEndpoints) {
      it(`POST ${ep.path} -> returns 200/201 without 401/404/500`, async () => {
        const url = `${baseUrl}${ep.path}`
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(ep.payload),
        })

        const status = res.status
        const text = await res.text()

        assert.notEqual(
          status,
          401,
          `POST ${ep.path} failed with 401 Unauthorized! Response: ${text}`
        )
        assert.notEqual(
          status,
          404,
          `POST ${ep.path} failed with 404 Not Found! Response: ${text}`
        )
        assert.notEqual(
          status,
          500,
          `POST ${ep.path} failed with 500 Internal Server Error! Response: ${text}`
        )
        assert.ok(
          status === 200 || status === 201,
          `POST ${ep.path} returned unexpected status ${status}. Response: ${text}`
        )
      })
    }
  })
})
