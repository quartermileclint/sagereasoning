# Mentor ruling — the M-4 return (verbatim)

**Relayed by the founder 2026-08-17.** The mentor's own header reads "Date: 2026-08-16" (carried over
from the M-1..M-5 ruling set); the relay is 2026-08-17. Recorded as-is rather than silently corrected.
**Status: ADOPTED AS BINDING SPECIFICATION. Verbatim wins over any paraphrase, here or elsewhere.**

**Binds:** `computeDispositionStability` (`window-aggregator.ts`); the four-dimension grade gate
(`grade-transition-engine.ts` `dimensionsMeetFloor` / `dimensionsMeetElevated`); every agent-facing
surface carrying `disposition_stability`; the published `does_not_attest` disclosure on `llms.txt`,
`agent-card.json`, and `trust-record-payload.ts`; and `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`
(Spec 4).

**Predecessor:** `2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` §M-4 (this ruling CONFIRMS it).
**Brief that prompted it:** `2026-08-17-M4-disposition-stability-mechanism-facts-FOR-RULING.md`,
relayed as `2026-08-17-M4-mentor-consultation-outbound.md`.

---

**MENTOR RULINGS — M-4 return, two questions**

**Date:** 2026-08-16.

The return is warranted. Both facts change the cost of the remedy, and one of them adds a second defect
that the original ruling could not have named. Bringing them back rather than executing on an incomplete
picture is the right discipline — the same pattern of surfacing incomplete conditions honestly before
proceeding that has been consistent across this build.

---

**On the first question: does the grade coupling change what should be retired, or confirm the ruling as
given?**

It confirms the ruling as given. The first reading is correct. Retire the dimension from agent-facing
surfaces. Let the principled-to-sage-like transition sit structurally unreachable for as long as the
dimension cannot honestly certify.

This is not a different kind of dishonesty — it is the honest record of a missing measurement. A grade
rung that cannot be reached because the required certification cannot be made honestly is not a broken
ladder; it is a ladder that accurately reflects what has not yet been demonstrated. The alternative —
adjusting the ladder so the top rung remains reachable despite the missing honest measure — would be the
dishonesty, because it would preserve reachability by removing the condition that made reachability
meaningful.

The Stoic account of the sage is not that the sage-like disposition is declared by a system that cannot
measure it. It is that the disposition is either present or it is not, and the honest response to an
inability to measure it is to withhold the certification, not to lower the bar. The grade coupling does
not change this logic — it makes the consequence of the logic more visible, which is useful, not a reason
to revise the logic.

Execute retirement on this alone. No further ruling is needed on the first question.

---

**On the second question: does the mean-blindness warrant its own correction?**

Yes, and it should be corrected now, independently of the perturbation problem.

The two defects are genuinely independent. Mean-blindness — the signal certifying consistent poor
reasoning as advanced because variance is low — is fixable with no new signal and does not touch the
perturbation question either way. The partial correction you named (require an adequate mean as well as
low variance before certifying advanced) is the correct fix for this defect and should be applied.

The reason to apply it now rather than deferring it to the perturbation correction: the mean-blindness
defect affects a different population than the perturbation defect. The perturbation defect affects
agents who have never been tested under varied conditions. The mean-blindness defect affects agents whose
consistent reasoning is consistently poor. These are not the same agents, and fixing one does not fix the
other. An agent with consistently poor reasoning who is never perturbed has both defects working in their
favour simultaneously — the mean-blindness certifies the level as adequate, and the perturbation defect
certifies the consistency as stability. Fixing mean-blindness removes one of those two false
certifications even while the perturbation problem remains.

The correction is: before certifying advanced on this dimension, require that the mean of the readings
meets an adequate floor, not merely that the variance is low. The specific floor is the builder's call —
the ruling is that the mean must be consulted, and that low variance on a poor mean must not certify as
advanced.

This correction does not restore the dimension to agent-facing surfaces. The dimension remains retired
per the first question's ruling. The mean-blindness correction applies to the dimension's internal logic
so that when it is eventually restored — once a perturbation-adjusted measure is available — it does not
carry the second defect forward alongside the corrected first one.

---

**On the disclosure gap.**

The existing disclosure says the dimension cannot distinguish a disposition tested under varied
conditions from one never tested at all. It does not disclose the mean-blindness. An agent reading it
would not learn that consistently poor reasoning also certifies as advanced.

The disclosure should be updated to name both defects, not only the perturbation problem. The
mean-blindness is a distinct failure with a distinct population of affected agents, and an honest
disclosure names both. This update should accompany the retirement, not wait for the perturbation
correction.

---

**Summary of what executes.**

Retire the dimension from agent-facing surfaces. Let the principled-to-sage-like transition sit
structurally unreachable. Apply the mean-floor correction to the dimension's internal logic so the second
defect is not carried forward. Update the disclosure to name both defects. The related dispersion measure
remains deactivated until the dimension is restored. Do not return on the first question — it is settled.

---

## Execution notes (added by the AI at recording; not part of the ruling)

**Four executable obligations, in the ruling's own order:**

1. **Retire** `disposition_stability` from agent-facing surfaces.
2. **Let `principled → sage_like` sit structurally unreachable.** Explicitly do NOT re-tune the
   `elevated_dimension_count` thresholds — the ruling names that as the dishonest option.
3. **Apply the mean-floor correction to the internal logic** — for future restoration, *not* to justify
   keeping the dimension surfaced. Floor value is the builder's call; the binding part is that the mean
   must be consulted and low variance on a poor mean must not certify `advanced`.
4. **Update the published disclosure to name BOTH defects**, accompanying the retirement.

**Spec 4 stays deactivated.** The ruling states this directly: *"remains deactivated until the dimension
is restored."*

**One tension recorded for a future consultation, deliberately NOT acted on and NOT relitigated here.**
The original M-4 ruling blocked Spec 4 on the grounds that carrying an honest ungraded reading *beside* a
defective graded one is unsafe. Once the defective dimension is retired, there is arguably no longer a
"both" to carry, which on the original reasoning would unblock Spec 4. This ruling nonetheless keeps it
deactivated until *restoration*. The instruction is unambiguous and is what will be followed — Spec 4
stays off. This note exists only so a future session does not read retirement as having silently
unblocked it, and does not mistake the tension for an oversight it is licensed to resolve on its own.
