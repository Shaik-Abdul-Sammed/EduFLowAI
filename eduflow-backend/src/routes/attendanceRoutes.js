import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { AttendanceController } from '../controllers/AttendanceController.js'

const router = express.Router()

// Presence Pulse Report (Callable by student app / background beacon pulse with session code)
router.post('/presence/report', AttendanceController.reportPresence)

router.use(authMiddleware)

// Session-bound rotating code to prevent proxy attendance (Faculty-only)
router.post('/session/:sessionId/code', requireRole('faculty', 'admin', 'hod', 'teacher'), AttendanceController.generateSessionCode)
router.get('/session/:sessionId/review-roster', AttendanceController.getSessionReviewRoster)
router.post('/session/:sessionId/finalize', AttendanceController.finalizeAttendanceSession)

// Per-room RSSI calibration
router.post('/rooms/:roomId/calibrate', requireRole('admin', 'hod', 'staff'), AttendanceController.calibrateRoom)
router.get('/rooms/:roomId/calibration', AttendanceController.getRoomCalibration)

router.get('/stats', AttendanceController.getStats)
router.get('/at-risk', AttendanceController.getAtRisk)
router.get('/student/:studentId', AttendanceController.getStudentAttendance)
router.post('/upload-csv', requireRole('admin', 'hod', 'staff'), AttendanceController.uploadCsv)
router.post('/ingest/sample', requireRole('admin', 'hod', 'staff'), AttendanceController.ingestSample)
router.post('/sync-now', requireRole('admin', 'hod'), AttendanceController.syncNow)
router.post('/notify-parents', requireRole('admin', 'hod'), AttendanceController.notifyParents)
router.post('/counseling-note', AttendanceController.logCounselingNote)
router.get('/counseling-notes', AttendanceController.getCounselingNotes)
router.post('/ble-sync', AttendanceController.bleSync)
router.get('/ble-roster/:courseId', AttendanceController.getBleRoster)

export default router
