import { pool } from '../../db/pool.js'
import { WhatsAppAttendance } from '../attendance/WhatsAppAttendance.js'

// In-memory stores for testing and fallback
const reminderLogStore = []
let reminderSettingsStore = {
  institution_id: 1,
  cadence_days: [1, 7, 15, 30, 45, 60],
  channels: { email: true, whatsapp: true, sms: false },
  custom_templates: null,
  enabled: true
}

export class FeeReminderService {
  static getReminderLogStore() {
    return reminderLogStore
  }

  static clearReminderLogStore() {
    reminderLogStore.length = 0
  }

  /**
   * Find all overdue unpaid invoices for an institution
   */
  static async findOverdueInvoices(institutionId = 1) {
    const today = new Date()

    let rows = []
    try {
      const res = await pool.query(
        `SELECT id, invoice_number, institution_name, contact_person, contact_email, 
                total_amount, currency, status, created_at,
                COALESCE(due_date, created_at + INTERVAL '30 days') as due_date
         FROM invoices
         WHERE institution_id = $1 AND status = 'UNPAID'
         ORDER BY due_date ASC`,
        [institutionId]
      )
      if (res.rows && res.rows.length > 0) {
        rows = res.rows
      }
    } catch {
      // In-memory fallback
    }

    if (rows.length === 0) {
      // Realistic seeded overdue demo invoices
      const mockTodayMs = today.getTime()
      rows = [
        {
          id: 101,
          invoice_number: 'EDU-2026-0041',
          institution_name: 'Sri Siddhartha Institute of Technology',
          contact_person: 'Rahul Sharma (Roll: 1ST22CS089)',
          contact_email: 'rahul.s@ssit.edu.in',
          contact_phone: '+919876543201',
          total_amount: 59000,
          currency: 'INR',
          status: 'UNPAID',
          due_date: new Date(mockTodayMs - 4 * 86400000).toISOString().split('T')[0]
        },
        {
          id: 102,
          invoice_number: 'EDU-2026-0042',
          institution_name: 'Sri Siddhartha Institute of Technology',
          contact_person: 'Pooja Hegde (Roll: 1ST22EC045)',
          contact_email: 'pooja.h@ssit.edu.in',
          contact_phone: '+919876543202',
          total_amount: 54000,
          currency: 'INR',
          status: 'UNPAID',
          due_date: new Date(mockTodayMs - 16 * 86400000).toISOString().split('T')[0]
        },
        {
          id: 103,
          invoice_number: 'EDU-2026-0043',
          institution_name: 'Sri Siddhartha Institute of Technology',
          contact_person: 'Karthik V (Roll: 1ST22ME022)',
          contact_email: 'karthik.v@ssit.edu.in',
          contact_phone: '+919876543203',
          total_amount: 48000,
          currency: 'INR',
          status: 'UNPAID',
          due_date: new Date(mockTodayMs - 38 * 86400000).toISOString().split('T')[0]
        },
        {
          id: 104,
          invoice_number: 'EDU-2026-0044',
          institution_name: 'Sri Siddhartha Institute of Technology',
          contact_person: 'Ananya Deshmukh (Roll: 1ST21CS014)',
          contact_email: 'ananya.d@ssit.edu.in',
          contact_phone: '+919876543204',
          total_amount: 62000,
          currency: 'INR',
          status: 'UNPAID',
          due_date: new Date(mockTodayMs - 72 * 86400000).toISOString().split('T')[0]
        }
      ]
    }

    return rows.map(inv => {
      const dueDate = new Date(inv.due_date || inv.created_at)
      const diffMs = today.getTime() - dueDate.getTime()
      const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
      return {
        ...inv,
        daysOverdue
      }
    })
  }

  /**
   * Categorize overdue invoices into 4 progressive urgency tiers
   */
  static categorizeByOverdueDays(invoices) {
    const tiers = {
      tier1: [], // 1-7 days: polite
      tier2: [], // 8-30 days: firm + late fee warning
      tier3: [], // 31-60 days: urgent + portal hold warning
      tier4: []  // 60+ days: final notice + escalation
    }

    for (const inv of invoices) {
      const days = inv.daysOverdue || 1
      if (days <= 7) {
        tiers.tier1.push(inv)
      } else if (days <= 30) {
        tiers.tier2.push(inv)
      } else if (days <= 60) {
        tiers.tier3.push(inv)
      } else {
        tiers.tier4.push(inv)
      }
    }

    return tiers
  }

  /**
   * Generate personalized multi-tier reminder notification text
   */
  static generateReminderMessage(invoice, daysOverdue = 5) {
    const student = invoice.contact_person || 'Student'
    const invNo = invoice.invoice_number || 'EDU-INV'
    const amount = Number(invoice.total_amount || 0).toLocaleString('en-IN')

    let tier = 'tier1'
    let subject = ''
    let emailBody = ''
    let whatsappBody = ''

    if (daysOverdue <= 7) {
      tier = 'tier1'
      subject = `Gentle Reminder: Semester Fee Payment Due for ${invNo}`
      emailBody = `Dear ${student},\n\nThis is a gentle reminder that your institutional semester fee of ₹${amount} for invoice ${invNo} was due on ${invoice.due_date}.\n\nPlease arrange for payment via the student portal or direct UPI. If you have already completed the transaction, please ignore this notice.\n\nWarm regards,\nAccounts Office\nEduFlow Institution Management`
      whatsappBody = `🔔 *EduFlow Fee Reminder*\nDear ${student}, your semester fee of *₹${amount}* (${invNo}) was due ${daysOverdue} days ago. Pay easily via UPI: ssit@icici. Reply HELP for assistance.`
    } else if (daysOverdue <= 30) {
      tier = 'tier2'
      subject = `Important Notice: Overdue Fee Payment (${daysOverdue} Days) - ${invNo}`
      emailBody = `Dear ${student},\n\nYour institutional fee invoice ${invNo} of ₹${amount} is currently overdue by ${daysOverdue} days.\n\nPlease note that a statutory late surcharge of 2% may be levied on unpaid balances past the 30-day grace window. Kindly clear the outstanding amount immediately.\n\nAccounts Office\nEduFlow Institution Management`
      whatsappBody = `⚠️ *Fee Overdue Notice (${daysOverdue} Days)*\nDear ${student}, invoice *${invNo}* of *₹${amount}* is pending. Clear dues immediately to avoid late fees. UPI ID: ssit@icici.`
    } else if (daysOverdue <= 60) {
      tier = 'tier3'
      subject = `URGENT: Fee Clearance Required - Academic Portal Hold Warning (${invNo})`
      emailBody = `Dear ${student} & Parent,\n\nURGENT: Your fee payment of ₹${amount} (${invNo}) is overdue by ${daysOverdue} days.\n\nUnder university regulations, accounts unpaid for over 30 days are scheduled for temporary academic portal suspension and exam hall ticket hold. Please settle the pending dues within 48 hours.\n\nOffice of Finance & Admissions\nEduFlow Institution Management`
      whatsappBody = `🚨 *URGENT ACTION REQUIRED*\nDear ${student}, your fee of *₹${amount}* is ${daysOverdue} days overdue. Academic portal & hall-ticket holds will take effect unless cleared within 48 hrs. Contact Accounts immediately.`
    } else {
      tier = 'tier4'
      subject = `FINAL STATUTORY NOTICE: Serious Overdue Balance - Escalated to HOD & Dean (${invNo})`
      emailBody = `Dear ${student} and Respected Parents,\n\nFINAL NOTICE: Your outstanding balance of ₹${amount} (${invNo}) has now exceeded ${daysOverdue} days past the scheduled due date.\n\nThis case has been formally escalated to the Dean of Academic Affairs and Head of Department for administrative hearing. Continued non-payment may result in deregistration.\n\nDean of Academic Affairs\nOffice of Institutional Governance`
      whatsappBody = `⛔ *FINAL STATUTORY NOTICE*\nDear ${student}, outstanding fee *₹${amount}* is ${daysOverdue} days overdue. This file has been escalated to the Dean & HOD. Immediate settlement required.`
    }

    return {
      tier,
      daysOverdue,
      subject,
      emailBody,
      whatsappBody
    }
  }

  /**
   * Dispatch a fee reminder via specified channel
   */
  static async sendReminder(invoice, channel = 'EMAIL', institutionId = 1) {
    const daysOverdue = invoice.daysOverdue || 5
    const msg = this.generateReminderMessage(invoice, daysOverdue)
    const student = invoice.contact_person || 'Student'
    const email = invoice.contact_email || 'student@demo.edu'
    const phone = invoice.contact_phone || '+919876543201'

    let status = 'SENT'
    let errorMessage = null

    if (channel === 'WHATSAPP') {
      try {
        await WhatsAppAttendance.sendMessage(phone, msg.whatsappBody)
      } catch (err) {
        status = 'FAILED'
        errorMessage = err.message
      }
    } else {
      // Email simulation / transport
      console.log(`[EMAIL DISPATCH] To: ${email} | Subject: "${msg.subject}"`)
    }

    const logEntry = {
      id: reminderLogStore.length + 1,
      institution_id: institutionId,
      invoice_id: invoice.id,
      student_name: student,
      student_email: email,
      student_phone: phone,
      channel,
      template_used: msg.tier.toUpperCase(),
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      status,
      error_message: errorMessage
    }

    reminderLogStore.push(logEntry)

    try {
      await pool.query(
        `INSERT INTO fee_reminder_log 
         (institution_id, invoice_id, student_name, student_email, student_phone, channel, template_used, status, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          institutionId,
          invoice.id,
          student,
          email,
          phone,
          channel,
          msg.tier.toUpperCase(),
          status,
          errorMessage
        ]
      )
    } catch {
      // Memory store fallback
    }

    return {
      success: status === 'SENT',
      log: logEntry,
      message: msg
    }
  }

  /**
   * Automated scheduled batch run
   */
  static async scheduleReminders(institutionId = 1) {
    const overdueInvoices = await this.findOverdueInvoices(institutionId)
    const categorized = this.categorizeByOverdueDays(overdueInvoices)
    const settings = await this.getSettings(institutionId)

    if (!settings.enabled) {
      return { skipped: true, reason: 'Fee reminders disabled in settings' }
    }

    let sentCount = 0
    const channels = []
    if (settings.channels?.email) channels.push('EMAIL')
    if (settings.channels?.whatsapp) channels.push('WHATSAPP')

    for (const inv of overdueInvoices) {
      for (const ch of channels) {
        await this.sendReminder(inv, ch, institutionId)
        sentCount++
      }
    }

    return {
      success: true,
      sentCount,
      overdueTotal: overdueInvoices.length,
      tiers: {
        tier1: categorized.tier1.length,
        tier2: categorized.tier2.length,
        tier3: categorized.tier3.length,
        tier4: categorized.tier4.length
      }
    }
  }

  static async getSettings(institutionId = 1) {
    try {
      const res = await pool.query(
        `SELECT * FROM fee_reminder_settings WHERE institution_id = $1`,
        [institutionId]
      )
      if (res.rows?.[0]) {
        return res.rows[0]
      }
    } catch {}
    return reminderSettingsStore
  }

  static async updateSettings(institutionId = 1, newSettings = {}) {
    reminderSettingsStore = {
      ...reminderSettingsStore,
      ...newSettings,
      updated_at: new Date().toISOString()
    }

    try {
      await pool.query(
        `INSERT INTO fee_reminder_settings (institution_id, cadence_days, channels, custom_templates, enabled)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (institution_id) DO UPDATE
         SET cadence_days = EXCLUDED.cadence_days,
             channels = EXCLUDED.channels,
             custom_templates = EXCLUDED.custom_templates,
             enabled = EXCLUDED.enabled,
             updated_at = NOW()`,
        [
          institutionId,
          JSON.stringify(reminderSettingsStore.cadence_days),
          JSON.stringify(reminderSettingsStore.channels),
          reminderSettingsStore.custom_templates ? JSON.stringify(reminderSettingsStore.custom_templates) : null,
          reminderSettingsStore.enabled
        ]
      )
    } catch {}

    return reminderSettingsStore
  }

  static async getHistory(institutionId = 1, limit = 100) {
    try {
      const res = await pool.query(
        `SELECT * FROM fee_reminder_log WHERE institution_id = $1 ORDER BY sent_at DESC LIMIT $2`,
        [institutionId, limit]
      )
      if (res.rows && res.rows.length > 0) {
        return res.rows
      }
    } catch {}

    return [...reminderLogStore].reverse().slice(0, limit)
  }
}
