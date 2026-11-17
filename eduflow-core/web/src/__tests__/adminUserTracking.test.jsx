import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UserTracking from '../pages/admin/userTracking'

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

describe('Admin User Tracking Page', () => {
  it('renders loading state and loads live tracking presence sessions', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        sessions: [
          { student_name: 'Harish Chandra', student_roll: '2024-CSE-091', room_name: 'Turing Hall A', last_seen: new Date().toISOString() }
        ]
      })
    })

    render(
      <MemoryRouter>
        <UserTracking />
      </MemoryRouter>
    )

    expect(screen.getByTestId('tracking-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Harish Chandra')).toBeInTheDocument()
      expect(screen.getByText('Turing Hall A')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <UserTracking />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('tracking-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('broadcasts campus safety check-in hitting support tickets category', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessions: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ticket: { id: 890 } })
      })

    render(
      <MemoryRouter>
        <UserTracking />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /broadcast safety check/i })).toBeInTheDocument()
    })

    const broadcastBtn = screen.getByRole('button', { name: /broadcast safety check/i })
    fireEvent.click(broadcastBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/support/tickets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('campus_safety')
        })
      )
    })
  })
})
