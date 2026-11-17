import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OfficerPlaceholder from '../pages/ai/officers/OfficerPlaceholder'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Officer Placeholder Page', () => {
  it('renders coming soon banner and registers waitlist interest on click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'TCK-99', status: 'created' })
    })

    render(
      <MemoryRouter>
        <OfficerPlaceholder
          officerName="Autonomous Lab Safety Officer"
          icon="🛡️"
          color="#10B981"
          desc="Automates chemical inventory auditing, OSHA compliance, and equipment maintenance schedules."
          features={['Hazmat Tracking', 'Auto Calibration Alerts', 'Lab Incident Log']}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Autonomous Lab Safety Officer')).toBeInTheDocument()
    expect(screen.getByText('Hazmat Tracking')).toBeInTheDocument()

    const notifyBtn = screen.getByTestId('placeholder-notify-btn')
    fireEvent.click(notifyBtn)

    await waitFor(() => {
      expect(screen.getByTestId('placeholder-success')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })

  it('handles submission error and allows user retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <OfficerPlaceholder
          officerName="Campus Transport Officer"
          icon="🚌"
          color="#F59E0B"
        />
      </MemoryRouter>
    )

    const notifyBtn = screen.getByTestId('placeholder-notify-btn')
    fireEvent.click(notifyBtn)

    await waitFor(() => {
      expect(screen.getByTestId('placeholder-error')).toBeInTheDocument()
    })

    // Retry
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'TCK-100', status: 'created' })
    })

    fireEvent.click(screen.getByTestId('placeholder-retry'))

    await waitFor(() => {
      expect(screen.getByTestId('placeholder-success')).toBeInTheDocument()
    })
  })
})
