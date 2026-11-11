import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Cpu, CheckCircle, Clock, Play, Download, Circle } from 'lucide-react'

const PIPELINE_STEPS = [
  'Understanding Request',
  'Updating Digital Twin',
  'Generating Flutter Code',
  'Installing Dependencies',
  'Running Static Analysis',
  'Running Tests',
  'Compiling APK',
  'Compiling AAB',
  'Generating Release Assets',
]

const MOCK_BUILDS = [
  { id: 'build-002', trigger: 'Add hostel module', status: 'done', duration: '4m 12s', version: '1.0.1', date: '2026-08-02', hasApk: true, hasAab: true },
  { id: 'build-001', trigger: 'Initial app generation', status: 'done', duration: '6m 44s', version: '1.0.0', date: '2026-08-01', hasApk: true, hasAab: true },
]

const STATUS_COLORS = { done: '#10B981', failed: '#EF4444', queued: '#F59E0B', running: '#2563EB' }

export default function BuildManager() {
  const [activeBuild, setActiveBuild] = useState(null)
  const [activeStep, setActiveStep] = useState(2) // Demo: step 3 in progress

  const triggerDemoBuild = () => {
    setActiveBuild({ id: 'build-003', trigger: 'Demo Build', status: 'running', step: 0 })
    setActiveStep(0)
    const interval = setInterval(() => {
      setActiveStep(s => {
        if (s >= PIPELINE_STEPS.length - 1) { clearInterval(interval); setActiveBuild(null); return s }
        return s + 1
      })
    }, 1200)
  }

  const glass = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem' }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E27', color: 'white', fontFamily: 'Inter, sans-serif', padding: '1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/ai-terminal" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.4rem', fontSize: '0.88rem' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cpu size={22} color="#2563EB" />
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Build Manager</h1>
            </div>
          </div>
          <button onClick={triggerDemoBuild} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', border: 'none', borderRadius: 12, color: 'white', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
            <Play size={14} /> Trigger New Build
          </button>
        </div>

        {/* Active build */}
        {activeBuild && (
          <div style={{ ...glass, marginBottom: '1.5rem', borderColor: 'rgba(37,99,235,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563EB', animation: 'pulse 1s ease infinite' }} />
              <span style={{ fontWeight: 700 }}>Build Running — {activeBuild.trigger}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PIPELINE_STEPS.map((step, i) => {
                const done = i < activeStep
                const running = i === activeStep
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {done ? <CheckCircle size={16} color="#10B981" /> : running ? <Clock size={16} color="#F59E0B" style={{ animation: 'spin 1s linear infinite' }} /> : <Circle size={16} color="rgba(255,255,255,0.15)" />}
                    <span style={{ fontSize: '0.88rem', color: done ? 'rgba(255,255,255,0.7)' : running ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: running ? 700 : 400 }}>{step}{running ? '...' : ''}</span>
                  </div>
                )
              })}
            </div>
            {/* Log area */}
            <div style={{ marginTop: '1rem', background: '#000', borderRadius: 10, padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#10B981', maxHeight: 120, overflow: 'auto', lineHeight: 1.7 }}>
              <div>$ flutter pub get</div>
              <div>Running "flutter pub get" in project...</div>
              <div style={{ color: '#F59E0B' }}>$ flutter analyze</div>
              <div>Analyzing project...</div>
            </div>
          </div>
        )}

        {/* Past builds */}
        <div style={glass}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Build History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Build', 'Triggered By', 'Status', 'Duration', 'Version', 'APK', 'AAB'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_BUILDS.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace' }}>{b.id}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.trigger}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: `${STATUS_COLORS[b.status]}22`, color: STATUS_COLORS[b.status] }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.83rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{b.duration}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)' }}>v{b.version}</td>
                    <td style={{ padding: '0.75rem' }}>{b.hasApk && <button aria-label={`Download APK for ${b.id}`} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#6ee7b7', fontSize: '0.75rem', padding: '0.25rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Download size={12} /> APK</button>}</td>
                    <td style={{ padding: '0.75rem' }}>{b.hasAab && <button aria-label={`Download AAB for ${b.id}`} style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, color: '#93c5fd', fontSize: '0.75rem', padding: '0.25rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Download size={12} /> AAB</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
