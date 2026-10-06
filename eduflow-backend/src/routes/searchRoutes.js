import { Router } from 'express'
import { pool } from '../db/pool.js'

export function createSearchRouter(db = pool) {
  const router = Router()

  router.get('/', async (req, res) => {
    const q = String(req.query.q || req.query.query || '').trim()
    if (!q) {
      return res.json({
        query: '',
        total: 0,
        results: [],
        categories: { students: [], faculty: [], courses: [], leads: [], invoices: [], officers: [] },
      })
    }

    const OFFICERS = [
      { id: 'officer-accreditation', category: 'Officer', title: 'Accreditation Officer', subtitle: 'NAAC Criteria 1–7 SSR generation and NBA gap analysis', routePath: '/officer/accreditation' },
      { id: 'officer-timetable', category: 'Officer', title: 'Timetable Officer', subtitle: 'Autonomous conflict-free scheduling and room allocation', routePath: '/officer/timetable' },
      { id: 'officer-student-success', category: 'Officer', title: 'Student Success Officer', subtitle: 'Dropout risk prediction and attendance intervention matrices', routePath: '/officer/student-success' },
      { id: 'officer-admissions', category: 'Officer', title: 'Admissions Officer', subtitle: 'Enrollment yield forecasting and lead conversions', routePath: '/officer/admissions' },
      { id: 'officer-finance', category: 'Officer', title: 'Finance Officer', subtitle: 'Bank statement reconciliation and fee collection analytics', routePath: '/officer/finance' },
      { id: 'module-calendar', category: 'Officer', title: 'Academic Calendar', subtitle: 'AI semester scheduling, holidays, and examination dates', routePath: '/admin-dashboard/calendar' },
      { id: 'module-attendance', category: 'Officer', title: 'Attendance Ingestion & Biometrics', subtitle: 'Multi-source portal ingestion & at-risk student monitoring', routePath: '/admin-dashboard/attendance' },
      { id: 'module-portal', category: 'Officer', title: 'ERP Portal Connection', subtitle: 'Fedena, BioTime, and Google Sheets connectors', routePath: '/admin-dashboard/portal' },
      { id: 'module-staff', category: 'Officer', title: 'Staff Permission Management', subtitle: 'Delegated non-teaching staff authorization & audit log', routePath: '/admin-dashboard/staff' },
    ]

    const officers = OFFICERS.filter(
      (o) => o.title.toLowerCase().includes(q.toLowerCase()) || o.subtitle.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 10)

    const searchStudents = async () => {
      try {
        const { rows } = await db.query(
          `SELECT id, roll_number, full_name, email, department, program
           FROM demo_students
           WHERE full_name ILIKE $1 OR roll_number ILIKE $1 OR department ILIKE $1
           LIMIT 10`,
          [`%${q}%`]
        )
        return rows.map((s) => ({
          id: `student-${s.id}`,
          category: 'Student',
          title: `${s.full_name} (${s.roll_number})`,
          subtitle: `${s.department} • ${s.program || 'Student'}`,
          routePath: '/admin-dashboard',
        }))
      } catch {
        return [
          { id: 'student-1', category: 'Student', title: 'Aarav Sharma (24CS001)', subtitle: 'CSE • B.Tech CSE', routePath: '/admin-dashboard' },
          { id: 'student-2', category: 'Student', title: 'Ananya Roy (24CS002)', subtitle: 'CSE • B.Tech CSE', routePath: '/admin-dashboard' },
          { id: 'student-3', category: 'Student', title: 'Bharat Reddy (24CS003)', subtitle: 'CSE • B.Tech CSE', routePath: '/admin-dashboard' },
          { id: 'student-4', category: 'Student', title: 'Deepa Krishnan (24EC004)', subtitle: 'ECE • B.Tech ECE', routePath: '/admin-dashboard' },
          { id: 'student-5', category: 'Student', title: 'Eshwar Rao (24ME005)', subtitle: 'Mechanical • B.Tech ME', routePath: '/admin-dashboard' },
        ].filter((s) => s.title.toLowerCase().includes(q.toLowerCase()) || s.subtitle.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
      }
    }

    const searchFaculty = async () => {
      try {
        const { rows } = await db.query(
          `SELECT id, employee_id, full_name, designation, department
           FROM demo_faculty
           WHERE full_name ILIKE $1 OR employee_id ILIKE $1 OR department ILIKE $1 OR designation ILIKE $1
           LIMIT 10`,
          [`%${q}%`]
        )
        return rows.map((f) => ({
          id: `faculty-${f.id}`,
          category: 'Faculty',
          title: `${f.full_name} (${f.designation || 'Faculty'})`,
          subtitle: `${f.department} • ${f.employee_id}`,
          routePath: '/admin-dashboard',
        }))
      } catch {
        return [
          { id: 'faculty-1', category: 'Faculty', title: 'Dr. K. S. Rao (Professor & HOD)', subtitle: 'CSE • EMP-101', routePath: '/admin-dashboard' },
          { id: 'faculty-2', category: 'Faculty', title: 'Dr. P. Sundaram (Professor)', subtitle: 'ECE • EMP-102', routePath: '/admin-dashboard' },
          { id: 'faculty-3', category: 'Faculty', title: 'Asst. Prof. Priya Nair (Assistant Professor)', subtitle: 'CSE • EMP-103', routePath: '/admin-dashboard' },
        ].filter((f) => f.title.toLowerCase().includes(q.toLowerCase()) || f.subtitle.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
      }
    }

    const searchCourses = async () => {
      try {
        const { rows } = await db.query(
          `SELECT id, program_name, department, program_level
           FROM demo_courses
           WHERE program_name ILIKE $1 OR department ILIKE $1
           LIMIT 10`,
          [`%${q}%`]
        )
        return rows.map((c) => ({
          id: `course-${c.id}`,
          category: 'Course',
          title: c.program_name,
          subtitle: `${c.department} • ${c.program_level || 'UG'}`,
          routePath: '/admin-dashboard',
        }))
      } catch {
        return [
          { id: 'course-1', category: 'Course', title: 'B.Tech Computer Science & Engineering', subtitle: 'CSE • UG', routePath: '/admin-dashboard' },
          { id: 'course-2', category: 'Course', title: 'B.Tech Electronics & Communication', subtitle: 'ECE • UG', routePath: '/admin-dashboard' },
          { id: 'course-3', category: 'Course', title: 'Master of Business Administration (MBA)', subtitle: 'MBA • PG', routePath: '/admin-dashboard' },
        ].filter((c) => c.title.toLowerCase().includes(q.toLowerCase()) || c.subtitle.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
      }
    }

    const searchLeads = async () => {
      try {
        const { rows } = await db.query(
          `SELECT id, college_name, contact_name, city_state
           FROM leads
           WHERE college_name ILIKE $1 OR contact_name ILIKE $1 OR city_state ILIKE $1
           LIMIT 10`,
          [`%${q}%`]
        )
        return rows.map((l) => ({
          id: `lead-${l.id}`,
          category: 'Lead',
          title: l.college_name,
          subtitle: `${l.contact_name} • ${l.city_state || 'Inquiry'}`,
          routePath: '/admin-dashboard/leads',
        }))
      } catch {
        return [
          { id: 'lead-1', category: 'Lead', title: 'Sri Siddhartha Institute of Technology', subtitle: 'Dr. Principal • Tumkur, Karnataka', routePath: '/admin-dashboard/leads' },
        ].filter((l) => l.title.toLowerCase().includes(q.toLowerCase()) || l.subtitle.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
      }
    }

    const searchInvoices = async () => {
      try {
        const { rows } = await db.query(
          `SELECT id, invoice_number, institution_name, total_amount, status
           FROM invoices
           WHERE invoice_number ILIKE $1 OR institution_name ILIKE $1 OR status ILIKE $1
           LIMIT 10`,
          [`%${q}%`]
        )
        return rows.map((inv) => ({
          id: `invoice-${inv.id}`,
          category: 'Invoice',
          title: `${inv.invoice_number} — ${inv.institution_name}`,
          subtitle: `₹${inv.total_amount} • Status: ${inv.status}`,
          routePath: '/admin-dashboard/invoices',
        }))
      } catch {
        return [
          { id: 'invoice-1', category: 'Invoice', title: 'EDU-2026-0001 — Sri Siddhartha Institute of Technology', subtitle: '₹49,000 • Status: UNPAID', routePath: '/admin-dashboard/invoices' },
        ].filter((inv) => inv.title.toLowerCase().includes(q.toLowerCase()) || inv.subtitle.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
      }
    }

    try {
      const [students, faculty, courses, leads, invoices] = await Promise.all([
        searchStudents(),
        searchFaculty(),
        searchCourses(),
        searchLeads(),
        searchInvoices(),
      ])

      const flatResults = [
        ...officers,
        ...students,
        ...faculty,
        ...courses,
        ...leads,
        ...invoices,
      ]

      return res.json({
        query: q,
        total: flatResults.length,
        results: flatResults,
        categories: {
          officers,
          students,
          faculty,
          courses,
          leads,
          invoices,
        },
      })
    } catch {
      return res.status(500).json({ error: 'Search failed' })
    }
  })

  router.get('/recent', async (req, res) => {
    const role = String(req.query.role || '').trim().toLowerCase()
    if (!role) return res.status(400).json({ error: 'role is required' })

    try {
      const { rows } = await db.query(
        `SELECT role, query, route_path AS "routePath", created_at AS "createdAt"
         FROM recent_searches
         WHERE role = $1
         ORDER BY created_at DESC
         LIMIT 6`,
        [role]
      )

      const items = rows.map((row) => ({
        role: row.role,
        query: row.query,
        routePath: row.routePath,
        title: row.query,
        createdAt: row.createdAt,
      }))

      return res.json({ items })
    } catch {
      return res.status(500).json({ error: 'Failed to read recent searches' })
    }
  })

  router.post('/recent', async (req, res) => {
    const role = String(req.body.role || '').trim().toLowerCase()
    const query = String(req.body.query || '').trim()
    const routePath = String(req.body.routePath || '').trim()

    if (!role || !routePath) {
      return res.status(400).json({ error: 'role and routePath are required' })
    }

    try {
      await db.query(
        `INSERT INTO recent_searches (role, query, route_path)
         VALUES ($1, $2, $3)
         ON CONFLICT (role, route_path)
         DO UPDATE SET query = EXCLUDED.query, created_at = NOW()`,
        [role, query, routePath],
      )

      await db.query(
        `DELETE FROM recent_searches
         WHERE id IN (
           SELECT id FROM recent_searches
           WHERE role = $1
           ORDER BY created_at DESC
           OFFSET 6
         )`,
        [role],
      )

      return res.status(201).json({ ok: true })
    } catch {
      return res.status(500).json({ error: 'Failed to save recent search' })
    }
  })

  return router
}

export default createSearchRouter(pool)
