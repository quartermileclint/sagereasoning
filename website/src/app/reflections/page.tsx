'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// Reflections — Viewer for saved daily reflections
//
// Lives at /reflections. Mirrors the look and feel of
// /mentor-baseline/refinements so the two history views feel consistent.
//
// Data source: GET /api/reflections (auth-gated, user-scoped).
// Each reflection was created via /api/mentor/private/reflect or /api/reflect
// and saved to public.reflections.
// ============================================================================

const SUPABASE_TOKEN_KEY = 'sb-jdbefwkonfbhjquozgxr-auth-token'

interface PassionEntry {
  root_passion?: string
  sub_species?: string
  false_judgement?: string
}

interface ReflectionRow {
  id: string
  user_id: string
  what_happened: string
  how_responded: string | null
  katorthoma_proximity: string | null
  passions_detected: PassionEntry[] | unknown | null
  sage_perspective: string | null
  evening_prompt: string | null
  created_at: string
}

// ── Helpers ────────────────────────────────────────────────────────

function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(SUPABASE_TOKEN_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.access_token || null
  } catch {
    return null
  }
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function proximityStyle(level: string | null): { bg: string; color: string; label: string } {
  const l = (level || '').toLowerCase()
  if (l === 'sage_like') return { bg: '#1a3a2a', color: '#4caf6a', label: 'Sage-like' }
  if (l === 'principled') return { bg: '#1a2a4a', color: '#5b9cf5', label: 'Principled' }
  if (l === 'deliberate') return { bg: '#2a2a4a', color: '#8080e0', label: 'Deliberate' }
  if (l === 'habitual') return { bg: '#3a2a1a', color: '#e0a050', label: 'Habitual' }
  if (l === 'reflexive') return { bg: '#3a1a1a', color: '#e06060', label: 'Reflexive' }
  return { bg: '#2a2d3a', color: '#a0a0a0', label: level || 'Unassessed' }
}

function asPassions(value: unknown): PassionEntry[] {
  if (!value) return []
  if (Array.isArray(value)) return value as PassionEntry[]
  return []
}

// ── Component ──────────────────────────────────────────────────────

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<ReflectionRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const loadReflections = useCallback(async () => {
    setLoadError('')
    const token = readAuthToken()
    if (!token) {
      setLoadError('Not signed in — cannot load reflections.')
      setReflections([])
      setLoaded(true)
      return
    }
    try {
      const res = await fetch('/api/reflections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setLoadError(`Server responded ${res.status}: ${data?.error || 'unknown error'}`)
        setReflections([])
        setLoaded(true)
        return
      }
      const data = await res.json()
      if (!data?.success || !Array.isArray(data.reflections)) {
        setLoadError('Unexpected response shape from server.')
        setReflections([])
        setLoaded(true)
        return
      }
      const rows = data.reflections as ReflectionRow[]
      setReflections(rows)
      if (rows.length > 0) setSelectedId(rows[0].id)
      setLoaded(true)
    } catch (err) {
      setLoadError(`Network error: ${String(err)}`)
      setReflections([])
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadReflections()
  }, [loadReflections])

  const selected = reflections.find(r => r.id === selectedId) || null
  const passions = selected ? asPassions(selected.passions_detected) : []

  const handleCopyJson = () => {
    if (!selected) return
    try {
      const text = JSON.stringify(selected, null, 2)
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    } catch {
      const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selected.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const baseStyle: React.CSSProperties = {
    padding: '32px',
    maxWidth: 1000,
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    color: '#e0e0e0',
    minHeight: '100vh',
  }

  // ── Loading state ──
  if (!loaded) {
    return (
      <div style={baseStyle}>
        <div style={{ padding: 40, textAlign: 'center', color: '#8a8fa0' }}>Loading…</div>
      </div>
    )
  }

  // ── Error state ──
  if (loadError) {
    return (
      <div style={baseStyle}>
        <div style={{ marginBottom: 8 }}>
          <a href="/private-mentor" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Private Mentor
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 16px 0', color: '#fff' }}>
          Saved Reflections
        </h1>
        <div
          style={{
            padding: 24,
            background: '#2a1a1a',
            border: '1px solid #3a2a2a',
            borderRadius: 6,
            color: '#e06060',
          }}
        >
          {loadError}
        </div>
      </div>
    )
  }

  // ── Empty state ──
  if (reflections.length === 0) {
    return (
      <div style={baseStyle}>
        <div style={{ marginBottom: 8 }}>
          <a href="/private-mentor" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Private Mentor
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 16px 0', color: '#fff' }}>
          Saved Reflections
        </h1>
        <div
          style={{
            padding: 24,
            background: '#1a1d2a',
            border: '1px solid #2a2d3a',
            borderRadius: 6,
            color: '#8a8fa0',
          }}
        >
          No reflections found. Submit an Evening Reflection or Morning Check-in
          from the Private Mentor and it will appear here.
        </div>
      </div>
    )
  }

  return (
    <div style={baseStyle}>
      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid #2a2d3a', paddingBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/private-mentor" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Private Mentor
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 4px 0', color: '#fff' }}>
          Saved Reflections
        </h1>
        <p style={{ fontSize: 13, color: '#8a8fa0', margin: 0 }}>
          {reflections.length} reflection{reflections.length === 1 ? '' : 's'} on record
        </p>
      </div>

      {/* Reflection selector */}
      {reflections.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#8a8fa0', marginBottom: 8 }}>Select a reflection:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {reflections.map(r => {
              const prox = proximityStyle(r.katorthoma_proximity)
              const isSelected = r.id === selectedId
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  style={{
                    padding: '8px 14px',
                    background: isSelected ? '#5b9cf5' : '#1a1d2a',
                    color: isSelected ? '#fff' : '#c8c8c8',
                    border: '1px solid #2a2d3a',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{formatShortDate(r.created_at)}</span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 3,
                      background: isSelected ? 'rgba(255,255,255,0.15)' : prox.bg,
                      color: isSelected ? '#fff' : prox.color,
                    }}
                  >
                    {prox.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selected && (
        <>
          {/* Meta + copy JSON */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 24,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: '#8a8fa0', marginBottom: 4 }}>
                Submitted {formatDateTime(selected.created_at)}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: proximityStyle(selected.katorthoma_proximity).bg,
                    color: proximityStyle(selected.katorthoma_proximity).color,
                    fontWeight: 600,
                  }}
                >
                  {proximityStyle(selected.katorthoma_proximity).label}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyJson}
              style={{
                padding: '6px 12px',
                background: '#1a1d2a',
                color: '#c8c8c8',
                border: '1px solid #2a2d3a',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>

          {/* What happened */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={sectionHeading}>What happened</h2>
            <div style={paragraphBox}>{selected.what_happened}</div>
          </section>

          {/* How I responded */}
          {selected.how_responded && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={sectionHeading}>How I responded</h2>
              <div style={paragraphBox}>{selected.how_responded}</div>
            </section>
          )}

          {/* Sage perspective */}
          {selected.sage_perspective && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={sectionHeading}>Sage perspective</h2>
              <div style={paragraphBox}>{selected.sage_perspective}</div>
            </section>
          )}

          {/* Passions detected */}
          {passions.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={sectionHeading}>Passions detected</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {passions.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      background: '#1a1d2a',
                      border: '1px solid #2a2d3a',
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {p.root_passion && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 3,
                            background: '#3a1a1a',
                            color: '#e06060',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {p.root_passion}
                        </span>
                      )}
                      {p.sub_species && (
                        <span
                          style={{
                            fontSize: 12,
                            color: '#c8c8c8',
                          }}
                        >
                          {p.sub_species}
                        </span>
                      )}
                    </div>
                    {p.false_judgement && (
                      <div style={{ fontSize: 13, color: '#a0a0a0', fontStyle: 'italic' }}>
                        False judgement: {p.false_judgement}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Evening prompt */}
          {selected.evening_prompt && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={sectionHeading}>Evening prompt</h2>
              <div
                style={{
                  ...paragraphBox,
                  fontStyle: 'italic',
                  borderLeft: '3px solid #5b9cf5',
                }}
              >
                {selected.evening_prompt}
              </div>
            </section>
          )}

          {/* Footer disclaimer */}
          <div
            style={{
              marginTop: 32,
              padding: 14,
              background: '#14161f',
              border: '1px solid #2a2d3a',
              borderRadius: 4,
              fontSize: 11,
              color: '#7a7f8f',
              lineHeight: 1.6,
            }}
          >
            SageReasoning offers philosophical exercises for self-examination.
            These reflections are guidance, not judgment. Only you know the full
            context of your choices. Not a substitute for therapy or professional
            advice.
          </div>
        </>
      )}
    </div>
  )
}

const sectionHeading: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '#8a8fa0',
  margin: '0 0 10px 0',
}

const paragraphBox: React.CSSProperties = {
  padding: 14,
  background: '#1a1d2a',
  border: '1px solid #2a2d3a',
  borderRadius: 6,
  fontSize: 14,
  lineHeight: 1.65,
  color: '#e0e0e0',
  whiteSpace: 'pre-wrap',
}
