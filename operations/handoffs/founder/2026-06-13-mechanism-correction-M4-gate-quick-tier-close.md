# Session Close — 2026-06-13 — Mechanism-Correction M4: gate session (CI-8 + CI-9 + CI-10; CI-16 deferred)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` (PR1–PR18).
**Tier:** `code-standard` (CI-8 meta honesty; CI-9 diagnostic) + `code-elevated` (CI-10 billing surface + shared-engine usage exposure). **No Critical surface touched** — no auth/R20a/A5/zone change; the gate verdict/threshold path is byte-unchanged.
**Environment:** Claude Code on the founder's machine; TEST Supabase (`iwdtrvuphogkwmovhnvz`) is the live-verification target; **production untouched this session** (on push the only behavioural change is the always-on CI-8 gate `meta.cost_usd`). Model: Fable 5, maximum reasoning effort.
**Date:** 2026-06-13.

## Decisions Made

- `D-MECHANISM-CORRECTION-M4-GATE-QUICK-TIER-BUILT-TEST-VERIFIED-2026-06-13` appended. CI-8 (always-on) + CI-10 (flag-gated) built and TEST-Verified at the assertion level; CI-9 diagnostic note produced (founder ack pending the replay). **CI-16 deferred entirely** on a founder election driven by the verified path-check finding.

## What this session did

1. Opened under the M4 prompt (full Part-A read order + the path-check). Confirmed the engine architecture against the prompt's claims via a parallel understand+verify workflow.
2. **CI-16 path-check → deferred.** Verified (high confidence; adversarial refute-default agent could not refute) that the gate (`runSageReason` LLM) does **not** inherit a deterministic value classification built in the sandwich Layer 2 (`/api/reason` only) — they are different engines sharing only the `DEPTH_MECHANISMS` name list. Surfaced as a scope fork; **founder elected "Defer CI-16 entirely."** Parked pending the gate-engine architecture decision.
3. **CI-9** (diagnostic only): named the mechanism — the `runSageReason` in-memory LRU cache (`model-config.ts`; `sage-reason-engine.ts:487-502`) returns a warm-repeat gate verdict in sub-100ms with `ai_generated:true` (hardcoded), so the 46ms verdict is a cache hit and the 20,015ms a cold call (leading candidate: the Haiku→Sonnet parse-retry). Deliverables: the one-page note, a deterministic mechanism-proof test, and a founder-walked live replay. **Diagnostic-uncertain — symptom level; founder ack required before "resolved" (PR10).**
4. **CI-8** (always-on): the gate's `meta.cost_usd` reports the measured Anthropic cost (or null on a cache hit) + a `cost_basis` note — never the retired `$0.0025`. Implemented via an additive `costUsd?` override on `buildEnvelope`; the competitor *price* is retained for the human-tool routes (price-vs-cost left as an open question). Docs reconcile: the `$0.0025` strings in docs/pricing/marketplace are the customer *price* (legitimate) — no change.
5. **CI-10** (flag-gated, inert): `runSageReason` additively exposes token `usage`; the gate wires `finalizeLoopResponse` behind `SUBSTRATE_GATE_LOOP_METERING_ENABLED` (unset = byte-identical); new `'api_guardrail'` surface + a founder-walked surface-CHECK migration.
6. **Adversarial diff-review workflow** (4 dimensions → 21 agents): 17 raw findings, **14 cleared as false positives**; of 3 survivors, 2 were confirmations-of-correctness and 1 a real coverage gap (no end-to-end test for the 6 score routes after the additive `costUsd?`) → **addressed in-session** (C8-8 asserts the full legacy envelope shape on the no-override path).

## Status Changes

| Item | Old | New |
|---|---|---|
| CI-8 (gate meta cost honesty, FX-14) | Approved | **TEST-Verified (assertion + live 2026-06-13)** — live gate call returned a measured 1¢ Anthropic cost from real usage (`cost_usd ≈ $0.007`, `cost_basis: anthropic_usd_measured`); `0.0025` retired (always-on; live on push) |
| CI-9 (gate latency diagnostic, FX-15) | Approved | **Diagnosed + replay-acknowledged 2026-06-13** — fast number Diagnostic-certain (cache hit; cold 14,273ms vs warm 0ms, `usage` absent on #2); ~20s magnitude residual; any fix a separate item |
| CI-10 (gate loop metering, FX-16) | Approved | **Built (dark) + TEST live-Verified 2026-06-13** — flag-on gate call emitted all six `X-Loop-*` headers + a matching `loop_billing_events` row (`surface: api_guardrail`, `anthropic_cost_cents 1`, `internal_calls 1`, `total_cents 2`); KG1 awaited-write proven; flag UNSET in prod = inert |
| CI-16 (quick-tier value classification) | Approved | **Deferred** — gate does not inherit; parked for the gate-engine decision |
| FX-14 (stale $0.0025 in gate meta) | Open | **Closed in code** (gate overrides; reported as measured/null) |
| Engine token usage exposure | Absent | **Present** (additive `ReasonResult.meta.usage`) |

## Next Session Should

**M5 — practice-completion (CI-4 reason-route half + CI-13 + CI-15)** per the approved queue: prompt at `operations/handoffs/founder/2026-06-13-mechanism-correction-M5-practice-completion-NEXT-SESSION-PROMPT.md`. Elevated. The adopted Q1/Q3/Q4 methodology becomes shipped contract (two-gate cadence docs; loop-closure reason-route affordance composing with M3's write-boundary; reflect-at-close default). Est. ~3.5–4.5h. **Independently, the founder may elect at any time (each its own 0c-ii step):** the CI-9 replay + acknowledgement; the CI-10 flag activation + surface migration; the M1 activation; the M3 CI-11 migration + CI-4 flags.

## Blocked On

**Files remaining uncommitted (stage BY NAME — never `.env*`, never `tsconfig.tsbuildinfo`):**
- `website/src/lib/sage-reason-engine.ts`
- `website/src/lib/loop-cost-tracker.ts`
- `website/src/lib/response-envelope.ts`
- `website/src/app/api/guardrail/route.ts`
- `website/supabase-loop-billing-events-guardrail-surface-migration.sql`
- `website/src/lib/__tests__/ci9-cache-mechanism.test.ts`
- `website/src/lib/__tests__/response-envelope-ci8.test.ts`
- `website/src/lib/__tests__/loop-cost-tracker-ci10.test.ts`
- `website/scripts/ci9-gate-replay.ts`
- `operations/p1-rebuild-2026-06/ci9-gate-latency-diagnostic.md`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-close.md` (this file)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M5-practice-completion-NEXT-SESSION-PROMPT.md`
- `CLAUDE.md`

**Production state at session close (2026-06-13, M4):** per PR18 — on push the M4 commit is **behaviourally inert except the always-on CI-8 gate-meta cost change**: `/api/guardrail` `meta.cost_usd` now reports the measured Anthropic cost (or null on a cache hit) with a `cost_basis` note instead of the retired `$0.0025`; verdict/threshold output unchanged. CI-10 is dark (`SUBSTRATE_GATE_LOOP_METERING_ENABLED` UNSET → no `loop_billing_events` row, no `X-Loop-*` headers; the surface-CHECK migration is **not** applied in production). The engine `usage` field is additive (ignored by all callers). CI-9 changed no code path. All previously-Live surfaces unchanged (R20a ×4 true; A10/A11b/A12/A13/A14/A19/GDPR Live; M1 levers inert; M2 CI-6 live; M3 CI-12 write-boundary live + CI-11/CI-4 inert; Layer 3 + R20b inert; Stripe `not_configured`). 0h: HELD — unchanged.

> **Post-close addendum (2026-06-13, same day):** CI-10 was subsequently **activated in production** (founder-elected 0c-ii — `D-MECHANISM-CORRECTION-CI10-PRODUCTION-ACTIVATION-2026-06-13`): the production surface-CHECK was widened and `SUBSTRATE_GATE_LOOP_METERING_ENABLED=true` set in Vercel; `/api/guardrail` now writes a `loop_billing_events` row + emits `X-Loop-*` headers (verified live, loop `4578937b…`; gate now fails closed on a billing-write failure; rollback = unset the flag). The "CI-10 is dark" sentence above describes the at-close state only; CI-10 is now **Live**.

## Open Questions

- **CI-16 parked** — the gate does not inherit a sandwich value classification; revisit with the gate-engine architecture decision (M6+ or a gate→sandwich migration). The Q5 methodology stays satisfied on `/api/reason`, unsatisfied on the gate.
- **Fleet-wide price-vs-cost** — the 6 non-gate haiku/sonnet routes still report the competitor-anchored customer *price* in `meta.cost_usd` (labelled "cost"); same honesty class as FX-14, left to avoid revealing margin on customer-facing routes. Founder decision whether to address fleet-wide.
- **Pending founder-elected 0c-ii steps:** ~~the CI-9 replay + acknowledgement~~ **DONE 2026-06-13** (replay reproduced the cache-hit split; fast number Diagnostic-certain; note §7); ~~the CI-10 TEST migration + flag live leg~~ **DONE 2026-06-13 on TEST** (surface CHECK widened on TEST; flag-on gate call verified end-to-end; flag + test key torn down) — ~~the CI-10 PRODUCTION activation remains~~ **DONE 2026-06-13 (post-close, founder-elected 0c-ii — `D-MECHANISM-CORRECTION-CI10-PRODUCTION-ACTIVATION-2026-06-13`):** production surface-CHECK widened + `SUBSTRATE_GATE_LOOP_METERING_ENABLED=true` in Vercel; verified live (loop `4578937b…`, HTTP 200 + six `X-Loop-*` headers); prod test key revoked. CI-10 is now **Live**. Exclude all TEST + prod-verification metering rows from billing-tuning samples. **Test/verification data written:** TEST — the surface migration + 1 `api_guardrail` row (loop `f5c0ea58…`) + keys minted-then-revoked; PRODUCTION — the surface migration + 1 `api_guardrail` row (loop `4578937b…`) + 1 `sr_live_` key minted-then-revoked. Carried: the M1 activation checklist; the M3 CI-11 migration + CI-4 flags; the `/api/keys` 100/100/1 vs 30/1/1 split; the leg-B seed-row disposition; the 0h call.

## Founder Verification

**AI-performable (already run green this session):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx src/lib/__tests__/ci9-cache-mechanism.test.ts
npx tsx src/lib/__tests__/response-envelope-ci8.test.ts
npx tsx src/lib/__tests__/loop-cost-tracker-ci10.test.ts
npx tsx src/lib/__tests__/loop-cost-tracker.test.ts
```
Expected: tsc silent; `9`, `20`, `16`, `76` pass / 0 fail.

**Founder-walked TEST live legs (PR17 — pending; TEST only):**
1. **CI-9 replay** (real Haiku calls) — **DONE + ACKNOWLEDGED 2026-06-13:** `npx tsx --env-file=.env.development.local scripts/ci9-gate-replay.ts` returned `cold=14273ms warm=0ms ratio=14273x`, `usage=absent` on call #2 → split reproduced from one cause; CI-9 fast number is Diagnostic-certain (cache hit). Recorded in the diagnostic note §7.
2. **CI-10 metering** (flag + migration on TEST) — **DONE 2026-06-13:** migration applied to TEST (CHECK widened); flag set; `sr_live_` key minted (30/1/1 confirmed); a `/api/guardrail` POST returned all six `X-Loop-*` headers (`x-loop-internal-calls: 1`, `x-anthropic-cost-cents: 1`, `x-loop-cost-cents: 2`, `x-overage-fired: false`) and the matching `loop_billing_events` row landed (`loop_id` = `x-loop-id`, `surface: api_guardrail`, `anthropic_cost_cents 1`, `internal_calls 1`, `total_cents 2`, `agent_id null`) **(test traffic — exclude from billing-tuning samples)**; flag/key teardown per the teardown block.
3. **CI-8** (any gate call) — **DONE 2026-06-13 (confirmed via the live call's measured 1¢ cost + the shared-usage code path + C8-7):** `meta.cost_usd` is the measured Anthropic cost (≈ $0.007, rounding to the observed 1¢; `cost_basis: anthropic_usd_measured`), never `0.0025`; the `result`/verdict block was byte-unchanged (proceed/recommendation/receipt intact — scope/safety confirmed live).

**Commit:** stage the files above BY NAME (never `.env*`, never `tsconfig.tsbuildinfo`); push via GitHub Desktop. Vercel deploys a change that is **behaviourally inert except the CI-8 gate-meta cost field** — expect green.

## Cross-references

- `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-NEXT-SESSION-PROMPT.md` (this session's operative prompt)
- `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-close.md` (predecessor)
- `operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md` (approved plan; CI-8/9/10/16)
- `operations/p1-rebuild-2026-06/ci9-gate-latency-diagnostic.md` (the CI-9 note)
- Decision log: `D-MECHANISM-CORRECTION-M4-GATE-QUICK-TIER-BUILT-TEST-VERIFIED-2026-06-13`
- M5 prompt: `operations/handoffs/founder/2026-06-13-mechanism-correction-M5-practice-completion-NEXT-SESSION-PROMPT.md`

*End of session close. Stabilised: the gate's per-call cost is honest (measured, never the retired price), its LLM cost can be loop-metered behind a flag, and the 46ms/20,015ms latency mystery has a named mechanism (a cache hit) awaiting the founder's replay. CI-16 is parked on a verified architecture finding, not a build failure. Production is untouched but for the CI-8 meta honesty; every flag, migration, and the CI-9 acknowledgement remain founder-elected 0c-ii steps.*
