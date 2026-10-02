import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createApp } from '../../src/app.js'

describe('Integration: Full End-to-End Business Journey', () => {
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

  it('executes full business lifecycle from registration to paid invoice', async () => {
    const timestamp = Date.now()
    const uniqueSubdomain = `inst-${timestamp}`
    const collegeName = `St. Xavier Institute ${timestamp}`
    const adminEmail = `admin-${timestamp}@stxavier.edu`
    const password = 'Password@2026'

    // Step 1: Register a new institution
    const regRes = await fetch(`${baseUrl}/api/v1/institutions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: collegeName,
        subdomain: uniqueSubdomain,
        email: adminEmail,
        password,
      }),
    })
    assert.ok(regRes.status === 200 || regRes.status === 201, `Registration failed with status ${regRes.status}`)
    const regBody = await regRes.json()
    // Step 2: Admin logs in with JWT
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password,
      }),
    })
    assert.equal(loginRes.status, 200, 'Login should succeed')
    const loginBody = await loginRes.json()
    const adminToken = loginBody.accessToken
    assert.ok(adminToken, 'Expected JWT accessToken')

    // Step 3: Submit a lead via public endpoint
    const leadRes = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeName,
        contactName: 'Fr. Thomas Principal',
        email: 'principal@stxavier.edu',
        phone: '9876543210',
        cityState: 'Mumbai, Maharashtra',
        automationType: 'accreditation',
      }),
    })
    assert.equal(leadRes.status, 201, 'Lead submission should return 201')
    const leadBody = await leadRes.json()
    const leadId = leadBody.leadId
    assert.ok(leadId, 'Expected leadId')

    // Step 4: Generate a NAAC report via accreditation streaming
    const streamRes = await fetch(`${baseUrl}/api/v1/officers/accreditation/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        reportType: `NAAC Executive Summary for ${collegeName}`,
      }),
    })
    assert.equal(streamRes.status, 200, 'Accreditation stream should return 200')
    const reader = streamRes.body.getReader()
    const decoder = new TextDecoder()
    let streamOutput = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      streamOutput += decoder.decode(value, { stream: true })
      if (streamOutput.includes('"type":"done"')) break
    }
    assert.ok(streamOutput.includes('data: '), 'Expected SSE stream data chunks')

    // Step 5: Deliver the report via secure token
    const deliverRes = await fetch(`${baseUrl}/api/v1/reports/deliver`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        leadId,
        collegeName,
        contactEmail: 'principal@stxavier.edu',
        title: 'NAAC Executive Audit Package',
        reportContent: 'Criterion 1: 3.8 / 4.0\nCriterion 2: 3.6 / 4.0\nAutonomous status recommended.',
      }),
    })
    assert.ok(deliverRes.status === 200 || deliverRes.status === 201)
    const deliverBody = await deliverRes.json()
    const reportToken = deliverBody.report.token
    assert.ok(reportToken, 'Expected delivery token')

    // Step 6: Access the report via public URL
    const publicReportRes = await fetch(`${baseUrl}/r/${reportToken}`)
    assert.equal(publicReportRes.status, 200)
    const publicHtml = await publicReportRes.text()
    assert.ok(publicHtml.includes(collegeName), 'Public HTML should include college name')

    // Step 7: Create an invoice with auto-derived pricing
    const invoiceRes = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        leadId,
        automationType: 'accreditation',
      }),
    })
    assert.equal(invoiceRes.status, 201)
    const invoiceBody = await invoiceRes.json()
    const invoiceId = invoiceBody.invoice.id
    assert.equal(invoiceBody.invoice.subtotal, 50000)
    assert.equal(invoiceBody.invoice.total_amount, 59000) // 50000 + 18% GST

    // Step 8: Mark the invoice paid
    const paidRes = await fetch(`${baseUrl}/api/v1/invoices/${invoiceId}/mark-paid`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    assert.equal(paidRes.status, 200)
    const paidBody = await paidRes.json()
    assert.equal(paidBody.invoice.status, 'PAID')
    assert.ok(paidBody.invoice.paid_at)

    // Step 9: Verify persistence
    const checkLeadRes = await fetch(`${baseUrl}/api/v1/leads/${leadId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    assert.equal(checkLeadRes.status, 200)
    const checkInvoiceRes = await fetch(`${baseUrl}/api/v1/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    assert.equal(checkInvoiceRes.status, 200)
  })
})
