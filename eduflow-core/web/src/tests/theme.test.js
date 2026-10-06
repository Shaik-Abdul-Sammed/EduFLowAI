import fs from 'node:fs'
import path from 'node:path'

describe('Dark Mode Theme Configuration Audit', () => {
  const indexCssPath = path.resolve(process.cwd(), 'src/index.css')
  const loginPagePath = path.resolve(process.cwd(), 'src/pages/public/LoginPage.jsx')
  const indexCss = fs.readFileSync(indexCssPath, 'utf-8')
  const loginPage = fs.readFileSync(loginPagePath, 'utf-8')

  test('index.css defines complete dark mode variables in [data-theme="dark"]', () => {
    expect(indexCss).toMatch(/\[data-theme=['"]dark['"]\]\s*\{/)
    expect(indexCss).toMatch(/--card-bg:\s*rgba\(12,\s*18,\s*30/)
    expect(indexCss).toMatch(/--app-text:\s*#e6eef8/)
    expect(indexCss).toMatch(/--app-text-muted:\s*#9aa6bb/)
    expect(indexCss).toMatch(/--border-color:\s*rgba\(148,\s*163,\s*184/)
    expect(indexCss).toMatch(/--input-bg:\s*rgba\(12,\s*18,\s*30/)
    expect(indexCss).toMatch(/--surface-bg:\s*rgba\(8,\s*15,\s*29/)
  })

  test('index.css has .login-card theme support for dark mode', () => {
    expect(indexCss).toMatch(/\.login-card/)
    expect(indexCss).toMatch(/\[data-theme=['"]dark['"]\]\s+\.login-card/)
  })

  test('LoginPage.jsx does NOT contain hardcoded white card background', () => {
    expect(loginPage).not.toMatch(/className="login-card"[^>]*background:\s*['"]#ffffff['"]/)
    expect(loginPage).toMatch(/background:\s*['"]var\(--card-bg/)
  })

  test('LoginPage.jsx input fields use theme CSS variables for background and text', () => {
    expect(loginPage).toMatch(/background:\s*['"]var\(--input-bg/)
    expect(loginPage).toMatch(/border:\s*['"]1px solid var\(--border-color/)
  })

  test('LoginPage.jsx credential boxes and labels adapt to dark mode', () => {
    expect(loginPage).toMatch(/color:\s*['"]var\(--hero-text,\s*var\(--app-text/)
    expect(loginPage).toMatch(/color:\s*['"]var\(--app-text/)
  })
})
