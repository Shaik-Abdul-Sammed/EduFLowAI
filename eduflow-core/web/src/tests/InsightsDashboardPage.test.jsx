import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InsightsDashboardPage from '../pages/admin/InsightsDashboardPage'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {
    accessToken: 'mock-admin-token',
    user: JSON.stringify({ role: 'admin', name: 'Dr. Dean' }),
  }
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('InsightsDashboardPage Component', () => {
  const mockDashboardData = {
    success: true,
    overallHealth: 82,
    domains: [
      { name: 'accreditation', displayName: 'Accreditation Officer', currentScore: 3.42, grade: 'A+', trend: 'up' },
      { name: 'student-success', displayName: 'Student Success Officer', currentScore: 82, riskLevel: 'medium', trend: 'stable' },
      { name: 'timetable', displayName: 'Timetable Officer', currentScore: 94, conflicts: 0, trend: 'up' },
      { name: 'admissions', displayName: 'Admissions Officer', currentScore: 72, yield: '72 percent', trend: 'up' },
      { name: 'finance', displayName: 'Finance Officer', currentScore: 88, defaulters: 14, trend: 'down' },
    ],
    topPriorities: [
      { domain: 'student-success', domainName: 'Student Success', issue: '48 students at high dropout risk', suggestedAction: 'Deploy remedial mentors', urgency: 'HIGH' },
      { domain: 'accreditation', domainName: 'Accreditation', issue: 'Criterion 3 publications below threshold', suggestedAction: 'Allocate seed grants', urgency: 'HIGH' },
      { domain: 'finance', domainName: 'Finance', issue: 'GST mismatch detected in lease', suggestedAction: 'File GSTR-1 rectification', urgency: 'MEDIUM' },
    ],
    lastUpdated: new Date().toISOString(),
  }

  const mockActivityData = {
    success: true,
    activity: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      officer_domain: i % 2 === 0 ? 'accreditation' : 'student-success',
      insight_type: 'predict',
      output_data: { summary: `Simulated run #${i + 1} completed.` },
      created_at: new Date(Date.now() - i * 60000).toISOString(),
    })),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    global.fetch = jest.fn((url) => {
      const urlStr = String(url)
      if (urlStr.includes('/api/v1/insights/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData),
        })
      }
      if (urlStr.includes('/api/v1/insights/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActivityData),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })
  })

  test('Renders 5 domain cards', async () => {
    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('domain-card-accreditation')).toBeInTheDocument()
      expect(screen.getByTestId('domain-card-student-success')).toBeInTheDocument()
      expect(screen.getByTestId('domain-card-timetable')).toBeInTheDocument()
      expect(screen.getByTestId('domain-card-admissions')).toBeInTheDocument()
      expect(screen.getByTestId('domain-card-finance')).toBeInTheDocument()
    })
  })

  test('Overall health gauge renders with score', async () => {
    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      const gauge = screen.getByTestId('health-gauge')
      expect(gauge).toBeInTheDocument()
      expect(gauge).toHaveTextContent('82')
    })
  })

  test('Top priorities section shows 3 items', async () => {
    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('priority-card-0')).toBeInTheDocument()
      expect(screen.getByTestId('priority-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('priority-card-2')).toBeInTheDocument()
      expect(screen.getByText(/48 students at high dropout risk/i)).toBeInTheDocument()
    })
  })

  test('Clicking a domain card navigates to detail page', async () => {
    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('open-domain-accreditation')).toBeInTheDocument()
    })

    const openBtn = screen.getByTestId('open-domain-accreditation')
    fireEvent.click(openBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard/insights/accreditation')
  })

  test('Recent activity table renders last 20 runs', async () => {
    render(
      <MemoryRouter>
        <InsightsDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      const table = screen.getByTestId('activity-table')
      expect(table).toBeInTheDocument()
      const rows = table.querySelectorAll('tbody tr')
      expect(rows.length).toBe(20)
    })
  })
})
