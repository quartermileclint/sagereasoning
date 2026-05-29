# Next-Session Prompt — Adversarial Review of Prior Session's Configuration-Audit Thought-Experiment Findings

**Stream:** founder.
**Tier:** **`governance`** (documentation-only review; lean templates apply per `/adopted/standing-protocol-cache.md` §"Work categories"). **No code; no governance documents modified; no execution.** This is a review session — the output is a structured review document, not a build artefact.
**Risk classification:** **Standard** under 0d-ii (review of a draft document; no production or governance change). The reviewer may RECOMMEND classifications for future arcs; they may NOT change classifications in-session.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor session close (operational state at handoff):** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md` — Option A Session 4 is **Wired, Verified, Vercel-green, committed**. Nothing in flight on that work.
**Predecessor decision-log entries:** `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28`; `D-R20A-OPTIONA-S3-REFLECT-WIRED-2026-05-28`; `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`.
**Primary deliverable to review:** `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` (the prior session's full findings; comprehensive standalone). **Read this in full before doing anything else.**

---

## Why this session matters

After Option A Session 4 Verified, the founder asked the prior AI for a thought experiment: what other dimensions of "approved configurations of product use" deserve the same configuration-level treatment that Option A just applied to R20a? The prior AI surfaced six dimension buckets, four strategic options, a PR1 meta-tension, and a three-phase execution plan if Option I were chosen. The founder approved Option I.

**But the prior AI did not have a chance to be adversarially reviewed before the session closed.** The four structural questions (Q1–Q4 in the findings document §6) are open. The dimension scope, the option framing, the three-phase characterisation, and the PR1 meta-tension all rest on a single AI's analysis without an independent check.

**This session is the check.** Per PR12 (negative-finding discipline) and the standing cache's §"AI failure modes to watch for at session open" — particularly the "prescribe-before-grounding" pattern — a fresh model approaching the findings cold has a meaningful chance to spot patterns, blind spots, and overconfident framings that the prior AI couldn't see.

**This session does NOT execute the cataloging.** The cataloging arc is on the other side of this review. If the review confirms the prior findings as scoped, the founder opens a Phase 1 catalog session next (per the prior AI's three-phase plan). If the review challenges any aspect, the founder may revisit Option I, amend the bucket scope, or reframe entirely before opening Phase 1.

---

## Pre-conditions (reviewer confirms at session open)

1. Reviewer has read `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` **in full**. This is the operative document; the reviewer's task hinges on engaging it directly, not via summary.
2. Reviewer has read the predecessor close `/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md` so the operational state at handoff is clear (Option A Session 4 verified; nothing in flight; Vercel green).
3. Reviewer has read the standing protocol cache and project-instructions snapshot so the governance frame (PR1–PR17; tier vocabulary; status vocabulary) is loaded.
4. Reviewer understands the role: **adversarial review, not collaborative execution.** The reviewer's job is to confirm or challenge — not to start building anything. If the reviewer finds the work compelling and wants to immediately help execute, that is a failure mode this prompt explicitly guards against (the founder needs a check, not a force-multiplier).

---

## Part A — Open under the protocol

Read in order (governance tier — lean reads only on the items relevant to the review):

1. `/adopted/standing-protocol-cache.md` — confirm tier (`governance`), risk class (Standard), signals (diagnostic-certainty rows), the **AI-failure-modes subsection** (this is the canonical reference for what an adversarial reviewer should look for; the prior AI's findings may exhibit any of these patterns).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" holds; build-arc context.
3. `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` — **THE OPERATIVE DELIVERABLE. Read in full.**
4. `/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md` — operational state at handoff.
5. `/operations/handoffs/founder/2026-05-28-OPTION-A-session-5-NEXT-SESSION-PROMPT.md` — the in-limbo S5 prompt the prior AI drafted. **Read it because Q1 in the findings doc asks how to handle it.**
6. `/manifest.md` targeted sections: **§PR1** (the meta-tension the prior AI raised — read this verbatim to evaluate whether the AI's characterisation is accurate); §R20a, §R19 (the dimensions Option A engaged); §AC4, §AC5, §AC11 (architectural constraints relevant to multi-dimension analysis).
7. `/drafts/2026-05-28-r20a-single-catch-contract.md` §5.5 — the source of the "L1–L7 configuration flows" reference (a Pre-condition still open).
8. `/operations/decision-log.md` last 3 entries (S4, S3, S2 of Option A) — for context on how the original Option A pattern was framed and adopted.

Confirm at session open per the cache's failure-modes subsection (**narrate before any review work**): where we are in the arc (post-Option-A-S4 verified; thought-experiment findings under review); what's queued behind this (Phase 1 catalog session, OR whatever the review recommends instead); what's awaiting the founder (review-output review + Q1–Q4 decisions); what's awaiting the reviewer (this review).

---

## Part B — Procedure (governance; lean review form)

### Step 1 — Lean CCP drafted in chat

Per the standing cache's "Lean templates" section for Standard-risk sessions. **Visible in chat; founder OK before any review output is written.**

1. **What is changing.** A new review document is produced — `/drafts/2026-05-28-configuration-audit-thought-experiment-REVIEW.md` (or similar; reviewer proposes the exact path). No existing file is modified; no governance is changed; no code is touched.
2. **What could break.** Negligible — this is a review-only deliverable. The risk is in the review being inadequate (rubber-stamp the prior findings without genuine challenge, or alternatively over-challenge with no foundation) and pushing the founder into a worse decision than no-review-at-all. Mitigated by Step 2's adversarial review framework.
3. **Rollback path.** Delete the review document if it's not useful.
4. **Verification step.** Founder reads the review document directly (0c framework — "Business document: founder reads directly"). No automated verification.
5. **Founder approval.** Lean form — OK on (a) the review document's proposed path/name, (b) the review's structure (whether to follow the suggested seven sections below or amend), (c) whether to use AskUserQuestion at the review's end to direct founder action OR to leave the founder to decide after reading.

**Wait for "OK to (a)(b)(c)" before Step 2.**

### Step 2 — Adversarial review of the findings document

The reviewer engages each section of `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` and produces a structured review. The suggested review structure (the reviewer may amend per CCP item (b)):

**Section A — The six buckets (findings §2).**
- Is the bucketing taxonomy correct? Are there dimensions the AI grouped incorrectly?
- Are there dimensions the AI MISSED entirely? (PR12 — try at least three angles before concluding nothing is missed.)
- Are buckets 5 (Operational resilience) and 6 (Future migration prep) appropriately scoped, or did the AI over-add?
- Is the AEO interpretation (Answer-Engine Optimisation) the right read of the founder's intent? What would a narrower reading look like?
- Are any sub-dimensions over-scoped (will explode in scope when engaged) or under-scoped (look small but conceal complexity)?

**Section B — The four strategic options (findings §3).**
- Are the four options genuinely exhaustive? Is there a fifth option the AI didn't surface (e.g., "abandon configuration-level analysis entirely and return to per-rule analysis," or "engage external review/audit firm before continuing")?
- Are the trade-offs for each option faithfully characterised, or did the AI bias toward Option II/III in the description while presenting the choice as neutral?
- Is the AI's "honest read" (preferring Option III, calling Option I "ambitious and the riskiest") a fair characterisation or an under-recognition of Option I's strategic merit?
- Did the AI surface the option the founder chose (Option I) with the same rigour as the option the AI preferred (Option III)?

**Section C — The PR1 meta-tension (findings §4).**
- Read PR1 verbatim from `/manifest.md`. Does PR1 literally apply at the dimension-of-analysis level, or is the AI extending PR1's spirit beyond its scope?
- If PR1 doesn't literally apply, is the meta-tension still real (just on different grounds, e.g., bandwidth, decision fatigue, scope inflation)?
- If PR1 does literally apply, did the AI correctly identify it, or under-state it?
- What's the right way for the eventual decision-log entry to record this tension — as a PR1 violation accepted with reasoning, OR as a non-PR1 tension framed under its actual governing principle?

**Section D — The three-phase Option I plan (findings §5).**
- Is the three-phase split the right cut, or could it be one-phase (catalog AND immediate test where possible) or four-phase (catalog → design → build → test, with explicit ADR sessions per dimension)?
- Is the 6–25 session estimate plausible? Realistic? Wildly optimistic? Wildly pessimistic? (Hint: the reviewer can sanity-check against Option A which took 5 sessions for ONE dimension.)
- What dependencies between dimensions did the AI miss? (E.g., developer dashboard depends on what telemetry exists per dimension; security audit depends on per-configuration auth posture being already documented; AEO depends on positioning being settled.)
- Is the implicit assumption that Phase 1 can produce a workable matrix in 3–4 hours realistic?

**Section E — The four open structural questions (findings §6).**
- Are Q1–Q4 the right questions? Are there OTHER decisions that need to be made before Phase 1 opens?
- For each of Q1–Q4, what would the reviewer recommend and why? (The reviewer is not deciding — the founder decides — but the reviewer should surface a recommendation per founder preferences: "I decide direction and scope. You surface options, constraints, and risks. Present choices with reasoning — not prescriptions.")

**Section F — The eight second-order open items (findings §7).**
- Each of the eight items: is it correctly identified? Should any be elevated to a Q5–Q12 with explicit founder decision needed before Phase 1?
- Item #8 (backout pathway for Option I) is particularly important — if Phase 1 reveals the matrix is unworkable, what's the rollback? Did the AI under-scope this?

**Section G — Patterns the reviewer notices that the AI didn't surface.**
- The reviewer's free-form observations. Anything the AI exhibited that resembles a pattern in the standing cache's §"AI failure modes" table (prescribe-before-grounding, narrow unit of analysis, one-line operational hand-off)? The reviewer should explicitly cite which patterns appear vs which don't appear.

### Step 3 — Review document

Produce `/drafts/2026-05-28-configuration-audit-thought-experiment-REVIEW.md` (or the path approved at CCP item (a)). The document carries the seven-section structure above (or the amended structure per CCP item (b)). For each section, the review answers each question above with reasoning, not just yes/no.

The review's status header: `Status: Drafted YYYY-MM-DD. Under review. Reviewer: [model identifier]. Reviewer-recommended next action: [single sentence].`

### Step 4 — Single-sentence reviewer recommendation

At the END of the review document, the reviewer writes ONE sentence: their net recommendation. This is what the founder reads if they read nothing else.

Examples of the form:
- "I confirm the prior AI's findings as scoped; the founder should proceed with Phase 1 catalog session next."
- "I confirm the buckets but recommend Option III rather than Option I; the founder should re-decide before opening Phase 1."
- "I challenge the three-phase plan; the founder should re-scope before opening Phase 1."
- "I confirm Option I but recommend resolving Q4 (session-boundary) before resolving Q1–Q3."
- Etc.

The reviewer commits to ONE sentence. No qualifications. The founder reads it and decides what to do.

### Step 5 — Decision-log entry (lean form)

Per the standing cache's "Lean decision-log entry" template. Entry name: `D-CONFIG-AUDIT-FINDINGS-REVIEWED-YYYY-MM-DD`. Status: Adopted (the review is adopted as a deliverable; the FINDINGS document remains Under Review until the founder acts on the review's recommendation). Reference both `/drafts/2026-05-28-configuration-audit-thought-experiment-findings.md` and the new review document.

### Step 6 — Session close (lean form)

Per the standing cache's "Lean session close" template. Production state at close: **UNCHANGED**. The review is the deliverable; no code touched; no governance documents modified. The founder's next move depends on the reviewer's single-sentence recommendation.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + S4 close + findings document + S5-limbo prompt + manifest targeted sections read | 30–50 min |
| Step 1 lean CCP + founder OK on (a)(b)(c) | 10–15 min |
| Step 2 adversarial review (seven sections; per-section question engagement) | 60–120 min |
| Step 3 review document drafting | 30–60 min |
| Step 4 single-sentence recommendation | 5–10 min |
| Step 5 decision-log entry (lean) | 10–15 min |
| Step 6 session close (lean) | 10–15 min |
| **Total** | **~2.5–4.5 hours** |

Natural pause points: after Step 1 (CCP approved); after each of the seven review sections (Section A through G); after Step 4 (recommendation locked); after Step 5 (decision-log appended).

---

## Locked context — do NOT re-derive

- **Option A Session 4 is Verified.** Don't re-litigate the audience-rendering work, the helper design, the prose-mode keys, the Calling/Reflect builder refactors, or the `/api/reason` fix. Those decisions are Adopted as of `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28`.
- **The founder approved Option I.** The reviewer may challenge whether Option I was the right choice, but the reviewer does NOT decide on the founder's behalf — the founder decides whether to revisit Option I based on the review.
- **All four R20a flags remain UNSET in Vercel.** No production change this session.
- **The prior AI's findings are a draft, not Adopted governance.** The reviewer is reviewing a draft; nothing here is sacred.
- **The reviewer does not execute.** No code, no catalog, no governance amendments, no commits. The output is a review document.
- Branch `main`. The reviewer does no git operations.

---

## Carried forward (so nothing is forgotten)

- **The findings document's §7 second-order open items.** Eight items the prior AI flagged as not-yet-decided. The reviewer should examine whether any belong as explicit Q5–Q12 founder decisions vs whether they remain background notes.
- **The C2 live run + production activations + M-7 closure-ready** are pushed out by Option I per the prior AI's framing. Regardless of the review's conclusion, the schedule impact is real.
- **PR5 candidate observations from Option A (carried into the review):**
  - "design-spec-vs-implementation flag-coupling tension surfaces only when the design spec is implemented end-to-end" (S2 origin; 1st recurrence).
  - "design-spec wording 'X first, Y second' admits dual interpretations" (S3 origin; 1st recurrence).
  - "regression-check assumptions can be over-cautious when assertions are structural rather than text-exact" (S4 origin; 1st recurrence).
  - The reviewer should examine whether the prior AI's thought-experiment findings exhibit any pattern that could be a new PR5 candidate observation.

---

## Rollback path

The review document is additive. Rollback = `git rm` the review file and revert. The findings document (the predecessor) is untouched. The S5-limbo prompt is untouched. No production change.

---

## Forecast

The review session ends with a structured review document at `/drafts/2026-05-28-configuration-audit-thought-experiment-REVIEW.md` (or the approved path) and a single-sentence reviewer recommendation. The founder reads the recommendation and the document; the founder then decides whether to:

- **Proceed to Phase 1 catalog session as the prior AI scoped** (review confirms findings as-is).
- **Proceed to Phase 1 with amended scope** (review confirms most findings but challenges specific elements; founder amends).
- **Revisit the strategic choice between Options I–IV** (review challenges the option framing or the Option I choice itself; founder re-decides).
- **Defer the cataloging arc entirely** (review surfaces a blocker the founder hadn't anticipated; founder pauses).

Production remains UNCHANGED at session close. The four R20a flags remain UNSET. Nothing in Option A Session 4's verified state is affected.

End of prompt. Opens on `main`. **This is a Standard-risk governance review session — no code, no governance changes, no execution.** The reviewer's value to the founder is in being independent, adversarial, and willing to surface blind spots that the prior AI couldn't see.
