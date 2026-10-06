import { pool } from '../db/pool.js'

const memoryTickets = []
let ticketCounter = 100

export class SupportController {
  static async createTicket(req, res) {
    try {
      const {
        subject,
        description,
        category = 'general',
        priority = 'medium'
      } = req.body || {}

      if (!subject || !description) {
        return res.status(400).json({ error: 'Subject and description are required' })
      }

      const userId = req.user?.id || req.body.userId || 1
      const institutionId = req.user?.institutionId || req.body.institutionId || 1

      const ticket = {
        id: ++ticketCounter,
        institution_id: institutionId,
        user_id: userId,
        subject,
        description,
        category,
        priority,
        status: 'open',
        response: null,
        created_at: new Date().toISOString()
      }

      try {
        const result = await pool.query(
          `INSERT INTO support_tickets (institution_id, user_id, subject, description, category, priority, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'open')
           RETURNING *`,
          [institutionId, userId, subject, description, category, priority]
        )
        if (result.rows.length > 0) {
          return res.status(201).json({ success: true, ticket: result.rows[0] })
        }
      } catch (err) {
        // memory fallback
      }

      memoryTickets.unshift(ticket)
      return res.status(201).json({ success: true, ticket })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async getTickets(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || null

      try {
        let query = 'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 50'
        let params = []
        if (institutionId) {
          query = 'SELECT * FROM support_tickets WHERE institution_id = $1 ORDER BY created_at DESC LIMIT 50'
          params = [institutionId]
        }
        const result = await pool.query(query, params)
        if (result.rows.length > 0) {
          return res.status(200).json({ success: true, tickets: result.rows })
        }
      } catch (err) {
        // memory fallback
      }

      const filtered = institutionId 
        ? memoryTickets.filter(t => Number(t.institution_id) === Number(institutionId))
        : memoryTickets

      return res.status(200).json({ success: true, tickets: filtered })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async updateTicket(req, res) {
    try {
      const { id } = req.params
      const { status, response } = req.body || {}

      if (!status && !response) {
        return res.status(400).json({ error: 'Status or response is required for update' })
      }

      try {
        const result = await pool.query(
          `UPDATE support_tickets 
           SET status = COALESCE($1, status),
               response = COALESCE($2, response),
               resolved_at = CASE WHEN $1 IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
               updated_at = NOW()
           WHERE id = $3
           RETURNING *`,
          [status || null, response || null, id]
        )
        if (result.rows.length > 0) {
          return res.status(200).json({ success: true, ticket: result.rows[0] })
        }
      } catch (err) {
        // memory fallback
      }

      const ticket = memoryTickets.find(t => String(t.id) === String(id))
      if (ticket) {
        if (status) ticket.status = status
        if (response) ticket.response = response
        if (['resolved', 'closed'].includes(status)) ticket.resolved_at = new Date().toISOString()
        return res.status(200).json({ success: true, ticket })
      }

      return res.status(404).json({ error: 'Support ticket not found' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
