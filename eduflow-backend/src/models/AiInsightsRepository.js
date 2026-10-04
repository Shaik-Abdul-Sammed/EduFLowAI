import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

const memoryInsightRuns = []
let memoryRunIdCounter = 1

const memorySnapshots = []
let memorySnapshotIdCounter = 1

export class AiInsightsRepository {
  /**
   * Resets in-memory stores for clean testing.
   */
  static resetMemory() {
    memoryInsightRuns.length = 0
    memoryRunIdCounter = 1
    memorySnapshots.length = 0
    memorySnapshotIdCounter = 1
  }

  /**
   * Saves a single insight run (explain, ask, predict, improve).
   */
  static async saveInsightRun(data) {
    const {
      institutionId = 1,
      userId = null,
      officerDomain,
      insightType,
      inputText = '',
      inputContext = {},
      outputData = {},
      modelUsed = 'mock',
      tokensUsed = 0,
      durationMs = 0,
      confidence = 0.85,
    } = data

    try {
      const query = `
        INSERT INTO ai_insight_runs (
          institution_id, user_id, officer_domain, insight_type,
          input_text, input_context, output_data, model_used,
          tokens_used, duration_ms, confidence, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `
      const params = [
        institutionId,
        userId,
        officerDomain,
        insightType,
        inputText,
        JSON.stringify(inputContext),
        JSON.stringify(outputData),
        modelUsed,
        tokensUsed,
        durationMs,
        confidence,
      ]

      const result = await pool.query(query, params)
      if (result?.rows?.[0]) {
        return {
          ...result.rows[0],
          input_context: typeof result.rows[0].input_context === 'string'
            ? JSON.parse(result.rows[0].input_context)
            : result.rows[0].input_context,
          output_data: typeof result.rows[0].output_data === 'string'
            ? JSON.parse(result.rows[0].output_data)
            : result.rows[0].output_data,
        }
      }
    } catch (err) {
      logger.warn(`AiInsightsRepository.saveInsightRun using memory store: ${err.message}`)
    }

    const record = {
      id: memoryRunIdCounter++,
      institution_id: Number(institutionId) || 1,
      user_id: userId,
      officer_domain: officerDomain,
      insight_type: insightType,
      input_text: inputText,
      input_context: inputContext,
      output_data: outputData,
      model_used: modelUsed,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      confidence: Number(confidence) || 0.85,
      created_at: new Date().toISOString(),
    }
    memoryInsightRuns.unshift(record)
    return record
  }

  /**
   * Retrieves historical runs for a specific domain.
   */
  static async getHistory({ institutionId = 1, domain, limit = 10 } = {}) {
    const lim = Math.max(1, Math.min(Number(limit) || 10, 50))
    const instId = Number(institutionId) || 1

    try {
      let query = `
        SELECT * FROM ai_insight_runs
        WHERE institution_id = $1
      `
      const params = [instId]

      if (domain && domain !== 'all') {
        query += ` AND officer_domain = $2 ORDER BY created_at DESC LIMIT $3`
        params.push(domain, lim)
      } else {
        query += ` ORDER BY created_at DESC LIMIT $2`
        params.push(lim)
      }

      const res = await pool.query(query, params)
      if (res?.rows) {
        return res.rows.map((row) => ({
          ...row,
          input_context: typeof row.input_context === 'string' ? JSON.parse(row.input_context) : row.input_context,
          output_data: typeof row.output_data === 'string' ? JSON.parse(row.output_data) : row.output_data,
        }))
      }
    } catch (err) {
      logger.warn(`AiInsightsRepository.getHistory using memory store: ${err.message}`)
    }

    let filtered = memoryInsightRuns.filter((r) => r.institution_id === instId)
    if (domain && domain !== 'all') {
      filtered = filtered.filter((r) => r.officer_domain === domain)
    }
    return filtered.slice(0, lim)
  }

  /**
   * Retrieves the latest N runs across all domains for recent activity feed.
   */
  static async getRecentActivity({ institutionId = 1, limit = 20 } = {}) {
    return this.getHistory({ institutionId, domain: 'all', limit })
  }

  /**
   * Saves or updates a prediction snapshot for a domain.
   */
  static async savePredictionSnapshot(data) {
    const {
      institutionId = 1,
      officerDomain,
      currentScore = 0,
      predictedScore = 0,
      predictedOutcome = '',
      confidence = 0.85,
      riskFactors = [],
      opportunities = [],
    } = data

    try {
      const query = `
        INSERT INTO ai_prediction_snapshots (
          institution_id, officer_domain, current_score, predicted_score,
          predicted_outcome, confidence, risk_factors, opportunities,
          snapshot_date, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, NOW())
        RETURNING *
      `
      const params = [
        institutionId,
        officerDomain,
        currentScore,
        predictedScore,
        predictedOutcome,
        confidence,
        JSON.stringify(riskFactors),
        JSON.stringify(opportunities),
      ]

      const result = await pool.query(query, params)
      if (result?.rows?.[0]) return result.rows[0]
    } catch (err) {
      logger.warn(`AiInsightsRepository.savePredictionSnapshot using memory store: ${err.message}`)
    }

    const record = {
      id: memorySnapshotIdCounter++,
      institution_id: Number(institutionId) || 1,
      officer_domain: officerDomain,
      current_score: Number(currentScore) || 0,
      predicted_score: Number(predictedScore) || 0,
      predicted_outcome: predictedOutcome,
      confidence: Number(confidence) || 0.85,
      risk_factors: riskFactors,
      opportunities: opportunities,
      snapshot_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
    memorySnapshots.unshift(record)
    return record
  }

  /**
   * Retrieves the latest prediction snapshot for a domain.
   */
  static async getLatestSnapshot({ institutionId = 1, domain } = {}) {
    const instId = Number(institutionId) || 1
    try {
      const query = `
        SELECT * FROM ai_prediction_snapshots
        WHERE institution_id = $1 AND officer_domain = $2
        ORDER BY created_at DESC
        LIMIT 1
      `
      const res = await pool.query(query, [instId, domain])
      if (res?.rows?.[0]) return res.rows[0]
    } catch (err) {
      logger.warn(`AiInsightsRepository.getLatestSnapshot using memory store: ${err.message}`)
    }

    const found = memorySnapshots.find(
      (s) => s.institution_id === instId && s.officer_domain === domain
    )
    return found || null
  }
}

export default AiInsightsRepository
