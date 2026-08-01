# Next-Session Prompt — Scope the three mentor-confirmed build prerequisites (agent-circles C1)

**Paste this whole file as the FIRST message of a new session.**

**Target model: `claude-sonnet-5`, effort `medium`.** State this at the start of your reply (model + effort), one sentence.

**This is a SCOPING session, not a build session.** The deliverable is three design/scope documents (or as many as time allows, carrying the rest honestly), not code. Do not write or edit any implementation code this session — the three items below all touch Critical-tier shared engine code (`computeProximity`/`applyMechanisms`, the live `/api/guardrail` gate), and this project's own established convention is plan-then-build for exactly that tier: a scoping session produces a reviewable design; a later, separately-scoped Critical session builds it. Do not skip the plan step to save time.

---

## Context (read these two files in full before starting — do not re-derive from anywhere else)

1. `operations/agent-circles-2026-08/2026-08-02-mentor-consultation-pr19-five-fidelity-questions-verbatim.md` — the binding mentor ruling this session scopes. Verbatim wins over any summary, including the one below.
2. `operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md` — the full build record. Read at minimum §4c (the mentor consultation, with the ruling's practical consequences already worked through), §5 step -1 (the three blocking items as currently named), and §7 Carried (where they're listed distinctly from the unrelated D4 item — do not conflate Q4 with D4, they are different mechanisms in different files).

**Do not re-read the full agent-circles build plan, the earlier verbatim mentor records (Q1–Q9, L1–L4), or the PR19 raw journal** unless one of the three scoping tasks below specifically requires citing something from them — the two files above already extract everything you need.

**Build status:** committed on `main` at `ee6c3f8` ("C1e calibration probe run (both legs, clean) + stale-doc reconciliation"), on top of `dec9ead` ("PR19 exhaustive resolution + mentor ruling on five fidelity questions"), on top of `cfc3d7c` (the original build). Both `dec9ead` and the commit before it are pushed as of this prompt's authoring; `ee6c3f8` is not yet pushed — the founder pushes via GitHub Desktop on their own schedule, do not assume push state, check `git log`/`git status` fresh at session start regardless of what this line says. `SUBSTRATE_AGENT_CIRCLES_ENABLED` is unset everywhere; nothing from this arc is live. **Not relevant to this session's task, but for orientation:** `ee6c3f8` also ran C1e's calibration probe (clean, both legs — see the close doc §4d if curious) and cleared C2's gate condition; C2 itself is still not started and is not part of this session's scope either.

## The three items to scope

For each, produce a short design document (a few hundred words is fine if the design is genuinely simple; go longer only where the design has real decisions to make) covering: what the mechanism does, where it lives (which file(s), new or existing), what it reads and what it returns, how it interacts with the existing flag-gating (`isAgentCirclesEnabled()`, `SUBSTRATE_AGENT_CIRCLES_ENABLED`), what test/battery strategy would verify it, and — critically — what it does NOT do (the boundary of scope, so a later build session doesn't quietly grow it). Where the mentor's ruling leaves a genuine design choice open, name the choice explicitly and either make a reasoned recommendation or flag it as a founder decision — do not silently pick one without saying so.

### 1. Q2 — positive routing for a circle-1-only action

The mentor ruled: when C1a's narrowing leaves a purely self-regarding action with no circle at all, the assessment must not go unrouted — it must route positively to phronesis and sophrosyne, the domains a first-circle-implicating decision genuinely engages. Scope: where in `computeProximity`/`applyMechanisms` (`website/src/lib/translation-sandwich/layer2-mechanisms.ts`) would this routing attach; what triggers it (the absence of any oikeiosis circle, specifically, or some other condition — check against the mentor's exact wording); whether it produces a NEW field, a NEW domain engagement, or modifies an EXISTING one; whether it can ever raise `katorthoma_proximity` (mentor L4's category-error concern about first-circle enforcement means this needs care — a positive routing that accidentally becomes a floor or ceiling on proximity would repeat the exact mistake C1b's `reasoning_integrity` field was built to avoid, per BD-3). Read `reasoning-integrity.ts` first — C1b already built a measure-only, non-enforcing first-circle read; Q2's routing is different in kind (it must actually feed the assessment's domain engagement, not stay purely observational) but should learn from how C1b kept itself out of the proximity computation.

### 2. Q3 — the circle-4 staged-pause tier

The mentor ruled this is a build prerequisite, not a deployment-time judgement call: circle-4 (cosmopolis) must pause and accumulate evidence rather than immediately deny, earning promotion to the deny class only through demonstrated false-positive performance. Scope: what "staged pause" concretely means as a code mechanism on `/api/guardrail` (a new intermediate verdict state distinct from today's binary proceed/deny? a required N-occurrences-before-deny counter, and if so, counted where — per credential? per fixture pattern? something else?); how "demonstrated false-positive performance" would actually be measured and by what mechanism it promotes a class from pause to deny; whether this needs new persistent state (a new table/column) or can be computed statelessly from existing signed-assessment history; how it interacts with C3's existing prompt teaching (`layer1-extractor.ts`) and the existing kathekon floor / dikaiosyne floor logic in `layer2-mechanisms.ts`. This is likely the largest and most architecturally open of the three — say so if the design genuinely has multiple reasonable shapes, and lay out the tradeoffs rather than picking one silently.

### 3. Q4 — scoping (not building) the pre-existing-channel remediation

The mentor's bar for THIS item is explicitly lower than the other two: "at minimum, scoped and scheduled" unblocks the C1a flag specifically, not a full build. The violating mechanism: `oikeiosis_circles_engaged`'s self-circle `obligation_assessment` (ADR-010 §4, live since 2026-06-25) already lets a first-circle-only signal floor `katorthoma_proximity` and hard-deny via the live gate — a genuine L4 category-error violation this build did not create but makes more consequential (C1a removes competing circles, so this pre-existing channel is more often the sole floor-setter on self-only-circle actions). Scope: read `computeDikaiosyneFloor`/`obligationToProximity` in `layer2-mechanisms.ts` (the ADR-010 §4 native weighting) to find exactly where a self-circle-only `obligation_assessment` currently reaches the floor; describe the shape of a fix (does it mean excluding a self-only circle's obligation from the dikaiosyne floor entirely — mirroring the mentor's own 2026-07-19 "self_preservation alone is not a justice surface" ruling that already narrowed `kathekon-engagement.ts`'s Arm 1 — or something narrower?); name what it would touch (this is genuinely live, Critical-tier, shared-gate code — be honest about blast radius, including whether the §3 guardrail bridge or any other already-live surface is implicated); and produce a rough sequencing estimate (does this need its own mentor consultation before it can even be scoped further, given how close it sits to the 2026-07-19 self-circle ruling?). **This document is the actual unblocking deliverable for C1a's flag** — treat it as the most load-bearing of the three, even though it's explicitly the smallest ask.

## Boundaries

- No code changes. No deploy, push, schema apply, flag set, or credential mint.
- No new mentor consultation this session unless Q4's scoping genuinely cannot proceed without one — if so, say so and draft the consultation question rather than guessing at an answer.
- Don't touch `derive-trust-events.ts` (D4, the separate trust-ledger question — explicitly distinct from Q4, don't conflate them), `stoic-brain.ts`, or the logos boundary guard test.
- Don't attempt C1c, C2, S11/logos-on work, or re-litigate BD-1 through BD-7 or the already-answered Q1/Q5.
- If you find yourself wanting to write code "just to check a design idea," don't — describe the idea in the doc instead, or if a tiny throwaway spike is genuinely necessary to resolve a real uncertainty, keep it out of the working tree (a scratch file outside the repo, or delete it before ending the session) and say so explicitly in the doc.

## Exit

- Write the three scope documents under `operations/agent-circles-2026-08/` (suggested names: `2026-08-0X-Q2-positive-routing-scope.md`, `...-Q3-staged-pause-scope.md`, `...-Q4-preexisting-channel-remediation-scope.md`, or one combined doc if that reads better once drafted — your call, say which you chose and why).
- Update the close doc's §5 step -1 and §7 to link the new scope documents (don't re-litigate their content there — link + one-line summary each).
- Append one decision-log entry recording what was scoped and what, if anything, was carried.
- If the founder wants to commit this session's output, ask first — do not commit without being told to (the pattern from the prior session: commit only on explicit instruction, and the founder pushes separately).
- State plainly at the end: which of the three documents got a full design vs. a partial one, and what — if anything — still needs a founder decision or a further mentor consultation before a build session can start.
