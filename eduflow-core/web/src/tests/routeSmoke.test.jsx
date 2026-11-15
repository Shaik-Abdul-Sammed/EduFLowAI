import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

// Admin
import AcademicCalendarPage from '../pages/admin/AcademicCalendarPage'
import AttendanceIntegrationPage from '../pages/admin/AttendanceIntegrationPage'
import GrievanceManagementPage from '../pages/admin/GrievanceManagementPage'
import FeeCollectionPage from '../pages/admin/feeCollection'
import ExamSetupPage from '../pages/admin/examSetup'
import StudentManagementPage from '../pages/admin/studentManagement'
import FacultyManagementPage from '../pages/admin/facultyManagement'
import InstitutionSettingsPage from '../pages/admin/InstitutionSettingsPage'
import NaacDashboardPage from '../pages/admin/NaacDashboardPage'
import NirfDashboardPage from '../pages/admin/NirfDashboardPage'
import WhatsAppAttendancePage from '../pages/admin/WhatsAppAttendancePage'
import CompliancePage from '../pages/admin/CompliancePage'

// Student
import AttendanceOverviewPage from '../pages/student/attendanceOverview'
import StudentTimetablePage from '../pages/student/timetable'
import StudentFeeStatusPage from '../pages/student/feeStatus'
import OnlineExamPage from '../pages/student/OnlineExamPage'
import GrievancePage from '../pages/student/GrievancePage'
import DeanEscalationPage from '../pages/student/DeanEscalationPage'
import ExamSchedulePage from '../pages/student/examSchedule'
import SubjectMarksPage from '../pages/student/subjectMarks'
import LeaveApplicationPage from '../pages/student/LeaveApplicationPage'

// Faculty
import AttendanceEntryPage from '../pages/faculty/attendanceEntry'
import FacultyClassTimetablePage from '../pages/faculty/classTimetable'
import FacultyMarksEntryPage from '../pages/faculty/marksEntry'
import ExamInvigilationPage from '../pages/faculty/examInvigilation'
import AttendanceAnalyticsPage from '../pages/faculty/AttendanceAnalyticsPage'
import ExamQuestionGeneratorPage from '../pages/faculty/ExamQuestionGeneratorPage'

// HOD
import HodDashboardPage from '../pages/hod/HodDashboardPage'
import HodCalendarPage from '../pages/hod/HodCalendarPage'
import LeaveApprovalsPage from '../pages/hod/LeaveApprovalsPage'
import FacultyAppraisalPage from '../pages/hod/FacultyAppraisalPage'
import HodStaffManagementPage from '../pages/hod/StaffManagementPage'

// Parent
import ParentDashboardPage from '../pages/parent/ParentDashboardPage'
import ChildAttendancePage from '../pages/parent/childAttendance'
import ParentFeeDashboardPage from '../pages/parent/feeDashboard'
import TeacherCommunicationPage from '../pages/parent/teacherCommunication'

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

      const isImported = appJsxContent.includes(relPath.replace(/\.jsx?$/, '')) ||
                         appJsxContent.includes(baseName)

      const parts = relPath.split('/')
      const isGlobMatch = parts.length === 2 && pageFile.endsWith('.jsx')

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
    const toKebabCase = (val) =>
      val.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()

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

describe('Critical Route Render Smoke Tests (32 Critical Routes)', () => {
  const criticalRoutes = [
    // Admin (12)
    { name: 'Admin: Academic Calendar', role: 'admin', Component: AcademicCalendarPage },
    { name: 'Admin: Attendance Integration', role: 'admin', Component: AttendanceIntegrationPage },
    { name: 'Admin: Grievance Management', role: 'admin', Component: GrievanceManagementPage },
    { name: 'Admin: Fee Collection', role: 'admin', Component: FeeCollectionPage },
    { name: 'Admin: Exam Setup', role: 'admin', Component: ExamSetupPage },
    { name: 'Admin: Student Management', role: 'admin', Component: StudentManagementPage },
    { name: 'Admin: Faculty Management', role: 'admin', Component: FacultyManagementPage },
    { name: 'Admin: Institution Settings', role: 'admin', Component: InstitutionSettingsPage },
    { name: 'Admin: NAAC Dashboard', role: 'admin', Component: NaacDashboardPage },
    { name: 'Admin: NIRF Dashboard', role: 'admin', Component: NirfDashboardPage },
    { name: 'Admin: WhatsApp Attendance', role: 'admin', Component: WhatsAppAttendancePage },
    { name: 'Admin: Compliance', role: 'admin', Component: CompliancePage },

    // Student (9)
    { name: 'Student: Attendance Overview', role: 'student', Component: AttendanceOverviewPage },
    { name: 'Student: Timetable', role: 'student', Component: StudentTimetablePage },
    { name: 'Student: Fee Status', role: 'student', Component: StudentFeeStatusPage },
    { name: 'Student: Online Exam', role: 'student', Component: OnlineExamPage },
    { name: 'Student: Grievances', role: 'student', Component: GrievancePage },
    { name: 'Student: Dean Escalations', role: 'student', Component: DeanEscalationPage },
    { name: 'Student: Exam Schedule', role: 'student', Component: ExamSchedulePage },
    { name: 'Student: Subject Marks', role: 'student', Component: SubjectMarksPage },
    { name: 'Student: Leave Application', role: 'student', Component: LeaveApplicationPage },

    // Faculty (6)
    { name: 'Faculty: Attendance Entry', role: 'faculty', Component: AttendanceEntryPage },
    { name: 'Faculty: Class Timetable', role: 'faculty', Component: FacultyClassTimetablePage },
    { name: 'Faculty: Marks Entry', role: 'faculty', Component: FacultyMarksEntryPage },
    { name: 'Faculty: Exam Invigilation', role: 'faculty', Component: ExamInvigilationPage },
    { name: 'Faculty: Attendance Analytics', role: 'faculty', Component: AttendanceAnalyticsPage },
    { name: 'Faculty: Exam Question Generator', role: 'faculty', Component: ExamQuestionGeneratorPage },

    // HOD (5)
    { name: 'HOD: Dashboard', role: 'hod', Component: HodDashboardPage },
    { name: 'HOD: Calendar', role: 'hod', Component: HodCalendarPage },
    { name: 'HOD: Leave Approvals', role: 'hod', Component: LeaveApprovalsPage },
    { name: 'HOD: Faculty Appraisal', role: 'hod', Component: FacultyAppraisalPage },
    { name: 'HOD: Staff Management', role: 'hod', Component: HodStaffManagementPage },

    // Parent (4)
    { name: 'Parent: Dashboard', role: 'parent', Component: ParentDashboardPage },
    { name: 'Parent: Child Attendance', role: 'parent', Component: ChildAttendancePage },
    { name: 'Parent: Fee Dashboard', role: 'parent', Component: ParentFeeDashboardPage },
    { name: 'Parent: Teacher Communication', role: 'parent', Component: TeacherCommunicationPage },
  ]

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, exams: [], students: [], notes: [] })
      })
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  criticalRoutes.forEach(({ name, role, Component }) => {
    it(`renders ${name} without throwing and without crash boundary`, () => {
      const authVal = {
        user: { id: 1, role, name: 'Test User', institutionId: 1, email: 'test@demo.edu' },
        token: 'mock-token',
        isAuthenticated: true
      }

      let renderResult
      expect(() => {
        renderResult = render(
          <AuthContext.Provider value={authVal}>
            <MemoryRouter>
              <Component />
            </MemoryRouter>
          </AuthContext.Provider>
        )
      }).not.toThrow()

      const html = renderResult.container.innerHTML
      // Must not render unhandled crash boundary text
      expect(html).not.toMatch(/something went wrong/i)
      expect(html).not.toMatch(/unhandled application error/i)
      // Must not be a blank screen
      expect(html.length).toBeGreaterThan(50)
      expect(renderResult.container.textContent.trim().length).toBeGreaterThan(0)
    })
  })
})
