import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../../pages/public/LoginPage'

const mockLogin = jest.fn(async () => ({ token: 'demo', user: { role: 'admin', name: 'Admin User' } }))
const mockNavigate = jest.fn()

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage Component in components/__tests__', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders login form and populates demo credentials', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /fill admin credentials/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /fill admin credentials/i }))

    expect(screen.getByLabelText(/email address/i)).toHaveValue('admin@demo.edu')
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('Demo@2026')
  })

  it('submits login securely with credentials', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /fill admin credentials/i }))
    await user.click(screen.getByRole('button', { name: /login securely/i }))

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'admin@demo.edu',
      username: 'admin@demo.edu',
      password: 'Demo@2026',
      institutionId: 'demo',
    })
    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard', { replace: true })
  })
})
