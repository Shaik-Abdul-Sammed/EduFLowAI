import crypto from 'node:crypto'
import { pool } from '../db/pool.js'
import { memoryPresenceStore, calculateDwellTimes, dispatchSilentFacultyPresenceUpdate } from '../workers/presenceEngine.js'

export class NetworkWebhookController {
  /**
   * Helper to hash MAC addresses using SHA-256 (DPDP Act 2023 compliance)
   */
  static hashMac(rawMac) {
    if (!rawMac) return ''
    const normalized = rawMac.toLowerCase().trim().replace(/[:-]/g, '')
    return crypto.createHash('sha256').update(normalized).digest('hex')
  }

  /**
   * POST /api/v1/network/association
   * Ingests association events from campus Wi-Fi APs / wireless LAN controllers
   */
  static async handleAssociation(req, res) {
    try {
      // Secret validation
      const secretHeader = req.headers['x-network-secret']
      const expectedSecret = process.env.NETWORK_WEBHOOK_SECRET || 'eduflow-mesh-secret-2026'

      if (!secretHeader || secretHeader !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid network webhook secret' })
      }

      const { macAddress, apBssid, ipAddress, timestamp } = req.body || {}

      if (!macAddress || !apBssid) {
        return res.status(400).json({ error: 'Missing required fields: macAddress and apBssid are required' })
      }

      const macHash = NetworkWebhookController.hashMac(macAddress)
      const normalizedBssid = apBssid.toUpperCase().trim()

      let device = null
      let zone = null
      let session = null

      // Check PostgreSQL first
      try {
        const deviceRes = await pool.query(
          `SELECT * FROM student_devices WHERE mac_address_hash = $1 AND is_active = true LIMIT 1`,
          [macHash]
        )
        if (deviceRes.rows?.length > 0) {
          device = deviceRes.rows[0]
        }

        const zoneRes = await pool.query(
          `SELECT * FROM network_zones WHERE ap_bssid = $1 LIMIT 1`,
          [normalizedBssid]
        )
        if (zoneRes.rows?.length > 0) {
          zone = zoneRes.rows[0]
        }
      } catch {
        // Handled below via fallback
      }

      // Memory-store fallback
      if (!device) {
        device = memoryPresenceStore.devices.find(d => d.mac_address_hash === macHash && d.is_active)
      }
      if (!zone) {
        zone = memoryPresenceStore.zones.find(z => z.ap_bssid.toUpperCase() === normalizedBssid)
      }

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'Device not registered in EduFlow Student Network Directory',
          macHash
        })
      }

      const zoneId = zone ? zone.id : null
      const zoneType = zone ? zone.zone_type : 'UNKNOWN'
      const roomName = zone ? zone.room_name : 'Unknown Location'
      const buildingName = zone ? zone.building_name : 'Campus Ground'

      // Update last seen
      device.last_seen_at = new Date(timestamp || Date.now())

      // Find or create active presence session
      let existingSession = memoryPresenceStore.sessions.find(
        s => s.student_id === device.student_id && s.end_time === null
      )

      if (existingSession) {
        // If moved to a different zone, close old session and start new
        if (existingSession.zone_id !== zoneId) {
          existingSession.end_time = new Date()
          existingSession.duration_minutes = Math.max(
            5,
            Math.round((existingSession.end_time - new Date(existingSession.start_time)) / 60000)
          )
          existingSession = null
        } else {
          // Increment session duration
          const elapsedMins = Math.max(
            5,
            Math.round((Date.now() - new Date(existingSession.start_time)) / 60000)
          )
          existingSession.duration_minutes = elapsedMins
          existingSession.dwell_time_percentage = Math.min(
            100,
            parseFloat(((elapsedMins / 60) * 100).toFixed(1))
          )
          if (zoneType === 'CLASSROOM' && existingSession.dwell_time_percentage >= 80) {
            existingSession.status = 'PRESENT'
          }
          session = existingSession
        }
      }

      if (!existingSession) {
        const newSession = {
          id: memoryPresenceStore.sessions.length + 1,
          student_id: device.student_id,
          student_roll: device.student_roll,
          student_name: device.student_name,
          zone_id: zoneId,
          course_id: 'CS301',
          start_time: new Date(timestamp || Date.now()),
          end_time: null,
          duration_minutes: 5,
          dwell_time_percentage: 8.3,
          status: zoneType === 'CLASSROOM' ? 'PRESENT' : 'ABSENT',
          created_at: new Date()
        }
        memoryPresenceStore.sessions.unshift(newSession)
        session = newSession
      }

      // Try database update with parameterized statement
      try {
        await pool.query(
          `UPDATE student_devices SET last_seen_at = NOW() WHERE mac_address_hash = $1`,
          [macHash]
        )
      } catch {
        // Memory fallback ok
      }

      // Trigger automatic dwell time calculation & silent faculty WhatsApp update
      calculateDwellTimes(60).catch(() => {})

      return res.status(200).json({
        success: true,
        message: 'AP association event ingested successfully',
        session: {
          id: session.id,
          studentRoll: session.student_roll,
          zoneType,
          roomName,
          buildingName,
          status: session.status,
          durationMinutes: session.duration_minutes,
          dwellTimePercentage: session.dwell_time_percentage
        }
      })
    } catch (err) {
      console.error('[NetworkWebhookController] Error handling association:', err)
      return res.status(500).json({ error: 'Internal network webhook error', details: err.message })
    }
  }

  /**
   * GET /api/v1/network/presence/live
   * Faculty Granular View (Faculty can see Room 101, connected duration, dwell %, and AP details)
   */
  static async getLivePresence(req, res) {
    try {
      const courseId = req.query.courseId || 'CS301'

      // Check PostgreSQL
      try {
        const dbRes = await pool.query(
          `SELECT s.*, z.zone_type, z.room_name, z.building_name, z.ap_bssid
           FROM presence_sessions s
           LEFT JOIN network_zones z ON s.zone_id = z.id
           WHERE s.course_id = $1 OR $1 IS NULL
           ORDER BY s.created_at DESC`,
          [courseId]
        )
        if (dbRes.rows && dbRes.rows.length > 0) {
          return res.status(200).json({
            success: true,
            source: 'database',
            courseId,
            sessions: dbRes.rows
          })
        }
      } catch {
        // Fall through to memory fallback
      }

      // Map memory store sessions with zones
      const enrichedSessions = memoryPresenceStore.sessions.map(s => {
        const zone = memoryPresenceStore.zones.find(z => z.id === s.zone_id)
        return {
          ...s,
          zone_type: zone?.zone_type || 'UNKNOWN',
          room_name: zone?.room_name || 'Campus Grounds',
          building_name: zone?.building_name || 'Main Campus',
          ap_bssid: zone?.ap_bssid || 'N/A'
        }
      })

      const classroomCount = enrichedSessions.filter(s => s.zone_type === 'CLASSROOM' && s.status === 'PRESENT').length
      const dormCount = enrichedSessions.filter(s => s.zone_type === 'DORM').length
      const outsideCount = enrichedSessions.filter(s => s.status === 'ABSENT' && s.zone_type !== 'DORM').length

      return res.status(200).json({
        success: true,
        source: 'memory_engine',
        courseId,
        metrics: {
          classroomCount,
          dormCount,
          outsideCount,
          totalTracked: enrichedSessions.length
        },
        sessions: enrichedSessions
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching live presence', details: err.message })
    }
  }

  /**
   * GET /api/v1/network/presence/student
   * Sanitized Student Presence View (DPDP Act 2023 Compliant)
   * Students ONLY see:
   * 🟢 "On Campus (Classroom)"
   * 🟡 "On Campus (Dorm)"
   * ⚪ "Outside Campus"
   * Specific room names, AP BSSIDs, and MAC hashes are strictly omitted.
   */
  static async getStudentSanitizedPresence(req, res) {
    try {
      const studentRoll = req.query.roll || req.params.roll || '2024-CSE-042'

      let latestSession = null
      let zone = null

      try {
        const dbRes = await pool.query(
          `SELECT s.status, s.duration_minutes, z.zone_type, s.created_at
           FROM presence_sessions s
           LEFT JOIN network_zones z ON s.zone_id = z.id
           WHERE s.student_roll = $1
           ORDER BY s.created_at DESC LIMIT 1`,
          [studentRoll]
        )
        if (dbRes.rows?.length > 0) {
          latestSession = dbRes.rows[0]
        }
      } catch {
        // Fallback
      }

      if (!latestSession) {
        const s = memoryPresenceStore.sessions.find(sess => sess.student_roll === studentRoll)
        if (s) {
          zone = memoryPresenceStore.zones.find(z => z.id === s.zone_id)
          latestSession = {
            status: s.status,
            duration_minutes: s.duration_minutes,
            zone_type: zone?.zone_type || 'UNKNOWN',
            created_at: s.created_at
          }
        }
      }

      // Determine sanitized badge
      let sanitizedBadge = '⚪ Outside Campus'
      let statusColor = 'gray'
      let isPresent = false

      if (latestSession) {
        if (latestSession.zone_type === 'CLASSROOM') {
          sanitizedBadge = '🟢 On Campus (Classroom)'
          statusColor = 'emerald'
          isPresent = true
        } else if (latestSession.zone_type === 'DORM') {
          sanitizedBadge = '🟡 On Campus (Dorm)'
          statusColor = 'amber'
          isPresent = false
        } else if (latestSession.zone_type === 'LIBRARY' || latestSession.zone_type === 'CAFETERIA') {
          sanitizedBadge = '🟢 On Campus (Amenities)'
          statusColor = 'emerald'
          isPresent = true
        }
      }

      return res.status(200).json({
        success: true,
        dpdpCompliant: true,
        studentRoll,
        sanitizedStatus: sanitizedBadge,
        statusColor,
        isPresent,
        lastUpdated: latestSession?.created_at || new Date().toISOString()
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error generating sanitized presence status', details: err.message })
    }
  }

  /**
   * POST /api/v1/network/presence/dispute
   * Student submits dispute when Wi-Fi disconnects
   */
  static async submitDispute(req, res) {
    try {
      const { sessionId, studentRoll, studentName, reason } = req.body || {}

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Dispute reason is required' })
      }

      let dispute = {
        id: memoryPresenceStore.disputes.length + 1,
        session_id: sessionId || 1,
        student_roll: studentRoll || '2024-CSE-088',
        student_name: studentName || 'Student',
        reason: reason.trim(),
        status: 'PENDING',
        resolved_by: null,
        created_at: new Date()
      }

      try {
        const dbRes = await pool.query(
          `INSERT INTO presence_disputes (student_id, student_roll, session_id, reason, status)
           VALUES ($1, $2, $3, $4, 'PENDING')
           RETURNING *`,
          [102, studentRoll || '2024-CSE-088', sessionId || 1, reason.trim()]
        )
        if (dbRes.rows?.length > 0) {
          dispute = dbRes.rows[0]
        }
      } catch {
        // Fallback to memory
      }

      memoryPresenceStore.disputes.unshift(dispute)

      // Mark session as DISPUTED
      const session = memoryPresenceStore.sessions.find(s => s.id === Number(sessionId))
      if (session) {
        session.status = 'DISPUTED'
      }

      return res.status(201).json({
        success: true,
        message: 'Attendance dispute submitted for HOD/Faculty review',
        dispute
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error submitting presence dispute', details: err.message })
    }
  }

  /**
   * GET /api/v1/network/presence/disputes
   * Faculty Dispute Management Desk
   */
  static async getDisputes(req, res) {
    try {
      try {
        const dbRes = await pool.query(`SELECT * FROM presence_disputes ORDER BY created_at DESC`)
        if (dbRes.rows?.length > 0) {
          return res.status(200).json({ success: true, disputes: dbRes.rows })
        }
      } catch {
        // Fallback
      }

      return res.status(200).json({
        success: true,
        disputes: memoryPresenceStore.disputes
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching disputes', details: err.message })
    }
  }

  /**
   * PATCH /api/v1/network/presence/disputes/:id
   * HOD / Faculty 1-click dispute resolution
   */
  static async resolveDispute(req, res) {
    try {
      const disputeId = parseInt(req.params.id, 10)
      const { status, resolvedBy } = req.body || {}

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' })
      }

      let dispute = memoryPresenceStore.disputes.find(d => d.id === disputeId)
      if (dispute) {
        dispute.status = status
        dispute.resolved_by = resolvedBy || 'Dr. Ramesh Kumar (HOD)'
        dispute.updated_at = new Date()

        // If approved, update presence session to PRESENT
        if (status === 'APPROVED') {
          const session = memoryPresenceStore.sessions.find(s => s.id === dispute.session_id)
          if (session) {
            session.status = 'PRESENT'
          }
        }
      }

      try {
        await pool.query(
          `UPDATE presence_disputes SET status = $1, resolved_by = $2, updated_at = NOW() WHERE id = $3`,
          [status, resolvedBy || 'Dr. Ramesh Kumar (HOD)', disputeId]
        )
      } catch {
        // Handled in memory
      }

      return res.status(200).json({
        success: true,
        message: `Dispute marked as ${status}`,
        dispute
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error resolving dispute', details: err.message })
    }
  }

  /**
   * POST /api/v1/network/devices/register
   * Registers student device without storing raw MAC (DPDP Act compliance)
   */
  static async registerDevice(req, res) {
    try {
      const { studentId, studentRoll, studentName, collegeEmail, macAddress, deviceName } = req.body || {}

      if (!macAddress || !studentRoll) {
        return res.status(400).json({ error: 'MAC address and Student Roll are required' })
      }

      const macHash = NetworkWebhookController.hashMac(macAddress)

      const newDevice = {
        id: memoryPresenceStore.devices.length + 1,
        student_id: studentId || 104,
        student_roll: studentRoll,
        student_name: studentName || 'Registered Student',
        mac_address_hash: macHash,
        college_email: collegeEmail || `${studentRoll.toLowerCase()}@eduflow.edu`,
        device_name: deviceName || 'Personal Laptop / Phone',
        is_active: true,
        last_seen_at: new Date()
      }

      try {
        await pool.query(
          `INSERT INTO student_devices (student_id, student_roll, mac_address_hash, college_email, device_name, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (mac_address_hash) DO UPDATE SET is_active = true, last_seen_at = NOW()`,
          [newDevice.student_id, newDevice.student_roll, macHash, newDevice.college_email, newDevice.device_name]
        )
      } catch {
        // Fallback
      }

      memoryPresenceStore.devices.push(newDevice)

      return res.status(201).json({
        success: true,
        message: 'Device securely registered for invisible presence tracking',
        device: {
          id: newDevice.id,
          studentRoll: newDevice.student_roll,
          deviceName: newDevice.device_name,
          macHashPreview: `${macHash.substring(0, 8)}...${macHash.substring(macHash.length - 8)}`
        }
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error registering device', details: err.message })
    }
  }

  /**
   * GET /api/v1/network/zones
   */
  static async getZones(req, res) {
    try {
      try {
        const dbRes = await pool.query(`SELECT * FROM network_zones ORDER BY id ASC`)
        if (dbRes.rows?.length > 0) {
          return res.status(200).json({ success: true, zones: dbRes.rows })
        }
      } catch {
        // Fallback
      }

      return res.status(200).json({
        success: true,
        zones: memoryPresenceStore.zones
      })
    } catch (err) {
      return res.status(500).json({ error: 'Error fetching network zones', details: err.message })
    }
  }
}
