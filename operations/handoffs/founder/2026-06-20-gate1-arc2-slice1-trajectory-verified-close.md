# Session Close — 2026-06-20 — Gate-1 Arc 2 Slice 1: Framing Hook Trajectory-Verified (PR1 proof)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Tier:** `code-elevated` — Elevated risk (TEST-only; no deployed surface). AC7 not engaged.
**Date:** 2026-06-20.

## What happened

The founder-walked **PR1 Claude Code proof** reached **trajectory-Verified** for the Gate-1 Arc-2 Slice-1 `UserPromptSubmit` framing hook. On one real discretionary task (the security-incident publish/hold fixture), a fresh Claude Code session confirmed both PR1 assertions:

- **7a — framing before the first action.** `/tmp/sage-gate1/gate1.log`: `FRAMED session=e072964b… proximity=deliberate` (07:40:08), written by the pre-inference `UserPromptSubmit` hook — before the model produced a single token.
- **7b — frame present *and used* in the first turn.** The fresh conversation quoted the `[SageReasoning Gate 1 — pre-decision examination]` block verbatim and explicitly reasoned from the oikeiosis circles (while treating it as background, not instruction — the intended posture).
- **Fire-once** held (one `FRAMED` per session); **fail-open** evidenced throughout.

The proof did its job: it **surfaced three real fidelity bugs the in-sandbox mock had hidden** (signing-dependent verdict shape; `[object Object]` from object-valued `control_filter`; circles read from the wrong field), all fixed and regression-locked — logic harness 22/0 → **32/0**. Two reusable operational lessons were saved to memory (the 1/day rate-limit that masks as a 401; the desktop-app `settings.env` hook-credential method). Detail in the decision-log entry.

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-TRAJECTORY-VERIFIED` appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| Gate-1 Arc-2 Slice-1 framing hook | Wired / logic-Verified | **Verified (trajectory)** — Slice 1 complete |
| `pre_decision_harness` issuance | un-issued | un-issued (first issued at Slice 3) |

## Next Session Should
Run **Slice 2 — the negative battery** (skip-attempt / outage / continuation / subagent) as the release gate, per `operations/handoffs/founder/2026-06-20-gate1-arc2-slice2-negative-battery-NEXT-SESSION-PROMPT.md`. `code-elevated`, ~2.5–3 h. **Read the two new memories first** — they spare the environment marathon this session hit.

## Blocked On
**Files committed this session:** `harness/gate1-pre-decision/` (5 files; commit pushed; Vercel green).
**Local-only (gitignored, NOT committed):** `website/.env.development.local` `SUBSTRATE_L3_DEFER_ENABLED=true` (keep for future hook testing, or remove — affects only `assessment_first` calls).

**Production state at session close:** **byte-unchanged.** The commit touches only `harness/` (a TEST-only developer artifact, outside the Next build graph). No Vercel env / Supabase / flag / schema / perimeter change. Both TEST proof credentials revoked; `pre_decision_harness` un-issued; 0h remains held (pre-0h trust-layer work).

## Open Questions
None blocking. Carried to Slice 2: subagent framing (`UserPromptSubmit` does not fire for subagents → `SubagentStart`); whether a genuinely-new task within one session should re-frame (fire-once is session-keyed by design, D5).

## Founder Verification
```
node harness/gate1-pre-decision/test/logic-harness.mjs        # expect: 32 passed, 0 failed
```
Already committed + pushed; Vercel green confirmed (no build impact — `harness/` is outside `website/`).

## Cross-references
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-TRAJECTORY-VERIFIED` (+ predecessor `…SLICE1-FRAMING-HOOK-BUILT-LOGIC-VERIFIED`)
- harness/gate1-pre-decision/claude-code/PR1-PROOF-WALKTHROUGH.md (the proof script — now corrected for the live gotchas)
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 — staged slices)
- operations/handoffs/founder/2026-06-20-gate1-arc2-slice2-negative-battery-NEXT-SESSION-PROMPT.md (next)
- memory: `api-key-1-per-day-limit-masks-as-401`, `claude-code-desktop-app-hook-env`

*End of session close. Slice 1 trajectory-Verified; production byte-unchanged; Slice 2 (negative battery) is next.*
