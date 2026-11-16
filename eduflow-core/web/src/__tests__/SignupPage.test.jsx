import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from '../pages/public/SignupPage'

const mockRegister = jest.fn()
const mockNavigate = jest.fn()

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('SignupPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('renders institution onboarding signup form and value props', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Autonomous AI Campus OS/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1: Campus Information/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Sri Sudha Institute of Technology/i)).toBeInTheDocument()
    expect(screen.getByText('Autonomous Engineering College')).toBeInTheDocument()
  })

  test('validates and advances wizard steps on input change', async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    )

    const instInput = screen.getByPlaceholderText(/Sri Sudha Institute of Technology/i)
    fireEvent.change(instInput, { target: { name: 'institutionName', value: 'Apex Institute of Technology' } })

    const cityInput = screen.getByPlaceholderText(/Bangalore, Karnataka/i)
    fireEvent.change(cityInput, { target: { name: 'cityState', value: 'Hyderabad, Telangana' } })

    const nextBtn = screen.getByRole('button', { name: /Next: Admin Account/i })
    fireEvent.click(nextBtn)

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Administrator Account/i)).toBeInTheDocument()
    })
  })
})
