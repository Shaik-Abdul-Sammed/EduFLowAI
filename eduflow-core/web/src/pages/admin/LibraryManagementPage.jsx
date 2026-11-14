import { useState, useEffect } from 'react'
import { BookOpen, RotateCcw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function LibraryManagementPage() {
  const [books, setBooks] = useState([])
  const [issues, setIssues] = useState([])
  const [search, setSearch] = useState('')
  const [issueBookId, setIssueBookId] = useState('')
  const [studentRoll, setStudentRoll] = useState('')
  const [studentName, setStudentName] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      const bRes = await fetch(`${getApiBaseURL()}/v1/library/books`)
      if (bRes.ok) {
        const bData = await safeJson(bRes)
        if (bData?.books) setBooks(bData.books)
      }
      const iRes = await fetch(`${getApiBaseURL()}/v1/library/issues`)
      if (iRes.ok) {
        const iData = await safeJson(iRes)
        if (iData?.issues) setIssues(iData.issues)
      }
    } catch (err) {
      console.debug(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleIssueBook = async (e) => {
    e.preventDefault()
    if (!issueBookId || !studentRoll) return
    setLoading(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/library/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: issueBookId,
          student_roll: studentRoll,
          student_name: studentName || 'Student',
          days: 14
        })
      })
      if (res.ok) {
        setMsg(`Book issued successfully! Due in 14 days.`)
        setIssueBookId('')
        setStudentRoll('')
        setStudentName('')
        fetchData()
        setTimeout(() => setMsg(''), 4000)
      }
    } catch (_err) {
      setMsg('Failed to issue book.')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${getApiBaseURL()}/v1/library/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: id })
      })
      if (res.ok) {
        const data = await safeJson(res)
        setMsg(data?.message || 'Book returned successfully!')
        fetchData()
        setTimeout(() => setMsg(''), 5000)
      }
    } catch (_err) {
      setMsg('Failed to return book.')
    } finally {
      setLoading(false)
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
          <div style={{ padding: 12, borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 13, fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {/* 2-Column Section: Catalog & Fast Issue Widget */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Issue Book Card */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#EFF6FF', color: '#2563EB', padding: 8, borderRadius: 8 }}>
                <BookOpen size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Issue Book to Student</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>14-day borrowing period with ₹5/day overdue fine</p>
              </div>
            </div>

            <form onSubmit={handleIssueBook} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Select Book</label>
                <select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
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
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Student Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. SS26 or 1ST22CS089"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Student Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 6
                }}
              >
                {loading ? 'Processing...' : 'Authorize Book Issue'}
              </button>
            </form>
          </div>

          {/* Active Book Issues & Fine Tracker */}
          <div style={{ background: '#FFFFFF', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#FEF3C7', color: '#D97706', padding: 8, borderRadius: 8 }}>
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Active Circulation & Returns</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>1-click return & automated fine calculation</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 310, overflowY: 'auto' }}>
              {issues.map((i) => {
                const isOverdue = i.status === 'OVERDUE'
                const isReturned = i.status === 'RETURNED'
                return (
                  <div key={i.id} style={{ padding: 12, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{i.book_title}</div>
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
                        onClick={() => handleReturnBook(i.id)}
                        style={{
                          background: '#10B981',
                          color: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Return
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4 }}>
                        RETURNED
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>Library Holdings Catalog</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Search title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, width: 260 }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>Title & Author</th>
                  <th style={{ padding: '10px 12px' }}>ISBN</th>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px' }}>Shelf Location</th>
                  <th style={{ padding: '10px 12px' }}>Available Copies</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{b.title}</div>
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
      </div>
    </RolePageTemplate>
  )
}
