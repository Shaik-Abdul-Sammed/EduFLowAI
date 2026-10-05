import { describe, it, expect } from '@jest/globals'

describe('Officer SSE Stream Parsing Contract', () => {
  it('parses SSE data frames with thinking and token payloads', () => {
    const rawFrames = [
      'data: {"type":"thinking","message":"Analyzing..."}\n\n',
      'data: {"type":"token","content":"Criterion 3 analysis"}\n\n',
      'data: {"type":"done","roi":{"hoursSaved":40}}\n\n',
    ]

    const parsed = rawFrames.map((frame) => {
      const match = frame.match(/^data:\s*(.*)\n\n$/)
      return match ? JSON.parse(match[1]) : null
    })

    expect(parsed[0].type).toBe('thinking')
    expect(parsed[1].type).toBe('token')
    expect(parsed[1].content).toBe('Criterion 3 analysis')
    expect(parsed[2].type).toBe('done')
    expect(parsed[2].roi.hoursSaved).toBe(40)
  })

  it('normalizes relative /api/ and /v1/ URLs to full backend paths', () => {
    const prefix = 'https://eduflow-backend-jvn8.onrender.com/api'
    const resolve = (path) => (path.startsWith('/api') ? prefix + path.replace(/^\/api/, '') : prefix + path)

    expect(resolve('/api/v1/officers/accreditation/stream')).toBe(
      'https://eduflow-backend-jvn8.onrender.com/api/v1/officers/accreditation/stream'
    )
  })
})
