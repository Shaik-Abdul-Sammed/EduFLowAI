import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { StaffPermissionController } from '../controllers/StaffPermissionController.js'

const router = express.Router()

router.use(authMiddleware)

// Staff member self routes
router.get('/my-permissions', StaffPermissionController.getMyPermissions)
router.post('/request-access', StaffPermissionController.requestAccess)
router.get('/activity', StaffPermissionController.getActivity)

// HOD & Dean management routes
router.post('/permissions', requireRole('admin', 'hod'), StaffPermissionController.grantPermission)
router.get('/permissions/:staffUserId', requireRole('admin', 'hod'), StaffPermissionController.getStaffPermissions)
router.patch('/permissions/:id', requireRole('admin', 'hod'), StaffPermissionController.updatePermission)
router.delete('/permissions/:id', requireRole('admin', 'hod'), StaffPermissionController.revokePermission)

export default router
