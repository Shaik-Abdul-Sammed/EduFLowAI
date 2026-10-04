import { getDomain, isValidDomain } from './domainRegistry.js'
import { AiInsightsRepository } from '../../models/AiInsightsRepository.js'
import { createAIProvider } from '../../ai/providers/providerFactory.js'
import { logger } from '../../utils/logger.js'

// Import domain delegates
import { explainSection, answerQuestion } from '../naac/reportExplainer.js'
import { predictVisit } from '../naac/visitPredictor.js'
import { generateImprovementPlan } from '../naac/improvementAdvisor.js'

import { StudentSuccessInsights } from './studentSuccessInsights.js'
import { TimetableInsights } from './timetableInsights.js'
import { AdmissionsInsights } from './admissionsInsights.js'
import { FinanceInsights } from './financeInsights.js'
import { NirfInsights } from '../nirf/nirfInsights.js'

function safeParseJson(text, fallback = null) {
  if (!text || typeof text !== 'string') return fallback
  try {
    return JSON.parse(text)
  } catch {}
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (match) {
    try {
      return JSON.parse(match[1])
    } catch {}
  }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1))
    } catch {}
  }
  return fallback
}

/**
 * Shared Base Insight Service.
 * Implements the Explain, Ask, Predict, and Improve pattern across all 5 officer domains.
 */
export class BaseInsightService {
  /**
   * Explain an SSR section, student risk case, conflict, funnel stage, or financial variance.
   */
  static async explain(domainKey, text = '', context = {}, options = {}) {
    const domain = getDomain(domainKey)
    if (!domain) {
      throw new Error(`Unknown domain: "${domainKey}"`)
    }

    const startTime = Date.now()
    const institutionId = Number(options.institutionId || context.institutionId) || 1
    const userId = options.userId || null
    let result = null

    // Domain delegation
    if (domain.key === 'accreditation') {
      const critNum = context.criterionNumber || 1
      const naacRes = await explainSection(text || 'SSR Criterion Evidence', critNum)
      result = {
        success: true,
        domain: domain.key,
        insightType: 'explain',
        summary: naacRes.summary || 'NAAC Section analysis completed.',
        details: naacRes,
        recommendations: naacRes.deanActionSteps || [
          'Strengthen qualitative metric documentation',
          'Align departmental files with SSR claims',
        ],
        confidence: 0.90,
        generatedAt: new Date().toISOString(),
      }
    } else if (domain.key === 'student-success') {
      result = await StudentSuccessInsights.explainRisk(context.studentId || text)
    } else if (domain.key === 'timetable') {
      result = await TimetableInsights.explainConflict(context.conflictId || text)
    } else if (domain.key === 'admissions') {
      result = await AdmissionsInsights.explainFunnel(institutionId)
    } else if (domain.key === 'finance') {
      result = await FinanceInsights.explainVariance(context.transactionId || text)
    } else if (domain.key === 'nirf') {
      result = await NirfInsights.explainScore(institutionId, context.parameter || text)
    } else {
      result = {
        success: true,
        domain: domain.key,
        insightType: 'explain',
        summary: `Analysis for ${domain.name} generated.`,
        details: { text, context },
        recommendations: ['Review operational metrics against targets'],
        confidence: 0.85,
        generatedAt: new Date().toISOString(),
      }
    }

    const durationMs = Date.now() - startTime

    // Save insight run in repository
    await AiInsightsRepository.saveInsightRun({
      institutionId,
      userId,
      officerDomain: domain.key,
      insightType: 'explain',
      inputText: text,
      inputContext: context,
      outputData: result,
      modelUsed: options.modelUsed || 'mock',
      tokensUsed: 150,
      durationMs,
      confidence: result.confidence || 0.85,
    })

    return result
  }

  /**
   * Ask targeted questions to the domain AI officer.
   */
  static async ask(domainKey, text = '', question = '', options = {}) {
    const domain = getDomain(domainKey)
    if (!domain) {
      throw new Error(`Unknown domain: "${domainKey}"`)
    }

    const startTime = Date.now()
    const institutionId = Number(options.institutionId) || 1
    const userId = options.userId || null

    let answerText = ''
    let citations = []
    let recommendations = []

    if (domain.key === 'accreditation') {
      const naacAnswer = await answerQuestion(text, question)
      answerText = naacAnswer.answer || naacAnswer
      recommendations = naacAnswer.actionItems || ['Review SSR draft with IQAC team']
    } else {
      // Build prompt from domain template
      const prompt = domain.askTemplate
        .replace('{persona}', domain.persona)
        .replace('{question}', question || 'How can our institution optimize performance in this area?')
        .replace('{text}', text || `Institutional data for domain ${domain.name}`)

      try {
        const aiProvider = createAIProvider()
        const rawAi = await aiProvider.generateText(prompt, {
          systemPrompt: `You are the ${domain.displayName}. Answer professionally and specifically based on institutional best practices.`,
          temperature: 0.3,
        })
        const parsed = safeParseJson(rawAi, null)
        if (parsed?.answer) {
          answerText = parsed.answer
          recommendations = parsed.recommendations || []
        } else {
          answerText = rawAi.trim()
          recommendations = [
            `Implement ${domain.name} officer recommended workflow changes`,
            'Track weekly key performance indicators (KPIs)',
          ]
        }
      } catch (err) {
        logger.warn(`AI provider error in ask(${domain.key}): ${err.message}`)
        answerText = `Based on institutional data for ${domain.name}, the query "${question}" has been evaluated. Recommend initiating proactive monitoring and adhering to ${domain.name} officer standards.`
        recommendations = [
          `Review operational metrics for ${domain.name}`,
          'Consult department heads for targeted implementation',
        ]
      }
    }

    const result = {
      success: true,
      domain: domain.key,
      insightType: 'ask',
      summary: `Answered question regarding ${domain.name}.`,
      details: {
        question,
        answer: answerText,
        citations,
      },
      recommendations,
      confidence: 0.88,
      generatedAt: new Date().toISOString(),
    }

    const durationMs = Date.now() - startTime

    await AiInsightsRepository.saveInsightRun({
      institutionId,
      userId,
      officerDomain: domain.key,
      insightType: 'ask',
      inputText: `Q: ${question}\nContext: ${text}`,
      inputContext: { question, text },
      outputData: result,
      modelUsed: options.modelUsed || 'mock',
      tokensUsed: 180,
      durationMs,
      confidence: 0.88,
    })

    return result
  }

  /**
   * Predict outcomes, readiness, risk factors, or forecasts for a domain.
   */
  static async predict(domainKey, institutionId = 1, options = {}) {
    const domain = getDomain(domainKey)
    if (!domain) {
      throw new Error(`Unknown domain: "${domainKey}"`)
    }

    const startTime = Date.now()
    const instId = Number(institutionId) || 1
    const userId = options.userId || null
    let result = null

    if (domain.key === 'accreditation') {
      const visitRes = await predictVisit(instId, userId)
      result = {
        success: true,
        domain: domain.key,
        insightType: 'predict',
        summary: `NAAC Peer Visit simulation predicts ${visitRes.predictedGrade} grade with ${visitRes.readinessScore}% readiness.`,
        details: visitRes,
        recommendations: [
          'Conduct mock peer review for Criterion 3 (Research) documentation',
          'Verify laboratory equipment calibration tags ahead of physical inspection',
        ],
        confidence: visitRes.confidence || 0.88,
        generatedAt: new Date().toISOString(),
      }
    } else if (domain.key === 'student-success') {
      result = await StudentSuccessInsights.predictCohort(instId, options.semester || 'Next')
    } else if (domain.key === 'timetable') {
      result = await TimetableInsights.predictUtilization(instId, options.weeksAhead || 4)
    } else if (domain.key === 'admissions') {
      result = await AdmissionsInsights.predictYield(instId, options.nextCycle || '2026-27')
    } else if (domain.key === 'finance') {
      result = await FinanceInsights.predictCashFlow(instId, options.monthsAhead || 6)
    } else if (domain.key === 'nirf') {
      result = await NirfInsights.predictRank(instId, options.category || 'Engineering', options.monthsAhead || 12)
    } else {
      result = {
        success: true,
        domain: domain.key,
        insightType: 'predict',
        summary: `Prediction generated for ${domain.name}.`,
        details: { institutionId: instId },
        recommendations: ['Monitor monthly variance'],
        confidence: 0.85,
        generatedAt: new Date().toISOString(),
      }
    }

    const durationMs = Date.now() - startTime

    // Save run
    await AiInsightsRepository.saveInsightRun({
      institutionId: instId,
      userId,
      officerDomain: domain.key,
      insightType: 'predict',
      inputText: `Predict outcomes for institution ${instId}`,
      inputContext: { institutionId: instId, options },
      outputData: result,
      modelUsed: options.modelUsed || 'mock',
      tokensUsed: 220,
      durationMs,
      confidence: result.confidence || 0.85,
    })

    // Save snapshot
    let score = 80
    let predScore = 88
    let outcome = 'On Track'

    if (domain.key === 'accreditation') {
      score = result.details.predictedCGPA ? Number((result.details.predictedCGPA * 25).toFixed(1)) : 82
      predScore = result.details.readinessScore || 85
      outcome = result.details.predictedGrade || 'A+'
    } else if (domain.key === 'student-success') {
      score = 82
      predScore = 90
      outcome = `${result.details.predictedDropoutRate}% Dropout Risk`
    } else if (domain.key === 'timetable') {
      score = 94
      predScore = 98
      outcome = 'Zero Conflicts'
    } else if (domain.key === 'admissions') {
      score = 72
      predScore = 79
      outcome = `${result.details.predictedYield}% Yield`
    } else if (domain.key === 'finance') {
      score = 88
      predScore = 95
      outcome = 'Positive Cash Flow'
    }

    await AiInsightsRepository.savePredictionSnapshot({
      institutionId: instId,
      officerDomain: domain.key,
      currentScore: score,
      predictedScore: predScore,
      predictedOutcome: outcome,
      confidence: result.confidence || 0.85,
      riskFactors: result.details.criticalGaps || result.details.bottlenecks || ['Resource limits'],
      opportunities: result.recommendations || ['Process automation'],
    })

    return result
  }

  /**
   * Formulate an action plan to achieve a target goal.
   */
  static async improve(domainKey, institutionId = 1, targetGoal = '', options = {}) {
    const domain = getDomain(domainKey)
    if (!domain) {
      throw new Error(`Unknown domain: "${domainKey}"`)
    }

    const startTime = Date.now()
    const instId = Number(institutionId) || 1
    const userId = options.userId || null
    let result = null

    if (domain.key === 'accreditation') {
      const plan = await generateImprovementPlan(instId, targetGoal || 'A++', userId)
      result = {
        success: true,
        domain: domain.key,
        insightType: 'improve',
        summary: `NAAC Grade Improvement Plan formulated targeting ${plan.targetGrade || targetGoal || 'A++'}.`,
        details: plan,
        recommendations: [
          'Initiate Phase 1 Quick Wins within the first 30 days',
          'Deploy IQAC departmental coordinators for evidence tracking',
        ],
        confidence: 0.90,
        generatedAt: new Date().toISOString(),
      }
    } else if (domain.key === 'student-success') {
      result = await StudentSuccessInsights.improveRetention(instId, targetGoal || 30)
    } else if (domain.key === 'timetable') {
      result = await TimetableInsights.improveSchedule(instId, targetGoal || 'zero conflicts')
    } else if (domain.key === 'admissions') {
      result = await AdmissionsInsights.improveConversion(instId, targetGoal || '15 percent yield increase')
    } else if (domain.key === 'finance') {
      result = await FinanceInsights.improveCollection(instId, targetGoal || '50 percent defaulter reduction')
    } else if (domain.key === 'nirf') {
      result = await NirfInsights.improveRank(instId, parseInt(targetGoal, 10) || 50, options.category || 'Engineering')
    } else {
      result = {
        success: true,
        domain: domain.key,
        insightType: 'improve',
        summary: `Improvement plan for ${domain.name} generated.`,
        details: { targetGoal, institutionId: instId },
        recommendations: ['Execute prioritized milestones'],
        confidence: 0.85,
        generatedAt: new Date().toISOString(),
      }
    }

    const durationMs = Date.now() - startTime

    await AiInsightsRepository.saveInsightRun({
      institutionId: instId,
      userId,
      officerDomain: domain.key,
      insightType: 'improve',
      inputText: `Improvement plan targeting ${targetGoal}`,
      inputContext: { institutionId: instId, targetGoal },
      outputData: result,
      modelUsed: options.modelUsed || 'mock',
      tokensUsed: 250,
      durationMs,
      confidence: result.confidence || 0.85,
    })

    return result
  }
}

export default BaseInsightService
