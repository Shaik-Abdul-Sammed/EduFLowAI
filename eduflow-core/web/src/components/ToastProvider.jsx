import { useState } from 'react'
import { ToastContext } from '../context/ToastContext'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function addToast(message, variant = 'info') {
    const id = Date.now().toString()
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="polite"
        className="position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1080, pointerEvents: 'none', maxWidth: '420px' }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-bg-${t.variant} mb-2 shadow`}
            role="alert"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))} />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
