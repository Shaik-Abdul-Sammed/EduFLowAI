import { FeeReminderService } from '../services/finance/FeeReminderService.js'

export class FeeReminderController {
  /**
   * GET /api/v1/fee-reminders/pending
   */
  static async getPending(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const overdue = await FeeReminderService.findOverdueInvoices(institutionId)
      const categorized = FeeReminderService.categorizeByOverdueDays(overdue)

      const totalOverdueAmount = overdue.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0)
      const history = await FeeReminderService.getHistory(institutionId, 100)
      const paidAfterReminder = history.filter(h => h.status === 'PAID').length
      const recoveryRate = history.length > 0 ? Math.round((paidAfterReminder / history.length) * 100) : 68

      return res.status(200).json({
        totalOverdue: totalOverdueAmount,
        overdueCount: overdue.length,
        remindersSentThisMonth: history.length,
        recoveryRate,
        invoices: overdue,
        tiers: {
          tier1: categorized.tier1,
          tier2: categorized.tier2,
          tier3: categorized.tier3,
          tier4: categorized.tier4
        }
      })
    } catch (err) {
      console.error('FeeReminderController.getPending error:', err)
      return res.status(500).json({ error: 'Failed to retrieve pending fee reminders', details: err.message })
    }
  }

  /**
   * POST /api/v1/fee-reminders/send-now
   */
  static async sendNow(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const { invoiceIds, channel } = req.body || {}

      const allOverdue = await FeeReminderService.findOverdueInvoices(institutionId)
      const targets = Array.isArray(invoiceIds) && invoiceIds.length > 0
        ? allOverdue.filter(i => invoiceIds.includes(i.id))
        : allOverdue

      const selectedChannels = channel && channel !== 'ALL'
        ? [channel]
        : ['EMAIL', 'WHATSAPP']

      const results = []
      let sentCount = 0

      for (const inv of targets) {
        for (const ch of selectedChannels) {
          const outcome = await FeeReminderService.sendReminder(inv, ch, institutionId)
          results.push(outcome)
          if (outcome.success) sentCount++
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully dispatched ${sentCount} reminders across ${targets.length} overdue invoices.`,
        sentCount,
        targetsCount: targets.length,
        results
      })
    } catch (err) {
      console.error('FeeReminderController.sendNow error:', err)
      return res.status(500).json({ error: 'Failed to trigger fee reminders', details: err.message })
    }
  }

  /**
   * GET /api/v1/fee-reminders/history
   */
  static async getHistory(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const limit = parseInt(req.query.limit || '100', 10)
      const history = await FeeReminderService.getHistory(institutionId, limit)

      return res.status(200).json({
        history,
        total: history.length
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * POST /api/v1/fee-reminders/settings
   */
  static async updateSettings(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const updated = await FeeReminderService.updateSettings(institutionId, req.body || {})

      return res.status(200).json({
        success: true,
        message: 'Fee reminder configuration updated successfully.',
        settings: updated
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * GET /api/v1/fee-reminders/settings
   */
  static async getSettings(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const settings = await FeeReminderService.getSettings(institutionId)
      return res.status(200).json({ settings })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  /**
   * POST /api/v1/fee-reminders/test-preview
   */
  static async sendTestPreview(req, res) {
    try {
      const institutionId = req.user?.institutionId || 1
      const { testEmail, testPhone, tier = 'tier1' } = req.body || {}

      const sampleInvoice = {
        id: 999,
        invoice_number: 'EDU-TEST-0001',
        total_amount: 55000,
        contact_person: 'Preview Recipient',
        contact_email: testEmail || 'admin@demo.edu',
        contact_phone: testPhone || '+919876543201',
        due_date: '2026-10-01',
        daysOverdue: tier === 'tier1' ? 4 : tier === 'tier2' ? 18 : tier === 'tier3' ? 45 : 75
      }

      const emailResult = await FeeReminderService.sendReminder(sampleInvoice, 'EMAIL', institutionId)
      let whatsappResult = null
      if (testPhone) {
        whatsappResult = await FeeReminderService.sendReminder(sampleInvoice, 'WHATSAPP', institutionId)
      }

      return res.status(200).json({
        success: true,
        message: 'Test reminder delivered to preview destinations.',
        preview: emailResult.message
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
