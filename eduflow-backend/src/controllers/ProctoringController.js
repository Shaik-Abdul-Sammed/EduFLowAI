/**
 * ProctoringController.js
 * Software-based Online Proctoring System for EduFlow AI OS.
 * Records webcam and telemetry violations (FACE_MISSING, tab-switch, window blur).
 * Automatically locks the exam session after 3 violations.
 */

const memoryViolations = []

export class ProctoringController {
  /**
   * Records a proctoring violation event.
   * POST /api/v1/exams/:id/violation
   */
  static async recordViolation(req, res) {
    try {
      const { id } = req.params
      const {
        student_roll = 'SS26',
        student_name = 'Student',
        violation_type = 'FACE_MISSING',
        details
      } = req.body || {}

      const violation = {
        id: memoryViolations.length + 1,
        exam_id: Number(id) || id,
        student_roll,
        student_name,
        violation_type,
        details: details || `Proctoring alert: ${violation_type} detected.`,
        timestamp: new Date().toISOString()
      }

      memoryViolations.unshift(violation)

      // Count violations for this student and exam
      const studentViolations = memoryViolations.filter(
        (v) => String(v.exam_id) === String(id) && v.student_roll === student_roll
      )
      const violationsCount = studentViolations.length
      const isLocked = violationsCount >= 3

      return res.status(201).json({
        success: true,
        violationId: violation.id,
        violation,
        violationsCount,
        locked: isLocked,
        autoSubmitted: isLocked,
        message: isLocked
          ? 'Threshold exceeded: Exam locked and submitted automatically due to proctoring infractions.'
          : 'Proctoring violation recorded.'
      })
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  /**
   * Retrieves all logged violations for a specific exam.
   * GET /api/v1/exams/:id/violations
   */
  static async getViolations(req, res) {
    try {
      const { id } = req.params
      const results = memoryViolations.filter(
        (v) => !id || String(v.exam_id) === String(id)
      )
      return res.json({ success: true, violations: results, total: results.length })
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message })
    }
  }

  /**
   * Reset / clear violations (helper for testing)
   */
  static _resetMemory() {
    memoryViolations.length = 0
  }
}

export default ProctoringController
