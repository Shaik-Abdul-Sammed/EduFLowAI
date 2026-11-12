import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const sampleEvents = {
  '2026-05-15': { title: 'Mid-Term Physics', type: 'exam', color: '#ef4444' },
  '2026-05-18': { title: 'Math Final Project Due', type: 'deadline', color: '#f59e0b' },
  '2026-05-24': { title: 'Annual Sports Day', type: 'event', color: '#10b981' },
}

export default function ExamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // default to May 2026 for demo
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  return (
    <RolePageTemplate
      role="Parent"
      title="Exam & Event Calendar"
      description="Track important dates, examinations, and institutional events."
    >
      <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' 
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--app-text, #0f172a)' }}>
            {MONTHS[month]} {year}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={prevMonth} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>&larr; Prev</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>Today</button>
            <button onClick={nextMonth} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '0.5rem' }}>Next &rarr;</button>
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></span> Exams</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></span> Deadlines</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></span> Events</div>
          </div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', 
            background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' 
          }}>
            {DAYS.map(day => (
              <div key={day} style={{ 
                background: '#f8fafc', padding: '0.75rem', textAlign: 'center', 
                fontWeight: 700, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' 
              }}>
                {day}
              </div>
            ))}
            
            {blanks.map(blank => (
              <div key={`blank-${blank}`} style={{ background: 'white', minHeight: '100px' }}></div>
            ))}

            {days.map(day => {
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const event = sampleEvents[dateString]
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <div key={day} style={{ 
                  background: isToday ? '#eff6ff' : 'white', minHeight: '100px', 
                  padding: '0.5rem', display: 'flex', flexDirection: 'column' 
                }}>
                  <div style={{ 
                    fontWeight: 700, fontSize: '0.875rem', 
                    color: isToday ? '#2563eb' : '#334155',
                    marginBottom: '0.5rem'
                  }}>
                    {day}
                  </div>
                  {event && (
                    <div style={{ 
                      fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.5rem', 
                      borderRadius: '0.3rem', background: `${event.color}15`, 
                      color: event.color, borderLeft: `3px solid ${event.color}`,
                      lineHeight: 1.2
                    }}>
                      {event.title}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
