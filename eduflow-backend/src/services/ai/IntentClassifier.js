/**
 * Fast Intent Classifier and Sub-Agent Router.
 * Classifies prompts into:
 * - REPORT_GENERATION (SSR, compliance drafts, accreditation files, NIRF dossiers)
 * - DATA_QUERY (CGPA, attendance, fee dues, room availability, enrollment counts)
 * - GENERAL_QUESTION (definitions, guidance, policy advice, general Q&A)
 *
 * Routes to target sub-agent:
 * - accreditation, student-success, timetable, admissions, finance, or nirf
 */

export class IntentClassifier {
  /**
   * Classify user prompt intent and target sub-agent.
   *
   * @param {string} prompt
   * @param {object} context
   * @returns {{ intent: 'REPORT_GENERATION'|'DATA_QUERY'|'GENERAL_QUESTION', targetDomain: string, subAgent: string, confidence: number, reasoning: string, extractedParams: object }}
   */
  static classify(prompt = '', context = {}) {
    const raw = String(prompt || '').trim()
    const lower = raw.toLowerCase()

    // 1. Intent Detection Keywords & Patterns
    const reportPatterns = [
      /generate\s+(?:naac|ssr|report|dossier|analysis|criteria|plan)/i,
      /\b(export|create|draft|prepare|compile)\b.*\b(report|ssr|analysis|dossier)\b/i,
      /\b(criterion\s+[1-7]|ssr\s+analysis|accreditation\s+report)\b/i,
      /\b(action\s+plan|improvement\s+plan|annual\s+report)\b/i,
    ]

    const dataQueryPatterns = [
      /\b(how\s+many|what\s+is\s+the|count\s+of|list\s+of|show\s+me|find|who\s+are)\b/i,
      /\b(at-risk|risk|cgpa|attendance|defaulters?|overdue|clashes?|room|seats?|intake|enrollment)\b/i,
      /\b(stats|numbers?|metrics?|figures?|balance|dues?)\b/i,
    ]

    let intent = 'GENERAL_QUESTION'
    let confidence = 0.85
    let matchedPattern = 'default general fallback'

    const isReport = reportPatterns.some(p => p.test(lower))
    const isDataQuery = dataQueryPatterns.some(p => p.test(lower))

    if (isReport && !lower.startsWith('what is') && !lower.startsWith('explain')) {
      intent = 'REPORT_GENERATION'
      confidence = 0.95
      matchedPattern = 'report generation pattern matched'
    } else if (isDataQuery) {
      intent = 'DATA_QUERY'
      confidence = 0.92
      matchedPattern = 'database query pattern matched'
    } else if (lower.includes('?') || lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('explain') || lower.startsWith('can you')) {
      intent = 'GENERAL_QUESTION'
      confidence = 0.90
      matchedPattern = 'inquiry question pattern matched'
    }

    // 2. Sub-Agent Domain Determination
    let targetDomain = context.officerType || context.domain || 'accreditation'

    if (lower.includes('naac') || lower.includes('ssr') || lower.includes('criteria') || lower.includes('accredit') || lower.includes('nba')) {
      targetDomain = 'accreditation'
    } else if (lower.includes('student') || lower.includes('dropout') || lower.includes('cgpa') || lower.includes('attendance') || lower.includes('at-risk') || lower.includes('retention')) {
      targetDomain = 'student-success'
    } else if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('clash') || lower.includes('slot') || lower.includes('room') || lower.includes('hall')) {
      targetDomain = 'timetable'
    } else if (lower.includes('admission') || lower.includes('applicant') || lower.includes('inquiry') || lower.includes('funnel') || lower.includes('yield') || lower.includes('seat')) {
      targetDomain = 'admissions'
    } else if (lower.includes('fee') || lower.includes('finance') || lower.includes('defaulter') || lower.includes('invoice') || lower.includes('arrear') || lower.includes('dues') || lower.includes('reconcil')) {
      targetDomain = 'finance'
    } else if (lower.includes('nirf') || lower.includes('rank') || lower.includes('peer') || lower.includes('benchmark')) {
      targetDomain = 'nirf'
    }

    // 3. Sub-agent router mapping
    const subAgentMap = {
      accreditation: 'AccreditationOfficerSubAgent',
      'student-success': 'StudentSuccessOfficerSubAgent',
      timetable: 'TimetableOfficerSubAgent',
      admissions: 'AdmissionOfficerSubAgent',
      finance: 'FinanceOfficerSubAgent',
      nirf: 'NirfOfficerSubAgent',
    }

    // 4. Extract parameters
    const extractedParams = {}
    const critMatch = lower.match(/criterion\s*([1-7])/i) || lower.match(/criteria\s*([1-7])/i)
    if (critMatch) extractedParams.criterion = Number(critMatch[1])

    const deptMatch = lower.match(/\b(cse|ece|me|civil|eee|it|mca|mba)\b/i)
    if (deptMatch) extractedParams.department = deptMatch[1].toUpperCase()

    return {
      intent,
      targetDomain,
      subAgent: subAgentMap[targetDomain] || 'GeneralOfficerSubAgent',
      confidence,
      reasoning: matchedPattern,
      extractedParams,
    }
  }
}

export default IntentClassifier
