# Mentor consultation — Q3's open design choice: staged-pause mechanism (Option A vs Option B) — verbatim

**Date:** 2026-08-02 · **Session:** the Q2/Q4/Q3 build session. **Status:** binding — verbatim wins over any summary or scope-document prose where they diverge.

**Context.** The 2026-08-02 five-question ruling (`2026-08-02-mentor-consultation-pr19-five-fidelity-questions-verbatim.md`, Q3) confirmed that circle-4 (`cosmopolis`) violations must enter a **staged pause tier** rather than hard-deny, and that this is a hard build prerequisite before `SUBSTRATE_AGENT_CIRCLES_ENABLED` can be set. The mentor's language — the tier "accumulates evidence, and earns promotion to the deny class through demonstrated false-positive performance" — names a *process*, not a specific mechanism. The Q3 scope document (`2026-08-02-Q3-staged-pause-scope.md` §"The genuinely open design question") set out two options and recommended Option A. The founder put the question to the mentor.

**The question as put** (condensed from the scope doc's own framing):

> **Option A — stateless pause, manual promotion (recommended).** Every circle-4-isolated violation is *always* `pause_for_review`, indefinitely, until a human deliberately narrows or removes the override in a later, separately-scoped, founder-walked session. "Accumulating evidence" happens passively, via artifacts this project already produces for free (the signed `Layer2Assessment` with full circle/obligation detail; the harness's `GUARD-CAUTION` log line). No new schema, no new table, no automated counter, no promotion algorithm. This mirrors the project's own established MEASURE→ENFORCE convention (closest precedent: the Trust Layer S9→S11 observation-period pattern).
>
> **Option B — stateful, automatically-promoting counter.** Persist per-fixture-class or per-credential circle-4 outcomes (adjudicated true/false positive) and automatically promote to hard-deny once some confirmed-true/zero-false threshold is reached. Architecturally closer to the Trust Layer S11 false-hold observation instrument, but with an *automated* promotion rule — which S11 itself deliberately avoided on the mentor's own prior counsel. Materially larger build: a new table, an adjudication surface (who confirms true/false positive and how), and a promotion algorithm carrying its own miscalibration/gaming risk.
>
> The scope doc's stated reasoning for recommending A: it satisfies the mentor's literal requirement with the smallest reviewable surface, and defers the harder promotion design until a real corpus of circle-4 pauses exists to design against — designing an automatic promotion rule today, against zero real cases, risks exactly the "approximation that almost works" failure mode the mentor's own cross-questioning has flagged as this build arc's recurring pattern.

---

## The mentor's answer (verbatim)

> ## Q3 Open Design Choice — Staged Pause Mechanism
>
> **Option A. The ruling is satisfied by stateless pause with manual promotion. Option B must not be built at this stage.**
>
> ---
>
> ### Why Option A satisfies the ruling
>
> The ruling required: pause, not deny; accumulation of evidence; promotion as a deliberate human act once the evidence warrants it. Option A delivers all three. The signed Layer2Assessment with full circle and obligation detail is the evidence. The GUARD-CAUTION log line is the accumulation mechanism. The founder-walked session is the deliberate human act of promotion.
>
> Nothing in the ruling specified that accumulation must be automated or that promotion must be algorithmic. It specified that promotion must be earned — which means it must be examined, not computed.
>
> The closest precedent the scope doc names is exactly right: the Trust Layer S9→S11 observation-period pattern, where the flip stayed a human decision on prior counsel. That counsel was given because automated promotion carries its own miscalibration risk — a promotion algorithm is itself a mechanism that can approximate the standard rather than satisfy it.
>
> The ruling that generated the staged-pause requirement was issued precisely because LLM extraction at circle-4 confidence does not yet meet the zero-false-positive standard a deny requires. Building an automated promotion algorithm against zero real cases does not solve that problem. It adds a second unvalidated mechanism on top of the first.
>
> ---
>
> ### Why Option B must not be built at this stage
>
> The observation history across this entire build arc shows a consistent failure mode: designing against anticipated cases rather than actual ones, producing mechanisms that almost work and carry their own miscalibration risk. The scope doc names this explicitly and correctly. Option B is that failure mode instantiated precisely.
>
> A promotion algorithm designed today, against zero circle-4 pauses, is not a solution to the evidence problem — it is a premature architectural commitment that will need to be unwound when real cases reveal what the algorithm got wrong.
>
> There is a deeper issue. Option B introduces an adjudication surface: who confirms true/false positive, and how. That question is not answered in the proposal, and it cannot be answered well without a corpus of real cases to design against. An unanswered adjudication question at the centre of an automated promotion mechanism is not a detail to be resolved later. It is the load-bearing element the mechanism depends on. Building the mechanism before the adjudication question is answered is the same category of error as setting the circle-4 flag before the staged-pause mechanism exists — the thing the mechanism depends on is not yet in place.
>
> ---
>
> ### The precise ruling
>
> Build the pause. Do not build the promotion algorithm.
>
> The flag for circle-4 may be set once the stateless pause path exists and has been verified to fire correctly on candidate violations without touching the deny path. Promotion to hard-deny is a future founder-walked session, scoped when a real corpus of circle-4 pauses exists to design against. That session will have what today's build does not: actual cases, actual false-positive rates, and an adjudication question that can be answered from evidence rather than from anticipation.
>
> The not-yet-built promotion algorithm is not a gap in the current build. It is the correct shape of the current build. The gap would be building it now.
>
> ---
>
> ### One observation worth naming directly
>
> The pattern the observation history has been tracking across this arc — reasoning to the boundary of what the existing framework can settle, then routing the unresolved question here rather than resolving it prematurely — is present in how this question was framed. The scope doc named the failure mode explicitly before asking the question. That is the same epistemic discipline that caught the deploy-versus-flag-flip distinction in Q1, the Arm-2 asymmetry in Q4, and the staging gap in Q3's original ruling.
>
> But there is something worth examining on the practitioner side, not the build side. The observation history shows a founder who has become increasingly precise at identifying where approximation risks entering the build — catching the gap between almost and actually at the architectural level with genuine sophistication. What appears less frequently in the record is the same precision applied inward: catching the gap between almost and actually in the practitioner's own reasoning before it reaches the build.
>
> The Q4 residual question from the previous session is the clearest example. The two readings were both defensible from existing rulings. The question was routed here correctly. But the routing happened after the build had already found the gap through adversarial review — not before. The adversarial review is doing work that ideally the practitioner's own examination would catch first.
>
> That is not a criticism. The adversarial review is functioning exactly as designed, and routing unresolved questions here rather than forcing premature closure is the right instinct. But the direction of travel the observation history is tracking suggests the next edge of the work is this: applying the same zero-false-positive discipline to the practitioner's own examination of the build decisions before they reach adversarial review, rather than after.
>
> The morning preparation that held in the live situation — the information arriving and being processed rather than the impulse running ahead — is the personal analog of what that would look like at the build level. The build is being held to a high epistemic standard. The question worth carrying is whether the practitioner's own examination is being held to the same one.

---

## What this settles

**Option A is binding.** Q3's build is the stateless pause: always `pause_for_review` on a circle-4-isolated violation, indefinitely, with no counter, no persistence, no adjudication surface, and no automated promotion path. **The absence of a promotion mechanism is a requirement of the ruling, not a scope choice** — a future session that "completes" Q3 by adding one, without a real corpus of circle-4 pauses to design against, would be building the thing this ruling forbids.

**The flag-setting condition the ruling states:** "The flag for circle-4 may be set once the stateless pause path exists and has been verified to fire correctly on candidate violations without touching the deny path." Both halves were discharged in the same session as this ruling — see `D-AGENT-CIRCLES-Q2-Q4-Q3-BUILT-REVIEW-FOLDED-2026-08-02` (the pause fires on the C3 anchor case on real extractions; the deny path is untouched, pinned by Q3-5/6/9/9b/10/15 and confirmed by both live batteries reading 0 drifts in both flag directions).

**Promotion to hard-deny is a future founder-walked session**, scoped only once real circle-4 pauses have accumulated. Not scheduled, not scoped, deliberately.

## The closing observation — recorded, not actioned here

The mentor's final section is directed at the practitioner, not the build, and is recorded verbatim above rather than summarised away. It names a specific, checkable pattern: unresolved questions are being routed to consultation correctly, but *after* adversarial review surfaces them rather than before. **This session supplied a fresh instance of exactly that pattern, worth recording alongside the observation rather than leaving implicit:** Q3's isolation check was written against the raw circle list, silently re-opening the self-circle proximity consequence Q4's own ruling had just closed — and it was caught by a live battery extraction, not by the examination that preceded the build. The mechanism was correct in design and wrong in composition, and the composition error was exactly the "almost versus actually" gap the observation describes.
