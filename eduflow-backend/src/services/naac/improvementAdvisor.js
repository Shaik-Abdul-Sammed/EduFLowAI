import { DemoDataRepository } from '../../models/DemoDataRepository.js'
import { NaacInsightsRepository } from '../../models/NaacInsightsRepository.js'
import { createAIProvider } from '../../ai/providers/providerFactory.js'
import { predictNaacGrade, NAAC_CRITERIA_CONFIG } from './gradePredictor.js'
import { logger } from '../../utils/logger.js'

const GRADE_THRESHOLDS = {
  'A++': 3.51,
  'A+': 3.26,
  'A': 3.01,
  'B++': 2.76,
  'B+': 2.51,
  'B': 2.01,
  'C': 1.51,
  'D': 1.00,
}

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
 * Generates a structured NAAC grade improvement plan towards a target grade.
 *
 * @param {number|string} institutionId
 * @param {string} targetGrade
 * @param {number|null} userId
 * @returns {Promise<{
 *   currentCgpa: number,
 *   currentGrade: string,
 *   targetCgpa: number,
 *   targetGrade: string,
 *   gap: number,
 *   priorityCriteria: Array,
 *   quickWins: string[],
 *   mediumTerm: string[],
 *   longTerm: string[],
 *   realisticTargetDate: string,
 *   effortLevel: string,
 *   estimatedTotalInvestment: string
 * }>}
 */
export async function generateImprovementPlan(institutionId = 1, targetGrade = 'A++', userId = null) {
  const parsedInstId = Number(institutionId) || 1
  const cleanTargetGrade = String(targetGrade || 'A++').trim().toUpperCase()

  // 1. Current grade prediction and demo stats
  let currentPrediction = null
  try {
    currentPrediction = await predictNaacGrade(parsedInstId)
  } catch (err) {
    logger.warn({ err }, 'Error fetching current grade prediction, using default benchmark')
    currentPrediction = {
      grade: 'A',
      cgpa: 3.15,
      criteriaScores: NAAC_CRITERIA_CONFIG.map((c) => ({
        criterion: c.criterion,
        name: c.name,
        score: 3.15,
      })),
    }
  }

  const currentCgpa = Number(currentPrediction?.cgpa) || 3.15
  const currentGrade = currentPrediction?.grade || 'A'

  // Determine target CGPA
  const rawTargetThreshold = GRADE_THRESHOLDS[cleanTargetGrade]
  const isValidTarget = typeof rawTargetThreshold === 'number'
  const targetCgpa = isValidTarget ? rawTargetThreshold : 3.51
  const isImpossible = !isValidTarget || targetCgpa <= currentCgpa

  // Calculate gap
  const gap = isImpossible ? 0 : Number((targetCgpa - currentCgpa).toFixed(2))

  // Determine priority criteria based on criteria scores
  const criteriaScores = currentPrediction?.criteriaScores || []
  const sortedCriteria = [...criteriaScores].sort((a, b) => (a.score || 0) - (b.score || 0))

  const priorityCriteria = (sortedCriteria.length ? sortedCriteria : NAAC_CRITERIA_CONFIG).slice(0, 3).map((c) => {
    const critScore = Number(c.score) || 3.0
    const targetScore = isImpossible ? critScore : Math.min(4.0, Number((critScore + (gap * 1.2)).toFixed(2)))
    const gapPts = Number(Math.max(0, targetScore - critScore).toFixed(2))

    return {
      criterion: c.criterion,
      name: c.name,
      currentScore: critScore,
      targetScore,
      gapPoints: gapPts,
      improvementActions: [
        {
          action: `Establish formal documentation review for ${c.name}`,
          effort: gapPts > 0.4 ? 'high' : 'medium',
          timelineMonths: gapPts > 0.4 ? 12 : 6,
          evidenceRequired: `Audited records and committee approvals for Criterion ${c.criterion}`,
        },
        {
          action: `Automate quantitative metric aggregation via ERP for ${c.name}`,
          effort: 'low',
          timelineMonths: 2,
          evidenceRequired: `Digital MIS reports and verified student/faculty participation proofs`,
        },
      ],
    }
  })

  // Quick wins, medium term, long term
  let quickWins = [
    'Publish all Course Outcomes (COs) and Program Outcomes (POs) on the college portal',
    'Constitute an active Alumni Association chapter with registered alumni feedback',
    'Upload GeoTagged photos of ICT classrooms, laboratories, and library facilities',
  ]

  let mediumTerm = [
    'Execute 5 new industry MoUs with active student internship and project deliverables',
    'Conduct institutional Academic and Administrative Audit (AAA) by external peers',
    'Implement a structured Value-Added Course program with minimum 30 contact hours',
  ]

  let longTerm = [
    'Increase faculty PhD qualification percentage from current standing to over 50%',
    'Scale Scopus/WoS research publications to an average of >2 papers per faculty annually',
    'Expand smart research lab infrastructure with institutional seed funding grants',
  ]

  let realisticTargetDate = '12 Months (Next Academic Cycle)'
  let effortLevel = gap > 0.4 ? 'high' : gap > 0.15 ? 'medium' : 'low'
  let estimatedTotalInvestment = '₹12,00,000 - ₹18,00,000'

  if (isImpossible) {
    quickWins = [
      'Maintain current benchmark documentation and compliance records',
      'Audit annual IQAC reports to prevent metric regression',
      'Prepare for peer team reaffirmation cycle',
    ]
    mediumTerm = [
      'Sustain faculty publication rate and intellectual property filings',
      'Engage with national benchmarking bodies for best practice sharing',
    ]
    longTerm = [
      'Pursue autonomous status or university status expansion',
      'Benchmark with NIRF Top-100 institutional parameters',
    ]
    realisticTargetDate = 'Already Achieved or Target Lower Than Current CGPA'
    effortLevel = 'low'
    estimatedTotalInvestment = '₹0 - Maintenance Budget Only'
  }

  // 2. Query AI Provider for enriched strategic guidance
  if (!isImpossible) {
    const prompt = `You are a NAAC improvement strategist. The institution currently has a CGPA of ${currentCgpa} and grade ${currentGrade}. They want to reach ${cleanTargetGrade} (Target CGPA: ${targetCgpa}).

Analyze:
1. Which criteria have the biggest gap between current and ideal score
2. Which specific metrics within each criterion need improvement
3. Which improvements are feasible in 6 months
4. Which improvements require 12-24 months
5. What is the realistic timeline to achieve the target
6. What evidence each improvement requires

Return valid JSON with exactly this format:
{
  "currentCgpa": ${currentCgpa},
  "targetCgpa": ${targetCgpa},
  "gap": ${gap},
  "priorityCriteria": [
    {
      "criterion": 3,
      "name": "Research, Innovations and Extension",
      "currentScore": 2.9,
      "targetScore": 3.6,
      "gapPoints": 0.7,
      "improvementActions": [
        { "action": "Launch Seed Money Scheme for PhD Faculty", "effort": "medium", "timelineMonths": 6, "evidenceRequired": "Sanction letters and bank transfers" }
      ]
    }
  ],
  "quickWins": ["action 1", "action 2", "action 3"],
  "mediumTerm": ["action 1", "action 2", "action 3"],
  "longTerm": ["action 1", "action 2", "action 3"],
  "realisticTargetDate": "12-18 months",
  "effortLevel": "high"|"medium"|"low",
  "estimatedTotalInvestment": "string"
}`

    try {
      const ai = createAIProvider()
      const response = await ai.chat(
        [{ role: 'user', content: prompt }],
        'You are a senior accreditation consultant. Output valid JSON.'
      )

      const parsed = safeParseJson(response, null)
      if (parsed && Array.isArray(parsed.quickWins) && parsed.quickWins.length > 0) {
        if (Array.isArray(parsed.priorityCriteria) && parsed.priorityCriteria.length > 0) {
          // Keep enriched priority criteria if valid
          priorityCriteria.splice(0, priorityCriteria.length, ...parsed.priorityCriteria)
        }
        quickWins = parsed.quickWins
        mediumTerm = Array.isArray(parsed.mediumTerm) ? parsed.mediumTerm : mediumTerm
        longTerm = Array.isArray(parsed.longTerm) ? parsed.longTerm : longTerm
        realisticTargetDate = parsed.realisticTargetDate || realisticTargetDate
        effortLevel = parsed.effortLevel || effortLevel
        estimatedTotalInvestment = parsed.estimatedTotalInvestment || estimatedTotalInvestment
      }
    } catch (err) {
      logger.warn({ err }, 'AI provider error during improvement planning, using deterministic model')
    }
  }

  const result = {
    currentCgpa,
    currentGrade,
    targetCgpa,
    targetGrade: cleanTargetGrade,
    gap,
    priorityCriteria,
    quickWins,
    mediumTerm,
    longTerm,
    realisticTargetDate,
    effortLevel,
    estimatedTotalInvestment,
  }

  // 3. Save to naac_improvement_plans
  try {
    await NaacInsightsRepository.saveImprovementPlan({
      institutionId: parsedInstId,
      userId,
      currentGrade,
      currentCgpa,
      targetGrade: cleanTargetGrade,
      targetCgpa,
      gapAnalysis: { gap, priorityCriteria },
      roadmap: { quickWins, mediumTerm, longTerm },
      timelineMonths: isImpossible ? 0 : gap > 0.4 ? 18 : 12,
      estimatedEffort: effortLevel,
    })
  } catch (err) {
    logger.error({ err }, 'Failed saving improvement plan to repository')
  }

  return result
}

export default {
  generateImprovementPlan,
}
