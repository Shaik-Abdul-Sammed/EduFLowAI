import { useState, useEffect, useRef } from 'react'
import { QrCode, Camera, Box, RotateCw, ZoomIn, ZoomOut, Layers, Eye, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react'

export default function ARModelViewer({ defaultModel = 'heart' }) {
  const [selectedModel, setSelectedModel] = useState(defaultModel) // 'heart' | 'engine'
  const [isScanning, setIsScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [isWireframe, setIsWireframe] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [rotationAngle, setRotationAngle] = useState(0)

  const canvasRef = useRef(null)

  const modelsCatalog = {
    heart: {
      id: 'heart',
      title: 'Human Cardiac Anatomy & Ventricular Chambers',
      subject: 'Cardiovascular Physiology',
      polyCount: '48,200 Triangles',
      scale: '1:1 Biological Scale',
      structures: ['Left Ventricle', 'Aortic Arch', 'Mitral Valve', 'Superior Vena Cava'],
      color: '#ef4444'
    },
    engine: {
      id: 'engine',
      title: 'Twin-Spool Turbofan Aircraft Engine',
      subject: 'Thermodynamics & Propulsion',
      polyCount: '86,400 Triangles',
      scale: '1:10 Engineering Scale',
      structures: ['High-Pressure Compressor', 'Combustion Chamber', 'Turbine Blades', 'Bypass Nozzle'],
      color: '#3b82f6'
    }
  }

  const currentInfo = modelsCatalog[selectedModel] || modelsCatalog.heart

  // Interactive 3D Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.getContext) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId
    let angle = rotationAngle

    const render = () => {
      angle += 0.015
      ctx.fillStyle = '#0a0f1d'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const radius = 90 * zoomLevel

      // Draw 3D Grid coordinate plane
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + i * 30, cy + 80)
        ctx.lineTo(cx + i * 50, cy + 140)
        ctx.stroke()
      }

      // Draw rotating 3D representation
      ctx.save()
      ctx.translate(cx, cy)

      if (selectedModel === 'heart') {
        // Draw 3D Pulsing Heart geometry
        const pulse = Math.sin(angle * 3) * 0.08 + 1.0
        ctx.scale(zoomLevel * pulse, zoomLevel * pulse)

        ctx.fillStyle = isWireframe ? 'transparent' : 'rgba(239, 68, 68, 0.85)'
        ctx.strokeStyle = '#f87171'
        ctx.lineWidth = isWireframe ? 1.5 : 3

        ctx.beginPath()
        ctx.arc(-25, -20, 45, Math.PI, 0, false)
        ctx.arc(25, -20, 45, Math.PI, 0, false)
        ctx.lineTo(0, 55)
        ctx.closePath()
        if (!isWireframe) ctx.fill()
        ctx.stroke()

        // Ventricle division line
        ctx.strokeStyle = '#fee2e2'
        ctx.beginPath()
        ctx.moveTo(0, -15)
        ctx.lineTo(0, 50)
        ctx.stroke()
      } else {
        // Draw 3D Turbofan Engine Cylinder & Blades
        ctx.scale(zoomLevel, zoomLevel)
        ctx.fillStyle = isWireframe ? 'transparent' : 'rgba(59, 130, 246, 0.8)'
        ctx.strokeStyle = '#60a5fa'
        ctx.lineWidth = isWireframe ? 1.5 : 3

        // Outer Nacelle
        ctx.beginPath()
        ctx.ellipse(0, 0, radius, radius * 0.5, 0, 0, Math.PI * 2)
        if (!isWireframe) ctx.fill()
        ctx.stroke()

        // Rotating Blades
        ctx.strokeStyle = '#93c5fd'
        for (let i = 0; i < 8; i++) {
          const bladeAngle = angle + (i * Math.PI) / 4
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(Math.cos(bladeAngle) * radius * 0.9, Math.sin(bladeAngle) * radius * 0.45)
          ctx.stroke()
        }
      }

      ctx.restore()

      animationId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationId)
  }, [selectedModel, isWireframe, zoomLevel, rotationAngle])

  const handleSimulateScan = () => {
    setIsScanning(true)
    setScanSuccess(false)
    setTimeout(() => {
      setIsScanning(false)
      setScanSuccess(true)
      setSelectedModel(prev => (prev === 'heart' ? 'engine' : 'heart'))
      setTimeout(() => setScanSuccess(false), 3000)
    }, 1200)
  }

  return (
    <div
      className="card border-0 shadow-sm p-4"
      style={{ borderRadius: '1.25rem', background: '#ffffff', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
      aria-label="Augmented Reality 3D Scientific Model Viewer"
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white font-monospace small">WEBGL 3D COMPONENT</span>
            {scanSuccess && (
              <span className="badge bg-success text-white d-flex align-items-center gap-1">
                <CheckCircle2 size={12} /> QR Code Recognized
              </span>
            )}
          </div>
          <h3 className="h5 fw-bold text-dark mb-0" style={{ wordBreak: 'break-word' }}>
            {currentInfo.title}
          </h3>
          <p className="text-secondary small mb-0">
            {currentInfo.subject} • {currentInfo.polyCount} • {currentInfo.scale}
          </p>
        </div>

        {/* QR Scanner Trigger */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            onClick={handleSimulateScan}
            disabled={isScanning}
            aria-label="Scan Physical Textbook QR Code with Camera"
          >
            <Camera size={16} />
            <span>{isScanning ? 'Scanning Camera Feed...' : 'Scan Textbook QR'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '1rem', overflow: 'hidden', background: '#0a0f1d' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label={`Interactive 3D representation of ${currentInfo.title}`}
        />

        {/* Floating Controls Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '6px 12px',
          borderRadius: '2rem'
        }}>
          <button
            className="btn btn-sm btn-dark text-white p-1"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.0))}
            aria-label="Zoom In Model"
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="btn btn-sm btn-dark text-white p-1"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
            aria-label="Zoom Out Model"
          >
            <ZoomOut size={16} />
          </button>
          <button
            className={`btn btn-sm p-1 ${isWireframe ? 'btn-primary' : 'btn-dark text-white'}`}
            onClick={() => setIsWireframe(!isWireframe)}
            aria-label="Toggle Wireframe Mesh"
          >
            <Layers size={16} />
          </button>
        </div>
      </div>

      {/* Anatomical / Mechanical Callout Tabs */}
      <div className="mt-3">
        <label className="fw-bold small text-dark mb-2 d-block">Identified Structural Components:</label>
        <div className="d-flex flex-wrap gap-2">
          {currentInfo.structures.map((s, idx) => (
            <span
              key={idx}
              className="badge bg-light text-secondary border px-3 py-2"
              style={{ fontSize: '0.8rem', wordBreak: 'break-word' }}
            >
              • {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
