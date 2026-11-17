import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Page from '../pages/student/CourseFeedbackPage'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Student Course Feedback Page', () => {
  it('renders loading state and fetches course list from backend', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        marks: [
          { subject: 'Software Architecture & Design' },
          { subject: 'Cloud Computing Services' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    expect(screen.getByTestId('course-feedback-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Software Architecture & Design/)).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Backend connection refused'))

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('course-feedback-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('submits anonymous evaluation via grievances backend endpoint', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          marks: [{ subject: 'Advanced Algorithms' }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, grievance: { id: 777 } })
      })

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('course-feedback-loading')).not.toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText(/share specific suggestions/i)
    fireEvent.change(textarea, { target: { value: 'Excellent problem solving sessions and interactive code reviews.' } })

    const starBtn = screen.getByLabelText('5 Stars')
    fireEvent.click(starBtn)

    const submitBtn = screen.getByRole('button', { name: /submit anonymous feedback/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/grievances',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Course Evaluation')
        })
      )
    })
  })
})
