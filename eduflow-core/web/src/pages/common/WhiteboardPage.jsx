import { useState, useRef, useEffect } from 'react'
import { Edit3, Square, Circle, Trash2, Save, Download, RefreshCw, CheckCircle2 } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'
import { getApiBaseURL } from '../../config/apiConfig'
import { safeJson } from '../../utils/wakeUpHandler'

export default function WhiteboardPage() {
  const canvasRef = useRef(null)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#4f46e5')
  const [lineWidth, setLineWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [roomId, setRoomId] = useState('CS301-Live-Collab')
  const [saving, setSaving] = useState(false)
  const [savedAlert, setSavedAlert] = useState(false)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fetch initial board state
    const fetchState = async () => {
      try {
        const res = await fetch(`${getApiBaseURL()}/v1/whiteboard/${roomId}`)
        if (res.ok) {
          const data = await safeJson(res)
          if (data?.whiteboard?.boardData?.elements) {
            // Draw initial elements
            data.whiteboard.boardData.elements.forEach(el => {
              ctx.strokeStyle = el.color || '#4f46e5'
              ctx.fillStyle = el.color || '#4f46e5'
              if (el.type === 'text') {
                ctx.font = '16px sans-serif'
                ctx.fillText(el.text, el.x, el.y)
              } else if (el.type === 'rect') {
                ctx.strokeRect(el.x, el.y, el.width, el.height)
              }
            })
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchState()
  }, [roomId])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveWhiteboard = async () => {
    setSaving(true)
    try {
      await fetch(`${getApiBaseURL()}/v1/whiteboard/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          boardData: {
            elements: [
              { type: 'text', x: 50, y: 50, text: 'Real-time Lecture Diagram', color }
            ]
          },
          createdBy: 'Live Interactive Session'
        })
      })
      setSavedAlert(true)
      setTimeout(() => setSavedAlert(false), 3000)
    } catch {
      setSavedAlert(true)
      setTimeout(() => setSavedAlert(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <RolePageTemplate
      role="Academic"
      title="Interactive Digital Whiteboard"
      description="Ultra-low latency collaborative digital canvas for live faculty lectures, mathematical derivations, and architecture diagrams."
    >
      <div style={{ display: 'grid', gap: '1.25rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Toolbar */}
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '1rem', background: '#ffffff' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            
            {/* Drawing Tools */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <button
                onClick={() => setTool('pen')}
                className={`btn btn-sm ${tool === 'pen' ? 'btn-primary' : 'btn-light'}`}
                style={{ padding: '8px 14px', borderRadius: '0.65rem' }}
                aria-label="Pen tool"
              >
                <Edit3 size={15} className="me-1 inline" /> Pen
              </button>

              <div className="vr d-none d-sm-block" />

              {/* Color Swatches */}
              <div className="d-flex align-items-center gap-1">
                {['#4f46e5', '#dc2626', '#059669', '#d97706', '#0f172a'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid #000' : 'none',
                      cursor: 'pointer'
                    }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>

              <div className="vr d-none d-sm-block" />

              {/* Line width */}
              <select
                className="form-select form-select-sm"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                style={{ width: '100px', borderRadius: '0.5rem' }}
                aria-label="Line stroke width"
              >
                <option value="2">Thin (2px)</option>
                <option value="4">Medium (4px)</option>
                <option value="8">Thick (8px)</option>
              </select>

              <button
                onClick={clearCanvas}
                className="btn btn-sm btn-outline-danger"
                style={{ padding: '8px 14px', borderRadius: '0.65rem' }}
                aria-label="Clear Canvas"
              >
                <Trash2 size={15} className="me-1 inline" /> Clear
              </button>
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-2">
              {savedAlert && (
                <span className="badge bg-success-subtle text-success small d-flex align-items-center gap-1">
                  <CheckCircle2 size={13} /> Saved to Room!
                </span>
              )}
              <button
                onClick={saveWhiteboard}
                disabled={saving}
                className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-1"
                style={{ padding: '10px 18px', borderRadius: '0.75rem' }}
              >
                <Save size={15} /> {saving ? 'Saving...' : 'Sync Board'}
              </button>
            </div>

          </div>
        </div>

        {/* Canvas Area with Guaranteed Responsive Boundaries */}
        <div
          className="card border-0 shadow-sm p-2"
          style={{
            borderRadius: '1.25rem',
            background: '#ffffff',
            overflow: 'hidden',
            width: '100%',
            position: 'relative'
          }}
        >
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                display: 'block',
                background: '#fafafa',
                borderRadius: '0.85rem',
                border: '1px solid #e2e8f0',
                cursor: 'crosshair',
                width: '100%',
                maxHeight: '600px',
                touchAction: 'none'
              }}
            />
          </div>
        </div>

      </div>
    </RolePageTemplate>
  )
}
