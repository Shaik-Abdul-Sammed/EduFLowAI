import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentSubmissionStatus from '../pages/student/submissionStatus'

describe('StudentSubmissionStatus Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays assignment submissions and rate', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 'asg-1',
                title: 'Data Structures Problem Set 3',
                course_id: 'CS301',
                due_date: '2026-05-30'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <StudentSubmissionStatus />
      </BrowserRouter>
    )

    expect(screen.getByTestId('submission-status-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('submission-status-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Submission Status')).toBeInTheDocument()
    expect(screen.getByText('Data Structures Problem Set 3')).toBeInTheDocument()
    expect(screen.getByText('Overall Submission Rate')).toBeInTheDocument()
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
        <StudentSubmissionStatus />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('submission-status-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Submission Status')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('submission-status-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Overall Submission Rate')).toBeInTheDocument()
  })

  test('submits pending assignment work and shows success toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Assignment submitted'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 'asg-1',
                title: 'Data Structures Problem Set 3',
                course_id: 'CS301'
              },
              {
                id: 'asg-2',
                title: 'Operating Systems Virtual Memory Lab',
                course_id: 'CS302'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentSubmissionStatus />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('submission-status-loading')).not.toBeInTheDocument()
    })

    const submitBtn = screen.getByTestId('submit-btn-asg-2')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('submission-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/submitted successfully for evaluation!/)).toBeInTheDocument()
  })
})
