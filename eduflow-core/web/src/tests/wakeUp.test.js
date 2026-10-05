import { describe, it, expect, jest } from '@jest/globals'
import { wakeUpFetch } from '../utils/wakeUpHandler'

describe('wakeUpFetch Utility', () => {
  it('returns response immediately on HTTP 200 without retrying', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ ok: true }),
    })
    global.fetch = mockFetch

    const res = await wakeUpFetch('https://example.com/api/test')
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('retries once after network failure', async () => {
    let callCount = 0
    const mockFetch = jest.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('Failed to fetch'))
      }
      return Promise.resolve({
        status: 200,
        ok: true,
      })
    })
    global.fetch = mockFetch

    const res = await wakeUpFetch('https://example.com/api/test')
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
