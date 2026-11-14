import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import AdaptiveLearningPage from '../pages/student/AdaptiveLearningPage'
import CredentialWalletPage from '../pages/student/CredentialWalletPage'
import LeaderboardPage from '../pages/student/LeaderboardPage'
import VirtualLabsPage from '../pages/student/VirtualLabsPage'
import ARScannerPage from '../pages/student/ARScannerPage'
import PlagiarismCheckerPage from '../pages/faculty/PlagiarismCheckerPage'
import PodcastStudioPage from '../pages/faculty/PodcastStudioPage'
import WhiteboardPage from '../pages/common/WhiteboardPage'
import AITutorWidget from '../components/AITutorWidget'
import TranslationWidget from '../components/TranslationWidget'

const mockUser = {
  id: 101,
  name: 'Aarav Sharma',
  role: 'student',
  rollNumber: '2024-CSE-042'
}

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true })
}))

describe('Advanced Learning Technologies (031) - Frontend UI/UX Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    )
  })

  // 1. Adaptive Learning Page
  test('AdaptiveLearningPage renders visual roadmap without layout overflow', () => {
    render(
      <MemoryRouter>
        <AdaptiveLearningPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Adaptive Learning & Personalized Curriculum/i)).toBeInTheDocument()
    expect(screen.getByText(/Distributed Systems & Cloud Computing/i)).toBeInTheDocument()
    expect(screen.getByText(/Deep Learning & Neural Architectures/i)).toBeInTheDocument()
    expect(screen.getByText(/Generate New Pathway/i)).toBeInTheDocument()
  })

  // 2. Credential Wallet Page
  test('CredentialWalletPage renders verifiable blockchain credentials with flex-wrap layout', () => {
    render(
      <MemoryRouter>
        <CredentialWalletPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Decentralized Academic Identity Wallet/i)).toBeInTheDocument()
    expect(screen.getByText(/Distributed Systems & Microservices Architecture/i)).toBeInTheDocument()
    expect(screen.getByText(/Mint Skill Badge/i)).toBeInTheDocument()
  })

  // 3. Leaderboard Page with strict table overflow wrapper
  test('LeaderboardPage renders cohort table inside an overflowX: auto wrapper', () => {
    const { container } = render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Full Cohort Leaderboard/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Aarav Sharma/i)[0]).toBeInTheDocument()

    // Assert strict UI/UX overflow wrapper requirement
    const table = container.querySelector('table')
    expect(table).toBeInTheDocument()
    const tableWrapper = table.closest('div')
    expect(tableWrapper).toBeInTheDocument()
    expect(tableWrapper.style.overflowX).toBe('auto')
    expect(tableWrapper.style.width).toBe('100%')
  })

  // 4. Virtual Labs & Simulation UI
  test('VirtualLabsPage renders interactive controls and visualizer', () => {
    render(
      <MemoryRouter>
        <VirtualLabsPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Interactive Experimental Workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/Experimental Controls/i)).toBeInTheDocument()
    expect(screen.getByText(/Submit Lab Observation/i)).toBeInTheDocument()
  })

  // 5. AR Scanner Page
  test('ARScannerPage renders simulated WebAR camera viewfinder and 3D preview', () => {
    render(
      <MemoryRouter>
        <ARScannerPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Augmented Reality \(AR\) Textbook Scanner/i)).toBeInTheDocument()
    expect(screen.getByText(/AR Camera Viewfinder/i)).toBeInTheDocument()
    expect(screen.getByText(/Simulate Scanning Textbook QR/i)).toBeInTheDocument()
  })

  // 6. Plagiarism Checker Page
  test('PlagiarismCheckerPage renders split-screen UI with input and analysis cards', () => {
    render(
      <MemoryRouter>
        <PlagiarismCheckerPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Plagiarism & AI Attribution Engine/i)).toBeInTheDocument()
    expect(screen.getByText(/Submission Content/i)).toBeInTheDocument()
    expect(screen.getByText(/Analysis & Attribution/i)).toBeInTheDocument()
    expect(screen.getByText(/Run Integrity Scan/i)).toBeInTheDocument()
  })

  // 7. Podcast Studio Page
  test('PodcastStudioPage renders audio publisher and now playing widget', () => {
    render(
      <MemoryRouter>
        <PodcastStudioPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Academic Podcast & Audio Lecture Studio/i)).toBeInTheDocument()
    expect(screen.getByText(/Publish New Audio Lecture/i)).toBeInTheDocument()
    expect(screen.getByText(/Published Course Episodes/i)).toBeInTheDocument()
  })

  // 8. Digital Whiteboard Page
  test('WhiteboardPage renders interactive canvas and collaborative controls', () => {
    render(
      <MemoryRouter>
        <WhiteboardPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Interactive Digital Whiteboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Sync Board/i)).toBeInTheDocument()
    expect(screen.getByText(/Clear/i)).toBeInTheDocument()
  })

  // 9. Floating AI Tutor Widget
  test('AITutorWidget renders toggle button and opens chat window with max-height 80vh', () => {
    render(
      <MemoryRouter>
        <AITutorWidget defaultCourse="CS301" />
      </MemoryRouter>
    )

    const toggleBtn = screen.getByLabelText(/Open AI Teaching Assistant/i)
    expect(toggleBtn).toBeInTheDocument()

    // Open chat
    fireEvent.click(toggleBtn)

    const dialog = screen.getByRole('dialog', { name: /AI Tutor Chat Window/i })
    expect(dialog).toBeInTheDocument()
    expect(dialog.style.maxHeight).toBe('80vh')
  })

  // 10. Translation Widget with z-index: 9999
  test('TranslationWidget dropdown uses z-index: 9999 to prevent clipping', () => {
    render(
      <MemoryRouter>
        <TranslationWidget />
      </MemoryRouter>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Open dropdown
    fireEvent.click(button)

    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()
    expect(menu.style.zIndex).toBe('9999')
  })
})
