import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { ApprovalController } from '../controllers/ApprovalController.js'

const router = express.Router()

router.use(authMiddleware)
router.use(requireRole('admin', 'hod'))

router.get('/pending', ApprovalController.getPending)
router.get('/history', ApprovalController.getHistory)
router.post('/bulk-approve', ApprovalController.bulkApprove)
router.post('/:logId/approve', ApprovalController.approve)
router.post('/:logId/reject', ApprovalController.reject)

export default router
