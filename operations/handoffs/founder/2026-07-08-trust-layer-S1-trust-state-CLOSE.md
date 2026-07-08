# Session Close — 2026-07-08 — Trust Layer S1: the trust core (MEASURE mode) — built dark, review-folded

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-critical` — Critical risk under 0d-ii (new schema + data-deletion functionality). Full Critical Change Protocol templates.
**Date:** 2026-07-08.
**Decision-log entry:** `D-TRUST-LAYER-S1-TRUST-CORE-BUILT-DARK-REVIEW-FOLDED`.

## What shipped (all repo-only / dark this session)

Trust Layer S1 — the server-side trust core in **MEASURE mode** — is **built dark, TEST-gate-green, and adversarially reviewed**. It records typed trust events + a materialised per-`(agent_id, virtue_domain)` trust state; **it gates nothing** (intervention is S4, enforcement is S11). Everything is DARK behind the NEW `SUBSTRATE_TRUST_CORE_ENABLED` (unset ⇒ no emission; the accreditation + reflect responses are byte-identical, test-asserted). **NO production / perimeter / auth-decision / flag / credential change; the AI performed no Supabase/Vercel/git op. Production is byte-equivalent until the founder's push + the founder-walked migration.**

- **Schema** (`website/supabase-agent-trust-core-migration.sql`): `agent_trust_events` (append-only, immutable via a `BEFORE UPDATE`→`RAISE` trigger; typed event vocabulary CHECK; `artifact_ref NOT NULL` = the R18f-parallel proof; partial-unique idempotency index) + `agent_trust_state` (the materialised fold; earned level, profile prior [decay floor], volatility, last activity, reflect timestamp, justice latch, coverage). RLS service-role-only; 90-day `retain_until`; reversible.
- **Engine** (`website/src/lib/substrate/trust-core/`): pure, deterministic — spec-3 event→state transition (hysteresis-bounded ±1 ordinal steps; the justice-unevaluated cap-at-deliberate latch cleared by a demonstrated evaluation; violated→reflexive below the prior; reflect modulate-only), A3 decay (12/6/3-month onsets; floor at the prior; reflect doubles the onset = the half-rate cap; realize-decay-before-event to prevent lazy-read double-count), spec-4/6 minimum-domain aggregate with coverage-gap honesty.
- **Emission** (E1 — flag-gated + fail-honest): credential-completed + the four justice-surface events from the R18f-verified accreditation write (the derivers RE-VERIFY each signed assessment; no event without a verified artifact), and reflect-completed-honest from an honest Sage Reflect completion (`context_source=agent_stated` + `fabrication_risk != high`). A8/A9 orchestrator/delegation events are DEFINED (vocabulary + engine) but NOT emitted (they need the S5–S7 collaboration record).
- **Data rights + retention** (R17c/R17i): `/api/user/delete` + `/api/user/export` (by owner), `/api/credential/erase` (by credential, before anonymise), and a new `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED`-gated cron `/api/cron/trust-core-retention-sweep` (+ its `vercel.json` entry, inert until the sweep flag). All missing-table-benign + fail-honest.

## Founder elections at open
- **E1** — *also wire the justice-surface events now* (credential + reflect + the four justice events; A8/A9 defined-not-emitted).
- **E2** — *TEST → prod-inert same session* (the founder-walked migration).
- **E3** — *lazy-on-read decay* (no decay cron; `now()` is honest for a live trust read).

## Status Changes
| Item | Old | New |
|---|---|---|
| Trust Layer arc — Phase 1 | not started | S1 built dark (S2/S3/S4 next) |
| `agent_trust_events` / `agent_trust_state` | — | Scaffolded (migration authored; dark) |
| trust-core engine + store + derivers | — | Wired (dark, battery-verified) |
| trust-event emission (accreditation + reflect) | — | Wired dark (flag-gated, fail-honest) |
| R17c/R17i coverage of trust tables | — | Wired (always-on data-rights extension) |
| `SUBSTRATE_TRUST_CORE_ENABLED` / `_SWEEP_ENABLED` | — | NEW flags, UNSET everywhere |

## Verification Method Used (AI-run, all green)
- `npx tsc --noEmit` → 0; `npm run build` → 0 (the new cron route registered).
- `npx tsx src/lib/substrate/trust-core/__tests__/trust-core.test.ts` → **75 passed, 0 failed** (A3 decay bands/floor/half-rate/realize-before-event; spec-3 transitions incl. the justice latch, violated-below-prior, reflect-modulate-only; spec-4/6 minimum-domain + worse-reasoning-scores-worse; the R18f-parallel derivers incl. unverified⇒no-events + the honest-reflect gate; store emit-idempotency/fold/reflect-across-domains/data-rights/purge against an in-memory fake client).
- Flag-off byte-identity regressions: `reflect-service` **28/0**, accreditation `route` **90/90**, `consumer-erasure` **25/0**, credential-erase `handler` **38/0** (needs `--env-file=.env.local`).

## Adversarial Review (Risk Record)
A 6-dimension Workflow was authored + launched; **all 6 finder agents errored on the account session limit** (resets 5:20pm Australia/Brisbane — the same exhaustion the S0a-battery + S0b sessions hit). Per the §4 precedent the review was **completed first-hand across all six dimensions: 0 confirmed critical/high/medium defects; 1 fail-honest hardening fold applied** (a belt-and-braces `.catch(() => {})` at both emission call sites, which sit inside the route's writer/handler try — so the fail-honest invariant survives a future refactor). Disclosed design decisions (not defects): the credential-path emission's R18f-gate coupling; the data-rights routes' intentional always-on extension; MONTH_MS 30-day + the 180-day reflect-active window as documented tunables; the non-transactional state read-modify-write (worst case: state-behind, rebuildable). **Honest limit:** a single-perspective first-hand review — an independent Workflow re-review can run after the account limit resets if belt-and-braces is wanted; the build is gate-green.

## PR5 Knowledge-Gap Carry-Forward
KG1 (awaited, fail-honest, no fire-and-forget/self-calls); KG7 (JSONB payload passed directly); KG-EX1 (instrument-fidelity battery, never beats-bare). No new KG.

## Next Session Should
**S2 — evidence weighting + verdict confidence** (`code-elevated`, pure lib): mentor A5's seven confidence tiers (`Depth > Signature > Corroboration > Recency`, multiplicative, weakest sets the ceiling) + A2's domain-distance rule (deployer function-type taxonomy, Σ|Δweights|, per-dimension transfer, the zero-confidence floor enforced so it can't reach a proceed) + the three evidence tiers + the justice-surface modifier. Prompt: `operations/handoffs/founder/2026-07-08-trust-layer-S2-evidence-weighting-NEXT-SESSION-PROMPT.md`. S2 + S3 (combiner, Critical at wiring) are parallelizable after S1.

## Blocked On
**Founder-walked steps (carried; the AI performs none of these):**
1. **Apply the migration** `website/supabase-agent-trust-core-migration.sql` to **TEST**, then run the VERIFY block (paste back: both tables, columns, indexes, the FK, the trigger, RLS). A TEST admin `profiles` row must exist (memory `test-admin-needs-profiles-row`).
2. Per **E2**, apply the same migration to **PRODUCTION INERT** (flag unset ⇒ no writes; the M6 precedent) — its own founder-walked 0c-ii.
3. **Flag-on TEST end-to-end walk** (optional but recommended before any prod flag): set `SUBSTRATE_TRUST_CORE_ENABLED=true` + `SUBSTRATE_PROVENANCE_GATE_ENABLED=true` on TEST → a consult+accreditation write emits credential/justice events → `readTrustProfile` shows the materialised + decayed state → `/api/user/delete` / `/api/credential/erase` removes them → `/api/user/export` includes them. (The credential-path emission requires the R18f gate on — its R18f-parallel coupling; a raised `daily_limit` avoids the 1/day 401, memory `api-key-1-per-day-limit-masks-as-401`.)
4. The emission-flag **activation in production** is a LATER founder-walked 0c-ii (not this session; not pre-approved).

**Files remaining uncommitted (this session's commit set):** the migration; the `trust-core/` module + its `__tests__/`; the `trust-core-retention-sweep` cron; `vercel.json`; the accreditation route; `reflect-service.ts`; `practice/reflect/route.ts`; `user/delete/route.ts`; `user/export/route.ts`; `consumer-erasure.ts`; `credential/erase/handler.ts` + its test; the decision log; this close; `CLAUDE.md`; the S1 prompt (SPENT) + the S2 prompt (NEW).

**Production state at session close:** byte-equivalent. On push, Vercel deploys the dark trust core (flag unset ⇒ no emission), the always-on R17 data-rights extension (the trust tables join `/api/user/delete`/`/api/user/export`/`/api/credential/erase` coverage — missing-table-benign until the migration lands), and the inert `trust-core-retention-sweep` cron (dormant until its flag). `SUBSTRATE_CORROBORATION_CHECK_ENABLED` + `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` remain `true` (untouched). R18f / R20a / distress / Layer-2 signing / UPC auth untouched.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/substrate/trust-core/__tests__/trust-core.test.ts
npx tsx --env-file=.env.local src/lib/sage-reflect/__tests__/reflect-service.test.ts
npx tsx --env-file=.env.local "src/app/api/accreditation/[agent_id]/__tests__/route.test.ts"
npx tsx --env-file=.env.local src/lib/__tests__/consumer-erasure.test.ts
npx tsc --noEmit && npm run build
```
Expected: `75 passed` / `28 pass` / `Total: 90 Pass: 90` / `25 passed`; tsc 0; build 0. (The accreditation + consumer-erasure tests import `security.ts` and print results then keepalive-hang — read the summary, don't wait for exit; memory `tsx-tests-setinterval-keepalive-hang`.) Then commit the file list above and push via GitHub Desktop, and apply the migration to TEST (VERIFY block) as the walked step.

## Rollback
Flag unset ⇒ byte-identical (test-asserted). `DROP TABLE agent_trust_events, agent_trust_state` + `DROP FUNCTION agent_trust_events_forbid_update()` (the migration's rollback block; TEST/prod-inert only). `git revert` the build commit. No existing table altered.

## Orchestration Reminder
Phase 1 of the Trust Layer arc has begun. S1 is built dark; S2 (weighting/confidence) + S3 (combiner) are the successors, parallelizable after S1; S5–S7 (discernment) parallelizable with S4. Binding enforcement is S11 (a separate founder-walked activation — nothing here pre-approves it). Weights BLOCKED throughout; the 0h call remains the founder's.

## Cross-references
- `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-CLOSE.md` (predecessor close)
- `operations/handoffs/founder/2026-07-08-trust-layer-S1-trust-state-NEXT-SESSION-PROMPT.md` (the executed prompt, SPENT)
- `operations/handoffs/founder/2026-07-08-trust-layer-S2-evidence-weighting-NEXT-SESSION-PROMPT.md` (S2 next)
- `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 — the spec)
- `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` (A3/A8/A9 binding)
- `D-TRUST-LAYER-S1-TRUST-CORE-BUILT-DARK-REVIEW-FOLDED`

*End of session close. The trust core's persistence, vocabulary, decay engine, emission, and data-rights are built dark and gate-green; the founder-walked migration + the flag-on walk carry the slice to TEST-verified, and S2/S3 build the weighting + combiner on top.*
