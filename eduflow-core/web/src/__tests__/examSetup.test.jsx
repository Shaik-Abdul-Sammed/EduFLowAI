import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ExamSetup from '../pages/admin/examSetup'

describe('ExamSetup Admin Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays fetched scheduled exams', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'EX101',
                course: 'Mathematics I',
                date: '2026-08-10',
                time: '10:00 AM - 11:30 AM',
                hall: 'Hall A1 (Main Block)',
                maxMarks: 25
              },
              {
                id: 'EX102',
                course: 'Physics I',
                date: '2026-08-11',
                time: '10:00 AM - 11:30 AM',
                hall: 'Hall A2 (Science Wing)',
                maxMarks: 100
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <ExamSetup />
      </BrowserRouter>
    )

    expect(screen.getByTestId('exam-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('exam-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Examination & Seating Scheduler')).toBeInTheDocument()
    expect(screen.getAllByText('Mathematics I').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Physics I').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('EX101')).toBeInTheDocument()
    expect(screen.getByText('EX102')).toBeInTheDocument()
  })

  test('displays error state with retry on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <ExamSetup />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('exam-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Examination Schedule')).toBeInTheDocument()

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
      expect(screen.getByTestId('exam-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No scheduled exams found')).toBeInTheDocument()
  })

  test('submits schedule exam form and updates calendar list', async () => {
    let callCount = 0
    global.fetch = jest.fn((url, options) => {
      callCount++
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              exam: {
                id: 'EX103',
                course: 'Chemistry Lab Practical',
                date: '2026-09-20',
                time: '10:00 AM - 01:00 PM',
                hall: 'Chemistry Lab 2',
                maxMarks: 50
              }
            })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: callCount > 1
              ? [
                  {
                    id: 'EX103',
                    course: 'Chemistry Lab Practical',
                    date: '2026-09-20',
                    time: '10:00 AM - 01:00 PM',
                    hall: 'Chemistry Lab 2',
                    maxMarks: 50
                  }
                ]
              : []
          })
      })
    })

    render(
      <BrowserRouter>
        <ExamSetup />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('exam-loading')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('open-exam-form-btn'))
    expect(screen.getByTestId('schedule-exam-form')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('e.g. Mathematics II'), { target: { value: 'Chemistry Lab Practical' } })
    // set date
    const dateInput = screen.getByTestId('exam-date-input')
    fireEvent.change(dateInput, { target: { value: '2026-09-20' } })

    fireEvent.click(screen.getByTestId('submit-exam-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('exam-success-toast')).toBeInTheDocument()
    })

    expect(screen.getByText(/scheduled successfully/)).toBeInTheDocument()
  })
})
