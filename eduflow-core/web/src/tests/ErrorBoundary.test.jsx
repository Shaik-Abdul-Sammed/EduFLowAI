import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

const ThrowError = ({ message }) => {
  throw new Error(message)
}

describe('ErrorBoundary Component', () => {
  let originalConsoleError
  let originalConsoleWarn

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))

    originalConsoleError = console.error
    originalConsoleWarn = console.warn
    console.error = jest.fn()
    console.warn = jest.fn()

    try {
      window.location.reload = jest.fn()
    } catch {
      // If read-only
    }
  })

  afterEach(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })

  test('Renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal Content')).toBeInTheDocument()
  })

  test('Catches normal error and does not POST if unauthenticated', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Regular runtime crash" />
      </ErrorBoundary>
    )

    expect(screen.getAllByText(/Something went wrong/i)[0]).toBeInTheDocument()
    // Should NOT call remote report because user is unauthenticated
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('Catches dynamic import chunk error and renders new version UI with refresh button', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Failed to fetch dynamically imported module: https://eduflow-web.onrender.com/assets/LoginPage-B0MRdYS9.js" />
      </ErrorBoundary>
    )

    expect(screen.getByText(/New Version Available/i)).toBeInTheDocument()
    expect(screen.getByText(/A new version of EduFlow has been deployed. Please refresh the page./i)).toBeInTheDocument()

    const refreshBtn = screen.getByRole('button', { name: /Refresh Page/i })
    expect(refreshBtn).toBeInTheDocument()

    fireEvent.click(refreshBtn)
    if (jest.isMockFunction(window.location.reload)) {
      expect(window.location.reload).toHaveBeenCalled()
    }
  })

  test('Sends error report with Authorization header when authenticated', () => {
    localStorage.setItem('accessToken', 'mock-jwt-token-123')

    render(
      <ErrorBoundary>
        <ThrowError message="Authenticated crash error" />
      </ErrorBoundary>
    )

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/error-report'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token-123',
        }),
      })
    )
  })
})
