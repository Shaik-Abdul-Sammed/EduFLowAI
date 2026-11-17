import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/parent/childTracking'

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    disconnect: jest.fn()
  })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Parent Child Tracking Page', () => {
  it('renders student presence telemetry and location from backend', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          child: { name: 'Shaik Abdul Sammed', roll: '2024-CSE-042' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'On Campus (Classroom)',
          privacy_notice: 'Sanitized under DPDP Act 2023'
        })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('tracking-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText(/Shaik Abdul Sammed/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/On Campus \(Classroom\)/).length).toBeGreaterThan(0)
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Gateway timeout'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('tracking-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('dispatches safety ping request to mentor / telemetry server', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          child: { name: 'Shaik Abdul Sammed', roll: '2024-CSE-042' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'On Campus (Classroom)',
          privacy_notice: 'Sanitized under DPDP Act 2023'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, messageId: 'MSG-882' })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send safety check-in ping/i })).toBeInTheDocument()
    })

    const pingBtn = screen.getByRole('button', { name: /send safety check-in ping/i })
    fireEvent.click(pingBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/parent/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('2024-CSE-042')
        })
      )
    })
  })
})
