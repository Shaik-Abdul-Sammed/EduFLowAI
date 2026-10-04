import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import NirfDashboardPage from '../pages/admin/NirfDashboardPage'

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

describe('NirfDashboardPage Component', () => {
  const mockScoreData = {
    success: true,
    totalScore: 72.85,
    predictedRank: 51,
    confidence: 0.91,
    parameterScores: {
      TLR: { score: 75.40, weight: 0.30, name: 'Teaching, Learning & Resources', subMetrics: { SS: 74, FSR: 76, FQE: 72, FRU: 78 } },
      RP: { score: 64.20, weight: 0.30, name: 'Research & Professional Practice', subMetrics: { PU: 62, QP: 66, IPR: 58, FPPP: 68 } },
      GO: { score: 79.10, weight: 0.20, name: 'Graduation Outcomes', subMetrics: { GPH: 82, GUE: 80, GMS: 74, GPHD: 72 } },
      OI: { score: 71.50, weight: 0.10, name: 'Outreach & Inclusivity', subMetrics: { RD: 68, WD: 72, ESCS: 74, PCS: 72 } },
      PR: { score: 66.00, weight: 0.10, name: 'Perception', subMetrics: { PR: 66 } },
    },
  }

  const mockPeers = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `National Institute of Tech Campus #${i + 1}`,
    nirf_rank: i + 1,
    nirfRank: i + 1,
    category: 'Engineering',
    total_score: (92 - i * 1.5).toFixed(2),
    totalScore: 92 - i * 1.5,
    tlr_score: 80,
    rp_score: 75,
    go_score: 85,
    naac_grade: 'A+',
    location_state: 'India',
    institution_type: 'NIT',
  }))

  const mockNaacCompare = {
    success: true,
    naacGrade: 'A+',
    naacCgpa: 3.42,
    nirfRank: 51,
    expectedNirfForGrade: 'Rank 35 - 85',
    actualVsExpected: 'ALIGNED',
    explanation: 'Sri Sudha Institute holds a strong NAAC A+ accreditation.',
    keyDifferences: [
      { dimension: 'Evaluation Focus', naac: 'Teaching-learning', nirf: 'Research output' },
      { dimension: 'Research Weight', naac: '15-20%', nirf: '30%' },
      { dimension: 'Perception Factor', naac: 'On-site team', nirf: 'National survey' },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn((url) => {
      const urlStr = String(url)
      if (urlStr.includes('/api/v1/nirf/score')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockScoreData,
        })
      }
      if (urlStr.includes('/api/v1/nirf/peers')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, peers: mockPeers }),
        })
      }
      if (urlStr.includes('/api/v1/nirf/compare-naac')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockNaacCompare,
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    })
  })

  test('Dashboard renders score card with total score and rank', async () => {
    render(
      <MemoryRouter>
        <NirfDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('NIRF Institutional Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Total NIRF Composite Score')).toBeInTheDocument()
      expect(screen.getAllByText(/#51/).length).toBeGreaterThan(0)
    })
  })

  test('5 parameter bars render on the dashboard', async () => {
    render(
      <MemoryRouter>
        <NirfDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/TLR/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/RP/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/GO/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/OI/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/PR/).length).toBeGreaterThan(0)
    })
  })

  test('Peer benchmarking table renders with institutions', async () => {
    render(
      <MemoryRouter>
        <NirfDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Top-Ranked Peer Institutions Benchmarking')).toBeInTheDocument()
      expect(screen.getByText(/Sri Sudha Institute of Technology/)).toBeInTheDocument()
      expect(screen.getAllByText(/National Institute of Tech Campus/).length).toBeGreaterThan(0)
    })
  })

  test('Target rank dropdown has 5 options (Top 10, 25, 50, 100, 200)', async () => {
    render(
      <MemoryRouter>
        <NirfDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Strategic NIRF Rank Advancement Blueprint')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Top 10' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Top 25' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Top 50' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Top 100' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Top 200' })).toBeInTheDocument()
    })
  })

  test('NAAC vs NIRF comparison renders correctly', async () => {
    render(
      <MemoryRouter>
        <NirfDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('NAAC vs NIRF Alignment & Discrepancy Diagnostics')).toBeInTheDocument()
      expect(screen.getByText('Current NAAC Status')).toBeInTheDocument()
      expect(screen.getAllByText('A+').length).toBeGreaterThan(0)
      expect(screen.getByText('Rank 35 - 85')).toBeInTheDocument()
    })
  })
})
