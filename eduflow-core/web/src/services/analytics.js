import { getFullApiUrl } from '../config/apiConfig'

// Analytics tracking service

class Analytics {
  constructor() {
    this.events = []
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      ...data,
    }

    this.events.push(event)

    // Send to analytics endpoint
    this.sendEvent(event)
  }

  trackPageView(pageName, properties = {}) {
    this.trackEvent('page_view', {
      page: pageName,
      title: document.title,
      referrer: document.referrer,
      ...properties,
    })
  }

  trackSearch(query, resultCount) {
    this.trackEvent('search', {
      query,
      resultCount,
    })
  }

  trackUserAction(action, target, details = {}) {
    this.trackEvent('user_action', {
      action,
      target,
      ...details,
    })
  }

  trackError(error, context = {}) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    })
  }

  trackTiming(metric, duration) {
    this.trackEvent('timing', {
      metric,
      duration,
    })
  }

  sendEvent(event) {
    // Send to analytics backend
    fetch(getFullApiUrl('/analytics/events'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error('Analytics error:', error)
    })
  }

  getSessionAnalytics() {
    const duration = Date.now() - this.startTime
    return {
      sessionId: this.sessionId,
      duration,
      eventCount: this.events.length,
      events: this.events,
    }
  }
}

const analyticsInstance = new Analytics()

export default analyticsInstance

export function useAnalytics() {
  return analyticsInstance
}

// Auto-track page views
if (typeof window !== 'undefined') {
  const trackPageView = () => {
    analyticsInstance.trackPageView(window.location.pathname)
  }

  window.addEventListener('load', trackPageView)

  // Track navigation changes
  const originalPushState = history.pushState
  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    trackPageView()
  }
}
