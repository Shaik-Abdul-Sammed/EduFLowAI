import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app.js'

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address()
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` })
    })
  })
}

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123'
const adminToken = jwt.sign(
  { id: 1, email: 'admin@eduflow.edu', role: 'admin', institutionId: 'inst_test_101' },
  JWT_SECRET,
  { expiresIn: '1h' }
)

test('Production Ready Operations: Payment & Admin Endpoints Suite', async (t) => {
  const { server, baseUrl } = await startServer(createApp())

  try {
    await t.test('POST /api/v1/payments/order creates valid payment intent', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 25000,
          currency: 'INR',
          studentRoll: '1ST21CS001',
          studentName: 'Aarav Sharma',
          term: 'Term 1 Tuition Fee'
        })
      })

      const body = await res.json()
      assert.equal(res.status, 201)
      assert.equal(body.success, true)
      assert.ok(body.order.id.startsWith('order_'))
      assert.equal(body.order.amount, 2500000) // in paise
    })

    await t.test('POST /api/v1/payments/verify validates genuine HMAC SHA256 signature', async () => {
      const orderId = 'order_test_888'
      const paymentId = 'pay_test_999'
      const secret = process.env.RAZORPAY_KEY_SECRET || 'eduflow_secret_2026'
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

      const res = await fetch(`${baseUrl}/api/v1/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
      })

      const body = await res.json()
      assert.equal(res.status, 200)
      assert.equal(body.success, true)
      assert.equal(body.transaction.status, 'CAPTURED')
    })

    await t.test('POST /api/v1/payments/verify rejects forged signature', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: 'order_fake',
          razorpay_payment_id: 'pay_fake',
          razorpay_signature: 'fake_tampered_signature_hex'
        })
      })

      const body = await res.json()
      assert.equal(res.status, 400)
      assert.equal(body.success, false)
    })

    await t.test('GET /api/v1/payments/transactions lists settled transactions', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payments/transactions`)
      const body = await res.json()
      assert.equal(res.status, 200)
      assert.equal(body.success, true)
      assert.ok(Array.isArray(body.transactions))
      assert.ok(body.transactions.length >= 2)
    })

    await t.test('Admin Students CRUD: query, create, and delete', async () => {
      // 1. GET students
      const getRes = await fetch(`${baseUrl}/api/v1/admin/students`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const getBody = await getRes.json()
      assert.equal(getRes.status, 200)
      assert.ok(getBody.count >= 4)

      // 2. POST create student
      const createRes = await fetch(`${baseUrl}/api/v1/admin/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Kabir Mehta',
          roll: '1ST22CS099',
          stream: 'CSE',
          year: 2,
          phone: '9876543299',
          email: 'kabir.m@eduflow.edu'
        })
      })
      const createBody = await createRes.json()
      assert.equal(createRes.status, 201)
      assert.equal(createBody.student.roll, '1ST22CS099')

      // 3. DELETE student
      const delRes = await fetch(`${baseUrl}/api/v1/admin/students/1ST22CS099`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const delBody = await delRes.json()
      assert.equal(delRes.status, 200)
      assert.equal(delBody.success, true)
    })

    await t.test('Admin Hostel: enforces max capacity <= 4', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/hostel`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const body = await res.json()
      assert.equal(res.status, 200)
      assert.ok(body.data.every(r => r.capacity <= 4))
    })

    await t.test('Admin Timetable: detects double-booking room/faculty clash', async () => {
      // Attempt to book existing slot room LH-101 on Monday 09:00 - 10:00 AM
      const res = await fetch(`${baseUrl}/api/v1/admin/timetable/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          day: 'Monday',
          time: '09:00 - 10:00 AM',
          room: 'LH-101',
          course: 'ME301',
          faculty: 'Dr. Vikramaditya M',
          section: 'MECH 3A'
        })
      })

      const body = await res.json()
      assert.equal(res.status, 409)
      assert.match(body.error, /Schedule Conflict/i)
    })

    await t.test('Admin Results: simulates borderline grace moderation (+2.5%)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/admin/results/moderate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gracePercentage: 2.5 })
      })

      const body = await res.json()
      assert.equal(res.status, 200)
      assert.equal(body.success, true)
      assert.ok(body.data.every(r => r.isModerated === true))
    })
  } finally {
    server.close()
  }
})
