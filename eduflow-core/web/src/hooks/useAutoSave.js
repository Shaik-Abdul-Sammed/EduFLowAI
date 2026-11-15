import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Feature 27: Form Auto-Save custom hook
 * Automatically persists active form draft state to localStorage with debouncing.
 * Prevents catastrophic data loss during session expiration or accidental navigation.
 */
export function useAutoSave(key, formData, setFormData, { debounceMs = 600, enabled = true } = {}) {
  const [hasSavedDraft, setHasSavedDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const isInitialMount = useRef(true)

  // 1. On mount: attempt to restore draft
  useEffect(() => {
    if (!enabled || !key || typeof window === 'undefined') return

    try {
      const raw = localStorage.getItem(`autosave_${key}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({ ...prev, ...parsed }))
          setHasSavedDraft(true)
        }
      }
    } catch (e) {
      console.warn(`useAutoSave: failed to load draft for key "${key}":`, e)
    }
  }, [key, enabled, setFormData])

  // 2. Debounced save on formData change
  useEffect(() => {
    if (!enabled || !key || typeof window === 'undefined') return

    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${key}`, JSON.stringify(formData))
        setLastSaved(new Date())
        setHasSavedDraft(true)
      } catch (e) {
        console.warn(`useAutoSave: failed to save draft for key "${key}":`, e)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [key, formData, debounceMs, enabled])

  // 3. Clear draft helper (e.g. called on successful form submission)
  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined' && key) {
      localStorage.removeItem(`autosave_${key}`)
      setHasSavedDraft(false)
      setLastSaved(null)
    }
  }, [key])

  return {
    hasSavedDraft,
    lastSaved,
    clearDraft,
  }
}

export default useAutoSave
