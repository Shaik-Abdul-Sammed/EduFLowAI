import React from 'react'
import { Link } from 'react-router-dom'
import { FileCheck, ShieldAlert } from 'lucide-react'

export default function DataProcessingAgreementPage() {
  const sections = [
    { title: '1. Scope and Application', content: 'This Data Processing Agreement (DPA) governs the processing of personal and institutional data between the educational institution ("Data Fiduciary") and EduFlow AI ("Data Processor").' },
    { title: '2. Definitions', content: '"Personal Data", "Processing", and "Data Breach" shall have meanings corresponding to the IT Act 2000 and the DPDP Act 2023 of India.' },
    { title: '3. Obligations of the Processor', content: 'EduFlow agrees to process data strictly on documented administrative instructions from the subscriber college, ensuring personnel authorized to process data are committed to non-disclosure confidentiality.' },
    { title: '4. Sub-processors', content: 'Any cloud or computational infrastructure providers utilized undergo annual ISO/IEC 27001 or SOC-2 audits. No unauthorized sub-contracting occurs without notice.' },
    { title: '5. Technical and Organizational Security', content: 'EduFlow maintains granular role-based access control, automated rate limiters, salted hashing (bcrypt), session timeouts, and IP whitelisting protocols.' },
    { title: '6. Support for Data Subject Inquiries', content: 'The Processor provides automated export and query tools enabling the college to respond promptly to student or parent access, correction, or erasure requests.' },
    { title: '7. Breach Notification Timelines', content: 'EduFlow shall notify the institution\'s administrator within seventy-two (72) hours upon becoming aware of any confirmed unauthorized security breach impacting personal records.' },
    { title: '8. Institutional Audit Rights', content: 'Institutions maintain the right to inspect platform security postures, verify nightly backup logs, and request compliance verification reports.' },
    { title: '9. Return and Purging of Institutional Data', content: 'Upon contract cessation, EduFlow provides thirty (30) days for complete archival download, after which all production and replica database records are irreversibly wiped.' }
  ]

  return (
    <div className="container py-5" style={{ maxWidth: '860px' }}>
      <div className="mb-4 text-center">
        <h1 className="fw-bold d-flex align-items-center justify-content-center">
          <FileCheck className="me-2 text-primary" /> Data Processing Agreement (DPA)
        </h1>
        <p className="text-muted">Standard Institutional Data Processor Agreement | Version 1.0 (2026)</p>
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
