import { pool } from '../../db/pool.js'

// In-memory fallback stores for tests and development without DB
const stagedAttendanceStore = []
const messageLogStore = []

export class WhatsAppAttendance {
  static getStagedStore() {
    return stagedAttendanceStore
  }

  static getMessageLogStore() {
    return messageLogStore
  }

  static clearStores() {
    stagedAttendanceStore.length = 0
    messageLogStore.length = 0
  }

  /**
   * Parse faculty WhatsApp attendance message
   * Examples:
   *  - "CSE 3A present 45 absent 5"
   *  - "CS301 23/30"
   *  - "attendance CSE-3A today 48 present"
   *  - "CS201 Section B: 40 present, 2 absent"
   * @param {string} message
   * @param {string} facultyPhone
   * @param {number} [facultyId=1]
   * @returns {object}
   */
  static parseAttendanceMessage(message, facultyPhone = '+919876543210', facultyId = 1) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string')
    }

    const clean = message.trim()
    const today = new Date().toISOString().split('T')[0]

    let courseCode = 'GEN101'
    let section = 'A'
    let presentCount = 0
    let absentCount = 0

    // Pattern 1: "CS301 23/30" or "CSE-301 45/50"
    const ratioMatch = clean.match(/([A-Z]{2,5}[-\s]?\d{3}[A-Z]?)\s+(\d+)\s*\/\s*(\d+)/i)
    if (ratioMatch) {
      courseCode = ratioMatch[1].replace(/\s+/g, '-').toUpperCase()
      presentCount = parseInt(ratioMatch[2], 10)
      const total = parseInt(ratioMatch[3], 10)
      absentCount = Math.max(0, total - presentCount)
      section = 'A'
    } else {
      // Pattern 2: "CSE 3A present 45 absent 5" or "attendance CSE-3A today 48 present"
      // Course / Dept & Section match
      const deptSecMatch = clean.match(/(?:attendance\s+)?([A-Z]{2,5})[-_\s]?(\d[A-Z]|[A-Z]\d|[A-Z]|\d)/i)
      if (deptSecMatch) {
        courseCode = deptSecMatch[1].toUpperCase()
        section = deptSecMatch[2].toUpperCase()
      } else {
        const anyCourseMatch = clean.match(/([A-Z]{2,5}[-\s]?\d{0,3}[A-Z]?)/i)
        if (anyCourseMatch) {
          courseCode = anyCourseMatch[1].toUpperCase()
        }
      }

      // Present count: check "present 45" or "45 present"
      const afterPresent = clean.match(/present\s*[:=]?\s*(\d+)/i)
      if (afterPresent) {
        presentCount = parseInt(afterPresent[1], 10)
      } else {
        const beforePresent = clean.match(/(\d+)\s*present/i)
        if (beforePresent) {
          presentCount = parseInt(beforePresent[1], 10)
        }
      }

      // Absent count: check "absent 5" or "5 absent"
      const afterAbsent = clean.match(/absent\s*[:=]?\s*(\d+)/i)
      if (afterAbsent) {
        absentCount = parseInt(afterAbsent[1], 10)
      } else {
        const beforeAbsent = clean.match(/(\d+)\s*absent/i)
        if (beforeAbsent) {
          absentCount = parseInt(beforeAbsent[1], 10)
        }
      }

      // Shorthand fallback: "45p 5a"
      if (presentCount === 0) {
        const shortPresent = clean.match(/\b(\d+)\s*p\b/i)
        if (shortPresent) presentCount = parseInt(shortPresent[1], 10)
      }
      if (absentCount === 0) {
        const shortAbsent = clean.match(/\b(\d+)\s*a\b/i)
        if (shortAbsent && (!section || `${shortAbsent[1]}A`.toUpperCase() !== section)) {
          absentCount = parseInt(shortAbsent[1], 10)
        }
      }
    }

    if (presentCount === 0 && absentCount === 0) {
      // Fallback: look for two numbers
      const numbers = clean.match(/\b\d+\b/g)
      if (numbers && numbers.length >= 2) {
        presentCount = parseInt(numbers[0], 10)
        absentCount = parseInt(numbers[1], 10)
      }
    }

    const parsed = {
      courseCode,
      section,
      presentCount,
      absentCount,
      totalCount: presentCount + absentCount,
      date: today,
      facultyId,
      facultyPhone,
      rawMessage: message
    }

    const confirmationReply = `Attendance recorded for ${courseCode} ${section}: ${presentCount} present, ${absentCount} absent on ${today}. Reply YES to confirm or NO to cancel.`
    parsed.confirmationReply = confirmationReply

    return parsed
  }

  /**
   * Stage parsed attendance into database or memory store
   */
  static async stageAttendance(parsedData, institutionId = 1) {
    const stagedRecord = {
      id: stagedAttendanceStore.length + 1,
      institution_id: institutionId,
      faculty_id: parsedData.facultyId || 1,
      faculty_phone: parsedData.facultyPhone,
      course_code: parsedData.courseCode,
      section: parsedData.section,
      present_count: parsedData.presentCount,
      absent_count: parsedData.absentCount,
      date: parsedData.date,
      status: 'PENDING',
      raw_message: parsedData.rawMessage,
      created_at: new Date().toISOString()
    }

    stagedAttendanceStore.push(stagedRecord)

    try {
      const res = await pool.query(
        `INSERT INTO whatsapp_staged_attendance 
         (institution_id, faculty_id, faculty_phone, course_code, section, present_count, absent_count, date, status, raw_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)
         RETURNING *`,
        [
          institutionId,
          parsedData.facultyId || 1,
          parsedData.facultyPhone,
          parsedData.courseCode,
          parsedData.section,
          parsedData.presentCount,
          parsedData.absentCount,
          parsedData.date,
          parsedData.rawMessage
        ]
      )
      if (res.rows?.[0]) {
        return res.rows[0]
      }
    } catch {
      // Memory store fallback
    }

    return stagedRecord
  }

  /**
   * Confirm or reject the latest pending staged attendance for a phone number
   */
  static async updateStagedStatusByPhone(facultyPhone, action, institutionId = 1) {
    const targetStatus = action.toUpperCase() === 'YES' ? 'CONFIRMED' : 'REJECTED'

    // Update memory store
    const pendingMem = [...stagedAttendanceStore]
      .reverse()
      .find(r => r.faculty_phone === facultyPhone && r.status === 'PENDING')

    if (pendingMem) {
      pendingMem.status = targetStatus
    }

    let updated = pendingMem

    try {
      const res = await pool.query(
        `UPDATE whatsapp_staged_attendance
         SET status = $1
         WHERE id = (
           SELECT id FROM whatsapp_staged_attendance
           WHERE faculty_phone = $2 AND status = 'PENDING'
           ORDER BY created_at DESC
           LIMIT 1
         )
         RETURNING *`,
        [targetStatus, facultyPhone]
      )
      if (res.rows?.[0]) {
        updated = res.rows[0]
      }
    } catch {
      // In-memory fallback
    }

    return {
      status: targetStatus,
      record: updated,
      replyText: targetStatus === 'CONFIRMED'
        ? '✅ Attendance successfully confirmed and staged for sync into official institutional records.'
        : '❌ Attendance entry cancelled. Please re-send the correct attendance count.'
    }
  }

  /**
   * Log an inbound or outbound WhatsApp message
   */
  static async logMessage(direction, from, to, body, status = 'DELIVERED', institutionId = 1) {
    const logItem = {
      id: messageLogStore.length + 1,
      institution_id: institutionId,
      direction,
      from_number: from,
      to_number: to,
      body,
      status,
      created_at: new Date().toISOString()
    }
    messageLogStore.push(logItem)

    try {
      await pool.query(
        `INSERT INTO whatsapp_message_log (institution_id, direction, from_number, to_number, body, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [institutionId, direction, from, to, body, status]
      )
    } catch {
      // Fallback
    }

    return logItem
  }

  /**
   * Send WhatsApp message via Twilio/Meta or log to console
   */
  static async sendMessage(toNumber, bodyText) {
    const fromNumber = process.env.WHATSAPP_SENDER_NUMBER || '+919900011222'

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Twilio WhatsApp API
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
        const bodyParams = new URLSearchParams()
        bodyParams.append('From', `whatsapp:${fromNumber}`)
        bodyParams.append('To', `whatsapp:${toNumber}`)
        bodyParams.append('Body', bodyText)

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams.toString()
          }
        )
        const json = await res.json()
        await this.logMessage('OUTBOUND', fromNumber, toNumber, bodyText, json.status || 'SENT')
        return { success: true, sid: json.sid }
      } catch (err) {
        console.warn('Twilio WhatsApp send failed, falling back to log:', err.message)
      }
    }

    // Fallback: log to console & memory log
    console.log(`[WHATSAPP DISPATCH] To: ${toNumber} | Text: "${bodyText}"`)
    await this.logMessage('OUTBOUND', fromNumber, toNumber, bodyText, 'DELIVERED')
    return { success: true, simulated: true }
  }
}
