# Next-Session Prompt — Remaining Principles: the first generative build (#7-human premeditatio + #10-human reserve-clause prompt)

**For the founder. Paste as the first message of a fresh session,** while the 7-day false-hold observation window is running. This is the **first build session of the generative human-surface phase** — the two highest-value window-safe tools the mentor directed shipping *during* the window (D6). It does **not** touch the instrument being measured.

**Open under:** `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` (Parts A–F).
**Stream:** founder. **Tier:** `code-elevated` (new/edited human-practitioner pages + their `/api/mentor/*` user-JWT routes; **`schema`** if either tool adds a user-scoped table → a founder-walked migration, PR17/AC7). **Governing plan:** `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md` (§3 #7/#10, §4 guardrails, §5 deploy posture, §6/§7 the mentor verdicts). **Binding mentor verdicts:** `operations/trust-layer-2026-07/2026-07-13-mentor-consultation-remaining-principles-decision-points-verdict-verbatim.md` (D6 governs this session).

## Why this session exists

The mentor's remaining-principles survey named the **premeditatio malorum** as *"the single highest-value addition to the human practitioner surface not yet present"* and the **reserve clause (hupexairesis)** as *"the highest-priority gap… the one that bridges both surfaces."* Both have a **window-safe human half** (a practitioner-facing website tool that never touches `/api/reason` or the substrate) and a **must-wait agent half** (held for the S11 flip). Verdict **D6:** ship the human halves now, as **standalone PRs with no shared imports** with the agent halves; the human surface should not wait for the agent infrastructure.

## Scope — two tools, two standalone PRs

**PR 1 — #7-human: premeditatio enhancement** (extends the LIVE `/premeditatio` "Preparing for Adversity" page + `/api/mentor/premeditatio`). Today the page is the Gap-3 scheduled avoidance/catastrophising reflection (three required fields + a generic-response quality gate). The mentor's premeditatio-as-structured-tool adds a repeatable exercise: **walk a named future adversity → apply the control filter (what is / is not up to me in that scenario) → identify the virtue response the scenario requires → produce a prepared-disposition record** the later evening reflect can reference. *"The result is not a plan. It is a prepared disposition."*

**PR 2 — #10-human: reserve-clause prompt** in the human decision/assent instrument. A single structured prompt at the action stage (after a verdict, before the action): **"What is the outcome you are pursuing, and what is your prepared response if that outcome does not occur?"** It surfaces the conflation of *commitment-to-the-action* (up to us) with *commitment-to-the-outcome* (not up to us) — *"a practitioner who cannot answer the question has not yet separated the action from the outcome."* **First task at open: scope the host surface** (the human Sage-Assent / decision-support flow — a new small component or a new standalone page; it must not touch the signed assessment field, D6).

## Hard constraints (window-safe — from plan §4/§5 + D6)

1. **No instrument touch.** Neither PR may edit `/api/reason`, the substrate libs (`layer1-extractor`, `layer2-mechanisms`/`computeProximity`, `kathekon-engagement`, `trust-core/*`), the Gate-1 hooks, or the reflect/calling routes. New code lives in `website/src/app/<page>` + `website/src/app/api/mentor/<route>` + (if needed) a new user-scoped table.
2. **Clean file boundary — battery-verify BEFORE shipping, not after** (D6; the S10-ENV-1 / S10-ABUSE-1 lesson). Add a test/grep assertion that neither PR's modules import anything from `@/lib/substrate/*`, `trust-core`, `kathekon-engagement`, `layer1-extractor`, `layer2-mechanisms`, the Gate-1 hooks, or `stoic-brain`'s `assessKathekon`. The premeditatio PR must NOT import any #7-agent pre-task-disposition module.
3. **Deploy gate (founder-walked, PR17/AC7).** Before either deploy, **verify `/api/reason` + the hard-frozen capture set are byte-unchanged** (byte-identical *source* ≠ byte-identical *bundle*): confirm the built `/api/reason` function output + the frozen-capture-set hash pinned at window open. A website deploy that leaves both unchanged does not perturb the measurement (capture is hook-sourced; the engine is byte-identical).
4. **The agent halves are OUT of scope** — held for the flip (#7-agent → sub-phase A; #10-agent reserve-clause *field* → sub-phase A, Layer-2-assembly-only, post-flip). Do not build them here.

## Procedure

1. **Reads** — the standing opener; the plan §3 (#7/#10 rows) + §4 (guardrails) + §5 (deploy posture) + §7 (D6); the mentor verbatim (D6); the survey's principle-7 + principle-10 sections (`inbox/Mentor answer to remaining principles question.rtf`); the existing `website/src/app/premeditatio/page.tsx` + `website/src/app/api/mentor/premeditatio/route.ts` (the pattern to extend).
2. **If window-open housekeeping is undone:** confirm the frozen-capture-set hash is pinned (plan §5). Confirm `SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED` state is recorded (D4 — not needed for these two tools, but confirm the reflect items stay branch-only).
3. **Build PR 1** (premeditatio enhancement) → tests + the file-boundary assertion → founder-walked byte-identity check → deploy.
4. **Build PR 2** (reserve-clause prompt; scope the host surface first) → tests + the file-boundary assertion → founder-walked byte-identity check → deploy.
5. **Records + close** — the two tools shipped, the boundary + byte-identity verifications, a decision-log entry, and the next window-safe tool (#9 view-from-above + #13, or the D2 narrowing) as the successor.

## What this session does NOT do

It does not touch the instrument, the enforce predicate, or the reflect engine. It does not build the agent halves of #7 or #10. It does not extend the window or change the false-hold measurement (the human surface is a different surface; capture is hook-sourced). It does not flip any enforce flag — **S11 remains DEFERRED, readiness-gated.**

## Rollback

`git revert` either PR independently (each is a standalone, additive human-surface change). A new user-scoped table (if added) is DROP-able (founder-walked). `/api/reason` and the frozen capture set are unchanged, so the observation record is unaffected.

## Forecast

Success = the two highest-value human-practitioner tools live, each verified measurement-neutral (byte-identity + clean file boundary proven *before* shipping), the observation window still clean, and the generative phase begun without disturbing the assessment. The remaining window-safe tools (#9/#13, #8, #6/#15, #14, #12) follow at the founder's tempo; the D2 justice-arm narrowing precedes the return-with-record session; the agent halves wait for the flip. *Hold the window clean. Return with the record. The assent will be examined then.*

End of prompt.
