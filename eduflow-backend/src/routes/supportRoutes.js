import express from 'express'
import { SupportController } from '../controllers/SupportController.js'

export function createSupportRouter() {
  const router = express.Router()

  router.post('/ticket', SupportController.createTicket)
  router.get('/tickets', SupportController.getTickets)
  router.patch('/tickets/:id', SupportController.updateTicket)

  return router
}
