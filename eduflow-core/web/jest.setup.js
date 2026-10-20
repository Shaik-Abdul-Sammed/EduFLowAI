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

// Phase 3: Suppress unhandled rejections
process.on('unhandledRejection', (reason) => {
  // Silently ignore fetch aborts and connection failures in JSDOM
  if (
    reason?.message?.includes('Failed to fetch') ||
    reason?.message?.includes('ECONNREFUSED') ||
    reason?.name === 'AbortError'
  ) {
    return
  }
  console.error('Unhandled Rejection:', reason)
})

// Phase 2: Suppress expected console errors and warnings
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = args.map((a) => (typeof a === 'object' && a?.message ? a.message : String(a))).join(' ')
    // Ignore expected errors from negative tests
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
      msg.includes('not wrapped in act')
    ) {
      return
    }
    // Still show real errors
    console.log(...args)
  })

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const msg = args.map((a) => (typeof a === 'object' && a?.message ? a.message : String(a))).join(' ')
    if (
      msg.includes('The width(-1) and height(-1) of chart') ||
      msg.includes('componentWillReceiveProps')
    ) {
      return
    }
    console.log(...args)
  })
})

afterAll(() => {
  console.error.mockRestore?.()
  console.warn.mockRestore?.()
})
