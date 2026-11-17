import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/parent/dailyHomework'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Parent Daily Homework Page', () => {
  it('renders loading state and displays assignments fetched from academics endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        assignments: [
          { id: 91, title: 'Concurrency Control Lab Report', subject: 'Operating Systems', due_date: '2026-11-28', max_marks: 50 },
          { id: 92, title: 'B-Tree Indexing Implementation', subject: 'DBMS', due_date: '2026-11-30', max_marks: 40 }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('homework-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Concurrency Control Lab Report')).toBeInTheDocument()
      expect(screen.getByText('B-Tree Indexing Implementation')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('homework-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('allows parent to sign off / acknowledge homework task', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          assignments: [
            { id: 91, title: 'Data Structures Problem Set 4', subject: 'Algorithms', due_date: '2026-11-25', max_marks: 50 }
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
      expect(screen.getByText('Data Structures Problem Set 4')).toBeInTheDocument()
    })

    const ackBtn = screen.getByRole('button', { name: /sign-off homework/i })
    fireEvent.click(ackBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/parent/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Data Structures Problem Set 4')
        })
      )
    })
  })
})
