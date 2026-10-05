import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../pages/public/LoginPage'

const mockLogin = jest.fn().mockResolvedValue({ user: { role: 'admin' } })
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

describe('Dean Login Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('Clicking "Fill Dean Credentials" populates the email field with s9010150809@gmail.com', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillDeanBtn = screen.getByRole('button', { name: /fill dean credentials/i })
    fireEvent.click(fillDeanBtn)

    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput.value).toBe('s9010150809@gmail.com')
  })

  test('Clicking "Fill Dean Credentials" populates the password field with Demo@2026', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillDeanBtn = screen.getByRole('button', { name: /fill dean credentials/i })
    fireEvent.click(fillDeanBtn)

    const passwordInput = screen.getByLabelText(/^password$/i)
    expect(passwordInput.value).toBe('Demo@2026')
  })

  test('Submitting login with these credentials calls the backend', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const fillDeanBtn = screen.getByRole('button', { name: /fill dean credentials/i })
    fireEvent.click(fillDeanBtn)

    const submitBtn = screen.getByRole('button', { name: /login securely/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 's9010150809@gmail.com',
        username: 's9010150809@gmail.com',
        password: 'Demo@2026',
        institutionId: 'demo',
      })
    })
  })
})
