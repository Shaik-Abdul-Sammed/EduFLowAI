import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TimetableUploadPage from '../pages/ai/officers/TimetableUploadPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Timetable Upload and Delta Regeneration Page', () => {
  it('loads sample timetable and regenerates schedule via backend endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', conflictsResolved: 4 })
    })

    render(
      <MemoryRouter>
        <TimetableUploadPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Load Sample Timetable')).toBeInTheDocument()

    // Click load sample
    fireEvent.click(screen.getByText('Load Sample Timetable'))

    await waitFor(() => {
      expect(screen.getByText('sample-timetable.xlsx')).toBeInTheDocument()
    })

    // Now click regenerate
    const regenBtn = screen.getByTestId('upload-regenerate-btn')
    fireEvent.click(regenBtn)

    await waitFor(() => {
      expect(screen.getByTestId('upload-comparison')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/timetable'),
      expect.objectContaining({
        method: 'POST'
      })
    )
    expect(screen.getByText(/AI Changelog/i)).toBeInTheDocument()
  })

  it('handles backend regeneration error and permits user retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <TimetableUploadPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Load Sample Timetable'))
    await waitFor(() => {
      expect(screen.getByText('sample-timetable.xlsx')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('upload-regenerate-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument()
    })

    // Retry
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' })
    })

    fireEvent.click(screen.getByTestId('upload-retry'))

    await waitFor(() => {
      expect(screen.getByTestId('upload-comparison')).toBeInTheDocument()
    })
  })
})
