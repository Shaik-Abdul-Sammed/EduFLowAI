import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../pages/public/LoginPage'

const mockLogin = jest.fn()
const mockNavigate = jest.fn()

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('Login page renders the logo image', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const logo = screen.getByRole('img', { name: /eduflow ai/i })
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo.svg')
  })

  test('Login page renders email and password fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  test('Login page renders "Try the Demo" card with Admin and Dean options', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/try the demo/i)).toBeInTheDocument()
    expect(screen.getByText(/for administrators/i)).toBeInTheDocument()
    expect(screen.getByText(/for college dean/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fill admin credentials/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fill dean credentials/i })).toBeInTheDocument()
  })

  test('Clicking "Fill Admin Credentials" populates email with admin@demo.edu', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillAdminBtn = screen.getByRole('button', { name: /fill admin credentials/i })
    await user.click(fillAdminBtn)

    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toHaveValue('admin@demo.edu')
  })

  test('Clicking "Fill Admin Credentials" populates password with Demo@2026', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillAdminBtn = screen.getByRole('button', { name: /fill admin credentials/i })
    await user.click(fillAdminBtn)

    const passwordInput = screen.getByLabelText(/^password$/i)
    expect(passwordInput).toHaveValue('Demo@2026')
  })

  test('Clicking "Fill Dean Credentials" populates email with s9010150809@gmail.com', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillDeanBtn = screen.getByRole('button', { name: /fill dean credentials/i })
    await user.click(fillDeanBtn)

    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toHaveValue('s9010150809@gmail.com')
  })

  test('Clicking "Fill Dean Credentials" populates phone or email correctly', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillDeanBtn = screen.getByRole('button', { name: /fill dean credentials/i })
    await user.click(fillDeanBtn)

    expect(screen.getByLabelText(/email address/i)).toHaveValue('s9010150809@gmail.com')
    expect(screen.getAllByText(/9010150809/i).length).toBeGreaterThanOrEqual(1)
  })

  test('Password visibility toggle works', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByLabelText(/^password$/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleBtn)

    expect(passwordInput).toHaveAttribute('type', 'text')

    const hideBtn = screen.getByRole('button', { name: /hide password/i })
    await user.click(hideBtn)

    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('Remember Me checkbox persists email in localStorage', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce({
      token: 'mock-token',
      user: { role: 'admin', name: 'Admin User' }
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /fill admin credentials/i }))
    const rememberMeBox = screen.getByRole('checkbox', { name: /remember me/i })
    await user.click(rememberMeBox)

    await user.click(screen.getByRole('button', { name: /login securely/i }))

    await waitFor(() => {
      expect(localStorage.getItem('eduflow_remembered_email')).toBe('admin@demo.edu')
    })
  })

  test('Network error shows "Cannot reach server" message, not "Failed to fetch"', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /fill admin credentials/i }))
    await user.click(screen.getByRole('button', { name: /login securely/i }))

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/cannot reach server/i)
      expect(alert).not.toHaveTextContent(/failed to fetch/i)
    })
  })

  test('401 response shows "Invalid email or password" message', async () => {
    const user = userEvent.setup()
    const error401 = new Error("Invalid email or password. Please check and try again. If using demo, click 'Fill Admin Credentials'.")
    mockLogin.mockRejectedValueOnce(error401)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /fill admin credentials/i }))
    await user.click(screen.getByRole('button', { name: /login securely/i }))

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/invalid email or password/i)
    })
  })
})
