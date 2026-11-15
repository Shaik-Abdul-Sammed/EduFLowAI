import { useState } from 'react'
import { Pin } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function ClassDiscussionBoardPage() {
  const [threads] = useState([
    {
      id: 1,
      pinned: true,
      title: 'Lab 4 Setup: Configuring Local Minikube and Ingress Controller',
      author: 'Prof. Ramesh Sundaram (Instructor)',
      replies: 18,
      lastActive: '10 mins ago',
      resolved: true
    },
    {
      id: 2,
      pinned: false,
      title: 'Clarification on End-Term Project Submission Deadlines for Phase 2',
      author: 'Varun Desai (Student)',
      replies: 6,
      lastActive: '1 hour ago',
      resolved: false
    }
  ])

  return (
    <RolePageTemplate
      role="Faculty"
      title="Course Q&A & Discussion Moderation Board"
      description="Moderate student course discussions, pin critical exam guidelines, endorse verified solutions, and answer inquiries."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h6 fw-bold mb-0">Class Discussion Stream</h3>
            <span className="badge bg-primary">Operating Systems (CS301)</span>
          </div>

          <div className="d-flex flex-column gap-3">
            {threads.map(t => (
              <div key={t.id} className="p-3 rounded-3 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    {t.pinned && (
                      <span className="badge bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center gap-1">
                        <Pin size={12} /> Pinned Instructor Post
                      </span>
                    )}
                    <span className="badge bg-secondary bg-opacity-10 text-secondary">{t.replies} Replies</span>
                  </div>
                  <span className="small text-muted">{t.lastActive}</span>
                </div>
                <h4 className="h6 fw-bold mb-1">{t.title}</h4>
                <div className="small text-muted">Author: {t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
