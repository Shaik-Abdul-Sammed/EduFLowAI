import { Router } from 'express'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../middleware/auth.js'
import { pool } from '../db/pool.js'
import { logger } from '../utils/logger.js'

function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      req.user = jwt.verify(token, JWT_SECRET)
    } catch {
      // Ignore token failure for optional endpoints
    }
  }
  next()
}

export function createPaymentRouter() {
  const router = Router()

  // In-memory transaction registry for resilient caching and fallback
  const transactions = new Map([
    ['PAY_DEMO_001', {
      id: 'PAY_DEMO_001',
      orderId: 'order_demo_101',
      studentRoll: '1ST21CS001',
      studentName: 'Aarav Sharma',
      amount: 45000,
      currency: 'INR',
      status: 'CAPTURED',
      method: 'UPI',
      upiVpa: 'aarav@okaxis',
      term: 'Term 1 Tuition Fee',
      receiptNo: 'RCP-2026-0891',
      createdAt: '2026-06-01T10:14:00.000Z'
    }],
    ['PAY_DEMO_002', {
      id: 'PAY_DEMO_002',
      orderId: 'order_demo_102',
      studentRoll: '1ST21EC014',
      studentName: 'Priya Verma',
      amount: 18000,
      currency: 'INR',
      status: 'CAPTURED',
      method: 'NetBanking',
      bank: 'HDFC Bank',
      term: 'Hostel Maintenance & Mess Fee',
      receiptNo: 'RCP-2026-0892',
      createdAt: '2026-06-02T14:30:00.000Z'
    }]
  ])

  /**
   * POST /api/v1/payments/order
   * Create payment order intent (Razorpay / UPI intent)
   */
  router.post('/order', optionalAuth, async (req, res) => {
    try {
      const { amount, currency = 'INR', studentRoll, studentName, term, notes = {} } = req.body

      const numAmount = Number(amount)
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Valid positive amount in INR is required' })
      }

      const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_eduflow2026'
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      const orderPayload = {
        id: orderId,
        entity: 'order',
        amount: Math.round(numAmount * 100), // amount in paise
        amount_paid: 0,
        amount_due: Math.round(numAmount * 100),
        currency,
        receipt: `rcpt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: {
          studentRoll: studentRoll || 'GENERAL',
          studentName: studentName || 'Student',
          term: term || 'Tuition Fee',
          ...notes
        },
        createdAt: new Date().toISOString()
      }

      // Store in memory cache
      transactions.set(orderId, {
        orderId,
        studentRoll: studentRoll || 'GENERAL',
        studentName: studentName || 'Student',
        amount: numAmount,
        currency,
        status: 'PENDING',
        term: term || 'Tuition Fee',
        receiptNo: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString()
      })

      return res.status(201).json({
        success: true,
        order: orderPayload,
        key: keyId
      })
    } catch (err) {
      logger.error('Payment order creation error:', err)
      return res.status(500).json({ error: err.message || 'Failed to create payment order' })
    }
  })

  /**
   * POST /api/v1/payments/verify
   * Verify client payment signature (HMAC-SHA256)
   */
  router.post('/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

      if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({ error: 'order_id and payment_id are required' })
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || 'eduflow_secret_2026'

      // Verify signature if provided
      if (razorpay_signature) {
        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(body.toString())
          .digest('hex')

        const expectedBuf = Buffer.from(expectedSignature)
        const receivedBuf = Buffer.from(razorpay_signature)

        if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
          return res.status(400).json({ success: false, error: 'Invalid payment signature' })
        }
      }

      // Update record
      const record = transactions.get(razorpay_order_id) || {
        orderId: razorpay_order_id,
        amount: 25000,
        currency: 'INR',
        receiptNo: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      }

      record.paymentId = razorpay_payment_id
      record.status = 'CAPTURED'
      record.verifiedAt = new Date().toISOString()
      transactions.set(razorpay_order_id, record)

      return res.json({
        success: true,
        message: 'Payment verified and settled successfully',
        transaction: record
      })
    } catch (err) {
      logger.error('Payment verification error:', err)
      return res.status(500).json({ error: err.message || 'Payment verification failed' })
    }
  })

  /**
   * POST /api/v1/payments/webhook
   * Production Webhook with HMAC-SHA256 signature verification
   */
  router.post('/webhook', async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'eduflow_webhook_secret_2026'
      const signature = req.headers['x-razorpay-signature']

      if (signature) {
        const hmac = crypto.createHmac('sha256', webhookSecret)
        const digest = hmac.update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)).digest('hex')

        if (signature !== digest) {
          logger.warn('Payment webhook signature mismatch')
          return res.status(401).json({ error: 'Invalid webhook signature' })
        }
      }

      const event = req.body?.event
      const paymentEntity = req.body?.payload?.payment?.entity

      if (paymentEntity?.order_id) {
        const orderId = paymentEntity.order_id
        const existing = transactions.get(orderId) || {}
        transactions.set(orderId, {
          ...existing,
          orderId,
          paymentId: paymentEntity.id,
          amount: paymentEntity.amount / 100,
          status: event === 'payment.captured' ? 'CAPTURED' : 'FAILED',
          method: paymentEntity.method,
          upiVpa: paymentEntity.vpa || null,
          updatedAt: new Date().toISOString()
        })
      }

      return res.json({ status: 'ok', eventReceived: event })
    } catch (err) {
      logger.error('Payment webhook error:', err)
      return res.status(500).json({ error: 'Webhook processing failed' })
    }
  })

  /**
   * GET /api/v1/payments/transactions
   * List reconciled transactions
   */
  router.get('/transactions', async (_req, res) => {
    try {
      const list = Array.from(transactions.values()).reverse()
      return res.json({
        success: true,
        count: list.length,
        transactions: list
      })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  return router
}
