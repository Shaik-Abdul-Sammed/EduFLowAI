import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdmissionOfficer from '../pages/ai/officers/AdmissionOfficer'

// Mock useAuth and ToastContext
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'admin', name: 'Dr. Principal' } })
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

describe('AI Admissions Officer Page', () => {
  it('renders loading state initially and then displays live admission funnel metrics', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'APP1', applicantName: 'Aditi Rao', course: 'CSE', status: 'Applied' },
        { id: 'APP2', applicantName: 'Karan Patel', course: 'ECE', status: 'Shortlisted' },
        { id: 'APP3', applicantName: 'Sneha Verma', course: 'CSE', status: 'Approved' }
      ]
    })

    render(
      <MemoryRouter>
        <AdmissionOfficer />
      </MemoryRouter>
    )

    // Verify loading indicator
    expect(screen.getByTestId('admissions-loading')).toBeInTheDocument()

    // Wait for hydration
    await waitFor(() => {
      expect(screen.getByTestId('admissions-stats')).toBeInTheDocument()
    })

    expect(screen.getByText('AI Admissions Officer')).toBeInTheDocument()
    expect(screen.getByText('Applications')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('handles backend error state and allows user retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <AdmissionOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('admissions-error')).toBeInTheDocument()
    })

    // Mock successful retry
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'APP1', applicantName: 'Aditi Rao', course: 'CSE', status: 'Applied' }
      ]
    })

    fireEvent.click(screen.getByTestId('admissions-retry'))

    await waitFor(() => {
      expect(screen.getByTestId('admissions-stats')).toBeInTheDocument()
    })
  })

  it('triggers prompt execution via suggested prompt interaction', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <MemoryRouter>
        <AdmissionOfficer />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('AI Admissions Officer')).toBeInTheDocument()
    })

    // Click on one of the suggested prompts or action buttons
    const promptButton = screen.getByText('Analyze application yield and predict final enrollment')
    fireEvent.click(promptButton)

    expect(mockStart).toHaveBeenCalled()
  })
})
