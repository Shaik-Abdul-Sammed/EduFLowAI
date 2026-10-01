import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import {
  Award,
  GraduationCap,
  Calendar,
  Users,
  IndianRupee,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStreamingOfficer } from '../../hooks/useStreamingOfficer'
import { DEMO_STEPS, TOTAL_DEMO_ROI } from './demoSequence'
import './ObservationMode.css'

const ICON_MAP = {
  Award,
  GraduationCap,
  Calendar,
  Users,
  IndianRupee,
}

export default function ObservationMode() {
  const { isAuthenticated, user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // URL Parameters
  const isAutoObserve = searchParams.get('observe') === 'true'
  const isHost = searchParams.get('host') === 'true'

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [isPaused, setIsPaused] = useState(!isAutoObserve)
  const [playbackSpeed, setPlaybackSpeed] = useState(1) // 1x, 1.5x, 2x
  const [stepTimer, setStepTimer] = useState(0)
  const [isDemoFinished, setIsDemoFinished] = useState(false)
  const [accumulatedROI, setAccumulatedROI] = useState({ hoursSaved: 0, moneySaved: 0 })

  const terminalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const nextStepTimeoutRef = useRef(null)
  const autoStartRef = useRef(false)

  const { tokens, status, error, start, stop } = useStreamingOfficer()

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0]
  const IconComponent = ICON_MAP[currentStep.icon] || Award

  // Trigger stream for current step
  const executeCurrentStep = useCallback(
    (index) => {
      const step = DEMO_STEPS[index]
      if (!step) return
      setStepTimer(0)
      start(step.endpoint, step.payload)
    },
    [start]
  )

  // Auto-scroll terminal on tokens update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [tokens])

  // Step live timer
  useEffect(() => {
    if (status === 'streaming' || status === 'connecting') {
      timerIntervalRef.current = setInterval(() => {
        setStepTimer((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
    }
    return () => clearInterval(timerIntervalRef.current)
  }, [status])

  // Initial startup when observe=true
  useEffect(() => {
    if (isAutoObserve && !autoStartRef.current) {
      autoStartRef.current = true
      const timer = setTimeout(() => {
        executeCurrentStep(0)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAutoObserve, executeCurrentStep])

  // Step completion and auto-progression
  useEffect(() => {
    if (status === 'done' && !completedSteps.has(currentStepIndex)) {
      const completionTimer = setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, currentStepIndex]))
        setAccumulatedROI((prev) => ({
          hoursSaved: prev.hoursSaved + currentStep.roi.hoursSaved,
          moneySaved: prev.moneySaved + currentStep.roi.moneySaved,
        }))

        if (currentStepIndex >= DEMO_STEPS.length - 1) {
          setIsDemoFinished(true)
        } else if (!isPaused) {
          const breatherMs = Math.round(2500 / playbackSpeed)
          nextStepTimeoutRef.current = setTimeout(() => {
            const nextIndex = currentStepIndex + 1
            setCurrentStepIndex(nextIndex)
            executeCurrentStep(nextIndex)
          }, breatherMs)
        }
      }, 50)

      return () => clearTimeout(completionTimer)
    }

    return () => {
      if (nextStepTimeoutRef.current) {
        clearTimeout(nextStepTimeoutRef.current)
      }
    }
  }, [status, currentStepIndex, completedSteps, isPaused, playbackSpeed, currentStep, executeCurrentStep])

  // Controls
  const handleTogglePlay = () => {
    if (isPaused) {
      setIsPaused(false)
      if (status === 'done') {
        if (currentStepIndex < DEMO_STEPS.length - 1) {
          const nextIndex = currentStepIndex + 1
          setCurrentStepIndex(nextIndex)
          executeCurrentStep(nextIndex)
        } else {
          setIsDemoFinished(true)
        }
      } else if (status === 'idle' || status === 'error') {
        executeCurrentStep(currentStepIndex)
      }
    } else {
      setIsPaused(true)
      if (nextStepTimeoutRef.current) {
        clearTimeout(nextStepTimeoutRef.current)
      }
    }
  }

  const handleSkipStep = () => {
    stop()
    if (nextStepTimeoutRef.current) clearTimeout(nextStepTimeoutRef.current)

    setCompletedSteps((prev) => new Set([...prev, currentStepIndex]))
    setAccumulatedROI((prev) => ({
      hoursSaved: prev.hoursSaved + currentStep.roi.hoursSaved,
      moneySaved: prev.moneySaved + currentStep.roi.moneySaved,
    }))

    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      executeCurrentStep(nextIndex)
    } else {
      setIsDemoFinished(true)
    }
  }

  const handleRestart = () => {
    stop()
    if (nextStepTimeoutRef.current) clearTimeout(nextStepTimeoutRef.current)
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setAccumulatedROI({ hoursSaved: 0, moneySaved: 0 })
    setIsDemoFinished(false)
    setIsPaused(false)
    executeCurrentStep(0)
  }

  const handleStepClick = (index) => {
    stop()
    if (nextStepTimeoutRef.current) clearTimeout(nextStepTimeoutRef.current)
    setCurrentStepIndex(index)
    executeCurrentStep(index)
  }

  const handleExit = () => {
    stop()
    navigate(user?.role === 'admin' ? '/admin-dashboard' : '/faculty-dashboard')
  }

  // Auth gate early returns (after all hooks)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (user && user.role !== 'admin' && user.role !== 'faculty') {
    return <Navigate to="/entry" replace />
  }

  return (
    <div className="obs-root">
      {/* Header */}
      <header className="obs-header">
        <div className="obs-brand-badge">
          <div className="obs-pulse-dot" />
          <span>EduFlow AI OS — Live Observation Mode</span>
        </div>

        {/* 5-step progress pill navigation */}
        <nav className="obs-steps-nav" aria-label="Demo steps">
          {DEMO_STEPS.map((step, idx) => {
            const isDone = completedSteps.has(idx)
            const isActive = idx === currentStepIndex
            let pillClass = 'pending'
            if (isDone) pillClass = 'completed'
            else if (isActive) pillClass = 'active'

            return (
              <button
                key={step.id}
                type="button"
                className={`obs-step-pill ${pillClass}`}
                onClick={() => handleStepClick(idx)}
              >
                {isDone ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <span>0{step.id}</span>
                )}
                <span>{step.shortName}</span>
                {isActive && status === 'streaming' && (
                  <span className="text-xs opacity-75 font-mono">{stepTimer}s</span>
                )}
              </button>
            )
          })}
        </nav>

        <div>
          <button
            type="button"
            className="obs-toolbar-btn"
            onClick={handleExit}
            title="Exit Demo to Dashboard"
          >
            <LogOut size={14} />
            <span>Exit Demo</span>
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="obs-main">
        {/* Left Panel: Officer Card & Live ROI Counter */}
        <section className="obs-left-panel">
          <div className="obs-officer-card">
            <div className="obs-officer-header">
              <div
                className="obs-avatar"
                style={{
                  backgroundColor: `${currentStep.accentColor}20`,
                  color: currentStep.accentColor,
                  borderColor: `${currentStep.accentColor}40`,
                }}
              >
                <IconComponent size={28} />
              </div>
              <div className="obs-officer-info">
                <h2>{currentStep.name}</h2>
                <span className="obs-persona-tag">{currentStep.badge}</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Highlights Grid */}
            <div className="obs-stats-grid">
              {currentStep.highlights.map((h, i) => (
                <div key={i} className={`obs-stat-box ${h.status}`}>
                  <div className="obs-stat-val">{h.value}</div>
                  <div className="obs-stat-lbl">{h.label}</div>
                </div>
              ))}
            </div>

            {/* Institutional Live Context */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-4 text-xs space-y-1.5">
              <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Active Parameters
              </div>
              {currentStep.liveMetrics.map((m, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{m.key}:</span>
                  <span className="font-medium text-slate-200">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Live ROI Accumulator Box */}
            <div className="obs-roi-box">
              <div className="obs-roi-header">
                <span>Institutional ROI Accumulator</span>
                <Sparkles size={14} className="text-cyan-400" />
              </div>
              <div className="obs-roi-values">
                <div className="obs-roi-item">
                  <h3>{accumulatedROI.hoursSaved.toFixed(1)} hrs</h3>
                  <p>Faculty & Admin Hours Saved</p>
                </div>
                <div className="obs-roi-item">
                  <h3>₹{accumulatedROI.moneySaved.toLocaleString('en-IN')}</h3>
                  <p>Direct Institutional Savings</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Live Token Terminal */}
        <section className="obs-terminal">
          <div className="obs-terminal-bar">
            <div className="obs-terminal-dots">
              <span className="obs-dot red" />
              <span className="obs-dot yellow" />
              <span className="obs-dot green" />
            </div>
            <div className="obs-terminal-title">
              <Clock size={13} />
              <span>
                eduflow-agent --officer {currentStep.officerType} --stream --inst SSIT
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Status: <span className="text-cyan-400 uppercase">{status}</span>
            </div>
          </div>

          <div className="obs-terminal-body" ref={terminalRef}>
            <div className="obs-command-line">
              <span className="obs-prompt-prefix">eduflow@ssit:~$</span>
              <span>{currentStep.prompt}</span>
            </div>

            {status === 'connecting' && (
              <div className="text-cyan-400 animate-pulse my-2">
                [AI Officer]: Analyzing institutional digital twin & historical metrics...
              </div>
            )}

            {error && (
              <div className="text-rose-400 bg-rose-950/40 border border-rose-800/50 p-3 rounded-lg my-2">
                [Streaming Error]: {error}
              </div>
            )}

            {tokens && (
              <div className="obs-stream-content">
                {tokens}
                {status === 'streaming' && <span className="obs-cursor" />}
              </div>
            )}

            {status === 'idle' && !tokens && (
              <div className="text-slate-500 italic mt-8 text-center">
                Press Play or select a step above to initiate autonomous AI Officer stream.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Presenter Toolbar (shown when ?host=true) */}
      {isHost && (
        <aside className="obs-presenter-bar" aria-label="Presenter Controls">
          <button
            type="button"
            className="obs-toolbar-btn primary"
            onClick={handleTogglePlay}
            title={isPaused ? 'Resume Auto Sequence' : 'Pause Sequence'}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            type="button"
            className="obs-toolbar-btn"
            onClick={handleSkipStep}
            title="Skip to next officer"
          >
            <SkipForward size={15} />
            <span>Skip</span>
          </button>

          <button
            type="button"
            className="obs-toolbar-btn"
            onClick={handleRestart}
            title="Restart sequence from Step 1"
          >
            <RotateCcw size={15} />
            <span>Restart</span>
          </button>

          {/* Speed selector */}
          <div className="obs-speed-toggle">
            {[1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                className={`obs-speed-btn ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            type="button"
            className="obs-toolbar-btn"
            onClick={handleExit}
            title="Exit Demo"
          >
            <LogOut size={15} />
            <span>Exit</span>
          </button>
        </aside>
      )}

      {/* Grand Summary Overlay on Demo Completion */}
      {isDemoFinished && (
        <div className="obs-summary-overlay">
          <div className="obs-summary-card">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <CheckCircle2 size={16} />
              <span>Full Institutional Demonstration Completed</span>
            </div>

            <h1 className="obs-summary-title">EduFlow AI OS Impact Summary</h1>
            <p className="obs-summary-subtitle">
              Across all 5 autonomous AI Officers, Sri Siddhartha Institute of Technology achieves immediate operational velocity.
            </p>

            <div className="obs-summary-grid">
              <div className="obs-summary-metric">
                <h4>{TOTAL_DEMO_ROI.hoursSaved} Hours</h4>
                <p>Total Administrative & Faculty Time Saved</p>
              </div>
              <div className="obs-summary-metric">
                <h4>₹{TOTAL_DEMO_ROI.moneySaved.toLocaleString('en-IN')}</h4>
                <p>Estimated Direct Consulting & Recovery Savings</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                className="obs-cta-btn flex items-center gap-2"
                onClick={() => alert('Initiating SSIT Institutional Production Onboarding')}
              >
                <span>Schedule Institutional Onboarding</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="obs-toolbar-btn px-6 py-3 text-base"
                onClick={handleRestart}
              >
                <RotateCcw size={16} />
                <span>Replay Observation Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
