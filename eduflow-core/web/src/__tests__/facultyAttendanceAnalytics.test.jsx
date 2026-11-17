import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AttendanceAnalyticsPage from '../pages/faculty/AttendanceAnalyticsPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Faculty Attendance Analytics Page', () => {
  it('renders loading state and displays at-risk students with live audit data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'AUD-1', session: 'OS Lab', present: 58, absent: 6 }
      ]
    })

    render(
      <MemoryRouter>
        <AttendanceAnalyticsPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('attendance-analytics-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Alok Nath')).toBeInTheDocument()
    })

    expect(screen.getByText('CS22B1089')).toBeInTheDocument()
    expect(screen.getByText('Rohan Mehta')).toBeInTheDocument()
  })

  it('handles audit sync failure and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <AttendanceAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('attendance-analytics-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('attendance-analytics-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('attendance-analytics-error')).not.toBeInTheDocument()
    })
  })

  it('dispatches parent warning SMS and updates notification status', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'TCK-201', status: 'sent' })
      })

    render(
      <MemoryRouter>
        <AttendanceAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('notify-btn-CS22B1089')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('notify-btn-CS22B1089'))

    await waitFor(() => {
      expect(screen.getByText('Alert Sent')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
