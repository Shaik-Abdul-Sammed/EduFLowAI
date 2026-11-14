/**
 * Pagination Component
 * Reusable server-side pagination controls.
 *
 * Props:
 *   page         - current page number (1-based)
 *   totalPages   - total number of pages
 *   total        - total record count
 *   limit        - records per page
 *   onPageChange - (newPage) => void
 */
export default function Pagination({ page = 1, totalPages = 1, total = 0, limit = 50, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  const startRecord = (page - 1) * limit + 1
  const endRecord = Math.min(page * limit, total)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 10, padding: '12px 0', fontSize: 13,
    }}>
      <span style={{ color: '#64748b' }}>
        Showing <strong>{startRecord}–{endRecord}</strong> of <strong>{total}</strong> records
      </span>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          style={btnStyle(false, page === 1)}
          aria-label="First page"
        >«</button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={btnStyle(false, page === 1)}
          aria-label="Previous page"
        >‹</button>

        {start > 1 && <span style={{ padding: '5px 8px', color: '#94a3b8' }}>…</span>}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={btnStyle(p === page, false)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span style={{ padding: '5px 8px', color: '#94a3b8' }}>…</span>}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={btnStyle(false, page === totalPages)}
          aria-label="Next page"
        >›</button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          style={btnStyle(false, page === totalPages)}
          aria-label="Last page"
        >»</button>
      </div>
    </div>
  )
}

function btnStyle(active, disabled) {
  return {
    minWidth: 32, height: 32, padding: '0 8px',
    border: `1px solid ${active ? '#6366f1' : '#e2e8f0'}`,
    borderRadius: 6,
    background: active ? '#6366f1' : disabled ? '#f8fafc' : '#fff',
    color: active ? '#fff' : disabled ? '#cbd5e1' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: active ? 700 : 400,
    fontSize: 13,
  }
}
