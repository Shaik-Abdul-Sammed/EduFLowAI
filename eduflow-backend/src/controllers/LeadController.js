import { z } from 'zod'
import { LeadRepository } from '../models/LeadRepository.js'
import { logger } from '../utils/logger.js'
import { sendEmail } from '../services/email/emailService.js'
import { getPilotOfferEmailHtml } from '../services/email/templates/pilotOffer.js'
import { VALID_AUTOMATION_TYPES } from '../config/servicePricing.js'

export const createLeadSchema = z.object({
  collegeName: z.string().min(1, 'College name is required'),
  contactName: z.string().min(1, 'Contact person name is required'),
  designation: z.string().optional(),
  email: z.string().email('Valid institutional email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  cityState: z.string().min(1, 'City & State is required'),
  studentCount: z.number().positive().optional().or(z.string().transform(v => parseInt(v, 10) || null)),
  naacCycle: z.string().optional(),
  message: z.string().optional(),
  website: z.string().optional(), // Honeypot
  automationType: z.enum(VALID_AUTOMATION_TYPES).optional().default('accreditation'),
})

export class LeadController {
  static async submitPublicLead(req, res) {
    try {
      const parsed = createLeadSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        })
      }

      const data = parsed.data

      // Anti-spam honeypot check: reject bots
      if (data.website && data.website.trim() !== '') {
        logger.warn({ ip: req.ip, honeypotValue: data.website }, 'Spam lead submission rejected by honeypot')
        return res.status(400).json({
          error: 'Spam submission detected by honeypot',
        })
      }

      // Create lead in repository
      const lead = await LeadRepository.create(data)

      logger.info({ leadId: lead.id, college: data.collegeName, email: data.email }, 'New institutional lead received')

      // Notify internal team
      const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'admin@eduflow.app'
      await sendEmail({
        to: notificationEmail,
        subject: `[New NAAC Pilot Request] ${data.collegeName} (${data.contactName})`,
        html: `
          <h2>New College Lead Received</h2>
          <p><strong>College:</strong> ${data.collegeName}</p>
          <p><strong>Contact:</strong> ${data.contactName} (${data.designation || 'Principal'})</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Location:</strong> ${data.cityState}</p>
          <p><strong>Students:</strong> ${data.studentCount || 'N/A'}</p>
          <p><strong>NAAC Cycle:</strong> ${data.naacCycle || 'N/A'}</p>
          <p><strong>Message:</strong> ${data.message || 'None'}</p>
        `,
      }).catch((err) => {
        logger.error('Failed to dispatch internal notification email for lead:', err)
      })

      return res.status(201).json({
        success: true,
        message: 'Thank you. We will contact you within 24 hours.',
        leadId: lead.id,
      })
    } catch (err) {
      logger.error('Error submitting lead:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getLeads(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 50
      const status = req.query.status || 'ALL'
      const automationType = req.query.automationType || 'ALL'

      const result = await LeadRepository.findAll({ page, limit, status, automationType })
      return res.json(result)
    } catch (err) {
      logger.error('Error fetching leads:', err)
      return res.status(500).json({ error: 'Failed to retrieve leads' })
    }
  }

  static async getLeadById(req, res) {
    try {
      const { id } = req.params
      const lead = await LeadRepository.findById(id)
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' })
      }
      return res.json(lead)
    } catch (err) {
      logger.error(`Error fetching lead ${req.params.id}:`, err)
      return res.status(500).json({ error: 'Failed to retrieve lead' })
    }
  }

  static async updateLead(req, res) {
    try {
      const { id } = req.params
      const { status, notes } = req.body

      const validStatuses = ['NEW', 'CONTACTED', 'PILOT_OFFERED', 'PILOT_DELIVERED', 'WON', 'LOST']
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid lead status', validStatuses })
      }

      const updated = await LeadRepository.update(id, { status, notes })
      if (!updated) {
        return res.status(404).json({ error: 'Lead not found' })
      }

      logger.info({ leadId: id, status, hasNotes: Boolean(notes) }, 'Lead updated')
      return res.json({ success: true, lead: updated })
    } catch (err) {
      logger.error(`Error updating lead ${req.params.id}:`, err)
      return res.status(500).json({ error: 'Failed to update lead' })
    }
  }

  static async deleteLead(req, res) {
    try {
      const { id } = req.params
      const deleted = await LeadRepository.softDelete(id)
      if (!deleted) {
        return res.status(404).json({ error: 'Lead not found' })
      }

      logger.info({ leadId: id }, 'Lead soft deleted')
      return res.json({ success: true, message: 'Lead deleted successfully' })
    } catch (err) {
      logger.error(`Error deleting lead ${req.params.id}:`, err)
      return res.status(500).json({ error: 'Failed to delete lead' })
    }
  }

  static async sendPilotOffer(req, res) {
    try {
      const { id } = req.params
      const lead = await LeadRepository.findById(id)
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' })
      }

      const { subject, html } = getPilotOfferEmailHtml({
        contactName: lead.contact_name,
        collegeName: lead.college_name,
        senderName: req.user?.username || 'EduFlow Accreditation Team',
      })

      await sendEmail({
        to: lead.email,
        subject,
        html,
      })

      // Update lead status to PILOT_OFFERED
      const updated = await LeadRepository.update(id, {
        status: 'PILOT_OFFERED',
        notes: lead.notes
          ? `${lead.notes}\n[${new Date().toISOString()}] Pilot offer email sent.`
          : `[${new Date().toISOString()}] Pilot offer email sent.`,
      })

      logger.info({ leadId: id, email: lead.email }, 'Pilot offer email dispatched to lead')
      return res.json({ success: true, message: 'Pilot offer email sent successfully', lead: updated })
    } catch (err) {
      logger.error(`Error sending pilot offer for lead ${req.params.id}:`, err)
      return res.status(500).json({ error: 'Failed to send pilot offer email' })
    }
  }
}

export default LeadController
