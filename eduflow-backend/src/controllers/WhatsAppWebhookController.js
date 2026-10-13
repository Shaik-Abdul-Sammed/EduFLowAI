import { WhatsAppAttendance } from '../services/attendance/WhatsAppAttendance.js'
import { processConfirmedStagedAttendance } from '../workers/whatsappAttendanceProcessor.js'
import { pool } from '../db/pool.js'

// Demo faculty phone registry
const facultyRegistry = [
  { id: 1, name: 'Dr. Ramesh Kumar', department: 'CSE', designation: 'Professor & HOD', phone: '+919876543210' },
  { id: 2, name: 'Dr. Sunita Rao', department: 'ECE', designation: 'Associate Professor', phone: '+919876543211' },
  { id: 3, name: 'Prof. Ananya Sen', department: 'CSE', designation: 'Assistant Professor', phone: '+919876543212' },
  { id: 4, name: 'Dr. Vikramaditya M', department: 'MECH', designation: 'Professor', phone: '+919876543213' },
  { id: 5, name: 'Prof. Deepa Nair', department: 'AI-DS', designation: 'Assistant Professor', phone: '+919876543214' }
]

export class WhatsAppWebhookController {
  /**
   * GET /api/v1/whatsapp/webhook
   * Verification challenge for Meta WhatsApp Cloud API
   */
  static verifyWebhook(req, res) {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'eduflow_verify_token'

    if (mode === 'subscribe' && token === expectedToken) {
      return res.status(200).send(challenge)
    }

    // Also support simple ping verification
    if (req.query.ping) {
      return res.status(200).json({ ok: true, message: 'WhatsApp webhook active' })
    }

    return res.status(403).json({ error: 'Webhook verification token mismatch' })
  }

  /**
   * POST /api/v1/whatsapp/webhook
   * Inbound message handler for Twilio or Meta WhatsApp Business API
   */
  static async handleInboundMessage(req, res) {
    try {
      let from = ''
      let to = ''
      let body = ''

      // Parse Twilio payload (application/x-www-form-urlencoded or JSON)
      if (req.body?.From) {
        from = req.body.From.replace('whatsapp:', '').trim()
        to = (req.body.To || '').replace('whatsapp:', '').trim()
        body = req.body.Body ? req.body.Body.trim() : ''
      }
      // Parse Meta Cloud API payload
      else if (req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const msg = req.body.entry[0].changes[0].value.messages[0]
        from = msg.from
        to = req.body.entry[0].changes[0].value.metadata?.display_phone_number || ''
        body = msg.text?.body ? msg.text.body.trim() : ''
      }
      // Direct simulator / JSON payload
      else {
        from = req.body?.from || req.body?.facultyPhone || '+919876543210'
        to = req.body?.to || '+919900011222'
        body = req.body?.body || req.body?.message || ''
      }

      if (!body) {
        return res.status(400).json({ error: 'Message body cannot be empty' })
      }

      // Log inbound message
      await WhatsAppAttendance.logMessage('INBOUND', from, to, body)

      const upperBody = body.toUpperCase()

      // Handle YES / NO confirmation
      if (upperBody === 'YES' || upperBody === 'NO') {
        const updateResult = await WhatsAppAttendance.updateStagedStatusByPhone(from, upperBody)
        await WhatsAppAttendance.sendMessage(from, updateResult.replyText)

        // If confirmed, trigger sync immediately for responsiveness
        if (upperBody === 'YES') {
          await processConfirmedStagedAttendance().catch(() => {})
        }

        return res.status(200).json({
          success: true,
          action: updateResult.status,
          reply: updateResult.replyText,
          record: updateResult.record
        })
      }

      // Check if message is an attendance submission
      const isAttendance = /attendance|\bpresent\b|\babsent\b|\d+\s*\/\s*\d+/i.test(body)

      if (isAttendance) {
        // Find matching faculty by phone
        const faculty = facultyRegistry.find(f => f.phone.replace(/\D/g, '') === from.replace(/\D/g, ''))
        const facultyId = faculty ? faculty.id : 1

        const parsed = WhatsAppAttendance.parseAttendanceMessage(body, from, facultyId)
        const staged = await WhatsAppAttendance.stageAttendance(parsed)
        await WhatsAppAttendance.sendMessage(from, parsed.confirmationReply)

        return res.status(200).json({
          success: true,
          staged: true,
          data: staged,
          reply: parsed.confirmationReply
        })
      }

      // General fallback / Help message
      const helpText = "🤖 EduFlow AI Faculty Attendance:\nTo mark attendance, send message like:\n• 'CSE 3A present 45 absent 5'\n• 'CS301 23/30'\n• 'attendance CSE-3A today 48 present'\nReply YES to confirm or NO to cancel."
      await WhatsAppAttendance.sendMessage(from, helpText)

      return res.status(200).json({
        success: true,
        action: 'HELP_SENT',
        reply: helpText
      })
    } catch (err) {
      console.error('WhatsApp webhook error:', err)
      return res.status(500).json({ error: 'Internal WhatsApp processing error', details: err.message })
    }
  }

  /**
   * GET /api/v1/whatsapp/status
   */
  static getStatus(req, res) {
    const isConfigured = Boolean(
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ||
      process.env.WHATSAPP_API_KEY
    )

    return res.status(200).json({
      configured: isConfigured,
      service: isConfigured ? 'Live WhatsApp Business Gateway' : 'Console Simulator Mode',
      senderNumber: process.env.WHATSAPP_SENDER_NUMBER || '+91 99000 11222',
      webhookUrl: 'https://eduflow-backend-jvn8.onrender.com/api/v1/whatsapp/webhook',
      activeFacultyCount: facultyRegistry.length,
      stagedPendingCount: WhatsAppAttendance.getStagedStore().filter(r => r.status === 'PENDING').length
    })
  }

  /**
   * GET /api/v1/whatsapp/staged
   */
  static async getStaged(req, res) {
    try {
      let stagedRows = []
      try {
        const dbRes = await pool.query(
          `SELECT * FROM whatsapp_staged_attendance ORDER BY created_at DESC LIMIT 50`
        )
        if (dbRes.rows && dbRes.rows.length > 0) {
          stagedRows = dbRes.rows
        }
      } catch {
        // fallback
      }

      if (stagedRows.length === 0) {
        stagedRows = [...WhatsAppAttendance.getStagedStore()].reverse()
      }

      return res.status(200).json({
        staged: stagedRows,
        total: stagedRows.length
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * GET /api/v1/whatsapp/logs
   */
  static async getLogs(req, res) {
    try {
      let logRows = []
      try {
        const dbRes = await pool.query(
          `SELECT * FROM whatsapp_message_log ORDER BY created_at DESC LIMIT 100`
        )
        if (dbRes.rows && dbRes.rows.length > 0) {
          logRows = dbRes.rows
        }
      } catch {
        // fallback
      }

      if (logRows.length === 0) {
        logRows = [...WhatsAppAttendance.getMessageLogStore()].reverse()
      }

      return res.status(200).json({
        logs: logRows,
        total: logRows.length
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * GET /api/v1/whatsapp/faculty
   */
  static getFaculty(req, res) {
    return res.status(200).json({ faculty: facultyRegistry })
  }

  /**
   * POST /api/v1/whatsapp/staged/:id/confirm
   */
  static async confirmStaged(req, res) {
    const id = parseInt(req.params.id, 10)
    const inMem = WhatsAppAttendance.getStagedStore().find(r => r.id === id)
    if (inMem) inMem.status = 'CONFIRMED'

    try {
      await pool.query(
        `UPDATE whatsapp_staged_attendance SET status = 'CONFIRMED' WHERE id = $1`,
        [id]
      )
    } catch {}

    await processConfirmedStagedAttendance().catch(() => {})

    return res.status(200).json({ success: true, message: 'Staged attendance confirmed and synced' })
  }

  /**
   * POST /api/v1/whatsapp/staged/:id/reject
   */
  static async rejectStaged(req, res) {
    const id = parseInt(req.params.id, 10)
    const inMem = WhatsAppAttendance.getStagedStore().find(r => r.id === id)
    if (inMem) inMem.status = 'REJECTED'

    try {
      await pool.query(
        `UPDATE whatsapp_staged_attendance SET status = 'REJECTED' WHERE id = $1`,
        [id]
      )
    } catch {}

    return res.status(200).json({ success: true, message: 'Staged attendance rejected' })
  }
}
