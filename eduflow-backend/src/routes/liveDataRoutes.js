import express from 'express'
import { LiveDataController } from '../controllers/LiveDataController.js'

export function createLiveDataRouter() {
  const router = express.Router()

  router.get('/status', LiveDataController.getStatus)
  router.get('/nirf', LiveDataController.getNIRF)
  router.get('/naac', LiveDataController.getNAAC)
  router.get('/aicte', LiveDataController.getAICTE)
  router.get('/ugc', LiveDataController.getUGC)
  router.get('/holidays', LiveDataController.getHolidays)
  router.get('/news', LiveDataController.getNews)
  router.post('/search', LiveDataController.search)
  router.post('/refresh', LiveDataController.refreshAll)

  return router
}
