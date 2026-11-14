import { pool } from '../db/pool.js'
import { WhatsAppAttendance } from '../services/attendance/WhatsAppAttendance.js'

/**
 * Presence Tracking Engine (Background Worker)
 * 
 * 1. Dwell-Time Calculation Engine:
 *    Calculates time student spent connected to classroom APs.
 *    If a student is connected to a classroom AP for > 80% of class duration
 *    (e.g., >= 48 mins out of 60 mins), they are automatically marked PRESENT.
 * 
 * 2. DPDP Act 2023 Data Minimization & Retention Policy:
 *    Deletes presence_sessions older than 90 days.
 * 
 * 3. Silent Faculty WhatsApp Dashboard Notification:
 *    Dispatches silent sync alerts to faculty WhatsApp streams.
 */

// In-memory fallback stores for test suite execution without PostgreSQL
export const memoryPresenceStore = {
  zones: [
    { id: 1, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:01', ip_subnet: '10.20.101.0/24', zone_type: 'CLASSROOM', room_name: 'Room 101', building_name: 'Academic Block A' },
    { id: 2, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:02', ip_subnet: '10.20.102.0/24', zone_type: 'CLASSROOM', room_name: 'Room 102', building_name: 'Academic Block A' },
    { id: 3, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:03', ip_subnet: '10.20.103.0/24', zone_type: 'CLASSROOM', room_name: 'CSE Lab 3', building_name: 'Turing Science Center' },
    { id: 4, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:10', ip_subnet: '10.30.201.0/24', zone_type: 'DORM', room_name: 'Block D - Dorm 204', building_name: 'Aryabhata Boys Hostel' },
    { id: 5, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:11', ip_subnet: '10.30.202.0/24', zone_type: 'DORM', room_name: 'Block G - Dorm 108', building_name: 'Gargi Girls Hostel' },
    { id: 6, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:20', ip_subnet: '10.40.101.0/24', zone_type: 'LIBRARY', room_name: 'Central Reading Hall', building_name: 'Dr. Radhakrishnan Library' },
    { id: 7, institution_id: 1, ap_bssid: '00:1A:2B:3C:4D:30', ip_subnet: '10.50.101.0/24', zone_type: 'CAFETERIA', room_name: 'Main Campus Diner', building_name: 'Student Amenities Hub' }
  ],
  devices: [
    {
      id: 1,
      student_id: 101,
      student_roll: '2024-CSE-042',
      student_name: 'Aarav Sharma',
      mac_address_hash: 'a9b2ad6f4919c2ddcc2e04825227372ce079c0fe392d636d293d9f048a2c7926', // sha256 of 001122334455 (00:11:22:33:44:55)
      college_email: 'aarav.sharma@eduflow.edu',
      device_name: 'iPhone 15 Pro',
      is_active: true,
      last_seen_at: new Date()
    },
    {
      id: 2,
      student_id: 102,
      student_roll: '2024-CSE-088',
      student_name: 'Riya Patel',
      mac_address_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      college_email: 'riya.patel@eduflow.edu',
      device_name: 'MacBook Air',
      is_active: true,
      last_seen_at: new Date()
    },
    {
      id: 3,
      student_id: 103,
      student_roll: '2024-CSE-105',
      student_name: 'Kabir Verma',
      mac_address_hash: 'fcde2b2edba56bf408686f350a7d9d89ee3a0515f30ec72b5634a73112a409f7',
      college_email: 'kabir.verma@eduflow.edu',
      device_name: 'Samsung Galaxy S24',
      is_active: true,
      last_seen_at: new Date()
    }
  ],
  sessions: [
    {
      id: 1,
      student_id: 101,
      student_roll: '2024-CSE-042',
      student_name: 'Aarav Sharma',
      zone_id: 3,
      course_id: 'CS301',
      start_time: new Date(Date.now() - 50 * 60 * 1000),
      end_time: null,
      duration_minutes: 50,
      dwell_time_percentage: 83.3,
      status: 'PRESENT',
      created_at: new Date()
    },
    {
      id: 2,
      student_id: 102,
      student_roll: '2024-CSE-088',
      student_name: 'Riya Patel',
      zone_id: 4,
      course_id: 'CS301',
      start_time: new Date(Date.now() - 40 * 60 * 1000),
      end_time: null,
      duration_minutes: 40,
      dwell_time_percentage: 15.0,
      status: 'ABSENT',
      created_at: new Date()
    }
  ],
  disputes: []
}

/**
 * Calculate dwell times across active presence sessions.
 * Rule: If student connected to classroom AP for > 80% of class duration, mark them as PRESENT.
 */
export async function calculateDwellTimes(classDurationMinutes = 60) {
  const summary = {
    evaluated: 0,
    evaluatedSessions: 0,
    markedPresent: 0,
    markedAbsent: 0,
    updatedAt: new Date().toISOString()
  }

  try {
    if (pool.isMemoryMode) {
      for (const session of memoryPresenceStore.sessions) {
        summary.evaluated++
        summary.evaluatedSessions++
        const zone = memoryPresenceStore.zones.find(z => z.id === session.zone_id)
        const isClassroom = zone?.zone_type === 'CLASSROOM'
        const dwellPercent = Math.min(100, Math.round(((session.duration_minutes || 0) / classDurationMinutes) * 100 * 10) / 10)
        session.dwell_time_percentage = dwellPercent

        if (session.status !== 'DISPUTED') {
          if (isClassroom && dwellPercent >= 80) {
            session.status = 'PRESENT'
            summary.markedPresent++
          } else if (!isClassroom && session.course_id) {
            session.status = 'ABSENT'
            summary.markedAbsent++
          }
        }
      }
      return summary
    }

    // Production PostgreSQL with parameterized queries
    const selectQuery = `
      SELECT ps.id, ps.duration_minutes, ps.status, nz.zone_type
      FROM presence_sessions ps
      LEFT JOIN network_zones nz ON ps.zone_id = nz.id
      WHERE ps.created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND ps.status != 'DISPUTED'
    `
    const { rows } = await pool.query(selectQuery)
    summary.evaluated = rows.length

    for (const row of rows) {
      const duration = Number(row.duration_minutes) || 0
      const dwellPercent = Math.min(100, Math.round((duration / classDurationMinutes) * 100 * 10) / 10)
      const isClassroom = row.zone_type === 'CLASSROOM'
      const newStatus = (isClassroom && dwellPercent >= 80) ? 'PRESENT' : (isClassroom ? row.status : 'ABSENT')

      await pool.query(
        `UPDATE presence_sessions
         SET dwell_time_percentage = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [dwellPercent, newStatus, row.id]
      )

      if (newStatus === 'PRESENT') summary.markedPresent++
      else summary.markedAbsent++
    }

    return summary
  } catch (err) {
    console.error('[PresenceEngine] Dwell time calculation error:', err)
    return summary
  }
}

/**
 * DPDP Act 2023 Data Minimization: Delete presence records older than 90 days.
 */
export async function runDataRetentionCleanup(retentionDays = 90) {
  const result = {
    purgedCount: 0,
    purgedSessions: 0,
    purgedDisputes: 0,
    cutoffDate: new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SUCCESS'
  }

  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

    if (pool.isMemoryMode) {
      const initialSessionCount = memoryPresenceStore.sessions.length
      memoryPresenceStore.sessions = memoryPresenceStore.sessions.filter(s => new Date(s.created_at) >= cutoffDate)
      result.purgedSessions = initialSessionCount - memoryPresenceStore.sessions.length

      const initialDisputeCount = memoryPresenceStore.disputes.length
      memoryPresenceStore.disputes = memoryPresenceStore.disputes.filter(d => new Date(d.created_at) >= cutoffDate)
      result.purgedDisputes = initialDisputeCount - memoryPresenceStore.disputes.length
      result.purgedCount = result.purgedSessions + result.purgedDisputes

      return result
    }

    // Parameterized PostgreSQL queries for compliance
    const deleteSessions = await pool.query(
      'DELETE FROM presence_sessions WHERE created_at < $1 RETURNING id',
      [cutoffDate]
    )
    result.purgedSessions = deleteSessions.rowCount || 0

    const deleteDisputes = await pool.query(
      'DELETE FROM presence_disputes WHERE created_at < $1 RETURNING id',
      [cutoffDate]
    )
    result.purgedDisputes = deleteDisputes.rowCount || 0

    return result
  } catch (err) {
    console.error('[PresenceEngine] Data retention purge error:', err)
    result.status = 'ERROR'
    result.error = err.message
    return result
  }
}

/**
 * Trigger silent background WhatsApp update to faculty dashboard
 */
export async function dispatchSilentFacultyPresenceUpdate(courseId, presenceCounts) {
  try {
    const updateText = `[WI-FI AUTO-SYNC] Live Classroom ${courseId}: ${presenceCounts.presentInClass} present via Wi-Fi Dwell Time (>80%), ${presenceCounts.inDorm} in dorms, ${presenceCounts.outside} outside.`
    // Log to faculty WhatsApp event log
    await WhatsAppAttendance.logMessage('OUTBOUND', '+919900011222', '+919876543210', updateText, 'AUTO_PRESENCE_SYNC')
    return { success: true, message: updateText }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

let presenceInterval = null

export function startPresenceEngineWorker(intervalMs = 300000) {
  if (presenceInterval) return
  presenceInterval = setInterval(async () => {
    await calculateDwellTimes(60)
    await runDataRetentionCleanup(90)
  }, intervalMs)

  if (presenceInterval.unref) {
    presenceInterval.unref()
  }
}

export function stopPresenceEngineWorker() {
  if (presenceInterval) {
    clearInterval(presenceInterval)
    presenceInterval = null
  }
}
