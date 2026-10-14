# EduFlow AI OS — Digital Personal Data Protection Act (DPDP Act 2023) Compliance Framework

> Institutional Regulatory Reference: The Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023, Republic of India)

---

## 1. Executive Summary

EduFlow AI OS is engineered specifically to ensure educational institutions (Universities, Autonomous Colleges, Engineering Institutes) achieve **100% statutory compliance** with India's **Digital Personal Data Protection Act (DPDP Act 2023)**. 

In the EduFlow deployment model:
- The **University / Institution** is the **Data Fiduciary** determining the purpose and means of processing personal data.
- **EduFlow AI Systems** acts as the **Data Processor** processing data solely on behalf of and per the lawful instructions of the Data Fiduciary.

---

## 2. Statutory Section-by-Section Compliance Matrix

| DPDP Act 2023 Section | Statutory Requirement | EduFlow Technical Implementation | Audit Status |
|---|---|---|---|
| **Section 5 (Notice)** | Informing Data Principal of personal data sought and purpose of processing in clear, accessible language. | Pre-authentication multilingual consent and notice banner displayed at login; institutional privacy policy rendered before profile creation. | **COMPLIANT** |
| **Section 6 (Consent)** | Consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action. | Explicit granular checkboxes on onboarding and mobile enrollment; consent logs immutably stored with timestamp, IP, and version. | **COMPLIANT** |
| **Section 8(1) (Fiduciary Duties)** | Implement appropriate technical and organizational measures to ensure effective compliance. | Role-Based Access Control (RBAC), multi-factor authentication for administrators, and continuous security audits. | **COMPLIANT** |
| **Section 8(5) (Security Safeguards)** | Protect personal data in its possession by taking reasonable security safeguards to prevent personal data breach. | • In Transit: Strict TLS 1.3 encryption with modern cipher suites.<br>• At Rest: AES-256 Transparent Database Encryption (TDE).<br>• Isolation: PostgreSQL Row-Level Security (RLS) enforcing tenant separation. | **COMPLIANT** |
| **Section 8(7) (Data Erasure)** | Erase personal data upon purpose completion or consent withdrawal, unless retention is required under other statutory laws. | Automated `retentionEnforcer.js` worker periodically purges expired audit trails (730 days) and student session records unless flagged for academic degree auditing. | **COMPLIANT** |
| **Section 9 (Children's Data)** | Verifiable parental consent before processing data of a child (<18 years); prohibition of behavioral tracking. | Automated guardian linking via `guardianwatch` routes; behavioral tracking and targeted advertising are permanently hard-disabled in the platform code. | **COMPLIANT** |
| **Section 10 (Significant Data Fiduciary)** | Appointment of Data Protection Officer (DPO), independent data auditor, and periodic DPIA. | Compliance center (`/admin-dashboard/compliance`) generates real-time DPIA assessments and automated Auditor Bundles (.ZIP) for external assessors. | **COMPLIANT** |
| **Section 11 (Right to Access)** | Data Principal's right to obtain a summary of personal data and processing activities. | Self-service Student & Faculty Profile portals (`/profile`) providing full visibility of personal identity, attendance records, and transaction logs. | **COMPLIANT** |
| **Section 12 (Right to Correction/Erasure)** | Right to correct inaccurate data and erase data no longer necessary for specified purpose. | Standardized profile edit workflows and administrator data deletion pipeline with audit logging. | **COMPLIANT** |
| **Section 13 (Grievance Redressal)** | Readily available grievance redressal mechanism with statutory timelines. | Dedicated Support Tickets & Privacy Grievance module (`/admin-dashboard/support-tickets`) routing directly to institutional DPO. | **COMPLIANT** |
| **Section 16 (Cross-Border Transfer)** | Restriction on transfer of personal data outside India per Central Government notification. | **100% Sovereign Cloud Deployment**: All databases, application servers, and AI inference engines reside in India (AWS Mumbai ap-south-1 or campus on-premise servers). Zero cross-border data transfer. | **COMPLIANT** |

---

## 3. Data Classification & Retention Policy

EduFlow classifies university data into four regulatory tiers:

| Category | Typical Attributes | Legal Basis | Mandatory Retention | Storage Security |
|---|---|---|---|---|
| **Tier 1: Student Identity (PII)** | Roll No, Name, Aadhaar/Govt ID, Email, Phone | Academic Contract / Statutory Enrollment | Degree Completion + 5 Years | AES-256 + RLS isolation |
| **Tier 2: Academic & Attendance** | Class attendance, marks, grade cards, SSR scores | University Statute & UGC/NAAC Mandate | Permanent Academic Transcript (10+ Years) | Immutable ledger, audited |
| **Tier 3: Financial Records** | Invoice #, fee amount, UPI UTR, payment receipts | Income Tax Act & University Accounts Code | 7 Financial Years | Read-only ledger, tamper-proof |
| **Tier 4: System Telemetry** | IP addresses, login timestamps, API access logs | Security Forensics (CERT-In Mandate) | 180 Days to 730 Days | Auto-purged via `retentionEnforcer` |

---

## 4. Institutional Auditor Verification Sign-Off

The technical safeguards within EduFlow AI OS have been validated against:
- Digital Personal Data Protection Act, 2023
- Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011
- CERT-In Cyber Security Directions (April 2022)
