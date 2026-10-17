import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RequestPilotModal from '../components/RequestPilotModal'

describe('RequestPilotModal Component', () => {
  const mockService = {
    id: 'accreditation',
    title: 'NAAC/NBA Report Automation',
    price: '₹50,000',
    tagline: 'Self Study Reports (SSR) generated in 72 hours.',
  }

  test('Renders modal with pre-filled service details', () => {
    render(<RequestPilotModal service={mockService} isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('Request a Free Pilot')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NAAC/NBA Report Automation')).toBeInTheDocument()
    expect(screen.getByText(/₹50,000 package/i)).toBeInTheDocument()
    expect(screen.getByText(/Self Study Reports \(SSR\) generated in 72 hours/i)).toBeInTheDocument()
  })

  test('Validates required fields before generating message', () => {
    render(<RequestPilotModal service={mockService} isOpen={true} onClose={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /Generate Message/i }))

    expect(screen.getByText('Institution name is required')).toBeInTheDocument()
    expect(screen.getByText('Contact person is required')).toBeInTheDocument()
  })

  test('Generates WhatsApp message and displays action buttons when valid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, leadId: 10 }),
    })

    render(<RequestPilotModal service={mockService} isOpen={true} onClose={() => {}} />)

    fireEvent.change(screen.getByPlaceholderText(/Sri Siddhartha Institute/i), {
      target: { value: 'SSIT Tumkur' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Dr\. K\. Ramesh/i), {
      target: { value: 'Dr. Ramesh' },
    })
    fireEvent.change(screen.getByPlaceholderText(/dean@college\.edu/i), {
      target: { value: 'ramesh@ssit.edu' },
    })
    fireEvent.change(screen.getByPlaceholderText(/9876543210/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Generate Message/i }))

    await waitFor(() => {
      expect(screen.getByText(/WhatsApp-Ready Formatted Text/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Send via WhatsApp/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send via Email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()

    const textarea = screen.getByRole('textbox', { name: /Formatted WhatsApp message/i })
    expect(textarea.value).toContain('SSIT Tumkur')
    expect(textarea.value).toContain('NAAC/NBA Report Automation')
  })
})
