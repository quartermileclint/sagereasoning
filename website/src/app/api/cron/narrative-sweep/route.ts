/**
 * GET /api/cron/narrative-sweep — M1 CI-17: the narrative-existence guarantee
 * backstop + R17c retention-expiry purge.
 *
 * waitUntil (the deferral completion vehicle on /api/reason) is best-effort:
 * promises are cancelled if the function times out and lost on a crash. This
 * sweep makes the CI-17 guarantee real — "the narrative must exist for every
 * examination" (Q2, adopted 2026-06-12) — by finding substrate_audit_narratives
 * rows still 'pending' past the staleness threshold (or 'failed' under the
 * attempt cap), regenerating their narratives from the retained (encrypted)
 * assessments, and completing them. It then hard-deletes rows past retain_until
 * (election 4a: 90 days — genuine deletion, R17c).
 *
 * KG1 rule 1 (no self-calls): the sweep calls narrative-retention functions by
 * DIRECT IMPORT — no HTTP back into the deployment (the observability cron
 * self-calls because its evaluators are token-gated routes; nothing here is).
 *
 * Generation is LLM work (~12–20s/narrative, Sonnet per AC1), so completions
 * are capped per invocation; the response names what remains — no silent caps.
 * In steady state waitUntil completes nearly everything and the sweep finds an
 * empty set.
 *
 * Auth: same CRON_SECRET gate as /api/cron/observability (Vercel sends
 * `Authorization: Bearer ${CRON_SECRET}`; manual invocation uses the same
 * header). NO vercel.json cron entry ships with this build — scheduling is a
 * deployment-configuration change and rides the founder's 0c-ii activation
 * step (suggested: hourly; Pro allows it). Until then the route exists, is
 * secret-gated, and is invoked manually in TEST.
 *
 * NEVER on the /api/reason critical path. PR6 NOT engaged — no distress
 * surface is touched; the prose regenerated here went through its examination
 * at request time (the R20a perimeter + A7 gate ran then; deferral was
 * structurally unavailable for distress-signal runs, so no distress-flagged
 * assessment can reach this sweep).
 *
 * Rules served: CI-17/B4, R17c (expiry purge — genuine deletion), R18e (the
 * completion stamps the Article-50 notice), KG1, PR1, PR3 (all awaited).
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  isL3DeferEnabled,
  sweepNarratives,
  purgeExpiredNarratives,
} from '@/lib/substrate/narrative-retention'

// Always run fresh; never cache a cron invocation.
export const dynamic = 'force-dynamic'
// Two ~12–20s Sonnet generations + DB work fit comfortably; matches the
// observability cron's posture.
export const maxDuration = 60

/** Completions per invocation. Named cap — the response reports
 *  pending_remaining so a backlog is visible, never silent. */
const MAX_GENERATIONS_PER_SWEEP = 2

export async function GET(request: NextRequest) {
  // ── Cron auth (identical gate to /api/cron/observability) ────────────────
  const cronSecret = process.env.CRON_SECRET || ''
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Cron is not configured (CRON_SECRET unset).' },
      { status: 503 }
    )
  }
  const authHeader = request.headers.get('authorization') || ''
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Flag posture ──────────────────────────────────────────────────────────
  // With SUBSTRATE_L3_DEFER_ENABLED unset, no retention rows are ever written,
  // so there is nothing to sweep — report honestly and do no DB work beyond
  // the expiry purge (which is also a no-op on an absent/empty table, but we
  // skip it entirely to keep the unset state strictly inert).
  if (!isL3DeferEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        ran_at: new Date().toISOString(),
        flag_enabled: false,
        note: 'SUBSTRATE_L3_DEFER_ENABLED unset — retention inactive; nothing to sweep.',
      },
      { status: 200 }
    )
  }

  // ── Sweep (awaited; KG1 — no fire-and-forget) ─────────────────────────────
  const sweep = await sweepNarratives({ maxGenerations: MAX_GENERATIONS_PER_SWEEP })
  const purge = await purgeExpiredNarratives()

  return NextResponse.json(
    {
      ok: true,
      ran_at: new Date().toISOString(),
      flag_enabled: true,
      completed: sweep.completed,
      failed: sweep.failed,
      pending_remaining: sweep.pending_remaining,
      expired_deleted: purge.deleted,
      errors: [...sweep.errors, ...(purge.error ? [`purge: ${purge.error}`] : [])],
    },
    { status: 200 }
  )
}
