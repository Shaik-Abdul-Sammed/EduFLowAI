import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CurriculumRevisionPage from '../pages/faculty/CurriculumRevisionPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Faculty Curriculum Revision Page', () => {
  it('renders loading skeleton and displays active BoS syllabus proposals', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'PROP-1', title: 'LLM Syllabus' }
      ]
    })

    render(
      <MemoryRouter>
        <CurriculumRevisionPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('curriculum-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('CS455')).toBeInTheDocument()
    })

    expect(screen.getByText('CS410')).toBeInTheDocument()
    expect(screen.getByText('CS302')).toBeInTheDocument()
  })

  it('handles sync error and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <CurriculumRevisionPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('curriculum-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('curriculum-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('curriculum-error')).not.toBeInTheDocument()
    })
  })

  it('submits a new syllabus proposal and updates proposal table', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'PROP-NEW', status: 'submitted' })
      })

    render(
      <MemoryRouter>
        <CurriculumRevisionPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('proposal-code-input')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByTestId('proposal-code-input'), { target: { value: 'CS412' } })
    fireEvent.change(screen.getByTestId('proposal-course-input'), { target: { value: 'Edge AI Systems' } })
    fireEvent.change(screen.getByTestId('proposal-change-input'), { target: { value: 'Integrate ONNX Runtime and TensorRT edge quantization' } })

    fireEvent.click(screen.getByTestId('submit-proposal-btn'))

    await waitFor(() => {
      expect(screen.getByText('CS412')).toBeInTheDocument()
      expect(screen.getByText('Edge AI Systems')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
