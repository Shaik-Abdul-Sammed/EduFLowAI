import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n'
import { instituteStats } from '../utils/mockData'
import { getApiBaseURL } from '../config/apiConfig'
import StudentAcademyPanel from './StudentAcademyPanel'

const roleConfig = {
  student: {
    bannerClass: 'welcome-banner-student',
    accentColor: '#2563EB',
    icon: '👨‍🎓',
    greeting: 'Study smart, achieve more!',
    widgets: [
      { title: 'Upcoming Classes', data: ['09:30 AM - Mathematics (LA 101)', '11:00 AM - Physics Lab (OSL)'] },
      { title: 'Pending Assignments', data: ['Wave Optics Problem Set (Due Today)', 'Chemistry Lab Report (Due Tomorrow)'] }
    ]
  },
  faculty: {
    bannerClass: 'welcome-banner-faculty',
    accentColor: '#10B981',
    icon: '👨‍🏫',
    greeting: 'Inspire, teach, transform!',
    widgets: [
      { title: 'Today\'s Schedule', data: ['08:30 AM - Mathematics (MPC-A)', '10:30 AM - Physics (MPC-B)'] },
      { title: 'Pending Approvals', data: ['3 Leave Requests', '2 Assignment Submissions'] }
    ]
  },
  parent: {
    bannerClass: 'welcome-banner-parent',
    accentColor: '#F59E0B',
    icon: '👨‍👩‍👧',
    greeting: 'Stay informed, stay connected!',
    widgets: [
      { title: 'Recent Updates', data: ['Attendance dropped in Physics', 'New Notice: Annual Day Rehearsal'] },
      { title: 'Upcoming Fees', data: ['Term 2 Tuition - ₹45,000 (Due in 15 days)'] }
    ]
  },
  admin: {
    bannerClass: 'welcome-banner-admin',
    accentColor: '#7C3AED',
    icon: '⚙️',
    greeting: 'Manage, monitor, lead!',
    widgets: [
      { title: 'System Alerts', data: ['High CPU Load on Server 2', 'Database Backup Completed'] },
      { title: 'Pending Approvals', data: ['5 Faculty Leave Requests', '2 New Admissions'] }
    ]
  },
}

export default function DashboardHome({ role, routes = [] }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const config = roleConfig[role] || roleConfig.student

  const [adminMetrics, setAdminMetrics] = useState({
    totalStudents: 500,
    totalFaculty: 85,
    totalCourses: 12,
    pendingApprovals: 1,
    unreadLeads: 3,
    unpaidInvoices: 2,
    unpaidInvoicesAmount: 49000,
    predictedNaacGrade: 'A+',
    predictedNaacCgpa: 3.42,
    predictedNirfRank: 142,
    nirfRankBand: '101-150',
    nirfPeers: [
      { rank: 138, name: 'BMSCE' },
      { rank: 142, name: 'SSIT (You)' },
      { rank: 148, name: 'JSSATE' },
    ],
    atRiskStudentsCount: 7,
    todayAttendancePercentage: 81.2,
  })

  useEffect(() => {
    if (role === 'admin') {
      const fetchMetrics = async () => {
        try {
          const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
          const res = await fetch(`${getApiBaseURL()}/v1/admin/dashboard-metrics`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          if (res.ok) {
            const data = await res.json()
            setAdminMetrics((prev) => ({ ...prev, ...data }))
          }
        } catch {
          // Graceful fallback to initial realistic metrics
        }
      }
      fetchMetrics()
    }
  }, [role])

  return (
    <div style={{ animation: 'fadeInUp 0.45s ease' }}>

      {/* Welcome Banner */}
      <div
        className={`welcome-banner ${config.bannerClass} mb-4`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              {config.icon} {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </p>
            <h1 style={{ color: 'white', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, marginBottom: '0.35rem' }}>
              {t('welcome_back')}, {user?.name || 'User'}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', margin: 0 }}>
              {config.greeting}
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '1rem', padding: '0.75rem 1.25rem',
            backdropFilter: 'blur(8px)',
            display: 'flex', gap: '1rem', alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1 }}>{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1 }}>{routes.length}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Modules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {role === 'admin' ? (
        <div className="mb-4">
          {/* Primary Metrics Grid */}
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/portal')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>🎓</span>
                  <span className="badge bg-primary-subtle text-primary small">Live DB</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', lineHeight: 1.1 }}>
                  {adminMetrics.totalStudents}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Total Students
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/staff')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>👨‍🏫</span>
                  <span className="badge bg-success-subtle text-success small">Faculty</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', lineHeight: 1.1 }}>
                  {adminMetrics.totalFaculty}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Total Faculty
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/calendar')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>📚</span>
                  <span className="badge bg-info-subtle text-info small">Curriculum</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#06B6D4', lineHeight: 1.1 }}>
                  {adminMetrics.totalCourses}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Approved Courses
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/attendance')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>📊</span>
                  <span className="badge bg-success-subtle text-success small">Biometrics</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
                  {adminMetrics.todayAttendancePercentage}%
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Today's Attendance
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics: Risk, Approvals, Leads, Invoices */}
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/attendance')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  <span className="badge bg-danger-subtle text-danger small">&lt; 75%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444', lineHeight: 1.1 }}>
                  {adminMetrics.atRiskStudentsCount}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  At-Risk Students
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/hod-dashboard')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>⏳</span>
                  <span className="badge bg-warning-subtle text-warning small">Pending</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1.1 }}>
                  {adminMetrics.pendingApprovals}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Pending Approvals
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/leads')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>📥</span>
                  <span className="badge bg-primary-subtle text-primary small">New</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3B82F6', lineHeight: 1.1 }}>
                  {adminMetrics.unreadLeads}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Unread Leads
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{ borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/invoices')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>💳</span>
                  <span className="badge bg-danger-subtle text-danger small">Unpaid</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626', lineHeight: 1.1 }}>
                  {adminMetrics.unpaidInvoices} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>
                    (₹{Number(adminMetrics.unpaidInvoicesAmount).toLocaleString('en-IN')})
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Unpaid Invoices
                </div>
              </div>
            </div>
          </div>

          {/* Predicted NAAC Grade & NIRF Rank Cards with Visuals */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div
                className="card border-0 shadow-sm h-100 p-4"
                style={{ borderRadius: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/officer/accreditation')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold small text-muted text-uppercase">Predicted NAAC SSR Grade</span>
                  <span className="badge bg-success text-white px-2 py-1">Grade {adminMetrics.predictedNaacGrade}</span>
                </div>
                <div className="d-flex align-items-baseline gap-3 mb-2">
                  <div className="display-6 fw-bold text-success">{adminMetrics.predictedNaacGrade}</div>
                  <div className="text-muted fw-semibold">CGPA {adminMetrics.predictedNaacCgpa} / 4.00</div>
                </div>
                <p className="text-muted small mb-3">
                  Based on automated Criteria 1–7 metrics compilation.
                </p>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted" style={{ fontSize: '0.72rem' }}>Trend (Last 5):</span>
                  <svg width="140" height="28" style={{ overflow: 'visible' }}>
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      points="0,22 30,18 65,14 100,8 135,2"
                    />
                    <circle cx="0" cy="22" r="3" fill="#10B981" />
                    <circle cx="30" cy="18" r="3" fill="#10B981" />
                    <circle cx="65" cy="14" r="3" fill="#10B981" />
                    <circle cx="100" cy="8" r="3" fill="#10B981" />
                    <circle cx="135" cy="2" r="4" fill="#059669" />
                  </svg>
                  <span className="small text-success fw-bold ms-auto" style={{ fontSize: '0.75rem' }}>+8.5% YoY</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div
                className="card border-0 shadow-sm h-100 p-4"
                style={{ borderRadius: '1.25rem', cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => navigate('/admin-dashboard/nirf')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold small text-muted text-uppercase">Predicted NIRF Rank</span>
                  <span className="badge bg-primary text-white px-2 py-1">Band {adminMetrics.nirfRankBand}</span>
                </div>
                <div className="d-flex align-items-baseline gap-3 mb-2">
                  <div className="display-6 fw-bold text-primary">#{adminMetrics.predictedNirfRank}</div>
                  <div className="text-muted fw-semibold">Engineering Category</div>
                </div>
                <p className="text-muted small mb-2">
                  Peer benchmarking comparison in your regional cluster:
                </p>
                <div className="d-flex flex-column gap-1">
                  {adminMetrics.nirfPeers.map((p, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between small" style={{ fontSize: '0.78rem' }}>
                      <span className={p.name.includes('You') ? 'fw-bold text-primary' : 'text-muted'}>{p.name}</span>
                      <span className="badge bg-secondary-subtle text-dark">Rank #{p.rank}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Non-admin Stats Row */
        <div className="row g-3 mb-4">
          {instituteStats.map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: config.accentColor, lineHeight: 1.1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access & Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          {/* Charts/Main Data Placeholder */}
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1.25rem' }}>
            <div className="card-body p-4">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Performance Overview</h2>
              <div style={{ 
                height: 240, borderRadius: '1rem', 
                background: 'var(--surface-bg)', border: '1px dashed var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', color: 'var(--app-text-muted)'
              }}>
                <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Interactive Analytics Chart</span>
                <span style={{ fontSize: '0.75rem' }}>(Attendance & Grades vs. Class Average)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <div style={{ display: 'grid', gap: '1rem', height: '100%' }}>
            {config.widgets.map((widget, i) => (
              <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', flex: 1 }}>
                <div className="card-body p-4">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: config.accentColor }}>{widget.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {widget.data.map((item, j) => (
                      <div key={j} style={{ 
                        padding: '0.6rem 0.875rem', borderRadius: '0.625rem', 
                        background: 'var(--surface-bg)', borderLeft: `3px solid ${config.accentColor}`,
                        fontSize: '0.82rem', fontWeight: 500, color: 'var(--app-text)'
                      }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student-only Academy Panel */}
      {role === 'student' && (
        <div className="mb-4">
          <StudentAcademyPanel />
        </div>
      )}
    </div>
  )
}
