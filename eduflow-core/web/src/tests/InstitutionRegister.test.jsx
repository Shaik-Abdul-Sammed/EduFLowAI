import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InstitutionRegister from '../pages/public/InstitutionRegister';

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('InstitutionRegister 3-Step Wizard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('Renders split-screen branding panel with 3 key value props and testimonial', () => {
    render(
      <MemoryRouter>
        <InstitutionRegister />
      </MemoryRouter>
    );

    expect(screen.getByText(/Autonomous AI Campus OS/i)).toBeInTheDocument();
    expect(screen.getByText(/72-Hour NAAC SSR Drafts/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-Migration Data Connectors/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Data Sovereignty/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr\. K\. Ramanathan/i)).toBeInTheDocument();
  });

  test('Step 1: Renders campus inputs and validates before advancing', () => {
    render(
      <MemoryRouter>
        <InstitutionRegister />
      </MemoryRouter>
    );

    expect(screen.getByText(/Step 1: Campus Information/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Sri Sudha Institute of Technology/i)).toBeInTheDocument();
    expect(screen.getByText('Autonomous Engineering College')).toBeInTheDocument();
    expect(screen.getByText('1,000 - 3,000 Students')).toBeInTheDocument();

    // Click Next without entering details
    const nextBtn = screen.getByRole('button', { name: /Next: Admin Account/i });
    fireEvent.click(nextBtn);

    // Should show error and stay on Step 1
    expect(screen.getByText(/Institution name is required/i)).toBeInTheDocument();
  });

  test('Navigates through Step 1 -> Step 2 -> Step 3 and submits', async () => {
    mockRegister.mockResolvedValueOnce({
      user: { id: 1, role: 'admin' },
      token: 'mock-jwt-token',
    });

    render(
      <MemoryRouter>
        <InstitutionRegister />
      </MemoryRouter>
    );

    // Step 1: Fill in Campus Information
    const instInput = screen.getByPlaceholderText(/Sri Sudha Institute of Technology/i);
    fireEvent.change(instInput, { target: { name: 'institutionName', value: 'National College of Engineering' } });

    const cityInput = screen.getByPlaceholderText(/Bangalore, Karnataka/i);
    fireEvent.change(cityInput, { target: { name: 'cityState', value: 'Bangalore, Karnataka' } });

    // Advance to Step 2
    const nextToAdminBtn = screen.getByRole('button', { name: /Next: Admin Account/i });
    fireEvent.click(nextToAdminBtn);

    // Verify Step 2 rendered
    expect(screen.getByText(/Step 2: Administrator Account/i)).toBeInTheDocument();

    // Step 2: Fill in Admin credentials
    const adminNameInput = screen.getByPlaceholderText(/Dr\. Rajesh Kumar/i);
    fireEvent.change(adminNameInput, { target: { name: 'adminName', value: 'Dr. John Doe' } });

    const emailInput = screen.getByPlaceholderText(/principal@ssit\.edu\.in/i);
    fireEvent.change(emailInput, { target: { name: 'email', value: 'principal@nce.edu.in' } });

    const passwordInput = screen.getByPlaceholderText(/Min 8 characters/i);
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'Password@2026' } });

    const confirmPasswordInput = screen.getByPlaceholderText(/Re-enter password/i);
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'Password@2026' } });

    // Advance to Step 3
    const nextToReviewBtn = screen.getByRole('button', { name: /Next: Review & Launch/i });
    fireEvent.click(nextToReviewBtn);

    // Verify Step 3 rendered
    expect(screen.getByText(/Step 3: Review & Confirm/i)).toBeInTheDocument();
    expect(screen.getByText('National College of Engineering')).toBeInTheDocument();
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByText('principal@nce.edu.in')).toBeInTheDocument();

    // Click Submit
    const submitBtn = screen.getByRole('button', { name: /Create Campus Instance/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          institutionName: 'National College of Engineering',
          adminName: 'Dr. John Doe',
          email: 'principal@nce.edu.in',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
    });
  });

  test('Step 3: Checkbox controls submission disabled state', async () => {
    render(
      <MemoryRouter>
        <InstitutionRegister />
      </MemoryRouter>
    );

    // Fast-forward to Step 3
    fireEvent.change(screen.getByPlaceholderText(/Sri Sudha Institute of Technology/i), { target: { name: 'institutionName', value: 'Test College' } });
    fireEvent.change(screen.getByPlaceholderText(/Bangalore, Karnataka/i), { target: { name: 'cityState', value: 'Bangalore, KA' } });
    fireEvent.click(screen.getByRole('button', { name: /Next: Admin Account/i }));

    fireEvent.change(screen.getByPlaceholderText(/Dr\. Rajesh Kumar/i), { target: { name: 'adminName', value: 'Admin User' } });
    fireEvent.change(screen.getByPlaceholderText(/principal@ssit\.edu\.in/i), { target: { name: 'email', value: 'admin@test.edu' } });
    fireEvent.change(screen.getByPlaceholderText(/Min 8 characters/i), { target: { name: 'password', value: 'Password@2026' } });
    fireEvent.change(screen.getByPlaceholderText(/Re-enter password/i), { target: { name: 'confirmPassword', value: 'Password@2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Next: Review & Launch/i }));

    const termsCheckbox = screen.getByRole('checkbox', { name: /I agree to the Terms of Service/i });
    const submitBtn = screen.getByRole('button', { name: /Create Campus Instance/i });

    // Initially checked, so submit is enabled
    expect(termsCheckbox).toBeChecked();
    expect(submitBtn).not.toBeDisabled();

    // Uncheck terms
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox).not.toBeChecked();
    expect(submitBtn).toBeDisabled();

    // Re-check terms
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();
    expect(submitBtn).not.toBeDisabled();
  });

  test('Language switcher dynamically updates page text', async () => {
    render(
      <MemoryRouter>
        <InstitutionRegister />
      </MemoryRouter>
    );

    expect(screen.getByText(/Step 1: Campus Information/i)).toBeInTheDocument();

    // Switch to Hindi
    const hiBtn = screen.getByRole('button', { name: 'हिंदी' });
    fireEvent.click(hiBtn);

    expect(screen.getByText(/चरण 1: परिसर की जानकारी/i)).toBeInTheDocument();

    // Switch back to English
    const enBtn = screen.getByRole('button', { name: 'English' });
    fireEvent.click(enBtn);

    expect(screen.getByText(/Step 1: Campus Information/i)).toBeInTheDocument();
  });
});
