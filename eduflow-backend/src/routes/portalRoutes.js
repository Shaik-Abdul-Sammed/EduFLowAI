import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { PortalController } from '../controllers/PortalController.js'

const router = express.Router()

router.use(authMiddleware)
router.use(requireRole('admin'))

router.post('/test-connection', PortalController.testConnection)
router.post('/connect', PortalController.connect)
router.post('/connect-demo', PortalController.connectDemo)
router.get('/sources', PortalController.getSources)
router.get('/sources/:id/preview', PortalController.getPreview)
router.patch('/sources/:id', PortalController.updateSource)
router.delete('/sources/:id', PortalController.deleteSource)
router.post('/sources/:id/sync-now', PortalController.syncNow)
router.get('/sync-logs', PortalController.getSyncLogs)

export default router
