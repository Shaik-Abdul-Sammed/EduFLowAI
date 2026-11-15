import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function RubricBuilderPage() {
  const [criteria, setCriteria] = useState([
    { id: 1, name: 'Architectural Correctness & Design Patterns', weight: '30%', excellent: 'Clean microservices separation', poor: 'Monolithic / tight coupling' },
    { id: 2, name: 'Unit & End-to-End Test Coverage', weight: '25%', excellent: '> 85% branch coverage with mocks', poor: 'No automated tests' },
    { id: 3, name: 'Code Readability & Documentation', weight: '20%', excellent: 'Documented APIs & clean commits', poor: 'Undocumented spaghetti code' },
    { id: 4, name: 'Viva-Voce Concept Defense', weight: '25%', excellent: 'Crisp theoretical explanation', poor: 'Unable to explain design trade-offs' }
  ])

  const [newCriteriaName, setNewCriteriaName] = useState('')
  const [newWeight, setNewWeight] = useState('')

  const handleAddCriteria = (e) => {
    e.preventDefault()
    if (!newCriteriaName.trim() || !newWeight.trim()) return
    const c = {
      id: Date.now(),
      name: newCriteriaName.trim(),
      weight: newWeight.endsWith('%') ? newWeight : `${newWeight}%`,
      excellent: 'Demonstrates deep mastery',
      poor: 'Fails baseline standard'
    }
    setCriteria(prev => [...prev, c])
    setNewCriteriaName('')
    setNewWeight('')
  }

  const handleDelete = (id) => {
    setCriteria(prev => prev.filter(c => c.id !== id))
  }

  return (
    <RolePageTemplate
      role="Faculty"
      title="Dynamic Grading Rubric Matrix Builder"
      description="Design multi-tiered grading rubrics for laboratory viva-voce, capstone presentations, and term papers."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <Plus size={18} className="text-primary" /> Define New Assessment Dimension
          </h3>
          <form onSubmit={handleAddCriteria} className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label small fw-semibold">Evaluation Criteria Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Memory Leak & Performance Profiling"
                value={newCriteriaName}
                onChange={(e) => setNewCriteriaName(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small fw-semibold">Weightage</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 20%"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">Add Dimension</button>
            </div>
          </form>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h6 fw-bold mb-0">Active Rubric Dimensions</h3>
            <span className="badge bg-primary">4 Year B.Tech Lab Template</span>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Criteria Dimension</th>
                  <th>Weight</th>
                  <th>Exemplary Benchmark (Band A)</th>
                  <th>Needs Improvement (Band C)</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map(c => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.name}</td>
                    <td><span className="badge bg-success bg-opacity-10 text-success">{c.weight}</span></td>
                    <td className="small text-muted">{c.excellent}</td>
                    <td className="small text-muted">{c.poor}</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn btn-sm btn-outline-danger"
                        aria-label="Delete criteria"
                      >
                        <Trash2 size={14} />
                      </button>
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
