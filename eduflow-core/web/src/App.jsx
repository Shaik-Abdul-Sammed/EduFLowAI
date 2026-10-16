import { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, NavLink } from 'react-router-dom'
import { I18nProvider } from './i18n'
import DashboardHome from './components/DashboardHome'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import './App.css'
import Layout from './components/Layout'
import { ToastProvider } from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import SkeletonLoader from './components/SkeletonLoader'
import ComingSoon from './components/ComingSoon'

const EntryPage = lazy(() => import('./pages/public/EntryPage'))
const LoginPage = lazy(() => import('./pages/public/LoginPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const InstitutionRegister = lazy(() => import('./pages/public/InstitutionRegister'))
const LeadIntakePage = lazy(() => import('./pages/public/LeadIntakePage'))
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'))
const PublicReportViewer = lazy(() => import('./pages/public/PublicReportViewer'))
const OnboardingPage = lazy(() => import('./pages/public/OnboardingPage'))
const WhyEduFlowPage = lazy(() => import('./pages/public/WhyEduFlowPage'))
const AttendanceExplainerPage = lazy(() => import('./pages/public/AttendanceExplainerPage'))
const StaffDashboardPage = lazy(() => import('./pages/staff/StaffDashboardPage'))
const HodDashboardPage = lazy(() => import('./pages/hod/HodDashboardPage'))
const HodStaffManagementPage = lazy(() => import('./pages/hod/StaffManagementPage'))
const HodCalendarPage = lazy(() => import('./pages/hod/HodCalendarPage'))
const AcademicCalendarPage = lazy(() => import('./pages/admin/AcademicCalendarPage'))
const PortalConnectionPage = lazy(() => import('./pages/admin/PortalConnectionPage'))
const AttendanceIntegrationPage = lazy(() => import('./pages/admin/AttendanceIntegrationPage'))
const AdminStaffManagementPage = lazy(() => import('./pages/admin/StaffManagementPage'))
const TimetableUploadPage = lazy(() => import('./pages/ai/officers/TimetableUploadPage'))
const OnboardingWizardPage = lazy(() => import('./pages/admin/OnboardingWizardPage'))
const TermsOfServicePage = lazy(() => import('./pages/public/TermsOfServicePage'))
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'))
const DataProcessingAgreementPage = lazy(() => import('./pages/public/DataProcessingAgreementPage'))
const HelpCenterPage = lazy(() => import('./pages/public/HelpCenterPage'))
const SupportTicketsPage = lazy(() => import('./pages/admin/SupportTicketsPage'))
const SystemHealthPage = lazy(() => import('./pages/admin/SystemHealthPage'))
const InstitutionSettingsPage = lazy(() => import('./pages/admin/InstitutionSettingsPage'))
const UPICollectionPage = lazy(() => import('./pages/admin/UPICollectionPage'))
const WhatsAppAttendancePage = lazy(() => import('./pages/admin/WhatsAppAttendancePage'))
const FeeReminderPage = lazy(() => import('./pages/admin/FeeReminderPage'))
const FinanceDashboardPage = lazy(() => import('./pages/finance/FinanceDashboardPage'))
const SSOConfigPage = lazy(() => import('./pages/admin/SSOConfigPage'))
const CompliancePage = lazy(() => import('./pages/admin/CompliancePage'))
const LiveDataPage = lazy(() => import('./pages/admin/LiveDataPage'))
const DocsPage = lazy(() => import('./pages/public/DocsPage'))
const VisitorDashboard = lazy(() => import('./components/VisitorDashboard'))
const ProfilePage = lazy(() => import('./pages/common/ProfilePage'))
const AITerminal = lazy(() => import('./pages/ai/AITerminal'))
const DigitalTwinManager = lazy(() => import('./pages/ai/DigitalTwinManager'))
const BuildManager = lazy(() => import('./pages/ai/BuildManager'))
const OfficersDashboard = lazy(() => import('./pages/ai/OfficersDashboard'))
const ObservationMode = lazy(() => import('./pages/demo/ObservationMode'))

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
  hod: 'text-bg-info',
  staff: 'text-bg-secondary',
}

const roleDisplay = {
  student: 'Student',
  faculty: 'Faculty',
  parent: 'Parent',
  admin: 'Admin',
  hod: 'Head of Department (HOD)',
  staff: 'Non-Teaching Staff',
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

const pageModules = import.meta.glob('./pages/*/*.jsx')

const generatedRoutes = Object.entries(pageModules)
  .map(([filePath, importFn]) => {
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
    if (fileName === 'StaffManagementPage') slug = 'staff'
    if (fileName === 'AcademicCalendarPage') slug = 'calendar'
    if (fileName === 'HodCalendarPage') slug = 'calendar'
    if (fileName === 'PortalConnectionPage') slug = 'portal'
    if (fileName === 'AttendanceIntegrationPage') slug = 'attendance'
    const routePath = `/${role}-dashboard/${slug}`

    return {
      role,
      fileName,
      slug,
      routePath,
      Component: lazy(importFn),
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

  const roleOrder = ['student', 'faculty', 'parent', 'admin', 'hod', 'staff']

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

                <ul className="list-group list-group-flush module-list">
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

  if (user?.role === 'staff') {
    return <Navigate to="/staff-dashboard" replace />
  }

  if (user?.role === 'hod') {
    return <Navigate to="/hod-dashboard" replace />
  }

  if (user?.role === 'finance_officer' || user?.role === 'accounts_staff') {
    return <Navigate to="/finance-dashboard" replace />
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
          <Route path="/ai-terminal" element={<ErrorBoundary><Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}><AITerminal /></Suspense></ErrorBoundary>} />
          <Route path="/digital-twin" element={<ErrorBoundary><Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}><DigitalTwinManager /></Suspense></ErrorBoundary>} />
          <Route path="/build-manager" element={<ErrorBoundary><Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}><BuildManager /></Suspense></ErrorBoundary>} />
          <Route path="/officers-dashboard" element={<ErrorBoundary><Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}><OfficersDashboard /></Suspense></ErrorBoundary>} />
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
            path="/officer/timetable/upload"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}>
                  <TimetableUploadPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/timetable/upload"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}>
                  <TimetableUploadPage />
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
          <Route path="/demo/observe" element={<ErrorBoundary><Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '2rem' }}><SkeletonLoader variant="card" /></div>}><ObservationMode /></Suspense></ErrorBoundary>} />
          <Route path="/services" element={<ErrorBoundary><Suspense fallback={<div className="container py-4"><SkeletonLoader variant="card" /></div>}><ServicesPage /></Suspense></ErrorBoundary>} />

          <Route element={<Layout routes={generatedRoutes} />}>
            <Route path="/" element={<RedirectHome />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/welcome" element={<EntryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-institution" element={<InstitutionRegister />} />
            <Route path="/signup" element={<InstitutionRegister />} />
            <Route path="/for-colleges" element={<LeadIntakePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/dpa" element={<DataProcessingAgreementPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/why-eduflow" element={<WhyEduFlowPage />} />
            <Route path="/how-attendance-works" element={<AttendanceExplainerPage />} />
            <Route path="/r/:token" element={<PublicReportViewer />} />
            <Route path="/profile" element={<ProfilePage />} />

        {/* Staff Routes */}
        <Route element={<ProtectedRoute role="staff" />}>
          <Route path="/staff-dashboard" element={<StaffDashboardPage />} />
        </Route>

        {/* HOD Routes */}
        <Route element={<ProtectedRoute role="hod" />}>
          <Route path="/hod-dashboard" element={<HodDashboardPage />} />
          <Route path="/hod-dashboard/staff" element={<HodStaffManagementPage />} />
          <Route path="/hod-dashboard/calendar" element={<HodCalendarPage />} />
        </Route>

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
            path="/admin-dashboard/onboarding"
            element={<OnboardingWizardPage />}
          />
          <Route
            path="/admin-dashboard/settings"
            element={<InstitutionSettingsPage />}
          />
          <Route
            path="/admin-dashboard/system-health"
            element={<SystemHealthPage />}
          />
          <Route
            path="/admin-dashboard/support-tickets"
            element={<SupportTicketsPage />}
          />
          <Route
            path="/admin-dashboard/upi-collection"
            element={<UPICollectionPage />}
          />
          <Route
            path="/admin-dashboard/whatsapp-attendance"
            element={<WhatsAppAttendancePage />}
          />
          <Route
            path="/admin-dashboard/fee-reminders"
            element={<FeeReminderPage />}
          />
          <Route
            path="/admin-dashboard/insights/:domain"
            element={<DomainInsightPage />}
          />
          <Route
            path="/admin-dashboard/calendar"
            element={<AcademicCalendarPage />}
          />
          <Route
            path="/admin-dashboard/portal"
            element={<PortalConnectionPage />}
          />
          <Route
            path="/admin-dashboard/attendance"
            element={<AttendanceIntegrationPage />}
          />
          <Route
            path="/admin-dashboard/sso-config"
            element={<SSOConfigPage />}
          />
          <Route
            path="/admin-dashboard/compliance"
            element={<CompliancePage />}
          />
          <Route
            path="/admin-dashboard/live-data"
            element={<LiveDataPage />}
          />
          <Route
            path="/admin-dashboard/staff"
            element={<AdminStaffManagementPage />}
          />
        </Route>
        
        {/* Finance Governance Routes */}
        <Route element={<ProtectedRoute role={['finance_officer', 'accounts_staff', 'admin']} />}>
          <Route path="/finance-dashboard" element={<FinanceDashboardPage />} />
          <Route path="/finance-dashboard/fee-reminders" element={<FeeReminderPage />} />
          <Route path="/finance-dashboard/upi-collection" element={<UPICollectionPage />} />
        </Route>

          <Route path="/visitor-dashboard" element={<VisitorDashboard />} />

        <Route path="/directory" element={isDemoMode ? <Navigate to="/admin-dashboard" replace /> : <HomeDirectory />} />

        {generatedRoutes.map((route) => {
          const isAllowedInDemo = [
            'audit-logs', 'leads', 'report-delivery', 'invoices',
            'naac-dashboard', 'naac-ai-analysis', 'insights', 'nirf',
            'staff', 'calendar', 'portal', 'attendance'
          ].includes(route.slug)
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
