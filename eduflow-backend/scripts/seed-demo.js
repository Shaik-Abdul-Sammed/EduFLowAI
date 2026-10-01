import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const { Pool } = pg
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/eduflow'

console.log('🌱 Starting EduFlow Demo Institution Seeder...')
console.log(`📡 Connecting to PostgreSQL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`)

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5000,
})

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Aditya', 'Meera', 'Karthik', 'Pooja', 'Sai', 'Divya',
  'Harsha', 'Nikhil', 'Varun', 'Swathi', 'Manisha', 'Arjun', 'Tanvi', 'Rahul', 'Kavya', 'Siddharth',
  'Ritu', 'Akash', 'Shruti', 'Gautam', 'Ishita', 'Manoj', 'Deepa', 'Pranav', 'Bhavna', 'Chetan',
  'Sunil', 'Neha', 'Vikas', 'Rashmi', 'Kunal', 'Preeti', 'Abhishek', 'Pallavi', 'Suresh', 'Ankita',
  'Mahesh', 'Sangeeta', 'Rajesh', 'Shweta', 'Dinesh', 'Komal', 'Tarun', 'Archana', 'Naveen', 'Gayatri'
]

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Gupta', 'Nair', 'Iyer', 'Joshi', 'Charan', 'Sri',
  'Vardhan', 'Rao', 'Teja', 'Krishna', 'Das', 'Sen', 'Chopra', 'Varma', 'Naidu', 'Mehta',
  'Kulkarni', 'Bose', 'Pillai', 'Menon', 'Bhat', 'Deshmukh', 'Saxena', 'Choudhury', 'Malhotra', 'Pandey',
  'Mishra', 'Tripathi', 'Trivedi', 'Bhattacharya', 'Mukherjee', 'Chatterjee', 'Dubey', 'Shukla', 'Yadav', 'Singh',
  'Gowda', 'Shetty', 'Hegde', 'Kamath', 'Pai', 'Kaur', 'Dhillon', 'Sandhu', 'Gill', 'Sethi'
]

async function seed() {
  const client = await pool.connect()
  try {
    // 1. Ensure Schema Exists
    const schemaPath = path.join(__dirname, '../sql/schema.sql')
    if (fs.existsSync(schemaPath)) {
      console.log('📜 Applying database schema...')
      const schemaSql = fs.readFileSync(schemaPath, 'utf8')
      await client.query(schemaSql)
    }

    await client.query('BEGIN')

    // 2. Demo Institution
    console.log('🏛️ Seeding Demo Institution...')
    const instQuery = `
      INSERT INTO institutions (
        name, slug, subdomain, type, short_code, subscription_tier, 
        primary_color, secondary_color, logo_url, admin_email, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (subdomain) DO UPDATE SET
        name = EXCLUDED.name,
        subscription_tier = EXCLUDED.subscription_tier,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING id;
    `

    const instMetadata = {
      address: 'Financial District, Gachibowli, Hyderabad, Telangana 500032',
      established: 2008,
      accreditationStatus: 'NAAC A+ (Targeting SSR Renewal)',
      totalStudents: 1250,
      totalFaculty: 85,
    }

    const instRes = await client.query(instQuery, [
      'Sri Sudha Institute of Technology',
      'demo',
      'demo',
      'college',
      'SSIT',
      'enterprise',
      '#2563EB',
      '#1E40AF',
      '/assets/hero.png',
      'admin@demo.edu',
      JSON.stringify(instMetadata),
    ])

    const institutionId = instRes.rows[0].id
    console.log(`✅ Institution ready: Sri Sudha Institute of Technology (ID: ${institutionId})`)

    // 3. Admin User
    console.log('👤 Seeding Demo Administrator...')
    const adminPasswordHash = await bcrypt.hash('Demo@2026', 10)
    const adminQuery = `
      INSERT INTO users (
        institution_id, role, username, email, password_hash, name, first_name, last_name, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (institution_id, username) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING id;
    `

    const adminRes = await client.query(adminQuery, [
      institutionId,
      'admin',
      'admin',
      'admin@demo.edu',
      adminPasswordHash,
      'Dr. K. V. Ramanathan',
      'Dr. K. V.',
      'Ramanathan',
      JSON.stringify({ designation: 'Principal & Dean of Academics', phone: '+91 98480 12345' }),
    ])
    const adminId = adminRes.rows[0].id
    console.log('✅ Admin ready: admin@demo.edu / Demo@2026')

    // 4. Faculty Users (5 Real Profiles)
    console.log('👨‍🏫 Seeding 5 Faculty Members...')
    const facultyMembers = [
      { name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@demo.edu', user: 'rajesh.kumar', first: 'Rajesh', last: 'Kumar', dept: 'Computer Science', roleDesc: 'Professor & HOD' },
      { name: 'Prof. Priya Sharma', email: 'priya.sharma@demo.edu', user: 'priya.sharma', first: 'Priya', last: 'Sharma', dept: 'Electronics & Comm', roleDesc: 'Associate Professor' },
      { name: 'Dr. Anand Verma', email: 'anand.verma@demo.edu', user: 'anand.verma', first: 'Anand', last: 'Verma', dept: 'Mathematics', roleDesc: 'Professor' },
      { name: 'Prof. Sunita Reddy', email: 'sunita.reddy@demo.edu', user: 'sunita.reddy', first: 'Sunita', last: 'Reddy', dept: 'Data Science & AI', roleDesc: 'Assistant Professor' },
      { name: 'Dr. Vikram Rao', email: 'vikram.rao@demo.edu', user: 'vikram.rao', first: 'Vikram', last: 'Rao', dept: 'Mechanical Engg', roleDesc: 'Dean of Student Affairs' },
    ]

    for (const f of facultyMembers) {
      await client.query(adminQuery, [
        institutionId,
        'faculty',
        f.user,
        f.email,
        adminPasswordHash,
        f.name,
        f.first,
        f.last,
        JSON.stringify({ department: f.dept, designation: f.roleDesc }),
      ])
    }
    console.log('✅ 5 Faculty accounts seeded.')

    // 5. 50 Student Records (40 Good Standing + 10 At-Risk)
    console.log('🎓 Seeding 50 Student Records (including 10 at-risk profiles)...')
    const studentsCreated = []

    for (let i = 0; i < 50; i++) {
      const isAtRisk = i >= 40 // last 10 are at risk
      const firstName = INDIAN_FIRST_NAMES[i % INDIAN_FIRST_NAMES.length]
      const lastName = INDIAN_LAST_NAMES[i % INDIAN_LAST_NAMES.length]
      const fullName = `${firstName} ${lastName}`
      const rollNumber = `26SSIT${String(i + 1).padStart(3, '0')}`
      const username = `student.${rollNumber.toLowerCase()}`
      const email = `${username}@demo.edu`

      // Regular: CGPA 6.8 - 9.6, Attendance 76% - 96%
      // At-Risk: CGPA 4.8 - 6.3, Attendance 48% - 66%, Backlogs 2 - 4
      const cgpa = isAtRisk
        ? Number((4.8 + Math.random() * 1.5).toFixed(2))
        : Number((6.8 + Math.random() * 2.8).toFixed(2))

      const attendance = isAtRisk
        ? Math.floor(48 + Math.random() * 19) // 48 - 66%
        : Math.floor(76 + Math.random() * 21) // 76 - 96%

      const backlogs = isAtRisk ? Math.floor(2 + Math.random() * 3) : 0
      const feeOverdueMonths = isAtRisk ? (Math.random() > 0.4 ? 2 : 1) : 0

      const studentMeta = {
        rollNumber,
        branch: i % 2 === 0 ? 'Computer Science & Engineering' : 'Electronics & Communication',
        semester: '6th Semester',
        batch: '2023-2027',
        cgpa,
        attendancePercentage: attendance,
        backlogs,
        feeOverdueMonths,
        riskStatus: isAtRisk ? 'HIGH_RISK' : 'NORMAL',
        riskFactors: isAtRisk ? [
          attendance < 60 ? 'Critically low attendance (<60%)' : 'Irregular attendance',
          backlogs > 0 ? `${backlogs} active backlogs` : null,
          feeOverdueMonths > 0 ? `Fee overdue by ${feeOverdueMonths} months` : null
        ].filter(Boolean) : []
      }

      const stdRes = await client.query(adminQuery, [
        institutionId,
        'student',
        username,
        email,
        adminPasswordHash,
        fullName,
        firstName,
        lastName,
        JSON.stringify(studentMeta)
      ])

      const studentId = stdRes.rows[0].id
      studentsCreated.push({ id: studentId, rollNumber, name: fullName, isAtRisk, attendance })

      // Seed student_attendance record for Student Success Officer & GuardianWatch
      await client.query(`
        INSERT INTO student_attendance (institution_id, student_id, course_id, total_classes, attended_classes, last_updated)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        institutionId,
        studentId,
        'CS601-DISTRIBUTED-SYSTEMS',
        60,
        Math.round((60 * attendance) / 100)
      ])
    }

    console.log(`✅ 50 Student records created with realistic CGPA, backlogs, and attendance metrics.`)
    console.log(`   - 40 students in normal standing (CGPA 6.8 - 9.6, Attendance 76% - 96%)`)
    console.log(`   - 10 at-risk students flagged for AI Student Success Officer (Attendance < 68%, Active backlogs)`)

    // 6. Pre-seed Audit Logs (Real DB-backed logs)
    console.log('📋 Seeding Real Audit Logs for Demo Presentation...')
    const logs = [
      {
        action: 'INSTITUTION_WORKSPACE_INITIALIZED',
        userId: adminId,
        ip: '192.168.1.10',
        meta: { domain: 'demo.eduflow.app', tier: 'ENTERPRISE', initializedBy: 'System Administrator' },
        timeOffset: 24 * 60 * 60 * 1000 // 24 hours ago
      },
      {
        action: 'KNOWLEDGE_DOCUMENT_INGESTED',
        userId: adminId,
        ip: '192.168.1.10',
        meta: { fileName: 'SSIT_NAAC_SSR_Curriculum_2026.pdf', sizeBytes: 2481920, tokens: 48500, status: 'processed' },
        timeOffset: 12 * 60 * 60 * 1000 // 12 hours ago
      },
      {
        action: 'ACCREDITATION_REPORT_GENERATED',
        userId: adminId,
        ip: '192.168.1.10',
        meta: { officer: 'accreditation', reportType: 'NAAC Criteria 2 (Teaching-Learning & Evaluation)', hoursSaved: 120, moneySaved: 300000 },
        timeOffset: 2 * 60 * 60 * 1000 // 2 hours ago
      },
      {
        action: 'STUDENT_RISK_ANALYSIS_COMPLETED',
        userId: adminId,
        ip: '192.168.1.10',
        meta: { officer: 'student-success', totalScanned: 50, highRiskIdentified: 10, interventionDrafted: true },
        timeOffset: 30 * 60 * 1000 // 30 mins ago
      },
      {
        action: 'LOGIN_SUCCESS',
        userId: adminId,
        ip: '192.168.1.10',
        meta: { username: 'admin', method: 'password', role: 'admin' },
        timeOffset: 5 * 60 * 1000 // 5 mins ago
      }
    ]

    for (const log of logs) {
      const createdAt = new Date(Date.now() - log.timeOffset)
      await client.query(`
        INSERT INTO audit_logs (institution_id, user_id, action, ip_address, user_agent, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        institutionId,
        log.userId,
        log.action,
        log.ip,
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        JSON.stringify(log.meta),
        createdAt
      ])
    }
    console.log('✅ 5 Real Audit Log entries recorded.')

    await client.query('COMMIT')

    console.log('\n🎉 DEMO SEEDING COMPLETE!')
    console.log('===========================================================')
    console.log('🏛️ Institution: Sri Sudha Institute of Technology')
    console.log('🌐 Subdomain:   demo.eduflow.app')
    console.log('👤 Admin Login: admin@demo.edu  OR  admin')
    console.log('🔑 Password:    Demo@2026')
    console.log('📊 Students:    50 total (10 high-risk profiles prepared)')
    console.log('===========================================================')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Seeding failed with error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
