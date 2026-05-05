'use client'

/**
 * /admin/test-reason — Founder-facing test page for the M1-CP4 parallel-run wiring.
 *
 * Purpose: drive authenticated /api/reason calls from the browser so the
 * translation-sandwich parallel path fires and writes comparison rows for
 * M1-CP5 analysis. Replaces the brittle terminal curl + Bearer-token flow.
 *
 * Built post-M1-CP4-close on 2026-05-04 because the existing UI pages that
 * call /api/reason (/private-mentor proximity, /mentor-hub, /ops-hub) all use
 * plain fetch() rather than authFetch — which means /api/reason rejects them
 * with "Authentication required". Fixing those three pages is a separate
 * Standard-tier session; this page exists in the meantime.
 *
 * Compliance:
 *   - AC5: not engaged (this page does not modify the R20a perimeter).
 *   - AC7: not engaged (no auth/cookie/session/redirect surface change; uses
 *           the existing supabase auth + authFetch helper).
 *   - AC8: not engaged (this is a UI page, not a translation-sandwich module).
 *   - PR1: complementary — gives single-endpoint /api/reason a usable testing
 *           surface during the parallel-run period.
 *
 * Status: Wired (founder-facing testing surface; not for end users).
 *
 * Cost note: every "Send" click costs ~$0.06–0.13 (one bundled-depth Sonnet
 * call + the parallel sandwich's Layer 1 + Layer 3 Sonnet calls). 50 clicks
 * ≈ $3–7. Well within the $50 cap.
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

// =============================================================================
// HARNESS FIXTURES F1–F4 (per ADR-005 §8.1; identical to the standalone harness)
// Keeping these inline so the page is self-contained — no import from scripts/.
// =============================================================================

const FIXTURES: Array<{ id: string; label: string; input: string }> = [
  {
    id: 'F1',
    label: 'F1 — Simple control-filter case',
    input:
      "I keep checking my phone to see if she's replied. I sent the message two hours ago and she still hasn't read it. I don't know what to do.",
  },
  {
    id: 'F2',
    label: 'F2 — Multi-passion case',
    input:
      "I should have spoken up at the meeting today. Everyone else got credit for the work I led, and now I look weak in front of the team. But part of me is also relieved I didn't argue — I hate confrontation.",
  },
  {
    id: 'F3',
    label: 'F3 — Multi-circle obligation conflict',
    input:
      "My mother needs me at home this weekend, but I promised the volunteer group I'd be at the community event. I can't be in two places. I keep going back and forth on which obligation matters more.",
  },
  {
    id: 'F4',
    label: 'F4 — Urgency-pressured case',
    input:
      "I have to send the contract back today or the deal falls through. I haven't had time to read it properly but everyone's pressing me. Just sign and move on, that's what they're saying.",
  },
]

const DEPTH_OPTIONS: Array<'quick' | 'standard' | 'deep'> = ['quick', 'standard', 'deep']

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function TestReasonPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [inputText, setInputText] = useState('')
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [sending, setSending] = useState(false)
  const [response, setResponse] = useState<unknown>(null)
  const [error, setError] = useState('')
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [sendCount, setSendCount] = useState(0)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [])

  const sendRequest = async () => {
    if (!inputText.trim()) {
      setError('Please enter input text or click a fixture preset.')
      return
    }
    setSending(true)
    setError('')
    setResponse(null)
    setLatencyMs(null)

    const start = Date.now()
    try {
      const res = await authFetch('/api/reason', {
        method: 'POST',
        body: JSON.stringify({ input: inputText, depth }),
      })
      const elapsed = Date.now() - start
      setLatencyMs(elapsed)

      if (!res.ok) {
        const errText = await res.text()
        setError(`HTTP ${res.status}: ${errText.slice(0, 500)}`)
      } else {
        const data = await res.json()
        setResponse(data)
        setSendCount((c) => c + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  const loadFixture = (input: string) => {
    setInputText(input)
    setError('')
  }

  if (loading) {
    return (
      <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return null // redirected to /auth
  }

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 960,
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
        color: '#222',
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>
        /api/reason test runner
      </h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Founder-facing testing surface for the M1-CP4 translation-sandwich
        parallel-run. Each successful Send produces one comparison row in
        Supabase <code>translation_sandwich_comparisons</code>. Signed in as{' '}
        <strong>{user.email}</strong>. Total successful sends this page session:{' '}
        <strong>{sendCount}</strong>.
      </p>

      <hr style={{ margin: '24px 0' }} />

      <h2 style={{ fontSize: 18 }}>Fixture presets (click to load)</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {FIXTURES.map((f) => (
          <button
            key={f.id}
            onClick={() => loadFixture(f.input)}
            disabled={sending}
            style={{
              padding: '8px 12px',
              border: '1px solid #888',
              background: '#f5f5f5',
              cursor: sending ? 'not-allowed' : 'pointer',
              borderRadius: 4,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: 18 }}>Input text</h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={6}
        style={{
          width: '100%',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
          padding: 8,
          border: '1px solid #888',
          borderRadius: 4,
          boxSizing: 'border-box',
        }}
        placeholder="Paste fixture text or click a preset above…"
      />

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <label>
          Depth:{' '}
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value as 'quick' | 'standard' | 'deep')}
            disabled={sending}
            style={{ padding: 4 }}
          >
            {DEPTH_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={sendRequest}
          disabled={sending || !inputText.trim()}
          style={{
            padding: '10px 24px',
            background: sending ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: sending || !inputText.trim() ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {sending ? 'Sending…' : 'Send to /api/reason'}
        </button>

        {latencyMs !== null && (
          <span style={{ color: '#666', fontSize: 13 }}>
            Last call: {latencyMs} ms
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#fee',
            border: '1px solid #c00',
            borderRadius: 4,
            color: '#900',
            fontSize: 13,
            whiteSpace: 'pre-wrap',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response !== null && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Response (raw JSON)</h2>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 12,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 480,
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <hr style={{ margin: '32px 0 16px' }} />

      <details>
        <summary style={{ cursor: 'pointer', color: '#0070f3' }}>
          How to verify in Supabase
        </summary>
        <div style={{ marginTop: 12, fontSize: 13, color: '#444' }}>
          <p>
            After each successful Send (you see Response above), one row should
            appear in <code>translation_sandwich_comparisons</code>. To check the
            count:
          </p>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 8,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
{`SELECT
  count(*) AS total_rows,
  count(*) FILTER (WHERE translation_sandwich_output IS NOT NULL) AS sandwich_completed,
  count(*) FILTER (WHERE translation_sandwich_error IS NOT NULL) AS sandwich_failed,
  array_agg(DISTINCT translation_sandwich_error) FILTER (WHERE translation_sandwich_error IS NOT NULL) AS error_categories
FROM translation_sandwich_comparisons;`}
          </pre>
          <p>
            On a cold function, expect <code>deadline_exceeded</code> for the
            first call. As Sonnet warms up, mixed <code>completed</code> /{' '}
            <code>deadline_exceeded</code> rows are normal.
          </p>
        </div>
      </details>
    </div>
  )
}
