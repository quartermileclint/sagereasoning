# Scope — Q4 pre-existing self_preservation channel remediation

**Status:** scoped, and the one open sub-question this document originally surfaced (§ below, "The open sub-question") is now **RESOLVED — binding, verbatim wins**: `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md`. **This document is the actual unblocking deliverable for the `SUBSTRATE_AGENT_CIRCLES_ENABLED` flag** — the mentor's 2026-08-02 ruling (Q4) makes this specific scoping a named precondition for setting C1a live, distinct from and in addition to Q2's and Q3's *build* requirements. Companion to the C0/C1a/C1b/C1d/C1f/C3 build (`operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md`).

## The violation, precisely

`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, `computeDikaiosyneFloor` (line ~1564-1574), the **pre-existing** ADR-010 §4 mechanism, live in production since 2026-06-25 — this build did not create it:

```
function computeDikaiosyneFloor(circles, hasNaturalRelationship) {
  const engaged = circles.length >= 1 || hasNaturalRelationship
  if (!engaged) return null
  if (circles.length === 0) return 'reflexive'
  return weakestProximity(circles.map(c => obligationToProximity(c.obligation_assessment ?? null)))
}
```

This folds **every** circle in `oik.relevant_circles` into the dikaiosyne floor, with no distinction for `self_preservation`. Confirmed by direct read of the Layer-1 prompt (`layer1-extractor.ts:1727-1733`): the `obligation_assessment` instruction is generic to any circle — "extract it whenever the action AFFECTS this circle's members" — so a `self_preservation` circle extracted under C1a's narrowed first-circle rule (its three cases: task-pressure assent, disclosure-of-limits, confidence-representation — `layer1-extractor.ts:1636-1643`) **can** carry `obligation_assessment.status: 'violated'`. When it does, today's code floors `katorthoma_proximity` to `reflexive` via the *justice* domain, and the live `/api/guardrail` gate (pinning `dikaiosyneWeighting: true` unconditionally) can hard-deny on it.

That is enforcement against a purely self-regarding signal — the exact category error mentor ruling L4 names: *"the infrastructure has not restored the agent's reasoning integrity — it has bypassed it entirely."* C1b's `reasoning_integrity` reading was built specifically to read this class of signal *without* this consequence (BD-3: measure-only, never feeds `computeProximity`). The pre-existing channel already does what BD-3 exists to prevent, on the exact same class of decision, through a different field on the same schema.

**Why C1a makes this worse, not better:** before C1a, the extractor attached `self_preservation` to nearly every decision as background noise, so a self-only violation was one signal buried among many, diluted by whatever else the action also engaged. After C1a's narrowing, `self_preservation` is extracted *specifically and only* when one of the three genuine reasoning-integrity cases applies — so on the occasions it fires, it is now more likely to be the *sole* circle present, making it more likely to be the sole (and therefore decisive) input to `weakestProximity`'s fold. The mentor: *"C1a's narrowing makes this more urgent, not less."*

## Distinct from D4 — do not conflate

The standing register (`CLAUDE.md` / the 2026-08-01 close §7) already carries **D4**: `derive-trust-events.ts` still mints dikaiosyne justice *trust events* from self-only circles, contrary to the 2026-07-19 ruling. **Q4 is a different mechanism entirely** — the live `/api/reason`/`/api/guardrail` **proximity floor and verdict**, computed in `layer2-mechanisms.ts`. D4 is about the trust ledger (a measurement/history surface); Q4 is about the verdict itself (a decision surface, feeding the same gate C1a/C3 touch). They share a root cause (self-only circles being treated as justice-engaging) but are separately tracked, separately scoped, and — per the close doc — should be fixed as separate work items, likely by different mechanisms in different files.

## The already-adjudicated precedent to mirror

`website/src/lib/substrate/trust-core/kathekon-engagement.ts` (the 2026-07-19 self-circle narrowing, binding mentor record cited in that module's own header) already solved the identically-shaped problem for a different consumer of the same underlying fact ("is a self-only circle a justice surface?"). Its Arm 1 (line ~106-132) requires **at least one identified circle BEYOND `self_preservation`** before treating an action as justice-engaging, via an explicit `SELF_PRESERVATION_CIRCLE` constant and a `beyondSelfCircleCount` count — with a load-bearing preserved asymmetry (Arm 2, an OR): *"a violated obligation on the self circle alone still engages via Arm 2 (adverse justice evidence is never dropped, the conservative direction)."*

The narrow, mechanically obvious fix mirrors Arm 1 exactly, inside `computeDikaiosyneFloor`:

```
const beyondSelf = circles.filter(c => c.circle !== 'self_preservation')
const engaged = beyondSelf.length >= 1 || hasNaturalRelationship
if (!engaged) return null
if (beyondSelf.length === 0) return 'reflexive'  // hasNaturalRelationship-only, unidentified party
return weakestProximity(beyondSelf.map(c => obligationToProximity(c.obligation_assessment ?? null)))
```

A self_preservation-only violated obligation would then read `dik === null` (dikaiosyne not engaged) rather than `'reflexive'` — no floor, no possible gate deny from this channel. **This composes directly with Q2's positive-routing scope** (`2026-08-02-Q2-positive-routing-scope.md`): Q2's trigger condition is exactly "dikaiosyne not engaged, no circle at all" — a self-only-circle case narrowed away by this fix is precisely the case Q2 was built to route to phronesis/sophrosyne instead. **A build session for Q4 should therefore either land alongside Q2, or be written against whatever engagement predicate Q2's build settles on**, per the coordination note already flagged in the Q2 scope doc — building either independently without checking the other's current shape risks the two functions silently drifting on what "no circle" means.

## The open sub-question — RESOLVED, binding (2026-08-02)

Should the **Arm 2 asymmetry** (a self-only violated obligation still registers as *something*, even though dikaiosyne itself does not engage) carry over to the proximity floor the way it does in `kathekon-engagement.ts`'s trust-event predicate? Two readings were put to the mentor:

- **Reading 1 (mirror Arm 2 exactly):** a self-only violated obligation should still floor *something*, preserving "adverse evidence is never dropped" at the verdict layer.
- **Reading 2 (let Q2 absorb it entirely):** a self-only violated obligation is not a justice failure at all; Q2's routing is the complete replacement, with no proximity consequence whatsoever.

**Ruling: Reading 2. Verbatim record:** `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md`. The mentor's reasoning, in brief: the Arm-2 asymmetry was adjudicated for a trust-ledger surface governed by an epistemic principle ("never silently drop adverse evidence from the record"). `computeDikaiosyneFloor` is a verdict surface governed by a different principle ("the verdict must be grounded in the correct virtue domain for the failure being assessed"). A dikaiosyne floor on a self-only failure is not a conservative reading under that second principle — it is a misclassification, an inaccurate verdict claiming a failure of other-directedness where none is implicated, and that inaccuracy propagates into the live guardrail gate. The two surfaces' governing principles diverge; the answer correct for one is wrong for the other. **The narrowing below (mirroring `kathekon-engagement.ts`'s Arm 1 exactly, with no compensating branch) is confirmed correct as originally drafted — nothing in the code sketch changes as a result of this ruling.**

**One new item this ruling opens, named but explicitly NOT resolved by it, per the mentor's own instruction not to fold it in as a workaround:** whether `phronesis` and `sophrosyne` have their own proximity-assessment paths at all in the current engine — i.e., whether a failure classified into those domains (by Q2's routing, or otherwise) produces any `katorthoma_proximity` consequence through some mechanism of its own, or whether those domains today are purely descriptive (`virtue_domains_engaged`-only, per Q2's design). The mentor: *"If the build's current architecture has no proximity path for phronesis and sophrosyne failures, that is a separate gap to scope. It does not justify routing self-only failures through dikaiosyne to produce a proximity effect by the wrong mechanism."* **This is a new, distinct scoping item, not part of Q2/Q3/Q4 as originally framed, and not attempted by this document.**

## Blast radius

- **Files touched (build, not this session):** `layer2-mechanisms.ts` (`computeDikaiosyneFloor` — Critical tier, shared with `/api/reason`'s public profile and the live `/api/guardrail` gate). No schema, no new flag distinct from the existing dikaiosyne-weighting and agent-circles flags this already sits behind.
- **Live surfaces implicated:** `/api/reason` (the public accreditation/trajectory-facing proximity profile) and `/api/guardrail` (the live gate) — both already flagged Critical in the 2026-08-01 close's own risk classification, for the same reason (the shared Layer-1 prompt / Layer-2 engine).
- **Does NOT touch:** `kathekon-engagement.ts`, `derive-trust-events.ts` (D4's own file), `stoic-brain.ts`, or the logos boundary guard — none of those are in this remediation's path.
- **Not this build's fault, but this build's amplifier:** worth stating plainly in whatever session eventually builds this — the violation predates C1a by over a month; C1a's contribution is frequency, not origin.

## Rough sequencing estimate — UPDATED post-ruling

1. ~~A short mentor consultation on the open sub-question above~~ — **DONE, 2026-08-02.** See the resolved section above.
2. A `code-critical` build session (Critical tier — live gate + shared `/api/reason` determinism), most naturally run **alongside or immediately after** the Q2 build (they touch the same function and the same trigger predicate) rather than independently. Scope: the `computeDikaiosyneFloor` narrowing itself (now confirmed final-shape, no compensating branch needed), its own battery additions (mirroring `kathekon-engagement.test.ts`'s non-vacuous beyond-self pins), a re-run of the guardrail verdict-equivalence and LOCUS-2 batteries, and its own PR19-style adversarial review — the same standard every other change to this file has received this arc. **Still carried, not built.**
3. The mentor's Q4 bar for **this specific pre-existing-channel item** clears fully once step 2 lands and passes review. The bar for *unblocking the C1a flag specifically* was already lower and is satisfied by this document plus its now-resolved open question — nothing further is needed to discharge that specific gate.

**New, separately-scoped follow-up surfaced by the ruling (not gating C1a, not part of Q2/Q3/Q4):** scope whether `phronesis` and `sophrosyne` have their own proximity-assessment paths in `layer2-mechanisms.ts` today. Its own session.

## What this document does NOT resolve

No code was written or spiked. The exact composition with Q2's build (shared trigger predicate) is named as a coordination requirement, not resolved in either direction — both are still carried as builds. The new phronesis/sophrosyne-proximity-path question the ruling surfaced is named, not scoped.
