import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LibraryScannerPage from '../pages/admin/LibraryScannerPage'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Admin Library Scanner Page', () => {
  it('renders loading state and loads books catalog from backend', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          books: [
            { id: 201, title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', available_copies: 4 }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          issues: [
            { id: 1, student_roll: '2024-CSE-012', book_title: 'Database Internals', due_date: '2026-11-30', status: 'ISSUED' }
          ]
        })
      })

    render(
      <MemoryRouter>
        <LibraryScannerPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('scanner-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Artificial Intelligence: A Modern Approach/)).toBeInTheDocument()
      expect(screen.getByText('Database Internals')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <LibraryScannerPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('scanner-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('circulates book hitting library issue API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          books: [
            { id: 201, title: 'Discrete Mathematics and Its Applications', author: 'Kenneth Rosen', available_copies: 6 }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, issues: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Book issued' })
      })

    render(
      <MemoryRouter>
        <LibraryScannerPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Discrete Mathematics and Its Applications/)).toBeInTheDocument()
    })

    const issueBtn = screen.getByRole('button', { name: /issue book to student/i })
    fireEvent.click(issueBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/library/issue',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })
})
