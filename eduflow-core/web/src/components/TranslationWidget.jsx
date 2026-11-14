import { useState } from 'react'
import { Languages, Check, ChevronDown } from 'lucide-react'
import { getApiBaseURL } from '../config/apiConfig'
import { safeJson } from '../utils/wakeUpHandler'

export const supportedLanguages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'de', name: 'German', native: 'Deutsch' }
]

export default function TranslationWidget({ onLanguageSelect, currentLanguage = 'en' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(currentLanguage)
  const [translating, setTranslating] = useState(false)

  const handleSelect = async (langCode) => {
    setSelectedLang(langCode)
    setIsOpen(false)
    setTranslating(true)

    try {
      await fetch(`${getApiBaseURL()}/v1/translate/instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Welcome to EduFlow AI Academic Experience',
          targetLang: langCode,
          module: 'HeaderBar'
        })
      })
      if (onLanguageSelect) onLanguageSelect(langCode)
    } catch {
      if (onLanguageSelect) onLanguageSelect(langCode)
    } finally {
      setTranslating(false)
    }
  }

  const activeLangObj = supportedLanguages.find(l => l.code === selectedLang) || supportedLanguages[0]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-sm btn-light border d-flex align-items-center gap-1.5 shadow-sm"
        style={{
          borderRadius: '0.75rem',
          padding: '8px 14px',
          fontWeight: 600,
          background: '#ffffff',
          color: '#334155'
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Languages size={16} className="text-primary" />
        <span className="small">{activeLangObj.native}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {/* Dropdown Menu strictly using z-index: 9999 so it never hides behind other elements */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 9999,
            minWidth: '180px',
            background: '#ffffff',
            borderRadius: '0.85rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            padding: '4px 0'
          }}
        >
          <div className="px-3 py-1.5 text-uppercase small text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            Translate Interface
          </div>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              role="menuitem"
              onClick={() => handleSelect(lang.code)}
              className="w-100 text-start px-3 py-2 border-0 d-flex justify-content-between align-items-center small"
              style={{
                background: selectedLang === lang.code ? '#f0fdf4' : 'transparent',
                color: selectedLang === lang.code ? '#166534' : '#1e293b',
                cursor: 'pointer'
              }}
            >
              <span>{lang.native} <span className="text-muted small">({lang.name})</span></span>
              {selectedLang === lang.code && <Check size={14} className="text-success" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
