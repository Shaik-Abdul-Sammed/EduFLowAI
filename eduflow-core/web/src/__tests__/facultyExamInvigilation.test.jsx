import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyExamInvigilation from '../pages/faculty/examInvigilation'

describe('FacultyExamInvigilation Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays assigned invigilation duties', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'EX-91',
                name: 'Physics & Electro-dynamics',
                exam_date: '2026-05-12',
                start_time: '09:00 AM'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyExamInvigilation />
      </BrowserRouter>
    )

    expect(screen.getByTestId('exam-invigilation-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('exam-invigilation-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Exam Invigilation')).toBeInTheDocument()
    expect(screen.getByText('Total Duties')).toBeInTheDocument()
    expect(screen.getByText('Physics & Electro-dynamics')).toBeInTheDocument()
    expect(screen.getByText(/09:00 AM/)).toBeInTheDocument()
  })

  test('handles network failure and retry recovery', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FacultyExamInvigilation />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('exam-invigilation-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Invigilation Schedule')).toBeInTheDocument()

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
      expect(screen.queryByTestId('exam-invigilation-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Total Duties')).toBeInTheDocument()
  })

  test('acknowledges duty and updates session status with toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Duty acknowledged'
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
                id: '1',
                name: 'Organic Chemistry II',
                exam_date: '2026-05-13'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyExamInvigilation />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('exam-invigilation-loading')).not.toBeInTheDocument()
    })

    const ackBtn = screen.getByTestId('acknowledge-btn-1')
    fireEvent.click(ackBtn)

    await waitFor(() => {
      expect(screen.getByTestId('invigilation-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/acknowledged successfully!/)).toBeInTheDocument()
  })
})
