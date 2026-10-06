import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return { addToast: (msg, variant = 'info') => {} }
  }
  return context
}
