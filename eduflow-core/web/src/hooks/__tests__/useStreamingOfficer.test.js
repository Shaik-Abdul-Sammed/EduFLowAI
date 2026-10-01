import { renderHook, act } from '@testing-library/react'
import { useStreamingOfficer } from '../useStreamingOfficer'

describe('useStreamingOfficer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('initializes with idle state and empty tokens', () => {
    const { result } = renderHook(() => useStreamingOfficer())
    expect(result.current.status).toBe('idle')
    expect(result.current.tokens).toBe('')
    expect(result.current.error).toBeNull()
  })

  test('stops active stream and resets status', () => {
    const { result } = renderHook(() => useStreamingOfficer())
    act(() => {
      result.current.stop()
    })
    expect(result.current.status).toBe('idle')
  })
})
