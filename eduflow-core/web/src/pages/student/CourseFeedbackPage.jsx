import { useState } from 'react'
import { Star, MessageSquare, Send, CheckCircle2, Shield } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function CourseFeedbackPage() {
  const [courses] = useState([
    { code: 'CS301', name: 'Operating Systems & Concurrency', instructor: 'Dr. Ramesh Sundaram', submitted: false },
    { code: 'CS304', name: 'Database Management Systems', instructor: 'Prof. Anupama Verma', submitted: true }
  ])
  const [selectedCourse, setSelectedCourse] = useState('CS301')
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [submittedList, setSubmittedList] = useState(['CS304'])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmittedList(prev => [...prev, selectedCourse])
    setFeedback('')
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Anonymous Course & Pedagogy Evaluation"
      description="Submit confidential teaching feedback to improve course curriculum, lecture pacing, and laboratory practicals."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex align-items-center gap-2 mb-3 text-success">
            <Shield size={20} />
            <span className="small fw-bold">End-to-End Cryptographically Blinded & Anonymous</span>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label small fw-semibold">Select Enrolled Course</label>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map(c => (
                  <option key={c.code} value={c.code} disabled={submittedList.includes(c.code)}>
                    {c.code} - {c.name} ({c.instructor}) {submittedList.includes(c.code) ? '[Submitted]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label small fw-semibold">Teaching Effectiveness & Clarity (1 to 5 Stars)</label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="btn btn-sm btn-outline-warning"
                  >
                    <Star size={18} fill={rating >= star ? '#f59e0b' : 'none'} color="#f59e0b" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label small fw-semibold">Detailed Constructive Remarks</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Share specific suggestions regarding syllabus coverage, assignments, or lab demos..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittedList.includes(selectedCourse)}
              className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 align-self-start"
            >
              <Send size={16} /> Submit Anonymous Feedback
            </button>
          </form>
        </div>
      </div>
    </RolePageTemplate>
  )
}
