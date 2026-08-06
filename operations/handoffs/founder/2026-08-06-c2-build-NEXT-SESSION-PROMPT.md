# Next-Session Prompt — Build C2 (the fifth-circle orientation reading + its C1c trust-event class)

**Tier:** Mixed — `code-elevated` (dark, flag-gated, additive) for C2a/C2b/C2e and C1c's derivation module; `code-critical` (full Critical Change Protocol, founder-walked) for C2c/C2d and every activation step. **Read first, in order:**

1. `operations/decision-log.md` — every `D-C2-C1C-*` and `D-C1C-*` entry, most recent first, back through `D-C2-C1C-ORDERING-RULED-CROSSCHECK-BUILT-2026-08-05`. **Verbatim wins over this prompt's summary below.**
2. `operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md` — the full, mentor-approved scope. Every field this session builds should trace back to a section in this document. Nothing in it is still open.
3. `operations/agent-circles-2026-08/2026-08-01-agent-circles-practice-on-build-plan.md` §Phase C2, §4, §5, §6 — the original phase breakdown (C2a–C2e), what the plan explicitly says NOT to do, the risk classification per sub-element, and the verification requirements (the gate verdict-equivalence battery, the placement pins, PR19 with the dedicated gaming dimension).
4. `operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-practice-on-verbatim.md` §Q4, §Q5, §Q6, and the "Follow-up... placement of the computed orientation reading" appendix at the end — the mentor's own words on what the reading is, why it can be computed deterministically, and why it lives on the public trust record only, never in the signed assessment.

## What this session is

Build C2 and C1c against the now-fully-approved scope. Per the mentor's C2c placement ruling, the build has a specific shape that differs from a typical additive feature: **most of it is genuinely dark and low-risk (C2a/b — a new optional Layer-1 field, a pure deterministic function), but the placement itself (C2c) and the honest-claims clause (C2d) are Critical** because they touch a public-facing surface (S10, the trust-record read endpoint) and a published contract (ADR-013 §8, the R18 surfaces).

**Suggested build order, following the scope document's own structure:**

1. **C1c first, even though C2 "builds first" in the binding sequence** — build the derivation module and the migration (three new `agent_trust_events.event_type` CHECK values, `'flag'`-effect, `virtue_domain: NULL`) as dark, additive infrastructure. This is safe to build before C2's extraction exists, since it's pure plumbing with no data flowing through it yet — and building it first means C2's own build can write real events immediately rather than stubbing them.
2. **C2a** — the Layer-1 `OrientationObservation[]` extraction field (scope doc §1.1). Additive, optional, mirrors `obligation_assessment` exactly.
3. **C2b** — `computeOrientationReading` (scope doc §1.2) and `ORIENTATION_ENTRY_TEXT` (§1.3). Pure, deterministic, no I/O.
4. **C2(ii)** — the `generativePrompt` field and its population condition (scope doc §2.1). Wire it as an additive field on whatever structure eventually carries `GeneratedCandidate`-adjacent output — note per the scope document §2.2 that this is a per-examination SEED, not itself an `OikeiosisGap`, and does not require the IDEA loop's own generation step to exist to be built (it can sit dark/unconsumed).
5. **C2(iii)** — the novelty-detection query (scope doc §3), reusing `trajectory-delta.ts`'s `EVIDENCE_FLOOR` and window pattern exactly.
6. **C1c wiring** — connect C2b's computed reading to the three `orientation-reading-*` events, flag-gated, R18f-parallel (re-verify the signed assessment before deriving the event — the same rule every other derivation follows).
7. **C2c — the placement (Critical).** S10's bounded exception: the capped `orientation_readings` list (scope doc §4.5). This is where the public surface actually changes shape, so this is where the Critical Change Protocol engages — flag-gated, migration-before-flag, TEST-before-prod, founder-walked activation.
8. **C2d — the honest-claims clause (Critical, gated on founder sign-off before ANY public file changes).** The mentor's exact two sentences into ADR-013 §8's dated amendment, `TRUST_RECORD_ENVELOPE` verbatim, and all three R18 surfaces (`llms.txt`, `agent-card.json`, api-docs) — **in that order, after sign-off**, per the ruling that confirmed this as a hard gate.
9. **C2e — the three moments (Q7).** The calling-frame telos line (mentor-verbatim, ADVISE channel), the reflect structure's orientation question (mentor-verbatim, additive to Q1–Q6), and the **at-action silence pin** — a battery assertion that no at-action frame or suggestion ever names the fifth circle/orientation, making the one-question rule structural rather than merely observed.

## Required verification (per the build plan §6 + the scope document's own pins)

- The gate verdict-equivalence battery, both directions, at both thresholds, for the extraction-prompt change (C2a).
- **Placement pins, made structural per the C2c ruling:** the orientation reading never appears in the signed assessment or any consult-response field (asserted against the response builders); every S10-served orientation entry carries the inline not-attestable clause (asserted at the payload builder, mutation-verified); no composer basis code, trust event, or suggestion derives from reading-vs-reflection divergence (asserted both directions).
- At-action fifth-circle silence pinned; the reflect orientation question verbatim-pinned; the calling telos line verbatim-pinned.
- **PR19 independent review with the dedicated gaming dimension** (fresh context, artifact only) — the build plan's own instruction that this reading "exists to be harder to game than proximity" means the review must specifically attack that claim, not just check for defects generally.
- Flag-off byte-identity for every new flag, the standing discipline this whole arc has followed without exception.

## What this session should NOT do

- Does not touch the original first-circle C1c (deferred first-circle failure/demonstration events) — confirmed by ruling as a separate, still-unscoped item needing its own future session. Do not fold it into this build under the shared "C1c" label.
- Does not touch D4 (`derive-trust-events.ts`'s reducer divergence) — independent, its own track.
- Does not touch the Stoa activation — independent, founder-walked whenever elected.
- Does not open or build the IDEA loop's generation step — that remains queued, separately unblocked but not this session's task. C2's `generativePrompt` field is built dark/unconsumed if the generation step doesn't exist yet; that's fine per the scope document's own reasoning (§2.2 — the field is raw material, not a live dependency on a consumer existing).
- Does not proceed past C2c/C2d without the founder walking sign-off on the exact honest-claims wording — this is a named hard gate, not a build-time detail to improvise past.

## A founder decision to make before or at session open

Per the "Blocked on" section of this session's close: **three independent tracks are also fully available** — D4 (gates logos-on W1), the Stoa activation (built, battery-verified, awaiting only the founder's walk of its checklist), and the generation step's own scope document (now separately unblocked, all three prerequisites approved). This prompt defaults to building C2, since it's the standing next item in the numbered binding sequence and has been "next" since 2026-08-05 — but any of the other three is equally available if the founder prefers a different session's shape (e.g., the Stoa activation is a pure founder-walked activation with no new build work, if a lighter session is wanted).
