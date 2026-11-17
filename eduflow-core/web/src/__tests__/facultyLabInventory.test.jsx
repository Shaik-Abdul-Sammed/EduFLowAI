import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LabInventoryPage from '../pages/faculty/LabInventoryPage'

const mockAddToast = jest.fn()
jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast })
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Faculty Lab Inventory Page', () => {
  it('renders loading skeleton and displays equipment inventory list', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'EQ-REP-1', reportName: 'Annual Asset Audit' }
      ]
    })

    render(
      <MemoryRouter>
        <LabInventoryPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('lab-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Quantum Optics Laser Interferometer')).toBeInTheDocument()
    })

    expect(screen.getByText('EQ-CSE-2024-012')).toBeInTheDocument()
    expect(screen.getByText(/NVIDIA RTX A6000/i)).toBeInTheDocument()
  })

  it('handles asset sync failure and allows retry', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <LabInventoryPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('lab-error')).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    fireEvent.click(screen.getByTestId('lab-retry'))

    await waitFor(() => {
      expect(screen.queryByTestId('lab-error')).not.toBeInTheDocument()
    })
  })

  it('submits a calibration/service ticket for flagged equipment', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'TCK-LAB-1', status: 'created' })
      })

    render(
      <MemoryRouter>
        <LabInventoryPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('request-repair-EQ-CSE-2022-099')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('request-repair-EQ-CSE-2022-099'))

    await waitFor(() => {
      expect(screen.getByText('Service Logged')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/support/tickets'),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
})
