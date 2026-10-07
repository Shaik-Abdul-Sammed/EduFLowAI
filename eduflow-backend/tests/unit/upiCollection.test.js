import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { InvoiceController } from '../../src/controllers/InvoiceController.js'
import { InvoiceRepository } from '../../src/models/InvoiceRepository.js'

describe('UPI Payment Collection Unit Tests', () => {
  let testInvoice = null

  test('generates valid UPI intent link with payee VPA and encoded parameters', async () => {
    testInvoice = await InvoiceRepository.create({
      institutionName: 'Sri Siddhartha Institute of Technology',
      contactEmail: 'accounts@ssit.edu.in',
      amount: 59000,
      totalAmount: 59000,
      description: 'Annual EduFlow Platform Subscription'
    })

    let resJson = null
    const req = {
      params: { id: testInvoice.id },
      body: { upiId: 'ssit@icici' }
    }
    const res = {
      status: (c) => ({
        json: (d) => { resJson = d }
      })
    }

    await InvoiceController.generateUpiLink(req, res)
    assert.equal(resJson.success, true)
    assert.ok(resJson.upiUri.startsWith('upi://pay?'))
    assert.ok(resJson.upiUri.includes('pa=ssit%40icici'))
    assert.ok(resJson.upiUri.includes('am=59000.00'))
    assert.ok(resJson.upiUri.includes('cu=INR'))
  })

  test('records manual payment with transaction UTR reference and marks PAID', async () => {
    let resJson = null
    const req = {
      params: { id: testInvoice.id },
      body: {
        referenceNumber: 'UPI/329012398401/SUCCESS',
        paymentMode: 'UPI_DIRECT'
      }
    }
    const res = {
      json: (d) => { resJson = d }
    }

    await InvoiceController.markPaidManual(req, res)
    assert.equal(resJson.success, true)
    assert.equal(resJson.invoice.status, 'PAID')
    assert.equal(resJson.invoice.payment_reference, 'UPI/329012398401/SUCCESS')
  })
})
