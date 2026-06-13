# Next-Session Prompt — Mechanism-Correction Build M5: practice-completion session (CI-4 reason-route half + CI-13 + CI-15)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; TEST Supabase for live verification; founder-performed steps walked live per PR17.
**Tier:** `code-elevated` (CI-4 reason-route response-shape + CI-13 response-shape/contract-default on Live routes) + `code-standard`/`governance` (CI-15 docs of adopted methodology). **Standing guards (unchanged):** any touch of auth surfaces, the R20a branch/distress classifier, the A5 wrapper, or zone logic reclassifies Critical; **CI-4's write-boundary half is already built (M3) — do NOT touch the R18f provenance gate or the loop-closure-gate module's enforcement logic; the reason-route half is additive consult-surface affordance only.** No production flag/config activation inside the build (each is its own 0c-ii step).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1 single-endpoint proof (CI-4 + CI-13 proven on `/api/reason`); PR2 same-session wire-verification; PR16 dogfood (this arc's own consults can exercise the loop + reflect).
**Predecessor close:** `operations/handoffs/founder/2026-06-13-mechanism-correction-M4-gate-quick-tier-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M4-GATE-QUICK-TIER-BUILT-TEST-VERIFIED-2026-06-13`, `D-MECHANISM-CORRECTION-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

This is where the **adopted methodology becomes shipped contract.** The P1 test found the practice's longitudinal disciplines present in design but absent on the agent's own surfaces: the reiterate→re-examine loop never engaged because nothing offered a re-score path (FX-8); Reflect was undiscoverable from the consult/close path (FX-9); and no developer surface taught the consultation cadence (FX-2). The mentor-confirmed Q3/Q4/Q1 verdicts (adopted 2026-06-12) make these **required**: re-examination after correction is mandatory at the original depth (CI-4); reflect-at-close is the agent default with explicit opt-out (CI-13); the two-gate cadence is published guidance (CI-15). M1's fast consults make the loop cheap enough to verify.

**Carried context from M4 (read the M4 close):** CI-16 (quick-tier value classification) was **deferred entirely** by founder election — the path-check found the gate (`runSageReason` LLM) does not inherit a deterministic sandwich-Layer-2 change; CI-16 awaits the gate-engine architecture decision (likely alongside a K-category gate→sandwich migration). It is **not** in M5. M4 shipped CI-8 (gate meta cost honesty, always-on) + CI-10 (gate loop metering, flag-gated) + the CI-9 diagnostic (cache-hit mechanism; founder-ack pending the replay).

## The approved queue (work top-down; this prompt scopes M5)

| # | Session | Items | Status |
|---|---|---|---|
| 1 | M1 — consult-path levers | CI-1 + CI-17, CI-2 + CI-3 | **Verified (TEST) 2026-06-13; production inert** |
| 2 | M2 — mint session | CI-6 + CI-7 | **Verified 2026-06-13** |
| 3 | M3 — accreditation session | CI-11 + CI-12 + CI-4 write-boundary half | **TEST-Verified 2026-06-13; production inert** |
| 4 | M4 — gate session | CI-8 + CI-9 + CI-10 (**CI-16 deferred**) | **TEST-Verified 2026-06-13; CI-8 always-on, CI-10 flag-gated, CI-9 diagnostic** |
| **→ 5** | **M5 — practice-completion (THIS PROMPT)** | **CI-4 reason-route half + CI-13 + CI-15** | Elevated |
| 6 | M6/M7 — trajectory persistence | CI-5 | Standard schema + Elevated |
| 7 | M8 — credential consolidation design | CI-14 (design only) | Standard |
| — | **CI-16 (deferred)** | quick-tier value classification | **Parked** — needs gate-engine decision; revisit with M6+ or a gate→sandwich migration |

**Independent of this queue (founder may elect any time, each its own 0c-ii step):** the M1 activation (six-item checklist); the M3 CI-11 migration + CI-4 flag activations; the M4 CI-10 flag activation (`SUBSTRATE_GATE_LOOP_METERING_ENABLED` + the surface-CHECK migration) and the CI-9 replay + acknowledgement.

## Pre-conditions

1. The M4 close commit pushed; Vercel green (M4 deploy is behaviourally inert except the always-on CI-8 gate-meta cost change — the gate's `meta.cost_usd` now reports the measured Anthropic cost / null on a cache hit, never the retired $0.0025; CI-10 flag UNSET).
2. `npx tsc --noEmit` passes at open.
3. TEST Supabase available (`.env.development.local`). For any TEST credential, mint via the CI-7 CLI (`website/scripts/mint-credential.ts`).
4. The AI does no git operations; founder commits by name at close.

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M4 close
3. Build-plan items **CI-4 + CI-13 + CI-15 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`) — note CI-4 is *reshaped per Q4*, CI-13 *per Q3*, CI-15 *content per Q1*
4. Fresh analysis **FX-8 (§3.4), FX-9 (§3.5), FX-2 (§3.1)**; dossier rows **B6, B7, B10** (all amended per the mentor verdicts); the mentor verdict record `operations/p1-rebuild-2026-06/2026-06-12-mentor-consultation-methodology-verdicts.md`
5. **Path-check discipline (carried — verify before citing):** the M3-built loop-closure write-boundary half lives at `website/src/app/api/accreditation/[agent_id]/loop-closure-gate.ts` (do NOT re-touch its enforcement; CI-4's reason-route half is a SEPARATE additive consult affordance); confirm the consult surface is `/api/reason` (`runSandwich`) and locate where a `prior_feedback` input + an `examination_open` response field would attach in `website/src/app/api/reason/route.ts` and the sandwich output composer; the Note-A `prior_feedback` vocabulary is in `canonical-framework.md:132`; the R5 "guard + score + iterate" framing is at `manifest.md:125`; the gate risk-class→depth map is `guardrail/route.ts` (~`:96-103`); confirm the published surfaces to edit for CI-13/CI-15 (`website/public/llms.txt`, the agent-card, api-docs, mcp-contracts, plugin + skill templates).
6. KG scan: KG1 (any new DB write — CI-4 reason-route half should be response-shape only, no new write unless a re-examination record is added — confirm); KG2/AC1 (CI-4 same-depth rule — the re-examination runs at the ORIGINAL depth, not quick-by-default — confirm the depth is carried, not defaulted); PR16 dogfood.

Confirm at open: tier; hold-point (0h HELD); status vocabulary; signals.

## Part B — Procedure

### Step 1 — CI-15: publish the two-gate cadence (docs; Standard) — do first, it frames the rest
Publish the **two-gate rule** in the developer integration surfaces (llms.txt / agent-card / api-docs / mcp-contract integration sections): Gate 1 — one mandatory full examination at task adoption (non-negotiable, sets the frame); Gate 2 — stake-triggered thereafter via the three-sub-question self-screen (*stake in how it lands / drawn to a conclusion before the evidence / would I reason differently unobserved*), any positive → examine at the appropriate depth; plus the **suppression signal** (a self-screen consistently negative across sessions of genuine complexity is itself a signal requiring examination — maps to Sage Reflect's FD-R1 null-suspicion); plus the existing R5 guard+score+iterate framing and the gate risk-class→depth mapping. **R18 honesty:** any latency/cost number quoted must use the M1/M3 measured envelopes (post-CI-3), not the retired figures. Q1's "depth calibrated to proximity as well as stake" is publishable as principle but its *operational* calibration presupposes a readable trajectory → name the CI-5 (M6) dependency, don't implement it here.

### Step 2 — CI-4 reason-route half: loop closure as a required sequence step (Elevated; PR1 on `/api/reason`)
The consult surface gains the re-examination affordance (the write-boundary enforcement half already shipped at M3):
(1) a `prior_feedback` input (Note-A vocabulary) carrying the prior loop id + the adopted correction;
(2) redirection-grade responses mark the examination **open** (a structural `examination_open: true` field) — a redirection is a new phantasia owed a new synkatathesis;
(3) the **same-depth rule**: a re-submission with `prior_feedback` runs at the ORIGINAL examination's depth tier, not quick-by-default (carry the depth; assert it);
(4) the response surfaces closure when a re-examination at the same depth is submitted (`examination_open: false` / a closure marker the M3 write-boundary can later read).
**Flag-gated** (unset = today's single-pass behaviour). **No new write on the reason route** unless a re-examination record is required — if it is, KG1 applies (awaited, no fire-and-forget). PR1: prove on `/api/reason`; **the stateless API cannot compel the return call — the credential is where the requirement bites (M3's gate), so verify the two halves compose** (an open chain from a reason-route redirection, closed by a same-depth re-submission, is what the M3 write-boundary flags when unclosed).

### Step 3 — CI-13: reflect as the default-on close step (Elevated; contract + response-shape)
(1) The **published integration contract** (docs/llms.txt/agent-card/plugin + skill templates) ships **reflect-at-close as the default flow** with an explicit named opt-out config key;
(2) consult and accreditation-write responses carry the structural practice-cycle field — `practice: { reflect_due: 'TR-02', endpoint: '/api/practice/reflect', default: 'auto', opt_out: '<config key>' }`;
(3) the opt-out documentation states the **metering cost** of an auto-fired reflect pass plainly (R5 — auto-fired calls bill; consent must be informed);
(4) **no server-side abbreviation path** — the Q1–Q6 reflect sequence ships whole or not at all (the substrate is stateless and cannot observe session close, so the default lives in the contract + the response hint, never as a shortened server sequence).
**Flag-gated** field; docs revert restores elective-close as the published default.

### Step 4 — Tests
Plain-assertion `tsx` per CLAUDE.md: CI-4 — `prior_feedback` accepted + `examination_open` marking + same-depth carry (flag-on) and byte-identity (flag-off); the two-halves composition (an open reason-route chain is what the M3 write-boundary flags). CI-13 — the `practice` field shape (flag-on) + byte-identity (flag-off). CI-15 — a docs-presence assertion (the two gates + three sub-questions + suppression signal present verbatim-faithful).

### Step 5 — Verify (PR2, founder-walked where environment-touching)
`npx tsc --noEmit`; tests; TEST live legs as elected: a consult → redirection (response marks open) → re-submit with `prior_feedback` at the same depth → closure visible; a consult response carries the `practice` reflect hint; a reflect call from the hint runs all six questions on a TEST credential; the docs render the two-gate rule + reflect-at-close default. Production untouched (flag activations are founder-elected 0c-ii steps).

### Step 6 — Close (lean) + decision log (lean) + PR18
Status changes as earned; production-state rewrite at close only; write the **M6 prompt** (trajectory persistence: CI-5 — the `evaluated_actions` migration + carried-context activation; may split schema→activation) per the queue.

## What is NOT in scope

CI-16 (deferred — gate-engine decision pending); any production flag/config activation (CI-4/CI-13 flags, the M1/M3/M4 activations — all founder-elected 0c-ii); the R18f provenance gate / the M3 loop-closure-gate enforcement logic (do not re-touch — CI-4's reason-route half is additive consult affordance); the R20a perimeter / distress classifier / A5 wrapper / zone logic / auth surfaces; CI-5 trajectory persistence (M6); the 0h call.

## Rollback

CI-15: docs revert. CI-4: flag-gated open/close marking + `prior_feedback` input (unset = today's single-pass) or `git revert`. CI-13: flag-gated `practice` field + docs revert (restores elective-close default) or `git revert`.

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads (incl. path-check + two-halves composition check) | 25–30 min |
| CI-15 two-gate docs | 30–40 min |
| CI-4 reason-route half (PR1 + two-halves verify) | 50–70 min |
| CI-13 reflect default + practice field | 40–55 min |
| Tests + TEST live legs (founder-walked) | 35–45 min |
| Close + M6 prompt | 25–30 min |
| **Total** | **~3.5–4.5 h** |

## Forecast

Success looks like: the developer surfaces teach the two-gate cadence honestly; a redirection on `/api/reason` marks the examination open and a same-depth re-submission closes it, composing with the M3 credential enforcement; reflect-at-close ships as the documented agent default with an informed-cost opt-out and a response-borne hint; all flag-gated, production inert; the M6 trajectory-persistence prompt ready. The adopted Q1/Q3/Q4 methodology then exists as shipped contract (activation a separate founder election), leaving CI-5 (longitudinal) and CI-14 (credential consolidation) — and the parked CI-16 — as the remaining arc.

End of prompt. Open on `main`; production untouched except by founder election; founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
