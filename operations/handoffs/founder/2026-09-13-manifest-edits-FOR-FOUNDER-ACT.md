# `manifest.md` — two edits prepared for the founder's own act (D-4 and D-8)

**Prepared 2026-09-13 (evening, from `date`) by session `sagereasoning-b6 [efdaf2]` under
`2026-09-14-QS2-opener-collision-and-pre-W2-items-NEXT-SESSION-PROMPT.md` Task C.**

> **⛔ `manifest.md` IS NOT EDITED BY THIS SESSION, AND MAY NOT BE EDITED BY ANY SESSION.** Both items
> are **reserved to the founder's own act** — D-4 by the mentor's ruling (*"The application to
> manifest.md is the founder's own act after this ruling"*), D-8 because §AC5 is a governing safety
> surface. This file exists so the act is a **paste, not a composition**.
>
> **One file, deliberately** — both edits are the same governing surface and the same class of act, so
> they should be one sitting, not two.
>
> **Filename note:** the authoring prompt labelled this `2026-09-14-…`; the machine clock reads
> **Sun 13 Sep 2026 23:07 AEST**, and the file is dated from `date`.

---

# EDIT 1 — D-4: the ATRF item-3 amendment (wording RULED)

**Ruling:** Q-R11-C1, verbatim and canonical at
`operations/agent-circles-2026-08/2026-09-13-mentor-ruling-R11-seven-questions-verbatim.md`.
**Source draft:** `operations/agent-circles-2026-08/2026-09-13-R11-manifest-ATRF-item3-amendment-DRAFT-FOR-RULING.md` §3 (the "full" option).

**What was ruled:** *"The full wording is ruled. The phrase 'whether the idea was completed' is
removed."* The reason, in the ruling's own words: *"'Completed' as succeeded is not in the signal — R8
§2 carries no success/failure indicator. 'Completed' as executed at all is attested by the signal's
existence, not by a field in the signal."* **The minimal-difference alternative in the draft's §3 is
NOT the ruled wording — do not paste that one.**

## Location

`manifest.md` **line 265** at this writing — the third carried element of the **Agent Task Reasoning
Framework** section. *(Line numbers rot; the opening words `**3. Idea completion signal.**` identify
it, and it occurs exactly once in the file.)*

## BEFORE — the line as it stands today (verified this writing, verbatim)

> **3. Idea completion signal.** When the IDEA loop proposes an action and the agent elects and executes it, a thin task-agnostic completion signal returns to the harness: whether the idea was completed and how the outcome compared to the proposal. This closes the loop on each proposed idea without exposing task details.

## AFTER — the ruled full wording, to replace it entirely

> **3. Idea completion signal.** When the IDEA loop proposes an action and an executing agent adopts and executes it, a thin task-agnostic completion signal returns to the harness carrying the executing agent's **examination of its own assent** — what impression it assented to when it adopted and executed the idea, whether that assent was examined or habitual, and whether the threshold reached was katorthoma or kathekon — with a refuse-to-attest branch and the cycle identity, under the producer's declared provenance. **It carries no task-outcome content and no comparison of outcome to proposal:** it closes the loop on each proposed idea as evidence about the quality of the assent, never about the result, and without exposing task details.

## What changes, and why each change is there

| Change | Ground |
|---|---|
| *"the agent elects and executes it"* → *"an executing agent adopts and executes it"* | Distinguishes the proposing loop from the executing agent; the signal is the **executing** agent's. |
| *"whether the idea was completed"* — **removed** | Ruled out. Execution is attested by the signal's existence (a producer attests only after executing); success is not in the signal at all. Retaining the phrase *"preserves an ambiguity the full wording resolves."* |
| *"how the outcome compared to the proposal"* → the assent-examination content | The **substantive** correction. C4 held that the completion signal *"carries examination-quality content only"* and that the absence of task-outcome content is *"the ruling's own doctrine made structural."* The old line contradicted that on the governing surface. |
| **New:** *"no task-outcome content and no comparison of outcome to proposal"*, stated affirmatively | Closes the outcome-comparison reading explicitly rather than by omission. |
| **New:** the refuse-to-attest branch, cycle identity, declared provenance | Present in the ruled schema; the manifest line did not carry them. |

## Checks for the sitting that applies it

- **Single occurrence** — `grep -n "Idea completion signal" manifest.md` returns exactly one line. Confirm before and after.
- **Nothing else in the ATRF section is touched.** This is one element of several.
- **No code, schema, endpoint or handler changes.** The completion-signal schema already matches the ruled wording; this corrects the *document*, not the mechanism.
- **Record it** in the decision log at the **physical tail**.

---

# EDIT 2 — D-8: the §AC5 internal contradiction

**Not ruled — a founder decision.** Carried as F-F, untaken, and surfaced independently by two prior
sessions. **This edit changes no count and no perimeter membership; it changes the section's form.**

## The defect, stated precisely

`manifest.md` **line 372** bolds:

> **This section does not hand-enumerate route-level membership.**

…and gives a good reason (two prior enumerations went stale, the second silently for over a month).
**The two paragraphs immediately following enumerate all 43 route-level members by name** — 13
unconditional, then 30 flag-gated.

**The counts are CORRECT today.** Re-derived from the registry arrays at this writing: `HUMAN_FACING_POST_ROUTES` = **43**, `SUBSTRATE_GATE_ROUTES` = **2**, total **45** — matching what §AC5 states. **The defect is not staleness. It is that the section asserts a discipline in bold and then breaks it in the next breath**, which re-creates in the rewritten section the exact drift risk the rewrite was performed to eliminate.

**A sharper point worth seeing before choosing:** the bolded sentence **itself** hand-maintains two counts — *"(route-level, includes both the **30** currently flag-gated members and the **13** that screen unconditionally)"*. So the claim is falsified inside its own sentence, not only by the paragraphs below it.

## Three options. This session states no preference; it is a governing-surface call.

### Option A — delete the enumeration, honour the claim as written

Remove the *Route-level (43)* heading and both member lists. Keep the substrate-gate pair (**2 members, stable since 2026-05-28, and not the thing that drifts**). Keep every historical count-correction note — they are the record of why.

**Cost:** a reader wanting membership must open the registry. **That is exactly what the bolded sentence promises**, so the cost is the promise being kept.

### Option B — keep the enumeration, make the claim honest

Replace the bolded sentence with an accurate one, e.g.:

> **The registry is canonical; the enumeration below is a dated snapshot and is not authoritative.** It has gone stale twice (first at eight members, then at thirteen — the second silently, for over a month, found only because a session re-derived from source rather than restating the document). A session needing current membership reads `HUMAN_FACING_POST_ROUTES` and `SUBSTRATE_GATE_ROUTES` directly and **must not** trust the list below.

**Cost:** keeps the drift risk, mitigated by labelling. The snapshot is already dated (*"as of the 2026-09-04 re-derivation"*), so this mostly aligns the claim to what the section already does.

### Option C — Option A **or** B, plus make the discipline executable

Add an assertion to `website/src/lib/__tests__/r20a-invocation-guard.test.ts` that either (A) §AC5 contains **no** route-path enumeration, or (B) any enumeration it does contain **matches the arrays exactly**.

**This is the project's own repeatedly-learned lesson** — *"where a count matters, prefer an executing check over a written instruction"* — and the same file already carries a precedent: its docstring's hand-maintained perimeter count went stale **three times despite carrying its own emphatic warning**, and is now enforced by assertion instead.

**⚠ Option C is a code change and must be its own act**, not part of the manifest sitting. It touches no `GUARD_RE` path (verified: the regex does not match `r20a-invocation-guard.test.ts`), but it is code, needs a mutation-verified pin, and falls under PR19.

**Recommendation on structure, not on choice:** whichever of A/B is elected, **elect C alongside it**. A and B are both written instructions, and this section's own history is three consecutive demonstrations that a written instruction does not arrest this drift.

## Checks for the sitting that applies it

- **Re-derive 43 / 2 / 45 from the arrays first** — do not trust the numbers in this file or in §AC5. If they have moved, the edit is still valid but the snapshot must be refreshed or (Option A) removed.
- **Do not delete the count-correction notes.** They are the record of three failures and the reason the section reads as it does.
- **Do not alter perimeter membership.** Nothing here adds or removes a route; the four-step addition protocol at the section's end is untouched.
- **Record it** in the decision log at the physical tail.

---

## What this session did and did not do

**Did:** quote the ruled D-4 wording from the verbatim; locate both edits by grep and confirm each is a
single occurrence; re-derive the perimeter counts from the registry arrays; verify that the AC5
contradiction is a form defect and not a stale count; verify `GUARD_RE` does not match the registry
test file; present both as before/after.

**Did not:** edit `manifest.md`; edit the registry test; apply any wording; record anything in the
decision log on the founder's behalf.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
