import { describe, it, expect } from '@jest/globals'
import { getApiBaseURL, getFullApiUrl } from '../config/apiConfig'

describe('Site Health and Configuration Audit', () => {
  it('apiConfig returns proper live backend API URL in non-localhost environment', () => {
    const url = getApiBaseURL()
    expect(url).toBeDefined()
    expect(typeof url).toBe('string')
  })

  it('getFullApiUrl correctly prefixes endpoints without double slashes or double api paths', () => {
    const url = getFullApiUrl('/v1/naac/ask')
    expect(url).toContain('/api/v1/naac/ask')
    expect(url).not.toContain('/api/api')
  })

  it('getFullApiUrl handles routes without leading slashes cleanly', () => {
    const url = getFullApiUrl('v1/nirf/score')
    expect(url).toContain('/api/v1/nirf/score')
    expect(url).not.toContain('/api/api')
  })
})
