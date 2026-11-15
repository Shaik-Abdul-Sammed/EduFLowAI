import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

describe('Integration Flow: Academic Calendar Lifecycle & Role Scoping', () => {
  let server
  let baseUrl
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'

  before(async () => {
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

  it('rejects event creation when title or start date is missing (400)', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })

    const res = await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ description: 'Invalid event without title' })
    })

    assert.strictEqual(res.status, 400)
  })

  it('creates an academic event, retrieves it, and deletes it cleanly', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })

    // Create
    const createRes = await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Inter-Collegiate Hackathon 2026',
        startDate: '2026-10-15',
        endDate: '2026-10-17',
        eventType: 'FEST',
        description: 'Annual National AI Hackathon'
      })
    })

    assert.strictEqual(createRes.status, 201)
    const createData = await createRes.json()
    assert.ok(createData.event.id)
    const eventId = createData.event.id

    // Delete
    const deleteRes = await fetch(`${baseUrl}/api/v1/calendar/event/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    assert.strictEqual(deleteRes.status, 200)
  })

  it('non-admin (student and faculty) cannot create or delete academic calendar events (403 Forbidden)', async () => {
    const studentToken = makeToken({ id: 80, role: 'student', email: 'student@demo.edu' })
    const facultyToken = makeToken({ id: 15, role: 'faculty', email: 'faculty@demo.edu' })

    // Student tries to create event
    const studentCreate = await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Student Fest',
        startDate: '2026-11-20'
      })
    })
    assert.strictEqual(studentCreate.status, 403, 'Student cannot create academic calendar event')

    // Faculty tries to create event
    const facultyCreate = await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        title: 'Faculty Unauthorized Event',
        startDate: '2026-11-20'
      })
    })
    assert.strictEqual(facultyCreate.status, 403, 'Faculty cannot create academic calendar event')

    // Student tries to delete event
    const studentDelete = await fetch(`${baseUrl}/api/v1/calendar/event/evt_123`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert.strictEqual(studentDelete.status, 403, 'Student cannot delete academic calendar event')

    // Faculty tries to delete event
    const facultyDelete = await fetch(`${baseUrl}/api/v1/calendar/event/evt_123`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${facultyToken}` }
    })
    assert.strictEqual(facultyDelete.status, 403, 'Faculty cannot delete academic calendar event')
  })

  it('student/faculty only receives events targeted to their role or ALL audience', async () => {
    const adminToken = makeToken({ id: 1, role: 'admin', email: 'admin@demo.edu' })
    const studentToken = makeToken({ id: 80, role: 'student', email: 'student@demo.edu' })
    const facultyToken = makeToken({ id: 15, role: 'faculty', email: 'faculty@demo.edu' })

    // Admin creates faculty-only event
    await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Faculty Senate Meeting',
        startDate: '2026-11-25',
        audience: 'FACULTY'
      })
    })

    // Admin creates student-only event
    await fetch(`${baseUrl}/api/v1/calendar/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Freshers Orientation & Hostel Allotment',
        startDate: '2026-11-26',
        audience: 'STUDENT'
      })
    })

    // Fetch events as Student
    const studentRes = await fetch(`${baseUrl}/api/v1/calendar/1/2026-2027/events`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })
    assert.strictEqual(studentRes.status, 200)
    const studentData = await studentRes.json()
    const studentEvents = studentData.events || []

    const hasStudentEvent = studentEvents.some(e => e.title === 'Freshers Orientation & Hostel Allotment')
    const hasFacultyEventForStudent = studentEvents.some(e => e.title === 'Faculty Senate Meeting')
    assert.ok(hasStudentEvent, 'Student must receive events targeted to STUDENT')
    assert.strictEqual(hasFacultyEventForStudent, false, 'Student must NOT receive events targeted to FACULTY')

    // Fetch events as Faculty
    const facultyRes = await fetch(`${baseUrl}/api/v1/calendar/1/2026-2027/events`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    })
    assert.strictEqual(facultyRes.status, 200)
    const facultyData = await facultyRes.json()
    const facultyEvents = facultyData.events || []

    const hasFacultyEvent = facultyEvents.some(e => e.title === 'Faculty Senate Meeting')
    const hasStudentEventForFaculty = facultyEvents.some(e => e.title === 'Freshers Orientation & Hostel Allotment')
    assert.ok(hasFacultyEvent, 'Faculty must receive events targeted to FACULTY')
    assert.strictEqual(hasStudentEventForFaculty, false, 'Faculty must NOT receive events targeted to STUDENT')
  })
})
