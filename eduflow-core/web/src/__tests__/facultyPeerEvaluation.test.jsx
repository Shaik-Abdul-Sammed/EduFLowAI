import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PeerEvaluationPage from '../pages/faculty/PeerEvaluationPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Faculty Peer Evaluation Page', () => {
  it('renders loading skeleton and displays group evaluation teams', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'MK-1', course: 'OS Lab', score: 95 }
      ]
    })

    render(
      <MemoryRouter>
        <PeerEvaluationPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('peer-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Team Sigma (Group 7)')).toBeInTheDocument()
    })

    expect(screen.getByText('Team Delta (Group 4)')).toBeInTheDocument()
    expect(screen.getByText('Siddharth Roy')).toBeInTheDocument()
  })

  it('handles rubric sync error and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <PeerEvaluationPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('peer-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('peer-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('peer-error')).not.toBeInTheDocument()
    })
  })

  it('approves and publishes normalized rubric scores to university grade ledger', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'TCK-PEER-1', status: 'approved' })
      })

    render(
      <MemoryRouter>
        <PeerEvaluationPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('publish-marks-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('publish-marks-btn'))

    await waitFor(() => {
      expect(screen.getByText(/Normalized Scores Published/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
