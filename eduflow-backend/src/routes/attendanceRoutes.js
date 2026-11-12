import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { AttendanceController } from '../controllers/AttendanceController.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/stats', AttendanceController.getStats)
router.get('/at-risk', AttendanceController.getAtRisk)
router.get('/student/:studentId', AttendanceController.getStudentAttendance)
router.post('/upload-csv', requireRole('admin', 'hod', 'staff'), AttendanceController.uploadCsv)
router.post('/ingest/sample', requireRole('admin', 'hod', 'staff'), AttendanceController.ingestSample)
router.post('/sync-now', requireRole('admin', 'hod'), AttendanceController.syncNow)
router.post('/notify-parents', requireRole('admin', 'hod'), AttendanceController.notifyParents)
router.post('/counseling-note', AttendanceController.logCounselingNote)
router.get('/counseling-notes', AttendanceController.getCounselingNotes)

export default router
