import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NaacAiAnalysisPage from '../pages/admin/NaacAiAnalysisPage'

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

window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-pdf')
window.URL.revokeObjectURL = jest.fn()

describe('NaacAiAnalysisPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.fetch = jest.fn((url) => {
      const urlStr = String(url)

      if (urlStr.includes('/api/v1/naac/dashboard-insights')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              currentPredictedGrade: 'A+',
              predictedCgpa: 3.38,
              visitReadinessScore: 82,
              topImprovementActions: ['Action 1', 'Action 2', 'Action 3'],
              topEvidenceGaps: ['Gap 1', 'Gap 2', 'Gap 3'],
              lastUpdateTimestamp: new Date().toISOString(),
            }),
        })
      }

      if (urlStr.includes('/api/v1/naac/explain')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              criterionNumber: 1,
              explanation: {
                summary: ['Point 1', 'Point 2', 'Point 3'],
                glossary: [{ term: 'CBCS', meaning: 'Choice Based Credit System' }],
                keyMetrics: [{ metric: 'Revision', value: '25%', why: 'Relevance' }],
                weakClaims: [{ claim: 'High satisfaction', issue: 'Needs logs' }],
                evidenceSuggestions: ['Provide BoS minutes'],
              },
            }),
        })
      }

      if (urlStr.includes('/api/v1/naac/predict-visit')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              institutionId: 1,
              prediction: {
                predictedScore: 3.42,
                predictedGrade: 'A+',
                predictedCGPA: 3.42,
                confidence: 0.88,
                peerTeamStrengths: ['Strength 1', 'Strength 2'],
                peerTeamConcerns: [{ concern: 'Concern 1', severity: 'medium' }],
                likelyQuestions: ['Question 1'],
                evidenceToPrepare: ['Document 1'],
                readinessScore: 85,
                recommendationSummary: 'Strong readiness',
              },
            }),
        })
      }

      if (urlStr.includes('/api/v1/naac/improvement-plan')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              institutionId: 1,
              plan: {
                currentCgpa: 3.38,
                targetCgpa: 3.51,
                gap: 0.13,
                priorityCriteria: [],
                quickWins: ['Quick win 1'],
                mediumTerm: ['Medium 1'],
                longTerm: ['Long 1'],
                realisticTargetDate: '12 Months',
                effortLevel: 'medium',
                estimatedTotalInvestment: '₹15,00,000',
              },
            }),
        })
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    })
  })

  test('Page renders insights summary card', async () => {
    render(
      <MemoryRouter>
        <NaacAiAnalysisPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('insights-summary-card')).toBeInTheDocument()
    })

    expect(screen.getByText(/Current Predicted Grade/i)).toBeInTheDocument()
    expect(screen.getByText(/Visit Readiness Score/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Refresh Insights/i })).toBeInTheDocument()
  })

  test('Explain button triggers API call', async () => {
    render(
      <MemoryRouter>
        <NaacAiAnalysisPage />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/Paste your Self-Study Report narrative here/i)
    fireEvent.change(textarea, { target: { value: 'Sample SSR section for Criterion 1 testing.' } })

    const explainBtn = screen.getByRole('button', { name: /Explain This Section/i })
    fireEvent.click(explainBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/naac/explain'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  test('Visit predictor button triggers API call', async () => {
    render(
      <MemoryRouter>
        <NaacAiAnalysisPage />
      </MemoryRouter>
    )

    const predictBtn = screen.getByRole('button', { name: /Predict My Visit Outcome/i })
    fireEvent.click(predictBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/naac/predict-visit'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  test('Improvement plan dropdown has 7 grade options', async () => {
    render(
      <MemoryRouter>
        <NaacAiAnalysisPage />
      </MemoryRouter>
    )

    const select = screen.getByLabelText(/Select Target Grade/i)
    expect(select).toBeInTheDocument()

    const options = select.querySelectorAll('option')
    expect(options.length).toBe(7)

    const optionValues = Array.from(options).map((opt) => opt.value)
    expect(optionValues).toEqual(['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'])
  })

  test('Historical insights table renders past analyses', async () => {
    render(
      <MemoryRouter>
        <NaacAiAnalysisPage />
      </MemoryRouter>
    )

    const table = screen.getByTestId('historical-insights-table')
    expect(table).toBeInTheDocument()
    expect(screen.getByText(/Historical Insights & Analyses/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Criterion 3/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Past Executions Log/i)).toBeInTheDocument()
  })
})
