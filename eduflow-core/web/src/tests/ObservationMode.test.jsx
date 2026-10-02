import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ObservationMode from '../pages/demo/ObservationMode'
import { DEMO_STEPS, TOTAL_DEMO_ROI } from '../pages/demo/demoSequence'

const mockStart = jest.fn()
const mockStop = jest.fn()
let mockOfficerState = {
  tokens: '',
  status: 'idle',
  error: null,
  start: mockStart,
  stop: mockStop,
}

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { role: 'admin', name: 'Demo Admin' },
  }),
}))

jest.mock('../hooks/useStreamingOfficer', () => ({
  useStreamingOfficer: () => mockOfficerState,
}))

describe('ObservationMode Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockOfficerState = {
      tokens: '',
      status: 'idle',
      error: null,
      start: mockStart,
      stop: mockStop,
    }
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('URL param ?observe=true triggers auto-start of step 1', () => {
    render(
      <MemoryRouter initialEntries={['/demo/observe?observe=true']}>
        <ObservationMode />
      </MemoryRouter>
    )

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(mockStart).toHaveBeenCalledWith(
      DEMO_STEPS[0].endpoint,
      DEMO_STEPS[0].payload
    )
  })

  test('Presenter toolbar is visible only when ?host=true', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/demo/observe?host=true']}>
        <ObservationMode />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/Presenter Controls/i)).toBeInTheDocument()
    unmount()

    render(
      <MemoryRouter initialEntries={['/demo/observe']}>
        <ObservationMode />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/Presenter Controls/i)).not.toBeInTheDocument()
  })

  test('Presenter toolbar is hidden when host param is absent', () => {
    render(
      <MemoryRouter initialEntries={['/demo/observe?observe=true']}>
        <ObservationMode />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText(/Presenter Controls/i)).not.toBeInTheDocument()
  })

  test('Step completion increments accumulated ROI, all 5 render ROI overlay, restart resets', () => {
    render(
      <MemoryRouter initialEntries={['/demo/observe?host=true']}>
        <ObservationMode />
      </MemoryRouter>
    )

    // Initial ROI is 0
    expect(screen.getByText('0.0 hrs')).toBeInTheDocument()
    expect(screen.getByText('₹0')).toBeInTheDocument()

    // Skip through all 5 steps one-by-one with act flush
    for (let i = 0; i < 5; i++) {
      act(() => {
        const skipBtn = screen.getByRole('button', { name: /skip/i })
        fireEvent.click(skipBtn)
      })
    }

    // Summary overlay should be displayed
    expect(screen.getByText(/EduFlow AI OS Impact Summary/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${TOTAL_DEMO_ROI.hoursSaved} Hours`, 'i'))).toBeInTheDocument()

    // Test restart button resets ROI to 0 and restarts from step 1
    act(() => {
      const restartBtn = screen.getByRole('button', { name: /Replay Observation Demo/i })
      fireEvent.click(restartBtn)
    })

    expect(mockStop).toHaveBeenCalled()
    expect(mockStart).toHaveBeenCalledWith(
      DEMO_STEPS[0].endpoint,
      DEMO_STEPS[0].payload
    )
    expect(screen.queryByText(/EduFlow AI OS Impact Summary/i)).not.toBeInTheDocument()
  })
})
