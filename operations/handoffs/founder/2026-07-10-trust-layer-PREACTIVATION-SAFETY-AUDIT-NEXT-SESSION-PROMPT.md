# Next-Session Prompt — Trust Layer PRE-ACTIVATION SAFETY AUDIT (run BEFORE the S9 prompt)

> **SPENT 2026-07-11** — executed on Fable 5 (`D-TRUST-LAYER-PREACTIVATION-SAFETY-AUDIT`). Verdict: **conditional GO** — zero `live_today` findings; two `blocks_flag_flip` items (PA-1 the S1 justice-met ratchet; PA-2 the sweep-flag pairing). Report: `operations/trust-layer-2026-07/2026-07-11-preactivation-safety-audit-report.md`. **S9 is now gated on the pre-flip fold:** `operations/handoffs/founder/2026-07-11-trust-layer-preflip-fold-NEXT-SESSION-PROMPT.md`.

**For the founder. Paste as the first message of a fresh session.** Run this with a **different model than the one that built the arc** (S0b→S8 were built largely on Opus 4.8; run this on Fable 5, or vice-versa). Rename the date prefix to the actual session date.

**Stream:** founder.
**Tier:** `governance` / read-only audit. **NO code change, NO flag, NO migration, NO mint, NO deploy.** If the audit surfaces a must-fix, it is scoped + folded in its own session — this session only *finds and adjudicates*.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013) + the binding verbatim record `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-10-trust-layer-S8-reference-harness-CLOSE.md`.
**Gates:** the **S9 prompt** (`operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md`). Do not run S9 until this audit returns a verdict.

## Why this session exists

S1–S8 built the trust core, the four-layer discernment protocol, the L4 audit, and the seven-layer reference harness — every slice DARK behind `SUBSTRATE_TRUST_CORE_ENABLED` (unset) and MEASURE (nothing binds). **S9 is the first session that sets that flag.** It is therefore the moment the whole arc stops being inert.

Several slices' adversarial reviews were completed **first-hand rather than independently**, because the account session limit killed the Workflow mid-run (S1 — the most load-bearing slice — got no independent pass at all; S4 and S6 were partly first-hand; the S8 build's first review pass lost 4 of 6 finders). A **fresh-model, independent audit** of the composite is the right gate before the flip.

**The audit answers ONE question with evidence: is it safe to set `SUBSTRATE_TRUST_CORE_ENABLED=true`?**

## What is actually at risk (read this before scoping)

- **The one thing already LIVE in production**: the data-rights + retention wiring is **always-on, NOT flag-gated** (erasure/export cannot be flag-gated). `/api/user/delete`, `/api/user/export`, `/api/credential/erase` + `consumer-erasure.ts` + the retention sweep cron(s) now touch `agent_trust_events`, `agent_trust_state`, `collaboration_records`. If any of those queries throws, a **real GDPR deletion breaks**.
- **Two schema migrations are already applied to PRODUCTION**, claimed empty + inert: `website/supabase-agent-trust-core-migration.sql`, `website/supabase-agent-collaboration-record-migration.sql`.
- **Exactly two live routes emit trust events**, both flag-gated at the caller: the accreditation write (`src/app/api/accreditation/[agent_id]/route.ts` ~803) and the Sage Reflect completion (`src/lib/sage-reflect/reflect-service.ts` ~399).
- The discernment/L4/harness surface needs the flag **plus** `discernment.config.json` **plus** an installed hook — the flag alone does not activate it.

## Already verified FIRST-HAND (2026-07-10 — re-verify, do not assume)

These were checked by hand when the audit Workflow hit the session limit. **Treat them as claims to falsify, not as settled:**

1. Both triggers are `BEFORE UPDATE` only (`trg_ate_forbid_update`, `trg_cr_protect_immutable`) ⇒ **DELETE is not blocked** ⇒ R17c genuine deletion is possible.
2. The idempotency index `uq_ate_correlation` **COALESCEs the nullable `virtue_domain`** (`COALESCE(virtue_domain, '__agent_wide__')`) ⇒ agent-wide (NULL-domain) reflect events genuinely dedupe.
3. Both emission hooks check `isTrustCoreEnabled()` **first**, before any DB/identity/crypto work, and wrap the whole body in `try/catch` — so the `client = getAdminClient()` default-parameter throw is caught. Flag-off is a bare env read + return.
4. `deriveCredentialAndJusticeEvents`'s default `verify` is the **real** `verifyLayer2Signature`, and an unset verifier key returns `{valid:false, reason:'verifier_key_unavailable'}` ⇒ **fails CLOSED** (zero events), never open.
5. `fabrication_risk_level` is **server-computed** by the reflect engine (`next.outcome.fabrication_risk_level`), not client-supplied — so an agent cannot simply declare itself honest.

## The ONE finding already surfaced (adjudicate it; do not re-derive)

**The reflect trust event's artifact is not cryptographically verifiable.** `context_source` **is** a client request field (`request-helpers.ts` `parseContextSource` → persisted → read back at completion as `row.context_source`), and `deriveReflectEvent` gates on `contextSource === 'agent_stated' && fabricationRiskLevel !== 'high'`. The resulting event carries `artifactKind: 'reflect_completion'`, `artifactRef: reflect:<session_id>` — **a DB row, not a signature**. Every *other* trust event is R18f-gated on a re-verified Ed25519 signed assessment.

The arc's honest-claims envelope (ADR-013 §8) states that a trust record attests "signed, reproducible examination artifacts exist for the decisions it aggregates." That is **true of the credential path and stronger than reality for the reflect path.**

**Audit questions:** (a) Does this block the flag flip? (Provisional answer: **no** — reflect events are agent-wide (`virtueDomain: null`), so they modulate A3 decay + count toward the A7 higher-tier pattern; they do not raise a domain level. And the A7 tier promotion is AND-guarded on un-degraded **oversight**-domain evidence, which only accrues from A8/A9 delegation events.) (b) **Verify that AND-guard actually holds** — can an oversight row ever reach `hasEvidence && ≥deliberate && !justiceCapped` *without* a genuine delegation? Read `trust-transition.ts` seeding + `EVENT_EFFECT` for the A8/A9 event types. If it can, an agent could self-promote to the higher L4 tier and downgrade its own passion-audit flags from *hold* to *surface*. (c) Either way: **the R18 honest-claims envelope must be narrowed before S10 publishes it.**

## Method

Use a **Workflow** (PR15). Six dimensions in parallel, each finding adversarially refuted by an independent verifier. Default to REFUTED when a failure cannot occur on a reachable path. **Do not invent findings; a clean dimension is a valid, valuable result.** Disclosed design decisions are not findings unless you show a defect beyond the disclosure.

**Budget guard (learned the hard way):** this arc's Workflows have repeatedly died on the account session limit. **Check the budget first.** If it is thin, run **fewer dimensions with higher effort** (A, C, D, E are the safety-critical four; B and F are confirmatory) rather than all six at once, or run them in two waves. A half-completed Workflow that must be finished first-hand is the failure mode to avoid.

### The six dimensions

**A — The always-on live surface (HIGHEST VALUE; broken here = broken in prod today).** Can any trust-table query throw and break a real user deletion/export/credential-erasure? Is `42P01`/`PGRST205` genuinely caught everywhere, and can a missing table make a deletion report SUCCESS while other tables were not deleted (a false "erased")? Is deletion *complete* across all three tables (R17c is a legal claim)? The owner FK cascade from `profiles` — ordering vs the app-level delete? The sweep cron(s): registered in `vercel.json`, own flag, fail-honest, and can they purge too early or leave `NULL retain_until` rows that never expire?

**B — Composite flag-off byte-identity.** With the flag unset, do the two live emission call sites change *anything* — latency, body, status, an unhandled promise rejection that could crash a lambda? Which non-trust-core files were touched across the whole arc, and is each touch flag-gated or always-on? **Enumerate the always-on touches explicitly — that list is the real production delta.**

**C — Flag-on fail-honesty (the blast radius of the flip).** Can a trust-core failure (DB outage, RLS reject, trigger RAISE, unique violation, cold-lambda env miss) ever propagate out and break the accreditation write or the reflect completion? The emission is `await`ed — what is the worst-case added latency (N events × a round trip), and can it push a user-facing route past a platform timeout? Insert-then-fold is non-transactional: on a crash between them, can it double-count on retry, or only lag ("state-behind")?

**D — The prod-inert schema.** Read both migrations line by line. Can any trigger/constraint/RLS/FK fire on a write to a pre-existing table (`profiles`, `api_keys`, `agent_accreditation`, `sage_reflect_sessions`)? Does service-role-only RLS break any existing code path that queries with a non-service client? Are the migrations genuinely idempotent + reversible (does the documented rollback leave orphan triggers/functions/indexes)?

**E — The S1 trust-core engine (never had an independent pass).** `trust-transition.ts`, `trust-decay.ts`, `trust-aggregate.ts`, `derive-trust-events.ts`. Construct event sequences: can trust move the *wrong* direction, skip the justice-unevaluated latch, or clear that latch without a demonstrated evaluation? A3 decay: can the profile-prior **floor** be breached, or reflect modulation **stop** decay entirely (it may only halve the rate)? Can a lazy read apply decay twice in one period? Is the aggregate genuinely the minimum across evaluated domains, and does an un-evaluated domain fail *open*? Is `occurred_at` server-composed (not consumer-supplied)? Does an unknown `coverageStatus` default to `continuous` (reading a suspended credential as a continuous-coverage rise)?

**F — Claims vs reality.** For every "flag-off byte-identical (test-asserted)" claim, find the asserting test and confirm it is not vacuous. Grep the repo for anywhere `SUBSTRATE_TRUST_CORE_ENABLED` is **set** (a test that sets it and fails to restore it is a real hazard). Run the batteries and check the stated counts (S1 75 · S2 87 · S3 106 · S4 417 · S5 87 · S6 84 · S7 122 · S8 145; `logic-harness` 91 · `negative-battery` 230). Verify the "R20a / R18f / Layer-2 signing / UPC auth untouched" claim by grep. Finally: does the **S9 prompt** correctly name its pre-conditions and rollback, or does it assert anything false?

*Running a battery: from `website/`, `npx tsx src/lib/substrate/trust-core/__tests__/<file>` — the run may HANG after printing its summary line (a known `security.ts` keepalive issue); read the summary, then move on. Hooks: `node harness/gate1-pre-decision/test/logic-harness.mjs` and `.../negative-battery.mjs`.*

## Deliverable

1. A **per-dimension verdict**: `SAFE` / `SAFE_WITH_CONDITIONS` / `UNSAFE`, with conditions named.
2. An **overall go/no-go on `SUBSTRATE_TRUST_CORE_ENABLED=true`**, distinguishing **TEST** from **production** (TEST-first is the recommended S9 election).
3. Every confirmed finding tagged **`live_today`** (broken in prod right now) vs **`blocks_flag_flip`** vs **`fix-before-S10`** (the honest-claims envelope class, e.g. the reflect-artifact asymmetry above).
4. A short **records addendum** to the decision log (`D-TRUST-LAYER-PREACTIVATION-SAFETY-AUDIT`), and — only if a must-fix is found — a scoped fold prompt. **No code changes in this session.**

## Rollback
None needed — read-only. If the audit finds a `live_today` defect, the rollback for the *arc* is `git revert` of the offending slice's commit; the two prod migrations are reversible per their own footers (`DROP TABLE` / `DROP FUNCTION`), and the flag is already unset.

## Forecast
Ends with an evidence-backed go/no-go on the flag flip, the S1 engine independently reviewed for the first time, and the R18 honest-claims envelope corrected (or confirmed) before S10 publishes it. Then S9 — the founder-walked dogfood install. **ENFORCE remains S11.** Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
