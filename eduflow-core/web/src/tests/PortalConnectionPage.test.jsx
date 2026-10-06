import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PortalConnectionPage from '../pages/admin/PortalConnectionPage'

const mockAdmin = {
  id: 1,
  firstName: 'Academic',
  lastName: 'Dean',
  role: 'admin',
}

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockAdmin }),
}))

jest.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}))

describe('PortalConnectionPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('Renders 8 enterprise connector cards', () => {
    render(
      <MemoryRouter>
        <PortalConnectionPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Institutional Portal & ERP Connectors/i)).toBeInTheDocument()
    expect(screen.getByText(/MySQL Database/i)).toBeInTheDocument()
    expect(screen.getByText(/PostgreSQL Database/i)).toBeInTheDocument()
    expect(screen.getByText(/Oracle Database/i)).toBeInTheDocument()
    expect(screen.getByText(/Fedena ERP/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Campus 365/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Classpro ERP/i)).toBeInTheDocument()
    expect(screen.getByText(/Biometric API \(ZKTeco \/ eSSL\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Google Sheets/i)).toBeInTheDocument()
  })

  test('Opens connect modal on button click', () => {
    render(
      <MemoryRouter>
        <PortalConnectionPage />
      </MemoryRouter>
    )

    const connectBtn = screen.getByRole('button', { name: /Connect New Portal/i })
    fireEvent.click(connectBtn)

    expect(screen.getByText(/Connect External Portal \/ ERP/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Test Handshake/i })).toBeInTheDocument()
  })

  test('Shows active connected sources with Sync Now and Preview actions', async () => {
    render(
      <MemoryRouter>
        <PortalConnectionPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Active Institutional Sources/i)).toBeInTheDocument()
    await waitFor(() => {
      const syncButtons = screen.getAllByRole('button', { name: /Sync Now/i })
      expect(syncButtons.length).toBeGreaterThan(0)
    })
  })
})
