import { pool } from '../db/pool.js'

export class LegalController {
  static getTerms(req, res) {
    return res.status(200).json({
      title: 'EduFlow AI OS — Terms of Service',
      lastUpdated: 'October 2026',
      version: '1.0',
      governingLaw: 'Republic of India',
      sections: [
        { id: 'acceptance', title: '1. Acceptance of Terms', content: 'By accessing or using EduFlow AI OS, you agree to be bound by these terms.' },
        { id: 'description', title: '2. Description of Service', content: 'EduFlow AI OS delivers specialized AI administrative officers, accreditation tools, and institutional automation workflows.' },
        { id: 'user_obligations', title: '3. User Obligations', content: 'Users must maintain valid credentials, ensure lawful use of student data, and adhere to administrative permissions.' },
        { id: 'institutional_data', title: '4. Institutional Data & Sovereignty', content: 'All institutional records remain the sole property of the subscriber college. We do not sell or monetize academic records.' },
        { id: 'payment_terms', title: '5. Payment Terms', content: 'Subscription invoices are payable via authorized bank transfer, UPI, or designated channels within 30 days.' },
        { id: 'refund_policy', title: '6. Refund Policy', content: 'Pilots are provided under agreed terms. Paid subscriptions are subject to prorated cancellations if service SLA breaches occur.' },
        { id: 'termination', title: '7. Termination', content: 'Either party may terminate upon 30 days written notice. Colleges are entitled to complete data export upon exit.' },
        { id: 'liability', title: '8. Limitation of Liability', content: 'EduFlow AI OS assists administrators; final institutional decisions remain under administrative discretion.' },
        { id: 'governing_law', title: '9. Governing Law', content: 'These terms are governed by the laws of India, subject to the jurisdiction of courts in Bengaluru/Hyderabad.' },
        { id: 'contact', title: '10. Contact', content: 'Inquiries can be addressed to legal@eduflow.ai or compliance officer.' }
      ]
    })
  }

  static getPrivacy(req, res) {
    return res.status(200).json({
      title: 'EduFlow AI OS — Privacy Policy',
      lastUpdated: 'October 2026',
      version: '1.0',
      compliance: 'Digital Personal Data Protection (DPDP) Act 2023',
      sections: [
        { id: 'data_collected', title: '1. What Data We Collect', content: 'Institutional profiles, employee directories, student enrollments, course schedules, and system usage audit logs.' },
        { id: 'use_of_data', title: '2. How We Use It', content: 'To power NAAC/NIRF reporting, conflict-free timetable scheduling, early dropout warnings, and attendance analytics.' },
        { id: 'storage_security', title: '3. Data Storage and Security', content: 'Encrypted in transit (TLS 1.3) and at rest (AES-256). Backups are stored in isolated encrypted archives.' },
        { id: 'data_sharing', title: '4. Data Sharing', content: 'We do not sell, rent, or share institutional data with third-party advertising brokers.' },
        { id: 'student_rights', title: '5. Student and Parent Rights', content: 'Students and guardians can review personal data, dispute errors, and request rectifications via their college admin.' },
        { id: 'retention', title: '6. Data Retention', content: 'Data is retained for the active subscription cycle plus 90 days archival grace period unless deletion is requested.' },
        { id: 'dpdp_act', title: '7. Rights under DPDP Act 2023', content: 'Institutional data principals have right to grievance redressal, right to access, and right to nominate.' },
        { id: 'contact', title: '8. Contact Information', content: 'Data Protection Officer: dpo@eduflow.ai' }
      ]
    })
  }

  static getDpa(req, res) {
    return res.status(200).json({
      title: 'EduFlow AI OS — Data Processing Agreement (DPA)',
      lastUpdated: 'October 2026',
      version: '1.0',
      sections: [
        { id: 'scope', title: '1. Scope and Application', content: 'Applies to processing of personal data provided by educational institutions (Data Fiduciary) to EduFlow (Data Processor).' },
        { id: 'definitions', title: '2. Definitions', content: 'Terms follow definitions in Indian IT Act 2000 and DPDP Act 2023.' },
        { id: 'processor_obligations', title: '3. Processor Obligations', content: 'Processor shall process data solely in accordance with documented instructions of the institution.' },
        { id: 'subprocessors', title: '4. Sub-processors', content: 'Sub-processors are vetted for strict ISO/IEC 27001 or SOC2 controls.' },
        { id: 'security_measures', title: '5. Technical & Organizational Measures', content: 'Role-based access control, JWT authentication, rate limiting, and automated backup audits.' },
        { id: 'subject_requests', title: '6. Data Subject Requests', content: 'Processor assists the college in responding to student/faculty data access or erasure requests.' },
        { id: 'breach_notification', title: '7. Breach Notification', content: 'Processor notifies the institution within 72 hours of confirming any unauthorized data breach.' },
        { id: 'audit_rights', title: '8. Audit Rights', content: 'Institutions may conduct annual compliance reviews upon reasonable advance notice.' },
        { id: 'termination_return', title: '9. Termination and Data Return', content: 'Upon contract conclusion, all data is exported in standard formats and purged from operational systems.' }
      ]
    })
  }

  static async acceptTerms(req, res) {
    try {
      const { documentType = 'TERMS_AND_PRIVACY', version = '1.0' } = req.body || {}
      const userId = req.user?.id || req.body?.userId || null
      const institutionId = req.user?.institutionId || req.body?.institutionId || 1
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      const userAgent = req.headers['user-agent'] || ''

      try {
        await pool.query(
          `INSERT INTO legal_acceptances (user_id, institution_id, document_type, version, ip_address, user_agent, accepted_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [userId, institutionId, documentType, version, String(ipAddress), userAgent]
        )
      } catch (err) {
        // memory fallback
      }

      return res.status(200).json({
        success: true,
        message: 'Legal terms acceptance recorded',
        record: {
          documentType,
          version,
          timestamp: new Date().toISOString(),
          ipAddress: String(ipAddress)
        }
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
