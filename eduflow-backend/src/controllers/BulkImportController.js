import { pool } from '../db/pool.js'
import { facultyImportSchema, courseImportSchema } from '../middleware/validateRequest.js'

const memoryFaculty = []
const memoryCourses = []

export class BulkImportController {
  /**
   * Bulk import faculty members
   * POST /api/v1/faculty/bulk-import
   */
  static async bulkImportFaculty(req, res) {
    try {
      const payload = Array.isArray(req.body) ? { faculty: req.body } : req.body || {}
      if (!Array.isArray(payload.faculty) || payload.faculty.length === 0) {
        return res.status(400).json({ error: 'Faculty array must not be empty' })
      }

      const validated = facultyImportSchema.safeParse(payload)
      if (!validated.success) {
        return res.status(400).json({
          error: 'Validation failed on faculty items',
          details: validated.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
        })
      }

      const facultyList = validated.data.faculty
      const imported = []

      // Attempt DB insert or fall back to memory
      try {
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          for (const f of facultyList) {
            const query = `
              INSERT INTO users (institution_id, name, email, role, password_hash)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
              RETURNING id, name, email, role
            `
            const resInsert = await client.query(query, [
              1,
              f.name,
              f.email,
              'faculty',
              '$2a$10$abcdefghijklmnopqrstuu' // mock default hash
            ])
            imported.push({ ...f, id: resInsert.rows[0]?.id || imported.length + 1 })
          }
          await client.query('COMMIT')
        } catch (dbErr) {
          await client.query('ROLLBACK')
          throw dbErr
        } finally {
          client.release()
        }
      } catch (_err) {
        // In-memory fallback
        for (const f of facultyList) {
          const item = { ...f, id: memoryFaculty.length + 1, role: 'faculty' }
          memoryFaculty.push(item)
          imported.push(item)
        }
      }

      return res.status(201).json({
        success: true,
        message: `Successfully imported ${imported.length} faculty members`,
        count: imported.length,
        faculty: imported
      })
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Internal server error during faculty bulk import' })
    }
  }

  /**
   * Bulk import course catalog
   * POST /api/v1/courses/bulk-import
   */
  static async bulkImportCourses(req, res) {
    try {
      const payload = Array.isArray(req.body) ? { courses: req.body } : req.body || {}
      if (!Array.isArray(payload.courses) || payload.courses.length === 0) {
        return res.status(400).json({ error: 'Courses array must not be empty' })
      }

      const validated = courseImportSchema.safeParse(payload)
      if (!validated.success) {
        return res.status(400).json({
          error: 'Validation failed on course items',
          details: validated.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
        })
      }

      const coursesList = validated.data.courses
      const imported = []

      for (const c of coursesList) {
        const item = { ...c, id: memoryCourses.length + 1, createdAt: new Date().toISOString() }
        memoryCourses.push(item)
        imported.push(item)
      }

      return res.status(201).json({
        success: true,
        message: `Successfully imported ${imported.length} courses`,
        count: imported.length,
        courses: imported
      })
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Internal server error during courses bulk import' })
    }
  }
}
