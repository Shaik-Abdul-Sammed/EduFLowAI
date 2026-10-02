import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Unit: Invoices CRUD & Calculations', () => {
  let server
  let baseUrl
  let adminToken
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

  before(async () => {
    const app = createApp()
    server = http.createServer(app)
    await new Promise((resolve) => server.listen(0, resolve))
    const port = server.address().port
    baseUrl = `http://127.0.0.1:${port}`
    adminToken = jwt.sign({ id: 1, role: 'admin', institutionId: 1, username: 'admin' }, secret, { expiresIn: '1h' })
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('Create invoice with minimal payload returns 201 with auto-derived description', async () => {
    const res = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Apex Institute of Technology',
        contactEmail: 'accounts@apex.edu',
      }),
    })

    assert.equal(res.status, 201)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.ok(body.invoice.description.length > 0)
    assert.equal(body.invoice.status, 'UNPAID')
  })

  it('Create invoice with automationType=timetable derives price 20000', async () => {
    const res = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Timetable College',
        contactEmail: 'billing@tt.edu',
        automationType: 'timetable',
      }),
    })

    assert.equal(res.status, 201)
    const body = await res.json()
    assert.equal(body.invoice.subtotal, 20000)
    assert.ok(body.invoice.description.includes('Timetable'))
  })

  it('Create invoice with automationType=accreditation derives price 50000', async () => {
    const res = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Accreditation College',
        contactEmail: 'iqac@college.edu',
        automationType: 'accreditation',
      }),
    })

    assert.equal(res.status, 201)
    const body = await res.json()
    assert.equal(body.invoice.subtotal, 50000)
    assert.ok(body.invoice.description.includes('Accreditation'))
  })

  it('Create invoice with negative amount returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Negative Amount College',
        contactEmail: 'billing@neg.edu',
        amount: -5000,
      }),
    })

    assert.equal(res.status, 400)
  })

  it('Mark invoice as paid updates status and paid_at', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Paid Test College',
        contactEmail: 'paid@test.edu',
        amount: 25000,
      }),
    })
    const { invoice } = await createRes.json()

    const markRes = await fetch(`${baseUrl}/api/v1/invoices/${invoice.id}/mark-paid`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    assert.equal(markRes.status, 200)
    const markBody = await markRes.json()
    assert.equal(markBody.invoice.status, 'PAID')
    assert.ok(markBody.invoice.paid_at, 'Expected paid_at timestamp')
  })

  it('Invoice numbers auto-increment without gaps', async () => {
    const res1 = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Increment College 1',
        contactEmail: 'inc1@test.edu',
      }),
    })
    const body1 = await res1.json()

    const res2 = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'Increment College 2',
        contactEmail: 'inc2@test.edu',
      }),
    })
    const body2 = await res2.json()

    const num1 = body1.invoice.invoice_number
    const num2 = body2.invoice.invoice_number

    const seq1 = parseInt(num1.split('-')[2], 10)
    const seq2 = parseInt(num2.split('-')[2], 10)

    assert.equal(seq2, seq1 + 1, `Expected sequence ${seq1 + 1}, got ${seq2}`)
  })

  it('Total amount includes 18 percent GST', async () => {
    const res = await fetch(`${baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionName: 'GST Test College',
        contactEmail: 'gst@test.edu',
        amount: 10000,
      }),
    })

    const body = await res.json()
    assert.equal(body.invoice.subtotal, 10000)
    assert.equal(body.invoice.tax_percent, 18.0)
    assert.equal(body.invoice.tax_amount, 1800)
    assert.equal(body.invoice.total_amount, 11800)
  })
})
