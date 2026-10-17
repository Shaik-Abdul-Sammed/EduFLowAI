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

  test('Renders safely without crash when API response has missing or undefined numeric fields', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/v1/portal/sources')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              sources: [
                {
                  id: 99,
                  name: 'Incomplete Field Source',
                  source_type: 'MYSQL',
                  status: 'CONNECTED',
                  last_synced_at: null,
                  total_records: undefined,
                  records_processed: undefined,
                },
              ],
            }),
        })
      }
      if (url.includes('/v1/portal/sync-logs')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              logs: [
                {
                  id: 999,
                  source_name: 'Incomplete Field Source',
                  status: 'SUCCESS',
                  records_synced: undefined,
                  records_processed: undefined,
                  completed_at: null,
                },
              ],
            }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    render(
      <MemoryRouter>
        <PortalConnectionPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Incomplete Field Source').length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/0 canonical entries/i)).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
    expect(screen.getByText('Just now')).toBeInTheDocument()
  })
})
