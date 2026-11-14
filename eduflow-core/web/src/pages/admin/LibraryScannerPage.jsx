import { useState } from 'react'
import { QrCode, BookOpen, UserCheck, Calendar, CheckCircle2, AlertCircle, Search, ArrowRight, ShieldCheck } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function LibraryScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedStudent, setScannedStudent] = useState({
    rollNumber: '2024-CSE-042',
    name: 'Aditya Sharma',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    activeBorrowings: 2,
    fineDue: '₹0.00'
  })
  const [selectedBook, setSelectedBook] = useState('BK-102')
  const [issueSuccess, setIssueSuccess] = useState(false)

  const booksCatalog = [
    { code: 'BK-101', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen et al.', isbn: '978-0262033848', availableCopies: 5 },
    { code: 'BK-102', title: 'Operating System Concepts (10th Ed.)', author: 'Silberschatz et al.', isbn: '978-1119456339', availableCopies: 3 },
    { code: 'BK-103', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1449373320', availableCopies: 8 },
    { code: 'BK-104', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross', isbn: '978-0136681557', availableCopies: 2 }
  ]

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, roll: '2024-CSE-042', book: 'Operating System Concepts', issueDate: '2026-11-14', returnDue: '2026-11-28', status: 'ISSUED' },
    { id: 2, roll: '2024-ECE-019', book: 'Digital Signal Processing', issueDate: '2026-11-12', returnDue: '2026-11-26', status: 'ISSUED' },
    { id: 3, roll: '2024-ME-088', book: 'Fluid Dynamics Principles', issueDate: '2026-10-25', returnDue: '2026-11-08', status: 'OVERDUE (₹40 Fine)' }
  ])

  const handleSimulateQRScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setScannedStudent({
        rollNumber: '2024-CSE-099',
        name: 'Priyanka Sen',
        department: 'Artificial Intelligence & Data Science',
        semester: 'Semester 3',
        activeBorrowings: 1,
        fineDue: '₹0.00'
      })
    }, 1000)
  }

  const handleIssueBook = (e) => {
    e.preventDefault()
    if (!scannedStudent) return

    const book = booksCatalog.find(b => b.code === selectedBook)
    const newTx = {
      id: recentTransactions.length + 1,
      roll: scannedStudent.rollNumber,
      book: book ? book.title : 'Course Reference Book',
      issueDate: new Date().toISOString().split('T')[0],
      returnDue: new Date(Date.now() + 14 * 24 * 3600000).toISOString().split('T')[0],
      status: 'ISSUED'
    }

    setRecentTransactions([newTx, ...recentTransactions])
    setIssueSuccess(true)
    setTimeout(() => setIssueSuccess(false), 3500)
  }

  return (
    <RolePageTemplate
      role="Librarian"
      title="Integrated Library Digital Scanner & Circulation"
      description="Zero-hardware RFID replacement: instant camera QR reading of Student Digital ID cards with automated book circulation and fine tracking."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #065f46 0%, #047857 60%, #10b981 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge bg-light text-success px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.75rem' }}>
                ● CAMERA QR SCANNER ACTIVE
              </span>
              <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
                Hardware-Free Student ID & Barcode Circulation
              </h2>
              <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
                Replaces high-maintenance physical RFID turnstiles with ubiquitous smartphone and webcam optical barcode processing.
              </p>
            </div>
            <button
              className="btn btn-light btn-sm d-flex align-items-center gap-2"
              onClick={handleSimulateQRScan}
              disabled={isScanning}
              aria-label="Trigger Digital Camera QR Scan"
            >
              <QrCode size={16} className="text-success" />
              <span>{isScanning ? 'Reading Camera...' : 'Simulate Camera Scan'}</span>
            </button>
          </div>
        </div>

        {/* Circulation Workflow Columns */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Left: Scanned Student Card & Issue Form */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h3 className="h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <UserCheck size={18} className="text-success" />
                  Auto-Populated Student Details
                </h3>
                <span className="badge bg-success-subtle text-success small">Verified via Digital ID</span>
              </div>

              {scannedStudent ? (
                <div className="p-3 rounded-3 mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h4 className="h6 fw-bold text-dark mb-0">{scannedStudent.name}</h4>
                      <span className="font-monospace text-secondary small">{scannedStudent.rollNumber}</span>
                    </div>
                    <span className="badge bg-success text-white">Eligible to Borrow</span>
                  </div>
                  <div className="small text-secondary">
                    <div>Department: <strong>{scannedStudent.department}</strong></div>
                    <div>Semester: <strong>{scannedStudent.semester}</strong></div>
                    <div>Outstanding Fines: <strong>{scannedStudent.fineDue}</strong></div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-muted mb-4 border rounded-3">
                  Scan a student digital ID card QR to populate details.
                </div>
              )}

              {/* Issue Book Form */}
              <form onSubmit={handleIssueBook}>
                <h4 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  Select Book to Issue
                </h4>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Book Catalog</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    aria-label="Select book from catalog"
                  >
                    {booksCatalog.map(book => (
                      <option key={book.code} value={book.code}>
                        [{book.code}] {book.title} ({book.availableCopies} available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Loan Period</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value="14 Days (Standard Academic Loan)"
                    disabled
                    aria-label="Loan Period"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={!scannedStudent}
                  aria-label="Confirm Book Issue"
                >
                  <CheckCircle2 size={16} />
                  <span>Issue Book to Student</span>
                </button>

                {issueSuccess && (
                  <div className="alert alert-success mt-3 p-2 small text-center" role="alert">
                    Book issued successfully! Due date calculated: 14 days from today.
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right: Real-time Circulation Audit Table */}
          <div style={{ flex: '1 1 500px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h3 className="h6 fw-bold mb-0 text-dark">Live Circulation Log</h3>
                <span className="badge bg-light text-secondary border small">Real-Time Ingestion</span>
              </div>

              {/* Wrapped Table for Zero Horizontal Scrolling */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Student Roll</th>
                      <th scope="col">Book Title</th>
                      <th scope="col">Due Date</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="font-monospace fw-bold">{tx.roll}</td>
                        <td style={{ wordBreak: 'break-word', maxWidth: '180px' }}>{tx.book}</td>
                        <td>{tx.returnDue}</td>
                        <td>
                          <span className={`badge ${tx.status.includes('OVERDUE') ? 'bg-danger text-white' : 'bg-success-subtle text-success'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </RolePageTemplate>
  )
}
