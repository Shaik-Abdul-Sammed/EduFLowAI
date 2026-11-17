import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminStaffManagementPage from '../pages/admin/StaffManagementPage'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Admin Staff Management Page', () => {
  it('renders loading state and loads staff directory from backend', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        faculty: [
          { id: 301, name: 'Dr. Meenakshi Sundaram', department: 'CSE', designation: 'Associate Dean', assigned_officer: 'accreditation', level: 'FULL' },
          { id: 302, name: 'Prof. Rajesh Kanna', department: 'ECE', designation: 'Staff Coordinator', assigned_officer: 'timetable', level: 'DRAFT' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <AdminStaffManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('staff-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Dr. Meenakshi Sundaram')).toBeInTheDocument()
      expect(screen.getByText('Prof. Rajesh Kanna')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <AdminStaffManagementPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('staff-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('delegates new staff role hitting staff permissions API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, faculty: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, permissionId: 901 })
      })

    render(
      <MemoryRouter>
        <AdminStaffManagementPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delegate new staff/i })).toBeInTheDocument()
    })

    const openModalBtn = screen.getByRole('button', { name: /delegate new staff/i })
    fireEvent.click(openModalBtn)

    const nameInput = screen.getByPlaceholderText(/e\.g\. Dr\. K\. Venkat/i)
    fireEvent.change(nameInput, { target: { value: 'Kavitha Ramachandran' } })

    const submitBtn = screen.getByRole('button', { name: /grant delegation/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/staff/permissions',
        expect.objectContaining({
          method: 'POST'
        })
      )
      expect(screen.getByText('Kavitha Ramachandran')).toBeInTheDocument()
    })
  })
})
