import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TimetableOfficer from '../pages/ai/officers/TimetableOfficer'

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'admin', name: 'Vice Chancellor' } })
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

describe('AI Timetable Officer Page', () => {
  it('renders loading skeleton and displays hydrated timetable metrics', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'TT1', department: 'Computer Science', semester: 4 },
        { id: 'TT2', department: 'Electronics', semester: 6 }
      ]
    })

    render(
      <MemoryRouter>
        <TimetableOfficer />
      </MemoryRouter>
    )

    expect(screen.getByTestId('timetable-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('timetable-stats')).toBeInTheDocument()
    })

    expect(screen.getByText('AI Timetable Officer')).toBeInTheDocument()
    expect(screen.getByText('Departments')).toBeInTheDocument()
    expect(screen.getByText('2 Covered')).toBeInTheDocument()
  })

  it('handles error state and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <TimetableOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('timetable-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('timetable-retry'))

    await waitFor(() => {
      expect(screen.getByTestId('timetable-stats')).toBeInTheDocument()
    })
  })

  it('triggers prompt execution on suggested prompt click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <MemoryRouter>
        <TimetableOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('AI Timetable Officer')).toBeInTheDocument()
    })

    const promptBtn = screen.getByText('Generate conflict-free timetable for CSE Department')
    fireEvent.click(promptBtn)

    expect(mockStart).toHaveBeenCalled()
  })
})
