import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChildAttendancePage from '../pages/parent/childAttendance'

describe('ChildAttendancePage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading spinner and then renders child attendance overview and subjects', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            child: {
              name: 'Ananya Sharma',
              roll: 'SS26',
              branch: 'Computer Science',
              semester: 'Semester 5',
              overallAttendance: 88.5,
              attendanceStatus: 'EXEMPLARY',
              subjectAttendance: [
                { code: 'CS301', name: 'Design & Analysis of Algorithms', attended: 42, total: 46, percent: 91.3 },
                { code: 'CS302', name: 'Database Management Systems', attended: 38, total: 44, percent: 86.4 }
              ]
            },
            mentor: { name: 'Dr. Ramesh Kumar', phone: '+91 90101 50809' }
          })
      })
    )

    render(
      <BrowserRouter>
        <ChildAttendancePage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('attendance-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('attendance-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Ananya Sharma')).toBeInTheDocument()
    expect(screen.getByText('SS26')).toBeInTheDocument()
    expect(screen.getByText('88.5%')).toBeInTheDocument()
    expect(screen.getByText('Design & Analysis of Algorithms')).toBeInTheDocument()
    expect(screen.getByText('42 / 46 classes')).toBeInTheDocument()
    expect(screen.getByText('Dr. Ramesh Kumar')).toBeInTheDocument()
  })

  test('submits leave request via API and shows success notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              leave: { id: 99, status: 'PENDING' }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            child: {
              name: 'Ananya Sharma',
              roll: 'SS26',
              overallAttendance: 85,
              subjectAttendance: []
            }
          })
      })
    })

    render(
      <BrowserRouter>
        <ChildAttendancePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Ananya Sharma')).toBeInTheDocument()
    })

    const reasonInput = screen.getByLabelText(/REASON FOR ABSENCE \*/i)
    fireEvent.change(reasonInput, { target: { value: 'Viral fever rest' } })

    const form = screen.getByRole('button', { name: /Submit Request/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('leave-success')).toBeInTheDocument()
      expect(screen.getByText(/Leave request submitted to class mentor for authorization/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/leave/apply'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Viral fever rest')
      })
    )
  })

  test('displays error alert on leave submission failure', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Leave overlap with examination date' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            child: { name: 'Ananya Sharma', roll: 'SS26', overallAttendance: 85, subjectAttendance: [] }
          })
      })
    })

    render(
      <BrowserRouter>
        <ChildAttendancePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Ananya Sharma')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/REASON FOR ABSENCE \*/i), {
      target: { value: 'Family emergency' }
    })

    const form = screen.getByRole('button', { name: /Submit Request/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/Leave overlap with examination date/i)).toBeInTheDocument()
    })
  })

  test('displays error alert on initial fetch failure and retries successfully', async () => {
    let count = 0
    global.fetch = jest.fn(() => {
      count++
      if (count === 1) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            child: { name: 'Retried Student', roll: 'RS01', overallAttendance: 90, subjectAttendance: [] }
          })
      })
    })

    render(
      <BrowserRouter>
        <ChildAttendancePage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load child attendance/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Retried Student')).toBeInTheDocument()
    })
  })
})
