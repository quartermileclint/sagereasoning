# Scope — Q2 positive routing (phronesis/sophrosyne for a circle-1-only action)

**Status:** scoping only — no code written. Blocks the `SUBSTRATE_AGENT_CIRCLES_ENABLED` flag per the 2026-08-02 mentor ruling (`operations/agent-circles-2026-08/2026-08-02-mentor-consultation-pr19-five-fidelity-questions-verbatim.md`, Q2). Companion to the C0/C1a/C1b/C1d/C1f/C3 build (`operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md`).

## What it does

When C1a's narrowed first-circle extraction leaves a purely self-regarding action with **no oikeiosis circle at all**, the assessment must not go unrouted. The mentor: *"A self-regarding action with no justice surface still has a virtue surface — it has moved to the right one."* The fix positively adds `phronesis` and `sophrosyne` to `virtue_domains_engaged` for that action — the two domains a first-circle-implicating decision genuinely engages (phronesis: accurate judgement about what is genuinely good/bad/indifferent; sophrosyne: the discipline of assent) — replacing the dikaiosyne engagement that C1a's narrowing correctly removed.

**This does not touch `katorthoma_proximity`, `proximity_floors`, or any gate verdict.** It is a classification/engagement-list change only, on the same non-enforcing surface C1b's `reasoning_integrity` reading already occupies (BD-3). Confirmed by direct grep: `guardrail-sandwich.ts`'s `deriveGuardrailVerdict` never reads `virtue_domains_engaged` — the field has zero reach into the live gate's decision. This keeps the routing outside mentor L4's category-error concern (enforcement against the agent's own assent) by construction, the same way BD-3 already keeps C1b out of it.

## Where it lives

`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, alongside the existing pure floor/domain functions (`computeDikaiosyneFloor` at line ~1564, `computeVirtueDomains` at line ~1854).

A new small pure function, e.g. `applyFirstCircleRouting(virtueDomains, engaged): VirtueDomain[]`, called from `applyMechanisms` immediately after the existing line:

```
const virtueDomains = computeVirtueDomains(pd, cf, oik, kathekon, va)
```

and before `virtueDomains` is threaded into `detectIntakeClarifications` and the assembled `Layer2Assessment`. It reads:

- `oik.relevant_circles` (already computed at that point in `applyMechanisms`)
- `hasNaturalRelationship` — the same `kathekonFactors.some(f => f.factor_type === 'natural_relationship')` test `computeDikaiosyneFloor` and `computeProximity` already compute independently at two call sites; worth exporting or hoisting into one shared helper rather than a third independent re-derivation
- the `agentCircles` flag, already resolved once at the top of `applyMechanisms` (`const agentCircles = options?.agentCircles ?? isAgentCirclesEnabled()`)

It writes: appends `'phronesis'` and `'sophrosyne'` to the `virtueDomains` array if not already present (idempotent — `computeVirtueDomains` may already have pushed `phronesis` via its own unrelated trigger, e.g. `va.indifferents_at_stake.length >= 1`), preserving the module's existing stable order convention (`phronesis, dikaiosyne, andreia, sophrosyne`).

## Trigger condition — the one place this needs to coordinate with Q4

The literal trigger per the mentor's language is "no circle at all is present." Today that is `oik.relevant_circles.length === 0 && !hasNaturalRelationship` — the exact condition under which `computeDikaiosyneFloor` returns `null` (not engaged).

**If Q4's remediation (see the companion Q4 scope doc) ships first or alongside**, `computeDikaiosyneFloor`'s engagement test narrows to exclude `self_preservation` from counting as "a circle" for dikaiosyne purposes — so a schema carrying *only* a `self_preservation` circle would also read as "not engaged" post-Q4, and per Q4's own reasoning that residual self-only case belongs here (phronesis/sophrosyne), not on the dikaiosyne floor. **This routing function's trigger condition should therefore be written against whatever `computeDikaiosyneFloor` actually treats as "not engaged," not re-derived independently** — otherwise the two functions can silently drift (e.g., Q4 narrows the floor's engagement test but this routing function keeps checking raw `circles.length === 0`, missing the self-only case Q4 was built to redirect). The clean way to keep them locked together: have `computeDikaiosyneFloor` (or a small shared predicate both functions call) expose its own engagement boolean, and have this routing function trigger on `!dikaiosyneEngaged`, not on a hand-rolled restatement of the same test.

This is not a blocker to scoping Q2 independently — the mentor rules the two as separate scoped sessions — but a build session for either should re-read the other's current state before writing the trigger condition, and the PR19-style review for whichever ships second should explicitly check this composability.

## What it does NOT do

- Does not feed `computeProximity`, any `proximity_floors` entry, or `katorthoma_proximity`.
- Does not create a new Layer-1 extraction field. No prompt change. The trigger is derivable entirely from signals `applyMechanisms` already has in hand.
- Does not reuse or depend on C1b's `reasoning_integrity_signals` — that field is optional and narrative-dependent (a task-pressure-assent conjunction), and would be absent for the ordinary, undramatic self-regarding case the mentor's own example names ("reorganize my own task queue for the afternoon"). The routing must fire on the *absence of a circle*, not on the presence of a narrative signal.
- Does not change `virtue_domains_engaged`'s meaning for any action that already carries a circle or a passion/value-error trigger — additive only, on the specific empty case.

## Open design choice, with a recommendation

**Should the routing be unconditional (both domains, every time, whenever no circle is present) or discriminated (e.g., mirror C1b's conjunction and only fire when some further evidence is present)?**

Recommend **unconditional**. The mentor's language names no further gate: *"These domains do not stop being relevant because dikaiosyne has stepped back."* A discriminated version would risk reproducing the exact "unrouted" gap the ruling exists to close — an ordinary, non-narrative self-regarding action (the mentor's own example) would fail any narrative-conjunction test and stay unrouted, which is precisely what Q2 forbids. The flag gate (`agentCircles`) is the only gate; once the flag is on and no circle is present, the routing fires.

**Should this be gated on `agentCircles` alone, or also require `dikaiosyneWeighting`?**

Recommend `agentCircles` alone, but note the practical coupling: `dikaiosyneWeighting` is already `true` in production (live since 2026-06-25), so in practice both are on together for any live consult once `agentCircles` flips. Gating strictly on `agentCircles` (matching the whole-C1a-switch convention from BD-6/BD-7) keeps the flag-off byte-identity guarantee simple and single-surfaced: unset `SUBSTRATE_AGENT_CIRCLES_ENABLED` and this routing — like the rest of C1a — disappears, full stop, independent of any other flag's state.

## Test / battery strategy

- A new pure-function unit test (or a new section in `reasoning-integrity.test.ts` if the function is co-located conceptually with C1b) pinning:
  - flag-off byte-identity: `virtueDomains` identical with and without the routing call for a zero-circle schema.
  - flag-on, zero circles, no natural relationship: `virtueDomains` includes both `phronesis` and `sophrosyne`, in the existing stable order, with no duplicate entries when either was already present via an unrelated trigger.
  - flag-on, ≥1 circle present (any status): routing does **not** fire — the existing `computeVirtueDomains` behaviour is untouched.
  - a mutation test removing the routing call, confirming the new pins go red (non-vacuity).
- Extend the existing `reasoning-integrity.test.ts` §13-style proximity-invariance pin (or add an equivalent) to assert `katorthoma_proximity` is byte-identical with and without the routing on a matched fixture pair — the direct check that this stays outside L4's category-error boundary.
- Re-run the existing guardrail verdict-equivalence battery (`scripts/guardrail-verdict-equivalence-battery.ts`) and the LOCUS-2 battery (`scripts/locus2-sandwich-battery.ts`) post-build as a corroborating check that no fixture's `proceed`/`recommendation` moved — expected to be a clean no-op given `deriveGuardrailVerdict` never reads `virtue_domains_engaged`, but worth confirming rather than assuming.
- Consider adding one dedicated fixture to `first-circle-calibration-probe.ts` (or a sibling script) that is a genuinely circle-free, natural-relationship-free self-regarding action, and asserting `virtue_domains_engaged` contains both `phronesis` and `sophrosyne` post-build — the positive demonstration the 2026-08-01 close's §8 caveat already named as missing for the lenience-direction question generally.
