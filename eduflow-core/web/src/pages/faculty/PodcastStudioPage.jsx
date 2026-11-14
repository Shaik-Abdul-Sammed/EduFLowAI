import { useState } from 'react'
import { Mic, Play, Pause, UploadCloud, Radio, Volume2, FileAudio, CheckCircle2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import AudioRecorder from '../../components/AudioRecorder'

export default function PodcastStudioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Lecture 14: Consensus Invariants in Raft vs Paxos',
    course: 'CS401 Distributed Systems',
    duration: '24:18',
    faculty: 'Prof. Ananya Sen',
    audioUrl: 'https://example.com/audio/sample-lecture.mp3'
  })
  const [uploadedEpisodes, setUploadedEpisodes] = useState([
    {
      id: 1,
      title: 'Lecture 14: Consensus Invariants in Raft vs Paxos',
      course: 'CS401 Distributed Systems',
      duration: '24:18',
      date: 'Nov 12, 2026',
      listens: 142
    },
    {
      id: 2,
      title: 'Lecture 13: Virtual Memory & Multi-Level Page Tables',
      course: 'CS301 Operating Systems',
      duration: '18:45',
      date: 'Nov 10, 2026',
      listens: 210
    },
    {
      id: 3,
      title: 'Seminar: Deep Residual Networks for Medical Imaging',
      course: 'AI302 Deep Learning',
      duration: '31:02',
      date: 'Nov 08, 2026',
      listens: 98
    }
  ])
  const [newTitle, setNewTitle] = useState('')
  const [newCourse, setNewCourse] = useState('CS401 Distributed Systems')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleUploadEpisode = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newEp = {
      id: uploadedEpisodes.length + 1,
      title: newTitle.trim(),
      course: newCourse,
      duration: '15:20',
      date: 'Just now',
      listens: 1
    }
    setUploadedEpisodes([newEp, ...uploadedEpisodes])
    setNewTitle('')
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 3000)
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Academic Podcast & Audio Lecture Studio"
      description="Record, master, and distribute high-fidelity audio lectures and micro-podcasts for multi-modal student learning on commutes."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4">
            <span className="badge bg-light text-primary px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.72rem' }}>
              ● MULTI-MODAL AUDIO REPOSITORY
            </span>
            <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
              Professor Audio Master Studio
            </h2>
            <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
              High-efficiency compressed lectures with automatic chapter indexing and synchronized speech-to-text transcripts.
            </p>
          </div>
        </div>

        {/* Live Audio Recorder Component */}
        <AudioRecorder
          courseCode={newCourse}
          onUploadComplete={(media) => {
            if (media?.title) {
              setUploadedEpisodes(prev => [{
                id: prev.length + 1,
                title: media.title,
                course: newCourse,
                duration: `${Math.floor((media.duration || 30) / 60)}:${((media.duration || 30) % 60).toString().padStart(2, '0')}`,
                date: 'Just now',
                listens: 1
              }, ...prev])
            }
          }}
        />

        {/* Studio Content Split */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Upload New Lecture Pod */}
          <div style={{ flex: '1 1 380px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Mic size={20} className="text-primary" />
                <h3 className="h6 fw-bold text-dark mb-0">Publish New Audio Lecture</h3>
              </div>

              {uploadSuccess && (
                <div className="p-2 mb-3 bg-success-subtle text-success rounded-3 small fw-bold d-flex align-items-center gap-1">
                  <CheckCircle2 size={15} /> Episode mastered and published to student feeds!
                </div>
              )}

              <form onSubmit={handleUploadEpisode}>
                <div className="mb-3">
                  <label htmlFor="episodeTitleInput" className="form-label small fw-bold text-muted">
                    LECTURE EPISODE TITLE
                  </label>
                  <input
                    id="episodeTitleInput"
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Ep 15: Two-Phase Locking and Strict ACID Isolation"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ borderRadius: '0.75rem', height: '46px' }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="courseTargetSelect" className="form-label small fw-bold text-muted">
                    ASSOCIATED COURSE MODULE
                  </label>
                  <select
                    id="courseTargetSelect"
                    className="form-select"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    style={{ borderRadius: '0.75rem', height: '46px' }}
                  >
                    <option value="CS401 Distributed Systems">CS401 Distributed Systems</option>
                    <option value="CS301 Operating Systems">CS301 Operating Systems</option>
                    <option value="AI302 Deep Learning">AI302 Deep Learning</option>
                    <option value="GEN101 Ethical AI Leadership">GEN101 Ethical AI Leadership</option>
                  </select>
                </div>

                <div className="p-4 rounded-4 border border-dashed text-center bg-light mb-4">
                  <UploadCloud size={32} className="text-muted mb-2" />
                  <div className="small fw-bold text-dark">Drag &amp; Drop Master MP3 / M4A / FLAC</div>
                  <div className="text-muted small">Automatic AI Noise Reduction &amp; Dynamic Range Compression Applied</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ padding: '12px 24px', borderRadius: '0.85rem' }}
                >
                  <Radio size={16} /> Publish Lecture Stream
                </button>
              </form>
            </div>
          </div>

          {/* Player & Library */}
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              
              {/* Active Player Card */}
              <div className="p-4 rounded-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-primary-subtle text-light small px-2 py-1">NOW PLAYING</span>
                  <Volume2 size={18} className="text-light" />
                </div>
                <h4 className="h6 fw-bold mb-1" style={{ wordBreak: 'break-word' }}>{currentTrack.title}</h4>
                <small className="text-white-50 d-block mb-3">{currentTrack.course} • {currentTrack.faculty}</small>

                {/* Progress bar mock */}
                <div className="progress mb-2" style={{ height: '6px', borderRadius: '4px' }}>
                  <div className="progress-bar bg-info" style={{ width: isPlaying ? '64%' : '32%' }} />
                </div>
                <div className="d-flex justify-content-between text-white-50 small mb-3">
                  <span>07:42</span>
                  <span>{currentTrack.duration}</span>
                </div>

                {/* Controls */}
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow"
                    style={{ width: 48, height: 48, padding: 0 }}
                    aria-label={isPlaying ? 'Pause Lecture' : 'Play Lecture'}
                  >
                    {isPlaying ? <Pause size={20} className="text-dark" /> : <Play size={20} className="text-dark ms-1" />}
                  </button>
                </div>
              </div>

              {/* Published Episodes Feed */}
              <h4 className="h6 fw-bold text-dark mb-3">Published Course Episodes</h4>
              <div style={{ display: 'grid', gap: '0.75rem', overflowY: 'auto', maxHeight: '280px' }}>
                {uploadedEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  >
                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                      <FileAudio size={20} className="text-primary flex-shrink-0" />
                      <div style={{ minWidth: 0 }}>
                        <div className="fw-bold small text-dark text-truncate">{ep.title}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {ep.course} • {ep.duration} • {ep.listens} streams
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTrack({ ...currentTrack, title: ep.title, course: ep.course, duration: ep.duration })
                        setIsPlaying(true)
                      }}
                      className="btn btn-sm btn-outline-primary ms-2 flex-shrink-0"
                      style={{ borderRadius: '0.5rem', padding: '6px 12px' }}
                    >
                      <Play size={12} className="me-1 inline" /> Listen
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </RolePageTemplate>
  )
}
