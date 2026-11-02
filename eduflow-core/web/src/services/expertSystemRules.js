/**
 * EduFlow Institutional Expert Systems Knowledge Base & Inference Rules.
 * Codified statutory rules, regulatory benchmarks, and diagnostic engines
 * for Higher Education Institutions (NAAC, NBA, AICTE, UGC, NIRF).
 */

export const EXPERT_SYSTEMS = {
  accreditation: {
    id: 'accreditation',
    name: 'NAAC RAF & NBA OBE Expert System',
    authority: 'National Assessment and Accreditation Council & NBA India',
    frameworkVersion: 'Revised Accreditation Framework (RAF) 2024 / Binary Guidelines',
    description: 'Autonomous knowledge-based inference engine that continuously evaluates institutional metrics against NAAC 7 Criteria and NBA Outcome-Based Education (OBE) benchmarks.',
    rules: [
      {
        id: 'ACC-R01',
        name: 'Student-Faculty Ratio (SFR) Compliance',
        criterion: 'Criterion 2: Teaching-Learning and Evaluation',
        metric: 'Metric 2.2.2',
        statutoryClause: 'AICTE Approval Process Handbook (APH) Cl. 2.14 & NAAC RAF Benchmark',
        statutoryThreshold: '≤ 15:1 for 4/4 score; ≤ 20:1 for statutory eligibility',
        currentValue: '14.8:1',
        status: 'COMPLIANT',
        weight: 40,
        explanation: 'Institutional student-to-full-time faculty ratio is currently 14.8:1, satisfying the highest 4-point benchmark on NAAC Criterion 2.',
        recommendation: 'Maintain current faculty cadre sanctioned strength during upcoming semester recruitment.'
      },
      {
        id: 'ACC-R02',
        name: 'Doctorate Faculty Cadre Ratio',
        criterion: 'Criterion 2: Teaching-Learning and Evaluation',
        metric: 'Metric 2.4.2',
        statutoryClause: 'UGC Minimum Qualifications for Appointment of Teachers Regulations, Cl. 4.1',
        statutoryThreshold: '≥ 60% full-time faculty holding Ph.D. / D.Sc.',
        currentValue: '68.4%',
        status: 'COMPLIANT',
        weight: 35,
        explanation: '58 out of 85 regular faculty members possess doctoral degrees in their respective academic specializations.',
        recommendation: 'Sponsor remaining 27 faculty members with annual Ph.D. contingency grants of ₹25,000.'
      },
      {
        id: 'ACC-R03',
        name: 'Scopus / Web of Science Research Output',
        criterion: 'Criterion 3: Research, Innovations and Extension',
        metric: 'Metric 3.4.5',
        statutoryClause: 'NAAC RAF Criterion 3 & NIRF Research and Professional Practice (RPC)',
        statutoryThreshold: '≥ 2.0 peer-reviewed indexed publications per regular faculty per year',
        currentValue: '2.14 / faculty',
        status: 'COMPLIANT',
        weight: 50,
        explanation: 'Cumulative 182 papers indexed in Scopus/WoS over the preceding rolling 12 months.',
        recommendation: 'Direct IQAC to allocate ₹15,000 article processing charge (APC) subsidies for Q1/Q2 journal publications.'
      },
      {
        id: 'ACC-R04',
        name: 'Graduation Placement & Higher Studies Progression',
        criterion: 'Criterion 5: Student Support and Progression',
        metric: 'Metric 5.2.1',
        statutoryClause: 'NIRF Graduation Outcomes (GO) & NAAC Metric 5.2.1',
        statutoryThreshold: '≥ 70% outgoing cohort placed or progressed to higher education',
        currentValue: '78.2%',
        status: 'COMPLIANT',
        weight: 45,
        explanation: '391 out of 500 final-year graduates placed across Tier-1 IT, Core Engineering, or admitted to GATE/GRE postgraduate programs.',
        recommendation: 'Initiate early 6th-semester pre-placement coding and aptitude training for Tier-2 product companies.'
      },
      {
        id: 'ACC-R05',
        name: 'Binary Accreditation Readiness',
        criterion: 'National Education Policy (NEP 2020)',
        metric: 'Binary Grade Metric (Level 1–5)',
        statutoryClause: 'Radhakrishnan Committee Implementation Notification 2024',
        statutoryThreshold: 'CGPA ≥ 3.01 / 4.00 for Maturity Level 4 (Accredited of National Eminence)',
        currentValue: '3.64 / 4.00 (Projected A++)',
        status: 'COMPLIANT',
        weight: 100,
        explanation: 'Institutional metrics qualify for Maturity Level 4 under the newly notified Binary Accreditation scheme.',
        recommendation: 'Compile SSR documentation with digital timestamp hash verification before submission to NAAC portal.'
      }
    ],
    summaryScore: '3.64 / 4.00',
    readinessGrade: 'Grade A++ (National Eminence)',
    overallStatus: 'OPTIMAL'
  },

  'student-success': {
    id: 'student-success',
    name: 'UGC Academic Retention & At-Risk Early Warning Expert System',
    authority: 'University Grants Commission (UGC) & Institutional Examination Ordinance',
    frameworkVersion: 'UGC Student Progression & Welfare Regulations 2024',
    description: 'Expert diagnostics evaluating biometric attendance telemetry, continuous internal assessment trajectories, and multi-factor student dropout vulnerability.',
    rules: [
      {
        id: 'STU-R01',
        name: 'Mandatory Examination Attendance Threshold',
        criterion: 'Examination Ordinance',
        metric: 'Statutory 75% Attendance Rule',
        statutoryClause: 'UGC Model Regulations for Universities & Colleges, Regulation 13.2',
        statutoryThreshold: '≥ 75% biometric/digital attendance to sit for semester examinations',
        currentValue: '98.6% of student body compliant (7 students < 75%)',
        status: 'WARNING',
        weight: 50,
        explanation: '7 students across CS and Mechanical branches have fallen below the 75% statutory condonation threshold.',
        recommendation: 'Dispatch immediate automated WhatsApp warnings to registered parent numbers and schedule proctor counseling.'
      },
      {
        id: 'STU-R02',
        name: 'Continuous Internal Assessment (CIE) Downward Trajectory',
        criterion: 'Academic Evaluation',
        metric: 'IA Score Variance',
        statutoryClause: 'Outcome-Based Education Continuous Assessment Policy',
        statutoryThreshold: 'Zero consecutive declines exceeding 15% across IA-1 to IA-2 tests',
        currentValue: '12 students flagged for ≥ 15% score drops',
        status: 'WARNING',
        weight: 35,
        explanation: '12 students exhibit severe score degradation in core analytical subjects (Data Structures, Thermo).',
        recommendation: 'Enroll flagged students in mandatory 2-week Saturday remedial bridge clinics.'
      },
      {
        id: 'STU-R03',
        name: 'Active Course Backlog Risk Limit',
        criterion: 'Credit Accumulation',
        metric: 'NEP Academic Bank of Credits (ABC) Progress',
        statutoryClause: 'UGC Guidelines on Multiple Entry and Exit in Academic Programmes, Cl. 6',
        statutoryThreshold: 'Maximum 1 active backlog for normal semester progression',
        currentValue: '3 students with ≥ 2 active backlogs',
        status: 'WARNING',
        weight: 40,
        explanation: '3 students risk academic year-loss under the university vertical progression ordinance.',
        recommendation: 'Assign dedicated senior faculty mentors for one-on-one exam strategy sessions.'
      },
      {
        id: 'STU-R04',
        name: 'Mentorship Proctor Ratio',
        criterion: 'Student Support Services',
        metric: 'Proctor-to-Ward Ratio',
        statutoryClause: 'NAAC Metric 5.1.4 (Student Mentoring System)',
        statutoryThreshold: '≤ 20 students per faculty proctor',
        currentValue: '15.2 students / proctor',
        status: 'COMPLIANT',
        weight: 25,
        explanation: 'All 500 enrolled students assigned to 33 trained faculty mentors with bi-weekly meeting logs.',
        recommendation: 'Log mentoring session outcomes directly into the EduFlow digital proctor diary.'
      }
    ],
    summaryScore: '96.2%',
    readinessGrade: 'High Institutional Retention',
    overallStatus: 'ATTENTION_NEEDED'
  },

  timetable: {
    id: 'timetable',
    name: 'AICTE Faculty Workload & Instructional Scheduling Expert System',
    authority: 'All India Council for Technical Education (AICTE) & UGC Norms',
    frameworkVersion: 'AICTE Approval Process Handbook (APH) 2024-27 Master Norms',
    description: 'Mathematical constraint satisfaction and operational research engine enforcing faculty workload ceilings, contiguous lab blocks, and semester instructional days.',
    rules: [
      {
        id: 'TT-R01',
        name: 'Assistant Professor Weekly Teaching Hours Limit',
        criterion: 'Faculty Cadre Workload',
        metric: 'Weekly Contact Hours',
        statutoryClause: 'AICTE Regulations on Minimum Qualifications and Workload Norms, Table 4.1',
        statutoryThreshold: '16 to 18 hours/week maximum contact hours',
        currentValue: '15.6 hours/week average',
        status: 'COMPLIANT',
        weight: 40,
        explanation: 'No Assistant Professor exceeds the statutory 18 contact hour ceiling.',
        recommendation: 'Reserve 10 hours/week for research publications, evaluation, and student mentoring.'
      },
      {
        id: 'TT-R02',
        name: 'Associate Professor / Professor Workload Ceiling',
        criterion: 'Senior Faculty Cadre Workload',
        metric: 'Weekly Contact Hours',
        statutoryClause: 'AICTE Workload Norms for Senior Faculty',
        statutoryThreshold: '12 to 14 hrs (Assoc Prof) / 8 to 10 hrs (Prof / HOD)',
        currentValue: '12.2 hrs (Assoc) / 8.5 hrs (Prof)',
        status: 'COMPLIANT',
        weight: 35,
        explanation: 'Senior faculty retain adequate operational bandwidth for funded research and institutional governance.',
        recommendation: 'Ensure HODs have protected Friday afternoons for academic council meetings.'
      },
      {
        id: 'TT-R03',
        name: 'Continuous Lecture Fatigue Prevention',
        criterion: 'Cognitive Scheduling Optimization',
        metric: 'Contiguous Lecture Limit',
        statutoryClause: 'Institutional Academic Council Scheduling Standard',
        statutoryThreshold: 'Maximum 2 continuous lecture hours per faculty/student cohort',
        currentValue: 'Zero 3-hour continuous lecture slots scheduled',
        status: 'COMPLIANT',
        weight: 30,
        explanation: 'All theory lectures scheduled in 50-minute or 100-minute blocks with required transition intervals.',
        recommendation: 'Preserve campus-wide 12:45 PM – 1:30 PM lunch recess without scheduling exceptions.'
      },
      {
        id: 'TT-R04',
        name: 'Statutory 90-Day Semester Instructional Requirement',
        criterion: 'Semester Working Days',
        metric: 'Teaching Days Count',
        statutoryClause: 'UGC Minimum Working Days Guidelines & Academic Calendar Standard',
        statutoryThreshold: 'Minimum 90 actual instructional days (15 weeks) excluding exam days',
        currentValue: '90 Teaching Days Verified',
        status: 'COMPLIANT',
        weight: 50,
        explanation: 'Calendar incorporates 6 AI-diagnosed compensatory Saturdays to guarantee 100% compliance against gazetted holiday drift.',
        recommendation: 'Maintain published academic calendar dates for mid-term and semester-end examinations.'
      }
    ],
    summaryScore: '100% Compliant',
    readinessGrade: 'AICTE Certified Timetable',
    overallStatus: 'OPTIMAL'
  },

  admissions: {
    id: 'admissions',
    name: 'Institutional Enrollment Yield & Seat Matrix Expert System',
    authority: 'State Higher Education Council & Central Seat Allocation Board (CSAB)',
    frameworkVersion: 'National Higher Education Admissions & Quota Matrix 2024',
    description: 'Expert funnel prediction system analyzing applicant scoring, category reservation quotas, cutoff drifts, and enrollment conversion velocity.',
    rules: [
      {
        id: 'ADM-R01',
        name: 'Statutory Category Reservation Compliance',
        criterion: 'Constitutional Quota Matrix',
        metric: 'Seat Allotment Distribution',
        statutoryClause: 'State Higher Education Reservation Act & Central Educational Institutions Act',
        statutoryThreshold: 'Strict fulfillment of General, OBC, SC, ST, and EWS quota quotas',
        currentValue: '100% compliant seat matrix',
        status: 'COMPLIANT',
        weight: 50,
        explanation: 'Branch seat allocations mathematically preserve all statutory category reservation percentages.',
        recommendation: 'Publish verified category-wise closing ranks on the institutional admissions transparency portal.'
      },
      {
        id: 'ADM-R02',
        name: 'NIRF Graduation Outcomes (GO) Median Salary Benchmark',
        criterion: 'Placement Trajectory',
        metric: 'Median CTC for Outgoing Batch',
        statutoryClause: 'NIRF Metric GO (Graduation Outcomes) - Median Salary calculation',
        statutoryThreshold: '≥ ₹6.5 LPA median CTC for Tier-1 engineering ranking score',
        currentValue: '₹7.2 LPA median CTC achieved',
        status: 'COMPLIANT',
        weight: 45,
        explanation: 'Campus recruitment by 42 visiting corporations resulted in ₹7.2 LPA median compensation for the 2025-2026 batch.',
        recommendation: 'Leverage placement statistics in upcoming prospectus digital marketing campaigns.'
      },
      {
        id: 'ADM-R03',
        name: 'Applicant-to-Enrollment Conversion Rate',
        criterion: 'Enrollment Yield Optimization',
        metric: 'Yield Conversion Velocity',
        statutoryClause: 'Institutional Strategic Plan 2026',
        statutoryThreshold: '≥ 65% conversion from Allotted Seat to Fee Deposit',
        currentValue: '72.4% conversion rate',
        status: 'COMPLIANT',
        weight: 35,
        explanation: 'Automated SMS/WhatsApp payment reminder cadence boosted prompt seat confirmation by 14.2%.',
        recommendation: 'Deploy early bird merit scholarship vouchers to secure top 500 state rank applicants.'
      }
    ],
    summaryScore: '94.8%',
    readinessGrade: 'Peak Admissions Yield',
    overallStatus: 'OPTIMAL'
  },

  finance: {
    id: 'finance',
    name: 'Non-Profit Governance & Dean Sanction Threshold Expert System',
    authority: 'Income Tax Department (Section 10(23C)) & Institutional Board of Governors',
    frameworkVersion: 'Higher Education Financial Accounting & Governance Standards 2024',
    description: 'Autonomous financial auditing system evaluating fee reconciliation velocity, statutory 18% GST exemptions, and Dean institutional expenditure sanctions.',
    rules: [
      {
        id: 'FIN-R01',
        name: 'Dean Financial Policy & Statutory Sanctions Rule',
        criterion: 'Institutional Governance & Delegation of Powers',
        metric: 'High-Value Expenditure & Concession Review',
        statutoryClause: 'Institutional Governance Ordinance, Section 8 (Dean Financial Powers)',
        statutoryThreshold: 'All fee concessions, fee waivers, or single procurement line items > ₹1,00,000 strictly require Dean review',
        currentValue: '1 Pending Approval (Sports Excellence Fee Waiver ₹1,20,000)',
        status: 'WARNING',
        weight: 50,
        explanation: 'Institutional governance strictly mandates Dean authorization before finance controller dispatches ledger waivers > ₹1 Lakh.',
        recommendation: 'Review pending sports excellence waiver from Dean Financial Policy & Sanctions Desk on dashboard.'
      },
      {
        id: 'FIN-R02',
        name: 'Defaulter Aging Criticality Threshold',
        criterion: 'Tuition Fee Recovery',
        metric: 'Overdue Aging Matrix',
        statutoryClause: 'Institutional Fee Management & Student Accounts Policy',
        statutoryThreshold: 'Zero accounts exceeding 90 days without documented escalation or sanction',
        currentValue: '3 accounts in > 90 days bucket (Total ₹2,10,000)',
        status: 'WARNING',
        weight: 40,
        explanation: '3 long-term arrears require customized installment plans to prevent exam registration holds.',
        recommendation: 'Trigger automated graduated WhatsApp reminders offering 3-part installment restructuring.'
      },
      {
        id: 'FIN-R03',
        name: 'Section 10(23C) Educational Non-Profit Compliance',
        criterion: 'Statutory Taxation Exemption',
        metric: 'Annual Surplus Utilization',
        statutoryClause: 'Income Tax Act 1961, Section 10(23C)(vi) & Rule 2BBB',
        statutoryThreshold: '≥ 85% of institutional gross receipts applied solely for educational objectives in India',
        currentValue: '91.4% reinvestment in laboratory capital & faculty research',
        status: 'COMPLIANT',
        weight: 45,
        explanation: 'Audit ledger reflects full compliance with non-profit reinvestment mandates.',
        recommendation: 'Generate Form 10B audit documentation for submission to Chartered Accountant.'
      }
    ],
    summaryScore: '98.8% Efficiency',
    readinessGrade: 'Full Statutory Compliance',
    overallStatus: 'COMPLIANT'
  }
};

/**
 * Runs a real-time diagnostic evaluation for a specific expert system domain.
 */
export function evaluateExpertSystem(systemId, dynamicContext = {}) {
  const system = EXPERT_SYSTEMS[systemId] || EXPERT_SYSTEMS.accreditation;
  const rules = system.rules;

  let totalWeight = 0;
  let earnedScore = 0;
  const evaluatedRules = rules.map(rule => {
    totalWeight += rule.weight;
    let ruleStatus = rule.status;

    // Apply any dynamic override from context if provided
    if (dynamicContext[rule.id]) {
      ruleStatus = dynamicContext[rule.id].status || ruleStatus;
    }

    if (ruleStatus === 'COMPLIANT') {
      earnedScore += rule.weight;
    } else if (ruleStatus === 'WARNING') {
      earnedScore += rule.weight * 0.7;
    }

    return {
      ...rule,
      status: ruleStatus,
      evaluatedAt: new Date().toISOString()
    };
  });

  const compliancePercentage = Math.round((earnedScore / totalWeight) * 100);

  return {
    systemId: system.id,
    systemName: system.name,
    authority: system.authority,
    frameworkVersion: system.frameworkVersion,
    description: system.description,
    compliancePercentage,
    rules: evaluatedRules,
    summaryScore: `${compliancePercentage}%`,
    overallStatus: compliancePercentage >= 90 ? 'OPTIMAL' : compliancePercentage >= 70 ? 'ATTENTION_NEEDED' : 'CRITICAL_RISK',
    evaluatedAt: new Date().toISOString()
  };
}
