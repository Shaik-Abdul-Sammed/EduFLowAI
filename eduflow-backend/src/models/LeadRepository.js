import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

// In-memory fallback storage for when PostgreSQL is unavailable
const memoryLeads = []
let memoryIdCounter = 1

export class LeadRepository {
  static async create(data) {
    const {
      collegeName,
      contactName,
      designation = 'Principal',
      email,
      phone,
      cityState,
      studentCount,
      naacCycle = 'Cycle 1',
      message = '',
      source = 'website',
      automationType = 'accreditation',
    } = data

    try {
      const query = `
        INSERT INTO leads (
          college_name, contact_name, designation, email, phone,
          city_state, student_count, naac_cycle, message, status, source, notes, automation_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'NEW', $10, '', $11)
        RETURNING *
      `
      const params = [
        collegeName,
        contactName,
        designation,
        email,
        phone,
        cityState,
        studentCount || null,
        naacCycle,
        message,
        source,
        automationType,
      ]

      const result = await pool.query(query, params)
      return result.rows[0]
    } catch (err) {
      logger.warn(`LeadRepository.create using memory store: ${err.message}`)
      const newLead = {
        id: memoryIdCounter++,
        college_name: collegeName,
        contact_name: contactName,
        designation,
        email,
        phone,
        city_state: cityState,
        student_count: studentCount || null,
        naac_cycle: naacCycle,
        message,
        status: 'NEW',
        source,
        notes: '',
        automation_type: automationType,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      memoryLeads.unshift(newLead)
      return newLead
    }
  }

  static async findAll({ page = 1, limit = 50, status, automationType } = {}) {
    const offset = (Math.max(1, page) - 1) * limit

    try {
      let query = `
        SELECT * FROM leads 
        WHERE is_deleted = false
      `
      const params = []

      if (status && status !== 'ALL') {
        params.push(status)
        query += ` AND status = $${params.length}`
      }

      if (automationType && automationType !== 'ALL') {
        params.push(automationType)
        query += ` AND automation_type = $${params.length}`
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)

      const result = await pool.query(query, params)

      // Count query
      let countQuery = 'SELECT count(*) FROM leads WHERE is_deleted = false'
      const countParams = []
      if (status && status !== 'ALL') {
        countParams.push(status)
        countQuery += ` AND status = $${countParams.length}`
      }
      if (automationType && automationType !== 'ALL') {
        countParams.push(automationType)
        countQuery += ` AND automation_type = $${countParams.length}`
      }
      const countRes = await pool.query(countQuery, countParams)
      const total = parseInt(countRes.rows[0]?.count || '0', 10)

      return {
        leads: result.rows,
        total,
        page,
        limit,
      }
    } catch (err) {
      logger.warn(`LeadRepository.findAll using memory store: ${err.message}`)
      let filtered = memoryLeads.filter((l) => !l.is_deleted)
      if (status && status !== 'ALL') {
        filtered = filtered.filter((l) => l.status === status)
      }
      if (automationType && automationType !== 'ALL') {
        filtered = filtered.filter((l) => l.automation_type === automationType)
      }
      const total = filtered.length
      const paged = filtered.slice(offset, offset + limit)
      return {
        leads: paged,
        total,
        page,
        limit,
      }
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM leads WHERE id = $1 AND is_deleted = false',
        [id],
      )
      if (result.rows[0]) return result.rows[0]
      return memoryLeads.find((l) => String(l.id) === String(id) && !l.is_deleted) || null
    } catch (err) {
      logger.warn(`LeadRepository.findById using memory store: ${err.message}`)
      return memoryLeads.find((l) => String(l.id) === String(id) && !l.is_deleted) || null
    }
  }

  static async update(id, { status, notes }) {
    try {
      const updates = []
      const params = []

      if (status !== undefined) {
        params.push(status)
        updates.push(`status = $${params.length}`)
      }
      if (notes !== undefined) {
        params.push(notes)
        updates.push(`notes = $${params.length}`)
      }

      params.push(id)
      const query = `
        UPDATE leads 
        SET ${updates.join(', ')}, updated_at = NOW() 
        WHERE id = $${params.length} AND is_deleted = false
        RETURNING *
      `
      const result = await pool.query(query, params)
      if (result.rows[0]) return result.rows[0]
      const lead = memoryLeads.find((l) => String(l.id) === String(id) && !l.is_deleted)
      if (!lead) return null
      if (status !== undefined) lead.status = status
      if (notes !== undefined) lead.notes = notes
      lead.updated_at = new Date().toISOString()
      return lead
    } catch (err) {
      logger.warn(`LeadRepository.update using memory store: ${err.message}`)
      const lead = memoryLeads.find((l) => String(l.id) === String(id) && !l.is_deleted)
      if (!lead) return null
      if (status !== undefined) lead.status = status
      if (notes !== undefined) lead.notes = notes
      lead.updated_at = new Date().toISOString()
      return lead
    }
  }

  static async softDelete(id) {
    try {
      const result = await pool.query(
        'UPDATE leads SET is_deleted = true, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id],
      )
      if (result.rows[0]) return result.rows[0]
      const lead = memoryLeads.find((l) => String(l.id) === String(id))
      if (!lead) return null
      lead.is_deleted = true
      lead.updated_at = new Date().toISOString()
      return lead
    } catch (err) {
      logger.warn(`LeadRepository.softDelete using memory store: ${err.message}`)
      const lead = memoryLeads.find((l) => String(l.id) === String(id))
      if (!lead) return null
      lead.is_deleted = true
      lead.updated_at = new Date().toISOString()
      return lead
    }
  }
}

export default LeadRepository
