import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

// In-memory dual fallback stores
const memoryNirfScores = []
const memoryPeerInstitutions = []
const memoryBenchmarkReports = []
const memoryImprovementPlans = []
let scoreIdCounter = 1
let peerIdCounter = 1
let reportIdCounter = 1
let planIdCounter = 1

export class NirfRepository {
  /**
   * Save a calculated NIRF score.
   */
  static async saveScore(scoreData) {
    const {
      institutionId = 1,
      category = 'Engineering',
      academicYear = '2024-25',
      tlrScore = 0,
      rpScore = 0,
      goScore = 0,
      oiScore = 0,
      prScore = 0,
      totalScore = 0,
      categoryRank = null,
      overallRank = null,
    } = scoreData

    try {
      const query = `
        INSERT INTO nirf_scores (
          institution_id, nirf_category, academic_year,
          tlr_score, rp_score, go_score, oi_score, pr_score,
          total_score, category_rank, overall_rank, calculated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `
      const values = [
        institutionId,
        category,
        academicYear,
        Number(tlrScore).toFixed(2),
        Number(rpScore).toFixed(2),
        Number(goScore).toFixed(2),
        Number(oiScore).toFixed(2),
        Number(prScore).toFixed(2),
        Number(totalScore).toFixed(2),
        categoryRank,
        overallRank,
      ]
      const { rows } = await pool.query(query, values)
      return rows[0]
    } catch (err) {
      logger.warn(`NirfRepository.saveScore using memory store: ${err.message}`)
      const record = {
        id: scoreIdCounter++,
        institution_id: institutionId,
        nirf_category: category,
        academic_year: academicYear,
        tlr_score: Number(tlrScore).toFixed(2),
        rp_score: Number(rpScore).toFixed(2),
        go_score: Number(goScore).toFixed(2),
        oi_score: Number(oiScore).toFixed(2),
        pr_score: Number(prScore).toFixed(2),
        total_score: Number(totalScore).toFixed(2),
        category_rank: categoryRank,
        overall_rank: overallRank,
        calculated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      memoryNirfScores.unshift(record)
      return record
    }
  }

  /**
   * Retrieve latest NIRF score for institution and category.
   */
  static async getLatestScore(institutionId = 1, category = 'Engineering') {
    try {
      const query = `
        SELECT * FROM nirf_scores
        WHERE institution_id = $1 AND nirf_category = $2
        ORDER BY id DESC
        LIMIT 1
      `
      const { rows } = await pool.query(query, [institutionId, category])
      return rows[0] || null
    } catch (err) {
      logger.warn(`NirfRepository.getLatestScore using memory store: ${err.message}`)
      const match = memoryNirfScores.find(
        (s) => s.institution_id === Number(institutionId) && (!category || s.nirf_category === category)
      )
      return match || null
    }
  }

  /**
   * Retrieve historical NIRF scores.
   */
  static async getScoresHistory(institutionId = 1, category = null, limit = 10) {
    try {
      let query = `
        SELECT * FROM nirf_scores
        WHERE institution_id = $1
      `
      const values = [institutionId]
      if (category) {
        query += ` AND nirf_category = $2`
        values.push(category)
      }
      query += ` ORDER BY id DESC LIMIT $${values.length + 1}`
      values.push(limit)

      const { rows } = await pool.query(query, values)
      return rows
    } catch (err) {
      logger.warn(`NirfRepository.getScoresHistory using memory store: ${err.message}`)
      return memoryNirfScores
        .filter((s) => s.institution_id === Number(institutionId) && (!category || s.nirf_category === category))
        .slice(0, limit)
    }
  }

  /**
   * Seed or bulk insert peer institutions.
   */
  static async seedPeerInstitutions(peers = []) {
    if (!peers || peers.length === 0) return []

    try {
      // Clear or upsert in Postgres
      for (const p of peers) {
        await pool.query(
          `INSERT INTO nirf_peer_institutions (
            name, category, academic_year, tlr_score, rp_score, go_score, oi_score, pr_score,
            total_score, nirf_rank, naac_grade, location_state, institution_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            p.name,
            p.category || 'Engineering',
            p.academicYear || '2024',
            p.tlrScore,
            p.rpScore,
            p.goScore,
            p.oiScore,
            p.prScore,
            p.totalScore,
            p.nirfRank,
            p.naacGrade || 'A+',
            p.locationState || 'All India',
            p.institutionType || 'University',
          ]
        )
      }
    } catch (err) {
      logger.warn(`NirfRepository.seedPeerInstitutions using memory store: ${err.message}`)
    }

    // Always keep memory copy synced
    memoryPeerInstitutions.length = 0
    peers.forEach((p, idx) => {
      memoryPeerInstitutions.push({
        id: peerIdCounter++,
        name: p.name,
        category: p.category || 'Engineering',
        academic_year: p.academicYear || '2024',
        tlr_score: Number(p.tlrScore).toFixed(2),
        rp_score: Number(p.rpScore).toFixed(2),
        go_score: Number(p.goScore).toFixed(2),
        oi_score: Number(p.oiScore).toFixed(2),
        pr_score: Number(p.prScore).toFixed(2),
        total_score: Number(p.totalScore).toFixed(2),
        nirf_rank: p.nirfRank || idx + 1,
        naac_grade: p.naacGrade || 'A+',
        location_state: p.locationState || 'All India',
        institution_type: p.institutionType || 'University',
        created_at: new Date().toISOString(),
      })
    })

    return memoryPeerInstitutions
  }

  /**
   * Get peer institutions filtered by category and limit.
   */
  static async getPeerInstitutions(options = {}) {
    const { category = 'Engineering', limit = 50 } = options
    try {
      const query = `
        SELECT * FROM nirf_peer_institutions
        WHERE category = $1
        ORDER BY nirf_rank ASC
        LIMIT $2
      `
      const { rows } = await pool.query(query, [category, limit])
      if (rows && rows.length > 0) return rows
      throw new Error('No rows in database, fallback to memory')
    } catch (err) {
      logger.warn(`NirfRepository.getPeerInstitutions using memory store: ${err.message}`)
      return memoryPeerInstitutions
        .filter((p) => !category || p.category.toLowerCase() === category.toLowerCase())
        .sort((a, b) => a.nirf_rank - b.nirf_rank)
        .slice(0, limit)
    }
  }

  /**
   * Count how many peers have a higher total score than the given score.
   */
  static async countPeersAhead(category = 'Engineering', totalScore = 0) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM nirf_peer_institutions
        WHERE category = $1 AND total_score > $2
      `
      const { rows } = await pool.query(query, [category, totalScore])
      return parseInt(rows[0]?.count || 0, 10)
    } catch (err) {
      logger.warn(`NirfRepository.countPeersAhead using memory store: ${err.message}`)
      return memoryPeerInstitutions.filter(
        (p) => (!category || p.category.toLowerCase() === category.toLowerCase()) && Number(p.total_score) > Number(totalScore)
      ).length
    }
  }

  /**
   * Save a benchmark comparison report.
   */
  static async saveBenchmarkReport(data) {
    const {
      institutionId = 1,
      userId = null,
      category = 'Engineering',
      reportData = {},
      peerComparison = {},
      gapAnalysis = {},
      recommendations = [],
    } = data

    try {
      const query = `
        INSERT INTO nirf_benchmark_reports (
          institution_id, user_id, category, report_data, peer_comparison, gap_analysis, recommendations
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `
      const { rows } = await pool.query(query, [
        institutionId,
        userId,
        category,
        JSON.stringify(reportData),
        JSON.stringify(peerComparison),
        JSON.stringify(gapAnalysis),
        JSON.stringify(recommendations),
      ])
      return rows[0]
    } catch (err) {
      logger.warn(`NirfRepository.saveBenchmarkReport using memory store: ${err.message}`)
      const record = {
        id: reportIdCounter++,
        institution_id: institutionId,
        user_id: userId,
        category,
        report_data: reportData,
        peer_comparison: peerComparison,
        gap_analysis: gapAnalysis,
        recommendations,
        created_at: new Date().toISOString(),
      }
      memoryBenchmarkReports.unshift(record)
      return record
    }
  }

  /**
   * Save an improvement plan.
   */
  static async saveImprovementPlan(data) {
    const {
      institutionId = 1,
      userId = null,
      currentScore = 0,
      targetScore = 0,
      targetRank = 100,
      actionItems = [],
      timelineMonths = 12,
      estimatedEffort = 'Medium',
    } = data

    try {
      const query = `
        INSERT INTO nirf_improvement_plans (
          institution_id, user_id, current_score, target_score, target_rank, action_items, timeline_months, estimated_effort
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `
      const { rows } = await pool.query(query, [
        institutionId,
        userId,
        currentScore,
        targetScore,
        targetRank,
        JSON.stringify(actionItems),
        timelineMonths,
        estimatedEffort,
      ])
      return rows[0]
    } catch (err) {
      logger.warn(`NirfRepository.saveImprovementPlan using memory store: ${err.message}`)
      const record = {
        id: planIdCounter++,
        institution_id: institutionId,
        user_id: userId,
        current_score: currentScore,
        target_score: targetScore,
        target_rank: targetRank,
        action_items: actionItems,
        timeline_months: timelineMonths,
        estimated_effort: estimatedEffort,
        created_at: new Date().toISOString(),
      }
      memoryImprovementPlans.unshift(record)
      return record
    }
  }

  /**
   * Clear in-memory collections (for tests).
   */
  static resetMemoryStore() {
    memoryNirfScores.length = 0
    memoryBenchmarkReports.length = 0
    memoryImprovementPlans.length = 0
    scoreIdCounter = 1
    reportIdCounter = 1
    planIdCounter = 1
  }

  static getMemoryPeers() {
    return memoryPeerInstitutions
  }
}

export default NirfRepository
