import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FacultyQuestionBankUpload from '../pages/faculty/questionBankUpload'

describe('FacultyQuestionBankUpload Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders loading skeleton and displays question bank repository', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            exams: [
              {
                id: 1,
                course_id: 'PHY101',
                questions: [
                  {
                    id: 'q1',
                    question: 'State Newton second law of motion in vector form.',
                    marks: 4
                  }
                ]
              }
            ]
          })
      })
    )

    render(
      <BrowserRouter>
        <FacultyQuestionBankUpload />
      </BrowserRouter>
    )

    expect(screen.getByTestId('question-bank-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('question-bank-loading')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Question Bank Upload')).toBeInTheDocument()
    expect(screen.getByText('Total Questions')).toBeInTheDocument()
    expect(screen.getByText(/State Newton second law of motion/)).toBeInTheDocument()
    expect(screen.getByText('4 Marks')).toBeInTheDocument()
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
        <FacultyQuestionBankUpload />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('question-bank-error')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to Load Question Bank')).toBeInTheDocument()

    // Successful retry
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            exams: []
          })
      })
    )

    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('question-bank-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Total Questions')).toBeInTheDocument()
  })

  test('uploads question and triggers success toast notification', async () => {
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              ticket: { id: 'QB-991' }
            })
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
        <FacultyQuestionBankUpload />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('question-bank-loading')).not.toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-upload-btn')
    fireEvent.click(openBtn)

    expect(screen.getByTestId('upload-question-form')).toBeInTheDocument()

    const submitBtn = screen.getByTestId('submit-question-btn')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('qb-toast')).toBeInTheDocument()
    })
    expect(screen.getByText(/Question uploaded successfully to Physics bank! Ticket #QB-991/)).toBeInTheDocument()
  })
})
