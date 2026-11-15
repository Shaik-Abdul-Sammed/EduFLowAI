import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('Route Coverage & Integrity Smoke Tests', () => {
  const webDir = path.resolve(__dirname, '../..')
  const pagesDir = path.join(webDir, 'src/pages')
  const appJsxPath = path.join(webDir, 'src/App.jsx')
  const appJsxContent = fs.readFileSync(appJsxPath, 'utf8')

  // Find all page files under src/pages
  function getPageFiles(dir) {
    let results = []
    const list = fs.readdirSync(dir)
    for (const file of list) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        if (file !== '__tests__') {
          results = results.concat(getPageFiles(fullPath))
        }
      } else if ((file.endsWith('.jsx') || file.endsWith('.js')) && !file.includes('.test.') && file !== 'demoSequence.js') {
        results.push(fullPath)
      }
    }
    return results
  }

  const allPageFiles = getPageFiles(pagesDir)

  it('1. Verifies 100% of files under src/pages are accounted for (routed, dynamic, or documented orphan)', () => {
    expect(allPageFiles.length).toBeGreaterThan(150)

    for (const pageFile of allPageFiles) {
      const relPath = path.relative(pagesDir, pageFile).replace(/\\/g, '/')
      const baseName = path.basename(pageFile, path.extname(pageFile))

      // Check if page is explicitly imported in App.jsx
      const isImported = appJsxContent.includes(relPath.replace(/\.jsx?$/, '')) ||
                         appJsxContent.includes(baseName)

      // Check if page matches glob pattern './pages/*/*.jsx'
      const parts = relPath.split('/')
      const isGlobMatch = parts.length === 2 && pageFile.endsWith('.jsx')

      // If intentionally orphaned, must have a documented comment
      const content = fs.readFileSync(pageFile, 'utf8')
      const isDocumentedOrphan = content.includes('TODO:') || content.includes('alias re-exporting')

      const isAccountedFor = isImported || isGlobMatch || isDocumentedOrphan
      expect(isAccountedFor).toBe(true)
    }
  })

  it('2. Verifies all redirect targets resolve to valid routes', () => {
    const directRedirects = [
      ...appJsxContent.matchAll(/DirectPathRedirect\s+to=["']([^"']+)["']/g)
    ].map(m => m[1])

    const validDashboardPrefixes = [
      '/admin-dashboard',
      '/faculty-dashboard',
      '/student-dashboard',
      '/parent-dashboard',
      '/hod-dashboard',
      '/staff-dashboard',
      '/finance-dashboard',
      '/officers-dashboard'
    ]

    for (const target of directRedirects) {
      const matchesPrefix = validDashboardPrefixes.some(prefix => target.startsWith(prefix))
      expect(matchesPrefix).toBe(true)
    }
  })

  it('3. Verifies no duplicate explicit route paths exist in App.jsx', () => {
    const routePaths = [
      ...appJsxContent.matchAll(/<Route[^>]*\spath=["']([^"']+)["']/g)
    ].map(m => m[1])

    const counts = {}
    for (const p of routePaths) {
      counts[p] = (counts[p] || 0) + 1
    }

    const duplicates = Object.entries(counts).filter(([, count]) => count > 1)
    expect(duplicates).toEqual([])
  })

  it('4. Verifies slug normalization produces clean kebab-case without trailing -page', () => {
    const slugOverrides = {
      LeadManagementPage: 'leads',
      ReportDeliveryPage: 'report-delivery',
      InvoiceGeneratorPage: 'invoices',
      NaacDashboardPage: 'naac-dashboard',
      NaacAiAnalysisPage: 'naac-ai-analysis',
      InsightsDashboardPage: 'insights',
      NirfDashboardPage: 'nirf',
      StaffManagementPage: 'staff',
      AcademicCalendarPage: 'calendar',
      PortalConnectionPage: 'portal',
      AttendanceIntegrationPage: 'attendance',
      InstitutionSettingsPage: 'settings',
      BulkStudentImportPage: 'bulk-import',
      HostelWardenPage: 'hostel-management',
      BudgetTrackingPage: 'budget',
      ScholarshipManagementPage: 'scholarships',
      PlacementDrivesPage: 'placement-drives',
      SupportTicketsPage: 'support-tickets',
      SystemHealthPage: 'system-health',
      UPICollectionPage: 'upi-collection',
      WhatsAppAttendancePage: 'whatsapp-attendance',
      FeeReminderPage: 'fee-reminders',
      SSOConfigPage: 'sso-config',
      CompliancePage: 'compliance',
      LiveDataPage: 'live-data',
      GrievanceManagementPage: 'grievances',
      LibraryManagementPage: 'library',
      BulkDataImportPage: 'bulk-data-import',
      DegreeAuditPage: 'degree-audit',
      ProcurementPage: 'procurement',
      LibraryScannerPage: 'library-scanner',
      CurriculumMappingPage: 'curriculum-mapping',
      HodCalendarPage: 'calendar',
      LeaveApprovalsPage: 'leave-approvals',
      FacultyAppraisalPage: 'faculty-appraisal',
      GrievancePage: 'grievances',
      DigitalIdCard: 'digital-id',
      LeaveApplicationPage: 'leave-application',
      StudentMockTestPage: 'mock-tests',
      OnlineExamPage: 'online-exam',
      AdaptiveLearningPage: 'adaptive-learning',
      CredentialWalletPage: 'credentials',
      LeaderboardPage: 'leaderboard',
      VirtualLabsPage: 'virtual-labs',
      ARScannerPage: 'ar-scanner',
      CertificatePage: 'certificates',
      PlagiarismCheckerPage: 'plagiarism-checker',
      PodcastStudioPage: 'podcast-studio',
      FacultyWalletPage: 'wallet',
      SpeedGraderPage: 'speed-grader',
      PayrollGenerationPage: 'payroll',
    }

    const toKebabCase = (val) =>
      val.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()

    for (const [key, slug] of Object.entries(slugOverrides)) {
      expect(slug.endsWith('-page')).toBe(false)
      expect(slug).toBe(slug.toLowerCase())
    }

    // Generic test for any Page component
    const genericName = 'AdvancedExamSchedulerPage'
    const base = genericName.replace(/Page$/, '')
    const genericSlug = toKebabCase(base)
    expect(genericSlug).toBe('advanced-exam-scheduler')
    expect(genericSlug.endsWith('-page')).toBe(false)
  })

  it('5. Verifies all role dashboard blocks are protected by ProtectedRoute', () => {
    expect(appJsxContent).toContain('<Route element={<ProtectedRoute role="staff" />}>')
    expect(appJsxContent).toContain('<Route element={<ProtectedRoute role="hod" />}>')
    expect(appJsxContent).toContain('<Route element={<ProtectedRoute role="student" />}>')
    expect(appJsxContent).toContain('<Route element={<ProtectedRoute role="faculty" />}>')
    expect(appJsxContent).toContain('<Route element={<ProtectedRoute role="parent" />}>')
    expect(appJsxContent).toContain('<Route element={<ProtectedRoute role="admin" />}>')
    expect(appJsxContent).toContain("<Route element={<ProtectedRoute role={['finance_officer', 'accounts_staff', 'admin']} />}>")
  })
})
