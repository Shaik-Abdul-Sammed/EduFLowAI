import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ParentLeaveRequestsPage from '../pages/parent/leaveRequests'

describe('ParentLeaveRequestsPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders active hostel outing passes', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            requests: [
              {
                id: 1,
                permissionId: 'OUTING_J8K92X',
                studentName: 'Aarav Sharma',
                studentRoll: 'SS26CS01',
                destination: 'Home Town Visit (Guntur)',
                departureTime: '2026-11-20 16:30',
                returnTime: '2026-11-23 20:00',
                guardianApprovalStatus: 'APPROVED_BY_GUARDIAN',
                gatePassGenerated: true
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ParentLeaveRequestsPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('leave-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('leave-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Digital Guardian Gate-Pass & Outing Sign-Off')).toBeInTheDocument()
    expect(screen.getByText('Home Town Visit (Guntur)')).toBeInTheDocument()
    expect(screen.getByText('OUTING_J8K92X')).toBeInTheDocument()
    expect(screen.getByText('Authorize Hostel Outing / Weekend Pass')).toBeInTheDocument()
  })

  test('renders load error state and recovers on retry', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'DB connection failure' })
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
        <ParentLeaveRequestsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load leave records/i).length).toBeGreaterThanOrEqual(1)
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Digital Guardian Gate-Pass & Outing Sign-Off')).toBeInTheDocument()
    })
  })

  test('submits hostel outing authorization successfully', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/v1/parents/hostel-outing-leave')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              permissionId: 'OUTING_L99M1',
              studentRoll: 'SS26CS01',
              studentName: 'Aarav Sharma',
              destination: 'Family Wedding in Vijayawada',
              departureTime: '2026-11-28 17:00',
              returnTime: '2026-11-30 20:00',
              guardianApprovalStatus: 'PENDING_GUARDIAN_SIGN_OFF',
              gatePassGenerated: false
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
        <ParentLeaveRequestsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('leave-loading')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Destination & Reason/i), {
      target: { value: 'Family Wedding in Vijayawada' }
    })

    const submitBtn = screen.getByRole('button', { name: /Grant Guardian Outing Permission/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('leave-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Hostel night outing pass OUTING_L99M1 authorized successfully/i)).toBeInTheDocument()
      expect(screen.getByText('OUTING_L99M1')).toBeInTheDocument()
    })
  })
})
