import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { SupportController } from '../../src/controllers/SupportController.js'

describe('Support System Unit Tests', () => {
  let createdTicketId = null

  test('creates a new support ticket with subject and description', async () => {
    let resJson = null
    let resStatus = null
    const req = {
      body: {
        subject: 'Odd semester timetable conflict in Room 204',
        description: 'Two faculty members assigned to Room 204 at 10 AM on Monday.',
        category: 'timetable',
        priority: 'high',
        userId: 5,
        institutionId: 1
      }
    }
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => { resJson = data }
        }
      }
    }

    await SupportController.createTicket(req, res)
    assert.equal(resStatus, 201)
    assert.equal(resJson.success, true)
    assert.ok(resJson.ticket.id)
    assert.equal(resJson.ticket.status, 'open')
    createdTicketId = resJson.ticket.id
  })

  test('rejects ticket creation if subject or description missing', async () => {
    let resStatus = null
    const req = { body: { subject: 'Missing description' } }
    const res = {
      status: (code) => {
        resStatus = code
        return { json: () => {} }
      }
    }
    await SupportController.createTicket(req, res)
    assert.equal(resStatus, 400)
  })

  test('lists existing support tickets for admin review', async () => {
    let resJson = null
    const req = { query: { institutionId: 1 } }
    const res = {
      status: () => ({
        json: (data) => { resJson = data }
      })
    }
    await SupportController.getTickets(req, res)
    assert.equal(resJson.success, true)
    assert.ok(Array.isArray(resJson.tickets))
    assert.ok(resJson.tickets.length > 0)
  })

  test('updates ticket status and records resolution response', async () => {
    let resJson = null
    const req = {
      params: { id: createdTicketId },
      body: {
        status: 'resolved',
        response: 'Room 204 slot re-assigned to Prof. Iyer; conflict resolved.'
      }
    }
    const res = {
      status: () => ({
        json: (data) => { resJson = data }
      })
    }
    await SupportController.updateTicket(req, res)
    assert.equal(resJson.success, true)
    assert.equal(resJson.ticket.status, 'resolved')
    assert.ok(resJson.ticket.response.includes('Prof. Iyer'))
  })
})
