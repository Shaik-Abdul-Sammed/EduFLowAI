import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentSubjectMarks from '../pages/student/subjectMarks'

describe('StudentSubjectMarks Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays subject marks breakdown and cards', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjects: [
              { code: 'PHY101', name: 'Physics', maxInternal: 30, maxExternal: 70 },
              { code: 'MAT101', name: 'Mathematics', maxInternal: 30, maxExternal: 70 }
            ],
            marks: {
              PHY101: { internal: 27, external: 63 },
              MAT101: { internal: 29, external: 68 }
            }
          })
      })
    )

    render(
      <BrowserRouter>
        <StudentSubjectMarks />
      </BrowserRouter>
    )

    expect(screen.getByTestId('subject-marks-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('subject-marks-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Subject Marks')).toBeInTheDocument()
    expect(screen.getByText('Subject-wise Marks Breakdown')).toBeInTheDocument()
    expect(screen.getByText('PHY101')).toBeInTheDocument()
    expect(screen.getByText('MAT101')).toBeInTheDocument()
    expect(screen.getAllByText('Physics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Mathematics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Overall Score')).toBeInTheDocument()
  })

  test('handles load error and retry recovery gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    render(
      <BrowserRouter>
        <StudentSubjectMarks />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('subject-marks-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Academic Marks')).toBeInTheDocument()

    // Retry recovery
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjects: [{ code: 'BIO101', name: 'Biology', maxInternal: 30, maxExternal: 70 }],
            marks: {}
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('subject-marks-loading')).not.toBeInTheDocument()
    })
    expect(screen.getAllByText(/Biology/).length).toBeGreaterThanOrEqual(1)
  })

  test('submits re-evaluation grievance request for a chosen subject', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              grievance: { id: 'GRV-ACAD-88' },
              message: 'Grievance submitted'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjects: [{ code: 'CHE101', name: 'Chemistry', maxInternal: 30, maxExternal: 70 }],
            marks: { CHE101: { internal: 22, external: 51 } }
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentSubjectMarks />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('subject-marks-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('request-reeval-open-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('reeval-form')).toBeInTheDocument()
    expect(screen.getByText('Dispute / Re-evaluation Request')).toBeInTheDocument()

    fireEvent.submit(screen.getByTestId('reeval-form'))

    await waitFor(() => {
      expect(screen.getByTestId('subject-marks-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/submitted successfully! Ticket #GRV-ACAD-88/)).toBeInTheDocument()
  })
})
