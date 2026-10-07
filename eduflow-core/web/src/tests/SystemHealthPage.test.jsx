import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SystemHealthPage from '../pages/admin/SystemHealthPage'

describe('SystemHealthPage Component Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'healthy',
          service: 'eduflow-backend',
          version: '1.0.0',
          uptimeSeconds: 7200,
          database: { status: 'healthy', latencyMs: 2 },
          system: { memory: { totalMb: 1024, usedMb: 450, usagePercent: 44 } },
          metrics: { errors24h: 0, lastBackupTimestamp: new Date().toISOString() }
        })
      })
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders system health metrics header and verify backup button', () => {
    render(
      <BrowserRouter>
        <SystemHealthPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Institutional System Health & Telemetry/i)).toBeInTheDocument()
    expect(screen.getByText(/Verify Backup Integrity/i)).toBeInTheDocument()
  })
})
