import { renderHook, act } from '@testing-library/react'
import { useStreamingOfficer } from '../hooks/useStreamingOfficer'

function createMockResponseBody(chunks) {
  const encoder = new TextEncoder()
  let index = 0
  return {
    getReader: () => ({
      read: jest.fn().mockImplementation(async () => {
        if (index < chunks.length) {
          const val = encoder.encode(chunks[index])
          index++
          return { value: val, done: false }
        }
        return { value: undefined, done: true }
      }),
      cancel: jest.fn(),
      releaseLock: jest.fn(),
    }),
  }
}

describe('useStreamingOfficer Edge Cases', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  test('Network error sets status to "error"', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network connection failed'))

    const { result } = renderHook(() => useStreamingOfficer())

    await act(async () => {
      await result.current.start('/api/v1/officers/accreditation/stream', { test: true })
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Network connection failed')
  })

  test('Abort controller call sets status to "idle"', async () => {
    global.fetch = jest.fn().mockImplementation((url, options) => {
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const err = new Error('The user aborted a request.')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const { result } = renderHook(() => useStreamingOfficer())

    let startPromise
    act(() => {
      startPromise = result.current.start('/api/v1/officers/timetable/stream', {})
    })

    expect(result.current.status).toBe('connecting')

    act(() => {
      result.current.stop()
    })

    await act(async () => {
      await startPromise
    })

    expect(result.current.status).toBe('idle')
  })

  test('Malformed SSE chunks are ignored, valid chunks processed', async () => {
    const ssePayload = [
      'data: {malformed json\n\n',
      'data: {"type":"token","text":"Accreditation "}\n\n',
      'data: not even json\n\n',
      'data: {"type":"token","text":"Verified"}\n\n',
      'data: {"type":"done"}\n\n',
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: createMockResponseBody(ssePayload),
    })

    const { result } = renderHook(() => useStreamingOfficer())

    await act(async () => {
      await result.current.start('/api/v1/officers/accreditation/stream')
    })

    expect(result.current.tokens).toBe('Accreditation Verified')
    expect(result.current.status).toBe('done')
  })

  test('Multiple rapid start calls abort previous stream', async () => {
    const signals = []
    global.fetch = jest.fn().mockImplementation((url, options) => {
      signals.push(options.signal)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            body: createMockResponseBody(['data: {"type":"token","text":"Done"}\n\n', 'data: {"type":"done"}\n\n']),
          })
        }, 10)
      })
    })

    const { result } = renderHook(() => useStreamingOfficer())

    await act(async () => {
      result.current.start('/api/v1/officers/first')
      result.current.start('/api/v1/officers/second')
    })

    expect(signals.length).toBe(2)
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  test('Empty response body sets status to "error"', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: null,
    })

    const { result } = renderHook(() => useStreamingOfficer())

    await act(async () => {
      await result.current.start('/api/v1/officers/finance/stream')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('ReadableStream not supported or response body is empty')
  })
})
