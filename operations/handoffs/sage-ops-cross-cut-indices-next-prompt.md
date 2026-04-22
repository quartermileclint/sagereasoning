# Next Session — After B2 Cross-Cut Indices

**Date written:** 22 April 2026 (end of B2 verification, Founder-confirmed)
**Read first:** `/operations/handoffs/sage-ops-cross-cut-indices-close.md`
**Previous prompt (for context):** `/operations/handoffs/sage-ops-live-data-wiring-prompt.md`

## Status Snapshot

B2 landed and is verified in production. The founder ran all four verification checks from the B2 close note and confirmed success on 22 April 2026:

* Architecture Map and Capability Inventory dashboards unchanged.
* Ops answered the paid-API blocker question with the specific 28-component list.
* Ops answered the flows-per-component question naming the 24 flows for `sage-reason-engine`.
* Ops answered the components-per-flow question with the 13-component list for `sage-reason`.

The Sage-Ops continuity loader now emits seven sources plus three computed cross-cut indices:

1. `capability_inventory.by_journey` — non-Ready components grouped by `journey`.
2. `flow_tracer.by_component` — reverse map from node id to flow keys.
3. `flow_tracer.items[].components` — deduplicated component list per flow.

The hub route (`website/src/app/api/founder/hub/route.ts`) was not edited. Consumers still read only `formatted_context`.

## What's Left

The B2 prompt listed four candidates. B2 executed the recommended one. The others remain available, plus two larger scope choices. The founder picks. The AI surfaces trade-offs and risks.

### Same-family candidates (extends the Option A / B pattern)

**C1. B3 — Blocker-field classification pass**
Scope: Today the loader reads `c.blocker || c.notes` as `blocker_or_notes`, but no component has a `blocker` field set — every entry uses `notes`. Some notes describe real launch blockers ("ARCHITECTURALLY ISOLATED. Zero imports from website/src"). Others describe non-blocking status ("Factory wrapper. Functional. First revenue candidate."). B3 adds an explicit `blocker` field only to components where the note is an actual blocker, leaving the rest with `notes` unchanged. The `by_journey` subsection then surfaces real blockers only, not every partial component's note.
Value: Medium. Turns the by-journey view from 65 items (everything non-Ready) to the subset that actually blocks launch.
Risk: Standard. Additive JSON field. Also requires a judgement pass — maybe one session with the founder at hand to classify borderline cases, or a first-pass proposal the founder reviews.
Prerequisite: None.

**C2. B4 — Flow-step descriptions surfacing, budget-bounded**
Scope: Each step in `flows.json` has an `id` and a `description`. Today Ops sees only the ids. B4 would expose step descriptions so Ops can answer "what actually happens in step N of flow X?" — but including all descriptions bloats context. Two shapes to choose from: (a) an on-demand helper that the Ops agent can call to expand one flow at a time (new pattern — more complex, needs design); (b) a compact default-on view that truncates each description to 60–80 characters per step (simpler — proven pattern, but more context volume).
Value: Medium. Deepens what Ops can say about any one flow.
Risk: Standard for option (b); Elevated for option (a) because it's a new pattern.
Prerequisite: A design call — (a) or (b), and what budget headroom Ops can absorb.

**C3. Journey classifications second pass**
Scope: The 65 `journey` values set in Option A were a single-pass classification from component id + type. A second pass with the founder's domain judgement could move some items between `both` and `paid_api` (and possibly a few from `free_tier` to `both`). No code change — just a registry edit. The new classifications flow through B2's `by_journey` automatically.
Value: Low-medium. Improves the precision of every paid-API / free-tier question Ops answers.
Risk: Standard (registry edit only).
Prerequisite: Founder available to adjudicate. Suggest proposing a list of candidate moves with reasoning, founder approves each.

### Larger-scope candidates (changes the trajectory)

**C4. 0h Hold-Point Assessment**
Scope: The project instructions (§0h) define the Hold Point as a structured assessment before P1: test every component on real founder data, catalogue capabilities honestly, identify gaps, demonstrate value per audience (human practitioner + agent developer), define the startup-preparation toolkit. P0 (§0a–§0g) is the "how we work" layer; 0h is the "what we actually have" gate. Once 0h is complete, P1 (business plan review completion) becomes evidence-based.
Value: High. This is the gate that the project instructions explicitly name as the condition for moving from P0 to P1.
Risk: Standard per session — but 0h is multi-session. Expect several sessions, not one.
Prerequisite: None that the close notes reveal. The founder decides when to begin.

**C5. Move to a different build priority**
Scope: If the founder considers P0 + 0h complete (or deferred), the project instructions' priority ordering becomes the guide. P1 is business plan review completion. P2 is ethical safeguards (R17, R19, R20) — critical before any broader deployment. The project instructions mark P2 items as "not optional."
Value: Depends on priority chosen.
Risk: Depends. Many P2 items are classified Critical under 0d-ii (anything touching safety-critical surfaces invokes PR6 and the Critical Change Protocol).
Prerequisite: Founder confirms P0 / 0h posture before the session begins.

## Recommended Default

If the founder wants one small, self-contained next session: **C1 (B3 — blocker-field classification)**. It's the natural pair to B2, finishes the item the B2 prompt flagged as "pairs well with B2", is Standard risk, and improves the signal-to-noise on every Ops launch-readiness answer.

If the founder wants to move toward P1: **C4 (Hold-Point assessment)** is the gate the project instructions define for that transition.

If something breaks in production that the verification checks missed: drop the menu and diagnose. Report back.

## Standing Instructions (carried forward)

These are unchanged from the B2 prompt. They apply to every session from here.

1. **Single-endpoint proof first (PR1).** Any new pattern proves on one endpoint before rollout.
2. **Same-session verification (PR2).** A function that exists but is never called is worse than one that doesn't exist. Grep for invocation, not definition.
3. **Risk classification before execution (0d-ii).** State the risk level plainly. Standard = additive, non-safety. Elevated = changes existing user-facing surface, include rollback step. Critical = auth / session / safety classifier / deployment config, full Critical Change Protocol applies.
4. **Backups first.** Any file edit gets a `.backup-YYYY-MM-DD` copy before the write. List backup paths in the close note.
5. **TypeScript check must be clean.** `cd website && npx --no-install tsc --noEmit -p tsconfig.json` — expect zero output.
6. **Session close note mandatory.** Template from existing close notes in `/operations/handoffs/`.
7. **Do not edit governance documents without explicit approval.** Manifest, project instructions, decision log, adopted strategies. Flag the need; draft in chat; wait for approval.
8. **Respect working pace.** When the founder says "proceed" or "done", move forward. When the founder signals end of session, stabilise to known-good and close — no additional fixes.

## Context the New Session Will Need

Before any option starts:

* **Loader file to edit:** `website/src/lib/context/ops-continuity-state.ts` (37 KB after B2).
* **Backups parked in place:** `.backup-2026-04-21` (Option A) and `.backup-2026-04-21-b2` (B2) both alongside the live file.
* **Registry:** `website/public/component-registry.json` — 163 components, 65 non-Ready, all with `journey` field.
* **Flows:** `website/public/flows.json` — 96 nodes, 39 flows.
* **Route:** `website/src/app/api/founder/hub/route.ts:213` invokes `getOpsContinuityState()`, line 270 reads only `.formatted_context`. Do not edit this file unless the chosen option requires it.
* **Archive folder for tmp scripts:** `/archive/2026-04-21-option-a-tmp-scripts/` — any new one-off verification probes can join here at session close.
* **Decision log gap:** B2 decisions are not yet in `operations/decision-log.md`; they live only in the B2 close note. The next session should offer to draft the entries for founder approval at session open (do not edit without it).

## Open Questions for the Founder

1. **Which next-session scope: C1 (B3) / C2 (B4) / C3 (journey pass) / C4 (0h hold point) / C5 (move to P1+)?** The recommended default is C1 for a bounded session, C4 for trajectory.
2. **Decision-log entries for B2 — draft them now for your approval?** The entries would cover the indices-on-sections architectural choice, the journey render-order choice, and the scope boundary that ruled out B1 / B4 this round.
3. **For C4 only:** is 0h a one-session scope or a multi-session scope this time? The project instructions frame it as multi-session.
4. **For C2 only:** budget headroom for the Ops `formatted_context` — comfortable at today's ~53 KB, or prefer to trim before adding more?

## Signals to Use

Unchanged from the B2 prompt.

Founder to AI: *"C1"*, *"C1 but only the classification, not the loader change"*, *"skip the menu, do X instead"*, *"treat this as critical"*, *"I'm done for now"*.

AI to founder: *"I'm confident"*, *"I'm making an assumption"*, *"I need your input"*, *"I'd push back on this"*, *"This is a limitation"*, *"This change has a known risk"*, *"I caused this"*.

## One-Line Summary

B2 is verified live; next session chooses between finishing the pair (C1 / B3), extending the pattern further (C2 / B4), polishing the journey classifications (C3), or moving to the hold-point assessment (C4) / next build priority (C5) — founder picks scope at session open.
