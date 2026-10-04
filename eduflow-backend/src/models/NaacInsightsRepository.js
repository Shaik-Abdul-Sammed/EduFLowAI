import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

const memoryAnalyses = []
let memoryAnalysisIdCounter = 1

const memoryVisitPredictions = []
let memoryVisitPredictionIdCounter = 1

const memoryImprovementPlans = []
let memoryImprovementPlanIdCounter = 1

export class NaacInsightsRepository {
  // naac_report_analyses
  static async saveAnalysis(data) {
    const {
      institutionId = 1,
      reportId = null,
      reportType = 'SSR_SECTION',
      criterionNumber = null,
      analysisType = 'EXPLAIN',
      userId = null,
      inputSummary = '',
      analysisOutput = {},
      modelUsed = 'mock',
      tokensUsed = 0,
      durationMs = 0,
    } = data

    try {
      const query = `
        INSERT INTO naac_report_analyses (
          institution_id, report_id, report_type, criterion_number,
          analysis_type, user_id, input_summary, analysis_output,
          model_used, tokens_used, duration_ms, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `
      const params = [
        institutionId,
        reportId,
        reportType,
        criterionNumber,
        analysisType,
        userId,
        inputSummary,
        JSON.stringify(analysisOutput),
        modelUsed,
        tokensUsed,
        durationMs,
      ]

      const result = await pool.query(query, params)
      if (result?.rows?.[0]) return result.rows[0]
    } catch (err) {
      logger.warn(`NaacInsightsRepository.saveAnalysis using memory store: ${err.message}`)
    }

    const record = {
      id: memoryAnalysisIdCounter++,
      institution_id: institutionId,
      report_id: reportId,
      report_type: reportType,
      criterion_number: criterionNumber,
      analysis_type: analysisType,
      user_id: userId,
      input_summary: inputSummary,
      analysis_output: analysisOutput,
      model_used: modelUsed,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      created_at: new Date().toISOString(),
    }
    memoryAnalyses.unshift(record)
    return record
  }

  static async getAnalysesByInstitution(institutionId = 1, limit = 20) {
    try {
      const query = `
        SELECT * FROM naac_report_analyses
        WHERE institution_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `
      const result = await pool.query(query, [institutionId, limit])
      if (result?.rows?.length > 0) return result.rows
    } catch (err) {
      logger.warn(`NaacInsightsRepository.getAnalysesByInstitution using memory store: ${err.message}`)
    }

    return memoryAnalyses
      .filter((a) => !institutionId || a.institution_id === institutionId)
      .slice(0, limit)
  }

  // naac_visit_predictions
  static async saveVisitPrediction(data) {
    const {
      institutionId = 1,
      userId = null,
      predictedVisitScore = 3.5,
      predictedGrade = 'A+',
      predictedCgpa = 3.5,
      confidence = 0.85,
      peerTeamConcerns = [],
      peerTeamStrengths = [],
      preparedRecommendations = [],
      visitReadinessScore = 80,
      estimatedVisitDate = null,
    } = data

    try {
      const query = `
        INSERT INTO naac_visit_predictions (
          institution_id, user_id, predicted_visit_score, predicted_grade,
          predicted_cgpa, confidence, peer_team_concerns, peer_team_strengths,
          prepared_recommendations, visit_readiness_score, estimated_visit_date, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `
      const params = [
        institutionId,
        userId,
        predictedVisitScore,
        predictedGrade,
        predictedCgpa,
        confidence,
        JSON.stringify(peerTeamConcerns),
        JSON.stringify(peerTeamStrengths),
        JSON.stringify(preparedRecommendations),
        visitReadinessScore,
        estimatedVisitDate,
      ]

      const result = await pool.query(query, params)
      if (result?.rows?.[0]) return result.rows[0]
    } catch (err) {
      logger.warn(`NaacInsightsRepository.saveVisitPrediction using memory store: ${err.message}`)
    }

    const record = {
      id: memoryVisitPredictionIdCounter++,
      institution_id: institutionId,
      user_id: userId,
      predicted_visit_score: predictedVisitScore,
      predicted_grade: predictedGrade,
      predicted_cgpa: predictedCgpa,
      confidence,
      peer_team_concerns: peerTeamConcerns,
      peer_team_strengths: peerTeamStrengths,
      prepared_recommendations: preparedRecommendations,
      visit_readiness_score: visitReadinessScore,
      estimated_visit_date: estimatedVisitDate,
      created_at: new Date().toISOString(),
    }
    memoryVisitPredictions.unshift(record)
    return record
  }

  static async getVisitPredictions(institutionId = 1, limit = 10) {
    try {
      const query = `
        SELECT * FROM naac_visit_predictions
        WHERE institution_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `
      const result = await pool.query(query, [institutionId, limit])
      if (result?.rows?.length > 0) return result.rows
    } catch (err) {
      logger.warn(`NaacInsightsRepository.getVisitPredictions using memory store: ${err.message}`)
    }

    return memoryVisitPredictions
      .filter((p) => !institutionId || p.institution_id === institutionId)
      .slice(0, limit)
  }

  static async getLatestVisitPrediction(institutionId = 1) {
    const list = await this.getVisitPredictions(institutionId, 1)
    return list[0] || null
  }

  // naac_improvement_plans
  static async saveImprovementPlan(data) {
    const {
      institutionId = 1,
      userId = null,
      currentGrade = 'A',
      currentCgpa = 3.2,
      targetGrade = 'A+',
      targetCgpa = 3.6,
      gapAnalysis = {},
      roadmap = {},
      timelineMonths = 12,
      estimatedEffort = 'medium',
    } = data

    try {
      const query = `
        INSERT INTO naac_improvement_plans (
          institution_id, user_id, current_grade, current_cgpa,
          target_grade, target_cgpa, gap_analysis, roadmap,
          timeline_months, estimated_effort, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `
      const params = [
        institutionId,
        userId,
        currentGrade,
        currentCgpa,
        targetGrade,
        targetCgpa,
        JSON.stringify(gapAnalysis),
        JSON.stringify(roadmap),
        timelineMonths,
        estimatedEffort,
      ]

      const result = await pool.query(query, params)
      if (result?.rows?.[0]) return result.rows[0]
    } catch (err) {
      logger.warn(`NaacInsightsRepository.saveImprovementPlan using memory store: ${err.message}`)
    }

    const record = {
      id: memoryImprovementPlanIdCounter++,
      institution_id: institutionId,
      user_id: userId,
      current_grade: currentGrade,
      current_cgpa: currentCgpa,
      target_grade: targetGrade,
      target_cgpa: targetCgpa,
      gap_analysis: gapAnalysis,
      roadmap,
      timeline_months: timelineMonths,
      estimated_effort: estimatedEffort,
      created_at: new Date().toISOString(),
    }
    memoryImprovementPlans.unshift(record)
    return record
  }

  static async getImprovementPlans(institutionId = 1, limit = 10) {
    try {
      const query = `
        SELECT * FROM naac_improvement_plans
        WHERE institution_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `
      const result = await pool.query(query, [institutionId, limit])
      if (result?.rows?.length > 0) return result.rows
    } catch (err) {
      logger.warn(`NaacInsightsRepository.getImprovementPlans using memory store: ${err.message}`)
    }

    return memoryImprovementPlans
      .filter((p) => !institutionId || p.institution_id === institutionId)
      .slice(0, limit)
  }

  static async getLatestImprovementPlan(institutionId = 1) {
    const list = await this.getImprovementPlans(institutionId, 1)
    return list[0] || null
  }
}

export default NaacInsightsRepository
