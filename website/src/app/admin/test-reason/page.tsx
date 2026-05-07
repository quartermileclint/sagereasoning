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
// HARNESS FIXTURES F1–F4 + F7–F9 (per ADR-005 §8.1; identical to the standalone
// harness — kept inline so the page is self-contained, no import from scripts/).
//
// F7/F8/F9 added 2026-05-07 (M1-CP4f Step 4) to exercise the AC-13 Tier 1
// force-clarification mechanic. F7 fires ELEMENT_FUSION at Layer 1; F8 fires
// SCOPE_AMBIGUITY at Position 6; F9 fires TEMPORAL_AMBIGUITY at Position 2.
// During parallel-run (current state), Tier 1 fires are logged in the
// comparison row's translation_sandwich_output; the user-facing response
// remains bundled-depth per ADR-004 §6.3 + ADR-008 §7. See the Tier-1-aware
// response renderer + help text below.
// =============================================================================

interface Fixture {
  id: string
  label: string
  input: string
  /** True for F7/F8/F9 — signals to the renderer that this fixture is expected
   *  to fire Tier 1 force-clarification in the orchestrator's comparison-row
   *  output (sandwich path). User-facing response remains bundled-depth until
   *  M1-CP6 cutover. */
  tier1_expected?: boolean
}

const FIXTURES: Fixture[] = [
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
  {
    id: 'F7',
    label: 'F7 — ELEMENT_FUSION (Tier 1)',
    input:
      "I've got the work deadline tomorrow, my mother's been calling about her health all week, the town council meeting is Thursday and I said I'd speak, and I haven't slept properly in days. I don't know what I'm doing anymore.",
    tier1_expected: true,
  },
  {
    id: 'F8',
    label: 'F8 — SCOPE_AMBIGUITY (Tier 1)',
    input:
      "I responded to them this morning the way I usually do, and now I'm second-guessing whether I handled it well. I keep replaying what I said to them in my head.",
    tier1_expected: true,
  },
  {
    id: 'F9',
    label: 'F9 — TEMPORAL_AMBIGUITY (Tier 1)',
    input:
      "I keep thinking about that conversation. I should have said something different. And now I don't know what's going to happen — they might bring it up again at the next meeting.",
    tier1_expected: true,
  },
]

// =============================================================================
// TIER 1 FORCE-CLARIFICATION RESPONSE SHAPE
// Per ADR-008 §2 — the discriminated-union response shape returned by /api/reason
// when an AC-13 Tier 1 trigger fires. Used by the renderer to detect Tier 1
// responses and render them distinctly.
//
// Note: during parallel-run (current state through M1-CP6 cutover), the route
// returns bundled-depth responses; this shape is dormant scaffolding. Activated
// when the user-facing path switches to the translation-sandwich engine.
// =============================================================================

interface Tier1ClarificationResponse {
  clarification_required: true
  intake_tier: 1
  trigger_code: 'ELEMENT_FUSION' | 'SCOPE_AMBIGUITY' | 'TEMPORAL_AMBIGUITY'
  clarification: {
    question_text: string
    stem_id: string
    slot_fills: Record<string, string>
  }
  continuation_token: string | null
  meta: {
    engine_version: string
    fired_at_position: string
    latency_ms?: number
    cost_usd_microcents?: number
  }
  disclaimer: string | null
  [key: string]: unknown
}

function isTier1ClarificationResponse(
  data: unknown
): data is Tier1ClarificationResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>).clarification_required === true &&
    typeof (data as Record<string, unknown>).trigger_code === 'string'
  )
}

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
              border: f.tier1_expected ? '1px solid #b85c00' : '1px solid #888',
              background: f.tier1_expected ? '#fff4e6' : '#f5f5f5',
              color: f.tier1_expected ? '#7a3d00' : '#222',
              cursor: sending ? 'not-allowed' : 'pointer',
              borderRadius: 4,
            }}
            title={
              f.tier1_expected
                ? 'Tier 1 fixture — fires force-clarification in the orchestrator (logged in comparison row; user-facing response is bundled-depth until M1-CP6 cutover).'
                : undefined
            }
          >
            {f.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#666', margin: '0 0 16px 0' }}>
        F7/F8/F9 (orange) exercise the AC-13 Tier 1 force-clarification path. During parallel-run, Tier 1 fires are logged in
        <code style={{ margin: '0 4px' }}>translation_sandwich_comparisons.translation_sandwich_output</code>
        only — the user-facing response below remains bundled-depth until M1-CP6 cutover.
      </p>

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

      {response !== null && isTier1ClarificationResponse(response) && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Response — Tier 1 force-clarification</h2>
          <div
            style={{
              padding: 16,
              background: '#fff4e6',
              border: '1px solid #b85c00',
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 12, color: '#7a3d00', marginBottom: 8 }}>
              <strong>trigger_code:</strong> {response.trigger_code} &nbsp;·&nbsp;
              <strong>fired_at_position:</strong> {response.meta.fired_at_position}
              {' '}&nbsp;·&nbsp;
              <strong>continuation_token:</strong>{' '}
              {response.continuation_token
                ? <span title="Token issued (value not displayed for safety)">issued ✓</span>
                : <span style={{ color: '#7a3d00' }}>null (orchestrator-side; route fills at issuance time)</span>}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#222', whiteSpace: 'pre-wrap' }}>
              {response.clarification.question_text}
            </p>
            <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
              stem_id: <code>{response.clarification.stem_id}</code>
            </div>
          </div>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 13, color: '#0070f3' }}>
              Full response (raw JSON)
            </summary>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: 12,
                overflow: 'auto',
                maxHeight: 480,
                marginTop: 8,
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {response !== null && !isTier1ClarificationResponse(response) && (
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
