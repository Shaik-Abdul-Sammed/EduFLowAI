import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AnalyticsCenterPage from '../pages/admin/analyticsCenter'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Admin Analytics Center Page', () => {
  it('renders loading state and displays institutional KPI metrics from backend', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        overall: [
          { label: 'Total Enrolled Scholars', value: '1,280', change: '+15%', color: '#2563EB', icon: '👥' }
        ],
        subjectAverages: [
          { name: 'Computer Architecture', average: 84, highest: 100, failCount: 1, stream: 'MPC' }
        ]
      })
    })

    render(
      <MemoryRouter>
        <AnalyticsCenterPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('analytics-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Total Enrolled Scholars')).toBeInTheDocument()
      expect(screen.getByText('1,280')).toBeInTheDocument()
      expect(screen.getByText('Computer Architecture')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <AnalyticsCenterPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('analytics-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('triggers report export hitting support tickets analytics category', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          overall: [{ label: 'Total Enrollment', value: '450', change: '+12%', color: '#2563EB', icon: '👥' }],
          subjectAverages: [{ name: 'Mathematics', average: 78, highest: 99, failCount: 4, stream: 'MPC' }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ticket: { id: 701 } })
      })

    render(
      <MemoryRouter>
        <AnalyticsCenterPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export audit pdf/i })).toBeInTheDocument()
    })

    const exportBtn = screen.getByRole('button', { name: /export audit pdf/i })
    fireEvent.click(exportBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/v1/support/tickets',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('analytics_export')
        })
      )
    })
  })
})
