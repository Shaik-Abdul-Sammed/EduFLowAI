import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

const memoryInvoices = []
let memoryIdCounter = 1

export class InvoiceRepository {
  static async getNextInvoiceNumber() {
    const year = new Date().getFullYear()
    try {
      const res = await pool.query("SELECT count(*) FROM invoices")
      const count = parseInt(res.rows[0]?.count || '0', 10) + 1
      return `EDU-${year}-${String(count).padStart(4, '0')}`
    } catch {
      const count = memoryInvoices.length + 1
      return `EDU-${year}-${String(count).padStart(4, '0')}`
    }
  }

  static async create(data) {
    const {
      leadId = null,
      institutionName,
      contactPerson = '',
      contactEmail,
      address = '',
      gstNumber = '',
      items = [],
      amount = 0,
      subtotal = 0,
      taxPercent = 18.0,
      taxAmount = 0,
      totalAmount = 0,
      currency = 'INR',
      description = '',
      bankDetails = process.env.BANK_DETAILS || 'Bank: State Bank of India | IFSC: SBIN0001234 | A/C: 9876543210',
      companyGst = process.env.COMPANY_GST || '36AAACE1234F1Z5',
      notes = '',
    } = data

    const invoiceNumber = data.invoiceNumber || (await this.getNextInvoiceNumber())

    try {
      const query = `
        INSERT INTO invoices (
          invoice_number, lead_id, institution_name, contact_person, contact_email,
          address, gst_number, items, amount, subtotal, tax_percent, tax_amount,
          total_amount, currency, description, status, bank_details, company_gst, notes,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'UNPAID', $16, $17, $18, NOW(), NOW())
        RETURNING *
      `
      const params = [
        invoiceNumber,
        leadId,
        institutionName,
        contactPerson,
        contactEmail,
        address,
        gstNumber,
        JSON.stringify(items),
        amount,
        subtotal,
        taxPercent,
        taxAmount,
        totalAmount,
        currency,
        description,
        bankDetails,
        companyGst,
        notes,
      ]

      const result = await pool.query(query, params)
      return result.rows[0]
    } catch (err) {
      logger.warn(`InvoiceRepository.create using memory store: ${err.message}`)
      const newInvoice = {
        id: memoryIdCounter++,
        invoice_number: invoiceNumber,
        institution_name: institutionName,
        contact_person: contactPerson,
        contact_email: contactEmail,
        address,
        gst_number: gstNumber,
        items,
        amount,
        subtotal,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency,
        description,
        status: 'UNPAID',
        bank_details: bankDetails,
        company_gst: companyGst,
        notes,
        paid_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      memoryInvoices.unshift(newInvoice)
      return newInvoice
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id])
      return result.rows[0] || null
    } catch (err) {
      logger.warn(`InvoiceRepository.findById using memory store: ${err.message}`)
      return memoryInvoices.find((i) => String(i.id) === String(id)) || null
    }
  }

  static async findByNumber(invoiceNumber) {
    try {
      const result = await pool.query(
        'SELECT * FROM invoices WHERE invoice_number = $1',
        [invoiceNumber]
      )
      return result.rows[0] || null
    } catch (err) {
      logger.warn(`InvoiceRepository.findByNumber using memory store: ${err.message}`)
      return memoryInvoices.find((i) => i.invoice_number === invoiceNumber) || null
    }
  }

  static async findAll({ page = 1, limit = 50, status } = {}) {
    const offset = (Math.max(1, page) - 1) * limit
    try {
      let query = 'SELECT * FROM invoices'
      const params = []
      if (status && status !== 'ALL') {
        params.push(status)
        query += ` WHERE status = $1`
      }
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(limit, offset)

      const result = await pool.query(query, params)
      const countRes = await pool.query(
        status && status !== 'ALL'
          ? 'SELECT count(*) FROM invoices WHERE status = $1'
          : 'SELECT count(*) FROM invoices',
        status && status !== 'ALL' ? [status] : []
      )
      const total = parseInt(countRes.rows[0]?.count || '0', 10)
      return { invoices: result.rows, total, page, limit }
    } catch (err) {
      logger.warn(`InvoiceRepository.findAll using memory store: ${err.message}`)
      let filtered = memoryInvoices
      if (status && status !== 'ALL') {
        filtered = filtered.filter((i) => i.status === status)
      }
      const total = filtered.length
      const invoices = filtered.slice(offset, offset + limit)
      return { invoices, total, page, limit }
    }
  }

  static async markPaid(id) {
    try {
      const result = await pool.query(
        `UPDATE invoices 
         SET status = 'PAID', paid_at = NOW(), updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [id]
      )
      return result.rows[0] || null
    } catch (err) {
      logger.warn(`InvoiceRepository.markPaid using memory store: ${err.message}`)
      const inv = memoryInvoices.find((i) => String(i.id) === String(id))
      if (!inv) return null
      inv.status = 'PAID'
      inv.paid_at = new Date().toISOString()
      inv.updated_at = new Date().toISOString()
      return inv
    }
  }
}

export default InvoiceRepository
