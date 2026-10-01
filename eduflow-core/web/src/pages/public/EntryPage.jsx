import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { courseTracks, studentDummyIds } from '../../utils/studentCatalog'

const instituteName = 'EduFlow AI'

const roleCards = [
  { role: 'student', title: 'Student Portal', desc: 'Academic progress, assignments, fees, and mentor connect.', icon: '👨‍🎓', color: '#2563EB', lightColor: 'rgba(37,99,235,0.08)', gradClass: 'portal-card-student' },
  { role: 'faculty', title: 'Faculty Portal', desc: 'Attendance, marks entry, class analytics, and resources.', icon: '👨‍🏫', color: '#10B981', lightColor: 'rgba(16,185,129,0.08)', gradClass: 'portal-card-faculty' },
  { role: 'parent',  title: 'Parent Portal',  desc: 'Child performance, parent communication, alerts, and dues.', icon: '👨‍👩‍👧', color: '#F59E0B', lightColor: 'rgba(245,158,11,0.08)', gradClass: 'portal-card-parent' },
  { role: 'admin',   title: 'Admin Console',  desc: 'Institution-wide operations, reports, and controls.', icon: '⚙️', color: '#7C3AED', lightColor: 'rgba(124,58,237,0.08)', gradClass: 'portal-card-admin' },
  { role: 'visitor', title: 'Visitor Info', desc: 'Institution info, programs, campus tour, and admissions.', icon: '👁️', color: '#8B5CF6', lightColor: 'rgba(139,92,246,0.08)', gradClass: 'portal-card-visitor' },
]

const OFFICERS_PREVIEW = [
  { icon: '🏛️', name: 'AI Accreditation Officer', desc: 'NAAC, NBA, AICTE reports. Auto-generated. Submission-ready.', color: '#8B5CF6', roi: '₹2.5L consulting saved' },
  { icon: '📅', name: 'AI Timetable Officer',      desc: 'Conflict-free schedules. Faculty workload balanced automatically.', color: '#2563EB', roi: '40 hrs/semester saved' },
  { icon: '🎓', name: 'AI Admission Officer',      desc: 'End-to-end admissions automation. Enquiry to enrollment.', color: '#10B981', roi: '60% faster processing' },
  { icon: '💰', name: 'AI Finance Officer',        desc: 'UPI reconciliation. Bank matching. Zero manual effort.', color: '#F59E0B', roi: '₹0 reconciliation errors' },
  { icon: '📊', name: 'AI Student Success Officer', desc: 'Predict dropout risk. Generate intervention plans instantly.', color: '#EF4444', roi: '15% retention improvement' },
]

const features = [
  { icon: '🤖', title: 'AI Administrative Workforce', desc: 'Five specialized AI Officers replace manual admin work', color: '#8B5CF6' },
  { icon: '🧠', title: 'Institutional Memory', desc: 'Digital Twin permanently remembers your institution', color: '#06B6D4' },
  { icon: '📄', title: 'Document Intelligence', desc: 'Import PDF, brochure, or website URL — AI extracts everything', color: '#10B981' },
  { icon: '⚡', title: 'Measurable ROI', desc: 'Every AI action shows hours saved and rupees saved', color: '#F59E0B' },
  { icon: '🌍', title: 'Multilingual', desc: 'English, Hindi, Telugu, Tamil and 6 more languages', color: '#10B981' },
  { icon: '🔌', title: 'Pluggable AI', desc: 'Gemini, GPT-4o, Claude, or your own local model', color: '#2563EB' },
  { icon: '📱', title: 'Native Apps Generated', desc: 'Flutter Android/iOS app built and compiled automatically', color: '#06B6D4' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'Your data never leaves your control. On-premise option available', color: '#EF4444' },
]

const stats = [
  { value: '284',  label: 'Admin Hours Saved / Month', icon: '⏱️', color: '#2563EB' },
  { value: '₹4.2L', label: 'Consulting Cost Saved',     icon: '💰', color: '#10B981' },
  { value: '12',   label: 'At-Risk Students Flagged',   icon: '📊', color: '#F59E0B' },
  { value: '78%',  label: 'Accreditation Readiness',    icon: '🏛️', color: '#8B5CF6' },
]

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    const numeric = parseInt(value.replace(/\D/g, ''), 10)
    if (isNaN(numeric)) { setTimeout(() => setDisplay(value), 0); return }
    let start = 0
    const step = Math.ceil(numeric / 40)
    const timer = setInterval(() => {
      start = Math.min(start + step, numeric)
      setDisplay(value.replace(/\d+/, start))
      if (start >= numeric) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

export default function EntryPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  return (
    <div className="container py-5 page-shell" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>

      {/* ── Hero ── */}
      <div className="entry-hero card border-0 mb-5" style={{ padding: '0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: '2rem', padding: '3rem 3rem',
          alignItems: 'center',
        }} className="flex-column flex-lg-row">
          <div style={{ animation: 'fadeInUp 0.6s ease' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.35rem 1rem',
              borderRadius: '2rem',
              background: 'var(--sidebar-link-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--svc-blue)',
              fontSize: '0.8rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '1.25rem',
            }}>
              🤖 AI Administrative Workforce for Education
            </span>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem',
            }}>
              <span className="text-gradient">{instituteName}</span>
              <br />
              <span style={{ color: 'var(--svc-navy)' }}>AI Operating System</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--app-text-muted)', maxWidth: 540, marginBottom: '2rem', lineHeight: 1.7 }}>
              Your institution gets five autonomous AI Officers. They generate NAAC reports, build timetables, process admissions, reconcile fees, and predict student dropout — 24/7, at zero marginal cost.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link
                className="btn btn-primary"
                to="/register-institution"
                style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}
              >
                🚀 Register Institution
              </Link>
              <Link
                className="btn btn-outline-primary"
                to="/login"
                style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}
              >
                🔓 Access Workspace
              </Link>
              <Link
                className="btn btn-outline-secondary"
                to="/services"
                style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}
              >
                ⚡ Automation Services
              </Link>
              <Link
                className="btn btn-link text-decoration-none"
                to="/directory"
                style={{ padding: '0.8rem 1rem', fontSize: '0.95rem' }}
              >
                Explore Modules →
              </Link>
            </div>
          </div>

          {/* Hero Illustration — Officer Grid */}
          <div className="d-none d-lg-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem',
            flexShrink: 0, width: 240,
          }}>
            {OFFICERS_PREVIEW.slice(0,4).map(o => (
              <div key={o.name} style={{
                background: `${o.color}14`, border: `1px solid ${o.color}30`,
                borderRadius: 12, padding: '0.7rem',
                textAlign: 'center', animation: 'float 5s ease-in-out infinite',
              }}>
                <div style={{ fontSize: '1.5rem' }}>{o.icon}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: o.color, marginTop: 4, lineHeight: 1.2 }}>
                  {o.name.replace('AI ','').replace(' Officer','')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="row g-3 mb-5" style={{ animation: 'fadeInUp 0.7s ease 0.1s both' }}>
        {stats.map((stat, i) => (
          <div key={stat.label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{
                fontSize: '2rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.35rem',
                background: `linear-gradient(135deg, ${stat.color}, ${stat.color}88)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                <AnimatedNumber value={stat.value} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Officers Preview ── */}
      <div className="mb-5" style={{ animation: 'fadeInUp 0.7s ease 0.15s both' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <span className="text-gradient">Your AI Officers</span>
          </h2>
          <p style={{ color: 'var(--app-text-muted)', fontSize: '0.95rem' }}>Five autonomous AI specialists, each replacing an entire department of manual work</p>
        </div>
        <div className="row g-3">
          {OFFICERS_PREVIEW.map((o) => (
            <div key={o.name} className="col-12 col-md-6 col-lg-4">
              <div style={{
                background: `${o.color}08`, border: `1px solid ${o.color}25`,
                borderRadius: 16, padding: '1.25rem',
                transition: 'all 0.2s ease', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${o.color}14`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = `${o.color}50` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${o.color}08`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${o.color}25` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '1.75rem' }}>{o.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: o.color }}>{o.name}</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)', marginBottom: '0.6rem', lineHeight: 1.5 }}>{o.desc}</p>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: o.color, background: `${o.color}15`, display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '2rem' }}>✓ {o.roi}</div>
              </div>
            </div>
          ))}
          <div className="col-12 col-md-6 col-lg-4">
            <Link to="/officers-dashboard" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(6,182,212,0.08))',
                border: '1px dashed rgba(37,99,235,0.4)', borderRadius: 16, padding: '1.25rem',
                height: '100%', minHeight: 120, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(6,182,212,0.08))'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: '1.75rem' }}>⚡</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563EB' }}>Launch AI Command Center</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--app-text-muted)' }}>See all officers in action →</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Automation Services Banner ── */}
      <div className="mb-5 card border-0 p-4 p-lg-5 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)', border: '1px solid #e0e7ff', animation: 'fadeInUp 0.7s ease 0.15s both' }}>
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-8">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 mb-2 fw-bold" style={{ fontSize: '0.8rem' }}>
              🛠️ Standalone Automation Workflows
            </span>
            <h2 className="fw-bold fs-2 text-dark mb-2">Buyable AI Services for Every College Need</h2>
            <p className="text-muted mb-0" style={{ maxWidth: 640 }}>
              Solve your institution's acute bottlenecks today. From NAAC accreditation packages to conflict-free timetable synthesis and student dropout alerts — buy turnkey automation packages starting at ₹10,000.
            </p>
          </div>
          <div className="col-12 col-lg-4 text-lg-end">
            <Link to="/services" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
              Explore All 7 Automation Services →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="mb-5" style={{ animation: 'fadeInUp 0.7s ease 0.2s both' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <span className="text-gradient">Built for Scale</span>
          </h2>
          <p style={{ color: 'var(--app-text-muted)', fontSize: '0.95rem' }}>Enterprise-grade infrastructure, AI-first by design</p>
        </div>
        <div className="row g-3">
          {features.map((feature, idx) => (
            <div key={idx} className="col-6 col-md-3">
              <div className="feature-card">
                <div style={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: 'var(--surface-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', margin: '0 auto 1rem',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: feature.color, marginBottom: '0.4rem' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)', marginBottom: 0, lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Role Cards ── */}
      <div className="mb-5" style={{ animation: 'fadeInUp 0.7s ease 0.3s both' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <span className="text-gradient">Choose Your Portal</span>
          </h2>
          <p style={{ color: 'var(--app-text-muted)', fontSize: '0.95rem' }}>Each role gets a fully tailored dashboard experience</p>
        </div>
        <div className="row g-4">
          {roleCards.map(item => (
              <div key={item.role} className="col-12 col-md-6">
                <Link to={item.role === 'visitor' ? '/visitor-dashboard' : '/login'} style={{ textDecoration: 'none' }}>
                <div className={`card border-0 shadow-sm portal-card ${item.gradClass}`}>
                  <div className="card-body p-4">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
                        background: item.lightColor,
                        border: `1px solid ${item.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem',
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: item.color, marginBottom: '0.35rem' }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--app-text-muted)', marginBottom: 0, lineHeight: 1.6 }}>
                          {item.desc}
                        </p>
                      </div>
                      <span style={{ marginLeft: 'auto', color: item.color, fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Demo & Tracks ── */}
      <div className="row g-4 mb-5" style={{ animation: 'fadeInUp 0.7s ease 0.4s both' }}>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1.25rem' }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.25rem' }}>
                👥 Try Demo Access
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)', marginBottom: '1.25rem' }}>
                Login with these test credentials to explore the platform
              </p>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {studentDummyIds.map(student => (
                  <div key={student.id} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(37,99,235,0.04)',
                    border: '1px solid rgba(37,99,235,0.12)',
                    borderRadius: '0.75rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.04)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.12)' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--app-text-muted)' }}>{student.stream} · {student.section}</div>
                    </div>
                    <span style={{
                      background: 'linear-gradient(135deg,#2563EB,#06B6D4)',
                      color: 'white', padding: '0.25rem 0.7rem',
                      borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {student.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1.25rem' }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10B981', marginBottom: '0.25rem' }}>
                🎯 Academic Tracks
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)', marginBottom: '1.25rem' }}>
                Available entrance exam preparation programs
              </p>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {courseTracks.map(track => (
                  <div key={track.title} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(16,185,129,0.05)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s ease', cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.05)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{track.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--app-text-muted)', marginTop: '0.2rem' }}>{track.stream} · {track.section}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.2rem', fontWeight: 600 }}>✓ {track.focus}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div style={{
        borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1e3a8a 50%, #0891b2 100%)',
        position: 'relative', overflow: 'hidden',
        animation: 'fadeInUp 0.7s ease 0.5s both',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', right: '-5%', width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
            Deploy Your AI Officers Today
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 1.75rem' }}>
            Register your institution and your AI Administrative Workforce will be operational in minutes —
            generating reports, resolving conflicts, and monitoring students on day one.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register-institution"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.25rem', borderRadius: '0.875rem',
                background: 'white', color: '#1e3a8a',
                textDecoration: 'none', fontWeight: 800, fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
            >
              🚀 Register Institution
            </Link>
            <Link
              to="/officers-dashboard"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.25rem', borderRadius: '0.875rem',
                background: 'rgba(255,255,255,0.12)', color: 'white',
                textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              ⚡ View AI Officers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
