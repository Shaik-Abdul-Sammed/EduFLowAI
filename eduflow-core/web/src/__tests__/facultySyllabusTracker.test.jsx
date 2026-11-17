import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultySyllabusTracker from '../pages/faculty/syllabusTracker'

describe('FacultySyllabusTracker Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays overall coverage and units', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjects: [{ code: 'PHY101', name: 'Physics' }]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultySyllabusTracker />
      </BrowserRouter>
    )

    expect(screen.getByTestId('syllabus-tracker-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('syllabus-tracker-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Syllabus Tracker')).toBeInTheDocument()
    expect(screen.getByText(/Overall Coverage/)).toBeInTheDocument()
    expect(screen.getByText('Unit-wise Breakdown')).toBeInTheDocument()
    expect(screen.getByText(/Fundamental Principles/)).toBeInTheDocument()
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
        <FacultySyllabusTracker />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('syllabus-tracker-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Syllabus Tracker')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjects: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('syllabus-tracker-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Unit-wise Breakdown')).toBeInTheDocument()
  })

  test('records progress on a unit and updates milestone', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Milestone recorded'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            subjects: []
          })
      })
    })

    render(
      <BrowserRouter>
        <FacultySyllabusTracker />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('syllabus-tracker-loading')).not.toBeInTheDocument()
    })

    const markBtn = screen.getByTestId('progress-btn-3')
    fireEvent.click(markBtn)

    await waitFor(() => {
      expect(screen.getByTestId('syllabus-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/Syllabus milestone for Physics Unit 3 updated successfully!/)).toBeInTheDocument()
  })
})
