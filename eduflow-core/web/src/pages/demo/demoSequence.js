/**
 * Master 5-step observational demo sequence for EduFlow AI OS.
 * Choreographed specifically for institutional leaders (Deans, Principals, Trustees).
 */

export const DEMO_STEPS = [
  {
    id: 1,
    officerType: 'accreditation',
    name: 'AI Accreditation Officer',
    shortName: 'Accreditation',
    badge: 'NAAC / NBA Accreditation Specialist',
    icon: 'Award',
    accentColor: '#06b6d4', // cyan-500
    endpoint: '/api/v1/officers/accreditation/stream',
    payload: { reportType: 'NAAC Criteria 3 SSR Analysis for SSIT' },
    prompt: 'Generate NAAC Criteria 3 SSR Analysis for SSIT',
    description: 'Autonomous generation of Criterion 3 (Research, Innovations & Extension) documentation and compliance analysis.',
    highlights: [
      { label: 'Calculated Score', value: '88.4 / 100', status: 'success' },
      { label: 'Compliant Metrics', value: '3 Verified', status: 'success' },
      { label: 'Gaps Flagged', value: '2 Remediations', status: 'warning' },
    ],
    liveMetrics: [
      { key: 'Target Cycle', value: '3rd Assessment Cycle' },
      { key: 'Department Focus', value: 'Institutional (SSIT)' },
      { key: 'Consulting Benchmark', value: '₹2,500 / hour standard' },
    ],
    roi: {
      hoursSaved: 120,
      moneySaved: 300000,
    },
  },
  {
    id: 2,
    officerType: 'student-success',
    name: 'AI Student Success Officer',
    shortName: 'Student Success',
    badge: 'Dropout Prevention & Retention Engine',
    icon: 'GraduationCap',
    accentColor: '#10b981', // emerald-500
    endpoint: '/api/v1/officers/student-success/stream',
    payload: { action: 'Run institutional dropout risk analysis for semester 4' },
    prompt: 'Run institutional dropout risk analysis for semester 4',
    description: 'Predictive cohort risk modeling analyzing attendance patterns, backlog history, and fee arrears signals.',
    highlights: [
      { label: 'Cohort Scanned', value: '50 Students', status: 'info' },
      { label: 'At-Risk Identified', value: '12 Flagged (10 Critical)', status: 'danger' },
      { label: 'Interventions', value: '100% Automated Queue', status: 'success' },
    ],
    liveMetrics: [
      { key: 'Cohort', value: 'B.Tech Semester 4' },
      { key: 'Risk Engine', value: 'EduFlow RiskNet v2.4' },
      { key: 'Intervention Speed', value: '< 2.4 seconds' },
    ],
    roi: {
      hoursSaved: 10,
      moneySaved: 6000,
    },
  },
  {
    id: 3,
    officerType: 'timetable',
    name: 'AI Timetable Officer',
    shortName: 'Timetable',
    badge: 'Academic Operations & Space Optimization',
    icon: 'Calendar',
    accentColor: '#8b5cf6', // purple-500
    endpoint: '/api/v1/officers/timetable/stream',
    payload: { action: 'Generate conflict-free timetable for CSE Department' },
    prompt: 'Generate conflict-free timetable for CSE Department',
    description: 'Constraint satisfaction engine balancing faculty workload, lab requirements, and room capacities.',
    highlights: [
      { label: 'Conflict Rate', value: '0 Conflicts Detected', status: 'success' },
      { label: 'Faculty Workload', value: '15.4 hrs/wk avg (≤18 hrs)', status: 'info' },
      { label: 'Labs Allocated', value: '3 Parallel Studios', status: 'success' },
    ],
    liveMetrics: [
      { key: 'Department', value: 'Computer Science & Eng' },
      { key: 'Slots Evaluated', value: '184 combinations' },
      { key: 'Room Utilization', value: '94.2% Optimal' },
    ],
    roi: {
      hoursSaved: 40,
      moneySaved: 20000,
    },
  },
  {
    id: 4,
    officerType: 'admissions',
    name: 'AI Admission Officer',
    shortName: 'Admissions',
    badge: 'Enrollment Yield & Applicant Concierge',
    icon: 'Users',
    accentColor: '#f59e0b', // amber-500
    endpoint: '/api/v1/officers/admissions/stream',
    payload: { action: 'Analyze application yield and predict final enrollment' },
    prompt: 'Analyze application yield and predict final enrollment',
    description: 'Yield prediction modeling, conversion probability scoring, and automated candidate follow-up.',
    highlights: [
      { label: 'Applications', value: '450 Evaluated', status: 'info' },
      { label: 'Predicted Yield', value: '72.4% (275 Enrolled)', status: 'success' },
      { label: 'Follow-ups Queued', value: '120 Acceptance Letters', status: 'info' },
    ],
    liveMetrics: [
      { key: 'Confidence Interval', value: '94.2% statistical fit' },
      { key: 'Top Drop-Off Factor', value: 'Hostel Accommodation' },
      { key: 'Turnaround Time', value: '< 24 Hours' },
    ],
    roi: {
      hoursSaved: 0.5,
      moneySaved: 150,
    },
  },
  {
    id: 5,
    officerType: 'finance',
    name: 'AI Finance Officer',
    shortName: 'Finance',
    badge: 'Reconciliation & Cash Flow Intelligence',
    icon: 'IndianRupee',
    accentColor: '#ec4899', // pink-500
    endpoint: '/api/v1/officers/finance/stream',
    payload: { action: 'Reconcile fee collection against bank deposits for March 2026' },
    prompt: 'Reconcile fee collection against bank deposits for March 2026',
    description: 'Automated UPI/NEFT transaction reconciliation against ERP invoices and fee defaulter auditing.',
    highlights: [
      { label: 'Reconciled Amount', value: '₹42,50,000 (88.5%)', status: 'success' },
      { label: 'Unmatched UPI', value: '3 Flagged (₹38,500)', status: 'danger' },
      { label: 'Pending Defaulters', value: '₹1,80,000 (14 accounts)', status: 'warning' },
    ],
    liveMetrics: [
      { key: 'Accounts Scanned', value: 'HDFC & SBI Escrow' },
      { key: 'Receipts Dispatched', value: '342 Verified' },
      { key: 'ERP Sync', value: '100% Real-Time' },
    ],
    roi: {
      hoursSaved: 4,
      moneySaved: 3200,
    },
  },
]

export const TOTAL_DEMO_ROI = DEMO_STEPS.reduce(
  (acc, step) => ({
    hoursSaved: acc.hoursSaved + step.roi.hoursSaved,
    moneySaved: acc.moneySaved + step.roi.moneySaved,
  }),
  { hoursSaved: 0, moneySaved: 0 }
)
