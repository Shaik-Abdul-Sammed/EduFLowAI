import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/student/labBookings'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Student Lab Bookings Page', () => {
  it('renders loading state and displays lab slots', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        tickets: [
          { id: 501, subject: 'Lab Slot Reservation: Physics Lab', category: 'lab_booking' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('lab-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText(/Physics Lab/).length).toBeGreaterThan(0)
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to reach backend'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('lab-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('allows student to book a slot hitting the support tickets reservation API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, tickets: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: 999 })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('lab-loading')).not.toBeInTheDocument()
    })

    const bookButtons = screen.getAllByRole('button', { name: /\+ book slot/i })
    expect(bookButtons.length).toBeGreaterThan(0)
    fireEvent.click(bookButtons[0])

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/support/tickets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('lab_booking')
        })
      )
    })
  })
})
