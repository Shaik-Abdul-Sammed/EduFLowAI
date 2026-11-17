import { pool } from '../db/pool.js'
import { AIService } from '../services/AIService.js'

// In-memory fallbacks for resilient memory-mode execution & testing
const memoryGrievances = [
  {
    id: 1,
    institution_id: 1,
    student_id: 80,
    student_name: 'Ananya Sharma',
    student_roll: 'SS26',
    category: 'Infrastructure',
    subject: 'Computer Lab 3 Projector Flickering',
    description: 'During advanced algorithms class, the overhead projector in Lab 3 constantly loses HDMI signal.',
    priority: 'HIGH',
    status: 'SUBMITTED',
    resolution_notes: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 2,
    institution_id: 1,
    student_id: 81,
    student_name: 'Karthik V',
    student_roll: '1ST22ME022',
    category: 'Hostel',
    subject: 'Hot Water Supply Delay in Block B',
    description: 'Morning solar heating pipeline has low pressure on 3rd floor.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    resolution_notes: 'Maintenance replaced the secondary pressure pump on Nov 12.',
    resolved_by: 'Dr. Ramesh Kumar (HOD)',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString()
  }
]

const memoryLibraryBooks = [
  { id: 1, isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian Kernighan, Dennis Ritchie', category: 'Computer Science', total_copies: 10, available_copies: 7, shelf_location: 'CS-Rack-01' },
  { id: 2, isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', category: 'Computer Science', total_copies: 15, available_copies: 4, shelf_location: 'CS-Rack-04' },
  { id: 3, isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', total_copies: 8, available_copies: 6, shelf_location: 'SE-Rack-02' }
]

const memoryBookIssues = [
  {
    id: 1,
    book_id: 2,
    book_title: 'Introduction to Algorithms (CLRS)',
    student_roll: 'SS26',
    student_name: 'Ananya Sharma',
    issue_date: '2026-10-15',
    due_date: '2026-10-29',
    return_date: null,
    fine_amount: 80.00, // overdue
    status: 'OVERDUE'
  },
  {
    id: 2,
    book_id: 1,
    book_title: 'The C Programming Language',
    student_roll: '1ST22CS089',
    student_name: 'Rahul Sharma',
    issue_date: '2026-11-01',
    due_date: '2026-11-15',
    return_date: null,
    fine_amount: 0.00,
    status: 'ISSUED'
  }
]

const memoryHostelAllocations = [
  { id: 1, hostel_name: 'Aryabhata Boys Hostel', room_number: 'B-204', bed_number: 'Bed-1', student_roll: '1ST22CS089', student_name: 'Rahul Sharma', allocation_date: '2026-07-15', status: 'ACTIVE' },
  { id: 2, hostel_name: 'Gargi Girls Hostel', room_number: 'G-102', bed_number: 'Bed-2', student_roll: 'SS26', student_name: 'Ananya Sharma', allocation_date: '2026-07-15', status: 'ACTIVE' }
]

const memoryHostelGateLogs = [
  { id: 1, student_roll: 'SS26', student_name: 'Ananya Sharma', direction: 'OUT', reason: 'Library late study pass', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), approved_by: 'Warden Mrs. Geetha' },
  { id: 2, student_roll: '1ST22CS089', student_name: 'Rahul Sharma', direction: 'IN', reason: 'Return from technical symposium', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), approved_by: 'Security Turnstile Gate 1' }
]

const memoryLeaveRequests = [
  {
    id: 1,
    student_roll: 'SS26',
    student_name: 'Ananya Sharma',
    department: 'Computer Science',
    leave_type: 'OnDuty',
    from_date: '2026-11-18',
    to_date: '2026-11-20',
    reason: 'Presenting research paper at National AI Symposium, IIT Madras',
    parent_consent: true,
    status: 'PENDING',
    reviewed_by: null,
    review_comment: null,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    student_roll: '1ST22ME022',
    student_name: 'Karthik V',
    department: 'Mechanical Engineering',
    leave_type: 'Medical',
    from_date: '2026-11-10',
    to_date: '2026-11-12',
    reason: 'Viral fever rest certified by campus dispensary',
    parent_consent: true,
    status: 'APPROVED',
    reviewed_by: 'Dr. Ramesh Kumar (HOD)',
    review_comment: 'Approved with medical certificate verified.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString()
  }
]

const memoryBudgets = [
  { id: 1, department: 'Computer Science', category: 'Lab Equipment', fiscal_year: '2026-2027', allocated_amount: 1200000.00, spent_amount: 850000.00 },
  { id: 2, department: 'Electronics & Communication', category: 'Maintenance', fiscal_year: '2026-2027', allocated_amount: 600000.00, spent_amount: 420000.00 },
  { id: 3, department: 'Civil Engineering', category: 'Surveying Instruments', fiscal_year: '2026-2027', allocated_amount: 750000.00, spent_amount: 250000.00 },
  { id: 4, department: 'Central Library', category: 'Digital Subscriptions (IEEE/ACM)', fiscal_year: '2026-2027', allocated_amount: 1500000.00, spent_amount: 1450000.00 }
]

const memoryExpenses = [
  { id: 1, budget_id: 1, department: 'Computer Science', category: 'Lab Equipment', amount: 350000.00, vendor_name: 'Dell Technologies India', invoice_number: 'INV-DEL-8902', expense_date: '2026-09-12', description: '20x Intel Core i7 Desktop workstations for AI lab', approved_by: 'Finance Officer' },
  { id: 2, budget_id: 2, department: 'Electronics & Communication', category: 'Maintenance', amount: 80000.00, vendor_name: 'Tektronix Calibration Services', invoice_number: 'TK-CAL-441', expense_date: '2026-10-04', description: 'Digital Storage Oscilloscope annual calibration', approved_by: 'Finance Officer' }
]

const memoryScholarships = [
  {
    id: 1,
    student_roll: 'SS26',
    student_name: 'Ananya Sharma',
    scholarship_name: 'Pragati Merit Scholarship for Women in STEM',
    category: 'Merit',
    amount: 50000.00,
    gpa: 9.42,
    annual_family_income: 320000.00,
    status: 'VERIFIED',
    verified_by: 'Finance Officer Mr. Sharma',
    invoice_deduction_id: 'INV-DED-2026-091',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 2,
    student_roll: '1ST22CS089',
    student_name: 'Rahul Sharma',
    scholarship_name: 'Post-Matric State Financial Grant',
    category: 'Need-Based',
    amount: 35000.00,
    gpa: 8.75,
    annual_family_income: 180000.00,
    status: 'APPLIED',
    verified_by: null,
    invoice_deduction_id: null,
    created_at: new Date().toISOString()
  }
]

const memoryAdmissions = [
  {
    id: 1,
    application_number: 'EDU-ADM-2026-1001',
    full_name: 'Vivek Vardhan Reddy',
    email: 'vivek.reddy@example.com',
    phone: '+91 98480 22334',
    date_of_birth: '2008-04-12',
    gender: 'Male',
    desired_program: 'B.Tech Computer Science & Engineering',
    qualification: 'Intermediate / CBSE XII (MPC)',
    percentage_or_cgpa: 96.4,
    application_fee: 1000.00,
    payment_status: 'PAID',
    payment_utr: 'UPI/329012398401/SUCCESS',
    status: 'PROVISIONALLY_ADMITTED',
    documents: [{ name: '10th_marksheet.pdf', verified: true }, { name: '12th_hallticket.pdf', verified: true }],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
]

const memoryPlacementDrives = [
  {
    id: 1,
    company_name: 'Google India',
    role_title: 'Associate Software Engineer',
    ctc_lpa: 24.50,
    eligibility_cgpa: 8.50,
    eligible_branches: ['CSE', 'ECE', 'IT'],
    drive_date: '2026-12-05',
    registration_deadline: '2026-11-25',
    job_description: 'Full stack development, distributed systems, algorithms and cloud infrastructure.',
    status: 'ACTIVE',
    applicants_count: 84
  },
  {
    id: 2,
    company_name: 'TCS Digital',
    role_title: 'Digital Systems Engineer',
    ctc_lpa: 7.50,
    eligibility_cgpa: 7.00,
    eligible_branches: ['CSE', 'ECE', 'MECH', 'CIVIL'],
    drive_date: '2026-11-30',
    registration_deadline: '2026-11-20',
    job_description: 'Enterprise AI workflows, modern web frameworks, and cloud modernization.',
    status: 'ACTIVE',
    applicants_count: 142
  }
]

const memoryMockTests = [
  {
    id: 1,
    title: 'Cognitive Aptitude & Quantitative Assessment 2026',
    category: 'Quantitative & Logical',
    duration_mins: 20,
    total_questions: 5,
    questions: [
      { id: 'q1', text: 'If a train runs at 72 km/h, what is its speed in m/s?', options: ['15 m/s', '20 m/s', '25 m/s', '30 m/s'], correct: 1 },
      { id: 'q2', text: 'What is the time complexity of searching in a balanced AVL tree?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correct: 2 },
      { id: 'q3', text: 'Find the next number in sequence: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], correct: 1 },
      { id: 'q4', text: 'Which data structure follows LIFO principle?', options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correct: 1 },
      { id: 'q5', text: 'In Python, which keyword defines an anonymous inline function?', options: ['def', 'eval', 'lambda', 'inline'], correct: 2 }
    ]
  }
]

const memoryMockSubmissions = []

const memoryFacultyAppraisals = [
  {
    id: 1,
    faculty_id: 70,
    faculty_name: 'Dr. Ramesh Kumar',
    department: 'Computer Science',
    academic_year: '2026-2027',
    research_score: 92.5,
    teaching_score: 95.0,
    admin_score: 88.0,
    total_score: 92.35,
    performance_band: 'Outstanding',
    remarks: 'Published 3 SCI papers and guided 2 funded student hackathons.',
    evaluated_by: 'Dean Academic Affairs',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  }
]

const memoryPayslips = [
  {
    id: 1,
    faculty_id: 70,
    faculty_name: 'Dr. Ramesh Kumar',
    designation: 'Professor & HOD',
    month: 'October',
    year: 2026,
    basic_pay: 115000.00,
    da: 57500.00,
    hra: 27600.00,
    allowances: 12000.00,
    pf_deduction: 13800.00,
    tax_deduction: 18400.00,
    net_salary: 179900.00,
    payment_status: 'PAID',
    pdf_url: '/api/v1/finance/payslips/1/pdf',
    generated_at: '2026-11-01T10:00:00.000Z'
  }
]

const memoryOnlineExams = [
  {
    id: 1,
    title: 'Midterm Assessment: Data Structures & Advanced Algorithms (CS301)',
    course_code: 'CS301',
    duration_mins: 30,
    total_marks: 25,
    status: 'PUBLISHED',
    questions: [
      {
        id: 'cs1',
        text: 'In Linux CFS (Completely Fair Scheduler), what balanced data structure tracks task virtual runtime (vruntime) with O(log N) scheduling?',
        options: ['Red-Black Self-Balancing Tree (rbtree)', 'Fibonacci Priority Heap', 'Circular Doubly Linked List', 'Multi-Level Feedback Queue'],
        correct: 0
      },
      {
        id: 'cs2',
        text: 'Under the Raft distributed consensus protocol, when can a candidate node safely commit an entry to a quorum cluster majority?',
        options: [
          'Candidate log is at least as up-to-date as majority and holds currentTerm',
          'Candidate node has the lowest machine term ID',
          'Leader was manually disconnected with SIGKILL',
          'Any uncommitted log entry can overwrite majority clusters'
        ],
        correct: 0
      },
      {
        id: 'cs3',
        text: 'In the PostgreSQL MVCC storage engine, what happens when a row is updated under Read Committed transaction isolation?',
        options: [
          'New tuple is appended with xmin set to current XID and old tuple xmax set',
          'Direct in-place row rewrite with exclusive table-level write lock',
          'WAL buffer triggers synchronous disk fsync without undo logs',
          'Shared read locks are maintained until connection termination'
        ],
        correct: 0
      },
      {
        id: 'cs4',
        text: 'How does Spectre V1 (Bounds Check Bypass) vulnerability leak privileged memory across kernel/user space boundaries?',
        options: [
          'Exploits CPU speculative branch execution to transiently read out-of-bounds cache timing',
          'Directly overflows the hardware return address stack in ARM TrustZone',
          'Injects corrupted TLB descriptors into the L1 CPU instruction cache',
          'Flushes x86 ring-0 segment privilege registers during process context switch'
        ],
        correct: 0
      }
    ]
  }
]

const memoryExamViolations = []

const memoryParentChat = [
  { id: 1, sender: 'mentor', text: 'Hello Mr. Sharma, Ananya has shown great progress in Advanced Algorithms this month with 92% quiz marks.', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 2, sender: 'parent', text: 'Thank you Professor Ramesh. Is her attendance on track for semester practicals?', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 3, sender: 'mentor', text: 'Yes, her current attendance is 88.5%, well above the UGC 75% threshold.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
]

export class CampusOperationsController {
  // -------------------------------------------------------------
  // PHASE 1: Grievances & Parent Portal
  // -------------------------------------------------------------
  static async submitGrievance(req, res) {
    try {
      const { category = 'General', subject, description, priority = 'MEDIUM', student_name, student_roll } = req.body || {}
      if (!subject || !description) {
        return res.status(400).json({ error: 'Subject and description are required.' })
      }

      // Feature 11: Free Sentiment Analysis & Auto-Prioritization
      const sentiment = AIService.analyzeGrievanceSentiment(`${subject} ${description}`)
      let effectivePriority = priority
      if (sentiment.priority === 'CRITICAL') {
        effectivePriority = 'CRITICAL'
      } else if (sentiment.priority === 'HIGH' && effectivePriority !== 'CRITICAL') {
        effectivePriority = 'HIGH'
      }

      const newGrievance = {
        id: memoryGrievances.length + 1,
        institution_id: 1,
        student_id: req.user?.id || 80,
        student_name: student_name || req.user?.name || 'Ananya Sharma',
        student_roll: student_roll || req.user?.rollNumber || 'SS26',
        category,
        subject,
        description,
        priority: effectivePriority,
        sentiment_score: sentiment.score,
        sentiment_priority: sentiment.priority,
        sentiment_flags: sentiment.flags,
        status: 'SUBMITTED',
        resolution_notes: null,
        resolved_by: null,
        created_at: new Date().toISOString()
      }

      try {
        const query = `
          INSERT INTO grievances (institution_id, student_name, student_roll, category, subject, description, priority, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'SUBMITTED')
          RETURNING *`
        const dbRes = await pool.query(query, [1, newGrievance.student_name, newGrievance.student_roll, category, subject, description, effectivePriority])
        if (dbRes?.rows?.[0]) {
          return res.status(201).json({ success: true, grievance: { ...dbRes.rows[0], sentiment } })
        }
      } catch (_err) {
        // Fallback to memory
      }

      memoryGrievances.unshift(newGrievance)
      res.status(201).json({ success: true, grievance: newGrievance, sentiment })
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to submit grievance' })
    }
  }

  static async getGrievances(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM grievances ORDER BY created_at DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, grievances: dbRes.rows })
      } catch (_err) {
        // Memory fallback
      }
      res.json({ success: true, grievances: memoryGrievances })
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to fetch grievances' })
    }
  }

  static async getGrievanceById(req, res) {
    try {
      const { id } = req.params
      let grievance = null

      try {
        const dbRes = await pool.query('SELECT * FROM grievances WHERE id = $1', [id])
        if (dbRes?.rows?.[0]) grievance = dbRes.rows[0]
      } catch (_err) {}

      if (!grievance) {
        grievance = memoryGrievances.find((g) => String(g.id) === String(id))
      }

      if (!grievance) {
        return res.status(404).json({ error: 'Grievance not found' })
      }

      // If user not yet decoded, inspect Bearer token
      if (!req.user && req.headers?.authorization?.startsWith('Bearer ')) {
        try {
          const jwtMod = await import('jsonwebtoken')
          req.user = jwtMod.default.verify(req.headers.authorization.slice(7), process.env.JWT_SECRET || 'eduflow-secure-secret-key-123')
        } catch {}
      }

      // Role check: If user is a student, they cannot view another student's grievance
      if (req.user?.role === 'student') {
        const studentRoll = req.user.rollNumber || req.user.student_roll || ''
        const studentId = String(req.user.id || req.user.studentId || '')
        const itemRoll = grievance.student_roll || grievance.roll_number || ''
        const itemId = String(grievance.student_id || '')
        
        if ((itemRoll && studentRoll !== itemRoll) || (itemId && studentId !== itemId)) {
          return res.status(403).json({ error: 'Forbidden: Students cannot view another student grievance details' })
        }
      }

      return res.status(200).json({ success: true, grievance })
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to fetch grievance' })
    }
  }

  static async resolveGrievance(req, res) {
    try {
      const { id } = req.params
      const { resolution_notes, status = 'RESOLVED' } = req.body || {}
      const resolvedBy = req.user?.name || 'Dr. Ramesh Kumar (HOD)'

      // Resolving a grievance without a resolution note returns 400
      if (status === 'RESOLVED' && (!resolution_notes || !resolution_notes.trim())) {
        return res.status(400).json({ error: 'Resolution note is required when resolving a grievance' })
      }

      const item = memoryGrievances.find((g) => String(g.id) === String(id))
      // Illegal status transition check: OPEN directly to RESOLVED without IN_PROGRESS
      if (item && item.status === 'OPEN' && status === 'RESOLVED') {
        return res.status(400).json({ error: 'Illegal status transition: cannot transition directly from OPEN to RESOLVED without IN_PROGRESS' })
      }

      try {
        const query = `
          UPDATE grievances 
          SET status = $1, resolution_notes = $2, resolved_by = $3, updated_at = NOW() 
          WHERE id = $4 
          RETURNING *`
        const dbRes = await pool.query(query, [status, resolution_notes, resolvedBy, id])
        if (dbRes?.rows?.[0]) return res.json({ success: true, grievance: dbRes.rows[0] })
      } catch (_err) {
        // Fallback
      }

      if (item) {
        item.status = status
        item.resolution_notes = resolution_notes
        item.resolved_by = resolvedBy
        item.updated_at = new Date().toISOString()
        return res.json({ success: true, grievance: item })
      }
      res.status(404).json({ error: 'Grievance not found' })
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to update grievance' })
    }
  }

  static async updateGrievanceStatus(req, res) {
    try {
      const { id } = req.params
      const { status, resolution_notes, from_status, current_status } = req.body || {}
      
      let item = memoryGrievances.find((g) => String(g.id) === String(id))
      const current = current_status || from_status || item?.status || 'OPEN'

      // Illegal status transition: OPEN directly to RESOLVED without IN_PROGRESS
      if ((current === 'OPEN' || from_status === 'OPEN') && status === 'RESOLVED') {
        return res.status(400).json({ error: 'Illegal status transition: cannot transition directly from OPEN to RESOLVED without IN_PROGRESS' })
      }

      if (status === 'RESOLVED' && (!resolution_notes || !resolution_notes.trim())) {
        return res.status(400).json({ error: 'Resolution note is required when resolving a grievance' })
      }

      if (item) {
        item.status = status
        if (resolution_notes) item.resolution_notes = resolution_notes
        return res.status(200).json({ success: true, grievance: item })
      }
      return res.status(404).json({ error: 'Grievance not found' })
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to update grievance status' })
    }
  }

  static async getParentPortalOverview(req, res) {
    try {
      let overallAttendance = 88.5
      let subjectAttendance = [
        { code: 'CS301', name: 'Design & Analysis of Algorithms', attended: 42, total: 46, percent: 91.3 },
        { code: 'CS302', name: 'Database Management Systems', attended: 38, total: 44, percent: 86.4 },
        { code: 'CS303', name: 'Computer Networks', attended: 40, total: 45, percent: 88.9 },
        { code: 'CS304', name: 'Machine Learning Foundations', attended: 39, total: 44, percent: 88.6 }
      ]

      try {
        const { pool } = await import('../db/pool.js')
        if (pool && typeof pool.query === 'function' && !pool._isMemoryStore) {
          const result = await pool.query(
            `SELECT course_code, status FROM attendance_records WHERE (student_id = $1 OR student_id = 'SS26' OR student_id = '1') LIMIT 200`,
            [req.user?.id || '1']
          )
          if (result.rows && result.rows.length > 0) {
            const total = result.rows.length
            const present = result.rows.filter(r => r.status === 'PRESENT').length
            overallAttendance = Math.round((present / total) * 1000) / 10
            const courseMap = {}
            for (const r of result.rows) {
              const c = r.course_code || 'CS301'
              if (!courseMap[c]) courseMap[c] = { code: c, name: c, attended: 0, total: 0 }
              courseMap[c].total += 1
              if (r.status === 'PRESENT') courseMap[c].attended += 1
            }
            subjectAttendance = Object.values(courseMap).map(c => ({
              ...c,
              percent: c.total > 0 ? Math.round((c.attended / c.total) * 1000) / 10 : 0
            }))
          }
        }
      } catch {}

      const studentSummary = {
        studentName: 'Ananya Sharma',
        studentRoll: 'SS26',
        branch: 'Computer Science (B.Tech)',
        cgpa: 8.74,
        currentSemester: 'Semester 5',
        completedCredits: 112,
        overallAttendance
      }

      const subjectMarks = [
        { id: 1, subjectCode: 'CS501', subjectName: 'Design & Analysis of Algorithms', internalMarks: 28, internalMax: 30, midTermMarks: 36, midTermMax: 40, practicalMarks: 28, practicalMax: 30, grade: 'A+' },
        { id: 2, subjectCode: 'CS502', subjectName: 'Database Management Systems', internalMarks: 26, internalMax: 30, midTermMarks: 34, midTermMax: 40, practicalMarks: 27, practicalMax: 30, grade: 'A' },
        { id: 3, subjectCode: 'CS503', subjectName: 'Computer Networks', internalMarks: 27, internalMax: 30, midTermMarks: 35, midTermMax: 40, practicalMarks: 26, practicalMax: 30, grade: 'A' },
        { id: 4, subjectCode: 'CS504', subjectName: 'Machine Learning Foundations', internalMarks: 29, internalMax: 30, midTermMarks: 38, midTermMax: 40, practicalMarks: 29, practicalMax: 30, grade: 'A+' }
      ]

      res.json({
        success: true,
        studentSummary,
        subjectMarks,
        child: {
          name: 'Ananya Sharma',
          roll: 'SS26',
          branch: 'Computer Science (B.Tech)',
          semester: 'Semester 5',
          overallAttendance,
          attendanceStatus: overallAttendance >= 75 ? 'EXEMPLARY (Eligible for all examinations)' : 'ATTENDANCE SHORTAGE (< 75%)',
          subjectAttendance
        },
        fees: {
          totalBilled: 125000,
          paid: 125000,
          pending: 0,
          status: 'CLEAR',
          recentInvoices: [
            { invoiceNo: 'EDU-2026-F501', title: 'Semester 5 Tuition & Lab Fee', amount: 95000, status: 'PAID', date: '2026-07-20' },
            { invoiceNo: 'EDU-2026-H501', title: 'Hostel & Mess Autumn Term', amount: 30000, status: 'PAID', date: '2026-07-22' }
          ]
        },
        mentor: {
          name: 'Dr. Ramesh Kumar',
          designation: 'Associate Professor & Mentor',
          email: 'ramesh.cs@demo.edu',
          phone: '+91 90101 50809',
          cabin: 'CS Department, Faculty Block F-12'
        }
      })
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to load parent portal' })
    }
  }

  static async getParentMentorChat(req, res) {
    res.json({ success: true, messages: memoryParentChat })
  }

  static async sendParentMentorMessage(req, res) {
    const { text, sender = 'parent' } = req.body || {}
    if (!text) return res.status(400).json({ error: 'Message text is required' })
    const msg = { id: memoryParentChat.length + 1, sender, text, timestamp: new Date().toISOString() }
    memoryParentChat.push(msg)
    res.status(201).json({ success: true, message: msg })
  }

  // -------------------------------------------------------------
  // PHASE 2: Library, Hostel, Leave Management
  // -------------------------------------------------------------
  static async getLibraryBooks(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM library_books ORDER BY title ASC')
        if (dbRes?.rows?.length) return res.json({ success: true, books: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, books: memoryLibraryBooks })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async addLibraryBook(req, res) {
    try {
      const { isbn, title, author, category = 'General', total_copies = 5, shelf_location = 'Main' } = req.body || {}
      if (!title || !author) return res.status(400).json({ error: 'Title and author are required' })
      const genIsbn = isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`
      const numCopies = Number(total_copies) || 1

      try {
        const query = `
          INSERT INTO library_books (institution_id, isbn, title, author, category, total_copies, available_copies, shelf_location)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`
        const dbRes = await pool.query(query, [1, genIsbn, title, author, category, numCopies, numCopies, shelf_location])
        if (dbRes?.rows?.[0]) {
          memoryLibraryBooks.push(dbRes.rows[0])
          return res.status(201).json({ success: true, book: dbRes.rows[0] })
        }
      } catch (_err) {}

      const book = {
        id: memoryLibraryBooks.length + 1,
        isbn: genIsbn,
        title,
        author,
        category,
        total_copies: numCopies,
        available_copies: numCopies,
        shelf_location
      }
      memoryLibraryBooks.push(book)
      res.status(201).json({ success: true, book })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async issueLibraryBook(req, res) {
    try {
      const { book_id, student_roll = 'SS26', student_name = 'Ananya Sharma', days = 14 } = req.body || {}
      const issueDate = new Date()
      const dueDate = new Date(issueDate.getTime() + days * 86400000)
      const issueDateStr = issueDate.toISOString().split('T')[0]
      const dueDateStr = dueDate.toISOString().split('T')[0]

      try {
        const bookRes = await pool.query('SELECT * FROM library_books WHERE id = $1', [book_id])
        if (bookRes?.rows?.[0]) {
          const book = bookRes.rows[0]
          if (book.available_copies <= 0) {
            return res.status(400).json({ error: 'No copies available for issue' })
          }
          const issueRes = await pool.query(
            `INSERT INTO book_issues (institution_id, book_id, book_title, student_roll, student_name, issue_date, due_date, fine_amount, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 0.00, 'ISSUED')
             RETURNING *`,
            [1, book.id, book.title, student_roll, student_name, issueDateStr, dueDateStr]
          )
          const updatedBookRes = await pool.query(
            `UPDATE library_books SET available_copies = GREATEST(0, available_copies - 1) WHERE id = $1 RETURNING *`,
            [book.id]
          )
          const issue = issueRes.rows[0]
          const updatedBook = updatedBookRes.rows[0] || book
          memoryBookIssues.unshift(issue)
          return res.status(201).json({ success: true, issue, book: updatedBook })
        }
      } catch (_err) {}

      const book = memoryLibraryBooks.find((b) => Number(b.id) === Number(book_id))
      if (!book) return res.status(404).json({ error: 'Book not found' })
      if (book.available_copies <= 0) return res.status(400).json({ error: 'No copies available for issue' })

      book.available_copies -= 1
      const issue = {
        id: memoryBookIssues.length + 1,
        book_id: book.id,
        book_title: book.title,
        student_roll,
        student_name,
        issue_date: issueDateStr,
        due_date: dueDateStr,
        return_date: null,
        fine_amount: 0.00,
        status: 'ISSUED'
      }
      memoryBookIssues.unshift(issue)
      res.status(201).json({ success: true, issue, book })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async returnLibraryBook(req, res) {
    try {
      const { issue_id } = req.body || {}
      const returnDate = new Date()
      const returnDateStr = returnDate.toISOString().split('T')[0]

      try {
        const issueRes = await pool.query('SELECT * FROM book_issues WHERE id = $1', [issue_id])
        if (issueRes?.rows?.[0]) {
          const issueRow = issueRes.rows[0]
          const dueDate = new Date(issueRow.due_date)
          const diffTime = returnDate.getTime() - dueDate.getTime()
          const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
          const finePerDay = 5.00
          const fineAmount = diffDays * finePerDay

          const updatedIssueRes = await pool.query(
            `UPDATE book_issues SET return_date = $1, fine_amount = $2, status = 'RETURNED' WHERE id = $3 RETURNING *`,
            [returnDateStr, fineAmount, issue_id]
          )
          await pool.query(
            `UPDATE library_books SET available_copies = LEAST(total_copies, available_copies + 1) WHERE id = $1`,
            [issueRow.book_id]
          )
          const updatedIssue = updatedIssueRes.rows[0]
          return res.json({
            success: true,
            issue: updatedIssue,
            fineAmount,
            message: fineAmount > 0 ? `Late return by ${diffDays} days. Fine calculated: ₹${fineAmount}` : 'Book returned on time. Zero fine.'
          })
        }
      } catch (_err) {}

      const issue = memoryBookIssues.find((i) => Number(i.id) === Number(issue_id))
      if (!issue) return res.status(404).json({ error: 'Book issue record not found' })

      const dueDate = new Date(issue.due_date)
      const diffTime = returnDate.getTime() - dueDate.getTime()
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
      const finePerDay = 5.00 // Rs. 5 per day standard UGC norm
      const fineAmount = diffDays * finePerDay

      issue.return_date = returnDateStr
      issue.fine_amount = fineAmount
      issue.status = 'RETURNED'

      const book = memoryLibraryBooks.find((b) => Number(b.id) === Number(issue.book_id))
      if (book) book.available_copies = Math.min(book.total_copies, book.available_copies + 1)

      res.json({ success: true, issue, fineAmount, message: fineAmount > 0 ? `Late return by ${diffDays} days. Fine calculated: ₹${fineAmount}` : 'Book returned on time. Zero fine.' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getLibraryIssues(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM book_issues ORDER BY issue_date DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, issues: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, issues: memoryBookIssues })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  // Hostel Management
  static async getHostelAllocations(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM hostel_allocations ORDER BY created_at DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, allocations: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, allocations: memoryHostelAllocations })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async allocateHostelRoom(req, res) {
    try {
      const { hostel_name, room_number, student_roll, student_name, bed_number = 'Bed-1' } = req.body || {}
      if (!hostel_name || !room_number || !student_roll) {
        return res.status(400).json({ error: 'hostel_name, room_number, and student_roll are required' })
      }
      const allocDate = new Date().toISOString().split('T')[0]

      try {
        const query = `
          INSERT INTO hostel_allocations (institution_id, hostel_name, room_number, student_roll, student_name, bed_number, allocation_date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
          RETURNING *`
        const dbRes = await pool.query(query, [1, hostel_name, room_number, student_roll, student_name || 'Student', bed_number, allocDate])
        if (dbRes?.rows?.[0]) {
          memoryHostelAllocations.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, allocation: dbRes.rows[0] })
        }
      } catch (_err) {}

      const alloc = {
        id: memoryHostelAllocations.length + 1,
        hostel_name,
        room_number,
        student_roll,
        student_name: student_name || 'Student',
        bed_number,
        allocation_date: allocDate,
        status: 'ACTIVE'
      }
      memoryHostelAllocations.unshift(alloc)
      res.status(201).json({ success: true, allocation: alloc })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getHostelGateLogs(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM hostel_gate_logs ORDER BY timestamp DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, logs: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, logs: memoryHostelGateLogs })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async logHostelGatePass(req, res) {
    try {
      const { student_roll, student_name, direction, reason } = req.body || {}
      if (!student_roll || !direction) return res.status(400).json({ error: 'student_roll and direction are required' })
      const approvedBy = req.user?.name || 'Warden Gate Turnstile'

      try {
        const query = `
          INSERT INTO hostel_gate_logs (institution_id, student_roll, student_name, direction, reason, approved_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`
        const dbRes = await pool.query(query, [1, student_roll, student_name || 'Student', direction.toUpperCase(), reason || 'Standard gate check', approvedBy])
        if (dbRes?.rows?.[0]) {
          memoryHostelGateLogs.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, log: dbRes.rows[0] })
        }
      } catch (_err) {}

      const log = {
        id: memoryHostelGateLogs.length + 1,
        student_roll,
        student_name: student_name || 'Student',
        direction: direction.toUpperCase(),
        reason: reason || 'Standard gate check',
        timestamp: new Date().toISOString(),
        approved_by: approvedBy
      }
      memoryHostelGateLogs.unshift(log)
      res.status(201).json({ success: true, log })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  // Leave Management
  static async applyLeave(req, res) {
    try {
      const { student_roll = 'SS26', student_name = 'Ananya Sharma', department = 'Computer Science', leave_type, from_date, to_date, reason, parent_consent = true } = req.body || {}
      if (!from_date || !to_date || !reason) return res.status(400).json({ error: 'from_date, to_date, and reason are required' })
      const lType = leave_type || 'Personal'
      const pConsent = Boolean(parent_consent)

      try {
        const query = `
          INSERT INTO leave_requests (institution_id, student_roll, student_name, department, leave_type, from_date, to_date, reason, parent_consent, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
          RETURNING *`
        const dbRes = await pool.query(query, [1, student_roll, student_name, department, lType, from_date, to_date, reason, pConsent])
        if (dbRes?.rows?.[0]) {
          memoryLeaveRequests.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, leave: dbRes.rows[0] })
        }
      } catch (_err) {}

      const leave = {
        id: memoryLeaveRequests.length + 1,
        student_roll,
        student_name,
        department,
        leave_type: lType,
        from_date,
        to_date,
        reason,
        parent_consent: pConsent,
        status: 'PENDING',
        reviewed_by: null,
        review_comment: null,
        created_at: new Date().toISOString()
      }
      memoryLeaveRequests.unshift(leave)
      res.status(201).json({ success: true, leave })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getLeaveRequests(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM leave_requests ORDER BY created_at DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, requests: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, requests: memoryLeaveRequests })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async updateLeaveStatus(req, res) {
    try {
      const { id } = req.params
      const { status, review_comment = '' } = req.body || {}
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' })
      }
      const reviewedBy = req.user?.name || 'Dr. Ramesh Kumar (HOD)'

      try {
        const query = `
          UPDATE leave_requests
          SET status = $1, reviewed_by = $2, review_comment = $3
          WHERE id = $4
          RETURNING *`
        const dbRes = await pool.query(query, [status, reviewedBy, review_comment, id])
        if (dbRes?.rows?.[0]) {
          return res.json({ success: true, leave: dbRes.rows[0] })
        }
      } catch (_err) {}

      const item = memoryLeaveRequests.find((l) => Number(l.id) === Number(id))
      if (!item) return res.status(404).json({ error: 'Leave request not found' })
      item.status = status
      item.reviewed_by = reviewedBy
      item.review_comment = review_comment
      res.json({ success: true, leave: item })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  // -------------------------------------------------------------
  // PHASE 3: Budget Tracking, Scholarship & Admissions
  // -------------------------------------------------------------
  static async getBudgets(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM department_budgets ORDER BY department ASC, category ASC')
        if (dbRes?.rows?.length) return res.json({ success: true, budgets: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, budgets: memoryBudgets })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async setBudget(req, res) {
    try {
      const { department, category, fiscal_year = '2026-2027', allocated_amount } = req.body || {}
      if (!department || !category || !allocated_amount) {
        return res.status(400).json({ error: 'department, category, and allocated_amount are required' })
      }
      const numAllocated = Number(allocated_amount)

      try {
        const existing = await pool.query('SELECT * FROM department_budgets WHERE department = $1 AND category = $2', [department, category])
        if (existing?.rows?.[0]) {
          const updateRes = await pool.query(
            'UPDATE department_budgets SET allocated_amount = $1, fiscal_year = $2 WHERE id = $3 RETURNING *',
            [numAllocated, fiscal_year, existing.rows[0].id]
          )
          if (updateRes?.rows?.[0]) {
            return res.json({ success: true, budget: updateRes.rows[0] })
          }
        } else {
          const insertRes = await pool.query(
            'INSERT INTO department_budgets (institution_id, department, category, fiscal_year, allocated_amount, spent_amount) VALUES ($1, $2, $3, $4, $5, 0.00) RETURNING *',
            [1, department, category, fiscal_year, numAllocated]
          )
          if (insertRes?.rows?.[0]) {
            return res.status(201).json({ success: true, budget: insertRes.rows[0] })
          }
        }
      } catch (_err) {}

      const existing = memoryBudgets.find((b) => b.department === department && b.category === category)
      if (existing) {
        existing.allocated_amount = numAllocated
        return res.json({ success: true, budget: existing })
      }
      const b = {
        id: memoryBudgets.length + 1,
        department,
        category,
        fiscal_year,
        allocated_amount: numAllocated,
        spent_amount: 0.00
      }
      memoryBudgets.push(b)
      res.status(201).json({ success: true, budget: b })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getExpenses(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM budget_expenses ORDER BY expense_date DESC, id DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, expenses: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, expenses: memoryExpenses })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async recordExpense(req, res) {
    try {
      const { budget_id, department, category, amount, vendor_name, invoice_number, description } = req.body || {}
      if (!department || !amount) return res.status(400).json({ error: 'department and amount are required' })
      const numAmount = Number(amount)
      const bId = Number(budget_id) || 1
      const cat = category || 'Operations'
      const vName = vendor_name || 'Authorized Institutional Vendor'
      const invNo = invoice_number || `INV-${Date.now()}`
      const expDate = new Date().toISOString().split('T')[0]
      const desc = description || 'Institutional operational expense'
      const approvedBy = req.user?.name || 'Finance Officer'

      try {
        const query = `
          INSERT INTO budget_expenses (budget_id, department, category, amount, vendor_name, invoice_number, expense_date, description, approved_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`
        const dbRes = await pool.query(query, [bId, department, cat, numAmount, vName, invNo, expDate, desc, approvedBy])
        if (dbRes?.rows?.[0]) {
          await pool.query('UPDATE department_budgets SET spent_amount = spent_amount + $1 WHERE id = $2', [numAmount, bId])
          const exp = dbRes.rows[0]
          memoryExpenses.unshift(exp)
          return res.status(201).json({ success: true, expense: exp })
        }
      } catch (_err) {}

      const exp = {
        id: memoryExpenses.length + 1,
        budget_id: bId,
        department,
        category: cat,
        amount: numAmount,
        vendor_name: vName,
        invoice_number: invNo,
        expense_date: expDate,
        description: desc,
        approved_by: approvedBy
      }
      memoryExpenses.unshift(exp)
      const b = memoryBudgets.find((bg) => bg.id === exp.budget_id)
      if (b) b.spent_amount += exp.amount
      res.status(201).json({ success: true, expense: exp })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async applyScholarship(req, res) {
    try {
      const { student_roll = 'SS26', student_name = 'Ananya Sharma', scholarship_name, category = 'Merit', amount = 25000, gpa = 9.0, annual_family_income = 250000 } = req.body || {}
      if (!scholarship_name) return res.status(400).json({ error: 'scholarship_name is required' })
      const numAmount = Number(amount)
      const numGpa = Number(gpa)
      const numIncome = Number(annual_family_income)

      try {
        const query = `
          INSERT INTO scholarship_applications (institution_id, student_roll, student_name, scholarship_name, category, amount, gpa, annual_family_income, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'APPLIED')
          RETURNING *`
        const dbRes = await pool.query(query, [1, student_roll, student_name, scholarship_name, category, numAmount, numGpa, numIncome])
        if (dbRes?.rows?.[0]) {
          memoryScholarships.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, scholarship: dbRes.rows[0] })
        }
      } catch (_err) {}

      const s = {
        id: memoryScholarships.length + 1,
        student_roll,
        student_name,
        scholarship_name,
        category,
        amount: numAmount,
        gpa: numGpa,
        annual_family_income: numIncome,
        status: 'APPLIED',
        verified_by: null,
        invoice_deduction_id: null,
        created_at: new Date().toISOString()
      }
      memoryScholarships.unshift(s)
      res.status(201).json({ success: true, scholarship: s })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getScholarships(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM scholarship_applications ORDER BY created_at DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, scholarships: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, scholarships: memoryScholarships })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async verifyScholarship(req, res) {
    try {
      const { id } = req.params
      const verifiedBy = req.user?.name || 'Finance Officer'
      const deductionId = `AUTO-DED-${Date.now()}`

      try {
        const query = `
          UPDATE scholarship_applications
          SET status = 'VERIFIED', verified_by = $1, invoice_deduction_id = $2
          WHERE id = $3
          RETURNING *`
        const dbRes = await pool.query(query, [verifiedBy, deductionId, id])
        if (dbRes?.rows?.[0]) {
          const row = dbRes.rows[0]
          return res.json({ success: true, scholarship: row, message: `Scholarship ₹${row.amount} verified and applied to student invoice deduction credit.` })
        }
      } catch (_err) {}

      const item = memoryScholarships.find((s) => Number(s.id) === Number(id))
      if (!item) return res.status(404).json({ error: 'Scholarship not found' })
      item.status = 'VERIFIED'
      item.verified_by = verifiedBy
      item.invoice_deduction_id = deductionId
      res.json({ success: true, scholarship: item, message: `Scholarship ₹${item.amount} verified and applied to student invoice deduction credit.` })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async submitAdmission(req, res) {
    try {
      const { full_name, email, phone, desired_program, qualification, percentage_or_cgpa, payment_utr = 'UPI/DUMMY/VERIFIED', date_of_birth, gender } = req.body || {}
      if (!full_name || !email || !desired_program) {
        return res.status(400).json({ error: 'full_name, email, and desired_program are required' })
      }
      const appNo = `EDU-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`
      const phoneVal = phone || '+91 98000 00000'
      const dobVal = date_of_birth || '2008-01-01'
      const genderVal = gender || 'Other'
      const qualVal = qualification || '12th Standard / Pre-University'
      const cgpaVal = Number(percentage_or_cgpa) || 85.0
      const docsJson = JSON.stringify([{ name: 'Marksheet_12th.pdf', status: 'Uploaded' }])

      try {
        const query = `
          INSERT INTO admission_applications (application_number, full_name, email, phone, date_of_birth, gender, desired_program, qualification, percentage_or_cgpa, application_fee, payment_status, payment_utr, status, documents)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1000.00, 'PAID', $10, 'SUBMITTED', $11)
          RETURNING *`
        const dbRes = await pool.query(query, [appNo, full_name, email, phoneVal, dobVal, genderVal, desired_program, qualVal, cgpaVal, payment_utr, docsJson])
        if (dbRes?.rows?.[0]) {
          memoryAdmissions.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, application: dbRes.rows[0], message: `Application ${appNo} received with UPI fee receipt.` })
        }
      } catch (_err) {}

      const adm = {
        id: memoryAdmissions.length + 1,
        application_number: appNo,
        full_name,
        email,
        phone: phoneVal,
        date_of_birth: dobVal,
        gender: genderVal,
        desired_program,
        qualification: qualVal,
        percentage_or_cgpa: cgpaVal,
        application_fee: 1000.00,
        payment_status: 'PAID',
        payment_utr,
        status: 'SUBMITTED',
        documents: [{ name: 'Marksheet_12th.pdf', status: 'Uploaded' }],
        created_at: new Date().toISOString()
      }
      memoryAdmissions.unshift(adm)
      res.status(201).json({ success: true, application: adm, message: `Application ${appNo} received with UPI fee receipt.` })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getAdmissionStatus(req, res) {
    try {
      const { appNo } = req.params
      try {
        const dbRes = await pool.query('SELECT * FROM admission_applications WHERE LOWER(application_number) = LOWER($1)', [appNo])
        if (dbRes?.rows?.[0]) return res.json({ success: true, application: dbRes.rows[0] })
      } catch (_err) {}

      const adm = memoryAdmissions.find((a) => a.application_number.toLowerCase() === appNo.toLowerCase())
      if (!adm) return res.status(404).json({ error: 'Application number not found' })
      res.json({ success: true, application: adm })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getAdmissionsList(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM admission_applications ORDER BY created_at DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, admissions: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, admissions: memoryAdmissions })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  // -------------------------------------------------------------
  // PHASE 4: Placement Readiness & Mock Tests
  // -------------------------------------------------------------
  static async getPlacementDrives(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM placement_drives ORDER BY drive_date ASC')
        if (dbRes?.rows?.length) return res.json({ success: true, drives: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, drives: memoryPlacementDrives })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async createPlacementDrive(req, res) {
    try {
      const { company_name, role_title, ctc_lpa, eligibility_cgpa = 6.5, eligible_branches = ['CSE', 'ECE'], drive_date, registration_deadline, job_description } = req.body || {}
      if (!company_name || !role_title || !ctc_lpa) {
        return res.status(400).json({ error: 'company_name, role_title, and ctc_lpa are required' })
      }
      const branchesArr = Array.isArray(eligible_branches) ? eligible_branches : [eligible_branches]
      const dDate = drive_date || '2026-12-15'
      const regDead = registration_deadline || '2026-12-01'
      const desc = job_description || 'Campus recruitment drive'

      try {
        const query = `
          INSERT INTO placement_drives (institution_id, company_name, role_title, ctc_lpa, eligibility_cgpa, eligible_branches, drive_date, registration_deadline, job_description, status, applicants_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', 0)
          RETURNING *`
        const dbRes = await pool.query(query, [1, company_name, role_title, Number(ctc_lpa), Number(eligibility_cgpa), branchesArr, dDate, regDead, desc])
        if (dbRes?.rows?.[0]) {
          memoryPlacementDrives.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, drive: dbRes.rows[0] })
        }
      } catch (_err) {}

      const drive = {
        id: memoryPlacementDrives.length + 1,
        company_name,
        role_title,
        ctc_lpa: Number(ctc_lpa),
        eligibility_cgpa: Number(eligibility_cgpa),
        eligible_branches: branchesArr,
        drive_date: dDate,
        registration_deadline: regDead,
        job_description: desc,
        status: 'ACTIVE',
        applicants_count: 0
      }
      memoryPlacementDrives.unshift(drive)
      res.status(201).json({ success: true, drive })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async applyPlacementDrive(req, res) {
    try {
      const { id } = req.params
      const { student_roll = 'SS26', student_name = 'Ananya Sharma', student_cgpa = 8.5, branch = 'CSE', resume_url = '' } = req.body || {}

      try {
        const updateRes = await pool.query(
          'UPDATE placement_drives SET applicants_count = applicants_count + 1 WHERE id = $1 RETURNING *',
          [id]
        )
        if (updateRes?.rows?.[0]) {
          await pool.query(
            `INSERT INTO placement_applications (drive_id, student_roll, student_name, student_cgpa, branch, resume_url, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'APPLIED')`,
            [id, student_roll, student_name, Number(student_cgpa), branch, resume_url]
          )
          const drive = updateRes.rows[0]
          return res.json({ success: true, message: `Successfully registered for ${drive.company_name} campus drive.` })
        }
      } catch (_err) {}

      const drive = memoryPlacementDrives.find((d) => Number(d.id) === Number(id))
      if (!drive) return res.status(404).json({ error: 'Drive not found' })
      drive.applicants_count += 1
      res.json({ success: true, message: `Successfully registered for ${drive.company_name} campus drive.` })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getMockTests(req, res) {
    try {
      const category = req.query.category
      try {
        let query = 'SELECT * FROM mock_tests ORDER BY id ASC'
        const params = []
        if (category) {
          query = 'SELECT * FROM mock_tests WHERE LOWER(category) = LOWER($1) ORDER BY id ASC'
          params.push(category)
        }
        const dbRes = await pool.query(query, params)
        if (dbRes?.rows?.length > 0) {
          return res.json({ success: true, mockTests: dbRes.rows })
        }
      } catch (_err) {}

      const filtered = category 
        ? memoryMockTests.filter(t => t.category?.toLowerCase() === category.toLowerCase())
        : memoryMockTests
      res.json({ success: true, mockTests: filtered })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async submitMockTest(req, res) {
    try {
      const { id } = req.params
      const { answers = {}, student_roll = 'SS26', student_name = 'Ananya Sharma' } = req.body || {}
      const test = memoryMockTests.find((t) => Number(t.id) === Number(id))
      if (!test) return res.status(404).json({ error: 'Mock test not found' })

      let score = 0
      test.questions.forEach((q) => {
        if (Number(answers[q.id]) === Number(q.correct)) {
          score += 1
        }
      })
      const percentage = (score / test.questions.length) * 100
      const sub = {
        id: memoryMockSubmissions.length + 1,
        test_id: test.id,
        test_title: test.title,
        student_roll,
        student_name,
        score,
        max_score: test.questions.length,
        percentage,
        submitted_at: new Date().toISOString()
      }

      try {
        const query = `
          INSERT INTO mock_test_submissions (test_id, student_roll, student_name, score, max_score, percentage, answers)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`
        const dbRes = await pool.query(query, [test.id, student_roll, student_name, score, test.questions.length, percentage, JSON.stringify(answers)])
        if (dbRes?.rows?.[0]) {
          memoryMockSubmissions.unshift(dbRes.rows[0])
          return res.json({ success: true, submission: dbRes.rows[0], feedback: percentage >= 70 ? 'Excellent aptitude readiness!' : 'Review quantitative principles and retry.' })
        }
      } catch (_err) {}

      memoryMockSubmissions.unshift(sub)
      res.json({ success: true, submission: sub, feedback: percentage >= 70 ? 'Excellent aptitude readiness!' : 'Review quantitative principles and retry.' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getMockTestSubmissions(req, res) {
    try {
      const studentRoll = req.query.student_roll || 'SS26'
      try {
        const dbRes = await pool.query('SELECT * FROM mock_test_submissions WHERE student_roll = $1 ORDER BY submitted_at DESC', [studentRoll])
        if (dbRes?.rows?.length > 0) {
          return res.json({ success: true, submissions: dbRes.rows })
        }
      } catch (_err) {}
      res.json({ success: true, submissions: memoryMockSubmissions })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  // -------------------------------------------------------------
  // PHASE 5: Faculty Appraisal & Payroll Generation
  // -------------------------------------------------------------
  static async getFacultyAppraisals(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM faculty_appraisals ORDER BY created_at DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, appraisals: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, appraisals: memoryFacultyAppraisals })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async submitFacultyAppraisal(req, res) {
    try {
      const { faculty_name, department, academic_year = '2026-2027', research_score, teaching_score, admin_score, remarks } = req.body || {}
      if (!faculty_name || !department) return res.status(400).json({ error: 'faculty_name and department are required' })

      const r = Number(research_score) || 80
      const t = Number(teaching_score) || 85
      const a = Number(admin_score) || 80
      // Weighted composite: 40% Teaching, 40% Research, 20% Administration
      const total = Math.round((t * 0.4 + r * 0.4 + a * 0.2) * 100) / 100
      let band = 'Meets Expectations'
      if (total >= 90) band = 'Outstanding'
      else if (total >= 80) band = 'Exceeds Expectations'
      else if (total < 60) band = 'Needs Improvement'

      const evaluatedBy = req.user?.name || 'Dr. K. Srinivas (HOD)'
      const remarksVal = remarks || 'Annual institutional evaluation'

      try {
        const query = `
          INSERT INTO faculty_appraisals (institution_id, faculty_id, faculty_name, department, academic_year, research_score, teaching_score, admin_score, total_score, performance_band, remarks, evaluated_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *`
        const dbRes = await pool.query(query, [1, 70, faculty_name, department, academic_year, r, t, a, total, band, remarksVal, evaluatedBy])
        if (dbRes?.rows?.[0]) {
          memoryFacultyAppraisals.unshift(dbRes.rows[0])
          return res.status(201).json({ success: true, appraisal: dbRes.rows[0] })
        }
      } catch (_err) {}

      const appraisal = {
        id: memoryFacultyAppraisals.length + 1,
        faculty_id: 70,
        faculty_name,
        department,
        academic_year,
        research_score: r,
        teaching_score: t,
        admin_score: a,
        total_score: total,
        performance_band: band,
        remarks: remarksVal,
        evaluated_by: evaluatedBy,
        created_at: new Date().toISOString()
      }
      memoryFacultyAppraisals.unshift(appraisal)
      res.status(201).json({ success: true, appraisal })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getPayslips(req, res) {
    try {
      try {
        const dbRes = await pool.query('SELECT * FROM payslips ORDER BY generated_at DESC, id DESC')
        if (dbRes?.rows?.length) return res.json({ success: true, payslips: dbRes.rows })
      } catch (_err) {}
      res.json({ success: true, payslips: memoryPayslips })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async generatePayslip(req, res) {
    try {
      const { faculty_name, designation = 'Associate Professor', month = 'November', year = 2026, basic_pay = 85000 } = req.body || {}
      if (!faculty_name) return res.status(400).json({ error: 'faculty_name is required' })

      const bp = Number(basic_pay)
      const da = Math.round(bp * 0.50) // 50% DA
      const hra = Math.round(bp * 0.24) // 24% HRA
      const allowances = 8000
      const pf = Math.round(bp * 0.12) // 12% PF
      const tax = Math.round(bp * 0.10) // 10% TDS
      const net = (bp + da + hra + allowances) - (pf + tax)
      const numYear = Number(year)

      try {
        const query = `
          INSERT INTO payslips (institution_id, faculty_id, faculty_name, designation, month, year, basic_pay, da, hra, allowances, pf_deduction, tax_deduction, net_salary, payment_status, pdf_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PAID', $14)
          RETURNING *`
        const dbRes = await pool.query(query, [1, 70, faculty_name, designation, month, numYear, bp, da, hra, allowances, pf, tax, net, `/api/v1/finance/payslips/latest/pdf`])
        if (dbRes?.rows?.[0]) {
          const row = dbRes.rows[0]
          row.pdf_url = `/api/v1/finance/payslips/${row.id}/pdf`
          await pool.query('UPDATE payslips SET pdf_url = $1 WHERE id = $2', [row.pdf_url, row.id]).catch(() => {})
          memoryPayslips.unshift(row)
          return res.status(201).json({ success: true, payslip: row })
        }
      } catch (_err) {}

      const pId = memoryPayslips.length + 1
      const slip = {
        id: pId,
        faculty_id: 70,
        faculty_name,
        designation,
        month,
        year: numYear,
        basic_pay: bp,
        da,
        hra,
        allowances,
        pf_deduction: pf,
        tax_deduction: tax,
        net_salary: net,
        payment_status: 'PAID',
        pdf_url: `/api/v1/finance/payslips/${pId}/pdf`,
        generated_at: new Date().toISOString()
      }
      memoryPayslips.unshift(slip)
      res.status(201).json({ success: true, payslip: slip })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getPayslipPdf(req, res) {
    const { id } = req.params
    const slip = memoryPayslips.find((p) => Number(p.id) === Number(id)) || memoryPayslips[0]
    res.json({
      success: true,
      pdfMetadata: {
        document: 'INSTITUTIONAL_SALARY_SLIP',
        institution: 'Sri Siddhartha Institute of Technology',
        payslipId: slip?.id,
        employeeName: slip?.faculty_name,
        designation: slip?.designation,
        payPeriod: `${slip?.month} ${slip?.year}`,
        netSalaryWords: `Indian Rupees ${slip?.net_salary} Only`,
        authorizedSignatory: 'Finance & Accounts Officer'
      }
    })
  }

  // -------------------------------------------------------------
  // PHASE 6: Automated Exam Proctoring & Tab Switch Violations
  // -------------------------------------------------------------
  static async getOnlineExams(req, res) {
    res.json({ success: true, exams: memoryOnlineExams })
  }

  static async submitOnlineExam(req, res) {
    try {
      const { id } = req.params
      const { answers = {}, student_roll = 'SS26', student_name = 'Ananya Sharma' } = req.body || {}
      const exam = memoryOnlineExams.find((e) => Number(e.id) === Number(id))
      if (!exam) return res.status(404).json({ error: 'Exam not found' })

      let correctCount = 0
      exam.questions.forEach((q) => {
        if (Number(answers[q.id]) === Number(q.correct)) correctCount += 1
      })
      const marksPerQ = exam.total_marks / exam.questions.length
      const totalScore = Math.round(correctCount * marksPerQ)

      res.json({
        success: true,
        submission: {
          exam_id: exam.id,
          title: exam.title,
          student_roll,
          student_name,
          score: totalScore,
          max_score: exam.total_marks,
          status: 'EVALUATED'
        }
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async logExamViolation(req, res) {
    try {
      const { id } = req.params
      const { student_roll = 'SS26', student_name = 'Ananya Sharma', violation_type = 'tab_switch_violation', details } = req.body || {}
      const violation = {
        id: memoryExamViolations.length + 1,
        exam_id: Number(id),
        student_roll,
        student_name,
        violation_type,
        details: details || 'Browser window blurred or switched active tab during proctored exam session.',
        timestamp: new Date().toISOString()
      }
      memoryExamViolations.unshift(violation)
      console.warn(`[PROCTORING VIOLATION] Student ${student_roll} flagged: ${violation_type} at ${violation.timestamp}`)
      res.status(201).json({
        success: true,
        violation,
        warning: 'PROCTORING WARNING: Tab switching or leaving the exam screen is strictly prohibited and logged for Dean review.'
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getExamViolations(req, res) {
    const { id } = req.params
    const filtered = memoryExamViolations.filter((v) => !id || Number(v.exam_id) === Number(id))
    res.json({ success: true, violations: filtered })
  }

  static async getMarks(req, res) {
    try {
      const subjectCode = (req.query.subject || 'PHY101').toUpperCase()
      const subject = defaultSubjects.find(s => s.code === subjectCode) || defaultSubjects[0]
      const subjectData = memoryMarksStore[subject.code] || { published: false, marks: {} }

      res.json({
        success: true,
        subject,
        subjects: defaultSubjects,
        students: defaultMarksStudents,
        marks: subjectData.marks || {},
        published: Boolean(subjectData.published),
        updatedAt: subjectData.updatedAt || null
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async saveMarks(req, res) {
    try {
      const { subjectCode, marks, published = false } = req.body || {}
      if (!subjectCode) return res.status(400).json({ error: 'Subject code is required' })

      const code = subjectCode.toUpperCase()
      memoryMarksStore[code] = {
        published: Boolean(published),
        marks: marks || {},
        updatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        message: published ? 'Marks published successfully' : 'Marks draft saved successfully',
        subjectCode: code,
        published: Boolean(published),
        marks: memoryMarksStore[code].marks
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async publishMarks(req, res) {
    try {
      const { subjectCode, marks } = req.body || {}
      if (!subjectCode) return res.status(400).json({ error: 'Subject code is required' })

      const code = subjectCode.toUpperCase()
      const existing = memoryMarksStore[code] || { marks: {} }
      memoryMarksStore[code] = {
        published: true,
        marks: marks || existing.marks,
        updatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        message: `Marks for ${code} published successfully to student portal`,
        subjectCode: code,
        published: true,
        marks: memoryMarksStore[code].marks
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getAssignments(req, res) {
    try {
      const { subject, section, status } = req.query || {}
      let list = [...memoryAssignments]
      if (subject && subject !== 'all') {
        list = list.filter(a => a.subject.toLowerCase() === subject.toLowerCase())
      }
      if (section && section !== 'all') {
        list = list.filter(a => a.section === section || a.section === 'All')
      }
      if (status && status !== 'all') {
        list = list.filter(a => a.status.toLowerCase() === status.toLowerCase())
      }
      res.json({
        success: true,
        count: list.length,
        assignments: list,
        submissions: memorySubmissions
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async createAssignment(req, res) {
    try {
      const { title, subject = 'Physics', section = 'MPC-A', due, description = '', maxMarks = 10, total = 32 } = req.body || {}
      if (!title || !due) {
        return res.status(400).json({ error: 'Title and due date are required' })
      }
      const newAssignment = {
        id: Date.now(),
        title: title.trim(),
        subject,
        section,
        due,
        description,
        maxMarks: Number(maxMarks) || 10,
        submissions: 0,
        total: Number(total) || 32,
        status: 'active',
        faculty: req.user?.name || 'Faculty Member',
        createdAt: new Date().toISOString()
      }
      memoryAssignments.unshift(newAssignment)
      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        assignment: newAssignment
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async submitAssignment(req, res) {
    try {
      const assignmentId = Number(req.params.id)
      const { note = '', attachmentUrl = null } = req.body || {}
      const assignment = memoryAssignments.find(a => a.id === assignmentId)
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' })
      }
      assignment.submissions = (assignment.submissions || 0) + 1
      const submission = {
        assignmentId,
        submittedOn: new Date().toLocaleDateString('en-IN'),
        note,
        attachmentUrl,
        score: null,
        feedback: null
      }
      memorySubmissions[assignmentId] = submission
      res.json({
        success: true,
        message: 'Assignment submitted successfully',
        submission,
        assignment
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getAssignmentSubmissions(req, res) {
    try {
      res.json({
        success: true,
        submissions: memorySubmissions
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async getTimetable(req, res) {
    try {
      const section = req.query.section || 'MPC-A'
      try {
        const dbRes = await pool.query(
          'SELECT day, time, room, course, faculty FROM timetable_slots WHERE section = $1 OR section = $2 ORDER BY id ASC',
          [section, 'General']
        )
        if (dbRes?.rows?.length > 0) {
          const grid = {}
          for (const row of dbRes.rows) {
            if (!grid[row.day]) grid[row.day] = []
            grid[row.day].push({ subject: row.course, faculty: row.faculty, room: row.room, time: row.time })
          }
          const baseData = memoryTimetableStore[section] || memoryTimetableStore['MPC-A']
          return res.json({
            success: true,
            section,
            timetable: {
              ...baseData,
              section,
              schedule: Object.keys(grid).length > 0 ? grid : baseData.schedule
            }
          })
        }
      } catch (_dbErr) {
        // graceful memory fallback
      }

      const data = memoryTimetableStore[section] || memoryTimetableStore['MPC-A']
      res.json({
        success: true,
        section,
        timetable: data
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

let memoryTimetableStore = {
  'MPC-A': {
    section: 'MPC-A',
    periods: ['9:00 - 9:50', '9:50 - 10:40', '10:40 - 11:30', '11:45 - 12:35', '12:35 - 1:25', '2:10 - 3:00', '3:00 - 3:50', '3:50 - 4:40'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    subjectColors: {
      'Physics': '#2563EB',
      'Chemistry': '#10B981',
      'Mathematics': '#F59E0B',
      'English': '#8B5CF6',
      'Computer Science': '#EC4899',
      'Lab': '#06B6D4',
      'Library': '#64748B',
      'Sports': '#84CC16'
    },
    schedule: [
      ['Mathematics', 'Physics', 'Chemistry', 'English', 'Lab', 'Lab', 'Library', 'Sports'],
      ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Mathematics', 'Physics', 'English', null],
      ['Chemistry', 'Mathematics', 'Physics', 'English', 'Computer Science', 'Computer Science', 'Sports', null],
      ['Mathematics', 'Physics', 'Chemistry', 'English', 'Lab', 'Lab', 'Library', null],
      ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'English', 'Physics', 'Sports', null],
      ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Library', null, null, null]
    ]
  }
}

let memoryAssignments = [
  {
    id: 1,
    title: 'Wave Optics Problem Set',
    subject: 'Physics',
    section: 'MPC-A',
    due: '2026-05-15',
    description: 'Solve problems on Young double slit experiment, diffraction grating, and polarization state vectors.',
    maxMarks: 10,
    submissions: 28,
    total: 32,
    status: 'active',
    faculty: 'Dr. R. Raman (Physics)',
    createdAt: '2026-05-01T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Organic Chemistry Lab Report',
    subject: 'Chemistry',
    section: 'MPC-B',
    due: '2026-05-12',
    description: 'Submit formal lab write-up for Aldol condensation synthesis and IR spectroscopy analysis.',
    maxMarks: 20,
    submissions: 30,
    total: 30,
    status: 'closed',
    faculty: 'Dr. Sunita Rao (Chemistry)',
    createdAt: '2026-04-28T10:00:00.000Z'
  },
  {
    id: 3,
    title: 'Integration Techniques Practice',
    subject: 'Mathematics',
    section: 'MPC-A',
    due: '2026-05-20',
    description: 'Complete problems on contour integration, residue theorem, and improper integrals.',
    maxMarks: 15,
    submissions: 5,
    total: 32,
    status: 'active',
    faculty: 'Prof. K. Venkatesh (Maths)',
    createdAt: '2026-05-05T10:00:00.000Z'
  }
]

let memorySubmissions = {
  1: {
    assignmentId: 1,
    submittedOn: '14/05/2026',
    score: 9,
    feedback: 'Excellent derivations on fringe width calculations.'
  }
}

const defaultSubjects = [
  { code: 'PHY101', name: 'Physics', maxInternal: 30, maxExternal: 70 },
  { code: 'CHE101', name: 'Chemistry', maxInternal: 30, maxExternal: 70 },
  { code: 'MAT101', name: 'Mathematics', maxInternal: 30, maxExternal: 70 },
  { code: 'BIO101', name: 'Biology', maxInternal: 30, maxExternal: 70 },
]

const defaultMarksStudents = [
  { id: 'STU001', name: 'Aarav Sharma', section: 'MPC-A', roll: '2024MPC001' },
  { id: 'STU002', name: 'Priya Singh', section: 'BIPC-A', roll: '2024BIPC012' },
  { id: 'STU003', name: 'Sneha Patel', section: 'BIPC-B', roll: '2024BIPC005' },
  { id: 'STU004', name: 'Kavya Naidu', section: 'MBIPC-A', roll: '2024MBIPC03' },
  { id: 'STU005', name: 'Rahul Varma', section: 'MPC-A', roll: '2024MPC009' },
]

let memoryMarksStore = {
  PHY101: {
    published: false,
    updatedAt: new Date().toISOString(),
    marks: {
      STU001: { internal: 26, external: 62 },
      STU002: { internal: 24, external: 58 },
      STU003: { internal: 28, external: 65 },
      STU004: { internal: 22, external: 50 },
      STU005: { internal: 25, external: 60 },
    }
  }
}
