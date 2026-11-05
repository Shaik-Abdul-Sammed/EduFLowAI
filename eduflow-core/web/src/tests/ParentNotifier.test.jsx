import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ParentAccountsPage from '../pages/admin/parentAccounts'
import ParentMessagingPage from '../pages/faculty/parentMessaging'

const mockAdmin = { id: 1, name: 'Dean', role: 'admin' }

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockAdmin }),
}))

describe('Parent Notifier & Guardian Portal UI Suite', () => {
  describe('Parent Accounts Management', () => {
    test('renders parent accounts directory with active guardian linkages', () => {
      render(
        <MemoryRouter>
          <ParentAccountsPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/Parent Accounts/i)).toBeInTheDocument()
      expect(screen.getByText(/Ramanathan Reddy/i)).toBeInTheDocument()
      expect(screen.getByText(/Arjun Reddy/i)).toBeInTheDocument()
      expect(screen.getByText(/Devendra Singh/i)).toBeInTheDocument()
    })

    test('allows toggling portal authorization status for a guardian', () => {
      render(
        <MemoryRouter>
          <ParentAccountsPage />
        </MemoryRouter>
      )

      const revokeButtons = screen.getAllByRole('button', { name: /Revoke/i })
      expect(revokeButtons.length).toBeGreaterThan(0)

      fireEvent.click(revokeButtons[0])
      expect(screen.getAllByText(/Blocked/i).length).toBeGreaterThan(0)
    })

    test('opens link parent modal and creates a new guardian link', () => {
      render(
        <MemoryRouter>
          <ParentAccountsPage />
        </MemoryRouter>
      )

      const linkBtn = screen.getByRole('button', { name: /\+ Add Parent Account/i })
      fireEvent.click(linkBtn)

      expect(screen.getByText(/Link New Parent Profile/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/e\.g\. Satish Patel/i)).toBeInTheDocument()
    })
  })

  describe('Parent Messaging & Attendance Alert Notification', () => {
    test('renders parent messaging inbox with attendance concern notices', () => {
      render(
        <MemoryRouter>
          <ParentMessagingPage />
        </MemoryRouter>
      )

      expect(screen.getByText(/Parent Messaging/i)).toBeInTheDocument()
      expect(screen.getByText(/Attendance concern in Physics/i)).toBeInTheDocument()
      expect(screen.getByText(/Mr\. R\. Sharma/i)).toBeInTheDocument()
    })

    test('opens a parent notice and sends a formal educator response', () => {
      render(
        <MemoryRouter>
          <ParentMessagingPage />
        </MemoryRouter>
      )

      const messageCard = screen.getByText(/Attendance concern in Physics/i)
      fireEvent.click(messageCard)

      expect(screen.getByRole('button', { name: /Send Reply/i })).toBeInTheDocument()
      const textarea = screen.getByPlaceholderText(/Type your reply\.\.\./i)
      fireEvent.change(textarea, { target: { value: 'We will arrange counseling sessions.' } })

      const sendBtn = screen.getByRole('button', { name: /Send Reply/i })
      fireEvent.click(sendBtn)

      expect(screen.queryByPlaceholderText(/Type your reply\.\.\./i)).not.toBeInTheDocument()
    })

    test('opens broadcast compose modal and sends notice to student parent', () => {
      render(
        <MemoryRouter>
          <ParentMessagingPage />
        </MemoryRouter>
      )

      const composeBtn = screen.getByRole('button', { name: /New Message/i })
      fireEvent.click(composeBtn)

      expect(screen.getByText(/Compose Message/i)).toBeInTheDocument()
      const subjectInput = screen.getByPlaceholderText(/Message subject\.\.\./i)
      fireEvent.change(subjectInput, { target: { value: 'Critical Attendance Shortage Notice' } })

      const messageContent = screen.getByPlaceholderText(/Message content\.\.\./i)
      fireEvent.change(messageContent, { target: { value: 'Attendance below 75% requires urgent guardian attention.' } })

      const dispatchBtn = screen.getByRole('button', { name: /Send Message/i })
      fireEvent.click(dispatchBtn)

      expect(screen.getByText(/Message sent to parent successfully/i)).toBeInTheDocument()
    })
  })
})
