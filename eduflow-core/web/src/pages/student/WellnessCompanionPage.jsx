import { useState } from 'react'
import { Heart, Smile, Meh, Frown, Sparkles, PhoneCall, ShieldCheck } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function WellnessCompanionPage() {
  const [selectedMood, setSelectedMood] = useState('Good')
  const [sessionBooked, setSessionBooked] = useState(false)

  return (
    <RolePageTemplate
      role="Student"
      title="Student Mental Wellness & Stress Companion"
      description="Confidential counseling scheduling, daily mental decompression exercises, and peer support helpline."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Heart size={18} className="text-danger" /> Daily Mood & Stress Check-in
          </h3>
          <p className="text-muted small">Your response is 100% confidential and anonymized.</p>
          <div className="d-flex gap-3 flex-wrap">
            {[
              { label: 'Energized', icon: <Smile className="text-success" size={24} /> },
              { label: 'Balanced', icon: <Smile className="text-primary" size={24} /> },
              { label: 'Fatigued', icon: <Meh className="text-warning" size={24} /> },
              { label: 'Overwhelmed', icon: <Frown className="text-danger" size={24} /> }
            ].map(m => (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelectedMood(m.label)}
                className={`btn d-flex align-items-center gap-2 p-3 rounded-3 border ${selectedMood === m.label ? 'border-primary bg-primary bg-opacity-10' : 'bg-light'}`}
              >
                {m.icon}
                <span className="fw-semibold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                <Sparkles size={20} />
                <h4 className="h6 fw-bold mb-0">Guided 4-7-8 Breathing Decompression</h4>
              </div>
              <p className="text-muted small">Inhale for 4 seconds, hold for 7 seconds, and exhale steadily for 8 seconds to lower cortisol levels before exams.</p>
              <div className="p-3 bg-light rounded text-center my-auto">
                <div className="display-6 fw-bold text-primary mb-1">04 : 00</div>
                <div className="small text-muted">Ready for session</div>
              </div>
              <button className="btn btn-outline-primary mt-3 w-100">Start Breathing Cycle</button>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="d-flex align-items-center gap-2 mb-3 text-danger">
                <PhoneCall size={20} />
                <h4 className="h6 fw-bold mb-0">Campus Psychological Counseling Cell</h4>
              </div>
              <p className="text-muted small">Book a private, zero-judgment 1-on-1 counseling session with institutional psychologists.</p>
              <div className="p-3 bg-light rounded small mb-3">
                <ShieldCheck size={16} className="text-success inline me-1" /> All student medical disclosures protected under institutional confidentiality norms.
              </div>
              <button
                type="button"
                onClick={() => setSessionBooked(true)}
                disabled={sessionBooked}
                className="btn btn-primary w-100"
              >
                {sessionBooked ? 'Session Booked (Confirmation Sent)' : 'Schedule Confidential Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
