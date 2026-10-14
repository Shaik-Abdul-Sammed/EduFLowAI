import { test } from 'node:test'
import assert from 'node:assert'
import http from 'http'
import { SocketService } from '../../src/services/realtime/SocketService.js'

test('SocketService - attachSocketIO initializes Server and registers rooms', async () => {
  const server = http.createServer()
  const io = SocketService.attachSocketIO(server)

  assert.ok(io)
  assert.strictEqual(SocketService.getIO(), io)

  // Verify room broadcast handlers return true when initialized
  const attendanceRes = SocketService.broadcastAttendanceUpdate(1, { classId: 'CS401', count: 45 })
  assert.strictEqual(attendanceRes, true)

  const paymentRes = SocketService.broadcastFeePaymentReceived(1, { invoiceId: 'INV-101', amount: 50000 })
  assert.strictEqual(paymentRes, true)

  const escalationRes = SocketService.broadcastEscalation(1, { studentId: 'S102', reason: 'Attendance critical' })
  assert.strictEqual(escalationRes, true)

  const roleRes = SocketService.emitToRole(1, 'hod', 'custom:event', { ok: true })
  assert.strictEqual(roleRes, true)

  const userRes = SocketService.emitToUser(42, 'notification:new', { message: 'Approved' })
  assert.strictEqual(userRes, true)
})
