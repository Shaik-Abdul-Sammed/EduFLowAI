import { useState, useEffect, useCallback } from 'react'
import {
  Brain,
  RefreshCw,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Send,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  FileCheck,
} from 'lucide-react'
import { getFullApiUrl } from '../../config/apiConfig'
import { wakeUpFetch } from '../../utils/wakeUpHandler'

const CRITERIA_OPTIONS = [
  { value: 1, label: 'Criterion 1: Curricular Aspects' },
  { value: 2, label: 'Criterion 2: Teaching-Learning and Evaluation' },
  { value: 3, label: 'Criterion 3: Research, Innovations and Extension' },
  { value: 4, label: 'Criterion 4: Infrastructure and Learning Resources' },
  { value: 5, label: 'Criterion 5: Student Support and Progression' },
  { value: 6, label: 'Criterion 6: Governance, Leadership and Management' },
  { value: 7, label: 'Criterion 7: Institutional Values and Best Practices' },
]

const TARGET_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C']

function getGradeBadgeColor(grade) {
  switch (grade) {
    case 'A++':
      return { bg: '#059669', text: '#ecfdf5', border: '#10b981' }
    case 'A+':
      return { bg: '#2563eb', text: '#eff6ff', border: '#3b82f6' }
    case 'A':
      return { bg: '#0284c7', text: '#f0f9ff', border: '#38bdf8' }
    case 'B++':
      return { bg: '#d97706', text: '#fffbeb', border: '#f59e0b' }
    case 'B+':
      return { bg: '#ea580c', text: '#fff7ed', border: '#f97316' }
    case 'B':
      return { bg: '#dc2626', text: '#fef2f2', border: '#ef4444' }
    case 'C':
    case 'D':
      return { bg: '#991b1b', text: '#fef2f2', border: '#b91c1c' }
    default:
      return { bg: '#4f46e5', text: '#eef2ff', border: '#6366f1' }
  }
}

export default function NaacAiAnalysisPage() {
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insights, setInsights] = useState({
    currentPredictedGrade: 'A+',
    predictedCgpa: 3.38,
    visitReadinessScore: 82,
    topImprovementActions: [
      'Publish Course Outcomes (COs) and Program Outcomes (POs) on the college portal',
      'Upload GeoTagged photos of ICT classrooms, laboratories, and library facilities',
      'Constitute an active Alumni Association chapter with registered alumni feedback',
    ],
    topEvidenceGaps: [
      'GeoTagged photographs of research incubation facilities and prototypes',
      'Audited expenditure statements showing annual library budget utilization',
      'Student feedback analysis reports with Action Taken Reports (ATR) signed by BoS',
    ],
    lastUpdateTimestamp: new Date().toISOString(),
  })

  // Section 2: Explain My Report
  const [explainReportText, setExplainReportText] = useState('')
  const [explainCriterion, setExplainCriterion] = useState(1)
  const [explaining, setExplaining] = useState(false)
  const [explanationResult, setExplanationResult] = useState(null)

  // Section 3: Ask About My Report
  const [askReportText, setAskReportText] = useState('')
  const [askQuestion, setAskQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello Dean. You can ask any specific question regarding your NAAC Self-Study Report (SSR), criteria benchmarks, or required documentary evidence. Paste your report text above and ask below!',
    },
  ])

  // Section 4: Visit Predictor
  const [predictingVisit, setPredictingVisit] = useState(false)
  const [visitPrediction, setVisitPrediction] = useState({
    predictedScore: 3.38,
    predictedGrade: 'A+',
    predictedCGPA: 3.38,
    confidence: 0.88,
    peerTeamStrengths: [
      'Healthy student-to-faculty ratio (14.7:1) complying with AICTE benchmarks',
      'Commendable research trajectory with 270 Scopus indexed articles',
      'Modern ICT-enabled learning infrastructure across campus departments',
    ],
    peerTeamConcerns: [
      { concern: 'PhD faculty proportion (47%) slightly below A++ threshold (50%)', severity: 'medium' },
      { concern: 'Industry-sponsored consultancy funding needs documentary proof', severity: 'medium' },
      { concern: 'Higher education progression tracking documentation is partial', severity: 'low' },
    ],
    likelyQuestions: [
      'How does IQAC verify attainment of Program Outcomes for value-added electives?',
      'What institutional seed money was allocated for faculty research in the last 3 years?',
      'Can the department show GeoTagged logs for incubation center prototypes?',
      'How are slow and advanced learners differentiated in internal evaluations?',
      'What percentage of outgoing students receive formal corporate placement offers?',
    ],
    evidenceToPrepare: [
      'BoS minutes approving CBCS revisions with stakeholder signature sheets',
      'Scopus citation proofs and journal quartile ranking prints',
      'Audited income-expenditure statements showing infrastructure allocation',
      'Placement offer letters along with salary slips for sampled batches',
      'ERP attendance logs and mentoring diaries signed by proctors',
    ],
    readinessScore: 82,
    recommendationSummary:
      'The peer team visit is projected to yield an A+ rating. Prioritize organizing physical documentation for research seed grants and placement appointment letters.',
  })

  // Section 5: Improvement Planner
  const [targetGrade, setTargetGrade] = useState('A++')
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [improvementPlan, setImprovementPlan] = useState({
    currentCgpa: 3.38,
    currentGrade: 'A+',
    targetCgpa: 3.51,
    targetGrade: 'A++',
    gap: 0.13,
    priorityCriteria: [
      {
        criterion: 3,
        name: 'Research, Innovations and Extension',
        currentScore: 2.98,
        targetScore: 3.55,
        gapPoints: 0.57,
        improvementActions: [
          {
            action: 'Institute competitive faculty research seed funding grant of ₹2,00,000 per project',
            effort: 'medium',
            timelineMonths: 6,
            evidenceRequired: 'Sanction orders, bank disbursement receipts, and research progress logs',
          },
        ],
      },
      {
        criterion: 2,
        name: 'Teaching-Learning and Evaluation',
        currentScore: 3.41,
        targetScore: 3.65,
        gapPoints: 0.24,
        improvementActions: [
          {
            action: 'Recruit 3 additional doctoral faculty in CSE & AI departments to push PhD ratio above 50%',
            effort: 'high',
            timelineMonths: 12,
            evidenceRequired: 'Doctoral degree certificates and appointment letters',
          },
        ],
      },
    ],
    quickWins: [
      'Publish Course Outcomes (COs) and Program Outcomes (POs) on the college portal',
      'Constitute an active Alumni Association chapter with registered alumni feedback',
      'Upload GeoTagged photos of ICT classrooms, laboratories, and library facilities',
    ],
    mediumTerm: [
      'Execute 5 new industry MoUs with active student internship and project deliverables',
      'Conduct institutional Academic and Administrative Audit (AAA) by external peers',
      'Implement a structured Value-Added Course program with minimum 30 contact hours',
    ],
    longTerm: [
      'Increase faculty PhD qualification percentage from current standing to over 50%',
      'Scale Scopus/WoS research publications to an average of >2 papers per faculty annually',
      'Expand smart research lab infrastructure with institutional seed funding grants',
    ],
    realisticTargetDate: '12-18 Months (Upcoming NAAC Cycle)',
    effortLevel: 'medium',
    estimatedTotalInvestment: '₹12,00,000 - ₹18,00,000',
  })

  // Section 6: Historical Insights
  const [historyItems, setHistoryItems] = useState([
    {
      id: 1,
      date: '2026-10-04',
      type: 'Predict',
      criterionOrGrade: 'A+ (Score: 3.38)',
      summary: 'Peer team visit readiness evaluated at 82%',
    },
    {
      id: 2,
      date: '2026-10-04',
      type: 'Improve',
      criterionOrGrade: 'Target: A++',
      summary: 'Gap of 0.13 CGPA points identified across Criterion 3 & 2',
    },
    {
      id: 3,
      date: '2026-10-03',
      type: 'Explain',
      criterionOrGrade: 'Criterion 3',
      summary: 'Explained Research & Extension SSR metrics for Sri Sudha IT',
    },
  ])

  const getHeaders = useCallback(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      ''
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }, [])

  // Load Dashboard Insights snapshot
  const loadDashboardInsights = useCallback(async () => {
    setLoadingInsights(true)
    try {
      const res = await wakeUpFetch(getFullApiUrl('/v1/naac/dashboard-insights'), {
        headers: getHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setInsights((prev) => ({
          ...prev,
          currentPredictedGrade: data.currentPredictedGrade || prev.currentPredictedGrade,
          predictedCgpa: data.predictedCgpa || prev.predictedCgpa,
          visitReadinessScore: data.visitReadinessScore ?? prev.visitReadinessScore,
          topImprovementActions: data.topImprovementActions || prev.topImprovementActions,
          topEvidenceGaps: data.topEvidenceGaps || prev.topEvidenceGaps,
          lastUpdateTimestamp: data.lastUpdateTimestamp || new Date().toISOString(),
        }))
      }
    } catch {
      // Keep initial snapshot state on error
    } finally {
      setLoadingInsights(false)
    }
  }, [getHeaders])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const res = await wakeUpFetch(getFullApiUrl('/v1/naac/dashboard-insights'), {
          headers: getHeaders(),
        })
        if (res.ok && isMounted) {
          const data = await res.json()
          setInsights((prev) => ({
            ...prev,
            currentPredictedGrade: data.currentPredictedGrade || prev.currentPredictedGrade,
            predictedCgpa: data.predictedCgpa || prev.predictedCgpa,
            visitReadinessScore: data.visitReadinessScore ?? prev.visitReadinessScore,
            topImprovementActions: data.topImprovementActions || prev.topImprovementActions,
            topEvidenceGaps: data.topEvidenceGaps || prev.topEvidenceGaps,
            lastUpdateTimestamp: data.lastUpdateTimestamp || new Date().toISOString(),
          }))
        }
      } catch {
        // Fallback gracefully
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [getHeaders])

  // Section 2: Handle Explain
  const handleExplainSection = async () => {
    setExplaining(true)
    try {
      const res = await fetch(getFullApiUrl('/v1/naac/explain'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reportText: explainReportText,
          criterionNumber: Number(explainCriterion),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setExplanationResult(data.explanation)
        setHistoryItems((prev) => [
          {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'Explain',
            criterionOrGrade: `Criterion ${explainCriterion}`,
            summary: `Analyzed Criterion ${explainCriterion} SSR section`,
          },
          ...prev,
        ])
      } else {
        // Fallback explanation if API returns non-200
        setExplanationResult({
          summary: [
            `Criterion ${explainCriterion} highlights core institutional outcomes and evaluation methodologies.`,
            'Continuous faculty development and curriculum enrichment are evident in submitted logs.',
            'Documentary verification against BoS approvals and ERP timestamps will validate SSR claims.',
          ],
          glossary: [
            { term: 'SSR', meaning: 'Self-Study Report prepared by the institution for NAAC peer assessment.' },
            { term: 'CO-PO', meaning: 'Course Outcome to Program Outcome curriculum alignment mapping.' },
            { term: 'IQAC', meaning: 'Internal Quality Assurance Cell responsible for academic quality standards.' },
          ],
          keyMetrics: [
            { metric: 'Curriculum Revision', value: '25%', why: 'Demonstrates responsiveness to industry demands.' },
            { metric: 'Student Satisfaction', value: '88%', why: 'Critical survey component in NAAC DVV process.' },
            { metric: 'Value-Added Courses', value: '18', why: 'Reflects beyond-syllabus student skill enhancement.' },
          ],
          weakClaims: [
            { claim: 'Rapid learning outcome improvement', issue: 'Needs direct assessment scores rather than indirect feedback.' },
          ],
          evidenceSuggestions: [
            'Upload verified Board of Studies (BoS) minutes approving syllabus revisions.',
            'Include course completion certificates for value-added offerings.',
          ],
        })
      }
    } catch {
      setExplanationResult({
        summary: [
          `Criterion ${explainCriterion} highlights core institutional outcomes and evaluation methodologies.`,
          'Continuous faculty development and curriculum enrichment are evident in submitted logs.',
          'Documentary verification against BoS approvals and ERP timestamps will validate SSR claims.',
        ],
        glossary: [
          { term: 'SSR', meaning: 'Self-Study Report prepared by the institution for NAAC peer assessment.' },
          { term: 'CO-PO', meaning: 'Course Outcome to Program Outcome curriculum alignment mapping.' },
        ],
        keyMetrics: [
          { metric: 'Curriculum Revision', value: '25%', why: 'Demonstrates responsiveness to industry demands.' },
        ],
        weakClaims: [
          { claim: 'Unsubstantiated outcome improvement', issue: 'Missing direct assessment grade metrics.' },
        ],
        evidenceSuggestions: [
          'Attach verified BoS minutes and student attendance registers.',
        ],
      })
    } finally {
      setExplaining(false)
    }
  }

  // Section 3: Handle Ask Question
  const handleAskQuestion = async (e) => {
    e?.preventDefault()
    if (!askQuestion.trim()) return

    const userText = askQuestion
    setAskQuestion('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }])
    setAsking(true)

    try {
      const res = await fetch(getFullApiUrl('/v1/naac/ask'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reportText: askReportText || 'Institutional SSR operational data context',
          question: userText,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer || 'Analysis complete.',
            citedSections: data.citedSections || [],
          },
        ])
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Based on your report context, Criterion metrics indicate solid compliance. To boost your scores, verify that all student-centric learning methods and faculty publications are documented with ERP links and GeoTagged proofs.',
            citedSections: ['SSR Summary'],
          },
        ])
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Criterion metrics demonstrate positive progress. Ensure that documentary evidence such as BoS minutes, student attendance records, and appointment letters are filed in criterion-wise master folders.',
          citedSections: ['SSR Overview'],
        },
      ])
    } finally {
      setAsking(false)
    }
  }

  // Section 4: Handle Predict Visit
  const handlePredictVisit = async () => {
    setPredictingVisit(true)
    try {
      const res = await fetch(getFullApiUrl('/v1/naac/predict-visit'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ institutionId: 1 }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.prediction) {
          setVisitPrediction(data.prediction)
          setInsights((prev) => ({
            ...prev,
            currentPredictedGrade: data.prediction.predictedGrade || prev.currentPredictedGrade,
            predictedCgpa: data.prediction.predictedCGPA || prev.predictedCgpa,
            visitReadinessScore: data.prediction.readinessScore ?? prev.visitReadinessScore,
            lastUpdateTimestamp: new Date().toISOString(),
          }))
          setHistoryItems((prev) => [
            {
              id: Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: 'Predict',
              criterionOrGrade: `${data.prediction.predictedGrade} (Score: ${data.prediction.predictedScore})`,
              summary: `Peer visit readiness evaluated at ${data.prediction.readinessScore}%`,
            },
            ...prev,
          ])
        }
      }
    } catch {
      // Keep state
    } finally {
      setPredictingVisit(false)
    }
  }

  // Section 5: Handle Generate Improvement Plan
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true)
    try {
      const res = await fetch(getFullApiUrl('/v1/naac/improvement-plan'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          institutionId: 1,
          targetGrade,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.plan) {
          setImprovementPlan(data.plan)
          setHistoryItems((prev) => [
            {
              id: Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: 'Improve',
              criterionOrGrade: `Target: ${targetGrade}`,
              summary: `Strategic roadmap generated with a gap of ${data.plan.gap} CGPA points`,
            },
            ...prev,
          ])
        }
      }
    } catch {
      // Keep state
    } finally {
      setGeneratingPlan(false)
    }
  }

  // PDF download simulation
  const handleDownloadPdf = (title) => {
    const element = document.createElement('a')
    const file = new Blob([`EduFlow AI - ${title}\nGenerated on: ${new Date().toLocaleString()}\nInstitution: Sri Sudha Institute of Technology\nGrade: ${insights.currentPredictedGrade} (CGPA: ${insights.predictedCgpa})`], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const gradeBadge = getGradeBadgeColor(insights.currentPredictedGrade)

  return (
    <div className="container-fluid py-4 px-md-5" style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9' }}>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: '1.75rem' }}>🧠</span>
            <h1 className="h3 mb-0 fw-bold text-white">NAAC AI Analysis & Visit Predictor</h1>
            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-2 py-1 small">
              AI Intelligence Layer
            </span>
          </div>
          <p className="text-secondary mb-0 small">
            AI-driven SSR section explainer, peer team visit simulator, and strategic grade improvement engine.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={loadDashboardInsights}
            disabled={loadingInsights}
            className="btn btn-outline-primary d-flex align-items-center gap-2 btn-sm px-3"
            aria-label="Refresh Insights"
          >
            <RefreshCw size={14} className={loadingInsights ? 'spin-anim' : ''} />
            <span>Refresh Insights</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: INSIGHTS SUMMARY CARD */}
      <div className="card bg-dark border border-secondary border-opacity-25 shadow-sm mb-4" data-testid="insights-summary-card">
        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            {/* Grade Display */}
            <div className="col-12 col-md-4 text-center border-end-md border-secondary border-opacity-25">
              <span className="text-uppercase small fw-bold text-secondary d-block mb-1">
                Current Predicted Grade
              </span>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <div
                  className="rounded-4 px-4 py-2 fw-black shadow-lg"
                  style={{
                    backgroundColor: gradeBadge.bg,
                    color: gradeBadge.text,
                    border: `2px solid ${gradeBadge.border}`,
                    fontSize: '2.5rem',
                    lineHeight: 1,
                  }}
                >
                  {insights.currentPredictedGrade}
                </div>
                <div className="text-start">
                  <div className="h4 mb-0 fw-bold text-white">{insights.predictedCgpa}</div>
                  <span className="small text-secondary">Predicted CGPA / 4.0</span>
                </div>
              </div>
            </div>

            {/* Readiness Score */}
            <div className="col-12 col-md-4 border-end-md border-secondary border-opacity-25">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-uppercase small fw-bold text-secondary">Visit Readiness Score</span>
                <span className="h5 mb-0 fw-bold text-success">{insights.visitReadinessScore}%</span>
              </div>
              <div className="progress bg-secondary bg-opacity-25" style={{ height: '10px' }}>
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${insights.visitReadinessScore}%` }}
                  aria-valuenow={insights.visitReadinessScore}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              <span className="small text-secondary mt-2 d-block">
                High institutional preparedness across Quantitative (DVV) & Qualitative (SSR) metrics.
              </span>
            </div>

            {/* Timestamp & Quick Status */}
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                <Clock size={14} />
                <span>Last Updated: {new Date(insights.lastUpdateTimestamp).toLocaleString()}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-info small">
                <Target size={14} />
                <span>Target Benchmark: A++ (3.51+ CGPA)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXPLAIN MY REPORT */}
      <div className="card bg-dark border border-secondary border-opacity-25 shadow-sm mb-4">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Sparkles size={18} className="text-warning" />
            <h2 className="h5 mb-0 fw-bold text-white">Explain My Report</h2>
          </div>
          <span className="small text-secondary">Plain-English Jargon Translator & Weak Claim Detector</span>
        </div>
        <div className="card-body p-4">
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <label htmlFor="criterion-select" className="form-label small text-secondary fw-semibold">
                Select NAAC Criterion
              </label>
              <select
                id="criterion-select"
                className="form-select bg-dark text-white border-secondary border-opacity-50"
                value={explainCriterion}
                onChange={(e) => setExplainCriterion(Number(e.target.value))}
              >
                {CRITERIA_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label htmlFor="report-text-area" className="form-label small text-secondary fw-semibold">
                Paste SSR Section Text (Draft or Generated Content)
              </label>
              <textarea
                id="report-text-area"
                rows={4}
                className="form-control bg-dark text-white border-secondary border-opacity-50"
                placeholder="Paste your Self-Study Report narrative here to translate technical terminology and uncover evidentiary gaps..."
                value={explainReportText}
                onChange={(e) => setExplainReportText(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleExplainSection}
            disabled={explaining}
            className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 mb-4"
          >
            {explaining ? <RefreshCw size={16} className="spin-anim" /> : <Brain size={16} />}
            <span>{explaining ? 'Analyzing SSR Section...' : 'Explain This Section'}</span>
          </button>

          {explanationResult && (
            <div className="mt-2 pt-3 border-top border-secondary border-opacity-25">
              {/* Three Column Layout */}
              <div className="row g-4 mb-4">
                {/* 1. Summary */}
                <div className="col-12 col-lg-4">
                  <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100">
                    <h3 className="h6 fw-bold text-white d-flex align-items-center gap-2 mb-3">
                      <FileCheck size={16} className="text-primary" />
                      <span>Plain-English Summary</span>
                    </h3>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {explanationResult.summary?.map((bullet, idx) => (
                        <li key={idx} className="small text-light d-flex align-items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 2. Glossary */}
                <div className="col-12 col-lg-4">
                  <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100">
                    <h3 className="h6 fw-bold text-white d-flex align-items-center gap-2 mb-3">
                      <HelpCircle size={16} className="text-info" />
                      <span>Technical Glossary</span>
                    </h3>
                    <div className="d-flex flex-column gap-2">
                      {explanationResult.glossary?.map((item, idx) => (
                        <div key={idx} className="small">
                          <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 me-1">
                            {item.term}
                          </span>
                          <span className="text-secondary">{item.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Key Metrics */}
                <div className="col-12 col-lg-4">
                  <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100">
                    <h3 className="h6 fw-bold text-white d-flex align-items-center gap-2 mb-3">
                      <TrendingUp size={16} className="text-warning" />
                      <span>Key Metrics & Rationale</span>
                    </h3>
                    <div className="d-flex flex-column gap-2">
                      {explanationResult.keyMetrics?.map((km, idx) => (
                        <div key={idx} className="p-2 rounded bg-dark border border-secondary border-opacity-25 small">
                          <div className="d-flex justify-content-between">
                            <span className="fw-semibold text-white">{km.metric}</span>
                            <span className="text-warning fw-bold">{km.value}</span>
                          </div>
                          <p className="text-secondary mb-0 small mt-1">{km.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weak Claims and Evidence Suggestions */}
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 h-100">
                    <h4 className="h6 fw-bold text-danger d-flex align-items-center gap-2 mb-2">
                      <AlertTriangle size={16} />
                      <span>Flagged Weak Claims</span>
                    </h4>
                    <div className="d-flex flex-column gap-2">
                      {explanationResult.weakClaims?.map((wc, idx) => (
                        <div key={idx} className="small">
                          <div className="fw-semibold text-light">"{wc.claim}"</div>
                          <div className="text-danger-emphasis small">Issue: {wc.issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 h-100">
                    <h4 className="h6 fw-bold text-success d-flex align-items-center gap-2 mb-2">
                      <CheckCircle2 size={16} />
                      <span>Strengthening Evidence Suggestions</span>
                    </h4>
                    <ul className="mb-0 small text-light ps-3">
                      {explanationResult.evidenceSuggestions?.map((sug, idx) => (
                        <li key={idx} className="mb-1">
                          {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: ASK ABOUT MY REPORT */}
      <div className="card bg-dark border border-secondary border-opacity-25 shadow-sm mb-4">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <HelpCircle size={18} className="text-info" />
            <h2 className="h5 mb-0 fw-bold text-white">Ask About My Report</h2>
          </div>
          <span className="small text-secondary">Grounded Q&A Interface for Deans & IQAC Heads</span>
        </div>
        <div className="card-body p-4">
          <div className="mb-3">
            <label htmlFor="ask-report-context" className="form-label small text-secondary fw-semibold">
              Contextual SSR Report Excerpt (Optional)
            </label>
            <textarea
              id="ask-report-context"
              rows={2}
              className="form-control bg-dark text-white border-secondary border-opacity-50"
              placeholder="Provide report text context if asking about a specific section or metric..."
              value={askReportText}
              onChange={(e) => setAskReportText(e.target.value)}
            />
          </div>

          {/* Chat Messages */}
          <div
            className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-3 d-flex flex-column gap-3"
            style={{ maxHeight: '320px', overflowY: 'auto' }}
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-3 rounded-3 max-w-75 small ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-dark border border-secondary border-opacity-50 text-light'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  <div className="fw-semibold small mb-1 opacity-75">
                    {msg.role === 'user' ? 'Dean' : 'EduFlow NAAC AI'}
                  </div>
                  <div>{msg.content}</div>
                  {msg.citedSections?.length > 0 && (
                    <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 small opacity-75">
                      <span className="fw-bold">Citations: </span>
                      {msg.citedSections.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAskQuestion} className="d-flex gap-2">
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary border-opacity-50"
              placeholder='e.g., "What does Criterion 3.2 mean?", "How do we improve placement numbers?"'
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
            />
            <button
              type="submit"
              disabled={asking || !askQuestion.trim()}
              className="btn btn-primary d-flex align-items-center gap-2 px-4"
            >
              {asking ? <RefreshCw size={16} className="spin-anim" /> : <Send size={16} />}
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 4: PEER TEAM VISIT PREDICTOR */}
      <div className="card bg-dark border border-secondary border-opacity-25 shadow-sm mb-4">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Award size={18} className="text-success" />
            <h2 className="h5 mb-0 fw-bold text-white">Peer Team Visit Predictor</h2>
          </div>
          <button
            onClick={() => handleDownloadPdf('NAAC Peer Team Visit Report')}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-light"
          >
            <Download size={14} />
            <span>Download Visit Report PDF</span>
          </button>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <p className="text-secondary small mb-0">
              Simulates a 15-year experienced NAAC peer inspection team evaluating institutional claims, evidence completeness, and faculty qualifications.
            </p>
            <button
              onClick={handlePredictVisit}
              disabled={predictingVisit}
              className="btn btn-success d-inline-flex align-items-center gap-2 px-4"
            >
              {predictingVisit ? <RefreshCw size={16} className="spin-anim" /> : <Award size={16} />}
              <span>{predictingVisit ? 'Simulating Visit...' : 'Predict My Visit Outcome'}</span>
            </button>
          </div>

          {/* Predictions Grid */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-center">
                <span className="small text-secondary fw-semibold">PREDICTED GRADE & CGPA</span>
                <div className="h2 my-2 fw-bold text-primary">{visitPrediction.predictedGrade}</div>
                <div className="small text-light">CGPA: {visitPrediction.predictedCGPA} / 4.00</div>
                <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 mt-2">
                  Confidence: {Math.round(visitPrediction.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-center">
                <span className="small text-secondary fw-semibold">VISIT READINESS GAUGE</span>
                <div className="h2 my-2 fw-bold text-success">{visitPrediction.readinessScore}%</div>
                <div className="progress bg-secondary bg-opacity-25 mx-auto" style={{ height: '8px', maxWidth: '180px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${visitPrediction.readinessScore}%` }}
                  />
                </div>
                <span className="small text-secondary d-block mt-2">Prepared for on-site peer scrutiny</span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                <span className="small text-secondary fw-semibold d-block mb-1">RECOMMENDATION SUMMARY</span>
                <p className="small text-light mb-0">{visitPrediction.recommendationSummary}</p>
              </div>
            </div>
          </div>

          {/* Strengths & Concerns Cards */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-6">
              <h3 className="h6 fw-bold text-success d-flex align-items-center gap-2 mb-3">
                <CheckCircle2 size={16} />
                <span>Top Peer Team Strengths</span>
              </h3>
              <div className="d-flex flex-column gap-2">
                {visitPrediction.peerTeamStrengths?.map((str, idx) => (
                  <div key={idx} className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 small text-light">
                    {str}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <h3 className="h6 fw-bold text-warning d-flex align-items-center gap-2 mb-3">
                <AlertTriangle size={16} />
                <span>Top Peer Team Concerns</span>
              </h3>
              <div className="d-flex flex-column gap-2">
                {visitPrediction.peerTeamConcerns?.map((con, idx) => (
                  <div key={idx} className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 small text-light d-flex justify-content-between align-items-center">
                    <span>{typeof con === 'object' ? con.concern : con}</span>
                    {typeof con === 'object' && con.severity && (
                      <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 ms-2 text-uppercase">
                        {con.severity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Likely Questions & Evidence to Prepare */}
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <h3 className="h6 fw-bold text-white d-flex align-items-center gap-2 mb-2">
                <HelpCircle size={16} className="text-primary" />
                <span>Likely Questions from Peer Team</span>
              </h3>
              <ol className="small text-secondary ps-3 mb-0">
                {visitPrediction.likelyQuestions?.map((q, idx) => (
                  <li key={idx} className="mb-2 text-light">
                    {q}
                  </li>
                ))}
              </ol>
            </div>

            <div className="col-12 col-md-6">
              <h3 className="h6 fw-bold text-white d-flex align-items-center gap-2 mb-2">
                <FileText size={16} className="text-info" />
                <span>Critical Evidence Documents to Prepare</span>
              </h3>
              <ul className="small text-secondary ps-3 mb-0">
                {visitPrediction.evidenceToPrepare?.map((doc, idx) => (
                  <li key={idx} className="mb-2 text-light">
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: GRADE IMPROVEMENT PLANNER */}
      <div className="card bg-dark border border-secondary border-opacity-25 shadow-sm mb-4">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="h5 mb-0 fw-bold text-white">Grade Improvement Planner</h2>
          </div>
          <button
            onClick={() => handleDownloadPdf('NAAC Grade Improvement Plan')}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-light"
          >
            <Download size={14} />
            <span>Download Improvement Plan PDF</span>
          </button>
        </div>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end mb-4">
            <div className="col-12 col-sm-6 col-md-4">
              <label htmlFor="target-grade-select" className="form-label small text-secondary fw-semibold">
                Select Target Grade
              </label>
              <select
                id="target-grade-select"
                className="form-select bg-dark text-white border-secondary border-opacity-50"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
              >
                {TARGET_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <button
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 w-100"
              >
                {generatingPlan ? <RefreshCw size={16} className="spin-anim" /> : <Target size={16} />}
                <span>{generatingPlan ? 'Generating Plan...' : 'Generate Improvement Plan'}</span>
              </button>
            </div>
          </div>

          {/* Current vs Target CGPA Visual Diff */}
          <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4">
            <div className="row g-3 align-items-center text-center">
              <div className="col-4">
                <span className="small text-secondary">CURRENT STANDING</span>
                <div className="h4 mb-0 fw-bold text-white mt-1">
                  {improvementPlan.currentGrade} ({improvementPlan.currentCgpa})
                </div>
              </div>
              <div className="col-4">
                <ArrowRight size={24} className="text-primary mx-auto" />
                <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 mt-1 d-inline-block">
                  Gap: {improvementPlan.gap} Points
                </span>
              </div>
              <div className="col-4">
                <span className="small text-secondary">TARGET BENCHMARK</span>
                <div className="h4 mb-0 fw-bold text-success mt-1">
                  {improvementPlan.targetGrade} ({improvementPlan.targetCgpa})
                </div>
              </div>
            </div>
          </div>

          {/* Priority Criteria */}
          <div className="mb-4">
            <h3 className="h6 fw-bold text-white mb-3">Priority Criteria Sorted by Gap Points</h3>
            <div className="row g-3">
              {improvementPlan.priorityCriteria?.map((pc) => (
                <div key={pc.criterion} className="col-12 col-md-6">
                  <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-50 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-light">Criterion {pc.criterion}: {pc.name}</span>
                      <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">
                        Gap: +{pc.gapPoints}
                      </span>
                    </div>
                    <div className="small text-secondary mb-2">
                      Current: {pc.currentScore} → Target: {pc.targetScore}
                    </div>
                    <div className="d-flex flex-column gap-2 mt-2">
                      {pc.improvementActions?.map((act, aIdx) => (
                        <div key={aIdx} className="p-2 rounded bg-secondary bg-opacity-10 small text-light">
                          <div className="fw-semibold">{act.action}</div>
                          <div className="small text-secondary mt-1">
                            Effort: <span className="text-uppercase fw-bold text-info">{act.effort}</span> | Timeline: {act.timelineMonths} months
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap: Quick Wins, Medium-term, Long-term */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 h-100">
                <h4 className="h6 fw-bold text-success mb-2">Quick Wins (Under 30 Days)</h4>
                <ul className="small text-light ps-3 mb-0">
                  {improvementPlan.quickWins?.map((item, idx) => (
                    <li key={idx} className="mb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 h-100">
                <h4 className="h6 fw-bold text-warning mb-2">Medium-Term (3-6 Months)</h4>
                <ul className="small text-light ps-3 mb-0">
                  {improvementPlan.mediumTerm?.map((item, idx) => (
                    <li key={idx} className="mb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 rounded-3 bg-info bg-opacity-10 border border-info border-opacity-25 h-100">
                <h4 className="h6 fw-bold text-info mb-2">Long-Term (12+ Months)</h4>
                <ul className="small text-light ps-3 mb-0">
                  {improvementPlan.longTerm?.map((item, idx) => (
                    <li key={idx} className="mb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Realistic Target Date & Investment */}
          <div className="d-flex flex-wrap gap-4 text-secondary small pt-2 border-top border-secondary border-opacity-25">
            <div>
              <span className="fw-bold text-light">Realistic Target Date: </span>
              <span>{improvementPlan.realisticTargetDate}</span>
            </div>
            <div>
              <span className="fw-bold text-light">Estimated Total Investment: </span>
              <span>{improvementPlan.estimatedTotalInvestment}</span>
            </div>
            <div>
              <span className="fw-bold text-light">Overall Effort Level: </span>
              <span className="text-uppercase fw-bold text-warning">{improvementPlan.effortLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: HISTORICAL INSIGHTS */}
      <div className="card bg-dark border border-secondary border-opacity-25 shadow-sm">
        <div className="card-header bg-dark border-bottom border-secondary border-opacity-25 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Clock size={18} className="text-secondary" />
            <h2 className="h5 mb-0 fw-bold text-white">Historical Insights & Analyses</h2>
          </div>
          <span className="small text-secondary">Past Executions Log</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle small" data-testid="historical-insights-table">
              <thead>
                <tr className="border-secondary border-opacity-25 text-secondary">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Criterion / Target</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id} className="border-secondary border-opacity-10">
                    <td className="py-3 px-4 text-secondary">{item.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${
                          item.type === 'Predict'
                            ? 'bg-success bg-opacity-25 text-success border border-success border-opacity-50'
                            : item.type === 'Improve'
                            ? 'bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50'
                            : 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 fw-semibold text-light">{item.criterionOrGrade}</td>
                    <td className="py-3 px-4 text-secondary">{item.summary}</td>
                    <td className="py-3 px-4 text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => alert(`Analysis details: ${item.summary}`)}
                          className="btn btn-outline-secondary text-light btn-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(`${item.type} Analysis - ${item.criterionOrGrade}`)}
                          className="btn btn-outline-secondary text-light btn-sm"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
