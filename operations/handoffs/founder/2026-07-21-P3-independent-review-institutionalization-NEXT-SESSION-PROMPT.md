# Next-Session Prompt — P3: institutionalize the independent adversarial review

**Stream:** founder (AO program — P3; standalone, no dependency on P2, which is currently on hold in a parallel session).
**Tier:** `governance`. Half-session, standing on its own.
**Governing frame:** `/adopted/standing-protocol-cache.md`; the AO plan `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P3.
**Predecessor session close:** `operations/handoffs/founder/2026-07-20-P-GL-finish-CLOSE.md` (P-GL fully closed — not a P3 dependency, but the most recent session in this stream).
**Predecessor decision-log entries:** `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19` (v2 — the plan of record, §7–§8 name P3's own origin); `D-AGENT-ORG-P-GL-FINISH-MENTOR-WIRING-AND-CHECKLIST-CLOSED-2026-07-20`.
**Risk classification:** Standard (`governance`) under 0d-ii. Critical Change Protocol NOT engaged — this is a process-rule amendment to the project's own instructions surface, not a code/schema/flag/credential change. AC7 not engaged. Production byte-equivalent throughout.

## Why this session matters

The independent-review discipline — a FRESH, independently-launched review (not the first review's own conclusions re-read) catching what a same-session first-hand review misses — has now validated itself **three times in one day** (2026-07-19), and is currently an ad-hoc practice invoked at the founder's request rather than a standing rule. This session closes that gap: encode it as a process-rule amendment (a PR19 candidate) and produce a reusable review-workflow template so future sessions don't have to reinvent the pattern or rediscover its pitfalls from scratch.

**The three grounding instances (verified in `operations/decision-log.md`, all 2026-07-19):**
1. **`D-KATHEKON-DIKAIOSYNE-SELF-CIRCLE-NARROWING-BUILT-REVIEW-FOLDED-2026-07-19`** — the same session that built the self-circle narrowing ran its own first-hand adversarial review and called it clean. A **fresh** Workflow (`wf_95e8d22f-7a8`, 20 agents, ~5.05M tokens), given the same diff without the first review's conclusions, found a **HIGH** defect the self-review missed: `isSelfRegardingLoop` failed to gate on `!engagement.engaged` first — violating a discipline its own author had documented in a docstring one file over but not applied in the consumer. Fixed at the root; the pre-fix test had asserted the gate existed without a fixture capable of detecting its absence.
2. **The AE-2 loop-fold session** (same decision-log entry cluster, `D-AGENT-EXTENSION-AE2-INDEPENDENT-REREVIEW-FOLDED-2026-07-19`) — a first-hand review (forced by an account spend-limit outage, completed per the project's own §4 precedent) found 3 low/nit findings and called the core logic clean. An independent re-run (`wf_05daaca5-c3d`, 14 agents, ~3.48M tokens, 0 errors) after the limit reset found **7 confirmed defects**, including a genuine spec-infidelity the first pass missed entirely (calibration-class elements were folded into domain levels despite the spec's plain-text guard that they shouldn't be).
3. **This very AO plan's own v2 critique** (`D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19`) — a first-hand draft was independently critiqued (`wf_e55e52e4-d7c`, 4 dimensions, 3 completed live, the 4th completed first-hand per the spend-limit precedent) and returned **23 findings, all confirmed, none refuted** — including 3 high-severity items (the unattended-activation gate being the single most consequential addition to the whole plan).

Same pattern, three independent domains (a predicate/fold engine change, a different engine change, and a planning document), same day. That is no longer a coincidence worth treating as optional.

**The implementation caution to encode alongside the rule:** the AO-plan-critique review's own post-processing hit a real bug — a `results.filter(Boolean)` applied before a positional `flatMap` mislabeled the proactive-safety dimension's 7 findings as "accuracy" once the true accuracy dimension errored out and dropped from the array at a different index. Caught during adjudication by re-attributing findings by content, not by the (corrupted) positional field. Any review-workflow template this session produces must name this as a concrete pitfall — filtering a results array before using its POSITION to key into anything is unsafe when any branch can independently drop out.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — note in particular the AI-failure-modes table (KG-EX1 / method-before-purpose) and the existing PR1–PR18 range; this session adds PR19.
2. `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P3 IN FULL, plus §7 (Rule B) and §8 (the v2 fold log) — §8 IS the third grounding instance this session cites, read it as primary source, not paraphrase.
3. `operations/decision-log.md` — the three entries named above in full (search for `wf_95e8d22f-7a8`, `wf_05daaca5-c3d`, `wf_e55e52e4-d7c`) — read what each review actually found and how the "completed first-hand under a spend-limit outage" fallback was applied, since that fallback is itself part of what PR19 needs to codify.
4. `/adopted/project-instructions-snapshot.md` — the current PR1–PR18 range, to see the existing rule format/voice before drafting PR19 in a matching style. Confirm PR18 is genuinely the last entry (verified this session: it is).

Confirm at open: tier (`governance`); hold-point status (P0 0h — untouched by this session); model selection (N/A); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Draft PR19
A process-rule amendment on `/adopted/project-instructions-snapshot.md`, matching the existing PR1–PR18 voice/format (see PR18's entry for the most recent precedent shape — source, recurrences-cited, statement). Core content, per the plan's own scope language:
- **Trigger:** any session materially changing trust-core / predicate / fold / engine surfaces, **and** — per this plan's own dogfooding — any session drafting a build plan with live-op or org-safety consequences.
- **Requirement:** the session closes only after an INDEPENDENTLY-LAUNCHED review (a fresh Workflow given the code/document itself, explicitly NOT the first review's conclusions or summary) **or** an explicit founder waiver recorded at close.
- **The spend-limit fallback, codified, not just practiced:** when an independent review dies wholesale on an account spend/session limit, the standing project precedent (§4, cited repeatedly through 2026-07) is: complete the review FIRST-HAND across every dead dimension, disclose the single-perspective limitation explicitly in the close, and — when the limit later resets — an independent re-run MAY follow (not "must," since two of the three grounding instances show this catches real things the first-hand pass missed, but the plan doesn't currently mandate the follow-up re-run as non-optional; decide explicitly here whether PR19 should make the eventual independent re-run mandatory once the limit resets, or leave it recommended-but-optional as today, and record the reasoning either way).
- **The implementation caution**, named explicitly in the rule or its accompanying template (see Step 2): never key downstream processing off array POSITION once any upstream `filter`/error-drop could have changed which branch sits at which index; re-attribute by content/identity instead.

Cite this rule by number (PR19) in the amendment itself and update the standing-protocol-cache's PR range references in the same session (the cache's own update discipline: "When any of the following changes... update this cache in the same session as the governance change" — this session's PR19 addition is exactly that trigger).

### Step 2 — Build the reusable review-workflow template
New file: `operations/review-harness/independent-review-workflow-template.md` (the directory doesn't exist yet — confirmed this session; create it). Seed it from the three 2026-07-19 runs' actual shape, not an abstract ideal:
- The dimension-based fan-out pattern (each run above used 4–20 agents across named dimensions — kathekon-split/combiner-wiring/envelope-scope/etc. for the AE-2 review; sequencing/tiering/accuracy/proactive-safety for the plan critique).
- The "given the artifact itself, not the prior review's conclusions" independence requirement, stated as a hard constraint on how the reviewing Workflow is launched — this is the entire point; a review that receives a summary of "here's what we think is fine" is not independent.
- The spend-limit-outage fallback procedure (first-hand completion across dead dimensions; explicit single-perspective disclosure at close; the eventual independent re-run).
- The index-alignment pitfall (Step 1's caution) as a named implementation gotcha for anyone building the post-processing/aggregation step of a future review Workflow.
- A short "what counts as a genuine finding vs. noise" note, drawing on the pattern that all three 2026-07-19 runs found REAL, previously-invisible-to-the-author defects — not busywork.

### Step 3 — Founder sign-off
PR19 changes the project's own instructions surface — per the plan's own deliverables line, this needs explicit founder sign-off in this session, not a silent adoption. Present the drafted rule (Step 1) via AskUserQuestion or direct review before treating it as Adopted.

### Step 4 — Update the standing-protocol-cache
Per the cache's own update-discipline section: reflect the new PR19 in the cache's PR-range references, in the same session as the change (a same-session `D-CACHE-DRIFT-RESOLVED-...` entry, per the established pattern).

### Step 5 — Append decision-log entry (lean form)
Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

### Step 6 — Session close (lean form)
Pattern: per the cache's §"Lean session close".

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + plan §3-P3/§7/§8 + the three decision-log entries read | 20–25 min |
| Step 1 — draft PR19 | 20–30 min |
| Step 2 — the review-workflow template | 25–35 min |
| Step 3 — founder sign-off | 10–15 min |
| Step 4 — cache update | 5–10 min |
| Decision-log + close | 15–20 min |
| **Total** | **~1.5–2 hours** (matches the plan's "half-session" estimate loosely, on the longer side since it's the template's founding session) |

## Rollback path

Documents-only session — no code / schema / flag / credential / deploy change. `git revert` the records commit reverts the PR19 amendment, the template file, and the cache update together; nothing live depends on any of it.

## Forecast

Success is PR19 adopted in the project-instructions-snapshot's own voice, a review-workflow template concrete enough that the next session needing an independent review doesn't have to re-derive the pattern from three scattered decision-log entries, and the cache updated in step so it doesn't drift (the exact failure mode PR18 itself was created to prevent). This is a self-contained, low-risk session — a good one to run while P2 is parked. Nothing here touches the S11 flip, weights posture, or the 0h call.

End of prompt.
