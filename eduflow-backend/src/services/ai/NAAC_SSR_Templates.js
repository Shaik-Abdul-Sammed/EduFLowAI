/**
 * Official 2024 NAAC Self-Study Report (SSR) Criterion Structures & Qualitative Rubrics
 */

export const NAAC_SSR_TEMPLATES = {
  1: {
    criterionNumber: 1,
    title: 'Curricular Aspects',
    weightage: 100,
    subCriteria: [
      { id: '1.1', title: 'Curricular Planning and Implementation' },
      { id: '1.2', title: 'Academic Flexibility' },
      { id: '1.3', title: 'Curriculum Enrichment' },
      { id: '1.4', title: 'Feedback System' }
    ],
    qualitativeFormat: `### Criterion 1 — Curricular Aspects (Weightage: 100)
#### 1.1 Curricular Planning and Implementation
The institution ensures effective curriculum delivery through a well-planned and documented process including semester lesson plans, course handouts, and continuous internal evaluations.
#### 1.2 Academic Flexibility
Percentage of programs in which Choice Based Credit System (CBCS) / elective course system has been implemented across all departments.
#### 1.3 Curriculum Enrichment
Integration of cross-cutting issues relevant to Professional Ethics, Gender, Human Values, Environment and Sustainability into the curriculum.
#### 1.4 Feedback System
Structured feedback on syllabus received from Students, Teachers, Employers, and Alumni, with documented Action Taken Reports (ATR).`,
    quantitativeTable: `| Sub-Criterion | Metric Description | Current Value | Benchmark Target | Compliance |
|---|---|---|---|---|
| 1.1.1 | Documented Course Files Compliance | 94.2% | 90.0% | Exceeded |
| 1.2.1 | CBCS / Elective Course Offerings | 100% | 100% | Compliant |
| 1.3.2 | Value-Added Courses Offered (>30 hrs) | 28 Courses | 20 Courses | Exceeded |
| 1.4.1 | 360° Stakeholder Feedback Participation | 91.5% | 85.0% | Compliant |`,
    evidenceReferences: ['Academic Council Minutes 2024-25', 'BOS Resolution Files', 'Stakeholder ATR 2025.pdf', 'LMS Syllabus Logs'],
    uniquePractices: 'Industry-guided curriculum hackathons every semester with Capstone project alignment.'
  },
  2: {
    criterionNumber: 2,
    title: 'Teaching-Learning and Evaluation',
    weightage: 350,
    subCriteria: [
      { id: '2.1', title: 'Student Enrollment and Profile' },
      { id: '2.2', title: 'Student Diversity' },
      { id: '2.3', title: 'Teaching-Learning Process' },
      { id: '2.4', title: 'Teacher Profile and Quality' },
      { id: '2.5', title: 'Evaluation Process and Reforms' },
      { id: '2.6', title: 'Student Performance and Learning Outcomes' },
      { id: '2.7', title: 'Student Satisfaction Survey' }
    ],
    qualitativeFormat: `### Criterion 2 — Teaching-Learning and Evaluation (Weightage: 350)
#### 2.1 Student Enrollment and Profile
Enrolment percentage against sanctioned intake with reservation policies adhered to government quotas.
#### 2.2 Student Diversity & Student-Faculty Ratio (SFR)
Student-to-Full-Time Faculty ratio maintained at optimum academic standards.
#### 2.3 Teaching-Learning Process
Student centric methods, such as experiential learning, participative learning, and problem solving methodologies using modern ICT tools.
#### 2.4 Teacher Profile and Quality
Percentage of full-time teachers against sanctioned posts with Ph.D./NET/SET qualifications.`,
    quantitativeTable: `| Metric | Metric Title | SFR Table / Data | Status |
|---|---|---|---|
| 2.2.2 | Student - Full Time Teacher Ratio (SFR) | 15:1 (3000 Students / 200 Faculty) | Exemplary |
| 2.4.2 | Full-time teachers with Ph.D. / D.Sc. | 68.5% (137 / 200) | Compliant |
| 2.6.3 | Pass percentage of final year students | 93.8% | High Distinction |`,
    evidenceReferences: ['Approved Sanction Letters', 'Faculty Ph.D. Registry', 'CO-PO Attainment Sheets', 'ERP Attendance Reports'],
    uniquePractices: 'Experiential peer-assisted learning pods and automated Continuous Internal Evaluation (CIE) transparency.'
  },
  3: {
    criterionNumber: 3,
    title: 'Research, Innovations and Extension',
    weightage: 120,
    subCriteria: [
      { id: '3.1', title: 'Promotion of Research and Facilities' },
      { id: '3.2', title: 'Resource Mobilization for Research' },
      { id: '3.3', title: 'Innovation Ecosystem' },
      { id: '3.4', title: 'Research Publications and Awards' },
      { id: '3.5', title: 'Consultancy' },
      { id: '3.6', title: 'Extension Activities' },
      { id: '3.7', title: 'Collaboration' }
    ],
    qualitativeFormat: `### Criterion 3 — Research, Innovations and Extension (Weightage: 120)
#### 3.1 & 3.2 Research Grants & Seed Money
Seed money provided to young faculty and competitive research grants mobilized from DST, SERB, AICTE, and UGC.
#### 3.3 Innovation Ecosystem
Institution Innovation Council (IIC) and Incubation centre supporting student prototype development and startup ideation.
#### 3.4 Research Publications and Awards
Indexed research publications in Scopus / Web of Science with citation impact analysis.`,
    quantitativeTable: `| Sub-Criterion | Publication & Grant Details | Current Count / Value | Target |
|---|---|---|---|
| 3.1.2 | Seed money provided to faculty | ₹42,50,000 | ₹30,00,000 |
| 3.4.3 | Scopus / WoS Indexed Journal Articles | 184 Papers | 150 Papers |
| 3.4.4 | Books and Chapters Published | 42 Chapters | 30 Chapters |
| 3.6.2 | Extension Outreach Activities (NSS/NCC) | 36 Drives | 25 Drives |`,
    evidenceReferences: ['Scopus Extract 2024-2026', 'Patent Grant Certificates', 'MOU Agreements with Industry', 'Grant Sanction Letters'],
    uniquePractices: 'Centralized interdisciplinary incubation lab with dedicated IPR support cell.'
  },
  4: {
    criterionNumber: 4,
    title: 'Infrastructure and Learning Resources',
    weightage: 100,
    subCriteria: [
      { id: '4.1', title: 'Physical Facilities' },
      { id: '4.2', title: 'Library as a Learning Resource' },
      { id: '4.3', title: 'IT Infrastructure' },
      { id: '4.4', title: 'Maintenance of Campus Infrastructure' }
    ],
    qualitativeFormat: `### Criterion 4 — Infrastructure and Learning Resources (Weightage: 100)
#### 4.1 Physical Facilities
Adequate facilities for teaching-learning including smart classrooms, well-equipped laboratories, seminar halls, and sports gymnasiums.
#### 4.2 Library as a Learning Resource
Integrated Library Management System (ILMS) with remote e-resource access (DELNET, IEEE Xplore, NDL).
#### 4.3 IT Infrastructure
Campus-wide Wi-Fi connectivity with high-speed dedicated leased-line internet bandwidth (>1 Gbps).`,
    quantitativeTable: `| Metric | Infrastructure Facility Counts | Current Provision | NAAC Norm |
|---|---|---|---|
| 4.1.3 | ICT-enabled Smart Classrooms | 48 / 52 Classrooms | >80% |
| 4.2.2 | Digital e-Books & e-Journals Subscribed | 12,400+ titles | Subscribed |
| 4.3.1 | Internet Leased-line Bandwidth | 1.2 Gbps dedicated | >500 Mbps |
| 4.3.2 | Student to Computer Ratio | 2.8 : 1 | < 4:1 |`,
    evidenceReferences: ['ILMS AMC Records', 'Bandwidth Invoice & Speed Test Log', 'Stock Register Verification', 'Civil Maintenance Audit'],
    uniquePractices: '100% solar powered campus data server room and IoT energy monitoring.'
  },
  5: {
    criterionNumber: 5,
    title: 'Student Support and Progression',
    weightage: 130,
    subCriteria: [
      { id: '5.1', title: 'Student Support' },
      { id: '5.2', title: 'Student Progression' },
      { id: '5.3', title: 'Student Participation and Activities' },
      { id: '5.4', title: 'Alumni Engagement' }
    ],
    qualitativeFormat: `### Criterion 5 — Student Support and Progression (Weightage: 130)
#### 5.1 Student Support & Scholarships
Institutional and government freeships, capability enhancement programs, soft skills, and competitive exam coaching.
#### 5.2 Student Progression & Placements
Placement percentage of graduating students in reputed organizations and higher education progression into premier universities.
#### 5.3 Student Participation
Active student council participation, cultural fests, and national sports representation.`,
    quantitativeTable: `| Metric | Placement & Progression Details | Data Metric | Status |
|---|---|---|---|
| 5.1.1 | Students benefited by scholarships | 64.2% | High Support |
| 5.2.1 | Placed Students in Tier-1/Tier-2 Tech/Core | 86.4% | Exemplary |
| 5.2.2 | Progression to Higher Education (GATE/GRE) | 12.1% | Verified |
| 5.4.1 | Registered Alumni Chapters & Contribution | 4 Active Chapters | Active |`,
    evidenceReferences: ['Placement Offer Letters', 'Scholarship Disbursement Records', 'Alumni Association Registration', 'Sports Medals Registry'],
    uniquePractices: 'Dedicated Career Forge training bootcamps and alumni mentorship circles.'
  },
  6: {
    criterionNumber: 6,
    title: 'Governance, Leadership and Management',
    weightage: 100,
    subCriteria: [
      { id: '6.1', title: 'Institutional Vision and Leadership' },
      { id: '6.2', title: 'Strategy Development and Deployment' },
      { id: '6.3', title: 'Faculty Empowerment Strategies' },
      { id: '6.4', title: 'Financial Management and Resource Mobilization' },
      { id: '6.5', title: 'Internal Quality Assurance System (IQAC)' }
    ],
    qualitativeFormat: `### Criterion 6 — Governance, Leadership and Management (Weightage: 100)
#### 6.1 Vision and Leadership
Participatory governance with decentralization and operational autonomy delegated to HODs and academic committees.
#### 6.3 Faculty Empowerment
Performance Based Appraisal System (PBAS) and financial support for attending national/international conferences.
#### 6.5 Internal Quality Assurance System (IQAC)
Regular IQAC meetings, Academic and Administrative Audits (AAA), and collaborative quality initiatives.`,
    quantitativeTable: `| Metric | Governance & IQAC Metrics | Metric Value | Benchmark |
|---|---|---|---|
| 6.2.2 | E-Governance implementation across ERP | Implemented (5/5 modules) | Full Automation |
| 6.3.2 | Financial support for conference travel | 82 Faculty members | Active |
| 6.5.1 | Documented IQAC Meetings with Action Plan | 4 Meetings/Year | Standard |`,
    evidenceReferences: ['Governing Council Minutes', 'Annual Financial Audits', 'IQAC Action Taken Reports', 'Service Rules Handbook'],
    uniquePractices: 'Paperless e-governance administrative officers and transparent faculty appraisal matrices.'
  },
  7: {
    criterionNumber: 7,
    title: 'Institutional Values and Best Practices',
    weightage: 100,
    subCriteria: [
      { id: '7.1', title: 'Institutional Values and Social Responsibilities' },
      { id: '7.2', title: 'Best Practices' },
      { id: '7.3', title: 'Institutional Distinctiveness' }
    ],
    qualitativeFormat: `### Criterion 7 — Institutional Values and Best Practices (Weightage: 100)
#### 7.1 Gender Equity, Environmental Consciousness & Sustainability
Initiatives for promotion of gender equity, safety and security, disabled-friendly barrier-free campus, green audits, and solid waste management.
#### 7.2 Institutional Best Practices
Two institutional best practices successfully implemented with evidence of success.
#### 7.3 Institutional Distinctiveness
Distinctive academic or social outreach profile defining the institution's core mission.`,
    quantitativeTable: `| Metric | Gender Equity & Green Audit Metrics | Status / Metric |
|---|---|---|
| 7.1.1 | Gender Equity Promotion Activities | 14 Annual Workshops |
| 7.1.2 | Alternate Sources of Energy (Solar/Biogas) | 45% Energy from Solar |
| 7.1.4 | Rainwater Harvesting Structures | 6 Recharge Wells Active |
| 7.1.7 | Barrier-free / Divyangjan Friendly Campus | Ramps, Lifts, Braille Signage |`,
    evidenceReferences: ['Green Audit Certificate', 'Gender Sensitization Reports', 'Rainwater Harvesting Site Photos', 'Code of Conduct Handbook'],
    uniquePractices: 'Rural community tech adoption and zero-single-use-plastic green campus protocol.'
  }
}

export function generateFullSSRReport(criterionNumber = 1) {
  const t = NAAC_SSR_TEMPLATES[criterionNumber] || NAAC_SSR_TEMPLATES[1]
  return `${t.qualitativeFormat}

${t.quantitativeTable}

#### Evidence & Artifacts
${t.evidenceReferences.map(ref => `- ${ref}`).join('\n')}

#### Institutional Unique Practice
${t.uniquePractices}`
}
