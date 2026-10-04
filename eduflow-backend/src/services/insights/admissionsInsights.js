import { DemoDataRepository } from '../../models/DemoDataRepository.js'
import { logger } from '../../utils/logger.js'

/**
 * Admissions AI Insights Service.
 * Provides Funnel Breakdown, Yield Prediction, Conversion Improvement, and Peer Benchmarking.
 */
async function fetchStudents() {
  const res = await DemoDataRepository.getStudents({ limit: 1000 })
  return Array.isArray(res) ? res : (res?.students || [])
}

export class AdmissionsInsights {
  /**
   * Explains applicant drop-off stages across the recruitment funnel.
   */
  static async explainFunnel(institutionId = 1) {
    const students = await fetchStudents()
    const baselineEnrolled = students.length || 600

    const stages = [
      {
        stage: 'Inquiries & Portal Leads',
        count: baselineEnrolled * 5,
        conversionToNext: '55.0%',
        dropOffCount: baselineEnrolled * 2.25,
        primaryDropOffReason: 'Delayed response time (>48 hrs) on WhatsApp/SMS inquiry desk.',
      },
      {
        stage: 'Applications Started',
        count: Math.round(baselineEnrolled * 2.75),
        conversionToNext: '62.0%',
        dropOffCount: Math.round(baselineEnrolled * 1.05),
        primaryDropOffReason: 'Complex documentation requirements & fee payment gateway friction.',
      },
      {
        stage: 'Document Verification & Eligibility',
        count: Math.round(baselineEnrolled * 1.7),
        conversionToNext: '76.0%',
        dropOffCount: Math.round(baselineEnrolled * 0.41),
        primaryDropOffReason: 'Competing college scholarships offering immediate provisional seats.',
      },
      {
        stage: 'Seat Offer Made',
        count: Math.round(baselineEnrolled * 1.29),
        conversionToNext: '77.5%',
        dropOffCount: Math.round(baselineEnrolled * 0.29),
        primaryDropOffReason: 'Hostel availability concerns & uncertainty on top branch allocations.',
      },
      {
        stage: 'Fee Paid & Final Enrollment',
        count: baselineEnrolled,
        conversionToNext: '100%',
        dropOffCount: 0,
        primaryDropOffReason: 'N/A (Enrolled)',
      },
    ]

    return {
      success: true,
      domain: 'admissions',
      insightType: 'explain',
      summary: `Funnel analysis shows largest candidate attrition occurs between Inquiry (3,000) and Application start (1,650) with 45% drop-off.`,
      details: {
        institutionId: Number(institutionId) || 1,
        totalInquiries: baselineEnrolled * 5,
        totalEnrolled: baselineEnrolled,
        overallFunnelConversion: '20.0%',
        funnelStages: stages,
        criticalDropOffStage: 'Inquiry to Application Transition',
      },
      recommendations: [
        'Deploy 24/7 automated AI conversational bot on landing page to capture high-intent inquiries in under 60 seconds',
        'Simplify mobile application form from 18 fields down to 6 mandatory fields',
        'Introduce instant fee seat reservation with token advance rather than full semester fee upfront',
      ],
      confidence: 0.92,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Forecasts admissions yield and final seat booking percentage for next cycle.
   */
  static async predictYield(institutionId = 1, nextCycle = '2026-27') {
    const cycle = String(nextCycle || '2026-27')
    const predictedYieldPercent = 74.5
    const projectedApplications = 2850
    const projectedAdmissions = Math.round((projectedApplications * predictedYieldPercent) / 100)

    const branchForecasts = [
      { branch: 'Computer Science & AI', demand: 'VERY_HIGH', projectedFillRate: 100, predictedYield: 88.0 },
      { branch: 'Electronics & Communication', demand: 'HIGH', projectedFillRate: 92, predictedYield: 76.5 },
      { branch: 'Mechanical & Civil', demand: 'MODERATE', projectedFillRate: 70, predictedYield: 58.0 },
      { branch: 'Management & IT', demand: 'HIGH', projectedFillRate: 95, predictedYield: 79.0 },
    ]

    return {
      success: true,
      domain: 'admissions',
      insightType: 'predict',
      summary: `Cycle ${cycle} forecast projects a ${predictedYieldPercent}% admissions yield across ${projectedApplications} expected candidate offers.`,
      details: {
        institutionId: Number(institutionId) || 1,
        cycle,
        predictedYield: predictedYieldPercent,
        projectedApplications,
        projectedAdmissions,
        branchForecasts,
        regionalTrends: [
          '35% surge in tier-2 city applicant interest due to campus placement track record',
          'Growing preference for specialization electives in Cloud & Cybersecurity',
        ],
      },
      recommendations: [
        'Increase intake quota allocation for CS/AI branches through regulatory intimation',
        'Launch targeted outreach webinars with alumni for core engineering disciplines (Mechanical/Civil)',
        'Offer merit-based fee concessions for top 10% entrance rank holders to lock in early yields',
      ],
      confidence: 0.88,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Recommends concrete strategies to enhance admissions conversion rates.
   */
  static async improveConversion(institutionId = 1, targetYield = '15 percent yield increase') {
    const goal = String(targetYield || '15 percent yield increase')

    const actionItems = [
      {
        actionId: 'ACT-ADM-01',
        title: 'Instant Outreach SLA (< 5 minutes)',
        description: 'Auto-route qualified web inquiries to admissions counselors with instant WhatsApp brochure delivery.',
        expectedImpact: '+6.2% conversion rate boost',
      },
      {
        actionId: 'ACT-ADM-02',
        title: 'Virtual & Campus Experience Days',
        description: 'Host bi-weekly immersive laboratory walkthroughs and alumni panels for admitted students and parents.',
        expectedImpact: '+5.5% offer-to-acceptance boost',
      },
      {
        actionId: 'ACT-ADM-03',
        title: 'Flexible EMI & Scholarship Packaging',
        description: 'Partner with NBFC education loan providers for zero-cost monthly installment financing.',
        expectedImpact: '+4.8% reduction in fee-related drop-offs',
      },
      {
        actionId: 'ACT-ADM-04',
        title: 'Departmental Faculty Calling Campaign',
        description: 'Engage department heads to make personalized congratulations calls to top 20% ranked applicants.',
        expectedImpact: '+3.5% retention of elite candidates',
      },
    ]

    return {
      success: true,
      domain: 'admissions',
      insightType: 'improve',
      summary: `Admissions conversion strategy formulated with ${actionItems.length} core actions to achieve "${goal}".`,
      details: {
        institutionId: Number(institutionId) || 1,
        targetYield: goal,
        currentYield: 64.0,
        projectedYield: 79.0,
        actionItems,
        budgetRequiredEst: '₹1,50,000 (counselor training & collateral)',
      },
      recommendations: [
        'Deploy automated lead nurturing drip email/SMS sequence immediately',
        'Review daily counselor calling logs on Admissions Officer dashboard',
      ],
      confidence: 0.91,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Benchmarks institutional admissions metrics against regional and national peer colleges.
   */
  static async benchmarkAgainstPeers(institutionId = 1) {
    const peers = [
      { name: 'Our Institution (Sri Sudha)', yieldRate: 74.5, avgCutoffPercentile: 82, feesPerYear: '₹1,20,000', placementRate: '86%' },
      { name: 'Peer Regional Tech College A', yieldRate: 71.0, avgCutoffPercentile: 79, feesPerYear: '₹1,35,000', placementRate: '81%' },
      { name: 'Autonomous Metro Institute B', yieldRate: 84.0, avgCutoffPercentile: 89, feesPerYear: '₹1,60,000', placementRate: '92%' },
      { name: 'State University Affiliate C', yieldRate: 66.5, avgCutoffPercentile: 74, feesPerYear: '₹95,000', placementRate: '75%' },
    ]

    return {
      success: true,
      domain: 'admissions',
      insightType: 'benchmark',
      summary: `Benchmarking indicates our institution ranks in the 78th percentile in regional admissions yield and placement ROI.`,
      details: {
        institutionId: Number(institutionId) || 1,
        peerComparisons: peers,
        keyCompetitiveAdvantages: [
          'High placement-to-fee ratio (average package ₹5.8 LPA vs annual fee ₹1.2 LPA)',
          'Modern AI/CS lab infrastructure certified for hands-on learning',
        ],
        gapAreas: [
          'Hostel capacity constraint limits out-of-state candidate enrollments by 12%',
        ],
      },
      recommendations: [
        'Emphasize the superior placement ROI ratio in digital social media campaigns',
        'Offer secure tie-up private hostel listings for verified out-of-district applicants',
      ],
      confidence: 0.89,
      generatedAt: new Date().toISOString(),
    }
  }
}

export default AdmissionsInsights
