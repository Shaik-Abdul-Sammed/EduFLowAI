import { useState } from 'react'
import { GraduationCap, Search, CheckCircle2, AlertCircle, Clock, BookOpen, Award } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function DegreeAuditPage() {
  const [rollInput, setRollInput] = useState('2024-CSE-042')
  const [auditedRoll, setAuditedRoll] = useState('2024-CSE-042')
  const [loading, setLoading] = useState(false)

  // Mock student degree audit profile
  const auditData = {
    student: {
      name: 'Aditya Sharma',
      rollNumber: auditedRoll,
      program: 'B.Tech in Computer Science & Engineering',
      catalogYear: '2024–2028',
      cgpa: '8.74',
      status: 'On Track for Graduation',
      totalRequired: 160,
      totalEarned: 138,
      inProgress: 14,
    },
    categories: [
      {
        name: 'General Education Core (GenEd)',
        requiredCredits: 28,
        earnedCredits: 28,
        status: 'COMPLETE',
        courses: [
          { code: 'MATH-101', title: 'Calculus & Linear Algebra', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'PHYS-102', title: 'Engineering Physics & Lab', credits: 4, grade: 'A-', status: 'COMPLETE' },
          { code: 'ENG-103', title: 'Technical Communication & Ethics', credits: 4, grade: 'B+', status: 'COMPLETE' },
          { code: 'ENV-104', title: 'Environmental Science & Sustainability', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'PROG-105', title: 'Problem Solving via Python', credits: 4, grade: 'A+', status: 'COMPLETE' },
          { code: 'BEE-106', title: 'Basic Electrical Engineering', credits: 4, grade: 'B', status: 'COMPLETE' },
          { code: 'MATH-107', title: 'Discrete Mathematical Structures', credits: 4, grade: 'A', status: 'COMPLETE' },
        ]
      },
      {
        name: 'Departmental Major Core',
        requiredCredits: 84,
        earnedCredits: 76,
        status: 'IN_PROGRESS',
        courses: [
          { code: 'CS-201', title: 'Data Structures & Algorithms', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CS-202', title: 'Computer Organization & Architecture', credits: 4, grade: 'B+', status: 'COMPLETE' },
          { code: 'CS-203', title: 'Database Management Systems', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CS-204', title: 'Operating Systems & Concurrency', credits: 4, grade: 'A-', status: 'COMPLETE' },
          { code: 'CS-301', title: 'Computer Networks & Distributed Systems', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CS-302', title: 'Theory of Computation', credits: 4, grade: 'B+', status: 'COMPLETE' },
          { code: 'CS-303', title: 'Design & Analysis of Algorithms', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CS-304', title: 'Software Engineering & Agile Methodologies', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CS-401', title: 'Compiler Design', credits: 4, grade: 'IP', status: 'IN_PROGRESS' },
          { code: 'CS-402', title: 'Cloud Computing Infrastructure', credits: 4, grade: 'IP', status: 'IN_PROGRESS' },
        ]
      },
      {
        name: 'Electives & Capstone Specialization',
        requiredCredits: 48,
        earnedCredits: 34,
        status: 'IN_PROGRESS',
        courses: [
          { code: 'CSE-501', title: 'Artificial Intelligence & Neural Nets', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CSE-502', title: 'Natural Language Processing', credits: 4, grade: 'A', status: 'COMPLETE' },
          { code: 'CSE-503', title: 'Information Security & Cryptography', credits: 4, grade: 'B+', status: 'COMPLETE' },
          { code: 'OPEN-301', title: 'Organizational Behavior & Leadership', credits: 3, grade: 'A', status: 'COMPLETE' },
          { code: 'CAP-499', title: 'Senior Capstone Design Project I', credits: 6, grade: 'IP', status: 'IN_PROGRESS' },
          { code: 'CAP-500', title: 'Senior Capstone Design Project II', credits: 6, grade: 'PENDING', status: 'PENDING' },
        ]
      }
    ]
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!rollInput.trim()) return
    setLoading(true)
    setTimeout(() => {
      setAuditedRoll(rollInput.trim().toUpperCase())
      setLoading(false)
    }, 250)
  }

  const completionPct = Math.round((auditData.student.totalEarned / auditData.student.totalRequired) * 100)

  return (
    <RolePageTemplate role="Admin" title="Degree Audit & Academic Progress" icon={<GraduationCap size={22} />}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 8px' }}>
        {/* Search Bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={rollInput}
                onChange={e => setRollInput(e.target.value)}
                placeholder="Enter Student Roll Number (e.g. 2024-CSE-042)"
                aria-label="Student Roll Number for Degree Audit"
                style={{
                  width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
                  border: '1px solid #cbd5e1', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8,
                padding: '9px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              {loading ? 'Evaluating...' : 'Run Degree Audit'}
            </button>
          </form>
        </div>

        {/* Student Profile Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 12, padding: 22, color: '#fff', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{auditData.student.name}</h2>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>
                  {auditData.student.rollNumber}
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 14, opacity: 0.85 }}>{auditData.student.program}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: 0.8, flexWrap: 'wrap' }}>
                <span>Catalog: <strong>{auditData.student.catalogYear}</strong></span>
                <span>Cumulative GPA: <strong>{auditData.student.cgpa}</strong></span>
                <span>Status: <strong style={{ color: '#86efac' }}>{auditData.student.status}</strong></span>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: 160 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Degree Completion</span>
              <div style={{ fontSize: 28, fontWeight: 800, margin: '2px 0' }}>{completionPct}%</div>
              <span style={{ fontSize: 12, opacity: 0.85 }}>{auditData.student.totalEarned} / {auditData.student.totalRequired} Credits</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 16 }}>
            <div style={{ width: `${completionPct}%`, height: '100%', background: '#4ade80', borderRadius: 999 }} />
          </div>
        </div>

        {/* Audit Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {auditData.categories.map((cat, cIdx) => (
            <div key={cIdx} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color="#4f46e5" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1e293b' }}>{cat.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    {cat.earnedCredits} / {cat.requiredCredits} Credits
                  </span>
                  {cat.status === 'COMPLETE' ? (
                    <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Complete
                    </span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> In Progress
                    </span>
                  )}
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Course Code</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Course Title</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Credits</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Grade</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.courses.map((crs, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{crs.code}</td>
                        <td style={{ padding: '10px 14px', color: '#334155' }}>{crs.title}</td>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>{crs.credits}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: crs.grade === 'IP' ? '#d97706' : '#15803d' }}>
                          {crs.grade}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {crs.status === 'COMPLETE' && (
                            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              <CheckCircle2 size={14} /> Satisfied
                            </span>
                          )}
                          {crs.status === 'IN_PROGRESS' && (
                            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              <Clock size={14} /> Registered (IP)
                            </span>
                          )}
                          {crs.status === 'PENDING' && (
                            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertCircle size={14} /> Outstanding
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RolePageTemplate>
  )
}
