import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/parent/examCalendar'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Parent Exam Calendar Page', () => {
  it('renders loading state and loads exam events from backend', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        exams: [
          { id: 101, title: 'Distributed Systems Endsem', exam_date: '2026-05-15', hall_number: 'LH-302' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('calendar-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Distributed Systems Endsem')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Exam service unreachable'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('calendar-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('subscribes to exam reminders via support tickets API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          exams: [
            { id: 101, title: 'Database Systems Final', exam_date: '2026-05-15' }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ticket: { id: 890 } })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Database Systems Final')).toBeInTheDocument()
    })

    const remindBtn = screen.getByRole('button', { name: /remind me/i })
    fireEvent.click(remindBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/support/tickets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Database Systems Final')
        })
      )
    })
  })
})
