import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import VirtualClassroomPage from '../pages/common/VirtualClassroomPage'
import ARModelViewer from '../components/ARModelViewer'
import AudioRecorder from '../components/AudioRecorder'
import LibraryScannerPage from '../pages/admin/LibraryScannerPage'
import FacultyWalletPage from '../pages/faculty/FacultyWalletPage'
import CurriculumMappingPage from '../pages/admin/CurriculumMappingPage'
import ResearchWorkspacePage from '../pages/common/ResearchWorkspacePage'

// Mock RolePageTemplate
jest.mock('../components/RolePageTemplate', () => {
  return function MockRolePageTemplate({ title, children }) {
    return (
      <div data-testid="role-page-template">
        <h1>{title}</h1>
        {children}
      </div>
    )
  }
})

describe('Tier 1 Upgrades: Frontend Components & Pages Test Suite', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillRect: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      beginPath: jest.fn(),
      roundRect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      arc: jest.fn(),
      lineTo: jest.fn(),
      moveTo: jest.fn(),
      closePath: jest.fn(),
      ellipse: jest.fn()
    }))

    // Mock fetch
    global.fetch = jest.fn((url) => {
      if (url.includes('/curriculum/map')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { mappings: {} } })
        })
      }
      if (url.includes('/faculty/credentials')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, credentials: [] })
        })
      }
      if (url.includes('/research/workspace/logs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, logs: [], datasets: [] })
        })
      }
      if (url.includes('/media/upload')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, mediaUrl: '/uploads/media/audio.webm' })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true })
      })
    })
  })

  test('(1) VirtualClassroomPage renders WebRTC stream controls, breakout modal, and interactive polling', () => {
    render(
      <BrowserRouter>
        <VirtualClassroomPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Live Virtual Classroom & Breakout Studios/i)).toBeInTheDocument()
    expect(screen.getByText(/WEBRTC SECURE STREAM LIVE/i)).toBeInTheDocument()

    // Open Breakout Modal via its exact aria-label
    const breakoutBtn = screen.getByRole('button', { name: /Split students into Breakout Rooms/i })
    fireEvent.click(breakoutBtn)
    expect(screen.getByRole('dialog', { name: /Breakout Rooms Configuration Modal/i })).toBeInTheDocument()
    expect(screen.getByText(/Start Breakout Session/i)).toBeInTheDocument()

    // Click Start Breakout Session
    fireEvent.click(screen.getByText(/Start Breakout Session/i))
    expect(screen.getAllByText(/Breakout Rooms Active/i)[0]).toBeInTheDocument()

    // Test Polling Vote
    const voteBtn = screen.getByRole('button', { name: /Vote for option: A new term begins/i })
    fireEvent.click(voteBtn)
  })

  test('(2) ARModelViewer renders 3D scientific model, structures list, and zoom controls', () => {
    render(<ARModelViewer defaultModel="heart" />)

    expect(screen.getByText(/Human Cardiac Anatomy/i)).toBeInTheDocument()
    expect(screen.getByText(/• Left Ventricle/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Scan Physical Textbook QR Code/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zoom In Model/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Toggle Wireframe Mesh/i })).toBeInTheDocument()

    // Trigger Scan Simulation
    fireEvent.click(screen.getByRole('button', { name: /Scan Physical Textbook QR Code/i }))
  })

  test('(3) AudioRecorder handles recording initiation, waveform state, and cloud upload', async () => {
    render(<AudioRecorder courseCode="CS401" />)

    expect(screen.getByText(/Hardware-Free Audio Recording Studio/i)).toBeInTheDocument()
    const startBtn = screen.getByRole('button', { name: /Start Audio Recording/i })
    expect(startBtn).toBeInTheDocument()

    fireEvent.click(startBtn)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Audio Recording/i })).toBeInTheDocument()
    })
  })

  test('(4) LibraryScannerPage renders camera circulation and auto-populates student details', () => {
    render(
      <BrowserRouter>
        <LibraryScannerPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Integrated Library Digital Scanner & Circulation/i)).toBeInTheDocument()
    expect(screen.getByText(/Aditya Sharma/i)).toBeInTheDocument()
    expect(screen.getAllByText(/2024-CSE-042/i)[0]).toBeInTheDocument()

    const issueBtn = screen.getByRole('button', { name: /Confirm Book Issue/i })
    fireEvent.click(issueBtn)
    expect(screen.getByText(/Book issued successfully/i)).toBeInTheDocument()
  })

  test('(5) FacultyWalletPage renders verified blockchain proofs and modal upload', () => {
    render(
      <BrowserRouter>
        <FacultyWalletPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Faculty Blockchain Credential Wallet/i)).toBeInTheDocument()
    expect(screen.getByText(/Ph.D. in Distributed Systems/i)).toBeInTheDocument()
    expect(screen.getByText(/0x9d4b1a8f9024cbe771891d09eaf1992928812903bbca7819ef3810142bc019a2/i)).toBeInTheDocument()

    // Open Upload Modal
    const addBtn = screen.getByRole('button', { name: /Upload New Faculty Credential/i })
    fireEvent.click(addBtn)
    expect(screen.getByRole('dialog', { name: /Upload Credential Modal/i })).toBeInTheDocument()
  })

  test('(6) CurriculumMappingPage renders CO-PO matrix table with overflow wrapper and save button', () => {
    render(
      <BrowserRouter>
        <CurriculumMappingPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/AI-Driven Curriculum & Outcome Mapping Matrix/i)).toBeInTheDocument()
    expect(screen.getByText(/PO12/i)).toBeInTheDocument()

    const saveBtn = screen.getByRole('button', { name: /Save Curriculum Mapping Matrix/i })
    fireEvent.click(saveBtn)
  })

  test('(7) ResearchWorkspacePage renders VRE datasets, experiment log form, and download actions', () => {
    render(
      <BrowserRouter>
        <ResearchWorkspacePage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Virtual Research Environment \(VRE\) Collaborative Workspace/i)).toBeInTheDocument()
    expect(screen.getAllByText(/imagenet_dist_val_shard01\.bin/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Live Experiment Log/i)).toBeInTheDocument()

    // Form input & submit
    const textarea = screen.getByRole('textbox', { name: /Observation Note/i })
    fireEvent.change(textarea, { target: { value: 'Verified Byzantine consensus state with zero split-brain divergence.' } })

    const submitBtn = screen.getByRole('button', { name: /Submit Experiment Log/i })
    fireEvent.click(submitBtn)
  })
})
