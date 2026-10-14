import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import FeeReminderPage from '../pages/admin/FeeReminderPage'

// Mock useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'finance@demo.edu', role: 'finance_officer' },
    isAuthenticated: true
  })
}))

describe('FeeReminderPage Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    global.fetch = jest.fn((url) => {
      const urlStr = url.toString()

      if (urlStr.includes('/api/v1/fee-reminders/pending')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            summary: {
              totalOverdueAccounts: 2,
              totalOverdueAmount: 113000,
              averageOverdueDays: 10
            },
            tiers: {
              tier1: [
                {
                  id: 1,
                  invoice_number: 'EDU-2026-0041',
                  contact_person: 'Rahul Sharma',
                  contact_email: 'rahul.s@ssit.edu.in',
                  contact_phone: '+919876543201',
                  total_amount: 59000,
                  due_date: '2026-10-09',
                  daysOverdue: 4
                }
              ],
              tier2: [
                {
                  id: 2,
                  invoice_number: 'EDU-2026-0042',
                  contact_person: 'Pooja Hegde',
                  contact_email: 'pooja.h@ssit.edu.in',
                  contact_phone: '+919876543202',
                  total_amount: 54000,
                  due_date: '2026-09-27',
                  daysOverdue: 16
                }
              ],
              tier3: [],
              tier4: []
            }
          })
        })
      }

      if (urlStr.includes('/api/v1/fee-reminders/history')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            history: [
              {
                id: 101,
                recipient_name: 'Rahul Sharma',
                recipient_contact: 'rahul.s@ssit.edu.in',
                channel: 'EMAIL',
                reminder_tier: 'tier1',
                status: 'SENT',
                subject_or_preview: 'Gentle Reminder: Semester Fee Payment Due',
                created_at: new Date().toISOString()
              }
            ]
          })
        })
      }

      if (urlStr.includes('/api/v1/fee-reminders/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            settings: {
              enabled: true,
              scheduledHour: 9,
              channels: ['EMAIL', 'WHATSAPP'],
              tier1Days: 7,
              tier2Days: 30,
              tier3Days: 60,
              upiId: 'ssit@icici',
              escalationEmail: 'dean.academics@ssit.edu.in'
            }
          })
        })
      }

      if (urlStr.includes('/api/v1/fee-reminders/send-now')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            sentCount: 2,
            failedCount: 0,
            processedInvoices: 1
          })
        })
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    })
  })

  it('renders summary metrics, overdue invoices table and progressive tiers', async () => {
    render(
      <MemoryRouter>
        <FeeReminderPage />
      </MemoryRouter>
    )

    // Heading
    expect(screen.getByText(/Automated Fee Reminders & Progressive Escalation/i)).toBeInTheDocument()

    // Overdue invoices loaded
    await waitFor(() => {
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0)
      expect(screen.getByText('Pooja Hegde')).toBeInTheDocument()
    })

    expect(screen.getByText('EDU-2026-0041')).toBeInTheDocument()
    expect(screen.getByText('EDU-2026-0042')).toBeInTheDocument()
    expect(screen.getByText(/Tier 1: Polite \(1-7d\)/i)).toBeInTheDocument()
  })

  it('allows filtering by progressive tier tabs', async () => {
    render(
      <MemoryRouter>
        <FeeReminderPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0)
    })

    // Click Tier 1 Tab button in the tab navigation
    const tier1Tab = screen.getByRole('button', { name: /^Tier 1: Polite \(\d+\)$/i })
    fireEvent.click(tier1Tab)

    expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0)
    expect(screen.queryByText('Pooja Hegde')).not.toBeInTheDocument()
  })

  it('triggers send-now batch dispatch and shows success notification', async () => {
    render(
      <MemoryRouter>
        <FeeReminderPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Rahul Sharma').length).toBeGreaterThan(0)
    })

    const runScheduledBtn = screen.getByRole('button', { name: /Run Scheduled Reminders Now/i })
    fireEvent.click(runScheduledBtn)

    await waitFor(() => {
      expect(screen.getByText(/Dispatched reminders successfully/i)).toBeInTheDocument()
    })
  })
})
