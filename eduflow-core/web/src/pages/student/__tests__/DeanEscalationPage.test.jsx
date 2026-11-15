import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import DeanEscalationPage from '../DeanEscalationPage';
import { AuthContext } from '../../../context/AuthContext';

const mockAuthContext = {
  user: { id: 42, role: 'student', name: 'Aarav Sharma' },
  token: 'mock-student-token'
};

function renderWithAuth(ui) {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {ui}
    </AuthContext.Provider>
  );
}

describe('DeanEscalationPage Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders escalation page header and submission form', () => {
    renderWithAuth(<DeanEscalationPage />);

    expect(screen.getByText(/Student Dean & Faculty Escalation Portal/i)).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('priority-select')).toBeInTheDocument();
    expect(screen.getByTestId('subject-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-escalation-btn')).toBeInTheDocument();
  });

  it('renders preloaded escalations with status badges', () => {
    renderWithAuth(<DeanEscalationPage />);

    expect(screen.getByText(/ESC-2026-081/i)).toBeInTheDocument();
    expect(screen.getByText(/Under Dean Review/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC-2026-042/i)).toBeInTheDocument();
    expect(screen.getByText(/Resolved/i)).toBeInTheDocument();
  });

  it('displays real-time AI preview when description is entered', () => {
    renderWithAuth(<DeanEscalationPage />);

    const descInput = screen.getByTestId('description-input');
    fireEvent.change(descInput, { 
      target: { value: 'There is severe harassment and anti-ragging violation in the hostel block.' } 
    });

    const preview = screen.getByTestId('ai-preview-badge');
    expect(preview).toBeInTheDocument();
    expect(within(preview).getAllByText(/CRITICAL/i).length).toBeGreaterThanOrEqual(1);
  });

  it('submits a new escalation and prepends it to the list', async () => {
    renderWithAuth(<DeanEscalationPage />);

    const subjectInput = screen.getByTestId('subject-input');
    const descInput = screen.getByTestId('description-input');
    const submitBtn = screen.getByTestId('submit-escalation-btn');

    fireEvent.change(subjectInput, { target: { value: 'Lab attendance dispute with external evaluator' } });
    fireEvent.change(descInput, { target: { value: 'External examiner marked absence despite biometric attendance logging.' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Lab attendance dispute with external evaluator/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('filters escalations by category', () => {
    renderWithAuth(<DeanEscalationPage />);

    const filterSelect = screen.getByTestId('category-filter');
    fireEvent.change(filterSelect, { target: { value: 'INFRASTRUCTURE' } });

    expect(screen.queryByText(/ESC-2026-081/i)).not.toBeInTheDocument();
    expect(screen.getByText(/ESC-2026-042/i)).toBeInTheDocument();
  });
});
