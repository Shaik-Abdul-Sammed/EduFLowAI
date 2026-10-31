import { useState, useEffect } from 'react'
import {
  Sparkles,
  Shield,
  Calendar,
  Database,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Users
} from 'lucide-react'

export default function TourGuide() {
  const [isOpen, setIsOpen] = useState(() => !localStorage.getItem('eduflow_tour_completed'))
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [highlightedEl, setHighlightedEl] = useState(null)

  const steps = [
    {
      title: 'Welcome to EduFlow AI OS',
      desc: 'EduFlow is the autonomous AI operating system designed for Indian universities and engineering colleges. Explore key capabilities in this quick tour.',
      icon: Sparkles,
      color: '#2563EB',
      selector: '[data-tour="welcome"], header, .navbar, #root',
    },
    {
      title: '5 Specialized AI Officers',
      desc: 'Deploy Accreditation, Timetable, Student Success, Finance, and Admissions AI Officers that execute complex workflows in minutes instead of weeks.',
      icon: Users,
      color: '#8B5CF6',
      selector: '[data-tour="ai-officers"], nav, .sidebar-nav, aside',
    },
    {
      title: 'Non-Teaching Staff Delegation',
      desc: 'Deans and HODs can delegate specific officers to office assistants with DRAFT permission. Staff generate outputs, but all changes require your approval.',
      icon: Shield,
      color: '#10B981',
      selector: '[data-tour="staff-delegation"], [href*="staff"], aside',
    },
    {
      title: 'Academic Calendar & Holiday Sync',
      desc: 'Official Central and State gazetted holidays are auto-synced. Semesters guarantee UGC 90-day minimum teaching norms with automatic exam milestone cascading.',
      icon: Calendar,
      color: '#F59E0B',
      selector: '[data-tour="calendar"], [href*="calendar"]',
    },
    {
      title: 'Multi-Modal Portal Ingestion',
      desc: 'Connect your campus biometric devices, MySQL/Oracle ERP databases, or daily CSV attendance registers with zero migration downtime.',
      icon: Database,
      color: '#06B6D4',
      selector: '[data-tour="ingestion"], [href*="attendance"], [href*="integrations"]',
    },
  ]

  useEffect(() => {
    if (!isOpen) {
      if (highlightedEl) {
        highlightedEl.style.zIndex = ''
        highlightedEl.style.position = ''
      }
      return
    }

    if (typeof document === 'undefined') return

    const currentStep = steps[step]
    let el = null
    if (currentStep?.selector) {
      const selectors = currentStep.selector.split(',').map((s) => s.trim())
      for (const sel of selectors) {
        try {
          const found = document.querySelector(sel)
          if (found && found.getBoundingClientRect && found.getBoundingClientRect().width > 0) {
            el = found
            break
          }
        } catch (_err) {
          // ignore query selector error
        }
      }
    }

    if (highlightedEl && highlightedEl !== el) {
      highlightedEl.style.zIndex = ''
      highlightedEl.style.position = ''
    }

    if (el) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } catch (_err) {
        // ignore scroll error
      }

      const computedPos = typeof window !== 'undefined' ? window.getComputedStyle(el).position : ''
      if (computedPos === 'static') {
        el.style.position = 'relative'
      }
      el.style.zIndex = '9999'
      setHighlightedEl(el)

      const updateRect = () => {
        if (!el || !el.getBoundingClientRect) return
        const r = el.getBoundingClientRect()
        setTargetRect({
          top: r.top,
          bottom: r.bottom,
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
        })
      }
      updateRect()

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updateRect)
        window.addEventListener('scroll', updateRect, true)
        return () => {
          window.removeEventListener('resize', updateRect)
          window.removeEventListener('scroll', updateRect, true)
        }
      }
    } else {
      setTargetRect(null)
      setHighlightedEl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isOpen])

  useEffect(() => {
    return () => {
      if (highlightedEl) {
        highlightedEl.style.zIndex = ''
        highlightedEl.style.position = ''
      }
    }
  }, [highlightedEl])

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleComplete = () => {
    if (highlightedEl) {
      highlightedEl.style.zIndex = ''
      highlightedEl.style.position = ''
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('eduflow_tour_completed', 'true')
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  const current = steps[step]
  const Icon = current.icon

  // Calculate dynamic non-overlapping tooltip positioning
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200

  let tooltipStyle = {
    position: 'fixed',
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    zIndex: 9999,
    animation: 'fadeInUp 0.3s ease-in-out',
  }

  if (targetRect) {
    // If element is in top 50% of screen, position 20px below. Otherwise 20px above.
    const isTopHalf = targetRect.top < winHeight / 2
    if (isTopHalf) {
      tooltipStyle.top = `${Math.min(targetRect.bottom + 20, winHeight - 280)}px`
    } else {
      tooltipStyle.bottom = `${Math.max(winHeight - targetRect.top + 20, 20)}px`
    }

    const targetCenter = targetRect.left + targetRect.width / 2
    const idealLeft = targetCenter - 180
    const clampedLeft = Math.max(16, Math.min(idealLeft, winWidth - 376))
    tooltipStyle.left = `${clampedLeft}px`
  } else {
    tooltipStyle.bottom = '24px'
    tooltipStyle.right = '24px'
  }

  return (
    <>
      {/* Dimmed backdrop overlay sitting at z-index 9998 */}
      <div
        data-testid="tour-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />

      <div
        className="p-0 shadow-lg border rounded-3 bg-white"
        style={tooltipStyle}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
              Tour {step + 1}/{steps.length}
            </span>
            <span className="small fw-bold text-dark">Platform Onboarding</span>
          </div>
          <button
            type="button"
            className="btn btn-link text-muted p-0 text-decoration-none"
            onClick={handleComplete}
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              className="p-3 rounded-circle d-flex align-items-center justify-content-center"
              style={{ backgroundColor: `${current.color}15`, color: current.color }}
            >
              <Icon size={24} />
            </div>
            <h5 className="h6 fw-bold mb-0 text-dark">{current.title}</h5>
          </div>
          <p className="small text-muted mb-4">{current.desc}</p>

          {/* Progress dots */}
          <div className="d-flex justify-content-center gap-1 mb-3">
            {steps.map((_, i) => (
              <span
                key={i}
                className="rounded-circle"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: i === step ? current.color : '#E2E8F0',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            {step > 0 ? (
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handlePrev}>
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button className="btn btn-link btn-sm text-muted p-0 text-decoration-none" onClick={handleComplete}>
                Skip Tour
              </button>
            )}

            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 shadow-sm"
              onClick={handleNext}
            >
              {step === steps.length - 1 ? (
                <>
                  <CheckCircle2 size={14} /> Got It
                </>
              ) : (
                <>
                  Next <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
