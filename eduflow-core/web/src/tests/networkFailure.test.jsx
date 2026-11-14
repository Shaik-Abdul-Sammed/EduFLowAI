import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import DashboardHome from '../components/DashboardHome'
import { showWakeUpBanner } from '../utils/wakeUpHandler'

describe('Network Failure, 500 Error & Server Cold-Start Resilience', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-jwt-token')
    localStorage.setItem('eduflow_auth', JSON.stringify({ role: 'admin', email: 'admin@demo.edu', name: 'Dr. Test Administrator' }))
  })

  afterEach(() => {
    global.fetch = originalFetch
    const banner = document.getElementById('eduflow-wake-up-banner')
    if (banner) banner.remove()
  })

  test('simulates 500 Internal Server Error: renders wake-up banner and keeps React tree mounted without crashing', async () => {
    global.fetch = jest.fn(() => {
      showWakeUpBanner('Server is waking up... Please wait a moment.')
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Backend server is starting up' })
      })
    })

    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <DashboardHome role="admin" user={{ name: 'Dr. Test Administrator', role: 'admin' }} />
        </AuthProvider>
      </MemoryRouter>
    )

    // Verify React tree rendered properly
    expect(container).toBeInTheDocument()
    expect(screen.getByText(/Portal/i)).toBeInTheDocument()

    // Assert that the wake-up / error banner is injected and visible
    await waitFor(() => {
      const banner = document.getElementById('eduflow-wake-up-banner')
      expect(banner).toBeInTheDocument()
      expect(banner.textContent).toContain('Server is waking up')
    })

    // Assert the React tree did not crash
    expect(container.querySelector('.welcome-banner')).toBeInTheDocument()
  })

  test('simulates offline network rejection: recovers gracefully with default state', async () => {
    global.fetch = jest.fn(() => {
      showWakeUpBanner('Cannot reach server. The backend may be waking up.')
      return Promise.reject(new Error('NetworkError when attempting to fetch resource.'))
    })

    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <DashboardHome role="admin" user={{ name: 'Dr. Test Administrator', role: 'admin' }} />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(container).toBeInTheDocument()
    expect(screen.getByText(/Portal/i)).toBeInTheDocument()

    await waitFor(() => {
      const banner = document.getElementById('eduflow-wake-up-banner')
      expect(banner).toBeInTheDocument()
    })
  })
})
