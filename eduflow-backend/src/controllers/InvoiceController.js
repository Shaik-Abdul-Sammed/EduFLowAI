import { z } from 'zod'
import { InvoiceRepository } from '../models/InvoiceRepository.js'
import { LeadRepository } from '../models/LeadRepository.js'
import { logger } from '../utils/logger.js'
import { getServiceDescription, getServicePrice } from '../config/servicePricing.js'

function escapePdfText(str) {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

export function generateInvoicePdfBuffer(invoice) {
  const {
    invoice_number,
    institution_name,
    contact_person,
    contact_email,
    address,
    gst_number,
    items = [],
    subtotal,
    tax_percent,
    tax_amount,
    total_amount,
    currency = 'INR',
    bank_details,
    company_gst,
    status,
    created_at,
  } = invoice

  let streamContent = 'BT\n'

  // Header Banner
  streamContent += `/F1 20 Tf\n50 740 Td\n(EduFlow Technologies Private Limited) Tj\n`
  streamContent += `/F2 9 Tf\n0 -16 Td\n(Hyderabad, Telangana, India | GSTIN: ${escapePdfText(company_gst || '36AAACE1234F1Z5')}) Tj\n`
  streamContent += `/F1 14 Tf\n0 -28 Td\n(TAX INVOICE: ${escapePdfText(invoice_number)}) Tj\n`
  streamContent += `/F2 10 Tf\n0 -16 Td\n(Date: ${escapePdfText(new Date(created_at).toLocaleDateString('en-IN'))} | Status: ${escapePdfText(status)}) Tj\n`
  streamContent += 'ET\n'

  // Divider Line
  streamContent += 'q 0.1 0.3 0.7 rg 50 660 512 2 re f Q\n'

  // Bill To Section
  streamContent += 'BT\n/F1 11 Tf\n50 640 Td\n(BILLED TO:) Tj\n'
  streamContent += `/F1 10 Tf\n0 -16 Td\n(${escapePdfText(institution_name)}) Tj\n`
  streamContent += `/F2 9 Tf\n0 -14 Td\n(Attn: ${escapePdfText(contact_person || 'Principal')} | Email: ${escapePdfText(contact_email)}) Tj\n`
  if (address) {
    streamContent += `0 -14 Td\n(Address: ${escapePdfText(address)}) Tj\n`
  }
  if (gst_number) {
    streamContent += `0 -14 Td\n(GSTIN: ${escapePdfText(gst_number)}) Tj\n`
  }
  streamContent += 'ET\n'

  // Table Header
  streamContent += 'q 0.95 0.95 0.98 rg 50 535 512 22 re f Q\n'
  streamContent += 'BT\n/F1 9 Tf\n55 542 Td\n(Item Description) Tj\n'
  streamContent += '260 0 Td\n(Qty) Tj\n'
  streamContent += '60 0 Td\n(Rate) Tj\n'
  streamContent += '80 0 Td\n(Amount (INR)) Tj\n'
  streamContent += 'ET\n'

  // Table Rows
  let y = 515
  streamContent += `BT\n/F2 9 Tf\n55 ${y} Td\n18 TL\n`

  const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
  for (const item of parsedItems) {
    const desc = escapePdfText(item.description || 'Service')
    const qty = String(item.quantity || 1)
    const rate = Number(item.rate || 0).toLocaleString('en-IN')
    const amt = Number(item.amount || 0).toLocaleString('en-IN')

    streamContent += `(${desc}) Tj 260 0 Td (${qty}) Tj 60 0 Td (${rate}) Tj 80 0 Td (${amt}) Tj -400 -18 Td\n`
    y -= 18
  }
  streamContent += 'ET\n'

  // Totals Section
  const totalsY = Math.max(y - 20, 260)
  streamContent += `q 0.85 0.85 0.85 rg 320 ${totalsY + 45} 242 1 re f Q\n`
  streamContent += `BT\n/F2 10 Tf\n340 ${totalsY + 30} Td\n(Subtotal:) Tj 120 0 Td (${currency} ${Number(subtotal).toLocaleString('en-IN')}) Tj\n`
  streamContent += `-120 -16 Td (GST @ ${tax_percent}%:) Tj 120 0 Td (${currency} ${Number(tax_amount).toLocaleString('en-IN')}) Tj\n`
  streamContent += `/F1 11 Tf\n-120 -20 Td (TOTAL PAYABLE:) Tj 120 0 Td (${currency} ${Number(total_amount).toLocaleString('en-IN')}) Tj\n`
  streamContent += 'ET\n'

  // Bank & Payment Details
  streamContent += `q 0.95 0.97 1.0 rg 50 100 512 80 re f Q\n`
  streamContent += `q 0.2 0.4 0.8 rg 50 100 512 1 re S Q\n`
  streamContent += 'BT\n/F1 9 Tf\n60 162 Td\n(BANK REMITTANCE DETAILS:) Tj\n'
  streamContent += `/F2 8 Tf\n0 -14 Td\n(${escapePdfText(bank_details || 'Bank: State Bank of India | IFSC: SBIN0001234 | A/C: 9876543210')}) Tj\n`
  streamContent += '0 -14 Td\n(Payment terms: Immediate upon receipt. Please reference the invoice number in the transfer description.) Tj\n'
  streamContent += `/F1 8 Tf\n0 -14 Td\n(Thank you for partnering with EduFlow AI OS!) Tj\n`
  streamContent += 'ET\n'

  // Footer
  streamContent += `BT\n/F2 8 Tf\n50 40 Td\n(EduFlow Technologies Pvt Ltd &bull; Authorized Electronic Invoice &bull; Confidential) Tj\nET\n`

  const streamLen = Buffer.byteLength(streamContent, 'utf-8')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj',
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}endstream\nendobj`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = []
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'))
    pdf += obj + '\n'
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, 'utf-8')
}

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive().default(1),
  rate: z.number().nonnegative(),
  amount: z.number().nonnegative(),
})

const createInvoiceSchema = z.object({
  leadId: z.union([z.string(), z.number()]).optional(),
  automationType: z.string().optional(),
  amount: z.number().nonnegative('Amount cannot be negative').optional(),
  description: z.string().optional(),
  institutionName: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  items: z.array(invoiceItemSchema).optional(),
  subtotal: z.number().optional(),
  taxPercent: z.number().optional().default(18.0),
  taxAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.leadId !== undefined && data.leadId !== null && data.leadId !== '') {
      return true
    }
    if (data.automationType) {
      return true
    }
    return Boolean(data.institutionName || data.contactEmail || (data.items && data.items.length > 0))
  },
  {
    message: 'Either leadId, automationType, or institution details are required',
  }
)

export class InvoiceController {
  static async createInvoice(req, res) {
    try {
      const parsed = createInvoiceSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors })
      }

      let {
        leadId,
        automationType,
        amount,
        description,
        institutionName,
        contactPerson = '',
        contactEmail,
        address = '',
        gstNumber = '',
        items,
        subtotal,
        taxPercent = 18.0,
        taxAmount,
        totalAmount,
        notes = '',
      } = parsed.data

      // If automationType is provided directly, derive description and price
      if (automationType) {
        if (!description) {
          description = getServiceDescription(automationType, institutionName || 'Demo Institution')
        }
        if (amount === undefined || amount === null) {
          amount = getServicePrice(automationType)
        }
      }

      // If leadId is provided, pull missing fields and default description/amount from referenced lead
      if (leadId && (!institutionName || !contactEmail || !description || amount === undefined || amount === null)) {
        const lead = await LeadRepository.findById(leadId)
        if (lead) {
          if (!institutionName) institutionName = lead.college_name
          if (!contactEmail) contactEmail = lead.email
          if (!contactPerson) contactPerson = lead.contact_name
          if (!address && lead.city_state) address = lead.city_state
          const leadAutomation = lead.automation_type || 'accreditation'
          if (!description) {
            description = getServiceDescription(leadAutomation, lead.college_name)
          }
          if (amount === undefined || amount === null) {
            amount = getServicePrice(leadAutomation)
          }
        }
      }

      institutionName = institutionName || 'Demo Institution'
      contactEmail = contactEmail || 'billing@demo.edu'

      // If items is missing, auto-generate a single line item from description and amount
      if (!items || items.length === 0) {
        const itemAmount = amount || 0
        items = [{
          description: description || 'Educational Consultancy Service',
          quantity: 1,
          rate: itemAmount,
          amount: itemAmount,
        }]
      }
      contactEmail = contactEmail || 'billing@demo.edu'

      const computedSubtotal = items.reduce((sum, item) => sum + (item.amount || item.rate * item.quantity), 0)
      subtotal = subtotal !== undefined ? subtotal : computedSubtotal
      taxAmount = taxAmount !== undefined ? taxAmount : (subtotal * taxPercent) / 100
      totalAmount = totalAmount !== undefined ? totalAmount : subtotal + taxAmount

      const invoice = await InvoiceRepository.create({
        leadId: leadId ? Number(leadId) : null,
        institutionName,
        contactPerson,
        contactEmail,
        address,
        gstNumber,
        items,
        amount: amount !== undefined ? amount : subtotal,
        subtotal,
        taxPercent,
        taxAmount,
        totalAmount,
        description: description || (items[0] && items[0].description) || '',
        notes,
      })

      logger.info({ invoiceId: invoice.id, invoiceNumber: invoice.invoice_number }, 'New invoice generated')
      return res.status(201).json({ success: true, invoice })
    } catch (err) {
      logger.error('Error creating invoice:', err)
      return res.status(500).json({ error: 'Failed to create invoice' })
    }
  }

  static async getInvoices(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 50
      const status = req.query.status || 'ALL'
      const result = await InvoiceRepository.findAll({ page, limit, status })
      return res.json(result)
    } catch (err) {
      logger.error('Error fetching invoices:', err)
      return res.status(500).json({ error: 'Failed to fetch invoices' })
    }
  }

  static async getInvoiceById(req, res) {
    try {
      const { id } = req.params
      const invoice = await InvoiceRepository.findById(id)
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' })
      }
      return res.json(invoice)
    } catch (err) {
      logger.error(`Error retrieving invoice ${req.params.id}:`, err)
      return res.status(500).json({ error: 'Failed to retrieve invoice' })
    }
  }

  static async markPaid(req, res) {
    try {
      const { id } = req.params
      const invoice = await InvoiceRepository.markPaid(id)
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' })
      }
      logger.info({ invoiceId: id, status: 'PAID' }, 'Invoice marked as paid')
      return res.json({ success: true, invoice })
    } catch (err) {
      logger.error(`Error marking invoice ${req.params.id} as paid:`, err)
      return res.status(500).json({ error: 'Failed to update invoice' })
    }
  }

  static async downloadInvoicePdf(req, res) {
    try {
      const { id } = req.params
      const invoice = await InvoiceRepository.findById(id)
      if (!invoice) {
        return res.status(404).send('Invoice not found')
      }

      const pdfBuffer = generateInvoicePdfBuffer(invoice)
      const filename = `Invoice_${invoice.invoice_number}.pdf`
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.send(pdfBuffer)
    } catch (err) {
      logger.error(`Error generating PDF for invoice ${req.params.id}:`, err)
      return res.status(500).send('Failed to generate invoice PDF')
    }
  }
}

export default InvoiceController
