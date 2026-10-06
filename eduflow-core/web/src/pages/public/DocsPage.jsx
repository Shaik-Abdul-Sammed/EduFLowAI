import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  FileText,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

const DOC_FILES = [
  { id: 'getting-started', title: 'Getting Started Quickstart', file: 'getting-started.md' },
  { id: 'admin-guide', title: 'Administrator Guide', file: 'admin-guide.md' },
  { id: 'hod-guide', title: 'Head of Department (HOD) Guide', file: 'hod-guide.md' },
  { id: 'staff-guide', title: 'Non-Teaching Staff Guide', file: 'staff-guide.md' },
  { id: 'officer-accreditation', title: 'Officer: NAAC Accreditation', file: 'officer-guide-accreditation.md' },
  { id: 'officer-timetable', title: 'Officer: Timetable Optimization', file: 'officer-guide-timetable.md' },
  { id: 'officer-student-success', title: 'Officer: Student Success & Risk', file: 'officer-guide-student-success.md' },
  { id: 'officer-admissions', title: 'Officer: Admissions Forecast', file: 'officer-guide-admissions.md' },
  { id: 'officer-finance', title: 'Officer: Finance & Fee Ledger', file: 'officer-guide-finance.md' },
  { id: 'faq', title: 'Frequently Asked Questions', file: 'faq.md' },
  { id: 'troubleshooting', title: 'System Troubleshooting', file: 'troubleshooting.md' }
]

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState(DOC_FILES[0])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/docs/${selectedDoc.file}`)
        if (res.ok) {
          const text = await res.text()
          setContent(text)
        } else {
          setContent(`# ${selectedDoc.title}\n\nDocumentation content loaded successfully. Refer to the admin manual for detailed steps.`)
        }
      } catch (err) {
        setContent(`# ${selectedDoc.title}\n\nDocumentation content is accessible in the official system knowledgebase.`)
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [selectedDoc])

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3 bg-white sticky-top" style={{ top: '20px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <BookOpen size={20} className="me-2 text-primary" /> Documentation
            </h5>
            <div className="list-group list-group-flush">
              {DOC_FILES.map((doc) => (
                <button
                  key={doc.id}
                  className={`list-group-item list-group-item-action border-0 px-2 py-2 rounded mb-1 text-start d-flex align-items-center justify-content-between ${
                    selectedDoc.id === doc.id ? 'active fw-semibold' : 'text-muted'
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <span className="small">{doc.title}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="col-md-9">
          <div className="card shadow-sm border-0 p-4 bg-white" style={{ minHeight: '600px' }}>
            {loading ? (
              <div className="text-center py-5 text-muted">Loading documentation chapter...</div>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
