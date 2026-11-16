import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LibraryManagementPage from '../pages/admin/LibraryManagementPage'

describe('LibraryManagementPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading spinner and then renders library catalog and active issues', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/v1/library/books')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              books: [
                {
                  id: 1,
                  isbn: '978-0131103627',
                  title: 'The C Programming Language',
                  author: 'Brian Kernighan, Dennis Ritchie',
                  category: 'Computer Science',
                  total_copies: 10,
                  available_copies: 7,
                  shelf_location: 'CS-Rack-01'
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
            issues: [
              {
                id: 101,
                book_title: 'Introduction to Algorithms (CLRS)',
                student_name: 'Ananya Sharma',
                student_roll: 'SS26',
                due_date: '2026-10-29',
                fine_amount: 80,
                status: 'OVERDUE'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <LibraryManagementPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('library-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('library-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Issue Book to Student')).toBeInTheDocument()
    expect(screen.getByText('Active Circulation & Returns')).toBeInTheDocument()
    expect(screen.getByText('The C Programming Language')).toBeInTheDocument()
    expect(screen.getByText('7 / 10')).toBeInTheDocument()
    expect(screen.getByText('Introduction to Algorithms (CLRS)')).toBeInTheDocument()
    expect(screen.getByText(/Overdue Fine: ₹80/i)).toBeInTheDocument()
  })

  test('authorizes book issue via API and shows success notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/library/issue')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              issue: {
                id: 102,
                book_id: 1,
                student_roll: 'SS26',
                status: 'BORROWED'
              }
            })
        })
      }
      if (url.includes('/v1/library/books')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              books: [
                {
                  id: 1,
                  title: 'Clean Code',
                  author: 'Robert C. Martin',
                  total_copies: 5,
                  available_copies: 3
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, issues: [] })
      })
    })

    render(
      <BrowserRouter>
        <LibraryManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Issue Book to Student')).toBeInTheDocument()
    })

    const bookSelect = screen.getByLabelText(/Select Book \*/i)
    fireEvent.change(bookSelect, { target: { value: '1' } })

    const rollInput = screen.getByLabelText(/Student Roll Number \*/i)
    fireEvent.change(rollInput, { target: { value: 'SS26' } })

    const form = screen.getByRole('button', { name: /Authorize Book Issue/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('library-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Book issued successfully! Due in 14 days/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/library/issue'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('SS26')
      })
    )
  })

  test('returns borrowed book via API and shows success notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/library/return')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Book returned successfully! Late fine calculated: ₹0.00'
            })
        })
      }
      if (url.includes('/v1/library/issues')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              issues: [
                {
                  id: 50,
                  book_title: 'Design Patterns',
                  student_name: 'Karthik V',
                  student_roll: '1ST22ME022',
                  due_date: '2026-11-20',
                  status: 'BORROWED'
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, books: [] })
      })
    })

    render(
      <BrowserRouter>
        <LibraryManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Design Patterns')).toBeInTheDocument()
    })

    const returnBtn = screen.getByRole('button', { name: /Return/i })
    fireEvent.click(returnBtn)

    await waitFor(() => {
      expect(screen.getByTestId('library-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Book returned successfully/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/library/return'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"issue_id":50')
      })
    )
  })

  test('displays error alert on initial fetch failure and retries successfully', async () => {
    let callCount = 0
    global.fetch = jest.fn((url) => {
      callCount++
      if (callCount <= 2) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      if (url.includes('/v1/library/books')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              books: [
                {
                  id: 10,
                  title: 'Retried Algorithms Book',
                  author: 'CLRS',
                  isbn: '12345',
                  total_copies: 5,
                  available_copies: 5
                }
              ]
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, issues: [] })
      })
    })

    render(
      <BrowserRouter>
        <LibraryManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load library data/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Retried Algorithms Book')).toBeInTheDocument()
    })
  })
})
