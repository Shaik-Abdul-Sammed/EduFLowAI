import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import { explainSection, answerQuestion, compareToIdeal } from '../services/naac/reportExplainer.js'
import { predictVisit } from '../services/naac/visitPredictor.js'
import { generateImprovementPlan } from '../services/naac/improvementAdvisor.js'
import { predictNaacGrade } from '../services/naac/gradePredictor.js'
import { NaacInsightsRepository } from '../models/NaacInsightsRepository.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { logger } from '../utils/logger.js'

export const naacInsightsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  keyGenerator: (req) => String(req.user?.id || req.ip || 'anonymous'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      error: 'Rate limit exceeded: 20 requests per hour per user allowed on NAAC AI analysis.',
      retryAfter,
    })
  },
})

// Zod Validation Schemas
export const explainSchema = z.object({
  reportText: z.string().optional().default(''),
  criterionNumber: z.number().int().min(1).max(7).optional().default(1),
})

export const askSchema = z.object({
  reportText: z.string().optional().default(''),
  question: z.string().min(1, 'Question is required'),
})

export const compareIdealSchema = z.object({
  reportText: z.string().optional().default(''),
  criterionNumber: z.number().int().min(1).max(7).optional().default(1),
})

export const predictVisitSchema = z.object({
  institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().default(1),
})

export const improvementPlanSchema = z.object({
  institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().default(1),
  targetGrade: z.string().min(1, 'Target grade is required'),
})

export class NaacInsightsController {
  static async explain(req, res) {
    try {
      const parsed = explainSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const { reportText, criterionNumber } = parsed.data
      const institutionId = req.user?.institutionId || 1
      const userId = req.user?.id || null

      const explanation = await explainSection(reportText, criterionNumber)

      // Save analysis record
      await NaacInsightsRepository.saveAnalysis({
        institutionId,
        criterionNumber,
        analysisType: 'EXPLAIN',
        userId,
        inputSummary: reportText.slice(0, 300),
        analysisOutput: explanation,
        modelUsed: process.env.AI_PROVIDER || 'mock',
      })

      await UserRepository.logAudit(
        institutionId,
        userId,
        'NAAC_EXPLAIN_SECTION',
        req.ip,
        req.headers['user-agent'] || '',
        { criterionNumber }
      )

      res.status(200).json({
        success: true,
        criterionNumber,
        explanation,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.explain error')
      res.status(500).json({
        error: 'Unable to explain NAAC report section at this time. Please try again.',
      })
    }
  }

  static async ask(req, res) {
    try {
      const parsed = askSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const { reportText, question } = parsed.data
      const institutionId = req.user?.institutionId || 1
      const userId = req.user?.id || null

      const result = await answerQuestion(reportText, question)

      await NaacInsightsRepository.saveAnalysis({
        institutionId,
        analysisType: 'ASK',
        userId,
        inputSummary: question,
        analysisOutput: result,
        modelUsed: process.env.AI_PROVIDER || 'mock',
      })

      await UserRepository.logAudit(
        institutionId,
        userId,
        'NAAC_ASK_QUESTION',
        req.ip,
        req.headers['user-agent'] || '',
        { question }
      )

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.ask error')
      res.status(500).json({
        error: 'Unable to process your question regarding the NAAC report.',
      })
    }
  }

  static async compareIdeal(req, res) {
    try {
      const parsed = compareIdealSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const { reportText, criterionNumber } = parsed.data
      const institutionId = req.user?.institutionId || 1
      const userId = req.user?.id || null

      const comparison = await compareToIdeal(reportText, criterionNumber)

      await NaacInsightsRepository.saveAnalysis({
        institutionId,
        criterionNumber,
        analysisType: 'COMPARE_IDEAL',
        userId,
        inputSummary: reportText.slice(0, 300),
        analysisOutput: comparison,
        modelUsed: process.env.AI_PROVIDER || 'mock',
      })

      await UserRepository.logAudit(
        institutionId,
        userId,
        'NAAC_COMPARE_IDEAL',
        req.ip,
        req.headers['user-agent'] || '',
        { criterionNumber }
      )

      res.status(200).json({
        success: true,
        comparison,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.compareIdeal error')
      res.status(500).json({
        error: 'Unable to compare report against NAAC ideal benchmarks.',
      })
    }
  }

  static async predictVisit(req, res) {
    try {
      const parsed = predictVisitSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const { institutionId } = parsed.data
      const userId = req.user?.id || null

      const prediction = await predictVisit(institutionId, userId)

      await UserRepository.logAudit(
        institutionId,
        userId,
        'NAAC_PREDICT_VISIT',
        req.ip,
        req.headers['user-agent'] || '',
        { predictedGrade: prediction.predictedGrade, readinessScore: prediction.readinessScore }
      )

      res.status(200).json({
        success: true,
        institutionId,
        prediction,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.predictVisit error')
      res.status(500).json({
        error: 'Unable to predict peer team visit outcome.',
      })
    }
  }

  static async visitHistory(req, res) {
    try {
      const institutionId = req.query.institutionId ? Number(req.query.institutionId) : (req.user?.institutionId || 1)
      const limit = req.query.limit ? Math.min(50, Math.max(1, Number(req.query.limit))) : 10

      const history = await NaacInsightsRepository.getVisitPredictions(institutionId, limit)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id || null,
        'NAAC_GET_VISIT_HISTORY',
        req.ip,
        req.headers['user-agent'] || '',
        { count: history.length }
      )

      res.status(200).json({
        success: true,
        institutionId,
        history,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.visitHistory error')
      res.status(500).json({
        error: 'Unable to fetch visit prediction history.',
      })
    }
  }

  static async improvementPlan(req, res) {
    try {
      const parsed = improvementPlanSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const { institutionId, targetGrade } = parsed.data
      const userId = req.user?.id || null

      const plan = await generateImprovementPlan(institutionId, targetGrade, userId)

      await UserRepository.logAudit(
        institutionId,
        userId,
        'NAAC_IMPROVEMENT_PLAN',
        req.ip,
        req.headers['user-agent'] || '',
        { targetGrade, gap: plan.gap }
      )

      res.status(200).json({
        success: true,
        institutionId,
        plan,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.improvementPlan error')
      res.status(500).json({
        error: 'Unable to generate grade improvement plan.',
      })
    }
  }

  static async improvementHistory(req, res) {
    try {
      const institutionId = req.query.institutionId ? Number(req.query.institutionId) : (req.user?.institutionId || 1)
      const limit = req.query.limit ? Math.min(50, Math.max(1, Number(req.query.limit))) : 10

      const history = await NaacInsightsRepository.getImprovementPlans(institutionId, limit)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id || null,
        'NAAC_GET_IMPROVEMENT_HISTORY',
        req.ip,
        req.headers['user-agent'] || '',
        { count: history.length }
      )

      res.status(200).json({
        success: true,
        institutionId,
        history,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.improvementHistory error')
      res.status(500).json({
        error: 'Unable to fetch improvement plan history.',
      })
    }
  }

  static async dashboardInsights(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const userId = req.user?.id || null

      const [gradeCalc, latestVisit, latestPlan] = await Promise.all([
        predictNaacGrade(institutionId).catch(() => ({ grade: 'A+', cgpa: 3.38 })),
        NaacInsightsRepository.getLatestVisitPrediction(institutionId),
        NaacInsightsRepository.getLatestImprovementPlan(institutionId),
      ])

      const predictedGrade = latestVisit?.predicted_grade || gradeCalc?.grade || 'A+'
      const predictedCgpa = latestVisit?.predicted_cgpa || gradeCalc?.cgpa || 3.38
      const visitReadinessScore = latestVisit?.visit_readiness_score || 82

      const topImprovementActions = latestPlan?.roadmap?.quickWins?.slice(0, 3) || [
        'Publish all Course Outcomes (COs) and Program Outcomes (POs) on the college portal',
        'Upload GeoTagged photos of ICT classrooms, laboratories, and library facilities',
        'Constitute an active Alumni Association chapter with registered alumni feedback',
      ]

      const topEvidenceGaps = [
        'GeoTagged photographs of research incubation facilities and prototypes',
        'Audited expenditure statements showing annual library budget utilization',
        'Student feedback analysis reports with Action Taken Reports (ATR) signed by BoS',
      ]

      const lastUpdateTimestamp = latestVisit?.created_at || latestPlan?.created_at || new Date().toISOString()

      await UserRepository.logAudit(
        institutionId,
        userId,
        'NAAC_DASHBOARD_INSIGHTS',
        req.ip,
        req.headers['user-agent'] || '',
        { predictedGrade, visitReadinessScore }
      )

      res.status(200).json({
        success: true,
        currentPredictedGrade: predictedGrade,
        predictedCgpa,
        visitReadinessScore,
        topImprovementActions,
        topEvidenceGaps,
        lastUpdateTimestamp,
      })
    } catch (error) {
      logger.error({ err: error }, 'NaacInsightsController.dashboardInsights error')
      res.status(500).json({
        error: 'Unable to retrieve NAAC dashboard insights snapshot.',
      })
    }
  }
}

export default NaacInsightsController
