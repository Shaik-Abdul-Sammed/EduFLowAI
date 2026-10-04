/**
 * Domain Registry for EduFlow AI Insights Layer.
 * Defines personas, templates, metrics, and targets for all 5 officer domains:
 * - accreditation
 * - student-success
 * - timetable
 * - admissions
 * - finance
 */

export const DOMAINS = {
  accreditation: {
    key: 'accreditation',
    name: 'Accreditation',
    displayName: 'Accreditation Officer',
    icon: 'Award',
    persona: 'Former NAAC peer team member with 15 years of experience',
    explainTemplate: 'As a {persona}, analyze the following SSR section or NAAC evidence and provide an executive summary, strengths, red flags, and action steps: {text}',
    askTemplate: 'As a {persona}, answer this question strictly based on the provided NAAC SSR and institutional metrics: {question}\nContext:\n{text}',
    predictTemplate: 'As a {persona}, evaluate institutional data for institution ID {institutionId} and predict NAAC readiness, CGPA score, grade, and peer review scrutiny concerns.',
    improveTemplate: 'As a {persona}, formulate a step-by-step grade advancement plan for institution ID {institutionId} targeting {targetGoal}.',
    metrics: [
      'CGPA',
      'grade',
      'criteria scores',
      'SSR quality',
      'evidence completeness',
    ],
    targets: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'],
  },

  'student-success': {
    key: 'student-success',
    name: 'Student Success',
    displayName: 'Student Success Officer',
    icon: 'GraduationCap',
    persona: 'Educational psychologist and student retention specialist',
    explainTemplate: 'As an {persona}, review the following student data and explain the risk factors, attendance patterns, and psychological indicators: {text}',
    askTemplate: 'As an {persona}, answer this inquiry regarding student retention and learning trajectories: {question}\nContext:\n{text}',
    predictTemplate: 'As an {persona}, assess academic performance and attendance across cohorts in institution ID {institutionId} to predict dropout risk and semester outcomes.',
    improveTemplate: 'As an {persona}, create an actionable student retention and CGPA improvement plan for institution ID {institutionId} targeting {targetGoal}.',
    metrics: [
      'dropout risk score',
      'attendance trend',
      'backlog count',
      'CGPA trajectory',
      'engagement index',
    ],
    targets: [
      'reduce dropout by 30 percent',
      'improve average CGPA by 0.5',
      'increase attendance by 10 percent',
    ],
  },

  timetable: {
    key: 'timetable',
    name: 'Timetable',
    displayName: 'Timetable Officer',
    icon: 'Calendar',
    persona: 'Operations research specialist in academic scheduling',
    explainTemplate: 'As an {persona}, analyze this timetable conflict, scheduling bottleneck, or constraint violation: {text}',
    askTemplate: 'As an {persona}, answer this scheduling inquiry and recommend optimization steps: {question}\nContext:\n{text}',
    predictTemplate: 'As an {persona}, forecast room utilization, faculty clash probability, and student gaps for institution ID {institutionId}.',
    improveTemplate: 'As an {persona}, formulate an automated schedule optimization roadmap for institution ID {institutionId} targeting {targetGoal}.',
    metrics: [
      'conflict count',
      'faculty workload balance',
      'room utilization',
      'student gaps',
    ],
    targets: [
      'zero conflicts',
      'workload within 18 hours',
      'room utilization above 85 percent',
    ],
  },

  admissions: {
    key: 'admissions',
    name: 'Admissions',
    displayName: 'Admissions Officer',
    icon: 'TrendingUp',
    persona: 'Enrollment strategy consultant for Indian higher education',
    explainTemplate: 'As an {persona}, break down this admissions funnel data, inquiry drop-off, or conversion bottleneck: {text}',
    askTemplate: 'As an {persona}, address this enrollment inquiry and suggest conversion tactics: {question}\nContext:\n{text}',
    predictTemplate: 'As an {persona}, predict upcoming cycle application volume, yield conversion rates, and branch preferences for institution ID {institutionId}.',
    improveTemplate: 'As an {persona}, develop an aggressive admissions yield optimization plan for institution ID {institutionId} targeting {targetGoal}.',
    metrics: [
      'application yield',
      'conversion rate',
      'funnel dropoff',
      'competitor comparison',
    ],
    targets: [
      '15 percent yield increase',
      '20 percent more applications',
      '10 percent lower CAC',
    ],
  },

  finance: {
    key: 'finance',
    name: 'Finance',
    displayName: 'Finance Officer',
    icon: 'DollarSign',
    persona: 'Chartered accountant specializing in educational institution finance',
    explainTemplate: 'As a {persona}, analyze this transaction variance, fee ledger discrepancy, or GST reconciliation gap: {text}',
    askTemplate: 'As a {persona}, answer this institutional finance inquiry regarding dues, budgeting, or compliance: {question}\nContext:\n{text}',
    predictTemplate: 'As a {persona}, forecast cash flow collections, defaulter trajectories, and liquidity margins for institution ID {institutionId}.',
    improveTemplate: 'As a {persona}, devise an executive fee collection and deficit-reduction roadmap for institution ID {institutionId} targeting {targetGoal}.',
    metrics: [
      'reconciliation accuracy',
      'defaulter ratio',
      'cash flow',
      'GST compliance',
    ],
    targets: [
      '95 percent reconciliation',
      '50 percent defaulter reduction',
      'zero GST mismatch',
    ],
  },

  nirf: {
    key: 'nirf',
    name: 'NIRF',
    displayName: 'NIRF Ranking Officer',
    icon: 'Trophy',
    persona: 'Former NIRF ranking committee analyst specializing in Indian higher education',
    explainTemplate: 'As a {persona}, analyze the following NIRF parameter score, sub-metric deficiency, or submission data: {text}',
    askTemplate: 'As a {persona}, answer this question regarding NIRF methodology, parameters, and ranking criteria: {question}\nContext:\n{text}',
    predictTemplate: 'As a {persona}, evaluate institutional metrics for institution ID {institutionId} and predict NIRF scores across TLR, RP, GO, OI, PR, and category rank.',
    improveTemplate: 'As a {persona}, formulate a strategic roadmap for institution ID {institutionId} to achieve target NIRF rank {targetGoal}.',
    metrics: [
      'TLR score',
      'RP score',
      'GO score',
      'OI score',
      'PR score',
      'overall NIRF rank',
      'category rank',
    ],
    targets: ['Top 100', 'Top 50', 'Top 25', 'Top 10'],
    parameters: {
      TLR: {
        weight: 0.30,
        name: 'Teaching, Learning and Resources',
        subMetrics: {
          SS: { name: 'Student Strength including Doctoral Students', weight: 0.20 },
          FSR: { name: 'Faculty-Student Ratio with emphasis on permanent faculty', weight: 0.30 },
          FQE: { name: 'Faculty with PhD and Experience', weight: 0.20 },
          FRU: { name: 'Financial Resources and their Utilisation', weight: 0.30 },
        },
      },
      RP: {
        weight: 0.30,
        name: 'Research and Professional Practice',
        subMetrics: {
          PU: { name: 'Combined Metric for Publications', weight: 0.35 },
          QP: { name: 'Quality of Publications', weight: 0.35 },
          IPR: { name: 'IPR and Patents: Published and Granted', weight: 0.15 },
          FPPP: { name: 'Footprint of Projects and Professional Practice', weight: 0.15 },
        },
      },
      GO: {
        weight: 0.20,
        name: 'Graduation Outcomes',
        subMetrics: {
          GPH: { name: 'Combined Metric for Placement and Higher Studies', weight: 0.40 },
          GUE: { name: 'Metric for University Examinations', weight: 0.15 },
          GMS: { name: 'Median Salary', weight: 0.25 },
          GPHD: { name: 'Metric for Number of PhD Students Graduated', weight: 0.20 },
        },
      },
      OI: {
        weight: 0.10,
        name: 'Outreach and Inclusivity',
        subMetrics: {
          RD: { name: 'Percentage of Students from Other States/Countries', weight: 0.30 },
          WD: { name: 'Percentage of Women Students', weight: 0.25 },
          ESCS: { name: 'Economically and Socially Challenged Students', weight: 0.20 },
          PCS: { name: 'Facilities for Physically Challenged Students', weight: 0.25 },
        },
      },
      PR: {
        weight: 0.10,
        name: 'Perception',
        subMetrics: {
          PR: { name: 'Peer Perception: Academic Peers and Employers', weight: 1.00 },
        },
      },
    },
  },
}

/**
 * Retrieves a domain configuration by key.
 * Returns null if domain is unknown.
 * @param {string} key
 * @returns {object|null}
 */
export function getDomain(key) {
  if (!key || typeof key !== 'string') return null
  const normalizedKey = key.trim().toLowerCase()
  return DOMAINS[normalizedKey] || null
}

/**
 * Returns list of all 5 domain configurations.
 * @returns {Array<object>}
 */
export function getAllDomains() {
  return Object.values(DOMAINS)
}

/**
 * Checks if a domain key is recognized in the registry.
 * @param {string} key
 * @returns {boolean}
 */
export function isValidDomain(key) {
  return !!getDomain(key)
}

export default {
  DOMAINS,
  getDomain,
  getAllDomains,
  isValidDomain,
}
