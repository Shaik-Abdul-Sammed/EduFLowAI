import { pool } from '../db/pool.js'
import { WhatsAppAttendance } from '../services/attendance/WhatsAppAttendance.js'

let workerInterval = null

export async function processConfirmedStagedAttendance() {
  const stagedMem = WhatsAppAttendance.getStagedStore().filter(r => r.status === 'CONFIRMED')
  let dbRows = []

  try {
    const res = await pool.query(
      `SELECT * FROM whatsapp_staged_attendance
       WHERE status = 'CONFIRMED'
       ORDER BY created_at ASC`
    )
    if (res.rows) {
      dbRows = res.rows
    }
  } catch {
    // In-memory fallback
  }

  const combined = dbRows.length > 0 ? dbRows : stagedMem
  let processedCount = 0

  for (const item of combined) {
    // Mark as PROCESSED in memory
    const inMem = WhatsAppAttendance.getStagedStore().find(r => r.id === item.id)
    if (inMem) inMem.status = 'PROCESSED'

    // Update in DB
    try {
      await pool.query(
        `UPDATE whatsapp_staged_attendance
         SET status = 'PROCESSED'
         WHERE id = $1`,
        [item.id]
      )

      // Insert summary record into attendance_records
      await pool.query(
        `INSERT INTO attendance_records 
         (institution_id, date, status, course_code, remarks)
         VALUES ($1, $2, 'PRESENT', $3, $4)`,
        [
          item.institution_id || 1,
          item.date,
          item.course_code,
          `WhatsApp Ingestion: ${item.present_count} Present, ${item.absent_count} Absent (Section ${item.section})`
        ]
      )

      // Log in staff_activity_log
      await pool.query(
        `INSERT INTO staff_activity_log
         (institution_id, staff_user_id, officer_key, action_type, prompt_text, output_summary, approval_status)
         VALUES ($1, $2, 'attendance', 'WHATSAPP_ATTENDANCE_SYNC', $3, $4, 'APPROVED')`,
        [
          item.institution_id || 1,
          item.faculty_id || 1,
          item.raw_message,
          `Synchronized WhatsApp attendance for ${item.course_code} ${item.section}: ${item.present_count} present, ${item.absent_count} absent`
        ]
      )
    } catch {
      // Non-fatal if DB write encounters issues
    }

    processedCount++
  }

  return { processedCount }
}

export function startWhatsAppAttendanceWorker(intervalMs = 5 * 60 * 1000) {
  if (workerInterval) return workerInterval

  workerInterval = setInterval(async () => {
    try {
      await processConfirmedStagedAttendance()
    } catch (err) {
      console.error('[WhatsApp Attendance Worker Error]:', err.message)
    }
  }, intervalMs)

  return workerInterval
}

export function stopWhatsAppAttendanceWorker() {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }
}
