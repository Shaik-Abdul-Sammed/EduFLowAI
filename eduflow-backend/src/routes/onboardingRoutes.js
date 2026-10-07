import express from 'express'
import { OnboardingController } from '../controllers/OnboardingController.js'
import { authMiddleware } from '../middleware/auth.js'

export function createOnboardingRouter() {
  const router = express.Router()

  // Templates & status (can be fetched during onboarding flow)
  router.get('/templates/faculty.csv', OnboardingController.getFacultyTemplate)
  router.get('/templates/students.csv', OnboardingController.getStudentTemplate)
  router.get('/status', OnboardingController.getStatus)

  // Wizard steps
  router.post('/step1-profile', OnboardingController.step1Profile)
  router.post('/step2-departments', OnboardingController.step2Departments)
  router.post('/step3-faculty', OnboardingController.step3Faculty)
  router.post('/step4-students', OnboardingController.step4Students)
  router.post('/step5-academic', OnboardingController.step5Academic)
  router.post('/finish', OnboardingController.finish)

  return router
}
