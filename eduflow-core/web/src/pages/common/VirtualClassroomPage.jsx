import { useState, useEffect, useRef } from 'react'
import { Video, Mic, MicOff, VideoOff, Users, Split, BarChart2, MessageSquare, PhoneOff, Settings, ShieldCheck, CheckCircle2, X } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function VirtualClassroomPage() {
  const [inCall, setInCall] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [activeTab, setActiveTab] = useState('main') // 'main' | 'breakout' | 'poll'
  const [showBreakoutModal, setShowBreakoutModal] = useState(false)
  const [showPollModal, setShowPollModal] = useState(false)
  
  // Participants
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Prof. Ananya Sen (Host)', role: 'Faculty', room: 'Main Room', audio: true, video: true },
    { id: 2, name: 'Aditya Sharma (2024-CSE-042)', role: 'Student', room: 'Main Room', audio: false, video: true },
    { id: 3, name: 'Sneha Patel (2024-CSE-055)', role: 'Student', room: 'Main Room', audio: false, video: false },
    { id: 4, name: 'Rohan Deshmukh (2024-CSE-018)', role: 'Student', room: 'Main Room', audio: false, video: true },
    { id: 5, name: 'Pooja Iyer (2024-CSE-077)', role: 'Student', room: 'Main Room', audio: false, video: true }
  ])

  // Breakout Rooms State
  const [breakoutRooms, setBreakoutRooms] = useState([
    { id: 'b1', name: 'Breakout Pod 1 (Consensus Algorithms)', members: ['Aditya Sharma', 'Sneha Patel'], timer: '15:00' },
    { id: 'b2', name: 'Breakout Pod 2 (Fault Tolerance)', members: ['Rohan Deshmukh', 'Pooja Iyer'], timer: '15:00' }
  ])
  const [breakoutActive, setBreakoutActive] = useState(false)

  // Live Poll State
  const [poll, setPoll] = useState({
    question: 'In Raft Consensus, what occurs if the Leader fails during an uncommitted log entry?',
    options: [
      { text: 'A new term begins and Candidate with highest log term is elected', votes: 18 },
      { text: 'All nodes immediately reboot into recovery mode', votes: 2 },
      { text: 'Log entries are irreversibly lost', votes: 1 },
      { text: 'Split brain occurs permanently', votes: 0 }
    ],
    totalVotes: 21,
    active: true
  })
  const [userVoted, setUserVoted] = useState(null)

  const canvasRef = useRef(null)

  // Animated Simulated Video Canvas with WebRTC stream indicator
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let t = 0

    const render = () => {
      t += 0.03
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (isVideoOff) {
        ctx.fillStyle = '#64748b'
        ctx.font = '16px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Camera Disabled (Privacy Mode)', canvas.width / 2, canvas.height / 2)
      } else {
        // Draw simulated lecture video presentation
        ctx.fillStyle = '#1e293b'
        ctx.beginPath()
        ctx.roundRect(40, 30, canvas.width - 80, canvas.height - 60, 16)
        ctx.fill()

        // Dynamic audio waveform indicator
        ctx.fillStyle = '#38bdf8'
        for (let i = 0; i < 20; i++) {
          const barHeight = Math.sin(t + i * 0.4) * 20 + 25
          ctx.fillRect(60 + i * 16, canvas.height - 70 - barHeight, 8, barHeight)
        }

        ctx.fillStyle = '#f8fafc'
        ctx.font = 'bold 20px system-ui'
        ctx.textAlign = 'left'
        ctx.fillText('CS401: Distributed Systems & Consensus Invariants', 60, 70)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '14px system-ui'
        ctx.fillText('WebRTC High-Fidelity 1080p Stream • End-to-End Encrypted', 60, 100)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [isVideoOff])

  const handleVote = (index) => {
    if (userVoted !== null) return
    setUserVoted(index)
    setPoll(prev => {
      const updatedOptions = [...prev.options]
      updatedOptions[index].votes += 1
      return {
        ...prev,
        options: updatedOptions,
        totalVotes: prev.totalVotes + 1
      }
    })
  }

  const handleSplitBreakouts = () => {
    setBreakoutActive(true)
    setShowBreakoutModal(false)
  }

  const handleCloseBreakouts = () => {
    setBreakoutActive(false)
  }

  return (
    <RolePageTemplate
      role="Virtual Campus"
      title="Live Virtual Classroom & Breakout Studios"
      description="WebRTC ultra-low-latency lecture stream with peer breakout pods, interactive polling, and zero-hardware spatial communication."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge bg-success-subtle text-success px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.75rem' }}>
                ● WEBRTC SECURE STREAM LIVE (32ms Latency)
              </span>
              <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
                Lecture Hall 301: Raft & Paxos Formal Invariants
              </h2>
              <p className="text-white-50 small mb-0">
                Host: Prof. Ananya Sen • 48 Enrolled Students Present • Recording to Campus Vault
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={() => setShowBreakoutModal(true)}
                aria-label="Split students into Breakout Rooms"
              >
                <Split size={16} />
                <span>Split into Breakout Rooms</span>
              </button>
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                onClick={() => setShowPollModal(true)}
                aria-label="Broadcast Poll to Students"
              >
                <BarChart2 size={16} />
                <span>Broadcast Poll</span>
              </button>
            </div>
          </div>
        </div>

        {/* Video Stage and Control Panels Split */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Main WebRTC Video Stream Area */}
          <div style={{ flex: '2 1 540px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '1.25rem', background: '#090d16' }}>
              <div style={{ position: 'relative', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  style={{ width: '100%', height: 'auto', display: 'block', background: '#090d16', borderRadius: '1rem' }}
                  aria-label="Interactive Lecture Video Player Stream"
                  role="img"
                />

                {breakoutActive && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(234, 88, 12, 0.9)',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Split size={14} />
                    <span>Breakout Rooms Active (2 Pods)</span>
                  </div>
                )}
              </div>

              {/* In-Call Controls Bar */}
              <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-3 py-2">
                <button
                  className={`btn rounded-circle p-3 ${isAudioMuted ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  className={`btn rounded-circle p-3 ${isVideoOff ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
                <button
                  className="btn btn-secondary rounded-circle p-3"
                  onClick={() => setShowPollModal(true)}
                  aria-label="Open Live Poll Panel"
                >
                  <BarChart2 size={20} />
                </button>
                <button
                  className="btn btn-secondary rounded-circle p-3"
                  onClick={() => setShowBreakoutModal(true)}
                  aria-label="Configure Breakout Rooms"
                >
                  <Split size={20} />
                </button>
                <button
                  className="btn btn-danger rounded-circle p-3 ms-2"
                  onClick={() => setInCall(!inCall)}
                  aria-label="Leave Classroom Stream"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Breakout & Polling Status */}
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h3 className="h6 fw-bold mb-0 text-dark">Classroom Status</h3>
                <span className="badge bg-primary text-white">{participants.length} Active</span>
              </div>

              {/* Poll View */}
              <div className="p-3 mb-3" style={{ background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-indigo text-primary border small">Live Lecture Poll</span>
                  <span className="text-muted small">{poll.totalVotes} Votes</span>
                </div>
                <p className="fw-semibold text-dark small mb-3" style={{ wordBreak: 'break-word' }}>
                  {poll.question}
                </p>

                <div className="d-flex flex-column gap-2">
                  {poll.options.map((opt, idx) => {
                    const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
                    return (
                      <button
                        key={idx}
                        className={`btn text-start p-2 small border ${userVoted === idx ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'bg-white text-dark'}`}
                        style={{ borderRadius: '0.75rem', wordBreak: 'break-word' }}
                        onClick={() => handleVote(idx)}
                        aria-label={`Vote for option: ${opt.text}`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>{opt.text}</span>
                          <span className="badge bg-light text-secondary">{percent}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div className="progress-bar bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Breakout Summary */}
              {breakoutActive && (
                <div className="p-3" style={{ background: '#fff7ed', borderRadius: '1rem', border: '1px solid #fed7aa' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-warning text-dark font-monospace">BREAKOUT ROOMS ACTIVE</span>
                    <button className="btn btn-outline-danger btn-xs" onClick={handleCloseBreakouts} aria-label="End Breakout Session">
                      End Session
                    </button>
                  </div>
                  {breakoutRooms.map(room => (
                    <div key={room.id} className="small text-secondary mb-1">
                      <strong>{room.name}:</strong> {room.members.join(', ')} ({room.timer})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Split into Breakout Rooms */}
        {showBreakoutModal && (
          <div
            className="modal d-block"
            style={{ background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-label="Breakout Rooms Configuration Modal"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1.25rem' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Split className="text-primary" size={20} />
                    Split into Breakout Rooms
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowBreakoutModal(false)} aria-label="Close Modal" />
                </div>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">
                    Automatically distribute 48 students into collaborative sub-groups with dedicated WebRTC audio mesh.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-dark">Number of Breakout Pods</label>
                    <select className="form-select form-select-sm" defaultValue="2" aria-label="Select number of breakout rooms">
                      <option value="2">2 Rooms (24 students per room)</option>
                      <option value="4">4 Rooms (12 students per room)</option>
                      <option value="8">8 Rooms (6 students per room)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-dark">Timer Duration</label>
                    <select className="form-select form-select-sm" defaultValue="15" aria-label="Select breakout duration">
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes (Recommended)</option>
                      <option value="30">30 Minutes</option>
                    </select>
                  </div>

                  <div className="p-3 bg-light rounded-3 small text-secondary">
                    <CheckCircle2 size={16} className="text-success me-2" />
                    Students will be automatically routed back to the Main Lecture Hall once the countdown expires.
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-light" onClick={() => setShowBreakoutModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSplitBreakouts}>Start Breakout Session</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Broadcast Poll */}
        {showPollModal && (
          <div
            className="modal d-block"
            style={{ background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-label="Broadcast Poll Modal"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '1.25rem' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <BarChart2 className="text-primary" size={20} />
                    Broadcast Instant Lecture Poll
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowPollModal(false)} aria-label="Close Poll Modal" />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-dark">Poll Question</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      defaultValue={poll.question}
                      aria-label="Enter Poll Question"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-dark">Answer Options</label>
                    {poll.options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        className="form-control form-control-sm mb-2"
                        defaultValue={opt.text}
                        aria-label={`Option ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-light" onClick={() => setShowPollModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => setShowPollModal(false)}>Broadcast to All Students</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
