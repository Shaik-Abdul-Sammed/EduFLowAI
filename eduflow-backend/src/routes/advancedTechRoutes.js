import express from 'express'
import { LearningPathController } from '../controllers/LearningPathController.js'
import { CredentialController } from '../controllers/CredentialController.js'
import { AITutorController } from '../controllers/AITutorController.js'
import { PlagiarismController } from '../controllers/PlagiarismController.js'
import { GamificationController } from '../controllers/GamificationController.js'
import { AdvancedTechController } from '../controllers/AdvancedTechController.js'

export function createAdvancedTechRouter() {
  const router = express.Router()

  // 1. Adaptive Learning Paths
  router.post('/learning/generate-path', LearningPathController.generatePath)
  router.get('/learning/path/:studentId?', LearningPathController.getPath)

  // 2. Micro-Credentials & Blockchain Wallet
  router.post('/credentials/issue', CredentialController.issueCredential)
  router.get('/credentials/wallet/:studentId?', CredentialController.getWallet)
  router.get('/credentials/verify/:hash', CredentialController.verifyCredential)

  // 3. AI Teaching Assistant
  router.post('/ai-tutor/ask', AITutorController.ask)

  // 4. Plagiarism Detection & AI Attribution
  router.post('/plagiarism/check', PlagiarismController.checkPlagiarism)
  router.get('/plagiarism/reports', PlagiarismController.getReports)

  // 5. Gamification & Leaderboard
  router.post('/gamification/award-xp', GamificationController.awardXp)
  router.get('/gamification/leaderboard', GamificationController.getLeaderboard)
  router.get('/gamification/profile/:studentId?', GamificationController.getProfile)

  // 6. Digital Whiteboard
  router.post('/whiteboard/save', AdvancedTechController.saveWhiteboard)
  router.get('/whiteboard/:roomId', AdvancedTechController.getWhiteboard)

  // 7. Virtual Labs & Simulation Sandbox
  router.post('/simulations/submit', AdvancedTechController.submitSimulation)
  router.get('/simulations/:studentId?', AdvancedTechController.getSimulations)

  // 8. Instant Translation
  router.post('/translate/instant', AdvancedTechController.instantTranslate)

  return router
}

export default createAdvancedTechRouter
