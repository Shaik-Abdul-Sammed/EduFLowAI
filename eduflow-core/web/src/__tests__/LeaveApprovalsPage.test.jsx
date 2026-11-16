import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LeaveApprovalsPage from '../pages/hod/LeaveApprovalsPage'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

const mockLeaveRequests = [
  {
    id: 101,
    student_name: 'Aditi Deshmukh',
    student_roll: '2024CSE042',
    department: 'Computer Science & Engineering',
    leave_type: 'Medical',
    from_date: '2026-11-20',
    to_date: '2026-11-22',
    reason: 'Viral fever diagnosed at campus clinic',
    parent_consent: true,
    status: 'PENDING'
  },
  {
    id: 102,
    student_name: 'Kunal Verma',
    student_roll: '2024ECE015',
    department: 'Electronics & Communication',
    leave_type: 'On-Duty',
    from_date: '2026-11-25',
    to_date: '2026-11-26',
    reason: 'Smart India Hackathon Zonal Finals',
    parent_consent: true,
    status: 'APPROVED',
    review_comment: 'Approved by Department Head. Attendance preserved.'
  }
]

describe('LeaveApprovalsPage Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading skeleton on initial mount', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <LeaveApprovalsPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('leave-loading')).toBeInTheDocument()
  })

  it('fetches and renders departmental leave applications', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, requests: mockLeaveRequests }
    })

    render(
      <BrowserRouter>
        <LeaveApprovalsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('leave-requests-grid')).toBeInTheDocument()
    })

    expect(screen.getByText('Aditi Deshmukh')).toBeInTheDocument()
    expect(screen.getByText(/2024CSE042/i)).toBeInTheDocument()
    expect(screen.getByText('Kunal Verma')).toBeInTheDocument()
    expect(screen.getByTestId('approve-btn-101')).toBeInTheDocument()
    expect(screen.getByTestId('reject-btn-101')).toBeInTheDocument()
  })

  it('approves a leave application via PATCH API', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, requests: mockLeaveRequests }
    })
    apiClient.patch.mockResolvedValueOnce({
      status: 200,
      data: { success: true, message: 'Leave status updated' }
    })

    render(
      <BrowserRouter>
        <LeaveApprovalsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('approve-btn-101')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('approve-btn-101'))

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/leave/101/status', expect.objectContaining({
        status: 'APPROVED'
      }))
    })

    expect(await screen.findByTestId('leave-action-feedback')).toHaveTextContent(/marked as APPROVED/i)
    expect(screen.getByTestId('status-badge-101')).toHaveTextContent('APPROVED')
  })

  it('rejects a leave application via PATCH API', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, requests: mockLeaveRequests }
    })
    apiClient.patch.mockResolvedValueOnce({
      status: 200,
      data: { success: true, message: 'Leave status updated' }
    })

    render(
      <BrowserRouter>
        <LeaveApprovalsPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('reject-btn-101')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('reject-btn-101'))

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/leave/101/status', expect.objectContaining({
        status: 'REJECTED'
      }))
    })

    expect(await screen.findByTestId('leave-action-feedback')).toHaveTextContent(/marked as REJECTED/i)
    expect(screen.getByTestId('status-badge-101')).toHaveTextContent('REJECTED')
  })

  it('renders error banner when server fails', async () => {
    const errorObj = new Error('Database leave log connection lost')
    errorObj.response = { status: 500, data: { error: 'Database leave log connection lost' } }
    apiClient.get.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <LeaveApprovalsPage />
      </BrowserRouter>
    )

    expect(await screen.findByTestId('leave-api-error')).toBeInTheDocument()
    expect(screen.getByText(/Database leave log connection lost/i)).toBeInTheDocument()
  })
})
