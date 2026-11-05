import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import OfficersDashboard from '../pages/ai/OfficersDashboard'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('OfficersDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('accessToken', 'mock-admin-token')

    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url)
      if (u.includes('/v1/officers/roi/summary')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ totalHoursSaved: 0, totalMoneySaved: 0, byOfficer: [] }),
        })
      }
      if (u.includes('/v1/officers')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            officers: [
              { id: 'accreditation', status: 'available', lastAction: 'No recent activity' },
              { id: 'timetable', status: 'available', lastAction: 'No recent activity' },
              { id: 'admissions', status: 'available', lastAction: 'No recent activity' },
              { id: 'finance', status: 'available', lastAction: 'No recent activity' },
              { id: 'student-success', status: 'available', lastAction: 'No recent activity' },
            ],
            recentActivity: []
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({}),
      })
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('detects and displays history from local sessions on the dashboard', async () => {
    const mockHistory = [
      { id: 1, prompt: 'Shift from Traditional to Participative Pedagogy (Metric 2.3)', preview: 'Metric 2.3 Pedagogy', timestamp: '09:14 AM' },
      { id: 2, prompt: 'Audit Faculty Research Publications and Patents', preview: 'Research Patents Audit', timestamp: '09:10 AM' }
    ]
    localStorage.setItem('officer_history_accreditation', JSON.stringify(mockHistory))

    render(
      <MemoryRouter>
        <OfficersDashboard />
      </MemoryRouter>
    )

    await waitForElementToBeRemoved(() => screen.queryByText('Loading Officers...'))

    // Expect prompts counter and View History button with count
    expect(screen.getByText('2 Prompts')).toBeInTheDocument()
    const viewHistBtn = screen.getByRole('button', { name: /view history \(2\)/i })
    expect(viewHistBtn).toBeInTheDocument()

    // Expect the history prompt to appear under Recent AI Activity
    expect(screen.getByText('Metric 2.3 Pedagogy')).toBeInTheDocument()

    // Click View History (2) to open modal
    fireEvent.click(viewHistBtn)

    await waitFor(() => {
      expect(screen.getByText(/AI Accreditation Officer — Session History/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Shift from Traditional to Participative Pedagogy (Metric 2.3)')).toBeInTheDocument()
    expect(screen.getByText('2 Saved Prompts & Generations')).toBeInTheDocument()
  })
})
