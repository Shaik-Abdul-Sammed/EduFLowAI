import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LeadIntakePage from '../pages/public/LeadIntakePage'

describe('LeadIntakePage Component', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  test('Reads ?service= query param and pre-selects the corresponding dropdown option', () => {
    render(
      <MemoryRouter initialEntries={['/for-colleges?service=timetable']}>
        <LeadIntakePage />
      </MemoryRouter>
    )

    const select = screen.getByLabelText(/Target Automation Service/i)
    expect(select.value).toBe('timetable')
  })

  test('Honeypot field is present in DOM but hidden (tabIndex=-1, aria-hidden, hidden CSS)', () => {
    render(
      <MemoryRouter>
        <LeadIntakePage />
      </MemoryRouter>
    )

    const honeypotInput = screen.getByLabelText(/Leave this field blank/i)
    expect(honeypotInput).toBeInTheDocument()
    expect(honeypotInput).toHaveAttribute('tabIndex', '-1')
    expect(honeypotInput).toHaveAttribute('aria-hidden', 'true')

    const parentContainer = honeypotInput.closest('div')
    expect(parentContainer).toHaveStyle({ display: 'none' })
    expect(parentContainer).toHaveClass('hidden')
  })

  test('Submitting valid form sends POST to /api/v1/leads and displays success message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, leadId: 42 }),
    })

    render(
      <MemoryRouter>
        <LeadIntakePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Sri Siddhartha Institute/i), {
      target: { value: 'Global Tech Institute' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Dr. Rajesh Sharma/i), {
      target: { value: 'Dr. Ramesh Rao' },
    })
    fireEvent.change(screen.getByPlaceholderText(/principal@college.edu.in/i), {
      target: { value: 'principal@globaltech.edu' },
    })
    fireEvent.change(screen.getByPlaceholderText(/9876543210/i), {
      target: { value: '9876543210' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Hyderabad, Telangana/i), {
      target: { value: 'Bengaluru, Karnataka' },
    })
    fireEvent.change(screen.getByPlaceholderText(/2500/i), {
      target: { value: '3000' },
    })

    const submitBtn = screen.getByRole('button', { name: /Request Free Pilot Report/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url, options] = global.fetch.mock.calls[0]
      expect(url).toMatch(/\/leads$/)
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.collegeName).toBe('Global Tech Institute')
      expect(body.email).toBe('principal@globaltech.edu')
    })

    expect(
      await screen.findByText(/Thank you\. Our team will contact you within 24 hours\./i)
    ).toBeInTheDocument()
  })

  test('Submitting with honeypot filled does NOT send POST (rejected client-side)', async () => {
    render(
      <MemoryRouter>
        <LeadIntakePage />
      </MemoryRouter>
    )

    const honeypot = screen.getByLabelText(/Leave this field blank/i)
    fireEvent.change(honeypot, { target: { value: 'spambot-link.com' } })

    const submitBtn = screen.getByRole('button', { name: /Request Free Pilot Report/i })
    fireEvent.click(submitBtn)

    expect(global.fetch).not.toHaveBeenCalled()
    expect(
      await screen.findByText(/Thank you\. Our team will contact you within 24 hours\./i)
    ).toBeInTheDocument()
  })
})
