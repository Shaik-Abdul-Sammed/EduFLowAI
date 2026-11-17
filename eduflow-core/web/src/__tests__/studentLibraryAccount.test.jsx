import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentLibraryAccount from '../pages/student/libraryAccount'

describe('StudentLibraryAccount Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays borrowed books and stats', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/issues')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              issues: [
                {
                  id: 'ISS001',
                  book_id: 'B01',
                  book_title: 'Introduction to Algorithms, 4th Ed.',
                  author: 'Cormen, Leiserson, Rivest',
                  due_date: '2026-09-01',
                  renewals: 1,
                  fine: 0
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            books: [
              {
                id: 'B02',
                title: 'Database System Concepts',
                author: 'Silberschatz',
                available_copies: 4
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentLibraryAccount />
      </BrowserRouter>
    )

    expect(screen.getByTestId('library-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('library-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Library Account')).toBeInTheDocument()
    expect(screen.getByText('Introduction to Algorithms, 4th Ed.')).toBeInTheDocument()
    expect(screen.getByText('Database System Concepts')).toBeInTheDocument()
    expect(screen.getByText('Books Borrowed')).toBeInTheDocument()
  })

  test('displays error state with retry on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <StudentLibraryAccount />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('library-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Connect to Campus Library System')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn((url) => {
      if (url.includes('/issues')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, issues: [] }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, books: [] }) })
    })

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.getByTestId('library-empty')).toBeInTheDocument()
    })
    expect(screen.getByText(/You have no active borrowed books/)).toBeInTheDocument()
  })

  test('renews borrowed book and borrows new volume from catalogue', async () => {
    let returnCount = 0
    let borrowCount = 0

    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        if (url.includes('/return')) {
          returnCount++
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, message: 'Returned/Renewed' })
          })
        }
        if (url.includes('/issue')) {
          borrowCount++
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, message: 'Issued' })
          })
        }
      }

      if (url.includes('/issues')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              issues: [
                {
                  id: 'ISS001',
                  book_id: 'B01',
                  book_title: 'Introduction to Algorithms, 4th Ed.',
                  due_date: '2026-09-01',
                  renewals: 1,
                  fine: 0
                }
              ]
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            books: [
              {
                id: 'B02',
                title: 'Database System Concepts',
                author: 'Silberschatz',
                available_copies: 4
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentLibraryAccount />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('library-loading')).not.toBeInTheDocument()
    })

    // Renew
    fireEvent.click(screen.getByTestId('renew-btn-ISS001'))

    await waitFor(() => {
      expect(screen.getByTestId('library-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/Book renewed \/ accession returned successfully/)).toBeInTheDocument()

    // Borrow
    fireEvent.click(screen.getByTestId('borrow-btn-B02'))

    await waitFor(() => {
      expect(screen.getByText(/Issued "Database System Concepts" for 14 academic days/)).toBeInTheDocument()
    })
  })
})
