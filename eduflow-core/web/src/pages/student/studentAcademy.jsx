import { useState } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { studentDummyIds, courseTracks, referenceLibrary, weeklyExamSchedule, sectionMap } from '../../utils/studentCatalog'

const BLUE = '#2563EB'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const PURPLE = '#8B5CF6'

export default function Page() {
  const [activeTab, setActiveTab] = useState('tracks')

  return (
    <RolePageTemplate role="Student" title="Student Academy" description="Explore entrance-exam tracks, reference libraries, weekly exams, and section capacity planners.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Premium Banner */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden', background: 'linear-gradient(135deg, #1E1B4B, #4338CA)', color: 'white' }}>
          <div className="card-body p-4 p-md-5 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="badge text-bg-light text-primary mb-2" style={{ fontWeight: 700 }}>ACADEMIC SERVICES</span>
              <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>EduFlow Integrated Academy Hub</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Explore academic catalogs, dummy student profiles, mock tracks, and resources.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', lineHeight: 1 }}>{studentDummyIds.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase' }}>Sample Students</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {[
            { id: 'tracks', label: '📖 Course Tracks', color: BLUE },
            { id: 'exams', label: '📅 Weekly Exams', color: AMBER },
            { id: 'references', label: '📚 References Hub', color: GREEN },
            { id: 'sections', label: '🏫 Section Planner', color: PURPLE },
            { id: 'dummy', label: '👥 Sample Student Profiles', color: '#64748b' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.55rem 1.15rem', borderRadius: '2rem',
                border: `2px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
                background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                color: activeTab === tab.id ? tab.color : '#64748b',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'tracks' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
              {courseTracks.map((track, i) => (
                <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem', borderLeft: `4px solid ${BLUE}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--svc-navy)' }}>{track.title}</span>
                    <span className="badge text-bg-primary" style={{ fontSize: '0.65rem' }}>Track</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <span>Stream: <strong>{track.stream}</strong></span>
                    <span>•</span>
                    <span>Section: <strong>{track.section}</strong></span>
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: 0, color: '#475569', lineHeight: 1.5 }}>{track.focus}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'exams' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.875rem' }}>
              {weeklyExamSchedule.map((exam, i) => (
                <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem', borderLeft: `4px solid ${AMBER}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: AMBER }}>📅 {exam.day}</span>
                    <span className="badge text-bg-warning" style={{ fontSize: '0.62rem', color: '#78350f' }}>Weekly</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{exam.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Section: {exam.section}</div>
                  <p style={{ fontSize: '0.8rem', margin: 0, color: '#475569', fontWeight: 600 }}>Topic: {exam.topic}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'references' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.875rem' }}>
              {referenceLibrary.map((ref, i) => (
                <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem', borderLeft: `4px solid ${GREEN}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge text-bg-success" style={{ fontSize: '0.65rem' }}>{ref.format}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>📚 {ref.tag}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--app-text, #1e293b)' }}>{ref.title}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sections' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
              {sectionMap.map((sec, i) => (
                <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem', borderLeft: `4px solid ${PURPLE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: PURPLE }}>{sec.code}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>Stream: {sec.stream}</div>
                  </div>
                  <div style={{ padding: '0.4rem 0.875rem', borderRadius: '0.75rem', background: '#F1F5F9', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>{sec.capacity}</div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Seats</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dummy' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
              {studentDummyIds.map((student, i) => (
                <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                      👨‍🎓
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{student.stream} • {student.section}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.875rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>DUMMY ID:</span>
                    <strong style={{ fontSize: '0.78rem', color: BLUE, fontFamily: 'monospace' }}>{student.id}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </RolePageTemplate>
  )
}