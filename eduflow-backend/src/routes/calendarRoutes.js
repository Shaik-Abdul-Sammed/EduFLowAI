import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { CalendarController } from '../controllers/CalendarController.js'

const router = express.Router()

// Public or authenticated calendar lookups
router.get('/holidays/:year', CalendarController.getHolidays)
router.get('/:institutionId/:academicYear', CalendarController.getCalendar)
router.get('/:institutionId/:academicYear/events', CalendarController.getEvents)

// Admin/HOD operations
router.use(authMiddleware)
router.post('/generate', requireRole('admin', 'hod'), CalendarController.generate)
router.post('/holidays/refresh', requireRole('admin'), CalendarController.refreshHolidays)
router.post('/export-pdf', CalendarController.exportPdf)
router.post('/:calendarId/approve', requireRole('admin'), CalendarController.approve)
router.post('/:calendarId/publish', requireRole('admin'), CalendarController.publish)
router.post('/:calendarId/adjust', requireRole('admin', 'hod'), CalendarController.adjust)

export default router
