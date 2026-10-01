import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

const memoryReports = []
let memoryIdCounter = 1

export class ReportDeliveryRepository {
  static async create(data) {
    const {
      leadId = null,
      token,
      collegeName,
      contactEmail,
      reportType = 'NAAC_EXECUTIVE_SUMMARY',
      title,
      reportContent,
      criteriaScores = {},
    } = data

    try {
      const query = `
        INSERT INTO delivered_reports (
          lead_id, token, college_name, contact_email, report_type, title,
          report_content, criteria_scores, views_count, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW())
        RETURNING *
      `
      const params = [
        leadId,
        token,
        collegeName,
        contactEmail,
        reportType,
        title || `Accreditation Audit Report - ${collegeName}`,
        reportContent,
        JSON.stringify(criteriaScores),
      ]

      const result = await pool.query(query, params)
      return result.rows[0]
    } catch (err) {
      logger.warn(`ReportDeliveryRepository.create using memory store: ${err.message}`)
      const newReport = {
        id: memoryIdCounter++,
        lead_id: leadId,
        token,
        college_name: collegeName,
        contact_email: contactEmail,
        report_type: reportType,
        title: title || `Accreditation Audit Report - ${collegeName}`,
        report_content: reportContent,
        criteria_scores: criteriaScores,
        views_count: 0,
        last_viewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      memoryReports.unshift(newReport)
      return newReport
    }
  }

  static async findByToken(token) {
    try {
      const result = await pool.query(
        'SELECT * FROM delivered_reports WHERE token = $1',
        [token]
      )
      return result.rows[0] || null
    } catch (err) {
      logger.warn(`ReportDeliveryRepository.findByToken using memory store: ${err.message}`)
      return memoryReports.find((r) => r.token === token) || null
    }
  }

  static async incrementViews(token) {
    try {
      const result = await pool.query(
        `UPDATE delivered_reports 
         SET views_count = views_count + 1, last_viewed_at = NOW(), updated_at = NOW() 
         WHERE token = $1 
         RETURNING *`,
        [token]
      )
      return result.rows[0] || null
    } catch (err) {
      logger.warn(`ReportDeliveryRepository.incrementViews using memory store: ${err.message}`)
      const report = memoryReports.find((r) => r.token === token)
      if (!report) return null
      report.views_count = (report.views_count || 0) + 1
      report.last_viewed_at = new Date().toISOString()
      report.updated_at = new Date().toISOString()
      return report
    }
  }

  static async findAll({ page = 1, limit = 50 } = {}) {
    const offset = (Math.max(1, page) - 1) * limit
    try {
      const query = `
        SELECT * FROM delivered_reports 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `
      const result = await pool.query(query, [limit, offset])
      const countRes = await pool.query('SELECT count(*) FROM delivered_reports')
      const total = parseInt(countRes.rows[0]?.count || '0', 10)
      return { reports: result.rows, total, page, limit }
    } catch (err) {
      logger.warn(`ReportDeliveryRepository.findAll using memory store: ${err.message}`)
      const total = memoryReports.length
      const reports = memoryReports.slice(offset, offset + limit)
      return { reports, total, page, limit }
    }
  }
}

export default ReportDeliveryRepository
