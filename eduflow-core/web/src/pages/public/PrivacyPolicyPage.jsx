import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Lock } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const sections = [
    { title: '1. What Data We Collect', content: 'We collect institutional account data (college contact details, billing metadata), administrative directories (employee IDs, department designations), and student demographic & academic performance records provided during roster onboarding.' },
    { title: '2. How We Use Information', content: 'Information is processed exclusively to deliver automated academic scheduling, generate NAAC/NIRF accreditation criteria matrices, calculate student attendance shortage warnings, and facilitate institutional fee notifications.' },
    { title: '3. Data Storage & Security', content: 'All records are hosted in encrypted databases within Indian sovereign cloud regions complying with MEITY directives. Sensitive data is protected using AES-256 encryption at rest and TLS 1.3 in transit.' },
    { title: '4. Third-Party Data Sharing', content: 'EduFlow does not sell, trade, or share student or institutional data with commercial third-party advertisers or data brokers under any circumstances.' },
    { title: '5. Student & Parent Rights', content: 'Students and guardians have the right to inspect personal academic attendance records, dispute logging discrepancies, and request rectifications through their institution\'s administrative office.' },
    { title: '6. Data Retention & Portability', content: 'Data is maintained throughout the active service contract and can be fully exported at any moment via the Administrator Data Export utility. Upon service closure, data is securely purged.' },
    { title: '7. Compliance with the DPDP Act 2023', content: 'EduFlow functions as a Data Processor adhering to the Digital Personal Data Protection Act 2023. We maintain designated grievance redressal channels and enforce strict Purpose Limitation and Data Minimization.' },
    { title: '8. Contact the Grievance Redressal Officer', content: 'For privacy inquiries or grievance redressal, reach our designated Data Protection Officer at dpo@eduflow.ai.' }
  ]

  return (
    <div className="container py-5" style={{ maxWidth: '860px' }}>
      <div className="mb-4 text-center">
        <h1 className="fw-bold d-flex align-items-center justify-content-center">
          <Shield className="me-2 text-primary" /> Privacy Policy
        </h1>
        <p className="text-muted">Digital Personal Data Protection (DPDP) Act 2023 Compliant | October 2026</p>
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
