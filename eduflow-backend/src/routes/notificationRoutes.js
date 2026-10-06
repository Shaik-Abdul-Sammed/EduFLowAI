import { Router } from 'express'
import { pool } from '../db/pool.js'

const readByUser = new Map()

export function createNotificationRouter(db = pool) {
  const router = Router()

  const BASE_NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Pending Timetable Approval',
      message: 'Priya Sharma submitted draft schedule for CSE Dept (requires HOD sign-off)',
      type: 'approval',
      link: '/hod-dashboard',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'notif-2',
      title: 'New Institutional Lead',
      message: 'Principal from MVJ College of Engineering requested NAAC Criterion 3 Pilot Assessment',
      type: 'lead',
      link: '/admin-dashboard/leads',
      created_at: new Date(Date.now() - 65 * 60000).toISOString(),
    },
    {
      id: 'notif-3',
      title: 'Invoice Payment Received',
      message: 'Invoice EDU-2026-0001 (₹49,000) marked as PAID via NEFT',
      type: 'invoice',
      link: '/admin-dashboard/invoices',
      created_at: new Date(Date.now() - 180 * 60000).toISOString(),
    },
    {
      id: 'notif-4',
      title: 'Academic Calendar Published',
      message: '2026-2027 Odd Semester calendar generated with state festival holidays',
      type: 'calendar',
      link: '/admin-dashboard/calendar',
      created_at: new Date(Date.now() - 360 * 60000).toISOString(),
    },
    {
      id: 'notif-5',
      title: 'Staff Permission Requested',
      message: 'Priya Sharma requested access to AI Accreditation Officer',
      type: 'permission',
      link: '/admin-dashboard/staff',
      created_at: new Date(Date.now() - 480 * 60000).toISOString(),
    },
    {
      id: 'notif-6',
      title: 'Statutory Attendance Warning',
      message: '7 students identified below statutory 75% attendance threshold in CSE Dept',
      type: 'attendance',
      link: '/admin-dashboard/attendance',
      created_at: new Date(Date.now() - 720 * 60000).toISOString(),
    },
    {
      id: 'notif-7',
      title: 'Fedena ERP Connector Synced',
      message: 'Biometric records imported successfully (441 student logs analyzed)',
      type: 'portal',
      link: '/admin-dashboard/portal',
      created_at: new Date(Date.now() - 1440 * 60000).toISOString(),
    },
  ]

  router.get('/', async (req, res) => {
    const userId = String(req.user?.id || req.query.userId || 'demo')
    const userReads = readByUser.get(userId) || new Set()

    const notifications = BASE_NOTIFICATIONS.map((n) => ({
      ...n,
      read: userReads.has(n.id),
    }))

    const unreadCount = notifications.filter((n) => !n.read).length

    res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    })
  })

  router.post('/read-all', async (req, res) => {
    const userId = String(req.user?.id || req.body?.userId || 'demo')
    if (!readByUser.has(userId)) {
      readByUser.set(userId, new Set())
    }
    const userReads = readByUser.get(userId)
    BASE_NOTIFICATIONS.forEach((n) => userReads.add(n.id))
    res.json({ success: true, message: 'All notifications marked as read' })
  })

  router.post('/:id/read', async (req, res) => {
    const { id } = req.params
    const userId = String(req.user?.id || req.body?.userId || 'demo')
    if (!readByUser.has(userId)) {
      readByUser.set(userId, new Set())
    }
    readByUser.get(userId).add(id)
    res.json({ success: true, id, read: true })
  })

  return router
}

export default createNotificationRouter(pool)
