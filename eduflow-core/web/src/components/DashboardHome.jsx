import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n'
import { instituteStats } from '../utils/mockData'
import { getApiBaseURL } from '../config/apiConfig'
import { safeJson } from '../utils/wakeUpHandler'
import { safeText } from '../utils/formatters'
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
    let isMounted = true
    if (role === 'admin') {
      const fetchMetrics = async () => {
        try {
          const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
          const res = await fetch(`${getApiBaseURL()}/v1/admin/dashboard-metrics`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          if (res.ok) {
            const data = await safeJson(res)
            if (isMounted) setAdminMetrics((prev) => ({ ...prev, ...data }))
          }
        } catch {
          // Graceful fallback to initial realistic metrics
        }
      }
      fetchMetrics()
    }
    return () => {
      isMounted = false
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
                onClick={() => navigate('/finance-dashboard')}
                role="button"
                tabIndex={0}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                  <span className="badge bg-primary-subtle text-primary small">Finance Overview</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7C3AED', lineHeight: 1.1 }}>
                  98.8%
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.04em' }}>
                  Collection Efficiency (View)
                </div>
              </div>
            </div>
          </div>

          {/* Dean Policy Approvals Alert Bar */}
          <div className="card border-0 shadow-sm mb-4 bg-light p-3" style={{ borderRadius: '1rem' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                <div>
                  <strong className="d-block small">Dean Financial Policy & Sanctions Desk</strong>
                  <span className="text-muted small">
                    Institutional Governance Rule: Dean statutory review required for Fee Waivers &gt; ₹1 Lakh.
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate('/finance-dashboard#scholarships')}
                >
                  Review Pending Waivers (1)
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/admin-dashboard/settings')}
                >
                  Waiver Threshold Settings
                </button>
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
                  <span className="badge bg-success text-white px-2 py-1">Grade {safeText(adminMetrics.predictedNaacGrade, 'N/A')}</span>
                </div>
                <div className="d-flex align-items-baseline gap-3 mb-2">
                  <div className="display-6 fw-bold text-success">{safeText(adminMetrics.predictedNaacGrade, 'N/A')}</div>
                  <div className="text-muted fw-semibold">CGPA {safeText(adminMetrics.predictedNaacCgpa, 'N/A')} / 4.00</div>
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
                  <span className="badge bg-primary text-white px-2 py-1">Band {safeText(adminMetrics.nirfRankBand, 'N/A')}</span>
                </div>
                <div className="d-flex align-items-baseline gap-3 mb-2">
                  <div className="display-6 fw-bold text-primary">#{safeText(adminMetrics.predictedNirfRank, 'N/A')}</div>
                  <div className="text-muted fw-semibold">Engineering Category</div>
                </div>
                <p className="text-muted small mb-2">
                  Peer benchmarking comparison in your regional cluster:
                </p>
                <div className="d-flex flex-column gap-1">
                  {adminMetrics.nirfPeers.map((p, idx) => (
                    <div key={p.name || `peer-${p.rank || idx}`} className="d-flex align-items-center justify-content-between small" style={{ fontSize: '0.78rem' }}>
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
          {/* Charts/Main Performance Chart */}
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1.25rem' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Performance Overview</h2>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--app-text-muted)' }}>
                  Interactive Analytics Chart (Attendance &amp; Grades)
                </span>
              </div>
              <div style={{ height: 240, width: '100%', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jul', attendance: 88, grades: 82, classAvg: 78 },
                      { month: 'Aug', attendance: 91, grades: 85, classAvg: 80 },
                      { month: 'Sep', attendance: 86, grades: 81, classAvg: 79 },
                      { month: 'Oct', attendance: 89, grades: 88, classAvg: 81 },
                      { month: 'Nov', attendance: 93, grades: 89, classAvg: 83 },
                      { month: 'Dec', attendance: 90, grades: 87, classAvg: 82 },
                    ]}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="month" stroke="var(--app-text-muted, #64748b)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--app-text-muted, #64748b)" fontSize={12} domain={[60, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        borderColor: 'var(--border-color, #e2e8f0)',
                        borderRadius: '0.75rem',
                        fontSize: '0.8rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="grades" name="Grades Score" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="classAvg" name="Class Average" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <div style={{ display: 'grid', gap: '1rem', height: '100%' }}>
            {config.widgets.map((widget, i) => (
              <div key={widget.title || `widget-${i}`} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', flex: 1 }}>
                <div className="card-body p-4">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: config.accentColor }}>{widget.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {widget.data.map((item, j) => (
                      <div key={typeof item === 'string' ? item : `item-${j}`} style={{ 
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
