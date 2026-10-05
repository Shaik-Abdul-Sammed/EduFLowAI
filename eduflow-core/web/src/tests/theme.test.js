import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

describe('Dark Mode Theme Configuration Audit', () => {
  const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf-8')
  const loginPage = fs.readFileSync(path.resolve('src/pages/public/LoginPage.jsx'), 'utf-8')

  test('index.css defines complete dark mode variables in [data-theme="dark"]', () => {
    assert.match(indexCss, /\[data-theme=['"]dark['"]\]\s*\{/)
    assert.match(indexCss, /--card-bg:\s*rgba\(12,\s*18,\s*30/)
    assert.match(indexCss, /--app-text:\s*#e6eef8/)
    assert.match(indexCss, /--app-text-muted:\s*#9aa6bb/)
    assert.match(indexCss, /--border-color:\s*rgba\(148,\s*163,\s*184/)
    assert.match(indexCss, /--input-bg:\s*rgba\(12,\s*18,\s*30/)
    assert.match(indexCss, /--surface-bg:\s*rgba\(8,\s*15,\s*29/)
  })

  test('index.css has .login-card theme support for dark mode', () => {
    assert.match(indexCss, /\.login-card/)
    assert.match(indexCss, /\[data-theme=['"]dark['"]\]\s+\.login-card/)
  })

  test('LoginPage.jsx does NOT contain hardcoded white card background', () => {
    assert.doesNotMatch(loginPage, /className="login-card"[^>]*background:\s*['"]#ffffff['"]/)
    assert.match(loginPage, /background:\s*['"]var\(--card-bg/)
  })

  test('LoginPage.jsx input fields use theme CSS variables for background and text', () => {
    assert.match(loginPage, /background:\s*['"]var\(--input-bg/)
    assert.match(loginPage, /border:\s*['"]1px solid var\(--border-color/)
  })

  test('LoginPage.jsx credential boxes and labels adapt to dark mode', () => {
    assert.match(loginPage, /color:\s*['"]var\(--hero-text,\s*var\(--app-text/)
    assert.match(loginPage, /color:\s*['"]var\(--app-text/)
  })
})
