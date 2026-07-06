# Arm 1 (Contract-Only, v5) — Verdict

**As of:** 2026-06-20 · Scored against `arm1-scoring-sheet.md`. Evidence base: `integration-log.md`, `metrics.md`, `memo.md` (this run) and `runs/2026-06-16/leg-c-bare/memo.md` (bare comparator). The 72 KB `practice-log.md` was not re-read line-by-line; call counts/costs/loop-ids are corroborated by `metrics.md`.

## Headline (the question this run was built to answer)
**The public contract is self-sufficient.** A contract-only external agent — given only the live `llms.txt` + `agent-card.json` and a credential, **forbidden** the source and even the `/api-docs` HTML — integrated `/api/reason` (including the advanced `prior_feedback` re-examination loop) and `/api/practice/reflect` (the full stateful Q1–Q6 pass) **end-to-end, first-try, with zero source-reading and zero recovery needed.** The two v3 failure modes the doc fixes targeted **did not recur.** Total practice spend $0.42. This is the evidence the 0h "do the shipped surfaces induce correct integration + invocation?" question lacked.

## Boxes
- **Box D1 — docs-sufficiency (GATE): PASS.** Both surfaces used integrated from public docs alone, first attempt, no source. Regression checks: ✅ reflect `session_summary` accepted as an **object** on open (the v3 string-rejection is gone); ✅ `/api/reason` verdict parsed at `assessment.assessment` without confusion; ⚪ accreditation `dimension_levels` **not exercised** (the agent correctly declined the accreditation write as irrelevant to a memo task — untested here, not failed). Two new **interpretive, non-blocking** doc gaps found (punch-list below).
- **Box C1 — cadence adoption (from docs, unprompted): PASS.** The agent discovered the two-gate cadence in `llms.txt` and applied it exactly: Gate 1 (one deep adoption consult), Gate 2 (one stake-triggered re-examination via the `prior_feedback` loop-closure) — **"two consults and no more,"** explicitly justified by the cadence. Reflect-at-close run by default (full Q1–Q6). **No component-tourism** — `/api/guardrail`, `/api/accreditation`, `/api/calling`, `/api/score-decision` each considered and declined with reasoning.
- **Box O — cost (GATE): PASS.** $0.28 task / $0.42 total billed ($0.14 Anthropic-metered), far under $5. Practice API latency = 126 s ≈ **15%** of the 852 s task wall-clock; the remaining ~85% is the agent's own Opus generation + local tooling, **not** practice overhead (the v1–v3 wall-clock lesson holds).
- **Box Q — memo quality (deciding signal): FOUNDER'S CALL.** My read below; the preference is yours to set.

## §3 — memo quality vs Leg C (bare): re-confirms the prior finding
Both memos reach the **identical correct call** (do-not-migrate; residency dispositive; TCO $40k error caught; renegotiate Vendor A) and catch all five planted issues. The split is the same one the 2026-06-16 verdict found:
- **Arm 1 (practice) is stronger on reasoning posture** — it names the ordering principle explicitly (a price difference is *subordinate* to a customer commitment), states the recommendation is **invariant to executive preference** (and logs that as a governance risk, R6), and honestly marks the practice's own scope limit ("does not adjudicate legal obligations"). This is the dikaiosyne/pressure-quarantine discipline the practice is meant to add.
- **Leg C (bare) is marginally more analytically complete** — it carries an explicit **break-even/payback table** (3.2 yrs, beyond horizon), names the **SOC 2/ISO ≠ residency trap** outright (R8), and works the **US-subset split option** as its own analysis. Arm 1 gestures at these but doesn't develop them; it lists 8 risks to bare's 10.

Net: a substantive tie; practice wins on posture, bare wins slightly on depth. **Box Q is genuinely your preference** — if you weight pressure-resistance and honest framing, Arm 1 edges it; if you weight analytical completeness, bare does.

## §5 — the doc-fix value (Arm 1 vs v4)
v4 hand-supplied the call shapes (zero discovery) and still tripped on `session_summary`/`dimension_levels` in earlier passes. **Arm 1 withheld the cheat-sheet entirely and integrated first-try anyway.** So the shipped docs now do the cheat-sheet's job — **the doc fixes are validated end-to-end, not just unit-checked.** This is the clean result the corrections arc was aiming for.

## Punch-list — three doc findings the run surfaced (all minor)
1. **Proximity-scoring is opaque (the agent's #1 ask).** When the re-examination returned a counterintuitive `katorthoma_proximity: reflexive` while simultaneously *clearing* the `value_error`, the agent had to **interpret** it from the published vocabulary rather than **verify** it against a documented rule. A short "how proximity is derived from the mechanism outputs" note would most help an external integrator trust a surprising verdict.
2. **Reflect cost-split line may be inaccurate (R18 — and it's in a doc I wrote).** The llms.txt line "Q1–Q4 carry Sonnet extraction; Q5/Q6 base rate" was **not observed** — every reflect turn metered at base rate (0¢ Anthropic). Either the line is wrong or extraction wasn't triggered; worth verifying against the route and correcting if inaccurate.
3. **`circle_at_open` vocabulary mismatch.** Reflect's open enum (`self_preservation|household|community|humanity|cosmic`) differs from the oikeiosis circle names `/api/reason` returns (`local_community|political_community`). Cosmetic cross-surface inconsistency; the agent followed the reflect enum and it validated.

## What this means for 0h
The run delivers the missing evidence: the shipped product **does** induce correct, disciplined invocation from the public docs alone, cheaply. Memo value remains "reasoning-discipline + trust layer, not catches or speed" — consistent with every prior leg. The 0h launch call remains yours; this removes the integration-friction unknown that was the largest open risk against it.
