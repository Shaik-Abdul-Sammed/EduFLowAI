import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyMentoringLog from '../pages/faculty/mentoringLog'

describe('FacultyMentoringLog Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays mentoring history', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: [
              {
                id: 1,
                sender: 'mentor',
                text: 'Discussed improvement in algorithms and semester prep.',
                timestamp: '2026-05-10T10:00:00Z'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyMentoringLog />
      </BrowserRouter>
    )

    expect(screen.getByTestId('mentor-log-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('mentor-log-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Mentoring Log')).toBeInTheDocument()
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('📋 Mentoring History')).toBeInTheDocument()
    expect(screen.getByText(/Discussed improvement in algorithms/)).toBeInTheDocument()
  })

  test('handles network failure and retry button', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <FacultyMentoringLog />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('mentor-log-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Mentoring Logs')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('mentor-log-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('📋 Mentoring History')).toBeInTheDocument()
  })

  test('records a new mentoring session and shows toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: { id: 9 }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            messages: []
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultyMentoringLog />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('mentor-log-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-log-form-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('mentoring-form')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-mentoring-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('mentor-log-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/Mentoring session for Sai Sree recorded successfully!/)).toBeInTheDocument()
  })
})
