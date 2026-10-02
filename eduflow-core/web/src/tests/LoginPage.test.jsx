import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  test('Renders username/email and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
  })

  test('Submitting empty form shows validation error', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const userInput = screen.getByPlaceholderText(/username/i)
    const passInput = screen.getByPlaceholderText(/••••••••/i)

    fireEvent.change(userInput, { target: { value: '' } })
    fireEvent.change(passInput, { target: { value: '' } })

    const submitBtn = screen.getByRole('button', { name: /login/i })
    const form = submitBtn.closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/required/i)
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  test('Valid credentials trigger auth context login and redirect', async () => {
    mockLogin.mockResolvedValueOnce({ user: { role: 'admin' } })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const userInput = screen.getByPlaceholderText(/username/i)
    const passInput = screen.getByPlaceholderText(/••••••••/i)

    fireEvent.change(userInput, { target: { value: 'admin@demo.edu' } })
    fireEvent.change(passInput, { target: { value: 'Demo@2026' } })

    const submitBtn = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        role: 'student',
        username: 'admin@demo.edu',
        password: 'Demo@2026',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard', { replace: true })
    })
  })

  test('Invalid credentials show error toast', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const userInput = screen.getByPlaceholderText(/username/i)
    const passInput = screen.getByPlaceholderText(/••••••••/i)

    fireEvent.change(userInput, { target: { value: 'bad@user.com' } })
    fireEvent.change(passInput, { target: { value: 'wrongpass' } })

    const submitBtn = screen.getByRole('button', { name: /login/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Invalid email or password/i)
    })
  })

  test('Remember me checkbox state persists in localStorage', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const checkbox = screen.getByLabelText(/remember me/i)
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(localStorage.getItem('eduflow_remember_me')).toBe('true')

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(localStorage.getItem('eduflow_remember_me')).toBe('false')
  })
})
