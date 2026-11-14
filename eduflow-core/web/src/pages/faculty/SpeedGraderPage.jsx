import { useState } from 'react'
import { Check, CheckCircle2, ChevronLeft, ChevronRight, FileCode, MessageSquare, Award, Sparkles } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function SpeedGraderPage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [rubricScores, setRubricScores] = useState({
    correctness: 22,
    architecture: 20,
    testing: 18,
    documentation: 24,
  })
  const [feedback, setFeedback] = useState('Excellent algorithmic efficiency. Recommend adding unit tests for empty tree boundary conditions.')
  const [autoSaved, setAutoSaved] = useState(true)

  const submissions = [
    {
      id: 1,
      studentName: 'Aarav Sharma',
      rollNumber: '2024-CSE-042',
      assignment: 'Assignment 4: Balanced AVL Tree & Red-Black Balancing',
      submittedAt: 'Nov 12, 2026 at 11:42 PM',
      wordCount: 1450,
      similarityScore: '4%',
      codeSnippet: `// Balanced AVL Tree Self-Balancing Insert
class AVLTree {
  private Node root;

  private int height(Node N) {
    if (N == null) return 0;
    return N.height;
  }

  private int getBalance(Node N) {
    if (N == null) return 0;
    return height(N.left) - height(N.right);
  }

  Node rightRotate(Node y) {
    Node x = y.left;
    Node T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(height(y.left), height(y.right)) + 1;
    x.height = Math.max(height(x.left), height(x.right)) + 1;
    return x;
  }
}`
    },
    {
      id: 2,
      studentName: 'Sneha Patel',
      rollNumber: '2024-CSE-055',
      assignment: 'Assignment 4: Balanced AVL Tree & Red-Black Balancing',
      submittedAt: 'Nov 13, 2026 at 09:15 AM',
      wordCount: 1280,
      similarityScore: '2%',
      codeSnippet: `// Python AVL Tree Implementation
class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    def insert(self, root, key):
        if not root:
            return Node(key)
        elif key < root.key:
            root.left = self.insert(root.left, key)
        else:
            root.right = self.insert(root.right, key)
        return root`
    }
  ]

  const currentStudent = submissions[currentIdx]

  const criteria = [
    {
      id: 'correctness',
      name: 'Algorithm Correctness & Complexity',
      maxPts: 25,
      levels: [
        { pts: 25, label: 'Exemplary (O(log N))' },
        { pts: 20, label: 'Proficient (Minor edge flaw)' },
        { pts: 15, label: 'Developing (O(N) regression)' },
        { pts: 5, label: 'Unacceptable' }
      ]
    },
    {
      id: 'architecture',
      name: 'Clean Architecture & Modularity',
      maxPts: 25,
      levels: [
        { pts: 25, label: 'Production Clean' },
        { pts: 20, label: 'Well-Structured' },
        { pts: 15, label: 'Monolithic Structure' },
        { pts: 5, label: 'Poor Readability' }
      ]
    },
    {
      id: 'testing',
      name: 'Automated Test Coverage',
      maxPts: 25,
      levels: [
        { pts: 25, label: '>90% Line Coverage' },
        { pts: 20, label: 'Happy-Path Tested' },
        { pts: 15, label: 'Minimal Test Assertions' },
        { pts: 5, label: 'No Unit Tests' }
      ]
    },
    {
      id: 'documentation',
      name: 'Documentation & Code Style',
      maxPts: 25,
      levels: [
        { pts: 25, label: 'Thorough Javadoc/Docstrings' },
        { pts: 20, label: 'Clear Comments' },
        { pts: 15, label: 'Sparse Documentation' },
        { pts: 5, label: 'Undocumented' }
      ]
    }
  ]

  function handleScoreSelect(criterionId, pts) {
    setRubricScores(prev => ({ ...prev, [criterionId]: pts }))
    setAutoSaved(false)
    setTimeout(() => setAutoSaved(true), 400)
  }

  const totalScore = Object.values(rubricScores).reduce((a, b) => a + b, 0)

  return (
    <RolePageTemplate role="Staff" title="SpeedGrader™ Rubric Evaluation" icon={<Award size={22} />}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4px' }}>
        {/* Navigation Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fff', borderRadius: 12, padding: '12px 18px', border: '1px solid #e2e8f0',
          marginBottom: 16, flexWrap: 'wrap', gap: 10
        }}>
          <div>
            <span style={{ fontSize: 13, color: '#64748b' }}>Student Submission {currentIdx + 1} of {submissions.length}</span>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1e293b' }}>
              {currentStudent.studentName} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>({currentStudent.rollNumber})</span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              style={navBtn}
              aria-label="Previous Student Submission"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setCurrentIdx(prev => Math.min(submissions.length - 1, prev + 1))}
              disabled={currentIdx === submissions.length - 1}
              style={navBtn}
              aria-label="Next Student Submission"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Split-Screen Workspace */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Left Column: Student Submission Document */}
          <div style={{ flex: '1 1 500px', minWidth: 300, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: 14, marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5' }}>{currentStudent.assignment}</span>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Submitted {currentStudent.submittedAt}</p>
              </div>
              <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                Similarity: {currentStudent.similarityScore} (Verified)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <FileCode size={16} color="#64748b" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Source Code Artifact:</span>
            </div>

            <div style={{ overflowX: 'auto', background: '#0f172a', borderRadius: 8, padding: 14, flex: 1, maxHeight: 420 }}>
              <pre style={{ margin: 0, color: '#38bdf8', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5 }}>
                {currentStudent.codeSnippet}
              </pre>
            </div>
          </div>

          {/* Right Column: SpeedGrader Rubric Panel */}
          <div style={{ flex: '1 1 450px', minWidth: 300, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1e293b' }}>Rubric Evaluation</h3>
                <span style={{ fontSize: 12, color: autoSaved ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {autoSaved ? <><CheckCircle2 size={12} /> Auto-saved to Gradebook</> : 'Saving score...'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5' }}>{totalScore} <span style={{ fontSize: 14, color: '#64748b' }}>/ 100</span></div>
              </div>
            </div>

            {/* Rubric Criteria List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              {criteria.map(crit => (
                <div key={crit.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{crit.name}</span>
                    <span style={{ fontWeight: 700, color: '#4f46e5' }}>{rubricScores[crit.id] || 0} / {crit.maxPts} pts</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6 }}>
                    {crit.levels.map((lvl, lIdx) => {
                      const selected = rubricScores[crit.id] === lvl.pts
                      return (
                        <button
                          key={lIdx}
                          type="button"
                          onClick={() => handleScoreSelect(crit.id, lvl.pts)}
                          style={{
                            padding: '6px 4px', borderRadius: 6, fontSize: 11, cursor: 'pointer', textAlign: 'center',
                            border: `1px solid ${selected ? '#4f46e5' : '#cbd5e1'}`,
                            background: selected ? '#4f46e5' : '#fff',
                            color: selected ? '#fff' : '#475569',
                            fontWeight: selected ? 700 : 500,
                            wordBreak: 'break-word',
                          }}
                        >
                          <div>{lvl.pts} pts</div>
                          <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>{lvl.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Qualitative Feedback */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="feedbackInput" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                <MessageSquare size={14} /> Student Feedback
              </label>
              <textarea
                id="feedbackInput"
                rows={3}
                value={feedback}
                onChange={e => { setFeedback(e.target.value); setAutoSaved(true) }}
                style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 10px', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="button"
              onClick={() => alert(`Official grade of ${totalScore}/100 published for ${currentStudent.studentName}`)}
              style={{
                width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <Check size={16} /> Finalize & Submit Grade
            </button>
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}

const navBtn = {
  background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 12px',
  cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#334155'
}
