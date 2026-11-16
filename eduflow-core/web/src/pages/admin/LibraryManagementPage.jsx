import { useState, useEffect } from 'react'
import { BookOpen, RotateCcw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

export default function LibraryManagementPage() {
  const [books, setBooks] = useState([])
  const [issues, setIssues] = useState([])
  const [search, setSearch] = useState('')
  const [issueBookId, setIssueBookId] = useState('')
  const [studentRoll, setStudentRoll] = useState('')
  const [studentName, setStudentName] = useState('')
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [issuing, setIssuing] = useState(false)
  const [returningId, setReturningId] = useState(null)

  const fetchData = async (isMounted = true) => {
    try {
      setLoading(true)
      setLoadError(null)
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const [bRes, iRes] = await Promise.all([
        fetch(getFullApiUrl('/v1/library/books'), { headers }),
        fetch(getFullApiUrl('/v1/library/issues'), { headers })
      ])

      if (!bRes.ok) {
        throw new Error(`Failed to load library data (${bRes.status})`)
      }

      const bData = await bRes.json()
      const iData = iRes.ok ? await iRes.json() : { issues: [] }

      if (isMounted) {
        setBooks(bData?.books || [])
        setIssues(iData?.issues || [])
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error loading library catalog')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchData(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  const handleIssueBook = async (e) => {
    e.preventDefault()
    if (!issueBookId || !studentRoll) return
    setIssuing(true)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/library/issue'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          book_id: issueBookId,
          student_roll: studentRoll,
          student_name: studentName || 'Student',
          days: 14
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to issue book')
      }

      setMsg(`Book issued successfully! Due in 14 days.`)
      setIssueBookId('')
      setStudentRoll('')
      setStudentName('')
      fetchData(true)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue book.')
    } finally {
      setIssuing(false)
    }
  }

  const handleReturnBook = async (id) => {
    setReturningId(id)
    setErrorMsg('')
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/library/return'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ issue_id: id })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to return book')
      }

      const data = await res.json()
      setMsg(data?.message || 'Book returned successfully!')
      fetchData(true)
      setTimeout(() => setMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to return book.')
    } finally {
      setReturningId(null)
    }
  }

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <RolePageTemplate role="admin" title="Central Library Management Portal">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {msg && (
          <div className="alert alert-success d-flex align-items-center mb-0" data-testid="library-success-alert">
            ✓ {msg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center mb-0" role="alert">
            ❌ {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card border-0 shadow-sm p-5 text-center" data-testid="library-loading">
            <div className="spinner-border text-primary mx-auto mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mb-0">Loading central library catalog and active book issues...</p>
          </div>
        )}

        {/* Load Error State */}
        {loadError && !loading && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
            <div>
              <strong>Error:</strong> {loadError}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => fetchData(true)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* 2-Column Section: Catalog & Fast Issue Widget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Issue Book Card */}
              <div className="card border-0 shadow-sm p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Issue Book to Student</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>14-day borrowing period with ₹5/day overdue fine</p>
                  </div>
                </div>

                <form onSubmit={handleIssueBook} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="issue-book-select" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Select Book *</label>
                    <select
                      id="issue-book-select"
                      className="form-select form-select-sm"
                      value={issueBookId}
                      onChange={(e) => setIssueBookId(e.target.value)}
                      required
                      style={{ fontSize: 13 }}
                    >
                      <option value="">-- Choose title --</option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                          {b.title} ({b.available_copies} available / {b.total_copies})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="issue-student-roll" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Student Roll Number *</label>
                    <input
                      id="issue-student-roll"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. SS26 or 1ST22CS089"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      required
                      style={{ fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label htmlFor="issue-student-name" style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Student Full Name</label>
                    <input
                      id="issue-student-name"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Ananya Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      style={{ fontSize: 13 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={issuing}
                    className="btn btn-primary btn-sm mt-2"
                  >
                    {issuing ? 'Processing...' : 'Authorize Book Issue'}
                  </button>
                </form>
              </div>

              {/* Active Book Issues & Fine Tracker */}
              <div className="card border-0 shadow-sm p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#FEF3C7', color: '#D97706', padding: 8, borderRadius: 8 }}>
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Active Circulation & Returns</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>1-click return & automated fine calculation</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 310, overflowY: 'auto' }}>
                  {issues.length === 0 ? (
                    <div className="text-center py-4 text-muted small">No active book loans.</div>
                  ) : (
                    issues.map((i) => {
                      const isOverdue = i.status === 'OVERDUE'
                      const isReturned = i.status === 'RETURNED'
                      return (
                        <div key={i.id} className="p-3 rounded border d-flex justify-content-between align-items-center" style={{ background: 'var(--surface-bg)' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{i.book_title}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>
                              Borrower: {i.student_name} ({i.student_roll}) &bull; Due: {i.due_date}
                            </div>
                            {isOverdue && (
                              <div style={{ color: '#DC2626', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                                Overdue Fine: ₹{i.fine_amount}
                              </div>
                            )}
                          </div>

                          {!isReturned ? (
                            <button
                              disabled={returningId === i.id}
                              onClick={() => handleReturnBook(i.id)}
                              className="btn btn-success btn-sm"
                            >
                              {returningId === i.id ? 'Returning...' : 'Return'}
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4 }}>
                              RETURNED
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Catalog Table */}
            <div className="card border-0 shadow-sm p-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Library Holdings Catalog</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search title, author, or ISBN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ fontSize: 13, width: 260 }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)' }}>
                      <th style={{ padding: '10px 12px' }}>Title & Author</th>
                      <th style={{ padding: '10px 12px' }}>ISBN</th>
                      <th style={{ padding: '10px 12px' }}>Category</th>
                      <th style={{ padding: '10px 12px' }}>Shelf Location</th>
                      <th style={{ padding: '10px 12px' }}>Available Copies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((b) => (
                      <tr key={b.id}>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontWeight: 600 }}>{b.title}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{b.author}</div>
                        </td>
                        <td style={{ padding: '12px 12px', color: '#64748B' }}>{b.isbn}</td>
                        <td style={{ padding: '12px 12px' }}><span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{b.category}</span></td>
                        <td style={{ padding: '12px 12px', color: '#475569' }}>{b.shelf_location}</td>
                        <td style={{ padding: '12px 12px', fontWeight: 700, color: b.available_copies > 0 ? '#16A34A' : '#DC2626' }}>
                          {b.available_copies} / {b.total_copies}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
