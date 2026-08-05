# Next session — scope `OikeiösisGap` and `GeneratedCandidate`

**Tier:** `governance`/`code-elevated` at most (a scope document, not a build — no code should be written this session unless the founder explicitly widens scope). **Read first, in order:**

1. `operations/decision-log.md` — the nine entries from `D-STOA-Q5C-Q13A-BUILT-DARK-EVIDENCE-GATE-FOLDED-2026-08-04` through `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05`. **Verbatim wins over this prompt's summary below.**
2. `operations/agent-circles-2026-08/2026-08-05-idea-loop-prebrief-technical-feedback.md` — the technical grounding (what exists today, what doesn't).
3. `operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md` — the seven heuristics, the examination-cost ruling, the null-cycle rule, the shared-state requirement. This is the fullest current spec of what the eventual generation step needs to support.
4. `operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md` §"Sixth element" — the binding twelve-step sequence. This session is step 3.

## What this session is

**Scope two type definitions — `OikeiösisGap` and `GeneratedCandidate` — and bring them to the mentor. Nothing else.**

Per the mentor's ruling: these are upstream of C2's own scope document (C2's generative-prompt field is written to feed the generation step these types describe, so the types have to exist first). Per the same ruling: **do not scope the generation step itself yet.** The heuristics document exists so the generation-step content survives to whenever THAT session opens — it is reference material for this session, not this session's deliverable.

## What the two types need to contain (per the mentor's ruling, `D-IDEA-LOOP-PREBRIEF-RULINGS-C2-WIDENED-2026-08-05`)

**`OikeiösisGap`** — the loop's direction input, expressed as a gap rather than a destination:
- The current circle the agent is operating within (1 through 5).
- The target circle the loop is oriented toward — **always current + 1, never jumping**.
- A plain-language description of what serving the target circle would mean in the context of the current project goal.

**`GeneratedCandidate`** — a not-yet-taken action produced by a generation step, distinct from the EXISTING `CandidateProfile` type (`website/src/lib/substrate/trust-core/profiles.ts`), which describes an action that already exists:
- The proposed action, in plain language.
- The circle it's oriented toward.
- The virtue domains it's expected to engage.
- A confidence field — how strongly the generation step believes this candidate genuinely addresses the gap.

**Consequences already named for this scoping session to account for, from the later rulings (do not re-derive, they're settled):**
- Each `GeneratedCandidate` needs a field recording which of the seven heuristics produced it (heuristic-attribution) — needed for the filtering pipeline to work and for future review of heuristic productivity.
- A `GeneratedCandidate` needs to carry BOTH a guardrail-shaped result (proximity + virtue domains, populated for all six/seven candidates during filtering) AND, only for the eventual winner, full-examination prose — populated at different pipeline stages, not both up front.
- Friction-detection-sourced candidates (heuristic 7) carry a **preferred-indifferent tag at generation time**, not a virtue-domain tag — the type needs to accommodate this as a genuinely different initial classification, not force it into the same shape as the other six.
- The shared task-list state friction detection reads from is a SEPARATE storage question from these two types (multi-agent readable, mutable, multi-writer) — name it as a known-adjacent requirement in the scope document, but it does not need to be solved by `OikeiösisGap`/`GeneratedCandidate` themselves.

## What "bring to the mentor" means here

Per the established pattern this whole arc has used: author the two type definitions (as TypeScript interfaces or a design document — founder's call on which, but PR15 leans toward a design document first, code once the shape is confirmed, given this is genuinely new architecture, not a variation on an existing pattern). Write a brief naming, per PR20, the existing architectural surfaces these types will connect to (`DiscernmentInput.candidates`, `CandidateProfile`, the guardrail-shaped examination path, the history table) — one sentence each, mechanism-level. Bring that to the mentor before writing any generation logic.

## What this session should NOT do

- Do not scope the generation step's prompt structure (the seven heuristics' actual implementation).
- Do not scope C2 itself (that's step 4, after this).
- Do not touch the Stoa activation (an independent track — the founder walks that whenever they choose, using the existing checklist; it doesn't need this session to happen first or after).
- Do not start D4, the two degraded consumers, or any logos-on phase (all independently sequenced, not blocked by or blocking this session).

## Founder's independent option, not sequenced against this session

The Stoa trust-flag activation (`operations/connective-layer-2026-08/2026-08-05-stoa-trust-flag-preactivation-checklist.md`) is ready to walk whenever the founder wants — before, after, or in parallel with this session. Nothing here depends on it.
