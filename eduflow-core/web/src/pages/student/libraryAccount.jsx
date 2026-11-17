import { useState, useEffect } from 'react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getFullApiUrl } from '../../config/apiConfig'

const BLUE = '#2563EB'

const daysOverdue = (dueDate) => {
  if (!dueDate) return 0
  const diff = Math.ceil((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

const daysLeft = (dueDate) => {
  if (!dueDate) return 14
  return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Page() {
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [catalogue, setCatalogue] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)

  const fetchLibraryData = async (isMounted = true) => {
    try {
      if (isMounted) {
        setLoading(true)
        setLoadError(null)
      }
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const [issuesRes, booksRes] = await Promise.all([
        fetch(getFullApiUrl('/v1/library/issues'), { headers }),
        fetch(getFullApiUrl('/v1/library/books'), { headers })
      ])

      if (!issuesRes.ok && !booksRes.ok) {
        throw new Error(`Library service returned HTTP ${issuesRes.status}`)
      }

      let issuesList = []
      if (issuesRes.ok) {
        const iJson = await issuesRes.json()
        issuesList = Array.isArray(iJson?.issues) ? iJson.issues : []
      }

      let booksList = []
      if (booksRes.ok) {
        const bJson = await booksRes.json()
        booksList = Array.isArray(bJson?.books) ? bJson.books : []
      }

      if (isMounted) {
        setBorrowedBooks(issuesList.map(item => ({
          id: item.id || `ISS-${item.book_id}`,
          bookId: item.book_id,
          title: item.book_title || 'Reference Book',
          author: item.author || 'Academic Faculty',
          dueDate: item.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          renewals: Number(item.renewals) || 0,
          fine: Number(item.fine) || 0
        })))
        setCatalogue(booksList)
      }
    } catch (err) {
      if (isMounted) {
        setLoadError(err.message || 'Error fetching library portal records')
      }
    } finally {
      if (isMounted) setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchLibraryData(isMounted)
    return () => {
      isMounted = false
    }
  }, [])

  async function handleRenewOrReturn(issueId) {
    setSubmittingId(issueId)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/library/return'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ issue_id: issueId })
      })

      if (!res.ok) {
        throw new Error('Return/Renewal request failed')
      }

      setToast('✅ Book renewed / accession returned successfully!')
      setTimeout(() => setToast(null), 3500)
      await fetchLibraryData(true)
    } catch (err) {
      setToast(`⚠️ ${err.message || 'Operation failed'}`)
      setTimeout(() => setToast(null), 3500)
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleBorrow(bookId, bookTitle) {
    setSubmittingId(bookId)
    try {
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'))) || ''
      const res = await fetch(getFullApiUrl('/v1/library/issue'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          book_id: bookId,
          student_roll: 'SS26',
          student_name: 'Ananya Sharma',
          days_valid: 14
        })
      })

      if (!res.ok) {
        throw new Error('Borrow request failed')
      }

      setToast(`✅ Issued "${bookTitle}" for 14 academic days!`)
      setTimeout(() => setToast(null), 3500)
      await fetchLibraryData(true)
    } catch (err) {
      setToast(`⚠️ ${err.message || 'Failed to borrow volume'}`)
      setTimeout(() => setToast(null), 3500)
    } finally {
      setSubmittingId(null)
    }
  }

  const totalFine = borrowedBooks.reduce((acc, b) => acc + (b.fine || daysOverdue(b.dueDate) * 5), 0)
  const catFiltered = catalogue.filter(c =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.author || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <RolePageTemplate role="Student" title="Library Account" description="Track borrowed books, due dates, renewals, and search the catalogue.">
      <div style={{ display: 'grid', gap: '1.25rem' }}>

        {/* Toast */}
        {toast && (
          <div data-testid="library-toast" style={{ padding: '0.875rem 1.25rem', background: '#10B98112', border: '1px solid #10B98135', borderRadius: '0.875rem', color: '#065f46', fontWeight: 600, fontSize: '0.875rem' }}>
            {toast}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div data-testid="library-loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card border-0 shadow-sm p-4 text-center placeholder-glow" style={{ borderRadius: '1rem' }}>
                <span className="placeholder col-6 mx-auto mb-2" />
                <span className="placeholder col-4 mx-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          /* Error State */
          <div data-testid="library-error" className="card border-0 shadow-sm p-4 text-center bg-danger-subtle text-danger" style={{ borderRadius: '1.25rem' }}>
            <h5 className="fw-bold mb-2">Unable to Connect to Campus Library System</h5>
            <p className="small mb-3">{loadError}</p>
            <div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => fetchLibraryData(true)}>
                🔄 Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
              {[
                { label: 'Books Borrowed', value: borrowedBooks.length, color: BLUE, icon: '📚' },
                { label: 'Due Today', value: borrowedBooks.filter(b => daysLeft(b.dueDate) === 0).length, color: '#F59E0B', icon: '📅' },
                { label: 'Overdue', value: borrowedBooks.filter(b => daysOverdue(b.dueDate) > 0).length, color: '#EF4444', icon: '🚨' },
                { label: 'Total Fine', value: `₹${totalFine}`, color: totalFine > 0 ? '#EF4444' : '#10B981', icon: '💰' },
              ].map(s => (
                <div key={s.label} className="card border-0 shadow-sm" style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Borrowed Books */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📖 Currently Borrowed</h2>
              </div>
              <div style={{ padding: '1.25rem', display: 'grid', gap: '0.875rem' }}>
                {borrowedBooks.length === 0 ? (
                  <div data-testid="library-empty" className="text-center py-4 text-muted">
                    <p className="mb-0">You have no active borrowed books. Browse the catalogue below to borrow.</p>
                  </div>
                ) : (
                  borrowedBooks.map(b => {
                    const overdue = daysOverdue(b.dueDate)
                    const left = daysLeft(b.dueDate)
                    const fine = b.fine || overdue * 5
                    const isOverdue = overdue > 0

                    return (
                      <div key={b.id} style={{ padding: '1rem 1.25rem', borderRadius: '1rem', background: 'var(--surface-bg)', borderLeft: `3px solid ${isOverdue ? '#EF4444' : left <= 3 ? '#F59E0B' : '#10B981'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{b.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>✍️ {b.author} • 🔖 Issue ID: {b.id}</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              <span style={{ color: isOverdue ? '#EF4444' : left <= 3 ? '#F59E0B' : '#10B981', fontWeight: 700 }}>
                                {isOverdue ? `🚨 ${overdue} days overdue` : `📅 Due in ${left} day${left !== 1 ? 's' : ''}`}
                              </span>
                              <span style={{ color: '#94a3b8', marginLeft: '0.75rem' }}>Due: {b.dueDate}</span>
                            </div>
                            {fine > 0 && <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, marginTop: '0.15rem' }}>💸 Fine: ₹{fine}</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Renewals: {b.renewals}/2</span>
                            <button
                              onClick={() => handleRenewOrReturn(b.id)}
                              disabled={submittingId === b.id}
                              data-testid={`renew-btn-${b.id}`}
                              style={{ padding: '0.4rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${BLUE}`, background: 'transparent', color: BLUE, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {submittingId === b.id ? 'Processing...' : '🔄 Return / Renew'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Catalogue Search & Request */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>🔍 Library Catalogue &amp; Instant Borrow</h2>
              </div>
              <div style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
                <input
                  className="form-control form-control-sm"
                  placeholder="Search catalogue by title or author..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />

                <div className="row g-2">
                  {catFiltered.map(book => (
                    <div key={book.id} className="col-12 col-md-6">
                      <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold small">{book.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{book.author} • Copies: {book.available_copies ?? 3} avl</div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={submittingId === book.id || (book.available_copies === 0)}
                          data-testid={`borrow-btn-${book.id}`}
                          onClick={() => handleBorrow(book.id, book.title)}
                        >
                          Borrow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </RolePageTemplate>
  )
}
