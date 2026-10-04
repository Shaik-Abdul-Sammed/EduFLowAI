import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import { getDomain, isValidDomain, getAllDomains } from '../services/insights/domainRegistry.js'
import { BaseInsightService } from '../services/insights/BaseInsightService.js'
import { AiInsightsRepository } from '../models/AiInsightsRepository.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { logger } from '../utils/logger.js'

export const insightsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 30,
  keyGenerator: (req) => String(req.user?.id || req.ip || 'anonymous'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      error: 'Rate limit exceeded: 30 requests per hour per user allowed on AI insights.',
      retryAfter,
    })
  },
})

// Zod Validation Schemas
export const explainInsightSchema = z.object({
  text: z.string().optional().default(''),
  context: z.record(z.any()).optional().default({}),
})

export const askInsightSchema = z.object({
  text: z.string().optional().default(''),
  question: z.string().min(1, 'Question is required'),
})

export const predictInsightSchema = z.object({
  institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
})

export const improveInsightSchema = z.object({
  institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  target: z.string().min(1, 'Target is required'),
})

export class InsightsController {
  /**
   * Helper to validate domain parameter against registry.
   */
  static getValidatedDomain(req, res) {
    const domainKey = req.params.domain
    const domain = getDomain(domainKey)
    if (!domain) {
      res.status(404).json({ error: `Unknown domain: "${domainKey}"` })
      return null
    }
    return domain
  }

  /**
   * POST /api/v1/insights/:domain/explain
   */
  static async explain(req, res) {
    const domain = InsightsController.getValidatedDomain(req, res)
    if (!domain) return

    try {
      const parsed = explainInsightSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const institutionId = req.user?.institutionId || 1
      const userId = req.user?.id || null
      const { text, context } = parsed.data

      const result = await BaseInsightService.explain(
        domain.key,
        text,
        { ...context, institutionId },
        { institutionId, userId }
      )

      await UserRepository.logAudit(
        institutionId,
        userId,
        `INSIGHT_EXPLAIN_${domain.key.toUpperCase().replace('-', '_')}`,
        req.ip,
        req.headers['user-agent'] || '',
        { domain: domain.key, insightType: 'explain' }
      )

      return res.status(200).json(result)
    } catch (error) {
      logger.error({ err: error }, `InsightsController.explain(${domain.key}) error`)
      return res.status(500).json({ error: error.message || 'Unable to generate explanation' })
    }
  }

  /**
   * POST /api/v1/insights/:domain/ask
   */
  static async ask(req, res) {
    const domain = InsightsController.getValidatedDomain(req, res)
    if (!domain) return

    try {
      const parsed = askInsightSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const institutionId = req.user?.institutionId || 1
      const userId = req.user?.id || null
      const { text, question } = parsed.data

      const result = await BaseInsightService.ask(
        domain.key,
        text,
        question,
        { institutionId, userId }
      )

      await UserRepository.logAudit(
        institutionId,
        userId,
        `INSIGHT_ASK_${domain.key.toUpperCase().replace('-', '_')}`,
        req.ip,
        req.headers['user-agent'] || '',
        { domain: domain.key, question }
      )

      return res.status(200).json(result)
    } catch (error) {
      logger.error({ err: error }, `InsightsController.ask(${domain.key}) error`)
      return res.status(500).json({ error: error.message || 'Unable to answer inquiry' })
    }
  }

  /**
   * POST /api/v1/insights/:domain/predict
   */
  static async predict(req, res) {
    const domain = InsightsController.getValidatedDomain(req, res)
    if (!domain) return

    try {
      const parsed = predictInsightSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const institutionId = parsed.data.institutionId || req.user?.institutionId || 1
      const userId = req.user?.id || null

      const result = await BaseInsightService.predict(
        domain.key,
        institutionId,
        { userId }
      )

      await UserRepository.logAudit(
        institutionId,
        userId,
        `INSIGHT_PREDICT_${domain.key.toUpperCase().replace('-', '_')}`,
        req.ip,
        req.headers['user-agent'] || '',
        { domain: domain.key, institutionId }
      )

      return res.status(200).json(result)
    } catch (error) {
      logger.error({ err: error }, `InsightsController.predict(${domain.key}) error`)
      return res.status(500).json({ error: error.message || 'Unable to generate prediction' })
    }
  }

  /**
   * POST /api/v1/insights/:domain/improve
   */
  static async improve(req, res) {
    const domain = InsightsController.getValidatedDomain(req, res)
    if (!domain) return

    try {
      const parsed = improveInsightSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      const institutionId = parsed.data.institutionId || req.user?.institutionId || 1
      const userId = req.user?.id || null
      const { target } = parsed.data

      const result = await BaseInsightService.improve(
        domain.key,
        institutionId,
        target,
        { userId }
      )

      await UserRepository.logAudit(
        institutionId,
        userId,
        `INSIGHT_IMPROVE_${domain.key.toUpperCase().replace('-', '_')}`,
        req.ip,
        req.headers['user-agent'] || '',
        { domain: domain.key, target }
      )

      return res.status(200).json(result)
    } catch (error) {
      logger.error({ err: error }, `InsightsController.improve(${domain.key}) error`)
      return res.status(500).json({ error: error.message || 'Unable to formulate improvement plan' })
    }
  }

  /**
   * GET /api/v1/insights/:domain/history?limit=10
   */
  static async history(req, res) {
    const domain = InsightsController.getValidatedDomain(req, res)
    if (!domain) return

    try {
      const institutionId = req.user?.institutionId || 1
      const limit = Number(req.query.limit) || 10

      const history = await AiInsightsRepository.getHistory({
        institutionId,
        domain: domain.key,
        limit,
      })

      return res.status(200).json({
        success: true,
        domain: domain.key,
        count: history.length,
        history,
      })
    } catch (error) {
      logger.error({ err: error }, `InsightsController.history(${domain.key}) error`)
      return res.status(500).json({ error: 'Unable to retrieve history' })
    }
  }

  /**
   * GET /api/v1/insights/dashboard
   */
  static async dashboard(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1

      // Consolidated snapshot across all 5 domains
      const domainsData = [
        {
          name: 'accreditation',
          displayName: 'Accreditation Officer',
          currentScore: 3.42,
          grade: 'A+',
          trend: 'up',
          metricLabel: 'CGPA Score',
        },
        {
          name: 'student-success',
          displayName: 'Student Success Officer',
          currentScore: 82,
          riskLevel: 'medium',
          trend: 'stable',
          metricLabel: 'Retention Health',
        },
        {
          name: 'timetable',
          displayName: 'Timetable Officer',
          currentScore: 94,
          conflicts: 0,
          trend: 'up',
          metricLabel: 'Schedule Optimization',
        },
        {
          name: 'admissions',
          displayName: 'Admissions Officer',
          currentScore: 72,
          yield: '72 percent',
          trend: 'up',
          metricLabel: 'Admissions Yield',
        },
        {
          name: 'finance',
          displayName: 'Finance Officer',
          currentScore: 88,
          defaulters: 14,
          trend: 'down',
          metricLabel: 'Recovery Rate',
        },
      ]

      const topPriorities = [
        {
          domain: 'student-success',
          domainName: 'Student Success',
          issue: '48 students at high dropout risk due to attendance and backlogs',
          suggestedAction: 'Deploy remedial faculty mentors and tutor pods',
          urgency: 'HIGH',
        },
        {
          domain: 'accreditation',
          domainName: 'Accreditation',
          issue: 'Criterion 3 Research publications below benchmark A++ threshold',
          suggestedAction: 'Allocate seed money grants to active PhD faculty',
          urgency: 'HIGH',
        },
        {
          domain: 'finance',
          domainName: 'Finance',
          issue: 'GST mismatch detected in cafeteria facility lease receipts',
          suggestedAction: 'File GSTR-1 rectification return ahead of statutory filing',
          urgency: 'MEDIUM',
        },
      ]

      const overallHealth = 82

      return res.status(200).json({
        success: true,
        domains: domainsData,
        overallHealth,
        topPriorities,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      logger.error({ err: error }, 'InsightsController.dashboard error')
      return res.status(500).json({ error: 'Unable to load insights dashboard snapshot' })
    }
  }

  /**
   * GET /api/v1/insights/activity?limit=20
   */
  static async activity(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const limit = Number(req.query.limit) || 20
      const activity = await AiInsightsRepository.getRecentActivity({ institutionId, limit })
      return res.status(200).json({ success: true, count: activity.length, activity })
    } catch (error) {
      logger.error({ err: error }, 'InsightsController.activity error')
      return res.status(500).json({ error: 'Unable to retrieve recent activity' })
    }
  }
}

export default InsightsController
