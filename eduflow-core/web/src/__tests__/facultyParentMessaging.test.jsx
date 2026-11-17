import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyParentMessaging from '../pages/faculty/parentMessaging'

describe('FacultyParentMessaging Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays parent inquiries inbox', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: [
              {
                id: 1,
                sender: 'parent',
                text: 'Can we schedule a meeting to discuss mathematics tutorial?',
                timestamp: '2026-05-08T10:00:00Z'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyParentMessaging />
      </BrowserRouter>
    )

    expect(screen.getByTestId('parent-messaging-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('parent-messaging-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Parent Messaging')).toBeInTheDocument()
    expect(screen.getByText(/Parent Inquiries & Messages/)).toBeInTheDocument()
    expect(screen.getByText(/Can we schedule a meeting to discuss/)).toBeInTheDocument()
  })

  test('handles network failure with retry button', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FacultyParentMessaging />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('parent-messaging-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Parent Communications')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('parent-messaging-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Parent Inquiries & Messages/)).toBeInTheDocument()
  })

  test('sends a new message to parent and displays success toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: { id: 10 }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: []
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyParentMessaging />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('parent-messaging-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-compose-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('compose-message-form')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-msg-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('parent-msg-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/Message sent to Mr. R. Sharma successfully!/)).toBeInTheDocument()
  })
})
