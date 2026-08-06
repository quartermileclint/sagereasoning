# Session Close — 2026-08-06 (C2 orientation-reading + C1c trust-event scope, authored and mentor-approved)

**Tier:** `governance`/`code-elevated` throughout. No code, schema, flag, or credential change this session. Production byte-equivalent.

## Decisions made

- **Authored the three-component C2 scope + C1c** (`operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`), per the mentor's binding order (C2 builds first, C1c second, both scoped together first — `D-C2-C1C-ORDERING-RULED-CROSSCHECK-BUILT-2026-08-05`):
  - **C2(i) the orientation reading** — an optional, additive Layer-1 `OrientationObservation[]` field mirroring the existing `obligation_assessment` precedent; a deterministic, conservative-by-default `toward|away|indeterminate` threshold computed OUTSIDE `applyMechanisms`'s return value (structurally, not just documentedly, non-feedback into the verdict); a corrected reading of "Layer-3 prose framing" as a fixed deterministic entry-text template (`ORIENTATION_ENTRY_TEXT`), never a live agent-facing LLM call — the placement ruling forbids surfacing this signal to the agent at all.
  - **C2(ii) the generative-prompt field** — the mentor's exact settled one-sentence format, fires only on `away`/`indeterminate` readings that engaged ≥1 circle, never on `toward`.
  - **C2(iii) the novelty detection specification** — structural novelty only, reusing `trajectory-delta.ts`'s exact `EVIDENCE_FLOOR = 3` constant and its `agent_assessment_history` window; a new `noveltyConfidence` field distinct from the already-approved `generationConfidence`.
  - **C1c** — the trust-event class for the orientation reading: three new `agent_trust_events.event_type` CHECK values (`orientation-reading-{toward,away,indeterminate}`), each a `'flag'` no-op effect reusing the exact `stoa-declaration-diverges-from-calling` precedent, `virtue_domain: NULL` mirroring `reflect-completed-honest`, and a named, bounded exception to S10's state-fold-only read policy (a capped `orientation_readings` list).
- **Two genuine open questions were flagged rather than resolved silently**, each with a recommendation:
  1. **A naming ambiguity in "C1c" itself** — the current dependency graph's item 3 read "circle-4 failure," which collides with the original build-plan C1c (deferred first-circle failure/demonstration events); recommended reading it as the orientation-reading's own event class instead.
  2. **The storage-home election** the mentor's own C2c ruling had explicitly left open at build time — recommended reusing `agent_trust_events` (Option A) over a sibling table (Option B).
- **Both questions were put to the mentor same session and RULED:**
  - **`D-C1C-NAMING-RESOLVED-2026-08-06`** — C1c names the circle-5 orientation-reading trust-event class; the graph's "circle-4" phrasing was a drafting slip, corrected to "circle-5 orientation reading." The original first-circle C1c is confirmed as a **distinct, separately-outstanding item**, not addressed here, needing its own future session.
  - **`D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06`** — Option A confirmed (reuse the trust ledger, three `'flag'`-effect event types, one migration, no sibling table); `virtue_domain: NULL` confirmed, no CHECK widening needed there. Four follow-on confirmations carried alongside: the §1.3 prose-template correction (to be reflected in ADR-013 when the C2 build closes); the §2.2 `generativePrompt`/`OikeiosisGap` design principle (carry into the generation step's scope document, don't rediscover it there); the §3 novelty honest-limitation as a required PR19 review dimension; the §4.6 founder-sign-off-on-exact-wording gate before any public file changes.

## Status changes

- C2 (three-component scope): not started → **SCOPED → APPROVED** (both flagged open questions ruled).
- C1c: naming ambiguous, not started → **RESOLVED, SCOPED, APPROVED**.
- **The scope document has no remaining open items.** C2 builds first; C1c builds second; neither builds until the founder elects to open the build session.
- Binding-sequence step four (`06-PLAIN-TEXT-MIRROR.md`): open → **CLOSED**.

## What was built

Nothing executable. Four markdown documents authored or amended:
- `operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md` (new, then amended in place to RULED after the mentor's response — §0, §4.1, §4.3, §6, and the top status line).
- `operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` (amended twice — first to mark items 2b/3 SCOPED, then to record both rulings: item 3 retitled from "circle-4 failure" to "circle-5 orientation reading," item 2b marked APPROVED, the step-four binding-sequence summary updated).
- `operations/decision-log.md` (appended three new entries: `D-C2-C1C-ORIENTATION-READING-SCOPED-2026-08-06`, `D-C1C-NAMING-RESOLVED-2026-08-06`, `D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06`).

## Verification completed this session

Read-verification only (no test suite applicable — no code). Every field in the scope document traced back to a cited binding ruling or an existing architectural surface (PR20), file:line, before being proposed — the `obligation_assessment` precedent (`layer1-extractor.ts:180-187`), the `stoa-declaration-diverges-from-calling` `'flag'`-effect precedent (`trust-transition.ts:40-67`), the `reflect-completed-honest` NULL-domain precedent (`trust-core-migration.sql:99-100`), the exact `EVIDENCE_FLOOR = 3` constant (`trajectory-delta.ts:125`). The mentor's two ruling messages were applied verbatim, field-by-field, with no addition or interpretation beyond what was instructed. The decision log was cross-checked against the architecture map after each edit for consistency.

## Next session should

Per the standing binding sequence (`06-PLAIN-TEXT-MIRROR.md` §Sixth element, step five): **build C2.** This is a `code-elevated`-dark-then-`code-critical`-at-activation session (per the build plan's §5 risk classification — C2a/b/e are `code-elevated`, dark, flag-gated, additive; C2c/d and every activation are `code-critical`, full Critical Change Protocol). See the companion next-session prompt for the required reading and the build's own scope.

## Blocked on

Nothing structurally — C2's build is unblocked and ready to open. Three independent tracks remain available in parallel, none blocking or blocked by C2/C1c: **D4** (the trust-ledger reducer divergence, its own founder-walked step, gates logos-on W1), **the Stoa activation** (built and battery-verified, blocked only on the founder walking its pre-activation checklist), and **the generation step's own scope document** (now separately unblocked — all three of its prerequisites are approved). The founder may elect any of these instead of the C2 build; none is silently deferred by choosing another.

## Open questions carried forward

- **The original first-circle C1c** (first-circle failure/demonstration event classes, `agent_trust_events` CHECK widening) — confirmed separately outstanding by this session's ruling, still entirely unscoped, needs its own future session. Not to be silently folded into the circle-5 orientation-reading C1c this session scoped.
- **§4.6's not-attestable clause wording** — confirmed as a hard founder-sign-off gate before any public file changes; the exact two mentor sentences are already recorded verbatim in the scope document and the build plan, so this is a gate to walk at build/activation time, not an open drafting question.
- **The C2 build's own gaming-robustness review dimension** — named in the scope document (§1.1) as required for PR19 to inherit; not itself resolved, since nothing has been built yet to review.

## Process-rule citations

- **PR20** — every field in the scope document cites a specific binding ruling or an existing architectural surface (mechanism-level only, file:line); nothing invented past what the rulings and existing code already settled.
- **The honest-claims discipline** — both open questions were recorded as genuinely open with reasoned recommendations rather than resolved by fiat, mirroring the discipline this arc has applied consistently since the C2/C1c ordering ambiguity itself was first flagged (`D-MENTOR-ARCHITECTURE-MAP-REVIEW-INSTRUCTIONS-RECEIVED-2026-08-05`); the original first-circle C1c was explicitly preserved as a distinct item rather than allowed to be silently absorbed into the rename.
- **PR17** — the C2 build's own risk classification (§5 of the 2026-08-01 build plan) is restated in this close so the next session opens knowing which sub-elements are `code-elevated` and which are `code-critical`, rather than treating the whole build as one uniform tier.

## Knowledge-gap carry-forward

- New candidate: **"a mentor's own phrasing can drift across a multi-session arc even when the underlying ruling hasn't changed"** — the C1c naming collision arose because the graph's item 3 had been paraphrased ("circle-4 failure") in a way that no longer matched either the original build-plan definition or the later ordering ruling's own reasoning, and nobody had cross-checked the three against each other until this session's grounding pass. Worth a standing habit: when a scope document inherits a short label from a dependency graph, trace that label back to its original defining text before building against it.
