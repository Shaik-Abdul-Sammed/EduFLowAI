/**
 * wakeUpHandler.js
 * Resilient fetch wrapper designed for free-tier server cold-starts (e.g. Render 15-min idle spin-down).
 * - Detects connection failures, timeouts, and 502/503/504 gateway states
 * - Displays a non-intrusive waking banner
 * - Retries after a 5 second grace period
 */

let wakeUpBannerElement = null

function showWakeUpBanner(message = 'Waking up the server. This may take 30-45 seconds on initial request...') {
  if (typeof document === 'undefined') return
  if (!wakeUpBannerElement) {
    wakeUpBannerElement = document.createElement('div')
    wakeUpBannerElement.id = 'eduflow-wake-up-banner'
    wakeUpBannerElement.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 12px 24px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      z-index: 99999;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
    `
    const spinner = document.createElement('span')
    spinner.style.cssText = `
      width: 14px;
      height: 14px;
      border: 2px solid #38bdf8;
      border-top-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: spin 1s linear infinite;
    `
    wakeUpBannerElement.appendChild(spinner)
    const textNode = document.createElement('span')
    textNode.id = 'eduflow-wake-up-text'
    wakeUpBannerElement.appendChild(textNode)

    const styleTag = document.createElement('style')
    styleTag.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(styleTag)
    document.body.appendChild(wakeUpBannerElement)
  }

  const textNode = document.getElementById('eduflow-wake-up-text')
  if (textNode) textNode.textContent = message
  wakeUpBannerElement.style.opacity = '1'
  wakeUpBannerElement.style.display = 'flex'
}

function hideWakeUpBanner() {
  if (wakeUpBannerElement) {
    wakeUpBannerElement.style.opacity = '0'
    setTimeout(() => {
      if (wakeUpBannerElement) wakeUpBannerElement.style.display = 'none'
    }, 300)
  }
}

/**
 * Executes a fetch with automatic cold start detection and single 5s retry.
 * @param {string} url 
 * @param {RequestInit} [options] 
 * @returns {Promise<Response>}
 */
export async function wakeUpFetch(url, options = {}) {
  try {
    const res = await fetch(url, options)
    // Render returns 502/503 while warming up
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      showWakeUpBanner()
      await new Promise((resolve) => setTimeout(resolve, 5000))
      const retryRes = await fetch(url, options)
      hideWakeUpBanner()
      return retryRes
    }
    hideWakeUpBanner()
    return res
  } catch {
    // Network error or offline
    showWakeUpBanner('Server waking up... Retrying connection in 5 seconds.')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    try {
      const retryRes = await fetch(url, options)
      hideWakeUpBanner()
      return retryRes
    } catch (retryErr) {
      hideWakeUpBanner()
      throw retryErr
    }
  }
}

export default wakeUpFetch
