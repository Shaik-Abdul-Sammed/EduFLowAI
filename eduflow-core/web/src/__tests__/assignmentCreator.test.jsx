import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AssignmentCreator from '../pages/faculty/assignmentCreator'

describe('assignmentCreator Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading spinner and then lists fetched assignments', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 101,
                title: 'Quantum Mechanics Problem Set',
                subject: 'Physics',
                section: 'MPC-A',
                due: '2026-06-15',
                submissions: 20,
                total: 30,
                status: 'active'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <AssignmentCreator />
      </BrowserRouter>
    )

    expect(screen.getByTestId('assignments-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('assignments-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Quantum Mechanics Problem Set')).toBeInTheDocument()
    expect(screen.getByText(/20\/30/)).toBeInTheDocument()
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  test('creates and publishes new assignment via API', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              assignment: {
                id: 202,
                title: 'Electromagnetism Lab 1',
                subject: 'Physics',
                section: 'MPC-A',
                due: '2026-06-20',
                description: 'Solve all boundary condition derivations.',
                maxMarks: 15,
                submissions: 0,
                total: 32,
                status: 'active'
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: []
          })
      })
    })

    render(
      <BrowserRouter>
        <AssignmentCreator />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/No assignments published yet/i)).toBeInTheDocument()
    })

    const newBtn = screen.getByRole('button', { name: /\+ New Assignment/i })
    fireEvent.click(newBtn)

    expect(screen.getByText(/📝 New Assignment/i)).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText(/e\.g\. Thermodynamics Problem Set/i)
    fireEvent.change(titleInput, { target: { value: 'Electromagnetism Lab 1' } })

    const dueInput = screen.getByLabelText(/DUE DATE \*/i)
    fireEvent.change(dueInput, { target: { value: '2026-06-20' } })

    const form = screen.getByRole('button', { name: /📤 Publish Assignment/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('assignment-created-alert')).toBeInTheDocument()
      expect(screen.getByText('Electromagnetism Lab 1')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/academics/assignments'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Electromagnetism Lab 1')
      })
    )
  })

  test('displays error message when assignment creation fails', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Due date cannot be in the past' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: []
          })
      })
    })

    render(
      <BrowserRouter>
        <AssignmentCreator />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/No assignments published yet/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /\+ New Assignment/i }))

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Thermodynamics Problem Set/i), {
      target: { value: 'Past Due Assignment' }
    })
    fireEvent.change(screen.getByLabelText(/DUE DATE \*/i), {
      target: { value: '2026-05-01' }
    })

    const form = screen.getByRole('button', { name: /📤 Publish Assignment/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/Due date cannot be in the past/i)).toBeInTheDocument()
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
            assignments: [
              {
                id: 301,
                title: 'Retried Assignment',
                subject: 'Chemistry',
                section: 'MPC-B',
                due: '2026-06-30',
                submissions: 10,
                total: 25,
                status: 'active'
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <AssignmentCreator />
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
