import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import WhyEduFlowPage from '../pages/public/WhyEduFlowPage'

describe('WhyEduFlowPage Component', () => {
  test('Renders comparison header and title', () => {
    render(
      <MemoryRouter>
        <WhyEduFlowPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Not Just an ERP. An Autonomous AI Team for Your Campus./i)).toBeInTheDocument()
    expect(screen.getByText(/Platform Capability Matrix/i)).toBeInTheDocument()
  })

  test('Renders comparison matrix columns for alternatives and EduFlow AI', () => {
    render(
      <MemoryRouter>
        <WhyEduFlowPage />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/Manual Excel/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/ChatGPT/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Traditional ERP/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Existing EdTech/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/EduFlow AI OS/i)[0]).toBeInTheDocument()
  })

  test('Displays key comparison capabilities', () => {
    render(
      <MemoryRouter>
        <WhyEduFlowPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Non-teaching staff access/i)).toBeInTheDocument()
    expect(screen.getByText(/Permission delegation/i)).toBeInTheDocument()
    expect(screen.getByText(/Approval workflow/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Academic calendar/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Portal reader/i)).toBeInTheDocument()
  })

  test('Renders 3 strategic pillars and CTA buttons', () => {
    render(
      <MemoryRouter>
        <WhyEduFlowPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Non-Teaching Staff Delegation/i)).toBeInTheDocument()
    expect(screen.getByText(/Academic Calendar Intelligence/i)).toBeInTheDocument()
    expect(screen.getByText(/Zero-Migration Ingestion/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start Free 30-Day Pilot/i })).toBeInTheDocument()
  })
})
