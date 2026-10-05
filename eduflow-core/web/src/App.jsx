import { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, NavLink } from 'react-router-dom'
import { I18nProvider } from './i18n'
import DashboardHome from './components/DashboardHome'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import EntryPage from './pages/public/EntryPage'
import LoginPage from './pages/public/LoginPage'
import AboutPage from './pages/public/AboutPage'
import InstitutionRegister from './pages/public/InstitutionRegister'
import LeadIntakePage from './pages/public/LeadIntakePage'
import ServicesPage from './pages/public/ServicesPage'
import PublicReportViewer from './pages/public/PublicReportViewer'
import './App.css'
import Layout from './components/Layout'
import VisitorDashboard from './components/VisitorDashboard'
import ProfilePage from './pages/common/ProfilePage'
import { ToastProvider } from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import SkeletonLoader from './components/SkeletonLoader'
import AITerminal from './pages/ai/AITerminal'
import DigitalTwinManager from './pages/ai/DigitalTwinManager'
import BuildManager from './pages/ai/BuildManager'
import OfficersDashboard from './pages/ai/OfficersDashboard'
import ObservationMode from './pages/demo/ObservationMode'
import ComingSoon from './components/ComingSoon'

const AccreditationOfficer = lazy(() => import('./pages/ai/officers/AccreditationOfficer'))
const StudentSuccessOfficer = lazy(() => import('./pages/ai/officers/StudentSuccessOfficer'))
const TimetableOfficer = lazy(() => import('./pages/ai/officers/TimetableOfficer'))
const AdmissionOfficer = lazy(() => import('./pages/ai/officers/AdmissionOfficer'))
const FinanceOfficer = lazy(() => import('./pages/ai/officers/FinanceOfficer'))
const DomainInsightPage = lazy(() => import('./pages/admin/insights/DomainInsightPage'))

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const instituteName = 'EduFlow'

const roleColorClass = {
  student: 'text-bg-primary',
  faculty: 'text-bg-success',
  parent: 'text-bg-warning',
  admin: 'text-bg-danger',
}

const roleDisplay = {
  student: 'Student',
  faculty: 'Faculty',
  parent: 'Parent',
  admin: 'Admin',
}

const toKebabCase = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()

const toTitleCase = (value) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const pageModules = import.meta.glob('./pages/*/*.jsx', { eager: true })

const generatedRoutes = Object.entries(pageModules)
  .map(([filePath, module]) => {
    const match = filePath.match(/\.\/pages\/([^/]+)\/([^/]+)\.jsx$/)
    if (!match) {
      return null
    }

    const [, role, fileName] = match
    let slug = toKebabCase(fileName)
    if (fileName === 'LeadManagementPage') slug = 'leads'
    if (fileName === 'ReportDeliveryPage') slug = 'report-delivery'
    if (fileName === 'InvoiceGeneratorPage') slug = 'invoices'
    if (fileName === 'NaacDashboardPage') slug = 'naac-dashboard'
    if (fileName === 'NaacAiAnalysisPage') slug = 'naac-ai-analysis'
    if (fileName === 'InsightsDashboardPage') slug = 'insights'
    if (fileName === 'NirfDashboardPage') slug = 'nirf'
    const routePath = `/${role}-dashboard/${slug}`

    return {
      role,
      fileName,
      slug,
      routePath,
      Component: module.default,
    }
  })
  .filter(Boolean)

function HomeDirectory() {
  const [filter, setFilter] = useState('')
  const groupedRoutes = generatedRoutes.reduce((acc, route) => {
    if (!acc[route.role]) {
      acc[route.role] = []
    }
    acc[route.role].push(route)
    return acc
  }, {})

  const roleOrder = ['student', 'faculty', 'parent', 'admin']

  const filtered = (arr) =>
    (arr || []).filter((r) => r.slug.toLowerCase().includes(filter.trim().toLowerCase()))

  return (
    <div className="container py-4 page-shell">
      <header className="hero-strip card border-0 shadow-sm mb-4">
        <div className="card-body p-4 p-md-5 d-flex flex-column flex-md-row gap-4 align-items-md-center justify-content-between">
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2">Module Directory</p>
            <h1 className="display-6 fw-bold mb-2">{instituteName} ERP Module Directory</h1>
            <p className="text-muted mb-0">Explore every role dashboard and module page from a single navigation surface.</p>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <input className="form-control" placeholder="Search modules..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            <Link className="btn btn-outline-secondary" to="/login">Login</Link>
          </div>
        </div>
      </header>

      <div className="row g-3">
        {roleOrder.map((role) => (
          <div key={role} className="col-12 col-lg-6">
            <section className="card border-0 shadow-sm h-100 role-summary-card">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h2 className="h5 mb-0">{roleDisplay[role]} Dashboard</h2>
                  <span className={`badge ${roleColorClass[role]}`}>{filtered(groupedRoutes[role])?.length ?? 0} Pages</span>
                </div>

                <p className="text-muted small mb-3">Tap a module to open the full sectioned page for this role.</p>

                <ul className="list-group list-group-flush module-list" onKeyDown={(e) => {
                  const links = Array.from(e.currentTarget.querySelectorAll('.directory-link'))
                  if (!links.length) return
                  const active = document.activeElement
                  const idx = links.indexOf(active)
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (idx === -1) links[0].focus()
                    else links[Math.min(idx + 1, links.length - 1)].focus()
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (idx === -1) links[0].focus()
                    else links[Math.max(idx - 1, 0)].focus()
                  }
                }}>
                  {filtered(groupedRoutes[role]).map((route) => (
                    <li key={route.routePath} className="list-group-item px-0">
                      <NavLink className={({isActive}) => `directory-link ${isActive ? 'text-primary fw-bold' : ''}`} to={route.routePath} tabIndex={0}>
                        {toTitleCase(route.slug)}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  )
}

function RedirectHome() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/entry" replace />
  }

  return <Navigate to={`/${user.role}-dashboard`} replace />
}

function NotFoundPage() {
  return (
    <div className="container py-5 text-center page-shell">
      <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '640px' }}>
        <div className="card-body p-4 p-md-5">
          <p className="text-uppercase small fw-semibold text-primary mb-2">404</p>
          <h1 className="h3 mb-2">Page Not Found</h1>
          <p className="text-muted mb-4">The requested route is not available.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link className="btn btn-primary" to="/directory">
              Open Directory
            </Link>
            <Link className="btn btn-outline-secondary" to="/entry">
              Back to Entry
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const groupedRoutes = generatedRoutes.reduce((acc, route) => {
    if (!acc[route.role]) {
      acc[route.role] = []
    }
    acc[route.role].push(route)
    return acc
  }, {})

  return (
    <BrowserRouter>
      <I18nProvider>
      <ToastProvider>
        <Routes>
          <Route path="/ai-terminal" element={<AITerminal />} />
          <Route path="/digital-twin" element={<DigitalTwinManager />} />
          <Route path="/build-manager" element={<BuildManager />} />
          <Route path="/officers-dashboard" element={<OfficersDashboard />} />
          <Route
            path="/officer/accreditation"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '2rem' }}><SkeletonLoader variant="card" /></div>}>
                  <AccreditationOfficer />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/officer/student-success"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '2rem' }}><SkeletonLoader variant="card" /></div>}>
                  <StudentSuccessOfficer />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/officer/timetable"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '2rem' }}><SkeletonLoader variant="card" /></div>}>
                  <TimetableOfficer />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/officer/admissions"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '2rem' }}><SkeletonLoader variant="card" /></div>}>
                  <AdmissionOfficer />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/officer/finance"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '2rem' }}><SkeletonLoader variant="card" /></div>}>
                  <FinanceOfficer />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route path="/demo/observe" element={<ObservationMode />} />
          <Route path="/services" element={<ServicesPage />} />

          <Route element={<Layout routes={generatedRoutes} />}>
            <Route path="/" element={<RedirectHome />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/welcome" element={<EntryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-institution" element={<InstitutionRegister />} />
            <Route path="/signup" element={<InstitutionRegister />} />
            <Route path="/for-colleges" element={<LeadIntakePage />} />
            <Route path="/r/:token" element={<PublicReportViewer />} />
            <Route path="/profile" element={<ProfilePage />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route
            path="/student-dashboard"
            element={<DashboardHome role="student" routes={groupedRoutes.student || []} />}
          />
        </Route>

        <Route element={<ProtectedRoute role="faculty" />}>
          <Route
            path="/faculty-dashboard"
            element={<DashboardHome role="faculty" routes={groupedRoutes.faculty || []} />}
          />
        </Route>

        <Route element={<ProtectedRoute role="parent" />}>
          <Route
            path="/parent-dashboard"
            element={<DashboardHome role="parent" routes={groupedRoutes.parent || []} />}
          />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route
            path="/admin-dashboard"
            element={<DashboardHome role="admin" routes={groupedRoutes.admin || []} />}
          />
          <Route
            path="/admin-dashboard/insights/:domain"
            element={<DomainInsightPage />}
          />
        </Route>

          <Route path="/visitor-dashboard" element={<VisitorDashboard />} />

        <Route path="/directory" element={isDemoMode ? <Navigate to="/admin-dashboard" replace /> : <HomeDirectory />} />

        {generatedRoutes.map((route) => {
          const isAllowedInDemo = ['audit-logs', 'leads', 'report-delivery', 'invoices', 'naac-dashboard', 'naac-ai-analysis', 'insights', 'nirf'].includes(route.slug)
          return (
            <Route key={route.routePath} element={<ProtectedRoute role={route.role} />}>
              <Route
                path={route.routePath}
                element={
                  isDemoMode && !isAllowedInDemo ? (
                    <ComingSoon moduleName={toTitleCase(route.slug)} />
                  ) : (
                    <route.Component />
                  )
                }
              />
            </Route>
          )
        })}

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}

export default App
