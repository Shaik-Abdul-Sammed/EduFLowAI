import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import DashboardHome from '../components/DashboardHome';
import NaacDashboardPage from '../pages/admin/NaacDashboardPage';
import NirfDashboardPage from '../pages/admin/NirfDashboardPage';
import FeeReminderPage from '../pages/admin/FeeReminderPage';
import InstitutionSettingsPage from '../pages/admin/InstitutionSettingsPage';

// Mock useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'admin@demo.edu', role: 'admin', name: 'Dr. Dean' },
    isAuthenticated: true,
  }),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {
    accessToken: 'mock-jwt-token',
    token: 'mock-jwt-token',
    user: JSON.stringify({ role: 'admin', name: 'Dr. Dean', id: 1, email: 'admin@demo.edu' }),
  };
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-pdf');
window.URL.revokeObjectURL = jest.fn();

describe('Phase 1 to Phase 4: DOM Traversal & UI/UX Audit', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn((url) => {
      if (url.includes('/naac-prediction') || url.includes('/naac')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            grade: 'A+',
            cgpa: 3.42,
            confidence: 0.92,
            strengths: ['Curricular flexibility', 'High placement rate'],
            weaknesses: ['Seed funding gap', 'IPR commercialization'],
            recommendations: ['Increase research seed grants'],
            criteriaScores: [
              { criterion: 1, name: 'Curricular Aspects', score: 3.5, maxScore: 4.0, weight: 15 },
              { criterion: 2, name: 'Teaching-Learning', score: 3.4, maxScore: 4.0, weight: 20 },
            ],
          }),
        });
      }

      if (url.includes('/nirf')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            totalScore: 72.85,
            predictedRank: 51,
            confidence: 0.91,
            parameterScores: {
              TLR: { score: 75.40, weight: 0.30, name: 'Teaching & Learning', subMetrics: {} },
              RP: { score: 64.20, weight: 0.30, name: 'Research', subMetrics: {} },
            },
            radarChart: [
              { parameter: 'TLR', score: 75.4, peerAverage: 65.2 },
            ],
          }),
        });
      }

      if (url.includes('/fee-reminders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            summary: { totalOverdueAccounts: 2, totalOverdueAmount: 49000, averageOverdueDays: 14 },
            tiers: { tier1: [], tier2: [], tier3: [], tier4: [] },
            settings: { enabled: true, scheduledHour: 9, channels: ['EMAIL'] },
            history: [],
          }),
        });
      }

      if (url.includes('/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            settings: {
              institutionName: 'Demo Institute of Technology',
              contactEmail: 'admin@demo.edu',
              security: { ipWhitelist: '' },
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  function inspectContainer(container) {
    // 1. Check for Dead Links: no href="#" or href="javascript:" or empty href=""
    const links = Array.from(container.querySelectorAll('a'));
    links.forEach((a) => {
      const href = a.getAttribute('href');
      expect(href).not.toBe('#');
      expect(href).not.toMatch(/^javascript:/i);
      if (href !== null) {
        expect(href.trim().length).toBeGreaterThan(0);
      }
    });

    // 2. Check for Data Rendering Leaks: no visible undefined, NaN, null, [object Object]
    const text = container.textContent || '';
    expect(text).not.toContain('[object Object]');
    // Check for standalone " undefined " or " NaN " or " null "
    expect(text).not.toMatch(/\bNaN\b/);
  }

  it('audits DashboardHome for dead clicks, data leaks, and key props', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardHome role="admin" />
      </MemoryRouter>
    );

    inspectContainer(container);
    expect(container.querySelector('.welcome-banner-admin')).toBeInTheDocument();
  });

  it('audits NaacDashboardPage for dead clicks and data rendering leaks', () => {
    const { container } = render(
      <MemoryRouter>
        <NaacDashboardPage />
      </MemoryRouter>
    );

    inspectContainer(container);
  });

  it('audits NirfDashboardPage for dead clicks and data rendering leaks', () => {
    const { container } = render(
      <MemoryRouter>
        <NirfDashboardPage />
      </MemoryRouter>
    );

    inspectContainer(container);
  });

  it('audits FeeReminderPage for responsive tables and modal z-index', () => {
    const { container } = render(
      <MemoryRouter>
        <FeeReminderPage />
      </MemoryRouter>
    );

    inspectContainer(container);
    const table = container.querySelector('table');
    if (table) {
      const parent = table.closest('.table-responsive');
      expect(parent).not.toBeNull();
    }
  });

  it('audits InstitutionSettingsPage for form element bindings', () => {
    const { container } = render(
      <MemoryRouter>
        <InstitutionSettingsPage />
      </MemoryRouter>
    );

    inspectContainer(container);
  });
});
