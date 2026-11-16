import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentAssignments from '../pages/student/assignments'

describe('Student assignments Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading spinner and then renders fetched student assignments', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 1,
                title: 'Wave Optics Problem Set',
                subject: 'Physics',
                faculty: 'Dr. Raman',
                due: '2026-12-01',
                description: 'Solve Young double slit problems.',
                maxMarks: 10,
                status: 'active'
              }
            ],
            submissions: {}
          })
      })
    )

    render(
      <BrowserRouter>
        <StudentAssignments />
      </BrowserRouter>
    )

    expect(screen.getByTestId('student-assignments-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('student-assignments-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Wave Optics Problem Set')).toBeInTheDocument()
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /📤 Submit Assignment/i })).toBeInTheDocument()
  })

  test('submits student assignment and shows submitted status and toast', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              submission: {
                assignmentId: 1,
                submittedOn: '16/11/2026',
                score: null,
                feedback: null
              }
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
                id: 1,
                title: 'Thermodynamics Tutorial',
                subject: 'Physics',
                faculty: 'Dr. Raman',
                due: '2026-12-10',
                description: 'Carnot engine efficiency problems.',
                maxMarks: 20,
                status: 'active'
              }
            ],
            submissions: {}
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentAssignments />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Thermodynamics Tutorial')).toBeInTheDocument()
    })

    const submitBtn = screen.getByRole('button', { name: /📤 Submit Assignment/i })
    fireEvent.click(submitBtn)

    const noteInput = screen.getByPlaceholderText(/Add a note for your faculty/i)
    fireEvent.change(noteInput, { target: { value: 'Completed questions 1 to 5' } })

    const confirmBtn = screen.getByRole('button', { name: /📤 Confirm Submit/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByTestId('assignment-toast')).toBeInTheDocument()
      expect(screen.getByText(/Submitted on 16\/11\/2026/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/academics/assignments/1/submit'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Completed questions 1 to 5')
      })
    )
  })

  test('displays error alert when submission fails', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Assignment submission deadline has passed' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 2,
                title: 'Past Assignment',
                subject: 'Maths',
                faculty: 'Prof. Rao',
                due: '2026-05-01',
                maxMarks: 10,
                status: 'active'
              }
            ],
            submissions: {}
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentAssignments />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Past Assignment')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /📤 Submit Assignment/i }))
    fireEvent.click(screen.getByRole('button', { name: /📤 Confirm Submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Assignment submission deadline has passed/i)).toBeInTheDocument()
    })
  })

  test('displays error alert on initial fetch failure and retries successfully', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({ ok: false, status: 500 })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 3,
                title: 'Retried Assignment',
                subject: 'Chemistry',
                faculty: 'Dr. Rao',
                due: '2026-12-15',
                maxMarks: 15,
                status: 'active'
              }
            ],
            submissions: {}
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentAssignments />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load assignments/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Retried Assignment')).toBeInTheDocument()
    })
  })
})
