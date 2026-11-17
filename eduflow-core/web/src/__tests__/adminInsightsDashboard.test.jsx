import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InsightsDashboardPage from '../pages/admin/InsightsDashboardPage'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('Admin Insights Dashboard Page', () => {
  it('renders loading state and displays multi-officer health domains', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          overallHealth: 88,
          domains: [
            { name: 'accreditation', displayName: 'Accreditation Officer', currentScore: 3.65, grade: 'A++', trend: 'up' },
            { name: 'admissions', displayName: 'Admissions Officer', currentScore: 78, yield: '78%', trend: 'up' }
          ],
          topPriorities: [
            { domain: 'accreditation', domainName: 'Accreditation', issue: 'Research publications below benchmark', suggestedAction: 'Deploy faculty seed grants', urgency: 'HIGH' }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activity: [] })
      })

    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('insights-loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Accreditation Officer')).toBeInTheDocument()
      expect(screen.getByText('Admissions Officer')).toBeInTheDocument()
      expect(screen.getByText('Research publications below benchmark')).toBeInTheDocument()
    })
  })

  it('handles error state gracefully with retry button', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    })

    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('insights-error')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('triggers remediation action hitting domain improvement API', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          overallHealth: 85,
          domains: [
            { name: 'student-success', displayName: 'Student Success Officer', currentScore: 82, trend: 'stable' }
          ],
          topPriorities: [
            { domain: 'student-success', domainName: 'Student Success', issue: 'Dropout risk in CS 3rd semester', suggestedAction: 'Deploy remedial faculty mentors', urgency: 'HIGH' }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activity: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Action scheduled' })
      })

    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Deploy remedial faculty mentors')).toBeInTheDocument()
    })

    const fixBtn = screen.getByRole('button', { name: /fix this/i })
    fireEvent.click(fixBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/insights/student-success/improve'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Deploy remedial faculty mentors')
        })
      )
    })
  })
})
