import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Unit: Leads CRUD & Validation', () => {
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

  it('Create lead with valid data returns 201', async () => {
    const payload = {
      collegeName: 'National Engineering College',
      contactName: 'Dr. S. Sharma',
      email: 'principal@nec.edu.in',
      phone: '9876543210',
      cityState: 'Bangalore, Karnataka',
      automationType: 'accreditation',
    }

    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    assert.equal(res.status, 201)
    const body = await res.json()
    assert.equal(body.success, true)
    assert.ok(body.leadId, 'Expected leadId in 201 response')
  })

  it('Create lead with honeypot filled returns 400', async () => {
    const payload = {
      collegeName: 'Bot College',
      contactName: 'Spam Bot',
      email: 'bot@spam.com',
      phone: '9876543210',
      cityState: 'New Delhi',
      website: 'http://spam-link.xyz', // honeypot field filled
    }

    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    assert.equal(res.status, 400)
  })

  it('Create lead with invalid email returns 400', async () => {
    const payload = {
      collegeName: 'Test College',
      contactName: 'Prof. Test',
      email: 'not-an-email',
      phone: '9876543210',
      cityState: 'Mumbai',
    }

    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('Create lead with invalid phone returns 400', async () => {
    const payload = {
      collegeName: 'Test College',
      contactName: 'Prof. Test',
      email: 'valid@college.edu',
      phone: '123', // less than 10 digits
      cityState: 'Pune',
    }

    const res = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    assert.equal(res.status, 400)
    const body = await res.json()
    assert.equal(body.error, 'Validation failed')
  })

  it('Filter leads by automationType returns only matching', async () => {
    // Insert leads with distinct types
    await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeName: 'Timetable Tech',
        contactName: 'Dean T',
        email: 'dean@tt.edu',
        phone: '9876543211',
        cityState: 'Hyderabad',
        automationType: 'timetable',
      }),
    })

    const res = await fetch(`${baseUrl}/api/v1/leads?automationType=timetable`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.leads.length > 0)
    for (const lead of body.leads) {
      assert.equal(lead.automation_type, 'timetable')
    }
  })

  it('Filter leads by status returns only matching', async () => {
    const res = await fetch(`${baseUrl}/api/v1/leads?status=NEW`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    assert.equal(res.status, 200)
    const body = await res.json()
    for (const lead of body.leads) {
      assert.equal(lead.status, 'NEW')
    }
  })

  it('Update lead status to VALID status returns 200', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeName: 'Status Update College',
        contactName: 'Dr. Update',
        email: 'dr@update.edu',
        phone: '9876543212',
        cityState: 'Chennai',
      }),
    })
    const { leadId } = await createRes.json()

    const updateRes = await fetch(`${baseUrl}/api/v1/leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'CONTACTED', notes: 'Spoke with principal' }),
    })

    assert.equal(updateRes.status, 200)
    const updated = await updateRes.json()
    assert.equal(updated.lead.status, 'CONTACTED')
  })

  it('Update lead status to INVALID status returns 400', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeName: 'Invalid Status College',
        contactName: 'Dr. X',
        email: 'drx@update.edu',
        phone: '9876543213',
        cityState: 'Delhi',
      }),
    })
    const { leadId } = await createRes.json()

    const updateRes = await fetch(`${baseUrl}/api/v1/leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'NOT_A_REAL_STATUS' }),
    })

    assert.equal(updateRes.status, 400)
  })

  it('Delete lead soft-deletes and hides from list', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collegeName: 'Delete Me College',
        contactName: 'Dr. Delete',
        email: 'delete@me.edu',
        phone: '9876543214',
        cityState: 'Kolkata',
      }),
    })
    const { leadId } = await createRes.json()

    // Delete lead
    const deleteRes = await fetch(`${baseUrl}/api/v1/leads/${leadId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    assert.equal(deleteRes.status, 200)

    // Verify it is not in the list
    const listRes = await fetch(`${baseUrl}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const listBody = await listRes.json()
    const found = listBody.leads.find((l) => Number(l.id) === Number(leadId))
    assert.equal(found, undefined, 'Soft-deleted lead should not appear in active leads list')
  })
})
