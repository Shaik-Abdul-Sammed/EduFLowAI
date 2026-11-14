import express from 'express'
import { MonitoringService } from '../services/monitoring/MonitoringService.js'

let totalRequests = 0
let totalErrors = 0

export function trackMetricsRequest(isError = false) {
  totalRequests += 1
  if (isError) totalErrors += 1
}

export function buildMetricsPayload() {
  const mem = process.memoryUsage()
  const uptime = process.uptime()
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) : 0

  return {
    uptime,
    uptimeHuman: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memoryUsage: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMB: Number((mem.heapTotal / 1024 / 1024).toFixed(2))
    },
    requests: {
      total: totalRequests,
      errors: totalErrors,
      errorRate: Number(errorRate.toFixed(4)),
      successRate: Number((1 - errorRate).toFixed(4))
    },
    timestamp: new Date().toISOString()
  }
}

export function createMonitoringRouter() {
  const router = express.Router()

  // Full health report for admin dashboard
  router.get('/health', async (_req, res) => {
    try {
      const health = await MonitoringService.checkHealth()
      res.json(health)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // Observability Platform - Prometheus & Grafana ready metrics
  router.get('/metrics', (_req, res) => {
    const payload = buildMetricsPayload()

    if (_req.headers.accept?.includes('text/plain')) {
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
      const prometheusText = [
        '# HELP eduflow_uptime_seconds Process uptime in seconds',
        '# TYPE eduflow_uptime_seconds gauge',
        `eduflow_uptime_seconds ${payload.uptime}`,
        '# HELP eduflow_memory_heap_used_bytes Heap used in bytes',
        '# TYPE eduflow_memory_heap_used_bytes gauge',
        `eduflow_memory_heap_used_bytes ${payload.memoryUsage.heapUsed}`,
        '# HELP eduflow_requests_total Total HTTP requests recorded',
        '# TYPE eduflow_requests_total counter',
        `eduflow_requests_total ${payload.requests.total}`,
        '# HELP eduflow_errors_total Total HTTP errors recorded',
        '# TYPE eduflow_errors_total counter',
        `eduflow_errors_total ${payload.requests.errors}`,
        '# HELP eduflow_error_rate Ratio of errors to requests',
        '# TYPE eduflow_error_rate gauge',
        `eduflow_error_rate ${payload.requests.errorRate}`
      ].join('\n')
      return res.send(prometheusText)
    }

    return res.json(payload)
  })

  // Capture client-side errors
  router.post('/client-error', async (req, res) => {
    try {
      const { error, stack, url, userAgent, context } = req.body || {}
      await MonitoringService.captureError({ message: error, stack }, { url, userAgent, context, source: 'client' })
      res.json({ success: true, message: 'Client error logged' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router
}
