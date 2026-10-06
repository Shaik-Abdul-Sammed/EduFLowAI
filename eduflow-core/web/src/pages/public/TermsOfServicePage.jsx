import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using EduFlow AI OS, you acknowledge that you have read, understood, and agreed to be legally bound by these terms.' },
    { title: '2. Description of Service', content: 'EduFlow AI OS provides an educational AI workforce operating specialized officers for NAAC/NBA accreditation, automated timetabling, student success early-warnings, and fee reconciliation.' },
    { title: '3. User Obligations', content: 'Subscribing institutions and authorized administrative users are responsible for maintaining confidentiality of credentials and ensuring lawful collection and processing of student data.' },
    { title: '4. Institutional Data Sovereignty', content: 'All institutional academic records, faculty profiles, and student rosters remain the sole intellectual and proprietary property of the subscriber institution. EduFlow does not monetize student data.' },
    { title: '5. Payment Terms & Invoicing', content: 'Subscription fees are billed under customized enterprise or pilot agreements, payable via direct UPI or authorized bank transfer within 30 days of invoice receipt.' },
    { title: '6. Refund Policy', content: 'Pilot subscriptions are backed by service satisfaction guarantees. Pro-rated adjustments are available in cases of verified platform SLA non-compliance.' },
    { title: '7. Termination', content: 'Either party may terminate the agreement upon 30 days written notice. Upon termination, institutions are entitled to an unhindered complete export of all data in open formats.' },
    { title: '8. Limitation of Liability', content: 'EduFlow provides assistive intelligence for administrative review. Final statutory submissions (such as NAAC SSR filings or NIRF uploads) require verified institutional officer sign-off.' },
    { title: '9. Governing Law & Dispute Resolution', content: 'These terms are governed and construed under the laws of the Republic of India. Any legal dispute shall fall under the exclusive jurisdiction of the competent courts in Karnataka/Telangana.' },
    { title: '10. Contact Information', content: 'For legal and regulatory inquiries: legal@eduflow.ai | EduFlow Technologies Private Limited.' }
  ]

  return (
    <div className="container py-5" style={{ maxWidth: '860px' }}>
      <div className="mb-4 text-center">
        <h1 className="fw-bold d-flex align-items-center justify-content-center">
          <FileText className="me-2 text-primary" /> Terms of Service
        </h1>
        <p className="text-muted">Last Updated: October 2026 | Version 1.0 (India Compliance)</p>
      </div>

      <div className="card shadow-sm border-0 p-4 bg-white mb-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="mb-4">
            <h5 className="fw-bold text-dark">{sec.title}</h5>
            <p className="text-muted mb-0" style={{ lineHeight: '1.7' }}>{sec.content}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/" className="btn btn-outline-primary">Return to Home</Link>
      </div>
    </div>
  )
}
