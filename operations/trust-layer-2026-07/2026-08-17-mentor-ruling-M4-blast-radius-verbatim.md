# Mentor ruling — M-4 retirement blast radius, three lower rungs (verbatim)

**Relayed by the founder 2026-08-17.**
**Status: ADOPTED AS BINDING SPECIFICATION. Verbatim wins over any paraphrase, here or elsewhere.**

**Brief that prompted it:** `2026-08-17-M4-retirement-grade-gate-side-effects-FOR-RULING.md`.
**Predecessor:** `2026-08-17-mentor-ruling-M4-return-verbatim.md` (this SCOPES that ruling; it does
not overturn it).

**Binds:** `grade-transition-engine.ts` (`dimensionsMeetFloor` / `dimensionsMeetElevated` and the
scope of any retirement applied to them); the dual-defect disclosure owed on `llms.txt`,
`agent-card.json`, and `trust-record-payload.ts`; `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` (Spec 4).

---

**MENTOR RULING — M-4 retirement blast radius, three lower rungs**

**Date:** 2026-08-17.

The hold was correct. The brief has done exactly what the project's epistemic discipline requires:
exhaustive enumeration before confident claim, and an honest note on the internal error that reversed
the first conclusion. That note is not incidental — it is the same class of mistake the ruling exists
to correct, named at the site rather than quietly corrected. This is the pattern that has been
consolidating across recent sessions and it is worth naming: the discipline of surfacing incomplete
conditions before acting is now operating at the implementation level, not just the design level.

The ruling is option **(c), with a qualification**.

---

**Why (c).**

The ruling's grievance with `disposition_stability` was specific: it cannot distinguish stability
under perturbation from absence of perturbation, and it certifies the latter as the former. That is a
defect in what the signal claims to measure. The question is whether that defect is equally damaging
at all four rungs, and the answer is no.

The top rung — `principled → sage_like` — requires all four dimensions at advanced. At that rung, the
signal's false certification is doing the most work: it is the final gate on the highest claim the
system makes about an agent's dispositional development, and it is certifying something the Stoic
account of the sage explicitly requires to be earned under perturbation. Retiring it from that gate
is not optional — the ruling was correct and stands.

The three lower rungs are a different situation. At `reflexive → habitual`, `habitual → deliberate`,
and `deliberate → principled`, the signal is one input among four, and the floor predicate's
`.every()` means it is functioning as a minimum bar, not a certification of sage-like stability. An
agent at `habitual → deliberate` is not being assessed for proximity to the sage; it is being
assessed for whether its reasoning has moved beyond pure impulse and habit. The signal's defect —
that it cannot distinguish tested consistency from untested consistency — is less consequential at
these rungs, because the claim being made is less consequential. Consistent reasoning at the
habitual-to-deliberate transition, even if untested under perturbation, is a meaningful signal about
where the agent is on the ladder. It is not the same as falsely certifying sage-like stability.

The loosening at `habitual → deliberate` — 20 newly allowed combinations — is the finding that makes
option (a) unacceptable. Removing a signal because it cannot honestly certify, and thereby promoting
agents the system previously judged unqualified, is not the honest consequence of the ruling. It is
an unintended consequence that runs in the wrong direction. The ruling's purpose was to stop false
promotion at the top; accepting false promotion at a lower rung as collateral damage is not a
defensible reading of that purpose.

---

**The qualification on (c).**

Option (c) as stated — retire from display and from the top rung only, retain as input to the three
lower rungs — is the correct scope. But it requires one addition: the signal's retention at the lower
rungs must be disclosed, and the disclosure must be honest about what it can and cannot measure at
those rungs.

The dual-defect disclosure (obligations 1 and 4, currently unstarted) should name explicitly that the
signal remains a gate input at three rungs, that it cannot distinguish tested from untested
consistency at any rung, and that it has been retired from the top rung and from agent-facing display
for that reason.

This is not a new obligation — it is the correct scope of the disclosure already owed. The retirement
from the top rung and from display is the primary action. The retention at the lower rungs is a
deliberate, reasoned decision, and it should be stated as such rather than left implicit.

---

**On option (b).**

The distinction the builder offers — that threshold retuning to preserve a condition is different
from threshold retuning to remove one — does not survive scrutiny in this case. The ruling's
prohibition on retuning was grounded in a specific argument: that adjusting the ladder so a rung
remains reachable despite a missing honest measure is the dishonesty. That argument applies to
preservation as much as to removal. Lowering `elevated_dimension_count` on the lower rungs to hold
their behaviour constant is adjusting the ladder to compensate for a missing signal — the direction
of the adjustment does not change what is being done. Option (b) is not available.

---

**On option (a).**

Accepting the loosening at `habitual → deliberate` as the honest consequence of removing a defective
signal is not the correct reading of honesty here. Honesty requires naming what the signal cannot do;
it does not require accepting every downstream consequence of removal as though they were all equally
intended. The 20 newly allowed combinations at that rung are an unintended consequence of a scoping
decision that did not need to be made that way. Option (c) avoids them without retuning thresholds
and without retaining the signal at the top rung. It is the honest option.

---

**Summary of what executes.**

Retire `disposition_stability` from agent-facing display and from the `principled → sage_like` gate.
Retain it as an input to the three lower rungs unchanged. Do not retune any threshold. Update the
dual-defect disclosure to name the retention at lower rungs, the reason for it, and what the signal
cannot measure at any rung. Spec 4 remains deactivated. Obligations 1 and 4 remain unstarted and are
unaffected by this ruling — they now have a more precise scope to execute against. Nothing ships
until the disclosure is updated to match the scoped retirement. The held build at
`2026-08-17-M4-retirement-HELD/` can proceed on these terms.

---

## Execution notes (added by the AI at recording; NOT part of the ruling)

**⚠ THE HELD BUILD DOES NOT IMPLEMENT OPTION (c) AND MUST NOT BE RESTORED AS-IS.**

The ruling says the held build "can proceed on these terms" — **on these terms** is load-bearing.
`engine-change.patch.md` implements a **global** exclusion: `gateEvaluatedLevels()` filters the
retired dimension out of BOTH `dimensionsMeetFloor` and `dimensionsMeetElevated`, and both predicates
are called for **every** rung from `checkUpgrade`. That is option **(a)** — the option this ruling
explicitly rejects. Restoring it unchanged would ship the 20 newly-allowed promotions the ruling calls
unacceptable.

**Option (c) requires the exclusion to be conditional on the rung being evaluated** — active only for
`principled_to_sage_like`, inert for the other three. The threshold key is already in scope at the
call site (`checkUpgrade` resolves `thresholdKey` before calling both predicates), so the change is
tractable, but it is a **different implementation**, not a restore.

**Consequence for the held test:** `grade-gate-retirement.test.ts.draft` asserts the global behaviour
(§1.2 "4 dimensions in, 3 evaluated" unconditionally). It must be **rewritten**, not just fixed —
alongside the §4 defect already flagged.

**The lower-rung behaviour must be pinned as UNCHANGED.** The enumeration script
(`2026-08-17-M4-retirement-HELD/rung-analysis.mjs`) already produces the before/after table; a
regression test should assert the three lower rungs are byte-identical in behaviour and only the top
rung changes — otherwise a future refactor reintroduces exactly the loosening this ruling forbids.

**Nothing ships until the disclosure lands** — the ruling makes obligations 1 and 4 a gate on the
retirement, not a follow-up to it.
