import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import { NirfScoreCalculator } from '../services/nirf/nirfScoreCalculator.js'
import { NirfInsights } from '../services/nirf/nirfInsights.js'
import { NirfRepository } from '../models/NirfRepository.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { logger } from '../utils/logger.js'

export const nirfRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  keyGenerator: (req) => String(req.user?.id || req.ip || 'anonymous'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      error: 'Rate limit exceeded: 20 requests per hour per user allowed on NIRF analytics.',
      retryAfter,
    })
  },
})

// Zod Schemas
export const explainNirfSchema = z.object({
  parameter: z.enum(['TLR', 'RP', 'GO', 'OI', 'PR'], {
    errorMap: () => ({ message: 'Parameter must be one of: TLR, RP, GO, OI, PR' }),
  }),
})

export const benchmarkNirfSchema = z.object({
  category: z.string().optional().default('Engineering'),
  topN: z.number().int().min(1).max(50).optional().default(10),
})

export const improveNirfSchema = z.object({
  targetRank: z.number().int().min(1).max(200),
  category: z.string().optional().default('Engineering'),
})

export const exportPdfSchema = z.object({
  reportType: z.enum(['score', 'benchmark', 'improvement']),
})

function escapePdfText(str) {
  if (!str) return ''
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function generateNirfPdfBuffer({ title, institutionName, text, reportType }) {
  const institution = institutionName || 'Sri Sudha Institute of Technology'
  const lines = (text || '').split('\n')
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

  let streamContent = 'BT\n'
  streamContent += `/F1 18 Tf\n50 740 Td\n(${escapePdfText(institution)}) Tj\n`
  streamContent += `/F1 13 Tf\n0 -22 Td\n(${escapePdfText(title)}) Tj\n`
  streamContent += `/F2 9 Tf\n0 -16 Td\n(NIRF Ranking & Peer Intelligence Framework - ${escapePdfText(timestamp)}) Tj\n`
  streamContent += 'ET\n'

  streamContent += 'q 0.1 0.45 0.75 rg 50 686 512 2 re f Q\n'
  streamContent += 'BT\n/F2 10 Tf\n50 665 Td\n15 TL\n'

  let y = 665
  for (const rawLine of lines) {
    const cleanLine = rawLine
      .replace(/[#*`_]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()

    if (!cleanLine) {
      streamContent += 'T*\n'
      y -= 15
    } else {
      const chunks = cleanLine.match(/.{1,85}(\s|$)/g) || [cleanLine]
      for (const chunk of chunks) {
        streamContent += `(${escapePdfText(chunk.trim())}) Tj T*\n`
        y -= 15
        if (y < 60) break
      }
    }
    if (y < 60) break
  }

  if (y >= 45) {
    streamContent += `ET\nq 0.6 0.6 0.6 rg 50 42 512 1 re f Q\nBT\n/F2 8 Tf\n50 30 Td\n(EduFlow AI OS - National Institutional Ranking Framework Confidential Report) Tj\nET\n`
  } else {
    streamContent += 'ET\n'
  }

  const streamBytes = Buffer.byteLength(streamContent, 'latin1')
  const body =
    `%PDF-1.4\n` +
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` +
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n` +
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n` +
    `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${streamContent}endstream\nendobj\n` +
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n` +
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n` +
    `xref\n0 7\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000261 00000 n \n` +
    `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${400 + streamBytes}\n%%EOF`

  return Buffer.from(body, 'latin1')
}

export class NirfController {
  /**
   * GET /api/v1/nirf/score
   * Returns current NIRF score across all 5 parameters.
   */
  static async getScore(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const category = req.query.category || 'Engineering'

      const result = await NirfScoreCalculator.calculateNirfScore(institutionId, category)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_SCORE_CALCULATED',
        req.ip,
        req.headers['user-agent'],
        { category, totalScore: result.totalScore, predictedRank: result.predictedRank }
      ).catch(() => {})

      return res.status(200).json(result)
    } catch (err) {
      logger.error({ err }, 'NirfController.getScore error')
      return res.status(500).json({ error: 'Failed to calculate NIRF scores', details: err.message })
    }
  }

  /**
   * GET /api/v1/nirf/predict-rank?category=Engineering
   * Forecasts predicted NIRF rank.
   */
  static async predictRank(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const category = req.query.category || 'Engineering'
      const monthsAhead = parseInt(req.query.monthsAhead, 10) || 12

      const result = await NirfInsights.predictRank(institutionId, category, monthsAhead)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_RANK_PREDICTED',
        req.ip,
        req.headers['user-agent'],
        { category, predictedRank: result.predictedRank }
      ).catch(() => {})

      return res.status(200).json(result)
    } catch (err) {
      logger.error({ err }, 'NirfController.predictRank error')
      return res.status(500).json({ error: 'Failed to predict NIRF rank', details: err.message })
    }
  }

  /**
   * POST /api/v1/nirf/explain
   * Body: { parameter: "TLR" | "RP" | "GO" | "OI" | "PR" }
   */
  static async explain(req, res) {
    try {
      const parsed = explainNirfSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
      }

      const institutionId = req.user?.institutionId || 1
      const { parameter } = parsed.data

      const result = await NirfInsights.explainScore(institutionId, parameter)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_SCORE_EXPLAINED',
        req.ip,
        req.headers['user-agent'],
        { parameter, currentScore: result.currentScore }
      ).catch(() => {})

      return res.status(200).json(result)
    } catch (err) {
      logger.error({ err }, 'NirfController.explain error')
      return res.status(500).json({ error: 'Failed to explain NIRF parameter score', details: err.message })
    }
  }

  /**
   * POST /api/v1/nirf/benchmark
   * Body: { category: string, topN: number }
   */
  static async benchmark(req, res) {
    try {
      const parsed = benchmarkNirfSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
      }

      const institutionId = req.user?.institutionId || 1
      const { category, topN } = parsed.data

      const result = await NirfInsights.benchmarkAgainstPeers(institutionId, category, topN)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_BENCHMARK_GENERATED',
        req.ip,
        req.headers['user-agent'],
        { category, topN, institutionRank: result.institutionRank }
      ).catch(() => {})

      return res.status(200).json(result)
    } catch (err) {
      logger.error({ err }, 'NirfController.benchmark error')
      return res.status(500).json({ error: 'Failed to generate peer benchmark', details: err.message })
    }
  }

  /**
   * POST /api/v1/nirf/improve
   * Body: { targetRank: number, category: string }
   */
  static async improve(req, res) {
    try {
      const parsed = improveNirfSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
      }

      const institutionId = req.user?.institutionId || 1
      const { targetRank, category } = parsed.data

      const result = await NirfInsights.improveRank(institutionId, targetRank, category)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_IMPROVEMENT_PLAN_CREATED',
        req.ip,
        req.headers['user-agent'],
        { targetRank, currentRank: result.currentRank }
      ).catch(() => {})

      return res.status(200).json(result)
    } catch (err) {
      logger.error({ err }, 'NirfController.improve error')
      return res.status(500).json({ error: 'Failed to generate improvement plan', details: err.message })
    }
  }

  /**
   * GET /api/v1/nirf/compare-naac
   * Returns NAAC vs NIRF comparison and alignment evaluation.
   */
  static async compareNaac(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const result = await NirfInsights.compareNaacToNirf(institutionId)

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_NAAC_COMPARED',
        req.ip,
        req.headers['user-agent'],
        { naacGrade: result.naacGrade, nirfRank: result.nirfRank }
      ).catch(() => {})

      return res.status(200).json(result)
    } catch (err) {
      logger.error({ err }, 'NirfController.compareNaac error')
      return res.status(500).json({ error: 'Failed to compare NAAC to NIRF', details: err.message })
    }
  }

  /**
   * GET /api/v1/nirf/peers?category=Engineering&limit=50
   * Returns list of peer institutions.
   */
  static async getPeers(req, res) {
    try {
      const category = req.query.category || 'Engineering'
      const limit = parseInt(req.query.limit, 10) || 50

      let peers = await NirfRepository.getPeerInstitutions({ category, limit })
      if (!peers || peers.length === 0) {
        await NirfRepository.seedPeerInstitutions()
        peers = await NirfRepository.getPeerInstitutions({ category, limit })
      }

      return res.status(200).json({ success: true, count: peers.length, category, peers })
    } catch (err) {
      logger.error({ err }, 'NirfController.getPeers error')
      return res.status(500).json({ error: 'Failed to fetch peer institutions', details: err.message })
    }
  }

  /**
   * POST /api/v1/nirf/export-pdf
   * Body: { reportType: "score" | "benchmark" | "improvement" }
   */
  static async exportPdf(req, res) {
    try {
      const parsed = exportPdfSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues })
      }

      const institutionId = req.user?.institutionId || 1
      const { reportType } = parsed.data

      let title = 'NIRF Institutional Performance Report'
      let textContent = ''

      if (reportType === 'score') {
        const scoreData = await NirfScoreCalculator.calculateNirfScore(institutionId)
        title = `NIRF Ranking Scorecard (Rank #${scoreData.predictedRank})`
        textContent =
          `EXECUTIVE SUMMARY\n` +
          `Category: ${scoreData.category} | Academic Year: ${scoreData.academicYear}\n` +
          `Total Score: ${scoreData.totalScore} / 100 | Predicted NIRF Rank: #${scoreData.predictedRank}\n\n` +
          `PARAMETER BREAKDOWN\n` +
          `- Teaching, Learning & Resources (TLR): ${scoreData.parameterScores.TLR.score} (Weight: 30%)\n` +
          `- Research & Professional Practice (RP): ${scoreData.parameterScores.RP.score} (Weight: 30%)\n` +
          `- Graduation Outcomes (GO): ${scoreData.parameterScores.GO.score} (Weight: 20%)\n` +
          `- Outreach & Inclusivity (OI): ${scoreData.parameterScores.OI.score} (Weight: 10%)\n` +
          `- Peer Perception (PR): ${scoreData.parameterScores.PR.score} (Weight: 10%)\n\n` +
          `SUB-METRICS DETAIL\n` +
          `TLR: SS=${scoreData.parameterScores.TLR.subMetrics.SS}, FSR=${scoreData.parameterScores.TLR.subMetrics.FSR}, FQE=${scoreData.parameterScores.TLR.subMetrics.FQE}, FRU=${scoreData.parameterScores.TLR.subMetrics.FRU}\n` +
          `RP: PU=${scoreData.parameterScores.RP.subMetrics.PU}, QP=${scoreData.parameterScores.RP.subMetrics.QP}, IPR=${scoreData.parameterScores.RP.subMetrics.IPR}, FPPP=${scoreData.parameterScores.RP.subMetrics.FPPP}\n` +
          `GO: GPH=${scoreData.parameterScores.GO.subMetrics.GPH}, GUE=${scoreData.parameterScores.GO.subMetrics.GUE}, GMS=${scoreData.parameterScores.GO.subMetrics.GMS}, GPHD=${scoreData.parameterScores.GO.subMetrics.GPHD}\n`
      } else if (reportType === 'benchmark') {
        const benchData = await NirfInsights.benchmarkAgainstPeers(institutionId, 'Engineering', 10)
        title = `NIRF Peer Institution Benchmarking Report`
        textContent =
          `PEER BENCHMARK SUMMARY\n` +
          `Current Institution Rank: #${benchData.institutionRank} | Peers Ahead: ${benchData.peersAhead} | Peers Behind: ${benchData.peersBehind}\n\n` +
          `GAP ANALYSIS AGAINST TOP 10 PEERS\n` +
          `- TLR Gap: ${benchData.gapAnalysis.TLR} points\n` +
          `- RP Gap: ${benchData.gapAnalysis.RP} points\n` +
          `- GO Gap: ${benchData.gapAnalysis.GO} points\n` +
          `- OI Gap: ${benchData.gapAnalysis.OI} points\n` +
          `- PR Gap: ${benchData.gapAnalysis.PR} points\n\n` +
          `STRATEGIC RECOMMENDATIONS\n` +
          benchData.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
      } else {
        const planData = await NirfInsights.improveRank(institutionId, 50, 'Engineering')
        title = `NIRF Rank Advancement Blueprint (Target: Top ${planData.targetRank})`
        textContent =
          `ROADMAP OVERVIEW\n` +
          `Current Rank: #${planData.currentRank} -> Target Rank: #${planData.targetRank}\n` +
          `Current Score: ${planData.currentScore} -> Target Score: ${planData.targetScore} (Gap: +${planData.gap} pts)\n` +
          `Estimated Timeline: ${planData.timelineMonths} Months | Effort: ${planData.estimatedEffort}\n\n` +
          `PHASE 1: QUICK WINS (0-90 DAYS)\n` +
          planData.quickWins.map((q, i) => `* ${q}`).join('\n') +
          `\n\nPHASE 2: MEDIUM TERM (3-12 MONTHS)\n` +
          planData.mediumTerm.map((m, i) => `* ${m}`).join('\n') +
          `\n\nPHASE 3: LONG TERM (12-24 MONTHS)\n` +
          planData.longTerm.map((l, i) => `* ${l}`).join('\n')
      }

      const pdfBuffer = generateNirfPdfBuffer({
        title,
        institutionName: 'Sri Sudha Institute of Technology',
        text: textContent,
        reportType,
      })

      await UserRepository.logAudit(
        institutionId,
        req.user?.id,
        'NIRF_PDF_EXPORTED',
        req.ip,
        req.headers['user-agent'],
        { reportType }
      ).catch(() => {})

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="nirf-${reportType}-report.pdf"`)
      return res.status(200).send(pdfBuffer)
    } catch (err) {
      logger.error({ err }, 'NirfController.exportPdf error')
      return res.status(500).json({ error: 'Failed to export NIRF PDF', details: err.message })
    }
  }
}

export default NirfController
