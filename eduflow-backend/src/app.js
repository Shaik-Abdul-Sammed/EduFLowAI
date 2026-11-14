import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import { createSearchRouter } from './routes/searchRoutes.js'
import { createBackupRouter } from './routes/backupRoutes.js'
import { createTranslateRouter } from './routes/translateRoutes.js'
import { createAIRouter } from './routes/aiRoutes.js'
import { createOfficerRouter } from './routes/officerRoutes.js'
import { createAuthRouter } from './routes/authRoutes.js'
import { createAdminRouter } from './routes/adminRoutes.js'
import { createStudentRouter } from './routes/studentRoutes.js'
import { createCareerRouter } from './routes/careerRoutes.js'
import { createGuardianWatchRouter } from './routes/guardianWatchRoutes.js'
import { createDigitalTwinRouter } from './routes/digitalTwinRoutes.js'
import { createUserRouter } from './routes/userRoutes.js'
import { createInstitutionRouter } from './routes/institutionRoutes.js'
import { createCareerForgeRouter } from './routes/careerForgeRoutes.js'
import { createSubscriptionRouter } from './routes/subscriptionRoutes.js'
import { createLeadRouter } from './routes/leadRoutes.js'
import { createReportDeliveryRouter } from './routes/reportDeliveryRoutes.js'
import { ReportDeliveryController } from './controllers/ReportDeliveryController.js'
import { createInvoiceRouter } from './routes/invoiceRoutes.js'
import { createDemoRouter } from './routes/demoRoutes.js'
import { createNaacInsightsRouter } from './routes/naacInsightsRoutes.js'
import { createInsightsRouter } from './routes/insightsRoutes.js'
import { InsightsController } from './controllers/InsightsController.js'
import { createNirfRouter } from './routes/nirfRoutes.js'
import staffRouter from './routes/staffRoutes.js'
import approvalRouter from './routes/approvalRoutes.js'
import calendarRouter from './routes/calendarRoutes.js'
import attendanceRouter from './routes/attendanceRoutes.js'
import portalRouter from './routes/portalRoutes.js'
import { createNotificationRouter } from './routes/notificationRoutes.js'
import { createOnboardingRouter } from './routes/onboardingRoutes.js'
import { createLegalRouter } from './routes/legalRoutes.js'
import { createSupportRouter } from './routes/supportRoutes.js'
import { createMonitoringRouter, buildMetricsPayload, trackMetricsRequest } from './routes/monitoringRoutes.js'
import { createWhatsAppRouter } from './routes/whatsappRoutes.js'
import { createFeeReminderRouter } from './routes/feeReminderRoutes.js'
import academicEscalationRouter from './routes/academicEscalationRoutes.js'
import { createSSORouter } from './routes/ssoRoutes.js'
import { createComplianceRouter } from './routes/complianceRoutes.js'
import { createLiveDataRouter } from './routes/liveDataRoutes.js'
import { createPaymentRouter } from './routes/paymentRoutes.js'
import { createInstitutionalNeedsRouter } from './routes/institutionalNeedsRoutes.js'
import { createCampusOperationsRouter } from './routes/campusOperationsRoutes.js'
import { createCampusRouter } from './routes/campusRoutes.js'
import { createNetworkRouter } from './routes/networkRoutes.js'
import { createAdvancedTechRouter } from './routes/advancedTechRoutes.js'
import { createLTIRouter } from './routes/ltiRoutes.js'
import { authMiddleware } from './middleware/auth.js'
import { verifyLatestBackup } from './workers/backupVerifier.js'
import { sessionTimeout } from './middleware/sessionTimeout.js'
import { rateLimitPerUser } from './middleware/rateLimitPerUser.js'
import { pool, attachInstitutionContext } from './db/pool.js'
import { httpLogger, productionRateLimiter } from './middleware/productionHardening.js'
import helmet from 'helmet'
import { requestTimeout } from './middleware/timeout.js'

// Security headers middleware
function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'")
  next()
}

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('API Error:', err.message)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.status(status).json({ error: message, status })
}

export function createApp({ db } = {}) {
  const app = express()
  app.set('trust proxy', 1)
  app.use(helmet({ contentSecurityPolicy: false }))
  const backupRouter = createBackupRouter(db)

  const explicitOrigins = [
    'https://eduflow-web.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : []),
  ]

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      try {
        const parsed = new URL(origin)
        if (
          explicitOrigins.includes(origin) ||
          /\.onrender\.com$/.test(parsed.hostname) ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return callback(null, true)
        }
      } catch {
        // Fallback for custom schemes or simple origin strings
        if (explicitOrigins.includes(origin) || origin.includes('onrender.com')) {
          return callback(null, true)
        }
      }
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-institution-id', 'x-async-job', 'x-bypass-rls'],
  }

  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions))
  app.use(express.json())
  app.use(securityHeadersMiddleware)
  app.use(httpLogger)
  app.use((req, res, next) => {
    trackMetricsRequest(false)
    next()
  })
  app.use(attachInstitutionContext)

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'eduflow-backend', version: '1.0.1', build: 'demo-lockdown-v2', timestamp: new Date().toISOString() })
  })

  app.get('/api/health/render', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.get('/api/health/db', async (_req, res) => {
    try {
      const health = await pool.getHealth()
      res.json(health)
    } catch (err) {
      res.status(500).json({ error: err.message, mode: 'postgres', persistent: false })
    }
  })

  // Apply production rate limiter to all /api/v1/* routes
  app.use('/api/v1', productionRateLimiter)
  app.use('/api/v1', sessionTimeout(60))
  app.use('/api/v1', rateLimitPerUser)

  // API v1 routes
  app.use('/api/v1/search', createSearchRouter(db))
  app.use('/api/v1/auth', createAuthRouter())
  app.use('/api/auth', createAuthRouter())
  app.use('/auth', createAuthRouter())
  app.get(['/api/v1/default-institution', '/api/default-institution', '/default-institution'], (req, res) => {
    res.json({ id: 1, name: 'EduFlow Campus' })
  })
  app.use('/api/v1/backup', backupRouter)
  // Backward compatibility: also mount on /api/search
  app.use('/api/search', createSearchRouter(db))
  app.use('/api/backup', backupRouter)
  app.use('/api/v1/translate', createTranslateRouter())
  app.use('/api/v1/ai', createAIRouter())

  app.use('/api/v1/officers', requestTimeout(45000))
  app.use('/api/v1/officers', (req, res, next) => {
    const start = Date.now()
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      const elapsed = Date.now() - start
      if (elapsed > 10000) res.set('X-AI-Latency-Warning', 'true')
      return originalJson(body)
    }
    next()
  })

  app.use('/api/v1/officers', createOfficerRouter())
  app.use('/api/v1/admin', createAdminRouter())
  app.use('/api/v1/student', createStudentRouter())
  app.use('/api/v1/career', createCareerRouter())
  app.use('/api/v1/guardianwatch', createGuardianWatchRouter())
  app.use('/api/v1/digital-twin', createDigitalTwinRouter())
  app.use('/api/v1/user', createUserRouter())
  app.use('/api/v1/users', createUserRouter())
  app.use('/api/v1/institutions', createInstitutionRouter())
  app.use('/api/v1/institution', createInstitutionRouter()) // alias for plan-config
  app.use('/api/v1/careerforge', createCareerForgeRouter())
  app.use('/api/v1/subscription', createSubscriptionRouter())
  app.use('/api/v1/ai-officer', createOfficerRouter()) // alias for officers
  app.use('/api/v1/leads', createLeadRouter())
  app.use('/api/v1/reports', createReportDeliveryRouter())
  app.use('/api/v1/invoices', createInvoiceRouter())
  app.use('/api/v1/demo', createDemoRouter())
  app.use('/api/v1/naac', createNaacInsightsRouter())
  app.use('/api/v1/insights', createInsightsRouter())
  app.use('/api/v1/nirf', createNirfRouter())
  app.use('/api/v1/staff', staffRouter)
  app.use('/api/v1/approvals', approvalRouter)
  app.use('/api/v1/calendar', calendarRouter)
  app.use('/api/v1/attendance', attendanceRouter)
  app.use('/api/v1/portal', portalRouter)
  app.use('/api/v1/notifications', createNotificationRouter(db))
  app.use('/api/v1/onboarding', createOnboardingRouter())
  app.use('/api/v1/legal', createLegalRouter())
  app.use('/api/v1/support', createSupportRouter())
  app.use('/api/v1/monitoring', createMonitoringRouter())
  app.use('/api/v1/admin/monitoring', createMonitoringRouter())
  app.use('/api/v1/whatsapp', createWhatsAppRouter())
  app.use('/api/v1/fee-reminders', createFeeReminderRouter())
  app.use('/api/v1/escalations', academicEscalationRouter)
  app.use('/api/v1/sso', createSSORouter())
  app.use('/api/v1/admin/sso', createSSORouter())
  app.use('/api/v1/compliance', createComplianceRouter())
  app.use('/api/v1/admin/compliance', createComplianceRouter())
  app.use('/api/v1/live-data', createLiveDataRouter())
  app.use('/api/v1/payments', createPaymentRouter())
  app.use('/api/v1/payment', createPaymentRouter())
  app.use('/api/v1/campus', createCampusRouter())
  app.use('/api/v1/network', createNetworkRouter())
  app.use('/api/v1', createAdvancedTechRouter())
  app.use('/api/v1/institution-operations', createInstitutionalNeedsRouter())
  app.use('/api/v1', createCampusOperationsRouter())
  app.use('/api', createCampusOperationsRouter())
  app.use('/api/v1/lti', createLTIRouter())
  
  // Observability & Telemetry Metrics Endpoint (Feature 81)
  app.get('/api/v1/metrics', (_req, res) => {
    res.json(buildMetricsPayload())
  })

  app.get('/api/v1/activity', authMiddleware, InsightsController.activity)

  // Manual Backup Verification trigger
  app.get('/api/v1/admin/backup/verify', async (_req, res) => {
    try {
      const report = await verifyLatestBackup()
      res.json({ success: true, report })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // Public Report Viewer and Download endpoints
  app.get('/r/:token/pdf', ReportDeliveryController.downloadPublicReportPdf)
  app.get('/r/:token', ReportDeliveryController.renderPublicReportHtml)

  // Waitlist capture endpoint
  app.post('/api/v1/waitlist', (req, res) => {
    const { email, module } = req.body || {}
    console.log(`[Waitlist] ${email} requested notification for module: ${module}`)
    res.json({ success: true, message: 'Added to waitlist', email, module })
  })

  // Client error reporting endpoint
  app.post('/api/v1/admin/error-report', (req, res) => {
    const { error, url, timestamp } = req.body || {}
    console.error(`[Client Error Report] ${timestamp || new Date().toISOString()} on ${url}:`, error)
    res.json({ success: true, message: 'Error report received' })
  })

  // Serve frontend static build if available (e.g., frontend/dist)
  let servedFrontend = false
  try {
    const frontendDist = path.join(process.cwd(), 'frontend', 'dist')
    if (fs.existsSync(frontendDist)) {
      servedFrontend = true
      app.use(express.static(frontendDist))

      // Root path serves index.html
      app.get('/', (_req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'))
      })

      // For SPA client-side routing: serve index.html for non-API routes
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next()
        res.sendFile(path.join(frontendDist, 'index.html'))
      })
    }
  } catch (err) {
    // If any error, continue without static serving
    // eslint-disable-next-line no-console
    console.warn('Frontend static assets not served:', err?.message || err)
  }

  // If frontend not served, provide a simple root endpoint to avoid 404
  if (!servedFrontend) {
    app.get('/', (_req, res) => {
      res.json({ message: 'Backend running. Frontend assets not found. Build frontend into frontend/dist to serve the SPA.' })
    })
  }

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })

  // Error handler
  app.use(errorHandler)

  return app
}
