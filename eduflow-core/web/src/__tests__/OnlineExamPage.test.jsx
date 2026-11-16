import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import OnlineExamPage from '../pages/student/OnlineExamPage'

describe('OnlineExamPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.__mockFaceDetected = true
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete window.__mockFaceDetected
  })

  test('displays loading skeleton and renders active proctored examination', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            exams: [
              {
                id: 1,
                course_code: 'CS401',
                title: 'Operating Systems & Distributed Concurrency Mid-Term',
                duration_mins: 60,
                total_marks: 50,
                questions: [
                  {
                    id: 101,
                    text: 'Which mechanism prevents deadlock via strict resource ordering?',
                    options: [
                      'Banker Algorithm',
                      'Circular wait prevention',
                      'Hold and wait permission',
                      'Mutual exclusion relaxation'
                    ],
                    correct: 1
                  }
                ]
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <OnlineExamPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('exam-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('exam-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Operating Systems & Distributed Concurrency Mid-Term')).toBeInTheDocument()
    expect(screen.getByText('CS401')).toBeInTheDocument()
    expect(screen.getByText(/Which mechanism prevents deadlock via strict resource ordering/)).toBeInTheDocument()
    expect(screen.getByText(/Banker Algorithm/)).toBeInTheDocument()
    expect(screen.getByText('Finalize & Submit Exam')).toBeInTheDocument()
  })

  test('renders load error state and recovers on retry', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            exams: []
          })
      })
    })

    render(
      <BrowserRouter>
        <OnlineExamPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load examination/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/No examinations scheduled/i)).toBeInTheDocument()
    })
  })

  test('selects options and submits exam successfully with score evaluation', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/submit')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              submission: {
                exam_id: 1,
                title: 'Operating Systems Mid-Term',
                student_roll: 'SS26',
                score: 50,
                max_score: 50,
                status: 'EVALUATED'
              }
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            exams: [
              {
                id: 1,
                course_code: 'CS401',
                title: 'Operating Systems Mid-Term',
                duration_mins: 60,
                total_marks: 50,
                questions: [
                  {
                    id: 101,
                    text: 'Which mechanism prevents deadlock via strict resource ordering?',
                    options: ['Banker Algorithm', 'Circular wait prevention'],
                    correct: 1
                  }
                ]
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <OnlineExamPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('exam-loading')).not.toBeInTheDocument()
    })

    const optionBtn = screen.getByText(/Circular wait prevention/)
    fireEvent.click(optionBtn)

    const submitBtn = screen.getByRole('button', { name: /Finalize & Submit Exam/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('exam-result-card')).toBeInTheDocument()
      expect(screen.getByText(/Online Examination Submitted!/i)).toBeInTheDocument()
      expect(screen.getByText('50 / 50')).toBeInTheDocument()
    })
  })

  test('detects tab switch visibilitychange and logs security violation', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/violation')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, violation_id: 101 })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            exams: [
              {
                id: 1,
                course_code: 'CS401',
                title: 'Operating Systems Mid-Term',
                duration_mins: 60,
                total_marks: 50,
                questions: [
                  {
                    id: 101,
                    text: 'Question text',
                    options: ['A', 'B'],
                    correct: 0
                  }
                ]
              }
            ]
          })
      })
    })

    render(
      <BrowserRouter>
        <OnlineExamPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('exam-loading')).not.toBeInTheDocument()
    })

    // Simulate tab switch (document hidden)
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    fireEvent(document, new Event('visibilitychange'))

    await waitFor(() => {
      expect(screen.getByText(/Proctoring Violation Flagged!/i)).toBeInTheDocument()
      expect(screen.getByText(/Tab switching or leaving the active exam window is strictly forbidden/i)).toBeInTheDocument()
    })
  })
})
