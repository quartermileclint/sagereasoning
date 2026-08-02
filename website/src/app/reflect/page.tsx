'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import type { User } from '@supabase/supabase-js'

/**
 * The Evening Review — the evening pole of the daily practice.
 *
 * Seneca's nightly examination (De Ira III.36): before sleep, go back over the
 * day's actions and ask where you fell short, where you did well, and what you
 * would do differently. The mentor grounded the dashboard's daily-rhythm strip
 * in exactly this passage, and named it "a daily rhythm, not an occasional one".
 *
 * WHY THIS PAGE EXISTS (2026-08-02). The rhythm strip had a morning pole with a
 * real page (`/morning`) and an evening pole pointing at `/journal`. The journal
 * is a different practice — a finite 55-day guided curriculum you walk at your
 * own pace — so the evening pole was both mislabelled and, because the journal
 * paces itself, sometimes unanswerable. `practice-sequence.ts` recorded that
 * mismatch as an "honest asymmetry" and disclosed it in the UI rather than
 * closing it. This page closes it: the engine already existed at
 * `POST /api/reflect`, only the door was missing.
 *
 * BOUNDARY. Human-only, and deliberately import-poor: it POSTs to /api/reflect
 * and touches nothing else. It never imports `stoic-brain`, `sage-reason-engine`
 * or the substrate — the sibling practitioner pages are guarded on exactly that,
 * and the running false-hold observation window measures those graphs. Brand
 * images are literal paths for the same reason (`brand-display`'s one-hop
 * stoic-brain type import trips the guard). Pinned by
 * `src/app/reflect/__tests__/human-practitioner-boundary.test.ts`.
 *
 * "DONE TODAY". The dashboard's evening pole is satisfied by a `reflections` row
 * landing on the practitioner's LOCAL calendar day — nothing on this page
 * computes that; it simply writes the row and the pole reads it. A second review
 * the same day is allowed and unremarked: the pole is a state, not a counter,
 * and a second look at a hard day is practice, not error.
 */

interface PassionEntry {
  root_passion?: string
  sub_species?: string
  false_judgement?: string
}

interface ReflectionResult {
  katorthoma_proximity: string
  passions_detected: PassionEntry[]
  what_you_did_well: string | null
  sage_perspective: string | null
  evening_prompt: string | null
  disclaimer?: string
  /** Whether the row actually landed. See the note by the "recorded" line below. */
  saved?: boolean
}

interface PastReflection {
  id: string
  what_happened: string
  katorthoma_proximity: string | null
  evening_prompt: string | null
  created_at: string
}

/**
 * The five proximity levels as the Five Stages of Practice, with the founder-
 * adopted palette. Literal values rather than an import from `brand-display`,
 * which reaches `stoic-brain` at one hop (see the boundary note above).
 */
const STAGE_BY_PROXIMITY: Record<string, { name: string; color: string }> = {
  reflexive: { name: 'The Storm', color: '#4A5568' },
  habitual: { name: 'The Worn Path', color: '#8B6F47' },
  deliberate: { name: 'The Crossroads', color: '#B2AC88' },
  principled: { name: 'The Clear Summit', color: '#5B8C6D' },
  sage_like: { name: 'The Inner Fire', color: '#C9A84C' },
}

export default function EveningReviewPage() {
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [whatHappened, setWhatHappened] = useState('')
  const [howResponded, setHowResponded] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ReflectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** R20a: the engine returned crisis resources instead of a reading. */
  const [distress, setDistress] = useState<string | null>(null)
  const [past, setPast] = useState<PastReflection[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)
      // A network failure here (offline, DNS, an outage) must not leave the
      // page stuck on "Loading…" forever — fetchPast's history read is a nice-
      // to-have, and the form below it is the whole reason the practitioner is
      // here. Award the loading state regardless of whether the read succeeded.
      await fetchPast()
      setLoading(false)
    }
    load()
  }, [])

  const fetchPast = useCallback(async () => {
    try {
      const res = await authFetch('/api/reflections')
      if (res.ok) {
        const data = await res.json()
        setPast((data.reflections || []).slice(0, 7))
      }
    } catch {
      // Silent: `past` stays whatever it already was (empty on first load), the
      // "Recent evenings" section just doesn't render, and the form is
      // unaffected. Nothing here is load-bearing for completing tonight's review.
    }
  }, [])

  const formValid = whatHappened.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setError(null)
    setDistress(null)

    try {
      const res = await authFetch('/api/reflect', {
        method: 'POST',
        body: JSON.stringify({
          what_happened: whatHappened.trim(),
          how_i_responded: howResponded.trim() || undefined,
        }),
      })

      const body = await res.json()

      if (!res.ok) {
        // `body.message` is the human sentence llmOutageResponse() provides
        // alongside its machine `error` code (e.g. 'ai_temporarily_unavailable').
        // Preferring it matters here specifically: on the one error path where
        // the two are split, `body.error` alone would show a practitioner who
        // just wrote about a hard day the literal string 'ai_temporarily_unavailable'.
        // Every other error shape carries only `error`, so this is additive.
        setError(body.message || body.error || 'The review could not be completed just now.')
        setSubmitting(false)
        return
      }

      // R20a — the distress path returns HTTP 200 with resources and stores
      // nothing. The evening pole correctly stays "not yet"; nothing here
      // fabricates a done state, and nothing is said about the practice.
      if (body.distress_detected) {
        setDistress(body.redirect_message || null)
        setSubmitting(false)
        return
      }

      // The route wraps its payload in an envelope; older callers read it flat.
      const payload: ReflectionResult = body.result ?? body
      setResult(payload)
      await fetchPast()
    } catch {
      setError('Network error — please try again.')
    }
    setSubmitting(false)
  }

  function startAnother() {
    setResult(null)
    setError(null)
    setDistress(null)
    setWhatHappened('')
    setHowResponded('')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div role="status" className="text-center text-sage-600 font-body">Loading…</div>
      </div>
    )
  }

  const stage = result ? STAGE_BY_PROXIMITY[result.katorthoma_proximity] : null

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-sage-900 mb-1">
          Evening Review
        </h1>
        <p className="font-body text-sage-600">
          When the day is done, go back over it. Seneca did this nightly — retracing what he
          had said and done, hiding nothing from himself, and pardoning what deserved pardon.
          Name what actually happened and how you responded, while it is still near enough to
          see plainly. The morning declared the intention; this is where it is asked whether
          it held.
        </p>
        <img
          src="/images/mirror.PNG"
          alt="Mirror"
          className="w-full max-w-sm h-auto mt-5"
        />
        <p className="font-body text-xs text-sage-500 mt-1 italic max-w-sm">
          The review reads your reasoning, not your worth.
        </p>
      </div>

      {/* R20a crisis path — resources, and nothing about the practice. */}
      {distress && (
        <div className="mb-6 p-5 rounded-lg bg-amber-50 border border-amber-200">
          <p className="font-body text-sm text-amber-900 whitespace-pre-line leading-relaxed">
            {distress}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm font-body bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">
            Look back over the day
          </h2>

          <div className="mb-5">
            <label htmlFor="what-happened" className="font-display text-sm font-medium text-sage-600 block mb-1">
              What happened today?
              <span className="font-body text-xs text-sage-600 ml-2">Required</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              The day as it actually was — what you did, what you said, what arrived that you
              did not choose. Enough to examine; not a full account.
            </p>
            <textarea
              id="what-happened"
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              placeholder="The exchange that went sideways, the decision I rushed, the thing I let pass…"
              rows={5}
              maxLength={5000}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="how-responded" className="font-display text-sm font-medium text-sage-600 block mb-1">
              How did you respond?
              <span className="font-body text-xs text-sage-600 ml-2">Optional</span>
            </label>
            <p className="font-body text-xs text-sage-500 mb-2">
              Your own part in it — what you said, did, and assented to before you had examined
              it. The events were not up to you; the response was.
            </p>
            <textarea
              id="how-responded"
              value={howResponded}
              onChange={(e) => setHowResponded(e.target.value)}
              placeholder="Where I fell short, where I did well, and what I would do differently…"
              rows={4}
              maxLength={5000}
              className="w-full border border-sage-200 rounded-lg p-3 font-body text-sm text-sage-800 placeholder:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!formValid || submitting}
              className="px-6 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Reviewing…' : 'Complete the review'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-sage-200 rounded-lg p-6 mb-6">
          <h2 className="font-display text-lg font-medium text-sage-800 mb-4">Tonight&apos;s reading</h2>

          {/* The reading is a second view, not a verdict on the person. */}
          {stage && (
            <div className="mb-5">
              <div className="font-body text-xs text-sage-600 mb-1">
                How the reasoning read
              </div>
              <div
                className="inline-block px-3 py-1.5 rounded font-display text-sm font-medium"
                style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
              >
                {stage.name}
              </div>
              <p className="font-body text-xs text-sage-500 mt-1.5">
                Not a grade for the day — a reading of the reasoning in it.
              </p>
            </div>
          )}

          {result.what_you_did_well && (
            <div className="mb-5">
              <div className="font-body text-xs text-sage-600 mb-1">Where you did well</div>
              <p className="font-body text-sm text-sage-700 leading-relaxed">{result.what_you_did_well}</p>
            </div>
          )}

          {result.passions_detected?.length > 0 && (
            <div className="mb-5">
              <div className="font-body text-xs text-sage-600 mb-2">Passions in play</div>
              <div className="space-y-2">
                {result.passions_detected.map((p, i) => (
                  <div key={i} className="bg-sage-50/60 rounded p-3">
                    <div className="font-display text-sm font-medium text-sage-800">
                      {p.sub_species || p.root_passion}
                    </div>
                    {p.false_judgement && (
                      <p className="font-body text-xs text-sage-600 mt-0.5 leading-snug">
                        The judgement underneath: {p.false_judgement}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.sage_perspective && (
            <div className="mb-5">
              <div className="font-body text-xs text-sage-600 mb-1">The sage&apos;s view</div>
              <p className="font-body text-sm text-sage-700 leading-relaxed">{result.sage_perspective}</p>
            </div>
          )}

          {result.evening_prompt && (
            <div className="mb-5 border-l-2 border-sage-300 pl-4">
              <div className="font-body text-xs text-sage-600 mb-1">To sit with tonight</div>
              <p className="font-body text-sm text-sage-800 italic leading-relaxed">{result.evening_prompt}</p>
            </div>
          )}

          {result.disclaimer && (
            <p className="font-body text-xs text-sage-500 italic border-t border-sage-100 pt-3 mb-4">
              {result.disclaimer}
            </p>
          )}

          {/* Never claim a save that did not happen: the dashboard's evening pole
              is derived from the row, so "recorded" over a failed insert would
              leave the strip saying "not yet" with no explanation anywhere. */}
          {result.saved === false ? (
            <p className="font-body text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-4 py-3 mb-4">
              The reading above is yours to keep, but it could not be saved just now — so
              tonight&apos;s review will not show as recorded on your dashboard.
            </p>
          ) : (
            <p className="font-body text-xs text-sage-600 mb-4">Recorded for tonight.</p>
          )}

          <button
            onClick={startAnother}
            className="w-full border-2 border-dashed border-sage-200 rounded-lg p-3 text-center font-body text-sm text-sage-600 hover:border-sage-400 transition-colors"
          >
            + Look again
          </button>
        </div>
      )}

      {/* Recent reviews */}
      {past.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-medium text-sage-800 mb-3">Recent evenings</h2>
          <div className="space-y-2">
            {past.map((r) => {
              const s = r.katorthoma_proximity ? STAGE_BY_PROXIMITY[r.katorthoma_proximity] : null
              return (
                <div key={r.id} className="bg-white/60 border border-sage-200 rounded-lg p-4">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="font-body text-xs text-sage-600">{formatDate(r.created_at)}</span>
                    {s && (
                      <span className="font-display text-xs font-medium" style={{ color: s.color }}>
                        {s.name}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-sage-700 line-clamp-2">{r.what_happened}</p>
                </div>
              )
            })}
          </div>
          <a
            href="/reflections"
            className="inline-block mt-3 font-body text-sm text-sage-600 underline decoration-sage-300 hover:decoration-sage-600"
          >
            All past reviews
          </a>
        </div>
      )}
    </div>
  )
}
