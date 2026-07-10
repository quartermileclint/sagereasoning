# Trust Layer Pre-Activation Safety Audit — Report

**Date:** 2026-07-11.
**Session tier:** `governance` / read-only audit (no code change, no flag, no migration, no mint, no deploy).
**Audit model:** Fable 5 (`claude-fable-5`) — a different model than built the arc (S0b→S8 were built largely on Opus 4.8), per the audit prompt's fresh-model requirement. All Workflow finder agents ran on Fable 5.
**Scope:** the S0b→S8 composite (`34d250e..7eae207`) — the always-on data-rights surface, flag-off byte-identity, flag-on fail-honesty, the prod-applied schema, the S1 trust-core engine (never independently reviewed until now), and claims-vs-reality.
**Question answered:** is it safe to set `SUBSTRATE_TRUST_CORE_ENABLED=true`?
**Executed prompt:** `operations/handoffs/founder/2026-07-10-trust-layer-PREACTIVATION-SAFETY-AUDIT-NEXT-SESSION-PROMPT.md` (SPENT).

---

## 1. Overall go/no-go

**`live_today` findings: ZERO.** Production as it runs today — flag unset — is not broken by the arc. The always-on data-rights/retention wiring (delete, export, credential-erase, sweep) was audited end-to-end and is clean: no trust-table query can throw and break a live deletion/export/erasure; deletion is complete across all three tables on every surface; the FK ordering is children-before-parent; exports are owner-scoped.

**TEST flag flip: NO-GO as-is → GO once two conditions are met.**
**Production flag flip: NO-GO as-is → GO once the same two conditions are met** (TEST-first per the S9 recommendation remains the right election).

The two conditions (both cheap):

1. **PA-1 (HIGH, `blocks_flag_flip`)** — fold the uncapped justice-met ratchet in the S1 engine before the flag is set ANYWHERE (TEST included: the flip's purpose is accumulating valid records and running instrument-fidelity batteries; a known systematic dikaiosyne inflation invalidates both). The fold is a small pure-lib change + battery pins; prompt: `operations/handoffs/founder/2026-07-11-trust-layer-preflip-fold-NEXT-SESSION-PROMPT.md`.
2. **PA-2 (MEDIUM, `blocks_flag_flip` — an operational condition, not a code fix)** — set `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED=true` (and verify the cron returns `flag_enabled:true`) at the same time as, or before, `SUBSTRATE_TRUST_CORE_ENABLED`. The sweep is the ONLY retention enforcer for all three trust tables and the ONLY deletion path for null-owner/null-credential rows (the reflect emission fallback). The S9 prompt must be amended to add this step — its current rollback line ("the trust rows are retain_until-swept") silently depends on it.

Everything else confirmed is `fix_before_s10` (six findings — the honest-claims/instrument-precision class; §4 below) or informational (§5). MEASURE mode is genuinely structural: nothing the flip activates binds any decision, no host route can be 500'd by a trust-core failure, and the A7 higher-tier promotion is not merely guarded but **currently unreachable** (§3).

---

## 2. Per-dimension verdicts

| Dimension | Verdict | One-line basis |
|---|---|---|
| **A — always-on live surface** | SAFE_WITH_CONDITIONS | All six audit questions clean (no-throw, missing-table-benign, deletion-complete matrix, FK ordering, no early purge, owner-scoped export). Conditions: PA-2 (sweep flag simultaneity); PA-8 before S10. |
| **B — composite flag-off byte-identity** | SAFE | The S0b→S8 always-on delta fully enumerated (§6) — every touch is either the A-audited data-rights wiring, the disclosed S0b `direction_of_travel` wire normalization, an additive `credential_id` thread with no auth-decision change, the double-gated cron registration, or docs. No undisclosed always-on behaviour change; no unhandled-rejection path (both emission call sites awaited with `.catch(() => {})` inside existing try blocks). |
| **C — flag-on fail-honesty** | SAFE_WITH_CONDITIONS | Blast radius contained: hooks check the flag first inside a total try/catch; service-role client (RLS cannot reject); append-only trigger fires only on UPDATE and emission only INSERTs; 23505 classified benign-duplicate; worst-case latency ~21 sequential DB round trips (well inside the budget; Ed25519 re-verify is sync sub-ms and already runs live at the R18f gate). Conditions: PA-3 + PA-7 before S10. |
| **D — prod-inert schema** | SAFE | Both migrations read line-by-line: no object attaches to any pre-existing table (sole coupling = the owner FK → profiles ON DELETE CASCADE, index-supported, cannot RAISE); both prior first-hand claims survived falsification (triggers are BEFORE UPDATE only ⇒ DELETE unblocked; the COALESCE idempotency index dedupes NULL-domain events correctly, event_type in the key); genuinely idempotent + reversible; every live-emittable insert shape conforms to every CHECK/NOT NULL. |
| **E — S1 trust-core engine** (first independent review) | SAFE_WITH_CONDITIONS | Transition direction table, justice latch, decay floor/half-rate, lazy-read no-double-count, clock provenance, R18f fail-closed derivation, minimum-domain aggregate, correlation idempotency, single-fold (no drifting parallel implementation) — all verified clean. Condition: PA-1 must fold before any flip (+ PA-4/PA-5 before S10). |
| **F — claims vs reality** | SAFE_WITH_CONDITIONS | Every claimed battery count reproduced exactly (S1 75 · S2 87 · S3 106 · S4 417 · S5 87 · S6 84 · S7 122 · S8 145 · logic-harness **91** · negative-battery **230** with the s8-discernment leg 64); no test sets the flag anywhere (no set-and-leak hazard); R18f/Layer-2 signing/UPC auth/R20a untouched — verified by complete arc file-list enumeration, not spot checks; the S8 commit is pushed (origin in sync). Conditions: amend the S9 prompt per PA-2; note F-1 (§5). |

**A7 AND-guard adjudication (the pre-surfaced question): GUARD_HOLDS — strengthened.** See §3.

---

## 3. The A7 AND-guard adjudication (pre-surfaced finding, question (b))

**Verdict: GUARD_HOLDS, and stronger than the provisional adjudication assumed.** Full trace in the audit record; the load-bearing steps:

- `deriveL4TrustTier` requires tier `higher` ⟺ reflectStrong (≥3 honest reflects within 180d) **AND** oversightSound (oversight row exists ∧ hasEvidence ∧ effective ≥ deliberate ∧ ¬justiceCapped) — `l4-passion-audit.ts:297-312`.
- **No event type can raise the oversight domain.** The only increase-capable effects are `increase` (credential-completed) and `clear-cap-and-increase` (justice-surface-transparently-handled). Credential-completed events take their domain from the server-Ed25519-verified assessment's `virtue_domains_engaged`, which is structurally confined to the four cardinal literals; the justice event is hardcoded `dikaiosyne`. Every oversight-targeting event in the codebase (A8/A9 delegation events) is `decrease` or `flag`.
- Null-domain (reflect) events cannot seed a state row — `applyReflectAcrossDomains` UPDATEs existing rows only. A `flag` event seeds at (habitual, no evidence) ⇒ hasEvidence FALSE; a `decrease` event sets evidence but steps DOWN below the deliberate floor.
- **Conclusion:** oversightSound is TRUE-unreachable under the entire current event vocabulary. The A7 `higher` tier is presently **dead code**: no volume of gamed or genuine reflect events can downgrade an L4 passion-audit hold to mere surfacing. The caller-supplied `/api/practice/discernment` hand-back path (the F1 residual) can only let an orchestrator degrade or flag ITS OWN oversight record (403-bound to its credential; R18f-re-verified artifacts required) — the safe direction.
- **Standing note for any future slice (record with S9/S10):** the moment a positive oversight event type is added (e.g. "delegation handled well"), the reflect-count leg of the higher-tier gate silently arms, and the unsigned reflect artifact (PA-6) becomes load-bearing for softening L4 holds. Harden the reflect path or re-audit the guard **in the same change**.

**The flip-blocking question is therefore answered: the reflect-artifact asymmetry does NOT block the flag flip.** It remains a `fix_before_s10` honest-claims item (PA-6).

---

## 4. Confirmed findings register

Verification legend: **[W]** = adversarially refuter-confirmed in the Workflow before the session limit; **[FH]** = refuters killed by the account session limit, completed FIRST-HAND per the §4 precedent (independent direct code read by the audit session, exact citations re-derived).

### `blocks_flag_flip` (2)

**PA-1 (HIGH) [FH] — uncapped justice-met ratchet: dikaiosyne climbs to `sage_like` from ordinary writes.**
`derive-trust-events.ts:117` builds the `justice-surface-transparently-handled` event payload as `{ obligationStatus, keyId }` — **no `demonstratedProximity`** — while `trust-transition.ts:119-123` defaults the missing field to `PROXIMITY_RANK.sage_like` and applies `newRank = min(demonstratedRank, fromRank + 1)`: an unconditional +1 per event up to rank 4, with neither the `demonstratedRank > fromRank` guard nor the `coverageContinuous` gate the ordinary `increase` branch has (`:106`). Consequence: an agent whose every verified assessment is `deliberate`-grade, with any circle `obligation_assessment.status='met'` (and nothing worse), ratchets dikaiosyne `habitual → principled → sage_like` in two accreditation writes; re-submitting the same met assessment inside a superset write re-credits (fresh content-hash correlation). This contradicts the engine's own comment ("capped at the demonstrated proximity **if given**" — it is never given on the live path), the deriver's conservative-weakest-proximity doctrine (honored by the credential path, bypassed by the justice path), and the arc's "sparse evidence is named, never papered over" claim. The only transition test passes `demonstratedProximity:'principled'` explicitly, so the live payload shape is unexercised. *Honest counterweight:* MEASURE mode means nothing binds on the inflated level, and the append-only ledger (which stores `obligationStatus`, and whose sibling credential-completed events carry the batch's proximities) permits a post-fix state rebuild within the 90-day retention window — but flipping on a known-inflating engine defeats S9's accumulation + fidelity purpose, and the fix is small. **Fix:** the pre-flip fold prompt (deriver passes the conservative weakest demonstrated proximity on the justice event; engine branch gains a rise-only guard while still clearing the latch — PA-9/E1-3 must ride in the same change).

**PA-2 (MEDIUM) [FH] — flip condition: the sweep flag must be set with the trust flag.**
`trust-core-retention-sweep/route.ts:13` states the hard rule in its own docstring ("must be BUILT, FLAGGED ON, and SCHEDULED before SUBSTRATE_TRUST_CORE_ENABLED begins creating null-owner rows"); `handler.ts:69-79` returns `{flag_enabled:false}` with zero DB work when `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED` is unset — and it is unset in production today (CLAUDE.md production record; no repo env sets it). A reflect emission with a null credential (`emission-hooks.ts:111-114`) writes a row with NULL owner and NULL credential_ref — unreachable by the owner-keyed `/api/user/delete` and the credential-keyed `/api/credential/erase`; the sweep is its only deletion path, and the only enforcer of the 90-day `retain_until` promise written into both migrations. **Fix:** operational — set both flags together (verify `flag_enabled:true` on the cron); **amend the S9 prompt** to add the step (its rollback line currently presupposes the sweep).

### `fix_before_s10` (6) — none block the flip

**PA-3 (MEDIUM) [W ×2 confirmed] — fold state-read error silently RESETS earned state backward.**
`trust-core-store.ts:174-179` destructures only `{ data }` from the `agent_trust_state` read (the `error` field never inspected; supabase-js returns transient failures as error objects, not throws), so a transient read error falls into the seed branch (`habitual`/`habitual`/high-volatility, `justiceFloorActive:false`) and the unchecked upsert (`:214`) overwrites the real row — including erasure of a latched justice floor. A *different direction* than the disclosed "state-behind" class (which covers only crash-between-insert-and-fold); no test can currently pin it (the fake client cannot inject a transient select error); no automated rebuild exists. Ledger stays authoritative; blast radius one agent×domain row; not attacker-timeable. Fix: inspect the read error and abort the fold on a real failure.

**PA-4 (MEDIUM) [FH] — met-credit ungated on dikaiosyne engagement.**
`derive-trust-events.ts:151-164`: only the `unevaluated` branch checks `virtue_domains_engaged.includes('dikaiosyne')`; `sawMet` is set from any circle's status. A phronesis-only assessment with one met circle mints a dikaiosyne-positive `transparently-handled` event (compounding PA-1), and dikaiosyne then reads as an *evaluated* domain although no justice evaluation occurred. The violated/indeterminate direction of the same asymmetry is conservative-safe; the met direction is inflation. Cheap to ride in the pre-flip fold (same file).

**PA-5 (MEDIUM) [FH] — `reflect-completed-honest` events are mintable by a credentialed agent.**
The gate is (client-supplied `context_source === 'agent_stated'` — `request-helpers.ts:58,106`; enum-validated only) AND (server-computed but agent-influenceable `fabrication_risk !== 'high'` — derived entirely from the agent's own Q1–Q6 answers; clean answers ⇒ low). Dedupe is per client-chosen `session_id`. An agent can accrue an "honest reflect pattern" at will. **Impact bounded by §3:** modulate-only — halved decay + an inflated honest count; cannot raise any level or soften an L4 hold in this build. Publication-class: S10 must not attest a manufactured reflect history (pair with PA-6's narrowing).

**PA-6 (MEDIUM) [W adjudicator] — the ADR-013 §8 honest-claims envelope overstates the reflect path.**
§8 attests "signed, reproducible examination artifacts exist for the decisions it aggregates … no trust event without them." The reflect event carries `artifactKind:'reflect_completion'`, `artifactRef:'reflect:<session_id>'` — a DB-row pointer, not an Ed25519-verifiable artifact (`derive-trust-events.ts:205-206`). Narrow the published claim before S10 (e.g. "…without a verifiable examination artifact; reflect events are backed by the retained reflect-session record, honest-completion-gated, and are modulate-only — they cannot raise any trust level").

**PA-7 (LOW) [W confirmed] — real DB emission failures are lost silently, not logged.**
Both hooks discard `emitTrustEvents`' StoreResult (`emission-hooks.ts:84,127`); the hooks' catch fires only on throws, and the store converts its own throws to `ok:false` (`trust-core-store.ts:146-148`) with zero `console.*` anywhere on that path — so a standing DB-side rejection (CHECK violation, misconfigured key, schema drift) drops every event with no operator signal while routes return 200, contradicting the module's own "log-and-continue" contract. Fix: log the discarded result at both call sites (or inside `emitTrustEvents`).

**PA-8 (LOW) [FH] — `/api/credential/erase` under-reports collaboration_records.**
The deletion happens (`consumer-erasure.ts:312` returns `collaboration_deleted`), but the compliance `tables_cleared` entry (`erase/handler.ts:245-248`) and the 200 response both omit it — an incomplete GDPR audit trail for that erasure event. Contrast `/api/user/delete`, which lists it correctly.

### Informational (`none`) — verified, no action gates on them (7 + 1 note)

- **PA-9 / E1-3 (LOW) [FH] — latent direction-inversion, MUST ride the PA-1 fix:** `trust-transition.ts:123` lacks a rise-only guard, so a `clear-cap-and-increase` event carrying `demonstratedProximity` BELOW the current rank would *lower* the level (by up to 3 ranks). Unreachable today precisely because the payload never carries the field; armed the moment PA-1's fix supplies it. The fold must fix both together (clear latch; rise only when demonstrated > from).
- **E1-4 (LOW):** reflect decay-modulation is binary at read time and therefore retroactive — one day-old honest reflect halves decay accrued over the whole preceding window. Mildly timing-gameable; the mentor half-rate cap itself holds (factor 2, never stops decay). The binary realization is disclosed as an S2/S9 refinement.
- **A-3 (LOW):** `isMissingTableError`'s message-regex (`/does not exist|…/i`) also matches column-does-not-exist, so *future schema drift* on a queried column would make a failed DELETE report benign success — a latent false-"erased" mechanism. Verified NOT live (every referenced column exists). Hardening: match table-shaped messages only, or drop the regex now that both migrations are applied.
- **D-1 (LOW):** the idempotency index omits `agent_id` — cross-agent dedupe collisions are prevented only by emitter convention (all four current emitters embed agent identity). A future-emitter hazard only.
- **D-2 (NIT):** both migration headers claim "TRIGGER IF NOT EXISTS" idempotency; the actual (correct) mechanism is DROP TRIGGER IF EXISTS + CREATE.
- **C-3 (NIT) [W confirmed]:** `foldTrustEvents`' docstring names "the store's rebuild path" — no such function exists (battery-only consumer). Doc-vs-code gap; relevant to PA-3's "rebuildable" caveat (rebuild is possible in principle, by hand).
- **F-1 (LOW):** the emission hooks have **no unit test** — "flag-off byte-identical (test-asserted)" is explicit only for the discernment route's 503; for the two live call sites it rests on structural verification (three independent reads concur) + the pre-existing suites re-passing flag-off. Cheap hardening: an emission-hooks test leg (flag off ⇒ zero client calls; flag on + store failure ⇒ no throw + logged).
- **AND-guard note:** the A7 `higher` tier is currently dead code (§3) — record this deliberately so a future oversight-increase event triggers a reflect-path hardening or guard re-audit in the same change.

---

## 5. Prior first-hand claims — falsification results

All five claims the audit prompt ordered re-verified **HOLD** under independent attack:

1. Triggers are BEFORE UPDATE only ⇒ DELETE unblocked ⇒ R17c deletion possible — **holds** (trust migration L217-220; collab L188-191; cascade cannot RAISE).
2. `uq_ate_correlation` COALESCEs nullable `virtue_domain` ⇒ agent-wide events genuinely dedupe — **holds**, and `event_type` is in the key so distinct types never collide (migration L194-198).
3. Both emission hooks check the flag first, before any DB/identity/crypto work, with a total try/catch catching the `getAdminClient()` default-parameter throw — **holds** (`emission-hooks.ts:55-88, 107-130`; verified by the C finder, two refuters, and this session's direct read).
4. The deriver's default verify is the real `verifyLayer2Signature`; an unset key ⇒ `{valid:false}` ⇒ zero events — **fails CLOSED, holds** (`derive-trust-events.ts:58,66`; `layer2-verifier.ts:229-231`); neither live call site passes a verify override.
5. `fabrication_risk_level` is server-computed — **holds** (`reflect-service.ts:403` ← the reflect engine's outcome; no request field parses into it). The *indirect* influence via the agent's own answers is exactly PA-5.

## 6. Dimension B — the enumerated always-on delta (S0b→S8)

The complete non-trust-core, non-test, non-docs code delta of `34d250e..7eae207`, each touch classified:

| File | Class |
|---|---|
| `api/accreditation/[agent_id]/route.ts` | Flag-gated emission call (awaited + `.catch(()=>{})` in the writer try) + **always-on additive** `credential_id` field on the auth-gate success object (no auth-decision change — verified in the diff) |
| `lib/sage-reflect/reflect-service.ts`, `api/practice/reflect/route.ts` | Flag-gated emission call + additive `credentialId` threading |
| `api/practice/reflect/response-builders.ts`, `lib/substrate/trajectory-overlay.ts`, `lib/substrate/direction-of-travel.ts` | **Always-on** S0b `direction_of_travel` wire normalization (`regressing`→`declining`) — disclosed intended standing change; prospective (aggregator emits `stable` below its ≥10-action threshold) |
| `api/user/delete`, `api/user/export`, `lib/consumer-erasure.ts`, `api/credential/erase/handler.ts` | **Always-on** data-rights trust-table coverage — dimension-A audited clean (fail-honest, owner/credential-scoped, missing-table-benign) |
| `api/cron/trust-core-retention-sweep/*`, `vercel.json` (+4) | Cron registration — handler double-gated (CRON_SECRET + own flag; flag-off = 200, zero DB work) |
| `api/practice/discernment/*` | Dark route — 503 flag-off (test-asserted) |
| Two migrations | Applied to prod; dimension-D audited SAFE |
| `manifest.md` (R5 100→30), `api-docs/page.tsx` (enum) | Docs/governance riders, disclosed |

No other file outside `trust-core/` and tests was touched. R18f provenance-gate, Layer-2 signer/verifier, UPC `practice-credential.ts`, and `r20a-gate.ts` appear nowhere in the delta.

## 7. Method + honest limits

A 24-agent Workflow (5 finder dimensions + the AND-guard adjudicator, all high-effort on Fable 5; per-finding adversarial refuters, 2 for medium+) ran wave 1; dimensions B and F ran first-hand as wave 2 per the audit prompt's budget guard. **The account session limit (reset 1:40am Brisbane) killed 14 refuter agents mid-verify — the disclosed S1/S4/S6/S8 exhaustion pattern.** All six finders and the adjudicator completed independently (~2.7M subagent tokens). Per the §4 precedent, the dead refutations were completed FIRST-HAND by the audit session (each [FH] finding's citations independently re-derived from the code; the two `blocks_flag_flip` findings rest on direct reads of exact lines, quoted in §4). C-1 (×2), C-2, and C-3 were refuter-confirmed before the limit. **Honest limit:** the [FH] refutations are single-perspective (though on a different model than the authoring sessions); an independent refuter pass over PA-1/PA-2/PA-4/PA-5 can re-run after the limit resets — the verdict does not hinge on it, but the pre-flip fold session should re-verify PA-1's mechanics before folding (standard practice).

Batteries were re-run this session, not trusted from records: all ten reproduce their claimed counts exactly (§2 row F).

## 8. What S9 must change before running

1. **GATE discharged only after the pre-flip fold:** run `operations/handoffs/founder/2026-07-11-trust-layer-preflip-fold-NEXT-SESSION-PROMPT.md` first (PA-1 + PA-9 mandatory; PA-4/PA-3/PA-7/PA-8 as cheap riders).
2. **Add the sweep-flag step (PA-2):** set `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED=true` alongside `SUBSTRATE_TRUST_CORE_ENABLED` (founder-walked; verify `flag_enabled:true`), on TEST and later prod.
3. Everything else in the S9 prompt checks out: the G1 credential-binding hard requirement matches the code; the 503-flag-off smoke, battery counts, and rollback are accurate once (2) is added; the S8 commit is pushed.

## 9. `fix_before_s10` register (carried, non-blocking)

PA-3, PA-4 (if not ridden in the fold), PA-5, PA-6 (the §8 envelope narrowing), PA-7, PA-8, plus the A7-dead-code documentation note and the F-1 hooks-test hardening. S10's R18 governance sign-off must confirm each is closed or consciously carried.

**FOLD ADDENDUM (2026-07-11, `D-TRUST-LAYER-PREFLIP-FOLD`):** the pre-flip fold ran same-day. **PA-1 + PA-9 are CLOSED** (the fold review's induction proof: no reachable event sequence lifts dikaiosyne above min(weakest demonstrated met proximity, +1 per event); S1 battery 97/0 incl. the exact two-write audit scenario). **PA-3, PA-4, PA-7, PA-8 are FOLDED + pinned** (no longer carried). **C-3 folded** (docstring corrected; no rebuild built — the ledger replay remains the by-hand repair path). The register now carries: **PA-5**, **PA-6** (the §8 envelope narrowing), the **A7-dead-code note**, **F-1**, plus two NEW items from the fold's adversarial review (both LOW, neither blocks the flip): **PA-10 — stale-artifact replay**: an old genuinely-earned signed met assessment re-submitted inside superset writes sustains dikaiosyne AT (never above) its once-demonstrated proximity indefinitely — defeating A3 decay and latch freshness, though never the PA-1 cap (`verifyLayer2Signature` has no artifact-age bound; the trust event's `occurredAt` is the write time; closure candidates: an artifact-age bound in the deriver, or the mentor-A5 Recency confidence tier when S2's weighting is wired into the fold); and **PA-11 — the PA-4 latch set/clear asymmetry** (disclosed in the deriver comment): an ungated `indeterminate` on an oddly-tagged extraction can SET the read-cap latch while a met under the same tagging cannot CLEAR it — the safe direction (trust reads lower), watched in the S9 instrument-fidelity batteries, an S2/S9 refinement candidate.

---

*End of report. Decision record: `D-TRUST-LAYER-PREACTIVATION-SAFETY-AUDIT` (operations/decision-log.md, 2026-07-11).*
