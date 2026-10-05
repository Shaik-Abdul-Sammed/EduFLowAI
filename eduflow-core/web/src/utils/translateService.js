import { getFullApiUrl } from '../config/apiConfig'

// Simple DOM translation helper that posts element HTML to the backend
export async function translateElement(element, target = 'en') {
  if (!element) throw new Error('No DOM element provided')
  const html = element.innerHTML
  const resp = await fetch(getFullApiUrl('/v1/translate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, target })
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => null)
    throw new Error(err?.error || `Translate failed: ${resp.status}`)
  }
  const data = await resp.json()
  if (data && data.html) {
    element.innerHTML = data.html
    return data
  }
  return data
}

// Example usage:
// import { translateElement } from '../utils/translateService'
// translateElement(document.querySelector('#sidebar'), 'hi')
