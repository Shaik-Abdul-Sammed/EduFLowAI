import { useState } from 'react'
import { QrCode, Scan, Box, Sparkles, RefreshCw, CheckCircle2, RotateCw } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function ARScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [scannedModel, setScannedModel] = useState(null)
  const [rotation, setRotation] = useState(0)

  const handleSimulateScan = () => {
    setScanning(true)
    setScannedModel(null)
    setTimeout(() => {
      setScanning(false)
      setScannedModel({
        title: 'DNA Double Helix & Base Pair Molecular Model',
        textbookPage: 'Bioinformatics & Genetics Vol. 4, Page 142',
        dimensions: '2.0 nm Diameter • 3.4 nm Pitch',
        meshNodes: 1240,
        interactiveFeatures: ['Hydrogen Bond Tension', 'Major/Minor Groove Inspection', 'Base Pair Sequencing']
      })
    }, 1800)
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Augmented Reality (AR) Textbook Scanner"
      description="Point your device camera at any physical course textbook QR code or diagram to project interactive 3D scientific models."
    >
      <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* Banner */}
        <div className="card border-0 shadow-sm" style={{
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
          color: '#ffffff'
        }}>
          <div className="card-body p-4">
            <span className="badge bg-light text-primary px-3 py-1 mb-2 font-monospace" style={{ fontSize: '0.72rem' }}>
              ● WEBAR 3D MESH VIEWFINDER ACTIVE
            </span>
            <h2 className="h4 fw-bold mb-1 text-white" style={{ wordBreak: 'break-word' }}>
              Textbook Spatial Computing Companion
            </h2>
            <p className="text-white-50 small mb-0" style={{ wordBreak: 'break-word' }}>
              Instant WebGL rendering for mechanical gears, protein folding, crystalline lattices, and circuit topologies.
            </p>
          </div>
        </div>

        {/* Viewfinder Workspace Split */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Simulated Scanner Viewfinder */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h6 fw-bold text-dark mb-0">AR Camera Viewfinder</h3>
                <span className="badge bg-light text-secondary border small">Camera 1080p WebAR</span>
              </div>

              {/* Viewfinder Frame */}
              <div
                style={{
                  height: '320px',
                  borderRadius: '1rem',
                  background: '#090d16',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: scanning ? '2px solid #38bdf8' : '1px solid #334155'
                }}
              >
                {/* Crosshairs & Target Box */}
                <div
                  style={{
                    width: '180px',
                    height: '180px',
                    border: '2px dashed rgba(56, 189, 248, 0.6)',
                    borderRadius: '12px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <QrCode size={64} className="text-white-50" />
                  {scanning && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: '#38bdf8',
                        boxShadow: '0 0 12px #38bdf8',
                        animation: 'scannerPulse 1.2s infinite alternate'
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    textAlign: 'center'
                  }}
                >
                  {scanning ? 'Detecting high-contrast visual target marker...' : 'Align textbook QR code inside boundary'}
                </div>
              </div>

              <div className="mt-3">
                <button
                  onClick={handleSimulateScan}
                  disabled={scanning}
                  className="btn btn-primary fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ padding: '12px 24px', borderRadius: '0.85rem' }}
                >
                  <Scan size={16} />
                  {scanning ? 'Calibrating Spatial Anchor...' : 'Simulate Scanning Textbook QR'}
                </button>
              </div>
            </div>
          </div>

          {/* Rendered 3D Model Display */}
          <div style={{ flex: '1 1 450px', minWidth: 0 }}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '1.25rem', background: '#ffffff' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h6 fw-bold text-dark mb-0">Projected 3D Spatial Model</h3>
                {scannedModel && (
                  <button
                    onClick={() => setRotation(r => r + 45)}
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    style={{ borderRadius: '0.5rem', padding: '6px 12px' }}
                  >
                    <RotateCw size={13} /> Rotate 45°
                  </button>
                )}
              </div>

              {scannedModel ? (
                <div>
                  {/* Interactive SVG 3D representation */}
                  <div
                    style={{
                      height: '220px',
                      borderRadius: '1rem',
                      background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <svg
                      width="200"
                      height="180"
                      viewBox="0 0 200 180"
                      style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.4s ease' }}
                    >
                      {/* Double Helix Rungs */}
                      <path d="M 40,30 Q 100,60 160,30" stroke="#38bdf8" strokeWidth="4" fill="none" />
                      <path d="M 40,70 Q 100,100 160,70" stroke="#c084fc" strokeWidth="4" fill="none" />
                      <path d="M 40,110 Q 100,140 160,110" stroke="#38bdf8" strokeWidth="4" fill="none" />
                      <path d="M 40,150 Q 100,180 160,150" stroke="#c084fc" strokeWidth="4" fill="none" />

                      {/* Strands */}
                      <line x1="100" y1="45" x2="100" y2="85" stroke="#4ade80" strokeWidth="3" strokeDasharray="3 3" />
                      <line x1="100" y1="85" x2="100" y2="125" stroke="#fbbf24" strokeWidth="3" strokeDasharray="3 3" />

                      <circle cx="100" cy="45" r="5" fill="#4ade80" />
                      <circle cx="100" cy="85" r="5" fill="#fbbf24" />
                      <circle cx="100" cy="125" r="5" fill="#4ade80" />
                    </svg>

                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <span className="badge bg-success-subtle text-success small">
                        ● 60 FPS WebGL
                      </span>
                    </div>
                  </div>

                  <h4 className="h6 fw-bold text-dark mt-3 mb-1" style={{ wordBreak: 'break-word' }}>
                    {scannedModel.title}
                  </h4>
                  <p className="text-muted small mb-3" style={{ wordBreak: 'break-word' }}>
                    Source: {scannedModel.textbookPage} • Dimensions: {scannedModel.dimensions}
                  </p>

                  <div className="p-3 bg-light rounded-3 mb-3">
                    <span className="small text-muted fw-bold d-block mb-1">INTERACTIVE NODES:</span>
                    <div className="d-flex flex-wrap gap-1">
                      {scannedModel.interactiveFeatures.map((f, idx) => (
                        <span key={idx} className="badge bg-white text-dark border small" style={{ wordBreak: 'break-word' }}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center text-muted d-flex flex-column align-items-center justify-content-center h-100">
                  <Box size={48} className="text-muted mb-2" />
                  <div className="fw-semibold">No 3D Model Loaded</div>
                  <small className="text-muted">Simulate scanning a textbook marker to project interactive models.</small>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </RolePageTemplate>
  )
}
