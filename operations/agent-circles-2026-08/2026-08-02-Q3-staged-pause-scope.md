# Scope — Q3 circle-4 staged-pause tier

**Status:** scoping only — no code written. **Mentor-confirmed as a hard build prerequisite, not a deployment-time judgement call**: the flag should not be settable, technically or by policy, until this exists (2026-08-02 verbatim ruling, Q3). Companion to the C0/C1a/C1b/C1d/C1f/C3 build (`operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md`).

## The problem, precisely

C3 teaches the Layer-1 extractor to attach a `cosmopolis` circle (the fourth, outermost oikeiosis circle — "other reasoning agents") with `obligation_assessment.status: 'violated'` when an agent's output will corrupt another agent's examination. That reading flows through the **exact same, unmodified** code path every other circle uses:

`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, `computeDikaiosyneFloor` (line ~1564) → `obligationToProximity` (line ~1543) → a `violated` status resolves to `'reflexive'` unconditionally → `weakestProximity` folds it into `katorthoma_proximity`. At `/api/guardrail`'s live default threshold (`deliberate`), `reflexive` is two ranks below threshold, and `getV3Recommendation` (`website/src/lib/guardrails.ts:97-108`) returns `'do_not_proceed'` — not `'pause_for_review'` — for anything two or more ranks below threshold. There is currently **no code distinction between circle-4 and circles 1–3** anywhere in this chain; `cosmopolis` is just another string in the `OikeiosisCircle` union.

The mentor's L3 ruling: LLM extraction confidence at this level does not meet the zero-false-positive standard a deny requires, because a deny is irreversible. Circle-4 must "enter the staged pause tier first," accumulate evidence, and "earn promotion to the deny class through demonstrated false-positive performance." Flag-gating (BD-7) defers *when* this class can fire, but the moment it does fire, it is the identical hard-deny class L3 forbids — gating is not staging.

## Where "staged pause" already exists — reuse, don't invent

The harness's enforcement point (`harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs`) already implements a genuine three-way distinction, confirmed by direct read:

- line 447: `if (r.recommendation === "do_not_proceed")` → hard block (`permissionDecision: "deny"`).
- line 459: `if (r.recommendation !== "proceed")` → **allow**, with a caution note injected (`GUARD-CAUTION`, not a block).

So `recommendation: 'pause_for_review'` is **not cosmetic** — it already produces exactly the operational behaviour the mentor's ruling wants (pause = surfaced-but-not-blocking) versus `'do_not_proceed'` (hard block). The staged-pause tier does not need a new verdict vocabulary or a new field on the response shape. It needs the gate to stop *choosing* `do_not_proceed` for a circle-4-isolated violation.

There is also a direct, already-shipped precedent for exactly this shape of fix: `deriveGuardrailVerdict` (`website/src/lib/guardrail-sandwich.ts:233-282`) already carries a port-layer override — the **SD-1 kathekon floor** (lines 258–263) — that reads the deterministic `Layer2Assessment` after `computeProximity` has run and adjusts `recommendation` (never `computeProximity` itself) for a specific, named, disclosed reason. Q3's mechanism is the same shape, applied in the opposite direction (softening a would-be-deny rather than hardening a would-be-proceed).

## The mechanism (recommended shape)

In `deriveGuardrailVerdict`, after the existing `meetsThreshold`/`getV3Recommendation` call and before the SD-1 kathekon-floor block:

1. Detect whether `cosmopolis` is a violated circle **in isolation** — i.e., whether excluding `cosmopolis` from the fold, the remaining circles would *not themselves* floor to `reflexive`-and-below-threshold. This matters because if `household` (say) is *also* violated, that is an ordinary circle-1–3 deny and staging must not soften it — L3's concern is specifically about circle-4 extraction confidence, not the other three.
   ```
   const cosmopolisViolated = assessment.oikeiosis.relevant_circles.some(
     c => c.circle === 'cosmopolis' && c.obligation_assessment?.status === 'violated'
   )
   const others = assessment.oikeiosis.relevant_circles.filter(c => c.circle !== 'cosmopolis')
   const othersFloorReflexive = others.length > 0 &&
     weakestProximity(others.map(c => obligationToProximity(c.obligation_assessment ?? null))) === 'reflexive'
   const circle4IsolatedFloor = cosmopolisViolated && !othersFloorReflexive
   ```
   `weakestProximity`, `obligationToProximity`, and `PROXIMITY_RANK` are currently **not exported** from `layer2-mechanisms.ts` (confirmed by grep). A build session must either export them for reuse (keeps this DRY against the shared engine, but widens that module's public surface — a Critical-tier file) or re-derive a small local equivalent inside `guardrail-sandwich.ts` (duplication, but zero touch to the shared engine's exports). Recommend exporting — the duplication risk of re-deriving `obligationToProximity`'s J1/J2/J3 logic a second time, in a second file, and having the two silently drift, is worse than a slightly wider export list on an already-reviewed pure function.
2. When `circle4IsolatedFloor` is true, override `recommendation` away from `'do_not_proceed'` to `'pause_for_review'` — **never `'proceed'` or `'proceed_with_caution'`**, since a pause is not a clean pass. Leave `proceed` as `meetsThreshold` naturally computed (`false`, since `reflexive` is below every non-`reflexive` threshold) — mirroring the SD-1 precedent, which also keeps `proceed: false` while only softening `recommendation`.
3. `katorthoma_proximity` itself is **not** repainted — it stays the honest `reflexive` read, since that field is shared with `/api/reason`'s public profile and other consumers, and the mentor's ruling is about the *gate's disposition*, not about mis-stating the underlying proximity assessment.

This is additive, port-layer-only (identical footprint to SD-1), and does not touch `computeProximity` or the shared `/api/reason` determinism.

## What it does NOT do

- Does not change any circle 1–3 behaviour, or any case where a non-cosmopolis circle independently floors to reflexive.
- Does not add a new response field or new recommendation value — reuses `pause_for_review`, already load-bearing at the harness's enforcement point.
- Does not (in the recommended near-term shape below) build a new persistence layer, promotion algorithm, or scoring mechanism.

## The genuinely open design question — evidence accumulation and promotion

The mentor's language ("accumulates evidence, and earns promotion to the deny class through demonstrated false-positive performance") names a *process*, not a specific mechanism. Two real options, with a recommendation:

**Option A — stateless pause, manual promotion (recommended).** Every circle-4-isolated violation is *always* `pause_for_review`, indefinitely, until a human deliberately changes the code (removes or narrows the override). "Accumulating evidence" happens via the artifacts this project already produces for free on every consult: the signed `Layer2Assessment` (full circle + obligation detail, already durable), and the harness's own `honestLog` `GUARD-CAUTION` line. "Promotion" is a later, deliberate, founder-walked Critical-tier session — the same shape as every other MEASURE→ENFORCE transition this project has run (the Trust Layer S9→S11 observation-period pattern is the closest precedent: build the pause, let it run, review the accumulated cases by hand, then decide). No new schema, no new table, no automated counter. Lowest build cost, lowest new-mechanism risk, and consistent with this project's established convention of never auto-promoting a MEASURE-tier signal to an enforcement-tier one.

**Option B — stateful, automatically-promoting counter.** Persist per-fixture-class or per-credential circle-4-violation outcomes (confirmed true/false positive, presumably via human adjudication) and promote to deny automatically once some threshold of confirmed-true / zero-false is reached. This is architecturally closer to the Trust Layer S11 "false-hold observation instrument" (`agent_hold_observations`), but built specifically for this class and with an *automated* promotion rule the S11 instrument deliberately does not have (S11's own promotion — the ENFORCE flip — stayed a human decision, not an automatic one, on the mentor's own prior counsel). A materially larger build: new table, an adjudication surface (who confirms true/false positive, and how), a promotion algorithm with its own false-positive risk (a promotion rule can itself be gamed or miscalibrated).

**Recommendation: Option A for the build that unblocks the flag.** It satisfies the mentor's literal requirement (pause, not deny, at the flip) with the smallest, most reviewable surface, and defers the harder evidence-accumulation-and-promotion design to a later, separately-scoped decision once there is a live corpus of real circle-4 pauses to design against — designing a promotion algorithm today, against zero real cases, risks exactly the kind of "approximation that almost works" the mentor's cross-question observation names as this build arc's recurring failure mode.

## Sequencing / blast radius

Touches `guardrail-sandwich.ts` only (Critical-tier, live gate) plus, if the export route is taken, the export surface of `layer2-mechanisms.ts` (also Critical-tier, shared with `/api/reason`). No schema, no new flag beyond the existing `SUBSTRATE_AGENT_CIRCLES_ENABLED` this override should itself be gated behind (it only matters once C3's cosmopolis teaching is live, so it inherits the same flag rather than needing a second one). Its own PR19-style adversarial review before any flag flip, per the mentor's build-prerequisite framing.

## Test / battery strategy

- Unit tests on the isolation-detection helper: cosmopolis-violated-alone → pause; cosmopolis-violated + another circle also violated → deny (staging does not soften an independently-earned deny); cosmopolis-violated + another circle met/indeterminate (not reflexive) → pause (the other circle doesn't independently floor); no cosmopolis violation → untouched (`recommendation` computed exactly as today).
- A dedicated addition to `scripts/guardrail-verdict-equivalence-battery.ts` and/or `scripts/locus2-sandwich-battery.ts`: at minimum one fixture matching the C3 teaching's own anchor example (an agent-to-agent handoff with a knowingly material, undisclosed omission) confirming the flag-on verdict is `pause_for_review`/`proceed: false`, not `do_not_proceed`, and one fixture with an honestly-disclosed limitation confirming no violation is read at all (the protective control already named in the 2026-08-01 close's walk checklist item 6).
- Reuse the existing verdict-equivalence and LOCUS-2 battery infrastructure rather than a third bespoke script — both already run both-directions comparisons against real Sonnet extractions and are the established gate for this class of change.
