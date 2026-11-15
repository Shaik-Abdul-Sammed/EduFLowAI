import { useState } from 'react'
import { Calendar, Clock, CheckCircle2, Plus, Sparkles, BookOpen } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState([
    { id: 1, subject: 'Operating Systems', topic: 'Virtual Memory & Page Replacement', duration: '45 mins', dueDate: 'Today, 6:00 PM', completed: false, priority: 'High' },
    { id: 2, subject: 'Database Management', topic: 'B+ Tree Indexing & Query Tuning', duration: '60 mins', dueDate: 'Tomorrow, 10:00 AM', completed: true, priority: 'Medium' },
    { id: 3, subject: 'Algorithms', topic: 'Dynamic Programming - Matrix Chain', duration: '90 mins', dueDate: 'Nov 18, 2026', completed: false, priority: 'High' },
  ])
  const [newSubject, setNewSubject] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [newDuration, setNewDuration] = useState('45 mins')

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newSubject.trim() || !newTopic.trim()) return
    const newTask = {
      id: Date.now(),
      subject: newSubject.trim(),
      topic: newTopic.trim(),
      duration: newDuration,
      dueDate: 'Scheduled Today',
      completed: false,
      priority: 'Medium'
    }
    setTasks(prev => [newTask, ...prev])
    setNewSubject('')
    setNewTopic('')
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  return (
    <RolePageTemplate
      role="Student"
      title="AI Revision & Study Schedule Planner"
      description="Personalized study scheduler, exam countdown tracker, and adaptive revision habit optimizer."
    >
      <div className="d-flex flex-column gap-4 w-100">
        {/* Metric Cards */}
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-muted small">Daily Revision Target</div>
                  <div className="h4 fw-bold mb-0">3.5 hrs / day</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-muted small">Tasks Completed</div>
                  <div className="h4 fw-bold mb-0">{tasks.filter(t => t.completed).length} of {tasks.length}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-3 h-100" style={{ background: 'var(--card-bg, #ffffff)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="text-muted small">Consistency Streak</div>
                  <div className="h4 fw-bold mb-0">12 Days 🔥</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Plan Form */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Plus size={18} className="text-primary" /> Schedule New Revision Session
          </h3>
          <form onSubmit={handleAddTask} className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Operating Systems"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold">Chapter / Topic</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Memory Management"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold">Target Duration</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                >
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="60 mins">60 mins</option>
                  <option value="90 mins">90 mins</option>
                </select>
                <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-1">
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Task Table */}
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Calendar size={18} className="text-primary" /> Active Study Schedule
          </h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 50 }}>Status</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Duration</th>
                  <th>Due Target</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ opacity: task.completed ? 0.6 : 1 }}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`Mark ${task.topic} complete`}
                      />
                    </td>
                    <td className="fw-semibold">
                      <span className="d-flex align-items-center gap-2">
                        <BookOpen size={16} className="text-muted" /> {task.subject}
                      </span>
                    </td>
                    <td>{task.topic}</td>
                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{task.duration}</span></td>
                    <td>{task.dueDate}</td>
                    <td>
                      <span className={`badge ${task.priority === 'High' ? 'bg-danger' : 'bg-primary'} bg-opacity-10 text-${task.priority === 'High' ? 'danger' : 'primary'}`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
