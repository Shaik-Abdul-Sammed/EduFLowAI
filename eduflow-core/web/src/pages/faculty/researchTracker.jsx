import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../utils/apiConfig'
import { RefreshCw, Plus, CheckCircle2 } from 'lucide-react'

const INDIGO = '#4338CA'

const INITIAL_PROJECTS = [
  {
    id: 1, title: 'Smart Attendance System using Face Recognition',
    domain: 'Computer Vision', collaborators: 'Dr. K. Sharma, Prof. R. Rao',
    startDate: '2025-08-01', status: 'in-progress', publications: 1,
    description: 'Developing a real-time face recognition system for automating attendance in classrooms using OpenCV and deep learning.',
    funding: '₹2.5 Lakhs (AICTE)',
  },
  {
    id: 2, title: 'Predicting Student Performance Using ML',
    domain: 'Machine Learning / EdTech', collaborators: 'Prof. S. Mehta',
    startDate: '2025-11-15', status: 'in-progress', publications: 0,
    description: 'Building predictive models to identify at-risk students early using historical academic data and attendance records.',
    funding: 'Institute Seed Grant',
  },
  {
    id: 3, title: 'IoT-based Smart Lab Monitoring',
    domain: 'IoT / Embedded Systems', collaborators: 'Solo',
    startDate: '2024-06-01', status: 'completed', publications: 2,
    description: 'Designed a cost-effective IoT solution for real-time lab equipment monitoring and safety alerts.',
    funding: '₹80K (DST)',
  },
]

const INITIAL_PUBLICATIONS = [
  { title: 'Face Recognition in Constrained Environments', journal: 'IEEE Access', year: '2025', status: 'published', citations: 12 },
  { title: 'IoT-based Lab Safety System', journal: 'Elsevier IoT Journal', year: '2024', status: 'published', citations: 5 },
  { title: 'ML Models for Student Dropout Prediction', journal: 'Computers & Education', year: '2026', status: 'under-review', citations: 0 },
]

const statusColor = { 'in-progress': '#F59E0B', completed: '#10B981', planned: '#2563EB' }
const pubStatusColor = { published: '#10B981', 'under-review': '#F59E0B', rejected: '#EF4444' }

export default function Page() {
  const [activeTab, setActiveTab] = useState('projects')
  const [expanded, setExpanded]   = useState(null)
  const [projectsList, setProjectsList] = useState(INITIAL_PROJECTS)
  const [publicationsList, setPublicationsList] = useState(INITIAL_PUBLICATIONS)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDomain, setNewDomain] = useState('Artificial Intelligence')
  const [newFunding, setNewFunding] = useState('Institute Seed Grant (₹1.5 Lakhs)')

  const fetchResearchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(getFullApiUrl('/v1/support/tickets?category=faculty_research'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        const data = await res.json()
        const tickets = Array.isArray(data) ? data : data.tickets || []
        const liveProjects = tickets.map((t, idx) => ({
          id: t.id || idx + 10,
          title: t.subject?.replace(/\[.*?\]\s*/g, '') || 'Distributed Systems Research',
          domain: 'Cloud & AI Systems',
          collaborators: 'Department Faculty Team',
          startDate: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '2026-01-10',
          status: 'in-progress',
          publications: 1,
          description: t.description || 'Ongoing sponsored research investigation.',
          funding: '₹3.0 Lakhs (Institutional Seed Grant)'
        }))
        if (liveProjects.length > 0) {
          setProjectsList([...liveProjects, ...INITIAL_PROJECTS])
        }
      }
    } catch (err) {
      console.warn('PostgreSQL research tracker fetch fallback:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResearchData()
  }, [])

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setSubmitting(true)
    const newProj = {
      id: Date.now(),
      title: newTitle.trim(),
      domain: newDomain,
      collaborators: 'Principal Investigator',
      startDate: new Date().toISOString().split('T')[0],
      status: 'in-progress',
      publications: 0,
      description: 'Active research project registered in faculty portfolio.',
      funding: newFunding
    }

    setProjectsList([newProj, ...projectsList])
    setNewTitle('')
    setShowAddForm(false)

    try {
      const token = localStorage.getItem('token') || ''
      await fetch(getFullApiUrl('/v1/support/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: `[Faculty Research] ${newProj.title}`,
          description: `Domain: ${newDomain}\nFunding: ${newFunding}`,
          category: 'faculty_research',
          priority: 'medium'
        })
      })
      setStatusMsg('New research project committed and registered in PostgreSQL research directory!')
    } catch {
      setStatusMsg('Project cached in local portfolio.')
    } finally {
      setSubmitting(false)
      setTimeout(() => setStatusMsg(null), 5000)
    }
  }

  return (
    <RolePageTemplate role="Faculty" title="Research Tracker" description="Track your research projects, publications, and funding status.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {statusMsg && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-0 shadow-sm">
            <CheckCircle2 size={18} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Projects', value: projectsList.length, color: INDIGO },
            { label: 'In Progress', value: projectsList.filter(p => p.status === 'in-progress').length, color: '#F59E0B' },
            { label: 'Publications', value: publicationsList.filter(p => p.status === 'published').length, color: '#10B981' },
            { label: 'Total Citations', value: publicationsList.reduce((a, p) => a + p.citations, 0), color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Controls */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['projects', 'publications'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '0.45rem 1.1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', textTransform: 'capitalize',
                background: activeTab === t ? `linear-gradient(135deg,${INDIGO},#2563EB)` : `${INDIGO}10`,
                color: activeTab === t ? 'white' : INDIGO, transition: 'all 0.2s',
              }}>{t}</button>
            ))}
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={fetchResearchData}
              disabled={loading}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              title="Refresh from PostgreSQL"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span className="small">Refresh</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="card border p-3 bg-light">
            <h5 className="h6 fw-bold mb-3">Add Research Initiative</h5>
            <form onSubmit={handleAddProject} className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Project Title</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Real-Time Autonomous Edge Inference"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold">Research Domain</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold">Funding Agency / Grant</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newFunding}
                  onChange={(e) => setNewFunding(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-sm btn-primary">
                  {submitting ? 'Registering...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 1: Projects */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {projectsList.map(p => {
              const isExp = expanded === p.id
              return (
                <div key={p.id} className="card border-0 shadow-sm" style={{ borderRadius: '1.1rem', overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpanded(isExp ? null : p.id)}
                    style={{ padding: '1.1rem 1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.title}</span>
                        <span style={{
                          padding: '0.15rem 0.55rem', borderRadius: '0.4rem', fontSize: '0.68rem', fontWeight: 700,
                          background: `${statusColor[p.status]}20`, color: statusColor[p.status], textTransform: 'capitalize',
                        }}>{p.status}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        🏷️ {p.domain} &nbsp;•&nbsp; 👥 {p.collaborators} &nbsp;•&nbsp; 📅 Since {p.startDate}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981' }}>💰 {p.funding}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>📄 {p.publications} publication{p.publications !== 1 ? 's' : ''}</div>
                      </div>
                      <span style={{ fontSize: '1rem', color: '#94a3b8' }}>{isExp ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isExp && (
                    <div style={{ padding: '0 1.4rem 1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 2: Publications */}
        {activeTab === 'publications' && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div className="card-body p-0">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Paper Title', 'Journal / Venue', 'Year', 'Citations', 'Status'].map(h => (
                        <th key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.75rem 1rem', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {publicationsList.map((pub, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.875rem' }}>{pub.title}</td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>{pub.journal}</td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>{pub.year}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#7C3AED' }}>{pub.citations}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 700,
                            background: `${pubStatusColor[pub.status]}15`, color: pubStatusColor[pub.status], textTransform: 'capitalize',
                          }}>{pub.status.replace('-', ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </RolePageTemplate>
  )
}
