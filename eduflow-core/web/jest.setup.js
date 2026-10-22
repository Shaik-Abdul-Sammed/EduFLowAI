import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'node:util'

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder
}

// Mock import.meta for Jest
if (!globalThis.import) {
  globalThis.import = {}
}
if (!globalThis.import.meta) {
  globalThis.import.meta = {
    env: {
      VITE_API_BASE_URL: 'http://localhost:4000/api',
    },
  }
}

// jsdom doesn't implement window.scrollTo; mock to silence tests and animation libs
if (typeof globalThis.scrollTo !== 'function') {
  globalThis.scrollTo = () => {}
}

jest.mock('react-markdown', () => {
  return function MockReactMarkdown(props) {
    return <div data-testid="markdown-renderer">{props.children}</div>
  }
})
jest.mock('remark-gfm', () => () => {})

// Provide safe default mock for relative URLs in JSDOM
if (typeof globalThis.fetch === 'function') {
  const originalFetch = globalThis.fetch
  globalThis.fetch = jest.fn(async (url, options) => {
    if (typeof url === 'string' && (url.startsWith('/') || !url.startsWith('http'))) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ providers: [] }),
        text: async () => '',
        blob: async () => new Blob(),
      }
    }
    try {
      return await originalFetch(url, options)
    } catch {
      return { ok: false, status: 500, json: async () => ({}) }
    }
  })
}

// Phase 3: Suppress unhandled rejections
process.on('unhandledRejection', (reason) => {
  // Silently ignore fetch aborts and connection failures in JSDOM
  if (
    reason?.message?.includes('Failed to fetch') ||
    reason?.message?.includes('ECONNREFUSED') ||
    reason?.message?.includes('Failed to parse URL') ||
    reason?.name === 'AbortError'
  ) {
    return
  }
})

// Phase 2: Suppress expected console errors and warnings
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = args.map((a) => (typeof a === 'object' && a?.message ? a.message : String(a))).join(' ')
    // Ignore expected errors from negative tests and environment quirks
    if (
      msg.includes('Not implemented: HTMLCanvasElement') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Auth error') ||
      msg.includes('act(') ||
      msg.includes('Network Error') ||
      msg.includes('Streaming officer error') ||
      msg.includes('Dashboard error') ||
      msg.includes('Database connection failed') ||
      msg.includes('connection failed') ||
      msg.includes('not wrapped in act') ||
      msg.includes('Failed to parse URL') ||
      msg.includes('Cannot reach server') ||
      msg.includes('Invalid credentials') ||
      msg.includes('Login error') ||
      msg.includes('Registration error') ||
      msg.includes('Logout API failed') ||
      msg.includes('Firebase initialization error') ||
      msg.includes('React Router') ||
      msg.includes('401') ||
      msg.includes('503')
    ) {
      return
    }
  })

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const msg = args.map((a) => (typeof a === 'object' && a?.message ? a.message : String(a))).join(' ')
    if (
      msg.includes('The width(-1) and height(-1) of chart') ||
      msg.includes('componentWillReceiveProps') ||
      msg.includes('not wrapped in act') ||
      msg.includes('React Router')
    ) {
      return
    }
  })
})

afterAll(() => {
  console.error.mockRestore?.()
  console.warn.mockRestore?.()
})
