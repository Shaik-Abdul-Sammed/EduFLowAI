import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { MonitoringService } from '../../src/services/monitoring/MonitoringService.js'

describe('Monitoring Service Unit Tests', () => {
  test('captures error event with context and stack', async () => {
    const error = new Error('Test connection reset')
    const event = await MonitoringService.captureError(error, {
      userId: 10,
      institutionId: 1,
      severity: 'error',
      component: 'PortalConnector'
    })

    assert.ok(event.id)
    assert.equal(event.eventType, 'ERROR')
    assert.equal(event.message, 'Test connection reset')
    assert.equal(event.context.component, 'PortalConnector')
  })

  test('captures audit action event and metric', async () => {
    const actionEvent = await MonitoringService.captureEvent('ONBOARDING_COMPLETED', {
      institutionId: 1,
      collegeName: 'SSIT'
    })
    assert.equal(actionEvent.eventType, 'ONBOARDING_COMPLETED')

    const metricEvent = await MonitoringService.captureMetric('ai_stream_tokens_per_sec', 38.5)
    assert.equal(metricEvent.eventType, 'METRIC')
    assert.equal(metricEvent.context.metricValue, 38.5)
  })

  test('returns comprehensive system health report', async () => {
    const health = await MonitoringService.checkHealth()
    assert.ok(health.status === 'healthy' || health.status === 'degraded')
    assert.equal(health.service, 'eduflow-backend')
    assert.ok(typeof health.uptimeSeconds === 'number')
    assert.ok(health.system.memory.totalMb > 0)
    assert.ok(health.system.memory.usagePercent >= 0)
    assert.ok(health.metrics.backupStatus)
  })
})
