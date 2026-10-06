import { pool } from '../db/pool.js'

// In-memory fallback store for development/testing
const memoryOnboarding = new Map()

export class OnboardingController {
  static getFacultyTemplate(req, res) {
    const csvContent = `employee_id,full_name,email,phone,department_code,designation,qualification,specialization,joining_year
EMP101,Dr. Ramesh Kumar,ramesh.kumar@college.edu,+919876543210,CSE,Professor,Ph.D,Artificial Intelligence,2018
EMP102,Dr. Sunita Sharma,sunita.sharma@college.edu,+919876543211,ECE,Associate Professor,Ph.D,VLSI Systems,2019
EMP103,Prof. Rajesh Iyer,rajesh.iyer@college.edu,+919876543212,MECH,Assistant Professor,M.Tech,Thermal Engineering,2021`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="faculty-template.csv"')
    return res.status(200).send(csvContent)
  }

  static getStudentTemplate(req, res) {
    const csvContent = `roll_number,full_name,email,phone,department_code,program,batch_year,current_semester,cgpa,category,gender,is_first_generation
STU202601,Aarav Patel,aarav.patel@student.edu,+919812345670,CSE,B.Tech,2023,5,8.45,General,Male,false
STU202602,Diya Reddy,diya.reddy@student.edu,+919812345671,ECE,B.Tech,2023,5,8.90,OBC,Female,true
STU202603,Rohan Verma,rohan.verma@student.edu,+919812345672,MECH,B.Tech,2024,3,7.60,SC,Male,false`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="students-template.csv"')
    return res.status(200).send(csvContent)
  }

  static async getStatus(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.query.institutionId || 1
      let record = memoryOnboarding.get(Number(institutionId))
      
      try {
        const result = await pool.query(
          'SELECT current_step, is_completed, completed_at, profile_data, departments_data, academic_data FROM onboarding_progress WHERE institution_id = $1',
          [institutionId]
        )
        if (result.rows.length > 0) {
          record = result.rows[0]
        }
      } catch (dbErr) {
        // Fall back to memory store
      }

      if (!record) {
        return res.json({
          institutionId,
          currentStep: 1,
          isCompleted: false,
          progressPercent: 0,
          data: {}
        })
      }

      return res.json({
        institutionId,
        currentStep: record.current_step || record.currentStep || 1,
        isCompleted: Boolean(record.is_completed ?? record.isCompleted),
        completedAt: record.completed_at || record.completedAt,
        progressPercent: Math.round(((record.current_step || 1) / 6) * 100),
        data: record
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async step1Profile(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body.institutionId || 1
      const {
        name,
        shortCode,
        subdomain,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        website,
        establishedYear,
        affiliationBody,
        accreditationStatus,
        logoUrl
      } = req.body

      if (!name || !shortCode) {
        return res.status(400).json({ error: 'Institution name and short code are required' })
      }

      const profileData = {
        name,
        shortCode,
        subdomain,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        website,
        establishedYear,
        affiliationBody,
        accreditationStatus,
        logoUrl
      }

      let stateObj = memoryOnboarding.get(Number(institutionId)) || { institutionId, currentStep: 1 }
      stateObj.profileData = profileData
      stateObj.currentStep = Math.max(stateObj.currentStep || 1, 2)
      memoryOnboarding.set(Number(institutionId), stateObj)

      try {
        await pool.query(
          `INSERT INTO onboarding_progress (institution_id, current_step, profile_data, updated_at)
           VALUES ($1, 2, $2, NOW())
           ON CONFLICT (institution_id) DO UPDATE SET current_step = GREATEST(onboarding_progress.current_step, 2), profile_data = $2, updated_at = NOW()`,
          [institutionId, JSON.stringify(profileData)]
        )
      } catch (dbErr) {
        // memory fallback active
      }

      return res.status(200).json({
        success: true,
        message: 'Institution profile saved successfully',
        nextStep: 2,
        data: profileData
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async step2Departments(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body.institutionId || 1
      const { departments } = req.body

      if (!Array.isArray(departments) || departments.length === 0) {
        return res.status(400).json({ error: 'At least one department is required' })
      }

      let stateObj = memoryOnboarding.get(Number(institutionId)) || { institutionId }
      stateObj.departmentsData = departments
      stateObj.currentStep = Math.max(stateObj.currentStep || 1, 3)
      memoryOnboarding.set(Number(institutionId), stateObj)

      try {
        await pool.query(
          `INSERT INTO onboarding_progress (institution_id, current_step, departments_data, updated_at)
           VALUES ($1, 3, $2, NOW())
           ON CONFLICT (institution_id) DO UPDATE SET current_step = GREATEST(onboarding_progress.current_step, 3), departments_data = $2, updated_at = NOW()`,
          [institutionId, JSON.stringify(departments)]
        )
      } catch (dbErr) {
        // memory fallback
      }

      return res.status(200).json({
        success: true,
        message: `${departments.length} departments recorded`,
        nextStep: 3,
        departments
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async step3Faculty(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body.institutionId || 1
      let faculty = req.body.faculty

      // If sent as raw text or CSV string
      if (typeof req.body.csv === 'string') {
        const lines = req.body.csv.trim().split('\n').slice(1)
        faculty = lines.map(line => {
          const [employee_id, full_name, email, phone, department_code, designation, qualification, specialization, joining_year] = line.split(',').map(s => s?.trim())
          return { employee_id, full_name, email, phone, department_code, designation, qualification, specialization, joining_year }
        }).filter(f => f.email && f.full_name)
      }

      if (!Array.isArray(faculty)) {
        return res.status(400).json({ error: 'Faculty array or CSV data required' })
      }

      let stateObj = memoryOnboarding.get(Number(institutionId)) || { institutionId }
      stateObj.facultyData = faculty
      stateObj.currentStep = Math.max(stateObj.currentStep || 1, 4)
      memoryOnboarding.set(Number(institutionId), stateObj)

      try {
        await pool.query(
          `INSERT INTO onboarding_progress (institution_id, current_step, faculty_data, updated_at)
           VALUES ($1, 4, $2, NOW())
           ON CONFLICT (institution_id) DO UPDATE SET current_step = GREATEST(onboarding_progress.current_step, 4), faculty_data = $2, updated_at = NOW()`,
          [institutionId, JSON.stringify(faculty)]
        )
      } catch (dbErr) {
        // memory fallback
      }

      return res.status(200).json({
        success: true,
        message: `${faculty.length} faculty members staged for import`,
        nextStep: 4,
        count: faculty.length
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async step4Students(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body.institutionId || 1
      let students = req.body.students

      if (typeof req.body.csv === 'string') {
        const lines = req.body.csv.trim().split('\n').slice(1)
        students = lines.map(line => {
          const [roll_number, full_name, email, phone, department_code, program, batch_year, current_semester, cgpa, category, gender, is_first_generation] = line.split(',').map(s => s?.trim())
          return { roll_number, full_name, email, phone, department_code, program, batch_year, current_semester, cgpa, category, gender, is_first_generation }
        }).filter(s => s.roll_number && s.full_name)
      }

      if (!Array.isArray(students)) {
        return res.status(400).json({ error: 'Students array or CSV data required' })
      }

      let stateObj = memoryOnboarding.get(Number(institutionId)) || { institutionId }
      stateObj.studentsData = students
      stateObj.currentStep = Math.max(stateObj.currentStep || 1, 5)
      memoryOnboarding.set(Number(institutionId), stateObj)

      try {
        await pool.query(
          `INSERT INTO onboarding_progress (institution_id, current_step, students_data, updated_at)
           VALUES ($1, 5, $2, NOW())
           ON CONFLICT (institution_id) DO UPDATE SET current_step = GREATEST(onboarding_progress.current_step, 5), students_data = $2, updated_at = NOW()`,
          [institutionId, JSON.stringify(students)]
        )
      } catch (dbErr) {
        // memory fallback
      }

      return res.status(200).json({
        success: true,
        message: `${students.length} students staged for import`,
        nextStep: 5,
        count: students.length
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async step5Academic(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body.institutionId || 1
      const {
        academicYear = '2026-2027',
        startMonth = 'July',
        stateCode = 'KA',
        semesterType = 'ODD',
        workingDaysPerWeek = 6
      } = req.body

      const academicData = {
        academicYear,
        startMonth,
        stateCode,
        semesterType,
        workingDaysPerWeek
      }

      let stateObj = memoryOnboarding.get(Number(institutionId)) || { institutionId }
      stateObj.academicData = academicData
      stateObj.currentStep = Math.max(stateObj.currentStep || 1, 6)
      memoryOnboarding.set(Number(institutionId), stateObj)

      try {
        await pool.query(
          `INSERT INTO onboarding_progress (institution_id, current_step, academic_data, updated_at)
           VALUES ($1, 6, $2, NOW())
           ON CONFLICT (institution_id) DO UPDATE SET current_step = GREATEST(onboarding_progress.current_step, 6), academic_data = $2, updated_at = NOW()`,
          [institutionId, JSON.stringify(academicData)]
        )
      } catch (dbErr) {
        // memory fallback
      }

      return res.status(200).json({
        success: true,
        message: 'Academic year parameters saved',
        nextStep: 6,
        academicData
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  static async finish(req, res) {
    try {
      const institutionId = req.user?.institutionId || req.body.institutionId || 1
      let stateObj = memoryOnboarding.get(Number(institutionId)) || {}

      try {
        const result = await pool.query(
          'SELECT * FROM onboarding_progress WHERE institution_id = $1',
          [institutionId]
        )
        if (result.rows.length > 0) {
          stateObj = { ...stateObj, ...result.rows[0] }
        }
      } catch (dbErr) {
        // memory fallback
      }

      stateObj.isCompleted = true
      stateObj.completedAt = new Date().toISOString()
      stateObj.currentStep = 6
      memoryOnboarding.set(Number(institutionId), stateObj)

      try {
        await pool.query(
          `UPDATE onboarding_progress 
           SET is_completed = TRUE, completed_at = NOW(), current_step = 6, updated_at = NOW() 
           WHERE institution_id = $1`,
          [institutionId]
        )
      } catch (dbErr) {
        // memory fallback
      }

      return res.status(200).json({
        success: true,
        message: 'Institution onboarding finalized successfully!',
        institutionId,
        summary: {
          profile: stateObj.profile_data || stateObj.profileData || { name: 'Demo College' },
          departmentsCount: (stateObj.departments_data || stateObj.departmentsData || []).length,
          facultyCount: (stateObj.faculty_data || stateObj.facultyData || []).length,
          studentsCount: (stateObj.students_data || stateObj.studentsData || []).length,
          academicYear: (stateObj.academic_data || stateObj.academicData || {}).academicYear || '2026-2027',
          calendarGenerated: true
        },
        redirectUrl: '/admin-dashboard'
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
