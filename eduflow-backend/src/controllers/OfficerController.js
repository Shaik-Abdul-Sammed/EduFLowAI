import { OfficerRepository } from '../repositories/OfficerRepository.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { AIService } from '../services/AIService.js'
import { CacheService } from '../services/CacheService.js'
import { calculateROI } from '../ai/officers/officerPrompts.js'
import { logger } from '../utils/logger.js'

export class OfficerController {
  static async generateAccreditation(req, res) {
    try {
      const { reportType } = req.body
      if (!reportType) return res.status(400).json({ error: 'reportType is required' })

      const roi = calculateROI('accreditation', 'generate_report')

      await OfficerRepository.logSession(
        req.user.institutionId,
        'accreditation',
        [{ role: 'user', content: `Generate ${reportType}` }],
        { reply: `${reportType} has been successfully generated and saved.` },
        roi.hoursSaved,
        roi.moneySaved
      )

      const reply = await AIService.processPrompt('accreditation', `Generate ${reportType}`, { userRole: req.user.role })
      await UserRepository.logAudit(req.user.institutionId, req.user.id, 'ACCREDITATION_REPORT_GENERATED', req.ip, req.get('user-agent'), { reportType })

      res.json({
        success: true,
        message: `${reportType} generated successfully`,
        reply,
        reportUrl: `/reports/${reportType.toLowerCase().replace(/ /g, '-')}.pdf`,
        roi
      })
    } catch (err) {
      logger.error('Accreditation generation error:', err)
      res.status(500).json({ error: 'Failed to generate report' })
    }
  }

  static async predictStudentRisk(req, res) {
    try {
      const { action = 'predict student risk' } = req.body

      const roi = calculateROI('student-success', 'predict_risk')

      await OfficerRepository.logSession(
        req.user.institutionId,
        'student-success',
        [{ role: 'user', content: action }],
        { reply: `Processed risk prediction for ${action}.` },
        roi.hoursSaved,
        roi.moneySaved
      )

      const reply = await AIService.processPrompt('student-success', action)
      await UserRepository.logAudit(req.user.institutionId, req.user.id, 'RISK_PREDICTION_RUN', req.ip, req.get('user-agent'), { action })

      res.json({ success: true, reply, roi })
    } catch (err) {
      logger.error('Risk prediction error:', err)
      res.status(500).json({ error: 'Failed to predict risk' })
    }
  }

  static async generateTimetable(req, res) {
    try {
      const { action = 'generate timetable' } = req.body

      const roi = calculateROI('timetable', 'generate')

      await OfficerRepository.logSession(
        req.user.institutionId,
        'timetable',
        [{ role: 'user', content: action }],
        { reply: `Generated timetable for ${action}.` },
        roi.hoursSaved,
        roi.moneySaved
      )

      const reply = await AIService.processPrompt('timetable', action)
      await UserRepository.logAudit(req.user.institutionId, req.user.id, 'TIMETABLE_GENERATED', req.ip, req.get('user-agent'), { action })

      res.json({ success: true, reply, roi })
    } catch (err) {
      logger.error('Timetable generation error:', err)
      res.status(500).json({ error: 'Failed to generate timetable' })
    }
  }

  static async predictAdmissionsYield(req, res) {
    try {
      const { action = 'predict admissions yield' } = req.body

      const roi = calculateROI('admissions', 'predict_yield')

      await OfficerRepository.logSession(
        req.user.institutionId,
        'admissions',
        [{ role: 'user', content: action }],
        { reply: `Predicted admissions yield for ${action}.` },
        roi.hoursSaved,
        roi.moneySaved
      )

      const reply = await AIService.processPrompt('admissions', action)
      await UserRepository.logAudit(req.user.institutionId, req.user.id, 'ADMISSION_YIELD_PREDICTED', req.ip, req.get('user-agent'), { action })

      res.json({ success: true, reply, roi })
    } catch (err) {
      logger.error('Admission yield prediction error:', err)
      res.status(500).json({ error: 'Failed to predict admission yield' })
    }
  }

  static async reconcileFinance(req, res) {
    try {
      const { action = 'reconcile finances' } = req.body

      const roi = calculateROI('finance', 'reconcile_fees')

      await OfficerRepository.logSession(
        req.user.institutionId,
        'finance',
        [{ role: 'user', content: action }],
        { reply: `Reconciled finances for ${action}.` },
        roi.hoursSaved,
        roi.moneySaved
      )

      const reply = await AIService.processPrompt('finance', action)
      await UserRepository.logAudit(req.user.institutionId, req.user.id, 'FINANCE_RECONCILED', req.ip, req.get('user-agent'), { action })

      res.json({ success: true, reply, roi })
    } catch (err) {
      logger.error('Finance reconciliation error:', err)
      res.status(500).json({ error: 'Failed to reconcile finances' })
    }
  }

  static async getOfficersSummary(req, res) {
    try {
      const VALID_OFFICERS = ['accreditation', 'timetable', 'admissions', 'finance', 'student-success']
      const cacheKey = `officers_summary_${req.user.institutionId}`
      
      const recentActivity = await CacheService.getOrSet(
        cacheKey, 
        () => OfficerRepository.getRecentActivity(req.user.institutionId, 10),
        60000 // Cache for 1 minute
      )
      
      res.json({
        officers: VALID_OFFICERS.map(id => {
          const lastAct = recentActivity.find(a => a.action === `OFFICER_CHAT_${id.toUpperCase()}`)
          return {
            id,
            endpoint: `/api/v1/officers/${id}/chat`,
            status: 'available',
            lastAction: lastAct ? `Performed action at ${new Date(lastAct.created_at).toLocaleTimeString()}` : 'No recent activity'
          }
        }),
        recentActivity: recentActivity.map(a => ({
          officer: a.action.replace('OFFICER_CHAT_', ''),
          time: a.created_at,
          metadata: a.metadata
        }))
      })
    } catch (err) {
      res.status(500).json({ error: 'Failed to get officers summary' })
    }
  }

  static async getROISummary(req, res) {
    try {
      const cacheKey = `roi_summary_${req.user.institutionId}`
      
      const summaryData = await CacheService.getOrSet(
        cacheKey,
        async () => {
          const summaryRows = await OfficerRepository.getROISummary(req.user.institutionId)
          
          let totalHoursSaved = 0
          let totalMoneySaved = 0
          const byOfficer = []

          for (const row of summaryRows) {
            const hours = parseFloat(row.total_hours) || 0
            const money = parseFloat(row.total_money) || 0
            totalHoursSaved += hours
            totalMoneySaved += money
            byOfficer.push({
              type: row.officer_type,
              hoursSaved: hours,
              moneySaved: money
            })
          }

          return {
            totalHoursSaved,
            totalMoneySaved,
            accreditationScore: 78, // Mocked for now (needs DigitalTwin logic)
            studentRiskAlerts: 12,  // Mocked for now (needs StudentSuccess logic)
            byOfficer,
          }
        },
        120000 // Cache for 2 minutes
      )

      res.json(summaryData)
    } catch (e) {
      logger.error('Failed to get ROI summary:', e)
      res.status(500).json({ error: 'Failed to get ROI summary' })
    }
  }

  static async handleStream(req, res, officerType, prompt, actionType, auditAction) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders()
    }

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    try {
      sendEvent({ type: 'thinking', message: `Analyzing institutional data for ${officerType}...` })

      const roi = calculateROI(officerType, actionType)
      let accumulatedText = ''

      const context = {
        institutionId: req.user?.institutionId,
        userRole: req.user?.role,
      }

      for await (const token of AIService.streamPrompt(officerType, prompt, context)) {
        accumulatedText += token
        sendEvent({ type: 'token', text: token })
      }

      sendEvent({
        type: 'done',
        officerType,
        roi,
        totalText: accumulatedText,
      })

      if (req.user?.institutionId) {
        try {
          await OfficerRepository.logSession(
            req.user.institutionId,
            officerType,
            [{ role: 'user', content: prompt }],
            { reply: accumulatedText },
            roi.hoursSaved,
            roi.moneySaved
          )

          await UserRepository.logAudit(
            req.user.institutionId,
            req.user.id,
            auditAction,
            req.ip,
            req.get('user-agent'),
            { prompt, actionType }
          )
        } catch (dbErr) {
          logger.warn(`[Stream] Could not log session/audit for ${officerType}:`, dbErr)
        }
      }

      res.end()
    } catch (err) {
      logger.error(`Error in officer streaming [${officerType}]:`, err)
      sendEvent({ type: 'error', message: err.message || 'Stream processing failed' })
      res.end()
    }
  }

  static async streamAccreditation(req, res) {
    const prompt = req.body?.reportType || req.body?.action || 'Generate NAAC Criteria 3 SSR Analysis for SSIT'
    return OfficerController.handleStream(
      req,
      res,
      'accreditation',
      prompt,
      'generate_naac_report',
      'ACCREDITATION_REPORT_STREAMED'
    )
  }

  static async streamStudentRisk(req, res) {
    const prompt = req.body?.action || 'Run institutional dropout risk analysis for semester 4'
    return OfficerController.handleStream(
      req,
      res,
      'student-success',
      prompt,
      'risk_analysis',
      'RISK_PREDICTION_STREAMED'
    )
  }

  static async streamTimetable(req, res) {
    const prompt = req.body?.action || 'Generate conflict-free timetable for CSE Department'
    return OfficerController.handleStream(
      req,
      res,
      'timetable',
      prompt,
      'generate_timetable',
      'TIMETABLE_STREAMED'
    )
  }

  static async streamAdmissions(req, res) {
    const prompt = req.body?.action || 'Analyze application yield and predict final enrollment'
    return OfficerController.handleStream(
      req,
      res,
      'admissions',
      prompt,
      'process_application',
      'ADMISSION_YIELD_STREAMED'
    )
  }

  static async streamFinance(req, res) {
    const prompt = req.body?.action || 'Reconcile fee collection against bank deposits for March 2026'
    return OfficerController.handleStream(
      req,
      res,
      'finance',
      prompt,
      'reconcile_fees',
      'FINANCE_RECONCILED_STREAMED'
    )
  }
}

