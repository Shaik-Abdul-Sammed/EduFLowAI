import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/parent/disciplineAlerts'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Parent Discipline Alerts Page', () => {
  it('renders loading state and loads disciplinary records from parent overview API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        disciplinary_alerts: [
          { id: 101, type: 'Late Campus Entry', date: '2026-06-01', desc: 'Returned 15 minutes past curfew without gate pass.', severity: 'medium', acknowledged: false }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('discipline-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Late Campus Entry')).toBeInTheDocument()
      expect(screen.getByText(/Returned 15 minutes past curfew/)).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Parent service unavailable'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('discipline-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('allows parent to acknowledge warning receipt dispatching mentor notification', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          disciplinary_alerts: [
            { id: 201, type: 'Safety Goggles Non-compliance', date: '2026-06-02', desc: 'Did not wear safety goggles during chemistry titration.', severity: 'low', acknowledged: false }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Safety Goggles Non-compliance')).toBeInTheDocument()
    })

    const ackBtn = screen.getByRole('button', { name: /acknowledge warning receipt/i })
    fireEvent.click(ackBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/parent/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Safety Goggles Non-compliance')
        })
      )
    })
  })
})
