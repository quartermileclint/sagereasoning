'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================================
// Mentor Baseline Refinements — Viewer for saved rounds
//
// Lives at /mentor-baseline/refinements. Renders each round as a readable
// refinement page (summary, confidence changes, per-question detail).
//
// Stage 2b: prefers server rounds over local storage. On mount the viewer
// calls GET /api/mentor-appendix. If that succeeds, server rounds are the
// primary source; localStorage rounds are merged in only when their
// serverAppendixId is not present on the server (so pre-sync or sync-failed
// rounds are not hidden). If the server call fails, the viewer falls back
// entirely to localStorage (sage-baseline-rounds-v1) so the page remains
// usable offline. Each round carries a Server/Local badge in the selector.
// ============================================================================

const ROUNDS_KEY = 'sage-baseline-rounds-v1'
const SUPABASE_TOKEN_KEY = 'sb-jdbefwkonfbhjquozgxr-auth-token'

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
  // Stage 2a: server linkage — stamped by the form after a successful POST.
  serverAppendixId?: string
  serverAppendixVersion?: number
  serverSavedAt?: string
}

// Stage 2b: server-side appendix round shape (from GET /api/mentor-appendix).
interface ServerRound {
  id: string
  submittedAt: string
  generatedAt: string | null
  responsesProcessed: number
  aiModel: string | null
  receiptId: string | null
  schemaVersion: number
  payload: {
    questions: BaselineQuestion[]
    answers: Record<string, string>
    refinement: RefinementResponse
  }
}

// Unified round shape used inside the viewer. Source tells the UI where
// the round came from so we can surface it honestly.
interface ViewerRound extends StoredRound {
  source: 'server' | 'local'
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

// Stage 2b: convert a server round into the shape the viewer renders.
// The server round's top-level id IS the appendix UUID; payload holds
// the original questions / answers / refinement response.
function serverRoundToViewer(sr: ServerRound): ViewerRound {
  return {
    id: sr.id,
    generatedAt: sr.generatedAt || sr.submittedAt,
    submittedAt: sr.submittedAt,
    questions: sr.payload?.questions || [],
    answers: sr.payload?.answers || {},
    refinement: sr.payload?.refinement || {},
    serverAppendixId: sr.id,
    serverSavedAt: sr.submittedAt,
    source: 'server',
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
  const [rounds, setRounds] = useState<ViewerRound[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // Stage 2b: where the displayed rounds came from, for the UI status line.
  const [sourceStatus, setSourceStatus] = useState<
    'server' | 'mixed' | 'local-only' | 'server-failed'
  >('local-only')
  const [sourceDetail, setSourceDetail] = useState<string>('')
  // Stage 2c: state for the per-round Import button.
  const [importing, setImporting] = useState(false)
  const [importNotice, setImportNotice] = useState<string>('')

  const loadRounds = useCallback(async () => {
      const localStored = readRounds()
      // Newest first
      localStored.sort((a, b) =>
        (b.submittedAt || '').localeCompare(a.submittedAt || '')
      )

      // Attempt server fetch. If it succeeds, server rounds are primary;
      // any localStorage rounds WITHOUT a matching serverAppendixId are
      // merged in as local-only (so early/offline rounds are not hidden).
      const token = readAuthToken()
      let serverRounds: ServerRound[] = []
      let serverOk = false
      let serverError = ''

      if (token) {
        try {
          const res = await fetch('/api/mentor-appendix', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const data = await res.json()
            if (data?.success && Array.isArray(data.rounds)) {
              serverRounds = data.rounds as ServerRound[]
              serverOk = true
            } else {
              serverError = 'Unexpected response shape from server.'
            }
          } else {
            const data = await res.json().catch(() => ({}))
            serverError = `Server responded ${res.status}: ${
              data?.error || 'unknown error'
            }`
          }
        } catch (err) {
          serverError = `Network error: ${String(err)}`
        }
      } else {
        serverError = 'Not signed in — server rounds cannot be fetched.'
      }

      const merged: ViewerRound[] = []
      if (serverOk) {
        // Server is source of truth. Include every server round, marked server.
        const serverIds = new Set<string>()
        for (const sr of serverRounds) {
          const vr = serverRoundToViewer(sr)
          merged.push(vr)
          serverIds.add(sr.id)
        }
        // Include localStorage rounds that are NOT represented on the server
        // (no serverAppendixId OR serverAppendixId not in the server list).
        for (const lr of localStored) {
          const sid = lr.serverAppendixId
          if (!sid || !serverIds.has(sid)) {
            merged.push({ ...lr, source: 'local' })
          }
        }
        const localOrphans = merged.filter(r => r.source === 'local').length
        if (localOrphans === 0) {
          setSourceStatus('server')
          setSourceDetail(
            `${serverRounds.length} round${
              serverRounds.length === 1 ? '' : 's'
            } loaded from the server (encrypted at rest).`
          )
        } else {
          setSourceStatus('mixed')
          setSourceDetail(
            `${serverRounds.length} server · ${localOrphans} local-only (not yet synced to the server).`
          )
        }
      } else {
        // Server unreachable — fall back to localStorage entirely.
        for (const lr of localStored) {
          merged.push({ ...lr, source: 'local' })
        }
        if (merged.length === 0) {
          setSourceStatus('local-only')
          setSourceDetail('')
        } else {
          setSourceStatus('server-failed')
          setSourceDetail(
            `Showing ${merged.length} local round${
              merged.length === 1 ? '' : 's'
            } — server load did not succeed. ${serverError}`
          )
        }
      }

      merged.sort((a, b) =>
        (b.submittedAt || '').localeCompare(a.submittedAt || '')
      )
      setRounds(merged)
      if (merged.length > 0) setSelectedId(merged[0].id)
      setLoaded(true)
  }, [])

  useEffect(() => {
    loadRounds()
  }, [loadRounds])

  const selected = rounds.find(r => r.id === selectedId) || null
  const result = selected?.refinement?.refinement?.result
  const meta = selected?.refinement?.refinement?.meta

  const handleDelete = (id: string) => {
    const target = rounds.find(r => r.id === id)
    if (!target) return

    // Stage 2b: server-side rounds cannot be deleted from the viewer yet.
    // A separate DELETE endpoint + confirmation flow will be scoped later.
    if (target.source === 'server') {
      alert(
        'This round is stored on the server (encrypted). Server-side deletion ' +
          'is not yet wired into this viewer. The local-only copy (if any) is ' +
          'already not shown here because the server copy supersedes it.'
      )
      return
    }

    const ok = confirm(
      'Delete this round from this browser? This cannot be undone. Any server ' +
        'copy is not affected.'
    )
    if (!ok) return

    // Only mutate the local store. Read fresh from localStorage (rather than
    // writing the merged list back) so server rounds never leak into the
    // local store.
    const localNext = readRounds().filter(r => r.id !== id)
    writeRounds(localNext)

    const nextRounds = rounds.filter(r => r.id !== id)
    setRounds(nextRounds)
    if (selectedId === id) setSelectedId(nextRounds[0]?.id || null)
  }

  // Stage 2c — import a local-only round into the server appendix table.
  // Uses the existing POST /api/mentor-appendix endpoint. On success the
  // localStorage round is stamped with the new serverAppendixId so it
  // will dedupe against the server copy on subsequent loads.
  const handleImport = async (id: string) => {
    const target = rounds.find(r => r.id === id)
    if (!target || target.source !== 'local') return

    const token = readAuthToken()
    if (!token) {
      alert('You are not signed in. Please sign in at /auth and try again.')
      return
    }

    const ok = confirm(
      'Import this round to the server? It will be encrypted at rest and ' +
        'accessible from any browser you sign in on. The local copy will be ' +
        'kept and stamped with the server id.'
    )
    if (!ok) return

    setImporting(true)
    setImportNotice('')
    try {
      const res = await fetch('/api/mentor-appendix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submittedAt: target.submittedAt,
          generatedAt: target.generatedAt,
          questions: target.questions,
          answers: target.answers,
          refinement: target.refinement,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success || !data?.id) {
        setImporting(false)
        setImportNotice(
          `Import failed (${res.status}): ${data?.error || 'unknown error'}`
        )
        return
      }

      // Stamp the local round with the new server id so it dedupes on reload.
      const localRounds = readRounds()
      const updatedLocal = localRounds.map(r => {
        if (r.id === id) {
          return {
            ...r,
            serverAppendixId: data.id as string,
            serverAppendixVersion: data.appendix_version as number | undefined,
            serverSavedAt: new Date().toISOString(),
          }
        }
        return r
      })
      writeRounds(updatedLocal)

      // Refresh so the imported round now appears with the Server badge.
      await loadRounds()
      setSelectedId(data.id as string)
      setImporting(false)
      setImportNotice(
        `Imported as server round #${data.appendix_version ?? '?'}.`
      )
      setTimeout(() => setImportNotice(''), 4000)
    } catch (err) {
      setImporting(false)
      setImportNotice(`Import failed: ${String(err)}`)
    }
  }

  // Format a round as readable text the founder can paste into the Private
  // Mentor conversation thread to continue the discussion. Long answers are
  // truncated so the paste stays manageable.
  const formatRoundForMentor = (round: ViewerRound): string => {
    const lines: string[] = []
    const when = formatDateTime(round.submittedAt || round.generatedAt)
    lines.push(`Baseline Refinement Round — ${when}`)
    const result = round.refinement?.refinement?.result
    if (result?.summary) {
      lines.push('')
      lines.push('Summary:')
      lines.push(result.summary)
    }
    if (result?.confidence_changes && Object.keys(result.confidence_changes).length > 0) {
      lines.push('')
      lines.push('Confidence changes:')
      for (const [dim, note] of Object.entries(result.confidence_changes)) {
        lines.push(`- ${formatDimensionLabel(dim)}: ${note}`)
      }
    }
    if (result?.refinement_notes && result.refinement_notes.length > 0) {
      lines.push('')
      lines.push('Refinement notes:')
      for (const n of result.refinement_notes) {
        const q = round.questions.find(q => q.id === n.question_id)
        const ct = changeTypeStyle(n.change_type).label
        lines.push('')
        if (q?.category) {
          lines.push(`[${q.category}] — ${ct}`)
        } else {
          lines.push(`${ct}`)
        }
        if (q?.question_text) {
          lines.push(`Q: ${q.question_text}`)
        }
        const answer = round.answers[n.question_id]
        if (answer) {
          const trimmed = answer.length > 300 ? answer.slice(0, 300) + '…' : answer
          lines.push(`A: ${trimmed}`)
        }
        if (n.dimension_affected) {
          lines.push(`Dimension: ${formatDimensionLabel(n.dimension_affected)}`)
        }
        if (n.before) lines.push(`Before: ${n.before}`)
        if (n.after) lines.push(`After: ${n.after}`)
        if (n.reasoning) lines.push(`Reasoning: ${n.reasoning}`)
      }
    }
    lines.push('')
    lines.push('— Pasted from /mentor-baseline/refinements so we can continue discussing this round.')
    return lines.join('\n')
  }

  const handleCopyForMentor = () => {
    if (!selected) return
    const text = formatRoundForMentor(selected)
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 3500)
      })
    } catch {
      // Clipboard unavailable — fall back to a text file download
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `refinement-${selected.id}.txt`
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
          No refinements found — neither on the server nor in this browser. Complete a
          round on the Baseline Gap Questions page and submit your answers; the
          refinement will appear here.
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
        <p style={{ fontSize: 13, color: '#8a8fa0', margin: '0 0 6px 0' }}>
          {rounds.length} round{rounds.length === 1 ? '' : 's'} displayed
        </p>
        {sourceStatus === 'server' && (
          <p style={{ fontSize: 12, color: '#4caf6a', margin: 0 }}>
            {sourceDetail}
          </p>
        )}
        {sourceStatus === 'mixed' && (
          <p style={{ fontSize: 12, color: '#5b9cf5', margin: 0 }}>
            {sourceDetail}
          </p>
        )}
        {sourceStatus === 'server-failed' && (
          <p style={{ fontSize: 12, color: '#e0a050', margin: 0 }}>
            {sourceDetail}
          </p>
        )}
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{formatDateTime(r.submittedAt)}</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 3,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    background:
                      r.source === 'server'
                        ? (r.id === selectedId ? 'rgba(76,175,106,0.25)' : '#14221a')
                        : (r.id === selectedId ? 'rgba(224,160,80,0.25)' : '#2a1e14'),
                    color:
                      r.source === 'server' ? '#4caf6a' : '#e0a050',
                  }}
                >
                  {r.source === 'server' ? 'Server' : 'Local'}
                </span>
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {selected.source === 'local' && (
                <button
                  onClick={() => handleImport(selected.id)}
                  disabled={importing}
                  style={{
                    padding: '8px 14px',
                    background: importing ? '#2a2d3a' : '#4caf6a',
                    color: importing ? '#5a5f70' : '#0f1119',
                    border: 'none',
                    borderRadius: 4,
                    cursor: importing ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {importing ? 'Importing…' : 'Import to server'}
                </button>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  onClick={handleCopyForMentor}
                  style={{
                    padding: '8px 14px',
                    background: copied ? '#1a3a2a' : '#1a2a4a',
                    color: copied ? '#4caf6a' : '#5b9cf5',
                    border: `1px solid ${copied ? '#2a4a3a' : '#2a3a5a'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {copied ? '✓ Copied — paste into the mentor conversation' : 'Copy for mentor conversation'}
                </button>
                <div style={{ fontSize: 11, color: '#7a7f8f', maxWidth: 260 }}>
                  Copies a readable summary. Paste into the Private Mentor conversation tab to continue discussing this round.
                </div>
              </div>
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
              {importNotice && (
                <span
                  style={{
                    fontSize: 12,
                    color: importNotice.startsWith('Imported') ? '#4caf6a' : '#e0a050',
                  }}
                >
                  {importNotice}
                </span>
              )}
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
