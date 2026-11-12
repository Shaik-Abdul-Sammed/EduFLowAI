import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { SmartCampusController } from '../controllers/SmartCampusController.js'
import { HostelController } from '../controllers/HostelController.js'
import { TransportController } from '../controllers/TransportController.js'

export function createCampusRouter() {
  const router = Router()

  // Campus assets & energy occupancy
  router.get('/assets', SmartCampusController.getCampusAssets)
  router.get('/assets/:institutionId', SmartCampusController.getCampusAssets)
  router.post('/occupancy/predict', SmartCampusController.predictOccupancy)

  // Hostels & Room Allocation
  router.get('/hostels', HostelController.getHostels)
  router.get('/hostels/:institutionId', HostelController.getHostels)
  router.post('/hostels/allocate', authMiddleware, HostelController.allocateRoom)

  // Transport routes & Live GPS Telemetry
  router.get('/transport/routes', TransportController.getRoutes)
  router.get('/transport/routes/:institutionId', TransportController.getRoutes)
  router.get('/transport/live/:routeId', TransportController.getGPSLiveLocation)

  return router
}
