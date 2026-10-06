import { render, screen, fireEvent } from '@testing-library/react'
import TourGuide from '../components/TourGuide'

describe('TourGuide Component', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('Auto-activates tour on first login if not completed', () => {
    render(<TourGuide />)

    expect(screen.getByText(/Welcome to EduFlow AI OS/i)).toBeInTheDocument()
    expect(screen.getByText(/Platform Onboarding/i)).toBeInTheDocument()
  })

  test('Does not show tour if already completed in localStorage', () => {
    localStorage.setItem('eduflow_tour_completed', 'true')
    render(<TourGuide />)

    expect(screen.queryByText(/Welcome to EduFlow AI OS/i)).not.toBeInTheDocument()
  })

  test('Navigates through tour steps on Next button click', () => {
    render(<TourGuide />)

    expect(screen.getByText(/Welcome to EduFlow AI OS/i)).toBeInTheDocument()

    const nextBtn = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn)

    expect(screen.getByText(/5 Specialized AI Officers/i)).toBeInTheDocument()
  })

  test('Dismisses tour and sets completion flag on Skip Tour', () => {
    render(<TourGuide />)

    const skipBtn = screen.getByRole('button', { name: /Skip Tour/i })
    fireEvent.click(skipBtn)

    expect(screen.queryByText(/Welcome to EduFlow AI OS/i)).not.toBeInTheDocument()
    expect(localStorage.getItem('eduflow_tour_completed')).toBe('true')
  })
})
