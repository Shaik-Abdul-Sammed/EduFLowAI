import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentManagementPage from '../pages/admin/studentManagement'
import apiClient from '../services/apiClient'

jest.mock('../services/apiClient')

const mockStudents = [
  { id: 'STU001', name: 'Aarav Sharma', roll: '2024MPC001', section: 'MPC-A', stream: 'MPC', year: 1, contact: '9876543210' },
  { id: 'STU002', name: 'Priya Singh', roll: '2024BIPC012', section: 'BIPC-A', stream: 'BIPC', year: 2, contact: '9876543211' }
]

describe('StudentManagement Component (Tier A Verified Flow)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state on mount', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <StudentManagementPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('students-loading')).toBeInTheDocument()
  })

  it('fetches and renders student directory successfully', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockStudents
      }
    })

    render(
      <BrowserRouter>
        <StudentManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('students-table')).toBeInTheDocument()
    })

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    expect(screen.getByText('2024MPC001')).toBeInTheDocument()
    expect(screen.getByText('Priya Singh')).toBeInTheDocument()
  })

  it('creates new student and posts to backend API', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockStudents }
    })

    apiClient.post.mockResolvedValueOnce({
      status: 201,
      data: {
        success: true,
        student: {
          id: 'STU003',
          name: 'Vikram Joshi',
          roll: '2024MPC045',
          stream: 'MPC',
          year: 1,
          phone: '9876543299'
        }
      }
    })

    render(
      <BrowserRouter>
        <StudentManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('students-table')).toBeInTheDocument()
    })

    // Open enrollment modal
    fireEvent.click(screen.getByTestId('enroll-student-btn'))
    expect(screen.getByTestId('student-form-card')).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByLabelText(/STUDENT FULL NAME/i), { target: { value: 'Vikram Joshi' } })
    fireEvent.change(screen.getByLabelText(/ROLL NUMBER/i), { target: { value: '2024MPC045' } })
    fireEvent.change(screen.getByLabelText(/PARENT WHATSAPP \/ MOBILE/i), { target: { value: '9876543299' } })

    // Submit form
    fireEvent.submit(screen.getByTestId('create-student-form'))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/admin/students', expect.objectContaining({
        name: 'Vikram Joshi',
        roll: '2024MPC045',
        phone: '9876543299'
      }))
    })

    expect(await screen.findByText('Vikram Joshi')).toBeInTheDocument()
  })

  it('dismisses a student and calls DELETE API', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockStudents }
    })
    apiClient.delete.mockResolvedValueOnce({
      data: { success: true, message: 'Student dismissed' }
    })

    render(
      <BrowserRouter>
        <StudentManagementPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('student-row-STU001')).toBeInTheDocument()
    })

    // Click dismiss on first student
    const dismissBtns = screen.getAllByRole('button', { name: /Dismiss/i })
    fireEvent.click(dismissBtns[0])

    // Confirm in modal
    const confirmBtn = await screen.findByRole('button', { name: /Yes, Dismiss/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/admin/students/STU001')
    })
  })

  it('renders error state on API failure', async () => {
    const errorObj = new Error('Database connection failed')
    errorObj.response = { status: 500, data: { error: 'Database connection failed' } }
    apiClient.get.mockRejectedValueOnce(errorObj)

    render(
      <BrowserRouter>
        <StudentManagementPage />
      </BrowserRouter>
    )

    expect(await screen.findByTestId('student-api-error')).toBeInTheDocument()
    expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument()
  })
})
