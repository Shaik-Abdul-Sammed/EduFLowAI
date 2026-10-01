import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';

// Mock the authService
jest.mock('../../services/authService', () => ({
  loginWithRole: jest.fn((credentials) => {
    return Promise.resolve({
      user: { email: credentials.email, role: 'user' },
      token: 'mock-token-123'
    });
  })
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{user?.email || 'No User'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
  });

  it('should authenticate user on login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });

  it('should set user email after login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should logout user', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
    });
  });

  it('should persist auth state to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      const stored = localStorage.getItem('eduflow-ai-auth');
      expect(stored).not.toBeNull();
      const auth = JSON.parse(stored);
      expect(auth.token).toBe('mock-token-123');
    });
  });

  it('should restore auth state from localStorage', () => {
    const mockAuth = {
      user: { email: 'restored@example.com', role: 'admin' },
      token: 'restored-token'
    };
    localStorage.setItem('eduflow-ai-auth', JSON.stringify(mockAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('restored@example.com');
  });

  it('should clear localStorage on logout', async () => {
    const user = userEvent.setup();
    const mockAuth = {
      user: { email: 'test@example.com', role: 'user' },
      token: 'test-token'
    };
    localStorage.setItem('eduflow-ai-auth', JSON.stringify(mockAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(localStorage.getItem('eduflow-ai-auth')).not.toBeNull();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(localStorage.getItem('eduflow-ai-auth')).toBeNull();
    });
  });
});
