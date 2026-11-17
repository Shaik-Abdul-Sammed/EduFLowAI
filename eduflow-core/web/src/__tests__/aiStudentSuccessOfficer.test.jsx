import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StudentSuccessOfficer from '../pages/ai/officers/StudentSuccessOfficer'

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'faculty', name: 'Dr. Mentor' } })
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() })
}))

const mockStart = jest.fn()
const mockStop = jest.fn()

jest.mock('../hooks/useStreamingOfficer', () => ({
  useStreamingOfficer: () => ({
    tokens: '',
    status: 'idle',
    error: null,
    start: mockStart,
    stop: mockStop
  })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe('AI Student Success Officer Page', () => {
  it('renders loading skeleton and displays hydrated cohort risk stats', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'ASG1', title: 'Data Structures Lab 1' },
        { id: 'ASG2', title: 'Algorithms Midterm' }
      ]
    })

    render(
      <MemoryRouter>
        <StudentSuccessOfficer />
      </MemoryRouter>
    )

    expect(screen.getByTestId('student-success-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('student-success-stats')).toBeInTheDocument()
    })

    expect(screen.getByText('AI Student Success Officer')).toBeInTheDocument()
    expect(screen.getByText('Total Scanned')).toBeInTheDocument()
    expect(screen.getByText('30 Students')).toBeInTheDocument()
  })

  it('handles error state and provides retry action', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <StudentSuccessOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('student-success-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('student-success-retry'))

    await waitFor(() => {
      expect(screen.getByTestId('student-success-stats')).toBeInTheDocument()
    })
  })

  it('triggers prompt execution on suggested prompt click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <MemoryRouter>
        <StudentSuccessOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('AI Student Success Officer')).toBeInTheDocument()
    })

    const promptBtn = screen.getByText('Run early academic support risk analysis for semester 4')
    fireEvent.click(promptBtn)

    expect(mockStart).toHaveBeenCalled()
  })
})
