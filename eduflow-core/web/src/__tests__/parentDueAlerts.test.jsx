import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/parent/dueAlerts'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Parent Due Alerts Page', () => {
  it('renders loading state and displays fee dues from admin fees API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        fees: [
          { id: 101, title: 'Semester 4 Tuition & Lab Fee', amount: 18500, due_date: '2026-12-20', status: 'OVERDUE' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('dues-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Semester 4 Tuition & Lab Fee')).toBeInTheDocument()
      expect(screen.getAllByText(/18,500/).length).toBeGreaterThan(0)
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Connection timed out'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('dues-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('processes payment transaction hitting support/finance tickets API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          fees: [
            { id: 101, title: 'Annual Examination Fee', amount: 3500, due_date: '2026-11-30', status: 'PENDING' }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ticket: { id: 301 } })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Annual Examination Fee')).toBeInTheDocument()
    })

    const payBtn = screen.getByRole('button', { name: /pay outstanding due/i })
    fireEvent.click(payBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/support/tickets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('finance')
        })
      )
      expect(screen.getByText('All Accounts Cleared')).toBeInTheDocument()
    })
  })
})
