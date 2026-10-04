import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NaacDashboardPage from '../pages/admin/NaacDashboardPage';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {
    token: 'fake-admin-jwt-token',
    user: JSON.stringify({ role: 'admin', name: 'Dr. Admin' }),
  };
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL.createObjectURL and URL.revokeObjectURL
window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-pdf');
window.URL.revokeObjectURL = jest.fn();

describe('NaacDashboardPage Component', () => {
  beforeEach(() => {
    jest.setTimeout(15000);
    jest.clearAllMocks();

    global.fetch = jest.fn((url) => {
      if (url.includes('/naac-prediction')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            grade: 'A+',
            cgpa: 3.42,
            confidence: 0.85,
            criteriaScores: [
              { criterion: 1, name: 'Curricular Aspects', maxScore: 100, rawScore: 85, score: 3.4, percentage: 85.0 },
              { criterion: 2, name: 'Teaching-Learning and Evaluation', maxScore: 350, rawScore: 298, score: 3.41, percentage: 85.1 },
              { criterion: 3, name: 'Research, Innovations and Extension', maxScore: 110, rawScore: 82, score: 2.98, percentage: 74.5 },
              { criterion: 4, name: 'Infrastructure and Learning Resources', maxScore: 100, rawScore: 88, score: 3.52, percentage: 88.0 },
              { criterion: 5, name: 'Student Support and Progression', maxScore: 130, rawScore: 102, score: 3.14, percentage: 78.5 },
              { criterion: 6, name: 'Governance, Leadership and Management', maxScore: 100, rawScore: 84, score: 3.36, percentage: 84.0 },
              { criterion: 7, name: 'Institutional Values and Best Practices', maxScore: 100, rawScore: 86, score: 3.44, percentage: 86.0 },
            ],
            strengths: [
              'Teaching-Learning & Evaluation (Student-Faculty ratio 14.7:1 with 47% PhD faculty)',
              'Infrastructure & Learning Resources (120 smart classrooms, 45 labs, and 12,000 sqft library)',
              'Institutional Values & Best Practices (Exemplary eco-campus and community outreach initiatives)',
            ],
            weaknesses: [
              'Research Publications (Scopus indexed papers per faculty currently at 3.1, benchmark target >4.5)',
              'Student Placements (Current placement rate at 62%, recommended target is >80%)',
              'Doctoral Faculty Cadre (Current PhD ratio is 47%, target is minimum 60% for highest grade tier)',
            ],
            recommendations: [
              'Provide seed grants for faculty journal publications and patent filings.',
              'Establish corporate partnership tie-ups for higher dream placement conversions.',
              'Facilitate PhD completion sabbaticals for teaching faculty.',
            ],
          }),
        });
      }

      if (url.includes('/export-pdf')) {
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['%PDF-1.4 test data'], { type: 'application/pdf' })),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  test('Dashboard renders grade prediction card', async () => {
    render(
      <MemoryRouter>
        <NaacDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('grade-prediction-card')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('predicted-grade')).toHaveTextContent('A+');
      expect(screen.getByTestId('predicted-cgpa')).toHaveTextContent('3.42');
      expect(screen.getByTestId('prediction-confidence')).toHaveTextContent('85%');
    });
  });

  test('Criteria grid shows 7 cards', async () => {
    render(
      <MemoryRouter>
        <NaacDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('criteria-scores-grid')).toBeInTheDocument();
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByTestId(`criterion-card-${i}`)).toBeInTheDocument();
    }
  });

  test('Strengths and weaknesses sections render', async () => {
    render(
      <MemoryRouter>
        <NaacDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('strengths-weaknesses-section')).toBeInTheDocument();
    expect(screen.getByTestId('strengths-column')).toBeInTheDocument();
    expect(screen.getByTestId('weaknesses-column')).toBeInTheDocument();
    expect(screen.getByText(/Top 3 Institutional Strengths/i)).toBeInTheDocument();
    expect(screen.getByText(/Top 3 Weaknesses & Recommendations/i)).toBeInTheDocument();
  });

  test('Refresh prediction calls the API', async () => {
    render(
      <MemoryRouter>
        <NaacDashboardPage />
      </MemoryRouter>
    );

    const refreshBtn = screen.getByTestId('refresh-prediction-button');
    expect(refreshBtn).toBeInTheDocument();

    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/demo/naac-prediction'),
        expect.any(Object)
      );
    });
  });

  test('Download PDF button triggers download', async () => {
    render(
      <MemoryRouter>
        <NaacDashboardPage />
      </MemoryRouter>
    );

    const downloadBtn = screen.getByTestId('download-grade-report-button');
    expect(downloadBtn).toBeInTheDocument();

    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/officers/naac-grade-report/export-pdf'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
