# Next-Session Prompt — Close the `cost_health_snapshots` gap (named non-blocking follow-up since P-GL)

**Stream:** founder (a standalone, independent thread — not part of the Support/Section-D work, not part of the Resend-provisioning thread; safe to run in parallel with either).
**Tier:** `schema` — Standard risk per the standing cache ("idempotent schema migration" → Standard). The live-apply-to-production step is still founder-walked (PR17), matching this project's convention for every schema change regardless of its Standard classification.
**Predecessor sessions (the gap was found, named, and repeatedly deferred, never before scoped in detail):** `operations/handoffs/founder/2026-07-20-P-GL-golive-checklist-CLOSE.md` (where it was first found, during the #9 RLS-audit sweep), `operations/handoffs/founder/2026-07-20-P-GL-finish-CLOSE.md`, `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` (names it as blocking Ops's own Channel 1 cost-feed confirmation), `operations/agent-org-2026-07/ops-calling-v1.md` §3 (names confirming this exact channel as Ops's own "natural first diagnostic task").
**Risk classification:** Standard under 0d-ii for authoring the migration; the founder-walked live application (TEST→prod) and the live authenticated probe of `/api/billing/usage-summary` both warrant the same care as any other schema/production step in this project's history, without requiring the full Critical Change Protocol (no auth-decision, encryption, or R20a-perimeter surface is touched).

## Why this session matters, and what NOT to re-derive

This item has been named as a non-blocking follow-up in **at least three separate session closes** since 2026-07-20 and never actually scoped — every close simply repeated "needs its own small scoped migration session whenever convenient." This session does that scoping, grounded in the actual code and the actual repo state, so a future session (or this one, if there's time) can execute directly rather than re-discovering the same facts a fourth time.

**The headline finding, established this session (2026-07-22), that changes the shape of the task:** this is *not* a "design a new table from scratch" job. The exact schema `cost_health_snapshots` needs **already exists, fully designed and reviewed, inside `api/migrations/stripe-billing-schema.sql`** (lines ~150–171) — it was written as part of the Stripe/Option-D billing build and apparently never applied to production, because Stripe activation itself was deliberately deferred (per CLAUDE.md: "Stripe billing — `not_configured` in production; activation deliberately deferred") and this table's `CREATE TABLE` statement happened to live inside that same file, bundled alongside three genuinely Stripe-only tables (`stripe_customers`, `stripe_subscriptions`, `payment_events`) and two paid-tier upgrade/downgrade helper functions. **Do not apply that file wholesale** — it would activate billing infrastructure the founder has not decided to activate. A separate migration, `supabase/migrations/20260417_r20a_classifier_cost_tracking.sql`, later added two more columns to the same table (`classifier_cost_cents`, `classifier_to_mentor_ratio`) plus a sibling `classifier_cost_log` table + a `get_classifier_cost_summary()` function — this file's `ALTER TABLE cost_health_snapshots ADD COLUMN` statements would only succeed if the parent table already existed, which — per the 2026-07-20 finding that `cost_health_snapshots` genuinely does not exist in production (confirmed by a `42P01` error during that session's RLS audit) — means **this file's ALTER TABLE lines against `cost_health_snapshots` most likely never landed either**, even though its sibling `classifier_cost_log` table plausibly did (the live R20a classifier cost-tracking system reads/writes it, per `website/src/lib/r20a-cost-tracker.ts`'s own comments). **Do not assume this — verify it directly against production first (Step 1 below).**

**The exact, grounded target schema** (derived directly from the two authoritative live call sites this session read in full — `website/src/lib/context/ops-cost-state.ts`'s `CostHealthSnapshotRow` interface and `website/src/app/api/billing/usage-summary/route.ts`'s upsert payload, both of which agree exactly):

```
cost_health_snapshots
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  period_start                DATE NOT NULL
  period_end                  DATE NOT NULL
  total_revenue_cents         INTEGER NOT NULL DEFAULT 0
  total_llm_cost_cents        INTEGER NOT NULL DEFAULT 0
  total_api_calls             INTEGER NOT NULL DEFAULT 0
  revenue_to_cost_ratio       NUMERIC(8,2)
  sage_ops_cost_cents         INTEGER NOT NULL DEFAULT 0
  alert_triggered             BOOLEAN DEFAULT false
  alert_reason                TEXT
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
  classifier_cost_cents       INTEGER NOT NULL DEFAULT 0        -- from the 20260417 migration
  classifier_to_mentor_ratio  NUMERIC(6,4)                       -- from the 20260417 migration
  CONSTRAINT unique_period UNIQUE (period_start, period_end)     -- matches the upsert's onConflict key
INDEX idx_cost_health_period ON (period_start DESC)
```

**RLS posture — get this right, do not copy the wrong sibling pattern:** the 2026-07-20 RLS-lockdown session (`website/supabase-rls-audit-and-lockdown.sql`) already intended to enable RLS + `REVOKE ALL FROM anon, authenticated` on this exact table, alongside two siblings (`translation_sandwich_comparisons`, `translation_sandwich_cost_tracker`) — but it **skipped this one specifically because the table did not exist** (the `42P01` error). Apply that same treatment once the table exists: `ENABLE ROW LEVEL SECURITY` + `REVOKE ALL ... FROM anon, authenticated` (service-role bypasses RLS regardless; every real read/write already goes through `supabaseAdmin`). **Do NOT add a forbid-mutation/append-only trigger** — unlike `route_errors` or `throttle_events` (both genuinely append-only audit logs from the same RLS-lockdown-era work), `cost_health_snapshots` is explicitly designed to be **upserted** (`onConflict: 'period_start,period_end'`) — a forbid-mutation trigger here would break the exact write path the code depends on. This distinction matters enough to state plainly so it is not reflexively copied wrong.

**Explicit non-goals (out of scope; do not expand into these without a fresh founder election):**
- Do **not** create `stripe_customers`, `stripe_subscriptions`, `payment_events`, or the paid-tier upgrade/downgrade helper functions — Stripe activation stays deliberately deferred.
- Do **not** add `cash_balance`/`monthly_burn` columns for runway reporting — named separately as `D-Ops-6`, "deferred pending a schema decision" (`ops-cost-state.ts`'s own comment), a distinct gap from "the table doesn't exist."
- Do **not** wire a cron for `/api/billing/usage-summary` — it has none today (confirmed against `website/vercel.json`) and is purely on-demand, admin-JWT-gated; seeding the first row via a live authenticated call (Step 4 below) is sufficient, and adding a cron is its own separate, later decision if the founder wants one.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. This prompt in full (it already carries the grounding a normal Part-A read sequence would otherwise need to re-derive — the schema, the file entanglement, the RLS convention).
3. `operations/agent-org-2026-07/go-live-readiness-checklist.md` §"Go/no-go posture" — the exact "Named non-blocking follow-up" paragraph this session's outcome should update.
4. `/CLAUDE.md`'s "Live in production" / "Built but inert" lists — re-confirm Stripe is still `not_configured` before touching anything Stripe-adjacent (if this has changed since 2026-07-22, the "do not apply the whole Stripe file" reasoning above needs re-checking, not blindly trusted).

Confirm at open: tier (`schema`, Standard); hold-point status (P0 0h, unchanged); model selection N/A; status vocabulary; signals + risk classification.

## Part B — Procedure

### Step 1 — Read-only introspection against production FIRST (founder-run, Supabase SQL editor, zero risk)
Before authoring anything, confirm current reality rather than assuming it from the file history above:
```sql
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('cost_health_snapshots', 'classifier_cost_log');

SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'cost_health_snapshots';

SELECT proname FROM pg_proc WHERE proname = 'get_classifier_cost_summary';
```
Expected (per this session's grounding): `cost_health_snapshots` returns zero rows from all three queries (does not exist); `classifier_cost_log` and `get_classifier_cost_summary` plausibly already exist (confirm — if they don't, that changes Step 2's file scope slightly, and the session should adjust rather than proceed on the wrong assumption).

### Step 2 — Author one new, small, standalone, idempotent migration file
Scoped to `cost_health_snapshots` only — do not touch or re-run `api/migrations/stripe-billing-schema.sql` or `supabase/migrations/20260417_r20a_classifier_cost_tracking.sql` directly. A new file (following this repo's flat-file convention, e.g. `website/supabase-cost-health-snapshots-migration.sql`) containing:
1. The `CREATE TABLE IF NOT EXISTS public.cost_health_snapshots (...)` statement exactly as scoped above (all 13 columns, the unique constraint, the index) — this is the already-reviewed shape from `stripe-billing-schema.sql`, extracted, not redesigned.
2. `ALTER TABLE ... ADD COLUMN IF NOT EXISTS classifier_cost_cents / classifier_to_mentor_ratio` — **only if Step 1 shows these aren't already reachable some other way** (they can't be, since the parent table doesn't exist yet — but state this in the file's own header comment for a future reader, matching this repo's documentation convention).
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` + `REVOKE ALL ON ... FROM anon, authenticated;` — matching the 2026-07-20 RLS-lockdown convention for this exact table.
4. A §VERIFY block (re-running Step 1's introspection queries) and a §ROLLBACK block (`DROP TABLE public.cost_health_snapshots;` — safe, since nothing else references it yet if this is a true first-creation).

### Step 3 — Apply TEST → verify → apply PROD → verify (founder-walked, PR17)
Standard discipline this project applies to every schema session. No auth/flag/deploy-config change accompanies this — it is a pure schema addition.

### Step 4 — Seed and verify the first real row (founder-walked, admin JWT)
`/api/billing/usage-summary` is Bearer-JWT-gated to `clintonaitkenhead@hotmail.com` / `zeus@sagereasoning.com` only (`ADMIN_EMAILS` in the route). Have the founder make one authenticated `GET` call (from a logged-in browser session's dev console, or a captured bearer token — matching the pattern used for prior admin-route smokes in this project) and confirm: (a) a `200` response with real, non-stub `metrics`; (b) a new row now exists in `cost_health_snapshots` for the current period.

### Step 5 — Confirm the loop this closes
Check the founder-hub Ops persona's Channel-1 cost context (`case 'ops':` in `website/src/app/api/founder/hub/route.ts`, backed by `ops-cost-state.ts`) now returns the real `formatBlock` context instead of `formatStubBlock`'s "Cost-health signal unavailable" message. This is the exact confirmation Ops's own calling document (`ops-calling-v1.md` §3) named as its first natural diagnostic task — this session closes it on Ops's behalf, worth noting in the close so a future Ops session doesn't re-investigate it as if still open.

### Step 6 — Update records
- `operations/agent-org-2026-07/go-live-readiness-checklist.md` — remove or resolve the "Named non-blocking follow-up" paragraph in the posture summary; update item #9's evidence note if it still references the missing-table finding.
- Decision-log entry (lean form) + a short session close, citing this prompt and the three predecessor closes that originally named the gap.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Opens reads | 10 min |
| Step 1 introspection | 5–10 min |
| Step 2 author migration | 20–30 min |
| Step 3 apply TEST→prod | 15–20 min |
| Step 4 seed + verify | 10–15 min |
| Step 5 confirm Ops loop closed | 10 min |
| Step 6 records | 20–30 min |
| **Total** | **~1.5–2 hours** |

## Rollback path
`DROP TABLE public.cost_health_snapshots;` (safe — nothing else in production references it, since it did not exist before this session). All three read/write call sites are already confirmed fail-honest on a missing table (never crash), so a rollback restores exactly the pre-session state, not a broken one.

## Parallel-session note
This session touches an entirely different file set from the Support/Section-D thread and the Resend-provisioning thread — a new, standalone SQL migration file, plus (in Step 6) different lines of the same `go-live-readiness-checklist.md` and `decision-log.md` those other threads also touch. If more than one of these sessions is open and uncommitted at the same time, commit one before starting heavy edits in another to avoid a same-file collision — a light version of the same discipline this project already applies to genuinely concurrent multi-agent work (git worktrees for the org-agent sessions).

## Forecast
Success is: `cost_health_snapshots` exists in production with the correct, already-reviewed schema and the correct RLS posture (service-role-only, no forbid-mutation trigger); a real snapshot row exists from a genuine authenticated call; the founder-hub cost dashboard and Ops's own Channel-1 persona context both read real data instead of a stub message for the first time since launch; and a follow-up that has been silently re-deferred across three prior session closes is finally, actually closed.

End of prompt.
