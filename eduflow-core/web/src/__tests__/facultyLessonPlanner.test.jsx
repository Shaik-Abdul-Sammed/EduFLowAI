import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyLessonPlanner from '../pages/faculty/lessonPlanner'

describe('FacultyLessonPlanner Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays lesson plans by subject', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            assignments: [
              {
                id: 'LP-1',
                title: 'Introduction to Derivatives',
                description: 'Textbook Chapter 5'
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyLessonPlanner />
      </BrowserRouter>
    )

    expect(screen.getByTestId('lesson-planner-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('lesson-planner-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Lesson Planner')).toBeInTheDocument()
    expect(screen.getAllByText('Mathematics').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Introduction to Derivatives')).toBeInTheDocument()
    expect(screen.getByText(/Textbook Chapter 5/)).toBeInTheDocument()
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
        <FacultyLessonPlanner />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('lesson-planner-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Lesson Plans')).toBeInTheDocument()

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
      expect(screen.queryByTestId('lesson-planner-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Syllabus Modules/)).toBeInTheDocument()
  })

  test('adds a new lesson topic and shows toast notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Lesson added'
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
        <FacultyLessonPlanner />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('lesson-planner-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-add-lesson-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('lesson-form')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-lesson-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('lesson-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/saved successfully for Mathematics!/)).toBeInTheDocument()
  })
})
