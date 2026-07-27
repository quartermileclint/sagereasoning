# Practice Reminders, Phase 3 — Mentor Consultation: The Simultaneous-Crossing Question

**For:** the private mentor.
**From:** the founder.
**Date prepared:** 2026-07-27.
**Follows on from:** Step M (`operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md`), which is binding context for everything below — this briefing does not repeat it, only the parts needed to judge this one question.
**Status:** open. Not yet asked; no answer recorded.

---

## What this is

A short, single-topic follow-up, not a new full consultation. Phase 3 (the stage-crossing trigger) is now built, following your Step M verdicts exactly on the points that verdict addressed. Adversarial review of that build surfaced one genuine design question your record does not settle — the build team resolved it provisionally, in order to ship, but is disclosing it rather than presenting it as decided.

## The mechanism, briefly

A card appears once, when a practitioner's evaluation newly crosses into one of the five Stages of Practice — reflexive/"The Storm" through sage-like/"The Inner Fire." Per your verdict, it names the stage as a condition, never a grade: *"Something has shifted in how you are meeting difficulty. This is ⟨Stage Name⟩. These practices meet you where you now are."*

The crossing is detected by a milestone system that awards `stage_X` the first time ANY evaluation ever reaches that level — checked across the practitioner's ENTIRE evaluation history, not just their most recent action (a prior, separately-elected design). That awarding mechanism had never actually run before this arc's first build session, so an existing practitioner's very first visit after it went live can retroactively award SEVERAL stage crossings at once — one for every level any of their past evaluations happens to have reached, with no record of which happened most recently.

## The question

When several crossings become newly-visible in that one moment, which one — if any — should the card show?

The build currently shows only the highest-ranked (most advanced) one, reasoning by extension from your own Phase-2 verdict that a suggestion should never become a menu — "one suggestion, never a menu." But that extension is the build team's own inference, not something your record addresses, and it creates a real tension: a practitioner whose evaluation history is mostly Storm-level, but who touched Inner-Fire-level once, would be shown *"This is The Inner Fire… no longer needs the scaffolding in the same way"* — which risks reading as exactly the achievement, high-water-mark framing your own verdict on this card ("a description of a condition, never a grade") was written to prevent. It presents one moment as if it were the whole, settled truth of where the practitioner stands.

This is not a rare case. Because the awarding mechanism is new, it is closer to the *typical* first experience for any practitioner with more than a session or two of history — not an edge case reached only occasionally.

**Question 1.** Is "show the highest-ranked crossing" a sound reading, or does it collapse a genuinely plural, historical fact — a practitioner has been in several different conditions — into a single, misleading present-tense claim?

Three shapes the answer might take, offered as candidates for your judgement, not a recommendation:

1. **Highest wins** (the current build) — the practitioner's most advanced demonstrated condition is what is named.
2. **Lowest wins** — errs toward humility rather than apparent achievement, but has the mirrored failure: telling someone who has *also* reached the Inner Fire "this is The Storm" seems equally wrong, perhaps worse.
3. **Disclose the plurality rather than resolve it** — something like naming the fact of movement itself ("your practice has moved through more than one condition recently; here is where it stands now") rather than presenting one point as the whole picture. This would follow the same instinct as your 6b verdict on the passion log — where the practitioner's and the engine's readings disagreed, you told the build team to disclose the tension rather than silently pick a side. Here the tension is temporal (several past conditions) rather than a disagreement between two readings, but the shape of the problem — a single line asked to speak for something that is not actually singular — looks similar.
4. **Silence** — show no card at all when the crossing is not a single, clean signal. Consistent with the practice's existing "when nothing fits cleanly, say nothing" rule, but it discards the moment the feature exists to serve, and only for the population — returning or long-standing practitioners — who most need the orientation.

**Question 2**, only if a form of disclosure (option 3) is the right direction: is there a form of words for it that stays inside the doorbell boundary — naming the fact of having moved through conditions, without narrating it as a journey, an improvement, or anything the practitioner should feel good or bad about?

## What this briefing is NOT asking

Two other things surfaced by the same build are genuine open items but are engineering questions, not philosophical ones, and do not belong in front of you: a narrow race condition when two requests arrive concurrently, and a low-severity visual inconsistency when one network call succeeds while a related one fails moments later. Both are disclosed in the build's own record (`website/src/lib/stage-crossing.ts` and `website/src/components/MilestonesDisplay.tsx`) and carry no philosophical content.

## Where this fits

`operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §8 (Phase 3, now built); decision-log entry `D-PRACTICE-REMINDERS-HUMAN-PHASE3-STAGE-CROSSING-BUILT`; the full disclosure lives in `website/src/lib/stage-crossing.ts`'s own header comment.

---

*A verbatim record of your answer, once given, will be committed and treated as binding — the same convention as Step M.*
