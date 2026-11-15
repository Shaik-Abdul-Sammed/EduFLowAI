import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Command, X, Home, Users, CheckSquare, DollarSign, Brain, GraduationCap, FileText, Upload, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function CommandPalette({ isOpen: propIsOpen, onClose: propOnClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  let user = null
  try {
    const auth = useAuth()
    user = auth?.user
  } catch {
    // Graceful fallback if outside AuthProvider
  }
  const inputRef = useRef(null)

  const activeIsOpen = propIsOpen !== undefined ? propIsOpen : isOpen
  const handleClose = () => {
    if (propOnClose) propOnClose()
    setIsOpen(false)
    setQuery('')
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape' && activeIsOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIsOpen])

  useEffect(() => {
    if (activeIsOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelectedIndex(0)
    }
  }, [activeIsOpen])

  const commands = [
    { id: 'dashboard', title: 'Dashboard', subtitle: 'Go to main portal home', path: user?.role ? `/${user.role}-dashboard` : '/admin-dashboard', icon: Home, category: 'Navigation' },
    { id: 'students', title: 'Student Management', subtitle: 'View, filter and edit enrolled students', path: '/admin/students', icon: Users, category: 'Academic' },
    { id: 'attendance', title: 'BLE & Wi-Fi Attendance', subtitle: 'Track student presence and auto-sync records', path: '/admin/attendance', icon: CheckSquare, category: 'Academic' },
    { id: 'fees', title: 'Fees & Invoicing', subtitle: 'View fee defaulters and fee collection tracking', path: '/admin/finance/invoices', icon: DollarSign, category: 'Finance' },
    { id: 'officers', title: 'AI Officers Hub', subtitle: 'Access Accreditation, Timetable, and Admissions AI', path: '/officers', icon: Brain, category: 'AI Tools' },
    { id: 'degree-audit', title: 'Degree Audit Engine', subtitle: 'Evaluate graduation credit compliance', path: '/admin/degree-audit', icon: GraduationCap, category: 'Academic' },
    { id: 'admissions', title: 'AI Admission Review', subtitle: 'Analyze applicant applications and financial criteria', path: '/admin/admissions-ai', icon: FileText, category: 'Admissions' },
    { id: 'certificates', title: 'Bonafide Certificates', subtitle: 'Generate verifiable student certificates with QR code', path: '/student/certificates', icon: FileText, category: 'Certificates' },
    { id: 'bulk-import', title: 'Bulk CSV Importer', subtitle: 'Import faculty and courses with zero partial state', path: '/admin/bulk-import', icon: Upload, category: 'Admin' },
    { id: 'settings', title: 'Institution Settings', subtitle: 'Configure campus branding and parameters', path: '/institution-settings', icon: Settings, category: 'System' },
  ]

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (cmd) => {
    if (cmd?.path) {
      navigate(cmd.path)
      handleClose()
    }
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    }
  }

  if (!activeIsOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '4rem', background: 'rgba(0,0,0,0.65)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-slate-700 bg-slate-900 text-white"
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #1e293b' }}>
          <Search size={18} className="text-slate-400 mr-2" style={{ color: '#94a3b8', marginRight: '0.5rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search modules... (Press Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleInputKeyDown}
            aria-label="Command palette input"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.95rem',
            }}
          />
          <div className="flex items-center gap-1.5" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', background: '#1e293b', border: '1px solid #334155', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#94a3b8' }}>
              ESC
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close command palette"
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Command list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem', maxHeight: 'calc(90vh - 110px)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={cmd.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    marginBottom: '0.25rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#1e293b' : 'transparent',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#3b82f6' : '#1e293b',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                      {cmd.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {cmd.subtitle}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#334155', color: '#cbd5e1' }}>
                    {cmd.category}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #1e293b', background: '#090d16', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Navigation: ↑ ↓ arrows</span>
          <span>Open: Enter</span>
          <span>Close: Esc</span>
        </div>
      </div>
    </div>
  )
}
