# EduFlow AI OS — AI Officer Contracts & ROI Matrix

## 1. Five Specialized AI Officer Specifications

### 1. Accreditation Officer
- **Persona Prompt:** Senior NAAC/NBA peer review expert specializing in Revised Accreditation Framework (RAF 2024), Self Study Report (SSR) metric evaluation, IIQA compliance, and continuous IQAC tracking.
- **Input Payload:** Institutional name, cycle target (Cycle 1/2/3), specific criterion focus (Criteria 1–7), or raw metrics text.
- **Output Artifact:** Structured 7-criterion accreditation assessment, gap analysis with red-flag metrics, quantitative benchmark scorecard, and 30-day action plan.
- **ROI Formula:** `40 hours saved` × `₹625/hour average IQAC coordinator salary` = `₹25,000 cost savings per audit cycle`.
- **Endpoints:** Streaming: `POST /api/v1/officers/accreditation/stream` | Sync: `POST /api/v1/officers/accreditation/generate`.
- **Failure Fallback:** Catches provider timeouts; emits SSE error event and falls back to structured institutional SSR template.

### 2. Student Success Officer
- **Persona Prompt:** Proactive retention and academic intervention specialist analyzing attendance thresholds (<75%), test failure patterns, and social risk indicators.
- **Input Payload:** Course code, student attendance logs, mid-term grade distributions, or at-risk cohort query.
- **Output Artifact:** Risk categorization matrix (Critical / Moderate / Low), root-cause breakdown, and targeted intervention strategies.
- **ROI Formula:** `20 hours saved` × `₹750/hour counselor rate` = `₹15,000 cost savings per semester`.
- **Endpoints:** Streaming: `POST /api/v1/officers/student-success/stream` | Sync: `POST /api/v1/officers/student-success/predict-risk`.

### 3. Timetable Officer
- **Persona Prompt:** Operations research scheduler optimizing room capacities, faculty availability constraints, AICTE workload guidelines, and cross-department lab slots.
- **Input Payload:** Department list, section count, faculty availability windows, lab constraints.
- **Output Artifact:** Conflict-free master timetable grid, faculty clash analysis, and room utilization index.
- **ROI Formula:** `32 hours saved` × `₹562/hour coordinator rate` = `₹18,000 cost savings per semester`.
- **Endpoints:** Streaming: `POST /api/v1/officers/timetable/stream` | Sync: `POST /api/v1/officers/timetable/generate`.

### 4. Admissions Officer
- **Persona Prompt:** Enrollment yield strategist analyzing application funnel drop-offs, demographic conversion rates, and quota distribution.
- **Input Payload:** Current application volume, target intake capacity, regional trend queries.
- **Output Artifact:** Projected enrollment yield rate, marketing channel effectiveness score, and outreach action recommendations.
- **ROI Formula:** `25 hours saved` × `₹800/hour admission director rate` = `₹20,000 cost savings per season`.
- **Endpoints:** Streaming: `POST /api/v1/officers/admissions/stream` | Sync: `POST /api/v1/officers/admissions/predict-yield`.

### 5. Finance Officer
- **Persona Prompt:** Institutional bursar and chartered accountant reconciling tuition dues, scholarship disbursements, and bank transactions.
- **Input Payload:** Fee structure details, outstanding balance ranges, payment transaction queries.
- **Output Artifact:** Defaulter summary, cash flow forecast, reconciliation variance analysis.
- **ROI Formula:** `35 hours saved` × `₹628/hour bursar rate` = `₹22,000 cost savings per quarter`.
- **Endpoints:** Streaming: `POST /api/v1/officers/finance/stream` | Sync: `POST /api/v1/officers/finance/reconcile`.
