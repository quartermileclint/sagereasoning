'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// Mentor Baseline Refinements — Viewer for saved rounds
//
// Lives at /mentor-baseline/refinements. Reads rounds stored in this browser
// by the /mentor-baseline form page, and renders each round as a readable
// refinement page (summary, confidence changes, per-question detail).
//
// Storage is browser-local (sage-baseline-rounds-v1). JSON export lets you
// back up a round externally. Server-side persistence is a separate future
// build; this is Phase 1.
// ============================================================================

const ROUNDS_KEY = 'sage-baseline-rounds-v1'

interface BaselineQuestion {
  id: string
  category?: string
  target_dimension?: string
  stoic_brain_source?: string
  question_text: string
  what_the_answer_reveals?: string
  follow_up_if_surprising?: string
}

interface RefinementNote {
  question_id: string
  dimension_affected: string
  change_type: string
  before: string
  after: string
  reasoning: string
}

interface RefinementResult {
  refinement_notes?: RefinementNote[]
  confidence_changes?: Record<string, string>
  summary?: string
  reasoning_receipt?: {
    receipt_id?: string
    timestamp?: string
    skill_id?: string
    mechanisms_applied?: string[]
  }
  disclaimer?: string
}

interface RefinementResponse {
  success?: boolean
  refinement?: {
    result?: RefinementResult
    meta?: {
      endpoint?: string
      ai_model?: string
      latency_ms?: number
      mechanism_count?: number
    }
  }
  current_profile?: unknown
  responses_processed?: number
  disclaimer?: string
}

interface StoredRound {
  id: string
  generatedAt: string
  submittedAt: string
  questions: BaselineQuestion[]
  answers: Record<string, string>
  refinement: RefinementResponse
}

// ── Helpers ────────────────────────────────────────────────────────

function readRounds(): StoredRound[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(ROUNDS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? (parsed as StoredRound[]) : []
  } catch {
    return []
  }
}

function writeRounds(rounds: StoredRound[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds))
  } catch {
    // Ignore quota errors.
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

function formatDimensionLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function changeTypeStyle(changeType: string): { bg: string; color: string; label: string } {
  const ct = (changeType || '').toLowerCase()
  if (ct === 'confirmed') return { bg: '#1a3a2a', color: '#4caf6a', label: 'Confirmed' }
  if (ct === 'adjusted') return { bg: '#3a2a1a', color: '#e0a050', label: 'Adjusted' }
  if (ct === 'gap_filled') return { bg: '#1a2a4a', color: '#5b9cf5', label: 'Gap filled' }
  if (ct === 'new_finding') return { bg: '#3a1a3a', color: '#c080e0', label: 'New finding' }
  return { bg: '#2a2d3a', color: '#a0a0a0', label: changeType || 'Change' }
}

function confidenceTone(note: string): { color: string } {
  const lower = (note || '').toLowerCase()
  if (lower.startsWith('increased')) return { color: '#4caf6a' }
  if (lower.startsWith('decreased')) return { color: '#e06060' }
  if (lower.startsWith('adjusted')) return { color: '#e0a050' }
  if (lower.startsWith('unchanged')) return { color: '#8a8fa0' }
  return { color: '#c8c8c8' }
}

// ── Component ──────────────────────────────────────────────────────

export default function RefinementsPage() {
  const [rounds, setRounds] = useState<StoredRound[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = readRounds()
    // Newest first
    stored.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
    setRounds(stored)
    if (stored.length > 0) setSelectedId(stored[0].id)
    setLoaded(true)
  }, [])

  const selected = rounds.find(r => r.id === selectedId) || null
  const result = selected?.refinement?.refinement?.result
  const meta = selected?.refinement?.refinement?.meta

  const handleDelete = (id: string) => {
    const ok = confirm(
      'Delete this refinement round? This cannot be undone and deletes only the browser-stored copy.'
    )
    if (!ok) return
    const next = rounds.filter(r => r.id !== id)
    writeRounds(next)
    setRounds(next)
    if (selectedId === id) setSelectedId(next[0]?.id || null)
  }

  const handleCopyJson = () => {
    if (!selected) return
    try {
      const text = JSON.stringify(selected, null, 2)
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    } catch {
      // Fallback: surface as a download
      const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selected.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const toggle = (qid: string) => {
    setExpanded(prev => ({ ...prev, [qid]: !prev[qid] }))
  }

  const expandAll = () => {
    if (!result?.refinement_notes) return
    const next: Record<string, boolean> = {}
    result.refinement_notes.forEach(n => { next[n.question_id] = true })
    setExpanded(next)
  }

  const collapseAll = () => setExpanded({})

  const baseStyle: React.CSSProperties = {
    padding: '32px',
    maxWidth: 1000,
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    color: '#e0e0e0',
    minHeight: '100vh',
  }

  // ── Empty state ──
  if (loaded && rounds.length === 0) {
    return (
      <div style={baseStyle}>
        <div style={{ marginBottom: 8 }}>
          <a href="/mentor-baseline" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Baseline Gap Questions
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 16px 0', color: '#fff' }}>
          Saved Refinements
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
          No refinements are stored in this browser yet. Complete a round on the Baseline Gap
          Questions page and submit your answers — the refinement will appear here.
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div style={baseStyle}>
        <div style={{ padding: 40, textAlign: 'center', color: '#8a8fa0' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={baseStyle}>
      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid #2a2d3a', paddingBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/mentor-baseline" style={{ color: '#5b9cf5', textDecoration: 'none', fontSize: 14 }}>
            &larr; Back to Baseline Gap Questions
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '8px 0 4px 0', color: '#fff' }}>
          Saved Refinements
        </h1>
        <p style={{ fontSize: 13, color: '#8a8fa0', margin: 0 }}>
          Stored in this browser only · {rounds.length} round{rounds.length === 1 ? '' : 's'} saved
        </p>
      </div>

      {/* Rounds selector */}
      {rounds.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#8a8fa0', marginBottom: 8 }}>Select a round:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {rounds.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                style={{
                  padding: '8px 14px',
                  background: r.id === selectedId ? '#5b9cf5' : '#1a1d2a',
                  color: r.id === selectedId ? '#fff' : '#c8c8c8',
                  border: '1px solid #2a2d3a',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {formatDateTime(r.submittedAt)}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <>
          {/* Round header */}
          <div
            style={{
              padding: 16,
              background: '#1a1d2a',
              border: '1px solid #2a2d3a',
              borderRadius: 6,
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 16, color: '#fff', fontWeight: 500, marginBottom: 4 }}>
                Round submitted {formatDateTime(selected.submittedAt)}
              </div>
              <div style={{ fontSize: 12, color: '#5a5f70' }}>
                {meta?.ai_model && <span>Model: {meta.ai_model}</span>}
                {meta?.latency_ms != null && (
                  <span> · {(meta.latency_ms / 1000).toFixed(1)}s</span>
                )}
                {selected.refinement?.responses_processed != null && (
                  <span> · {selected.refinement.responses_processed} answers processed</span>
                )}
                {result?.reasoning_receipt?.receipt_id && (
                  <span> · Receipt {result.reasoning_receipt.receipt_id}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopyJson}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  color: '#5b9cf5',
                  border: '1px solid #5b9cf5',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {copied ? 'Copied ✓' : 'Copy as JSON'}
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  color: '#e06060',
                  border: '1px solid #5a2a2a',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Summary */}
          {result?.summary && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, color: '#fff', margin: '0 0 12px 0', fontWeight: 600 }}>
                Summary
              </h2>
              <div
                style={{
                  padding: 20,
                  background: '#1a2030',
                  border: '1px solid #2a3548',
                  borderRadius: 6,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: '#e0e4ec',
                }}
              >
                {result.summary}
              </div>
            </section>
          )}

          {/* Confidence changes */}
          {result?.confidence_changes && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, color: '#fff', margin: '0 0 12px 0', fontWeight: 600 }}>
                Confidence changes
              </h2>
              <div style={{ border: '1px solid #2a2d3a', borderRadius: 6, overflow: 'hidden' }}>
                {Object.entries(result.confidence_changes).map(([key, note], idx) => {
                  const tone = confidenceTone(note)
                  return (
                    <div
                      key={key}
                      style={{
                        padding: 16,
                        background: idx % 2 === 0 ? '#1a1d2a' : '#15171f',
                        borderBottom: '1px solid #2a2d3a',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 12,
                          marginBottom: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 500, minWidth: 160 }}>
                          {formatDimensionLabel(key)}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: tone.color,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {note.split('—')[0]?.trim() || note.split('-')[0]?.trim()}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: '#c8c8c8', lineHeight: 1.55 }}>
                        {note.includes('—') ? note.split('—').slice(1).join('—').trim() : note}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Per-question detail */}
          {result?.refinement_notes && result.refinement_notes.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <h2 style={{ fontSize: 18, color: '#fff', margin: 0, fontWeight: 600 }}>
                  Per-question detail ({result.refinement_notes.length})
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={expandAll}
                    style={{
                      padding: '6px 10px',
                      background: 'transparent',
                      color: '#8a8fa0',
                      border: '1px solid #3a3d4a',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Expand all
                  </button>
                  <button
                    onClick={collapseAll}
                    style={{
                      padding: '6px 10px',
                      background: 'transparent',
                      color: '#8a8fa0',
                      border: '1px solid #3a3d4a',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Collapse all
                  </button>
                </div>
              </div>

              {result.refinement_notes.map((note, idx) => {
                const q = selected.questions.find(x => x.id === note.question_id)
                const answer = selected.answers[note.question_id] || ''
                const isOpen = !!expanded[note.question_id]
                const ct = changeTypeStyle(note.change_type)
                return (
                  <div
                    key={note.question_id}
                    style={{
                      marginBottom: 12,
                      background: '#1a1d2a',
                      border: '1px solid #2a2d3a',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => toggle(note.question_id)}
                      style={{
                        width: '100%',
                        padding: 16,
                        background: 'transparent',
                        border: 'none',
                        color: '#e0e0e0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#5a5f70', minWidth: 90 }}>
                        Question {idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 3,
                          background: ct.bg,
                          color: ct.color,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {ct.label}
                      </span>
                      <span style={{ fontSize: 13, color: '#8a8fa0', flex: 1 }}>
                        {note.dimension_affected}
                      </span>
                      <span style={{ fontSize: 16, color: '#5a5f70' }}>{isOpen ? '▾' : '▸'}</span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #2a2d3a' }}>
                        {/* Question */}
                        {q && (
                          <div style={{ marginTop: 16 }}>
                            <div
                              style={{
                                fontSize: 11,
                                color: '#5a5f70',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                marginBottom: 6,
                              }}
                            >
                              Question
                            </div>
                            <div
                              style={{
                                fontSize: 15,
                                color: '#e8e8e8',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {q.question_text}
                            </div>
                          </div>
                        )}

                        {/* Your answer */}
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#5a5f70',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              marginBottom: 6,
                            }}
                          >
                            Your answer
                          </div>
                          <div
                            style={{
                              padding: 12,
                              background: '#0f1119',
                              borderRadius: 4,
                              fontSize: 14,
                              color: '#c8c8c8',
                              lineHeight: 1.55,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {answer || <em style={{ color: '#5a5f70' }}>(no answer provided)</em>}
                          </div>
                        </div>

                        {/* Before → After */}
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#5a5f70',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              marginBottom: 6,
                            }}
                          >
                            Before
                          </div>
                          <div
                            style={{
                              padding: 12,
                              background: '#20151a',
                              borderRadius: 4,
                              fontSize: 14,
                              color: '#d0b0b0',
                              lineHeight: 1.55,
                            }}
                          >
                            {note.before}
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#5a5f70',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              marginBottom: 6,
                            }}
                          >
                            After
                          </div>
                          <div
                            style={{
                              padding: 12,
                              background: '#15201a',
                              borderRadius: 4,
                              fontSize: 14,
                              color: '#b0d0b0',
                              lineHeight: 1.55,
                            }}
                          >
                            {note.after}
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: '#5a5f70',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              marginBottom: 6,
                            }}
                          >
                            Reasoning
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: '#a8b0bc',
                              lineHeight: 1.6,
                            }}
                          >
                            {note.reasoning}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {/* Disclaimer */}
          {(result?.disclaimer || selected.refinement?.disclaimer) && (
            <div
              style={{
                marginTop: 24,
                padding: 14,
                background: '#15171f',
                border: '1px solid #2a2d3a',
                borderRadius: 4,
                fontSize: 12,
                color: '#6a6f80',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              {result?.disclaimer || selected.refinement?.disclaimer}
            </div>
          )}
        </>
      )}
    </div>
  )
}
