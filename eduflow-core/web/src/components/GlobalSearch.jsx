import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecentSearches, saveRecentSearch } from '../services/searchService'
import { useI18n } from '../i18n'
import { getApiBaseURL } from '../config/apiConfig'

const RECENT_KEY = 'eduflow-ai-recent-searches'

function toTitle(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function fuzzyScore(text, query) {
  const source = text.toLowerCase()
  const q = query.trim().toLowerCase()
  if (!q) return 0
  if (source === q) return 100
  if (source.startsWith(q)) return 80
  if (source.includes(q)) return 60

  let qi = 0
  for (let i = 0; i < source.length && qi < q.length; i += 1) {
    if (source[i] === q[qi]) qi += 1
  }
  return qi === q.length ? 40 : 0
}

function loadLocalRecent(role) {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}')
    return parsed[role] || []
  } catch {
    return []
  }
}

function storeLocalRecent(role, item) {
  const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '{}')
  const existing = parsed[role] || []
  const deduped = [item, ...existing.filter((x) => x.routePath !== item.routePath)].slice(0, 6)
  parsed[role] = deduped
  localStorage.setItem(RECENT_KEY, JSON.stringify(parsed))
  return deduped
}

export default function GlobalSearch({ routes = [], currentRole = 'student', className = '' }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recent, setRecent] = useState([])
  const [apiResults, setApiResults] = useState([])
  const navigate = useNavigate()
  const ref = useRef()
  const inputRef = useRef()
  const { t } = useI18n()

  useEffect(() => {
    const trimmed = q.trim()
    if (!trimmed) {
      setApiResults([])
      return
    }

    let active = true
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        const res = await fetch(`${getApiBaseURL()}/v1/search?q=${encodeURIComponent(trimmed)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (active && Array.isArray(data.results)) {
            setApiResults(data.results)
          }
        }
      } catch {
        // Fallback gracefully
      }
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [q])

  const scopedRoutes = useMemo(() => {
    if (!currentRole) return routes
    return routes.filter((route) => route.role === currentRole)
  }, [routes, currentRole])

  const indexedRoutes = useMemo(
    () => scopedRoutes.map((r) => ({ ...r, title: toTitle(r.slug), haystack: `${r.slug} ${toTitle(r.slug)} ${r.role}` })),
    [scopedRoutes],
  )

  const routeTitleByPath = useMemo(() => {
    const map = new Map()
    indexedRoutes.forEach((route) => {
      map.set(route.routePath, route.title)
    })
    return map
  }, [indexedRoutes])

  useEffect(() => {
    function onDoc(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadRecent() {
      const local = loadLocalRecent(currentRole)
      if (mounted) setRecent(local)

      try {
        const serverItems = await getRecentSearches(currentRole)
        if (mounted && Array.isArray(serverItems) && serverItems.length) {
          setRecent(serverItems)
        }
      } catch {
        // Keep local fallback when backend is unavailable.
      }
    }

    loadRecent()
    return () => {
      mounted = false
    }
  }, [currentRole])

  useEffect(() => {
    function onHotKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
        setSelectedIndex(0)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onHotKey)
    return () => document.removeEventListener('keydown', onHotKey)
  }, [])

  const results = useMemo(() => {
    if (!q.trim()) return []

    return indexedRoutes
      .map((r) => ({ ...r, score: fuzzyScore(r.haystack, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 8)
  }, [indexedRoutes, q])

  const listItems = useMemo(() => {
    if (q.trim()) {
      const combined = [...results]
      const seen = new Set(results.map((r) => r.routePath))
      apiResults.forEach((ar) => {
        if (!seen.has(ar.routePath) || ar.category) {
          combined.push(ar)
        }
      })
      return combined.slice(0, 15)
    }
    return recent
      .filter((item) => !currentRole || item.role === currentRole)
      .map((item) => ({
        ...item,
        title: item.title || routeTitleByPath.get(item.routePath) || item.query || 'Untitled module',
      }))
  }, [q, results, apiResults, recent, currentRole, routeTitleByPath])

  async function openRoute(item) {
    if (!item?.routePath) return
    navigate(item.routePath)
    setOpen(false)
    setQ('')

    const saved = {
      role: currentRole,
      query: q || item.title,
      routePath: item.routePath,
      title: item.title,
    }

    setRecent(storeLocalRecent(currentRole, saved))

    try {
      await saveRecentSearch(saved)
    } catch {
      // Local history remains even if backend save fails.
    }
  }

  function onKeyDown(event) {
    if (!open) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((s) => Math.min(s + 1, listItems.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((s) => Math.max(s - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0
      if (listItems[fallbackIndex]) {
        openRoute(listItems[fallbackIndex])
      }
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={`position-relative ${className}`} ref={ref}>
      <input
        ref={inputRef}
        aria-label="Global search"
        className="form-control form-control-sm"
        placeholder={t('search_placeholder')}
        value={q}
        onFocus={() => {
          setOpen(true)
          if (listItems.length > 0) setSelectedIndex(0)
        }}
        onChange={(event) => {
          setQ(event.target.value)
          setSelectedIndex(0)
        }}
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className="card position-absolute mt-1" style={{ right: 0, left: 0, zIndex: 1100 }} role="listbox">
          {!q.trim() && <div className="small text-muted px-3 pt-2">{t('search_recent')}</div>}
          <ul className="list-group list-group-flush">
            {listItems.length === 0 && <li className="list-group-item">{t('search_no_results')}</li>}
            {listItems.map((item, index) => (
              <li
                key={item.id || item.routePath || index}
                role="option"
                aria-selected={index === selectedIndex}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${index === selectedIndex ? 'search-result-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => openRoute(item)}
              >
                <div>
                  <div className="fw-medium text-dark">{item.title || toTitle(item.slug || '')}</div>
                  {item.subtitle && <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.subtitle}</div>}
                </div>
                {item.category && (
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-2 text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {item.category}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
