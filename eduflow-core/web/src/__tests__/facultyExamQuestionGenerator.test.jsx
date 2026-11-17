import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExamQuestionGeneratorPage from '../pages/faculty/ExamQuestionGeneratorPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Faculty Exam Question Generator Page', () => {
  it('renders loading skeleton and displays question bank with live items', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'Q-1', questionText: 'MLFQ vs CFS' }
      ]
    })

    render(
      <MemoryRouter>
        <ExamQuestionGeneratorPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('question-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Multi-Level Feedback Queue/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Peterson’s Solution/i)).toBeInTheDocument()
    expect(screen.getByText(/Dijkstra’s Banker’s Algorithm/i)).toBeInTheDocument()
  })

  it('handles question bank error and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <ExamQuestionGeneratorPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('question-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('question-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('question-error')).not.toBeInTheDocument()
    })
  })

  it('synthesizes new exam question and appends to generated questions', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'Q-GEN', status: 'created' })
      })

    render(
      <MemoryRouter>
        <ExamQuestionGeneratorPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('topic-input')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('topic-input'), {
      target: { value: 'Distributed Transactions & 2-Phase Commit' }
    })

    fireEvent.click(screen.getByTestId('generate-question-btn'))

    await waitFor(() => {
      expect(screen.getByText(/Distributed Transactions & 2-Phase Commit/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
