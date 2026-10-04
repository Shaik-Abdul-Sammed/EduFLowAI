import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Database, ArrowLeft, RefreshCw, CheckCircle, Circle, Upload, FileText } from 'lucide-react'
import { getFullApiUrl } from '../../config/apiConfig'

const DEMO_TWIN = {
  name: 'Springfield Engineering College',
  shortName: 'SEC',
  tagline: 'Excellence in Engineering Education',
  location: 'Hyderabad, Telangana',
  type: 'Engineering College',
  primaryColor: '#2563EB',
  accentColor: '#F59E0B',
  fontFamily: 'Inter',
  departments: ['Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'MBA'],
  courses: ['B.Tech (4yr)', 'M.Tech (2yr)', 'MBA (2yr)'],
  modules: ['Attendance', 'Fees', 'Marks', 'Timetable', 'Library'],
  infrastructure: {
    Hostel: true, Transport: true, Library: true,
    Canteen: true, Labs: true, Placement: true, Sports: false,
  },
  builds: [
    { id: '#001', status: 'done', date: '2026-08-01', version: '1.0.0' },
    { id: '#002', status: 'done', date: '2026-08-02', version: '1.0.1' },
  ],
  lastUpdated: '2026-08-02T15:00:00Z',
}

const glass = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem' }

export default function DigitalTwinManager() {
  const [twin] = useState(DEMO_TWIN)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleFileUpload(file)
  }

  const handleFileUpload = async (file) => {
    setIsUploading(true)
    setUploadMessage({ type: 'info', text: 'Ingesting document into Digital Twin...' })

    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(getFullApiUrl('/v1/digital-twin/ingest'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setUploadMessage({ type: 'success', text: `Successfully ingested: ${file.name} (~${data.details.estimatedTokens} tokens)` })
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E27', color: 'white', fontFamily: 'Inter, sans-serif', padding: '1.5rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/ai-terminal" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.4rem', fontSize: '0.88rem' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={22} color="#2563EB" />
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Digital Twin</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Last updated: {new Date(twin.lastUpdated).toLocaleString()}</span>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: '#60a5fa', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Sync with AI
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1rem' }}>
          {/* Identity */}
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏫 Identity</h3>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>{twin.name}</p>
            <p style={{ margin: '0 0 0.25rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>{twin.tagline}</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>📍 {twin.location} · {twin.type}</p>
          </div>

          {/* Brand */}
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🎨 Brand</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: twin.primaryColor, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Primary</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{twin.primaryColor}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: twin.accentColor, flexShrink: 0, marginLeft: '0.5rem' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Accent</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{twin.accentColor}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Font: {twin.fontFamily}</p>
          </div>

          {/* Academics */}
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📚 Academics</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {twin.departments.map(d => (
                <span key={d} style={{ padding: '0.3rem 0.65rem', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 20, fontSize: '0.78rem', color: '#93c5fd' }}>{d}</span>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏗️ Infrastructure</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {Object.entries(twin.infrastructure).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  {val ? <CheckCircle size={15} color="#10B981" /> : <Circle size={15} color="rgba(255,255,255,0.2)" />}
                  <span style={{ color: val ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔌 Active Modules</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {twin.modules.map(m => (
                <span key={m} style={{ padding: '0.3rem 0.65rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, fontSize: '0.78rem', color: '#6ee7b7' }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Builds */}
          <div style={glass}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📊 Build History</h3>
            {twin.builds.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={15} color="#10B981" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Build {b.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>v{b.version}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{b.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Knowledge Ingestion */}
          <div style={{ ...glass, gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🧠 Knowledge Ingestion</h3>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: `2px dashed ${isDragging ? '#2563EB' : 'rgba(255,255,255,0.2)'}`, 
                borderRadius: 16, 
                padding: '3rem', 
                textAlign: 'center', 
                background: isDragging ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])} 
                accept=".pdf,.txt,.docx" 
              />
              {isUploading ? (
                <div style={{ color: '#60a5fa' }}>
                  <RefreshCw size={32} className="spinning" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Ingesting document...</p>
                </div>
              ) : (
                <>
                  <Upload size={32} color={isDragging ? '#60a5fa' : 'rgba(255,255,255,0.4)'} style={{ marginBottom: '1rem' }} />
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>Drag & drop documents to train your Digital Twin</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Supports PDF, TXT, DOCX (Max 5MB)</p>
                </>
              )}
            </div>
            {uploadMessage && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem 1rem', 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.85rem',
                background: uploadMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : uploadMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37,99,235,0.1)',
                color: uploadMessage.type === 'error' ? '#fca5a5' : uploadMessage.type === 'success' ? '#6ee7b7' : '#93c5fd',
                border: `1px solid ${uploadMessage.type === 'error' ? 'rgba(239,68,68,0.2)' : uploadMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(37,99,235,0.2)'}`
              }}>
                {uploadMessage.type === 'success' ? <CheckCircle size={16} /> : uploadMessage.type === 'error' ? <Circle size={16} /> : <FileText size={16} />}
                {uploadMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
