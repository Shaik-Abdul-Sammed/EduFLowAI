import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentExamSchedule from '../pages/student/examSchedule'

describe('StudentExamSchedule Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays student exam schedule cards', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 101,
                name: 'Engineering Mathematics Mid-Term',
                course_code: 'MAT101',
                exam_date: '2026-05-18',
                start_time: '09:30 AM'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <StudentExamSchedule />
      </BrowserRouter>
    )

    expect(screen.getByTestId('exam-schedule-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('exam-schedule-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Exam Schedule')).toBeInTheDocument()
    expect(screen.getByText('Engineering Mathematics Mid-Term')).toBeInTheDocument()
    expect(screen.getByText(/09:30 AM/)).toBeInTheDocument()
    expect(screen.getAllByText(/Upcoming/).length).toBeGreaterThanOrEqual(1)
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
        <StudentExamSchedule />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('exam-schedule-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Exam Schedule')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('exam-schedule-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Upcoming Examination Sessions/)).toBeInTheDocument()
  })

  test('generates hall ticket and displays success toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              ticket: { id: 'HT-9922' }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 1,
                name: 'Physics Laboratory Practical',
                course_code: 'PHY101'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentExamSchedule />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('exam-schedule-loading')).not.toBeInTheDocument()
    })

    const ticketBtn = screen.getByTestId('hallticket-btn-1')
    fireEvent.click(ticketBtn)

    await waitFor(() => {
      expect(screen.getByTestId('exam-schedule-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/generated successfully! Token #HT-9922/)).toBeInTheDocument()
  })
})
