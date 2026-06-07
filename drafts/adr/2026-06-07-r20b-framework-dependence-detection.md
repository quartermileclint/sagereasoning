# ADR — R20b Framework-Dependence Detection + Independence Coaching

**Status:** Draft — under founder review (A18c, 2026-06-07). On approval, moves to `/adopted/adr/`.
**Session:** A18c. **Tier:** `code-critical` (PR6). **Implements:** R20b (manifest line 227).
**Decision owner:** founder. The AI recommends; the founder elects the detection mechanism at ADR review.

---

## Context

R20b (manifest line 227): *"The system must be designed to encourage internalisation of principled reasoning, not dependence on the tool. Usage patterns indicating growing dependence (running every trivial decision through evaluation, inability to reason without the framework) should trigger a response from the mentor: 'You're ready to reason through this yourself.' Success means users who need the tool less over time."*

Two distinct halves, deliberately kept separate:

1. **Detection** — read usage history, decide whether a dependence pattern is present.
2. **Coaching** — when the pattern is present, the mentor surfaces an independence nudge.

Grounding check (2026-06-07): no dependence-detection logic exists anywhere in `website/src/`. R20b currently appears only in the limitations page, the founder hub, AC3, and test/data fixtures. This is a fresh build.

R20b is also Zone 2 **domain 5** in AC3 ("Framework dependency — *philodoxia* + *andreia*, with R20b"). This maps the *concept* into the Zone 2 taxonomy, but it does **not** mean A18c modifies Zone 2 classification logic — see the PR6 boundary statement below.

---

## What already exists (the load-bearing finding)

`/api/mentor/private/reflect` (founder-only) **already**:

- Loads `mentor_interactions` over a rolling 90-day window via `loadMentorInteractionsAsRecords(profileId, hubId, {windowDays, limit})` (read-only; hub-scoped; returns `[]` on any error).
- Runs the shared engine `analysePatterns()` (`sage-mentor/pattern-engine.ts`) over those interactions, producing a `PatternAnalysis` with a `ring_summary`.
- Injects a conditional context block into the mentor's user message — *"RECURRING PATTERNS DETECTED ACROSS PRIOR INTERACTIONS… (These are deterministic aggregations from this practitioner's recent interaction history — **diagnostic, not punitive**.)"* — exactly the R6d framing R20b needs.
- Calls the distress gate `await enforceDistressCheck(detectDistressTwoStage(...))` **first, at pipeline entry**, before any of the above.

So the detection data, the diagnostic-not-punitive context-block pattern, and the clean separation from the distress gate are all already in place on this route. A18c reuses them rather than building anything bespoke.

---

## Decision 1 — Detection mechanism: **deterministic / heuristic** (recommended)

**Recommendation: deterministic.** R20b's own examples are countable usage-pattern signals — *frequency* of evaluation and *triviality* of what is evaluated — not semantic judgements that require a model.

| | Deterministic / heuristic | LLM classifier |
|---|---|---|
| What it does | Counts evaluation frequency in a rolling window; uses input depth/length + repetition as a triviality proxy | Asks a model "is this input trivial / does this pattern indicate over-reliance?" |
| Model-selection risk (KG2/PR4) | None — no LLM call | Engages: Haiku only if single small JSON within boundary, else Sonnet; must be confirmed against `constraints.ts` |
| Cost | Effectively free (reads data already loaded) | Per-call token cost on every evaluation |
| Verification surface | Small — a pure function over an array | Larger — prompt + model behaviour + invocation |
| PR15 posture | Least custom surface; reuses existing data + engine | More custom; adds a model dependency |
| Weakness | "Triviality" is approximated, not understood | Better at nuance, at real cost + risk |

**Why deterministic suffices here.** The honest first-cut signal is *frequency* (how often the practitioner runs an evaluation) combined with a conservative *triviality proxy* (short inputs, repeated near-identical inputs, quick-depth). A practitioner running many short, shallow evaluations per day over a sustained window is the exact pattern R20b names. We do not need a model to count that. If field evidence later shows the triviality proxy is too crude, a classifier can be added behind the same flag in a later session — but we should not pay that cost or take that risk on the first cut.

**This is the bespoke election (PR15).** No Anthropic-canonical primitive delivers "detect over-reliance + coach independence." The closest in-repo precedent is the existing `analysePatterns` detector family — which we reuse. Bespoke is justified because it is a tiny deterministic addition to existing machinery, not a new subsystem.

---

## Decision 2 — Where detection runs vs where coaching surfaces (kept separate)

- **Detection runs** route-local on `/api/mentor/private/reflect`, computed from the `mentor_interactions` window the route already loads (no new DB read for the proof). A new pure function — e.g. `detectFrameworkDependence(interactions, options): DependenceSignal` — returns a structured result (`{ present: boolean; reason: string; window_count: number }`).
- **Coaching surfaces** as a new conditional context block injected into the mentor's user message *only when* `present === true`, instructing the mentor to deliver the R20b response in its own warm voice ("you're ready to reason through this yourself"). When `present === false`, the request is **byte-identical** to today.

**Why route-local, not in the shared engine (PR1).** `analysePatterns()` is shared by multiple consumers; adding a dependence detector there would change every surface at once — a multi-endpoint rollout without a single-endpoint proof, which PR1 forbids. The detector is proven route-local on the founder-only surface first, reaches **Verified**, and only *then* is promotion into the shared engine (for the other 7 mentor surfaces) considered — its own later session.

---

## Decision 3 — Data source + threshold (R6d diagnostic, R19 honest)

**Data source (confirmed columns).** `mentor_interactions` (migration `20260412_hub_isolation.sql`): `id, profile_id, hub_id, interaction_type, description, proximity_assessed, passions_detected (jsonb), mechanisms_applied (text[]), created_at`. Indexed on `(profile_id, created_at DESC)` and `(hub_id, profile_id, created_at DESC)` — rolling-window frequency reads are cheap. The route already holds this window in memory as `InteractionRecord[]`.

**Threshold (conservative starting values, tunable).** Dependence signal = present when **both**:

1. **Frequency:** interaction count in the last *N* days ≥ a high threshold (proposed start: ≥ 25 in 7 days, i.e. sustained multiple-per-day), **and**
2. **Triviality proxy:** the recent window skews to short/shallow inputs (proposed start: median `description` length below a small bound and/or a high share at the reflexive/habitual end of `proximity_assessed`).

Both must hold, to avoid flagging a deeply-engaged practitioner doing genuine daily work (high frequency alone is healthy; high frequency *of trivial evaluations* is the R20b pattern).

**R6d — diagnostic, not punitive.** The coaching is an **invitation**, never a gate. It never blocks, rate-limits, or degrades any evaluation. The mentor simply notes the practitioner may be ready to reason unaided. The exact "diagnostic, not punitive" framing already used by the recurring-patterns block is carried over.

**R19 — honest, no dark pattern.** The coaching genuinely points the practitioner toward needing the tool *less* — it does not manufacture engagement, guilt, or urgency. It is the opposite of a retention nudge, which is precisely R20b's intent ("users who need the tool less over time").

**False-positive posture.** A false positive tells a healthy user "you're ready to go it alone" — mildly unhelpful but not harmful, and self-correcting (they keep using the tool if they wish). Thresholds are set conservatively so false positives are rare; they are tunable constants, not load-bearing logic.

---

## Decision 4 — PR6 boundary statement (in writing, required)

A18c does **not** touch any PR6 trip-wire function. Specifically, it does **not** modify:

- the two-stage distress classifier (`detectDistressTwoStage`, `r20a-classifier.ts`),
- Zone 2 input-classification logic,
- Zone 3 redirection logic, or
- the distress wrapper (`enforceDistressCheck`) or the `await enforceDistressCheck(detectDistressTwoStage(...))` call at pipeline entry.

The dependence detector is a **separate, additive usage-pattern reader** that runs **after** the distress gate, alongside the existing pattern-engine pass. It reads history; it does not classify the current input for distress. AC3 lists "Framework dependency" as a Zone 2 *domain*, but A18c implements R20b's *usage-pattern* half, which is architecturally distinct from Zone 2 *input* classification. The distress check that runs first at pipeline entry is byte-identical after this change.

The session is nonetheless **Critical** (PR6) because it changes mentor behaviour and sits adjacent to the distress perimeter. Detection is synchronous (PR3) — no background/fire-and-forget — and completes before the response is constructed. If any build step is found to require touching a trip-wire function, **stop and re-confirm scope with the founder**.

---

## Decision 5 — Single-endpoint proof (PR1)

Prove on **`/api/mentor/private/reflect`** first because it is: founder-only (lowest blast radius, real dogfood data), the proven R19d mirror-principle surface, and already wired to the exact data + injection machinery. Flag-gate the whole feature behind a new env flag (proposed: `R20B_INDEPENDENCE_COACHING_ENABLED`, UNSET by default) so production behaviour is unchanged until deliberately enabled, and rollback is a flag-unset. Reach **Verified** here before any consideration of the other 7 mentor surfaces.

---

## Consequences

- **Positive:** tiny additive change; no new model dependency; no new DB read for the proof; reuses existing diagnostic-not-punitive framing; flag-gated; trivially reversible; PR6 perimeter untouched.
- **Negative / accepted:** triviality is approximated by a proxy, not understood (accepted for the first cut; classifier remains a future option behind the same flag); thresholds need a small amount of real-usage tuning (expected — they are constants).
- **Deferred (PR7):** promotion of the detector into the shared `analysePatterns` engine and rollout to the other 7 mentor surfaces — deferred to a later session, triggered by this proof reaching Verified. Classifier upgrade — deferred, triggered only if the triviality proxy proves inadequate in practice.

## Rollback

Flag-gated: unset `R20B_INDEPENDENCE_COACHING_ENABLED` → behaviour returns to today. Per file: restore from `archive/*.backup-pre-A18c-2026-06-07`. Detection is read-only over existing data; coaching is additive prompt text — neither alters stored user data. No schema change required for the proof (no new table/column), so no migration to reverse.

## Model selection

**N/A.** Deterministic detection adds no LLM call. The coaching is additional context consumed by the route's existing `claude-sonnet-4-6` reflection call — no new or changed model. (If a classifier were elected instead, model selection would engage per AC1/KG2 and be confirmed against `constraints.ts`.)

---

*End of ADR draft. Awaiting founder election of the detection mechanism (Decision 1) and approval to proceed into the Critical Change Protocol build.*
