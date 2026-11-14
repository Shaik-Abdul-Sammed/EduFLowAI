import { useState, useEffect, useRef } from 'react'

/**
 * SeatingChart Component
 * Renders a visual 6-column × 8-row classroom seating grid.
 *
 * Props:
 *   students:       Array<{ id, name, rollNo, status: 'PRESENT'|'ABSENT'|'DISPUTED' }>
 *   onStatusChange: (studentId, newStatus) => void
 */
export default function SeatingChart({ students = [], onStatusChange }) {
  const [selected, setSelected] = useState(null) // { student, seatIndex }
  const modalRef = useRef(null)

  const COLS = 6
  const ROWS = 8
  const TOTAL = COLS * ROWS

  // WCAG 2.2 keyboard dismiss on Escape & Focus Trap
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && selected) {
        setSelected(null)
        return
      }
      if (e.key === 'Tab' && selected && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (focusable.length > 0) {
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault()
              last.focus()
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected])

  const statusColors = {
    PRESENT:  { bg: '#22c55e', text: '#fff', label: 'Present' },
    ABSENT:   { bg: '#ef4444', text: '#fff', label: 'Absent' },
    DISPUTED: { bg: '#eab308', text: '#fff', label: 'Disputed' },
    EMPTY:    { bg: '#e2e8f0', text: '#94a3b8', label: 'Empty' },
  }

  function getStudentAtSeat(seatIdx) {
    return students[seatIdx] || null
  }

  function handleDeskClick(seatIdx) {
    const student = getStudentAtSeat(seatIdx)
    if (!student) return
    setSelected({ student, seatIdx })
  }

  function handleStatusChange(newStatus) {
    if (!selected) return
    onStatusChange?.(selected.student.id, newStatus)
    // Optimistically update selected student display
    setSelected(prev => ({
      ...prev,
      student: { ...prev.student, status: newStatus },
    }))
  }

  function closeModal() { setSelected(null) }

  const selStudent = selected?.student

  return (
    <div style={{ width: '100%' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {Object.entries(statusColors).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: v.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: 12, color: '#475569' }}>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minWidth: 480,
            width: '100%',
          }}
          role="grid"
          aria-label="Classroom seating chart"
        >
          {Array.from({ length: ROWS }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, minmax(75px, 1fr))`,
                gap: 8,
                width: '100%',
              }}
            >
              {Array.from({ length: COLS }).map((_, colIdx) => {
                const idx = rowIdx * COLS + colIdx
                const student = getStudentAtSeat(idx)
                const colorKey = student ? (student.status || 'EMPTY') : 'EMPTY'
                const color = statusColors[colorKey] || statusColors.EMPTY
                return (
                  <div
                    key={idx}
                    role="gridcell"
                    aria-label={student ? `Seat ${idx + 1}: ${student.name}, ${color.label}` : `Seat ${idx + 1}: Empty`}
                    tabIndex={student ? 0 : -1}
                    onClick={() => handleDeskClick(idx)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDeskClick(idx)}
                    style={{
                      background: color.bg,
                      color: color.text,
                      borderRadius: 8,
                      padding: '10px 6px',
                      textAlign: 'center',
                      cursor: student ? 'pointer' : 'default',
                      fontSize: 11,
                      fontWeight: 600,
                      minHeight: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      wordBreak: 'break-word',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.75, marginBottom: 2 }}>#{idx + 1}</span>
                    {student ? (
                      <>
                        <span style={{ lineHeight: 1.2 }}>{student.name?.split(' ')[0] || '—'}</span>
                        <span style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>{student.rollNo || ''}</span>
                      </>
                    ) : (
                      <span style={{ opacity: 0.4, fontSize: 10 }}>Empty</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 14, fontSize: 13, color: '#475569' }}>
        <span>Total Seats: {TOTAL}</span>
        <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Present: {students.filter(s => s.status === 'PRESENT').length}</span>
        <span style={{ color: '#dc2626', fontWeight: 600 }}>❌ Absent: {students.filter(s => s.status === 'ABSENT').length}</span>
        <span style={{ color: '#ca8a04', fontWeight: 600 }}>⚠️ Disputed: {students.filter(s => s.status === 'DISPUTED').length}</span>
        <span>🪑 Empty: {TOTAL - students.length}</span>
      </div>

      {/* Detail Modal */}
      {selected && selStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Student details: ${selStudent.name}`}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            ref={modalRef}
            style={{
            background: '#fff', borderRadius: 14, padding: 28,
            maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
              {selStudent.name}
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
              Roll No: <strong>{selStudent.rollNo || '—'}</strong>
            </p>

            {/* Status badge */}
            <div style={{ marginBottom: 20 }}>
              {(() => {
                const c = statusColors[selStudent.status || 'EMPTY'] || statusColors.EMPTY
                return (
                  <span style={{
                    background: c.bg, color: c.text,
                    borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700,
                  }}>
                    {c.label}
                  </span>
                )
              })()}
            </div>

            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>Change status:</p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleStatusChange('PRESENT')}
                aria-label="Mark student as Present"
                style={actionBtn('#22c55e')}
              >
                ✅ Mark Present
              </button>
              <button
                onClick={() => handleStatusChange('ABSENT')}
                aria-label="Mark student as Absent"
                style={actionBtn('#ef4444')}
              >
                ❌ Mark Absent
              </button>
              <button
                onClick={() => handleStatusChange('DISPUTED')}
                aria-label="Mark student as Disputed"
                style={actionBtn('#eab308')}
              >
                ⚠️ Disputed
              </button>
            </div>

            <button
              onClick={closeModal}
              aria-label="Close student details dialog"
              style={{
                marginTop: 18, width: '100%', background: '#f1f5f9',
                color: '#475569', border: 'none', borderRadius: 8,
                padding: '9px 0', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function actionBtn(bg) {
  return {
    background: bg, color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    flexShrink: 0,
  }
}
