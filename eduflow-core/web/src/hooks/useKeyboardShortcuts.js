import { useEffect } from 'react'

/**
 * Feature 32: Enterprise Keyboard Shortcuts custom hook
 * Listens for hotkeys:
 * - 'n' / 'N': triggers onNew (e.g. Add Student / Create Item) when not inside text inputs
 * - 'Ctrl+Enter' / 'Cmd+Enter': triggers onSubmit to quickly submit forms
 * - 'Escape': triggers onEscape to dismiss modals or active drawers
 */
export function useKeyboardShortcuts({
  onNew,
  onSubmit,
  onEscape,
  enabled = true,
} = {}) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    function handleKeyDown(e) {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable

      // 1. Submit on Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (onSubmit) {
          e.preventDefault()
          onSubmit(e)
        }
        return
      }

      // 2. Escape to close/cancel
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault()
          onEscape(e)
        }
        return
      }

      // 3. 'N' or 'n' for New action (only when user is not actively typing in an input field)
      if (!isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'n' || e.key === 'N')) {
        if (onNew) {
          e.preventDefault()
          onNew(e)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNew, onSubmit, onEscape, enabled])
}

export default useKeyboardShortcuts
