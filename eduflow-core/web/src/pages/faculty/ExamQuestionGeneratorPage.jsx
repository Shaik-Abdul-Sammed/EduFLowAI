import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function ExamQuestionGeneratorPage() {
  const [topic, setTopic] = useState('Operating Systems - Concurrency & Deadlocks')
  const [level, setLevel] = useState('Level 4: Analyze / Apply')
  const [generating, setGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([
    {
      id: 1,
      taxonomy: 'Bloom L4 (Analyze)',
      marks: 10,
      text: 'Analyze why Peterson’s Solution fails to enforce mutual exclusion on modern out-of-order execution CPU architectures without memory barriers.'
    },
    {
      id: 2,
      taxonomy: 'Bloom L3 (Apply)',
      marks: 5,
      text: 'Apply Dijkstra’s Banker’s Algorithm to determine if allocation state Matrix A with Available Vector [3, 3, 2] is in a safe sequence.'
    }
  ])

  const handleGenerate = (e) => {
    e.preventDefault()
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      const q = {
        id: Date.now(),
        taxonomy: level,
        marks: 8,
        text: `Evaluate the memory overhead of multi-level paging versus inverted page tables for a 64-bit virtual address space with 4KB page frames under topic: ${topic}.`
      }
      setGeneratedQuestions(prev => [q, ...prev])
    }, 1200)
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Bloom's Taxonomy Exam Question Generator"
      description="Synthesize outcome-based examination questions mapped to Bloom's cognitive taxonomy levels and course outcomes (COs)."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Sparkles size={18} className="text-primary" /> AI Question Paper Synthesis
          </h3>
          <form onSubmit={handleGenerate} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Syllabus Topic / Chapter</label>
              <input
                type="text"
                className="form-control"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Bloom's Taxonomy Target</label>
              <select
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="Level 1: Remember / Recall">Level 1: Remember / Recall</option>
                <option value="Level 2: Understand">Level 2: Understand</option>
                <option value="Level 3: Apply">Level 3: Apply</option>
                <option value="Level 4: Analyze / Apply">Level 4: Analyze / Apply</option>
                <option value="Level 5: Evaluate">Level 5: Evaluate</option>
                <option value="Level 6: Create / Design">Level 6: Create / Design</option>
              </select>
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button
                type="submit"
                disabled={generating}
                className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1.5"
              >
                <Sparkles size={16} /> {generating ? 'Generating...' : 'Synthesize'}
              </button>
            </div>
          </form>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3">Generated Examination Questions</h3>
          <div className="d-flex flex-column gap-3">
            {generatedQuestions.map(q => (
              <div key={q.id} className="p-3 rounded-3 bg-light border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary">{q.taxonomy}</span>
                  <span className="badge bg-secondary">{q.marks} Marks</span>
                </div>
                <p className="text-dark mb-0 fw-medium">{q.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
