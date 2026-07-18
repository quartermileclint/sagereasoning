# Next-Session Prompt — AE-2: the CI-4 loop fold (wire `combineVerificationResults`; kathekon-engagement-classified; MEASURE-only)

**Stream:** founder (agent-extension).
**Tier:** **`code-elevated`** — repo-only, dark, flag-gated, additive, MEASURE-only, **no schema** (per ADR-014 §7). If the fold surfaces a new flag-gated projection on `/api/reason`'s public response (as AE-1's delta did), that projection's env-flag activation is its **own founder-walked `code-critical` arm** authored + carried at close — **nothing about a public-shape change is pre-approved here.**
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor closes:** `operations/handoffs/founder/2026-07-18-agent-extension-AE1-activation-CLOSE.md` (AE-1 LIVE) + `…-AE1-delta-layer-CLOSE.md` (the build).
**Predecessor decision-log entries:** `D-AGENT-EXTENSION-AE1-ACTIVATION-LIVE-2026-07-18`, `D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18`.
**Binding design:** ADR-014 (`adopted/adr/2026-07-18-agent-practice-trajectory.md`) §3.2 (item 2), §6 (sequencing), §7 (AE-2 slice). ADR-013 §8 (the honest-claims envelope). **The ADR is binding; where it and this prompt differ, the ADR wins.**

## Session-open pre-conditions (STOP if unmet)

1. **AE-1 must be landed + LIVE.** Verify first-hand: `git log` shows the AE-1 build (`933faf7`) + the AE-1 activation commit on `origin/main`; `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` is set in Vercel Production. If not, STOP as mis-sequenced.
2. **The shared identity module exists:** `website/src/lib/substrate/longitudinal-identity.ts` (AE-1). AE-2 **routes through it, never re-derives identity** (the cross-tenant guard + rotation disclosure are load-bearing — pin them).
3. Read ADR-014 §3.2 and §6–§7 in full before any code.

## What AE-2 is (ADR-014 §3.2, §7)

Wire the **already-built, dark, zero-caller** `combineVerificationResults` (`website/src/lib/substrate/trust-core/combiner.ts:484-573`) into a **read path** so the CI-4 signed-loop history folds into the agent's longitudinal record — **reusing the live lib, never re-implementing** (PR15). `combineVerificationResults` already does: within-session supersession + open-loop verdicts per **(session, domain)** reusing the live `analyseLoopClosure`; cross-session weighted recency (6-month half-life); **conflict ⇒ pause with the conservative MIN, never an average.** AE-2 classifies each folded loop by **kathekon engagement** (reuse the canonical predicate `website/src/lib/substrate/trust-core/kathekon-engagement.ts` — `assessKathekonEngagement`/`classifyObservation`; the exact shared function the S11 gate binds on — **reuse, do not fork**), and carries the **instrument-calibration-vs-character split** as a first-class honesty guard.

### The binding honesty constraint (ADR-014 §6, the critic's adopted finding)
A longitudinal baseline computed across an extraction-regime change **bakes the starved regime in**, so a later extraction fix reads as *agent improvement* — **instrument change certified as character change.** AE-2 must **inherit AE-1's regime split** (never fold loops across the settled S11b boundary; earlier-era + boundary-day loops excluded + counted) and must **name, on the output, when a shift is attributable to instrument calibration vs the agent's disposition** (or refuse the attribution). Evidence-floored throughout (the R13 generalisation — `insufficient_extraction` + `*_basis`, never a defaulted `stable`, never certified `advanced`).

### Envelope scope (ADR-014 §3.2, ADR-013 §8 — hard boundary)
**Signed CI-4 loops ONLY.** The unsigned V3 `deliberation_chains_v3` half **never enters** the "signed, reproducible examination artifacts" claim — the S10-narrowed §8 envelope carries exactly one disclosed exception (reflect) and **must not silently gain a second.** Any public/record wording restates: **evaluative-never-predictive, record-descriptive, MEASURE-only, weights-tier BLOCKED.**

## Explicitly OUT of scope (deferred to the A8 design review — name as inputs, do NOT build)
- The `deliberation_chains_v3` longitudinal half (sage-iterate runs the unsigned V3 prose engine; A8-migration-blocked).
- The **CarriedProfile duplicate** (`sage-assent-iteration-patterns.ts`, `sage-assent-wrapper.ts`) — a second, independent unwired chain→profile implementation. **Two chain→profile implementations must not both wire.** The A8 review reconciles or retires it; AE-2 must not entrench it.
- Any schema change; the reflect projection (still gated on reflect-store owner-scoping — ships NOTHING); AE-3.

## Build posture
- Dark + flag-gated + additive; flag-off byte-identical (battery-asserted), the engine assessment untouched (read-and-describe).
- Reuse: the AE-1 identity module, `combineVerificationResults`, `analyseLoopClosure`, `kathekon-engagement.ts`, the AE-1 regime-split + evidence-floor machinery in `trajectory-delta.ts` where applicable. **Grep for the live producer before adding any field.**
- Adversarial review (Workflow → per-finding verify; if it dies on a spend/session limit, complete FIRST-HAND per the §4 precedent and disclose the single-perspective limit).
- Batteries green + `tsc` 0 + `npm run build` ✓ before close.

## Recommended precursor (optional; founder's call) — refresh the s9-loop harness credential
The gen-2 **s9-loop consult token in `.claude/settings.local.json` is STALE** (found at the AE-1 activation — the founder-loop harness is running **unframed**; the credential row `33bef3d4…` is `is_active=true` but the token no longer hashes to it). Refreshing/rotating it (its own `code-critical`, founder-walked step — it touches the S11a-cap-review-tracked s9-loop credential; do **not** split the identity to `@v2` without deciding the cap review) would let the dogfood (PR16) actually measure the AE-2 build. Optional — AE-2 builds fine unframed — but recommended if you want live dogfood observation of AE-2.

## Records at close
Decision-log entry + close per the cache; CLAUDE.md production-state refresh (PR18). If a `code-critical` activation arm results, author + carry its own NEXT-SESSION prompt (AE-1's pattern).

## Out of scope for the whole arc
Any change to the S11 refusal (**ENFORCE remains S11; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's**). RA-1-F1 (human `/api/reflect`), the registry follow-up, and the Layer-1 mention-conversion re-check remain independent/parallel — the founder slots them anywhere. **AE-3 is last.**

End of prompt.
