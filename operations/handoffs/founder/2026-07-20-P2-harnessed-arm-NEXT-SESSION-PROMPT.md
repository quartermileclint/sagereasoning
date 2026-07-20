# Next-Session Prompt — P2 harnessed-arm leg (leg B): mint credentials, run the harnessed comparison, write the verdict memo

**Stream:** founder (AO program — P2, leg B, closing the re-run bare-vs-harnessed value benchmark).
**Tier:** `code-critical` (live credential mint via `sr_inst_`/`sr_assent_` tokens, PR17 founder-walked per the original 2026-06-11 protocol).
**Governing frame:** `/adopted/standing-protocol-cache.md`; `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P2.
**Predecessor close:** `operations/handoffs/founder/2026-07-20-P2-bare-arm-CLOSE.md`.
**Frozen spec:** `operations/agent-org-2026-07/2026-07-20-P2-spec-freeze.md` — read in full.
**Leg A outputs + metrics (DO NOT let this session's agent read leg A's outputs before running its own scenarios — read them only AFTER leg B's own runs are complete, for the incorporation-log / decision-changed comparison):** `operations/agent-org-2026-07/runs/2026-07-20-bare/leg-a-metrics.md` + `leg-a-outputs/`.

## Critical constraint — no shared context

This session must open FRESH — it must not read the leg-A session's transcript. It MAY read the frozen spec and (after leg B's own three scenarios are run) the leg-A metrics/outputs for comparison purposes only, never before.

## Procedure

1. **Re-confirm build-state precondition** (same two commands as the spec-freeze/leg-A sessions — do not cite either prior session's confirmation as current).
2. **Mint credentials** (founder-walked, PR17): an `sr_inst_` per-install token for consult/gate use, and an `sr_assent_` token for the closing accreditation write. Revoke both at session close.
3. **Run leg B (harnessed) across the SAME three sealed briefs** used in leg A — `operations/agent-org-2026-07/runs/2026-07-20-bare/brief-S1-justice-floor.md`, `brief-S2-corroboration.md`, `brief-S3-general-task.md` (+ its two input files) — via the public contract: consult `POST /api/reason` at defined decision points (adoption of the task approach; each major finding/recommendation before it's finalized; any scope judgement), gate `POST /api/guardrail` before any consequential action, and use `response_format:'assessment_first'` where the consult doesn't need synchronous prose (per the spec's §4 threshold note — this is what lets the L3-deferral latency win actually show up in the wall-clock number).
4. **Log every incorporation verbatim** (verdict received → used/modified/rejected, and why) — the anti-self-grading device.
5. **Handle the transient-401 class per the spec's §5 rule**: retry once before treating a consult 401 as genuine; if it recurs at a material rate, disclose the rate explicitly rather than silently absorbing it into wall-clock.
6. **Close with the Sage Assent write path** (accreditation record for the run).
7. **Only now**, read leg A's outputs + metrics. Score leg B's own outputs against the same three sealed answer keys (`SEALED-answer-key-S1/S2/S3.md`), then compare: did the harness change any decision leg A already got right, catch anything leg A missed, or add nothing beyond what leg A already produced bare? Record this honestly — leg A caught everything the answer keys were watching for, so the discriminating question for leg B is added confidence / a signed record / catching something a human reviewer (not leg A) would miss on a first read, not "did it get the same right answer."
8. **Score against the frozen thresholds** (§4 of the spec-freeze doc: 2 material catches/errors leg A missed, AND ≤50% wall-clock overhead, AND ≤$5 harness cost).
9. **Write the verdict memo** (mirror the 2026-06-11 memo's shape: `operations/p1-rebuild-2026-06/verdict-memo.md`) at `operations/agent-org-2026-07/runs/verdict-memo-2026-07-2X.md` — state the result against the boxes exactly as ticked, do the task-fit analysis (§8 discipline: characterise WHERE value appears, never gate the whole verdict on one mechanism), and explicitly restate: **this memo informs the 0h call; it never makes it.**
10. **Teardown:** revoke both credentials; confirm via 401.
11. **Decision-log entry + session close**, lean form.

## Anticipated shape

~4–6 hours (credential mint + three harnessed scenario runs with consult/gate discipline + accreditation write + teardown + verdict memo authoring).

## Rollback

No schema/flag change. Credentials are throwaway, revoked at close. `git revert` the records commit if the memo needs rework.

## Forecast

Success = a verdict memo that honestly states whether the harness demonstrated benefit against the frozen boxes on the current build, with the task-fit analysis distinguishing where (if anywhere) value showed up given that the bare leg already performed strongly. S11 stays REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's, informed but not decided by this memo.

End of prompt.
