import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LeaveApplicationPage from '../pages/student/LeaveApplicationPage'

describe('LeaveApplicationPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading spinner and then renders leave application form and history log', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            requests: [
              {
                id: 1,
                leave_type: 'OnDuty',
                from_date: '2026-11-20',
                to_date: '2026-11-22',
                reason: 'Attending AI Hackathon at IISc',
                status: 'APPROVED',
                reviewed_by: 'Dr. Ramesh Kumar (HOD)',
                review_comment: 'Approved with invitation verified.'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <LeaveApplicationPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('leave-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('leave-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Apply for Leave')).toBeInTheDocument()
    expect(screen.getByText('Application Log')).toBeInTheDocument()
    expect(screen.getByText('OnDuty Leave')).toBeInTheDocument()
    expect(screen.getByText('APPROVED')).toBeInTheDocument()
    expect(screen.getByText('Attending AI Hackathon at IISc')).toBeInTheDocument()
    expect(screen.getByText(/Approved with invitation verified/i)).toBeInTheDocument()
  })

  test('submits student leave request via API and shows success notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              leave: {
                id: 2,
                leave_type: 'Medical',
                from_date: '2026-12-01',
                to_date: '2026-12-03',
                reason: 'Dengue recovery',
                status: 'PENDING'
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, requests: [] })
      })
    })

    render(
      <BrowserRouter>
        <LeaveApplicationPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument()
    })

    const fromInput = screen.getByLabelText(/From Date \*/i)
    fireEvent.change(fromInput, { target: { value: '2026-12-01' } })

    const toInput = screen.getByLabelText(/To Date \*/i)
    fireEvent.change(toInput, { target: { value: '2026-12-03' } })

    const reasonInput = screen.getByLabelText(/Reason & Event Details \*/i)
    fireEvent.change(reasonInput, { target: { value: 'Dengue recovery' } })

    const form = screen.getByRole('button', { name: /Submit Leave Request/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('leave-success-alert')).toBeInTheDocument()
      expect(screen.getByText(/Leave application forwarded to HOD for approval/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/leave/apply'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Dengue recovery')
      })
    )
  })

  test('displays error alert on submission failure', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Leave dates overlap with semester examination schedule' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, requests: [] })
      })
    })

    render(
      <BrowserRouter>
        <LeaveApplicationPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Apply for Leave')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/From Date \*/i), { target: { value: '2026-12-05' } })
    fireEvent.change(screen.getByLabelText(/To Date \*/i), { target: { value: '2026-12-07' } })
    fireEvent.change(screen.getByLabelText(/Reason & Event Details \*/i), { target: { value: 'Exam trip' } })

    const form = screen.getByRole('button', { name: /Submit Leave Request/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/Leave dates overlap with semester examination schedule/i)).toBeInTheDocument()
    })
  })

  test('displays error alert on initial fetch failure and retries successfully', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            requests: [
              {
                id: 5,
                leave_type: 'Personal',
                from_date: '2026-12-10',
                to_date: '2026-12-12',
                reason: 'Sister wedding ceremony',
                status: 'PENDING'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <LeaveApplicationPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load leave requests/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Sister wedding ceremony')).toBeInTheDocument()
    })
  })
})
