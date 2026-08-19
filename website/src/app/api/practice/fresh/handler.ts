/**
 * /api/practice/fresh — the IDEA loop's novelty-check endpoint (agent-circles,
 * built 2026-08-09 to the RULED scope `operations/agent-circles-2026-08/
 * 2026-08-09-fresh-novelty-endpoint-scope.md`; verbatim ruling record wins:
 * `2026-08-09-mentor-consultation-fresh-endpoint-scope-rulings-verbatim.md`).
 * Implementation lives here; the thin route wrapper is ./route.ts per Next
 * route-export validation (memory `nextjs-route-export-validation`).
 *
 * FLAG-GATED behind SUBSTRATE_FRESH_ENABLED (unset ⇒ honest 503, zero work,
 * zero DB touch — the discernment/S10 dark-route pattern). CORRECTED
 * 2026-08-19: this header read "DARK … UNSET everywhere", which has been false
 * since 2026-08-10 — the flag was activated and live-verified in production at
 * D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10 (the founder-walked
 * `code-critical` activation step this header anticipated; it has happened).
 * THIS ROUTE IS LIVE. Edits here reach production and are owed PR19 care.
 *
 * WHAT IT DOES: POST a batch of guardrail-surviving GeneratedCandidate
 * structural axes — [{ gapRef, targetCircle?, initialClassification }] — and
 * receive, per candidate, { gapRef, passedNoveltyCheck, noveltyConfidence }
 * (wire names mirroring the approved GeneratedCandidate fields), classified by
 * the C2(iii) `assessStructuralNovelty` pure function against the presenting
 * credential's OWN windowed assessment history.
 *
 * ─── History window (ruled §2.3 / Q-B) ──────────────────────────────────────
 * Read SERVER-SIDE ONLY, scoped by the presenting credential's credential_ref
 * (R17a — never a cross-credential read), reusing the existing 90-day/30-row
 * `getTrajectoryWindow` (no new windowing code; v1 default confirmed by the
 * Q-B ruling; "revisit window bound after first bounded validation run" is the
 * named follow-up). THE CALLER NEVER SUBMITS HISTORY — caller-supplied history
 * would reopen the ruled-out runner-side-computation shape and a
 * curated-window gaming surface (submit an empty window ⇒ everything novel).
 * A window-read failure is an honest 503, NEVER treated as an empty window —
 * an outage must not manufacture the insufficient_history pass.
 *
 * ─── The starved-window honest outcome (ruled Q-C) ──────────────────────────
 * When the window carries fewer than EVIDENCE_FLOOR rows IN TOTAL, the result
 * is { passedNoveltyCheck: true, basis: 'insufficient_history',
 * noveltyConfidence: 0 } — the house evidence-floor discipline (starvation
 * never reads as a confident result). The basis check reads TOTAL window size,
 * not the matching-row count: a populated window with no matching rows is the
 * genuinely-novel case, not the starved-window case (the ruling's own wiring
 * detail — implemented inside assessStructuralNovelty, dated 2026-08-09).
 * A friction candidate (neither structural axis) is surfaced unchanged:
 * { passedNoveltyCheck: true, noveltyConfidence: 0 }, no basis field.
 *
 * ─── Response documentation — the required §2.9 disclosure ───────────────────
 * STRUCTURAL-NOVELTY-ONLY LIMITATION (a required disclosure, ruled): two
 * structurally identical but substantively different actions — same circle,
 * same virtue-domain combination, genuinely different content — are
 * INDISTINGUISHABLE to this check. Content novelty (embeddings /
 * LLM-as-judge) is a named future upgrade, not provided here. The response
 * carries this as a static `limitation` string so the reader of a stored
 * result sees it too (the house honesty pattern). The per-call `window`
 * disclosure block { rows_in_window, window_days, max_rows, basis:
 * 'credential_ref' } is REQUIRED, not optional (ruled §2.4): the reader must
 * be able to see what evidence base the verdict stood on.
 *
 * ─── Auth (ruled §2.2 / Q-A) ────────────────────────────────────────────────
 * UPC `consult` capability via the validatePracticeCredential chokepoint,
 * Bearer-ONLY transport (the discernment-sibling posture). No new capability
 * value, no mint-surface change, no api_keys CHECK widening.
 *
 * ─── Cost / rate posture (ruled §2.6 — decisions, not omissions) ────────────
 * NO LLM call (pure computation over one indexed read; zero Anthropic spend by
 * construction). NO loop_billing_events write and NO cost headers — a
 * DECISION, stated per the ruling, not an omission. Rate-limit bucket is
 * publicAgent (30/min/IP) in ./route.ts, matching the discernment sibling —
 * deliberately NEVER `scoring`, which is IP-shared with /api/reason and would
 * couple this surface to the measured instrument (memory
 * `rate-limit-bucket-couples-to-measured-surface`).
 *
 * ─── What this route deliberately does NOT do (ruled §2.8) ──────────────────
 * - NO verdict modification: it never touches, floors, or annotates a
 *   guardrail or /api/reason result — a separate post-filtering classification
 *   the runner consumes.
 * - NO trust-event write of its own — SETTLED ground per the ruling, carried
 *   verbatim: "the endpoint writes no trust event; any future novelty event
 *   class is a new question for the mentor."
 * - NO generation content (heuristics, prompts, thresholds stay out of scope).
 * - NO persistence — stateless per call; the runner stores results on its own
 *   GeneratedCandidate records (the external-state ruling). Nothing reaches
 *   S10 or the public trust record.
 * - MEASURE-only; weights blocked — a novelty verdict binds nothing and is not
 *   a training signal.
 *
 * ─── R20a / AC5 (recorded decision) ─────────────────────────────────────────
 * Agent-facing endpoint processing AGENT-produced candidate text — OUTSIDE the
 * human-distress perimeter per the standing recorded precedent (the
 * discernment/trust-record posture; r20a-invocation-guard.test.ts header).
 * Re-checkable per AC5 if the perimeter question is ever re-opened.
 *
 * ─── The Q1 hard constraint (carried) ───────────────────────────────────────
 * The loop proposes; it never executes. `fresh` classifies candidates'
 * structural novelty; it neither executes nor recommends execution of
 * anything.
 */

import { NextRequest, NextResponse } from 'next/server'

import { corsHeaders } from '@/lib/security'
import {
  validatePracticeCredential,
  type PracticeCapability,
  type PracticeCredentialResult,
} from '@/lib/practice-credential'
import {
  getTrajectoryWindow,
  type StoreResult,
  type TrajectoryWindow,
} from '@/lib/substrate/agent-assessment-history-store'
import {
  assessStructuralNovelty,
  noteCuriosityTrigger,
  type GeneratedCandidate,
  type NoveltyHistoryRow,
  type OikeiosisCircleRank,
} from '@/lib/substrate/idea-loop-types'
import type { VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'

// ════════════════════════════════════════════════════════════════════════════
// Flag (dark-route pattern)
// ════════════════════════════════════════════════════════════════════════════

/** True only when the flag is the exact string 'true'. Read at call time. */
export function isFreshEnabled(): boolean {
  return process.env.SUBSTRATE_FRESH_ENABLED === 'true'
}

// ════════════════════════════════════════════════════════════════════════════
// Input caps (build-time details under the house input-cap pattern, ruled
// §2.3: "input caps as build-time details"). Rationale documented per the
// build prompt's "pick sensible bounds and document them":
//   MAX_CANDIDATES 32 — the check is pure compute (no per-candidate LLM call),
//     so the discernment sibling's 8 (each an extraction call) is not the
//     right analogue; 32 matches the house bound for non-LLM per-element work
//     (MAX_SIGNED_ASSESSMENTS in the discernment hand-back). A generation pass
//     produces one candidate per heuristic-application — far below this.
//   MAX_GAPREF_CHARS 200 — the settled gapRef format is
//     `{sessionId}:{cycleNumber}:{c}->{t}` (short by construction); 200 is a
//     generous echo-field bound that still forecloses payload abuse.
// ════════════════════════════════════════════════════════════════════════════

export const MAX_CANDIDATES = 32
export const MAX_GAPREF_CHARS = 200

// ════════════════════════════════════════════════════════════════════════════
// Injectable deps (tests exercise every branch with fakes — the sibling
// discernment/erase pattern)
// ════════════════════════════════════════════════════════════════════════════

export interface FreshRouteDeps {
  isEnabled(): boolean
  validateCredential(
    rawToken: string,
    capability: PracticeCapability,
  ): Promise<PracticeCredentialResult>
  getWindow(opts: { credentialRef: string }): Promise<StoreResult<TrajectoryWindow>>
}

const DEFAULT_DEPS: FreshRouteDeps = {
  isEnabled: isFreshEnabled,
  validateCredential: (raw, cap) => validatePracticeCredential(raw, cap),
  getWindow: (opts) => getTrajectoryWindow(opts),
}

// ════════════════════════════════════════════════════════════════════════════
// Response helpers (honest, non-leaking — the sibling posture)
// ════════════════════════════════════════════════════════════════════════════

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() })
}

function flagDisabled(): NextResponse {
  return json(
    {
      error: 'fresh not enabled',
      note:
        'The novelty-check surface is dark: SUBSTRATE_FRESH_ENABLED is not set. ' +
        'Nothing runs and nothing is read while dark.',
    },
    503,
  )
}

function unauthorized(): NextResponse {
  // Single non-leaking 401 for every auth failure (the sibling posture).
  return json({ error: 'unauthorized' }, 401)
}

function badRequest(errors: string[]): NextResponse {
  return json({ error: 'bad request', details: errors }, 400)
}

export function freshPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

// ════════════════════════════════════════════════════════════════════════════
// Auth (Bearer-only; UPC chokepoint — the discernment sibling's shape)
// ════════════════════════════════════════════════════════════════════════════

async function authenticate(
  request: NextRequest,
  deps: FreshRouteDeps,
): Promise<{ ok: true; credentialId: string } | { ok: false }> {
  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) return { ok: false } // Bearer-ONLY (no X-Api-Key)
  const raw = header.slice('Bearer '.length).trim()
  if (!raw) return { ok: false }
  try {
    const result = await deps.validateCredential(raw, 'consult')
    if (!result.valid) return { ok: false }
    return { ok: true, credentialId: result.row.id }
  } catch {
    return { ok: false } // fail-closed
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Body parsing (defensive — external/runner input). Wire field names mirror
// the approved GeneratedCandidate fields per the ruled request/response shape
// (§2.3/§2.4: gapRef / targetCircle / initialClassification — camelCase, NOT
// the snake_case some siblings use, because the ruling fixes these names).
// ════════════════════════════════════════════════════════════════════════════

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const VIRTUE_DOMAINS = new Set<string>(['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'])
const CIRCLE_RANKS = new Set<number>([1, 2, 3, 4, 5])

/** The exact shape assessStructuralNovelty takes, plus the echoed gapRef. */
export interface FreshCandidateInput {
  gapRef: string
  candidate: Pick<GeneratedCandidate, 'targetCircle' | 'initialClassification'>
}

export function parseFreshCandidates(v: unknown, errors: string[]): FreshCandidateInput[] | null {
  if (!Array.isArray(v) || v.length === 0) {
    errors.push('candidates must be a non-empty array')
    return null
  }
  if (v.length > MAX_CANDIDATES) {
    errors.push(`candidates must carry at most ${MAX_CANDIDATES} entries`)
    return null
  }
  const out: FreshCandidateInput[] = []
  v.forEach((c, i) => {
    if (!isRecord(c)) {
      errors.push(`candidates[${i}] must be an object`)
      return
    }
    const gapRef = typeof c.gapRef === 'string' ? c.gapRef.trim() : ''
    if (!gapRef) {
      errors.push(`candidates[${i}].gapRef must be a non-empty string`)
      return
    }
    if (gapRef.length > MAX_GAPREF_CHARS) {
      errors.push(`candidates[${i}].gapRef exceeds ${MAX_GAPREF_CHARS} chars`)
      return
    }
    let targetCircle: OikeiosisCircleRank | undefined
    if (c.targetCircle !== undefined && c.targetCircle !== null) {
      if (typeof c.targetCircle !== 'number' || !CIRCLE_RANKS.has(c.targetCircle)) {
        errors.push(`candidates[${i}].targetCircle must be an integer 1–5 when present`)
        return
      }
      targetCircle = c.targetCircle as OikeiosisCircleRank
    }
    const ic = c.initialClassification
    if (!isRecord(ic)) {
      errors.push(`candidates[${i}].initialClassification must be an object`)
      return
    }
    let initialClassification: GeneratedCandidate['initialClassification']
    if (ic.kind === 'preferred_indifferent') {
      initialClassification = { kind: 'preferred_indifferent' }
    } else if (ic.kind === 'virtue_domain') {
      const domains = ic.domains
      if (!Array.isArray(domains) || domains.length === 0) {
        errors.push(`candidates[${i}].initialClassification.domains must be a non-empty array`)
        return
      }
      const seen = new Set<string>()
      let bad = false
      for (const d of domains) {
        if (typeof d !== 'string' || !VIRTUE_DOMAINS.has(d)) {
          errors.push(
            `candidates[${i}].initialClassification.domains must contain only ` +
              `${[...VIRTUE_DOMAINS].join(' | ')}`,
          )
          bad = true
          break
        }
        if (seen.has(d)) {
          // Duplicates would perturb the sorted-join structural match key.
          errors.push(`candidates[${i}].initialClassification.domains must not repeat a domain`)
          bad = true
          break
        }
        seen.add(d)
      }
      if (bad) return
      initialClassification = { kind: 'virtue_domain', domains: [...domains] as VirtueDomain[] }
    } else {
      errors.push(
        `candidates[${i}].initialClassification.kind must be 'virtue_domain' or 'preferred_indifferent'`,
      )
      return
    }
    out.push({ gapRef, candidate: { targetCircle, initialClassification } })
  })
  return errors.length ? null : out
}

// ════════════════════════════════════════════════════════════════════════════
// Handler
// ════════════════════════════════════════════════════════════════════════════

/** The §2.9 required disclosure, carried on the wire (house honesty pattern —
 *  a stored result still names its own limitation). */
export const STRUCTURAL_NOVELTY_LIMITATION =
  'Structural novelty only: two structurally identical but substantively different actions ' +
  '(same circle, same virtue-domain combination, genuinely different content) are ' +
  'indistinguishable to this check. Content novelty is a named future upgrade.'

export async function runFreshPost(
  request: NextRequest,
  deps: FreshRouteDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // 1. Flag posture FIRST (dark route: unset ⇒ honest 503, zero work).
  if (!deps.isEnabled()) return flagDisabled()

  // 2. Auth (Bearer-only, consult capability, UPC chokepoint). Unlike the
  //    discernment sibling, auth needs no body field, so it precedes parsing.
  const auth = await authenticate(request, deps)
  if (!auth.ok) return unauthorized()

  // 3. Parse the body.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest(['request body must be JSON'])
  }
  if (!isRecord(body)) return badRequest(['request body must be a JSON object'])
  const errors: string[] = []
  const candidates = parseFreshCandidates(body.candidates, errors)
  if (candidates === null) return badRequest(errors)

  // 4. The server-side windowed read — the presenting credential's OWN rows
  //    (R17a), 90-day/30-row v1 default (Q-B ruled). ONE indexed query.
  const credentialRef = `api_key:${auth.credentialId}`
  const window = await deps.getWindow({ credentialRef })
  if (!window.ok) {
    // An outage is an honest 503 — NEVER an empty window (which would
    // manufacture the insufficient_history pass from a read failure).
    console.error('[fresh] window read failed:', window.error)
    return json({ error: 'service error' }, 503)
  }

  // EvaluatedAction structurally satisfies NoveltyHistoryRow (both axes are
  // Picks of the same projection) — no re-mapping, per PR15.
  const historyWindow: readonly NoveltyHistoryRow[] = window.value.actions

  // 5. Classify each candidate (pure computation; no LLM, no write).
  //
  //    THE CURIOSITY-TRIGGER SEAM (stub, 2026-08-19; placement RULED 2026-08-18
  //    Q5 — "server-side, beside the taxonomy stub"). noteCuriosityTrigger is a
  //    PURE PASS-THROUGH: it returns its argument by identity and logs one line
  //    when a GENUINE structural-novelty confirmation is reached (never on the
  //    zero-confidence starved-window or friction branches — those are honest
  //    no-basis passes, and firing on them would manufacture curiosity out of
  //    absence of evidence). It cannot alter `r`, and therefore cannot alter any
  //    byte of this route's response. Carried from the same ruling: when the
  //    standing-runner design opens, whether this seam stays here, migrates
  //    runner-side, or lives in BOTH places must be revisited explicitly.
  const results = candidates.map(({ gapRef, candidate }) => {
    const r = noteCuriosityTrigger(assessStructuralNovelty(candidate, historyWindow))
    return {
      gapRef,
      passedNoveltyCheck: r.novel,
      noveltyConfidence: r.confidence,
      ...(r.basis !== undefined ? { basis: r.basis } : {}),
    }
  })

  // 6. Respond — results + the REQUIRED per-call window disclosure block
  //    (ruled §2.4: the reader must see what evidence base the verdict stood
  //    on). The endpoint stores nothing; the runner stores results.
  return json(
    {
      schema: 'practice-fresh-response-v1',
      results,
      window: {
        rows_in_window: window.value.actions.length,
        window_days: window.value.windowDays,
        max_rows: window.value.maxInstances,
        basis: 'credential_ref',
      },
      limitation: STRUCTURAL_NOVELTY_LIMITATION,
    },
    200,
  )
}
