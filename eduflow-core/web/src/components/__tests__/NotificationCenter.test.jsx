import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationCenter from '../NotificationCenter'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockUser = { id: 'usr_admin_1', role: 'admin', name: 'System Admin' }

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
}))

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('accessToken', 'mock-jwt-token')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders notification bell button', () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [], unreadCount: 0 }),
    })

    render(
      <MemoryRouter>
        <NotificationCenter />
      </MemoryRouter>
    )

    const bellBtn = screen.getByRole('button', { name: /notification center/i })
    expect(bellBtn).toBeInTheDocument()
  })

  it('fetches and displays notifications when toggled open', async () => {
    const mockNotifs = [
      {
        id: 'notif_1',
        title: 'Pending Timetable Approval',
        message: 'Priya Sharma submitted draft schedule for CSE Dept',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        link: '/timetable/approvals',
      },
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: mockNotifs, unreadCount: 1 }),
    })

    render(
      <MemoryRouter>
        <NotificationCenter />
      </MemoryRouter>
    )

    const bellBtn = screen.getByRole('button', { name: /notification center/i })
    fireEvent.click(bellBtn)

    await waitFor(() => {
      expect(screen.getByText('Pending Timetable Approval')).toBeInTheDocument()
    })

    expect(screen.getByText(/Priya Sharma submitted draft schedule/i)).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('navigates when an item with a link is clicked', async () => {
    const mockNotifs = [
      {
        id: 'notif_2',
        title: 'Invoice Payment Received',
        message: 'Invoice EDU-2026-0001 marked as PAID',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        link: '/finance-dashboard/invoices',
      },
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: mockNotifs, unreadCount: 0 }),
    })

    render(
      <MemoryRouter>
        <NotificationCenter />
      </MemoryRouter>
    )

    const bellBtn = screen.getByRole('button', { name: /notification center/i })
    fireEvent.click(bellBtn)

    await waitFor(() => {
      expect(screen.getByText('Invoice Payment Received')).toBeInTheDocument()
    })

    const notifBtn = screen.getByRole('button', { name: /Invoice Payment Received/i })
    fireEvent.click(notifBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/finance-dashboard/invoices')
  })
})
