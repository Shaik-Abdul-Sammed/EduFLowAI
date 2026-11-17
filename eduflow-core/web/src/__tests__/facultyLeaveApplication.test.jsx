import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyLeaveApplication from '../pages/faculty/leaveApplication'

describe('FacultyLeaveApplication Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays leave balance cards', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            requests: [
              {
                id: 'LV-101',
                leave_type: 'On-Duty Leave',
                from_date: '2026-11-20',
                days: 2,
                status: 'APPROVED'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyLeaveApplication />
      </BrowserRouter>
    )

    expect(screen.getByTestId('faculty-leave-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('faculty-leave-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Leave Application')).toBeInTheDocument()
    expect(screen.getByText('📊 Leave Balance')).toBeInTheDocument()
    expect(screen.getAllByText('Casual Leave').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('APPROVED')).toBeInTheDocument()
  })

  test('displays error state with retry button on network failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FacultyLeaveApplication />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('faculty-leave-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Leave Records')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            requests: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('faculty-leave-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('📊 Leave Balance')).toBeInTheDocument()
  })

  test('submits faculty leave application and shows success toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              leave: { id: 'LV-FAC-99' },
              message: 'Leave application submitted'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            requests: []
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyLeaveApplication />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('faculty-leave-loading')).not.toBeInTheDocument()
    })

    const submitBtn = screen.getByTestId('submit-leave-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('faculty-leave-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/submitted successfully! Ticket #LV-FAC-99/)).toBeInTheDocument()
  })
})
