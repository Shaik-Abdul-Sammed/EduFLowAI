import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StudentMockTestPage from '../pages/student/StudentMockTestPage'

describe('StudentMockTestPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays loading skeleton and renders active aptitude mock assessment', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            mockTests: [
              {
                id: 1,
                title: 'Quantitative Aptitude & Logic Assessment',
                category: 'Aptitude & Logic',
                questions: [
                  {
                    id: 101,
                    text: 'If 12 men complete a project in 15 days, how many men finish in 10 days?',
                    options: ['16 men', '18 men', '20 men', '22 men'],
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
        <StudentMockTestPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('mocktest-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('mocktest-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Corporate Aptitude Diagnostic Engine')).toBeInTheDocument()
    expect(screen.getByText('Quantitative Aptitude & Logic Assessment')).toBeInTheDocument()
    expect(screen.getByText(/If 12 men complete a project/)).toBeInTheDocument()
    expect(screen.getByText(/18 men/)).toBeInTheDocument()
    expect(screen.getByText('Submit & Calculate Score')).toBeInTheDocument()
  })

  test('renders load error state and recovers on retry', async () => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'DB timeout' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            mockTests: []
          })
      })
    })

    render(
      <BrowserRouter>
        <StudentMockTestPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load assessment/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/No mock assessments available/i)).toBeInTheDocument()
    })
  })

  test('selects answer, submits assessment, and displays evaluated scorecard', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'POST' && url.includes('/submit')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              submission: {
                test_id: 1,
                score: 1,
                max_score: 1,
                percentage: 100
              },
              feedback: 'Excellent aptitude readiness!'
            })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            mockTests: [
              {
                id: 1,
                title: 'Quantitative Aptitude Assessment',
                category: 'Aptitude',
                questions: [
                  {
                    id: 101,
                    text: 'If 12 men complete in 15 days, how many finish in 10 days?',
                    options: ['16 men', '18 men'],
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
        <StudentMockTestPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('mocktest-loading')).not.toBeInTheDocument()
    })

    // Click option B (18 men)
    const optBtn = screen.getByText(/18 men/)
    fireEvent.click(optBtn)

    const submitBtn = screen.getByRole('button', { name: /Submit & Calculate Score/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('mocktest-result')).toBeInTheDocument()
      expect(screen.getByText('Aptitude Assessment Evaluated!')).toBeInTheDocument()
      expect(screen.getByText('1 / 1')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('Excellent aptitude readiness!')).toBeInTheDocument()
    })

    // Click Retake button
    const retakeBtn = screen.getByRole('button', { name: /Retake Aptitude Diagnostic/i })
    fireEvent.click(retakeBtn)

    await waitFor(() => {
      expect(screen.queryByTestId('mocktest-result')).not.toBeInTheDocument()
      expect(screen.getByText('Submit & Calculate Score')).toBeInTheDocument()
    })
  })
})
