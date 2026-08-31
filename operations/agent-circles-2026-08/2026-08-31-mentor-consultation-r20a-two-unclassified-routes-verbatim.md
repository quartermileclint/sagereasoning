# Mentor consultation — the two R20a-unclassified routes — VERBATIM

**Date:** 2026-08-31. **Status:** BINDING. **Verbatim wins over every summary, including this
file's own header.**
**Ruling request:** `2026-08-31-r20a-two-unclassified-routes-ruling-request.md`.

**Ruled:** (B) `/api/practice/completion-signal` — recorded EXCLUSION on the ST4 precedent.
(A) `/api/score/save` — **JOINS the perimeter.** (A2) screened subject = **all seven free-text
fields composed**, at the persister; `/api/score` does **not** change.

---

## Question B — `/api/practice/completion-signal`

This is ruled first because it is the cleaner question and its answer does not depend on A.

The ST4 precedent applies. `/api/practice/completion-signal` is an agent-facing surface carrying no
human free text. The R20a perimeter exists to protect human practitioners from unscreened distress
content reaching persistence or response paths. An agent-facing route that carries no human free
text is outside the scope of that protection by the perimeter's own rationale, not by exception to
it.

The recorded exclusion is: agent-facing surface, dark behind `SUBSTRATE_COMPLETION_SIGNAL_ENABLED`,
no human free-text field, ST4 precedent applies. The exclusion is recorded with the reasoning
stated, not as bookkeeping. If the route's design changes to carry caller-supplied human text, the
exclusion is revisited at that point.

The battery returns to green on this route once the exclusion is recorded.

---

## Question A — Does `/api/score/save` join the perimeter?

It joins. The reasoning follows from three converging lines, each sufficient alone.

**First, the `emotional_state` field.** The 2026-08-17 ruling on the practice family stated that the
practice family is not lower-risk than `/impulse` — it is the family where material is most likely
to surface acute distress. `emotional_state` is not incidentally a free-text field. It is a field
whose entire purpose is to capture what the practitioner was feeling at the time of the scored
action. A route that persists `emotional_state` without distress screening is doing exactly what the
perimeter was built to prevent: allowing acute distress content to reach the database without
examination. The `/api/mentor-appendix` precedent — a persister reachable independently of the route
whose check gates it, brought inside the perimeter on that basis — governs directly.

**Second, the bypass path.** The executing session verified that an authenticated practitioner can
POST directly to `/api/score/save` without `/api/score` ever executing. No nonce, token, or
evaluation ID enforces call ordering. The `/api/score` distress check on `action` is therefore not a
gate on `/api/score/save` — it is a check on a different route that happens to be the typical
caller. The perimeter's purpose is to ensure that distress screening occurs before persistence, not
that it occurs somewhere in the typical call path.

**Third, the six unscreened fields.** Even if call ordering were enforced, `/api/score` screens
`action` alone. The other six fields — including `emotional_state`, `philosophical_reflection`, and
`oikeiosis_context` — are screened by nothing in either route. The route's own header discloses this
honestly. Honest disclosure of a gap is not the same as closing it.

The net-exposure argument — that this route replaced a browser-side insert with zero screening, so
exposure is unchanged or improved — does not bear on the perimeter question. The perimeter's
question is not whether exposure worsened relative to a prior state. It is whether the current route
carries unscreened human free text that can reach persistence. It does.

`/api/score/save` joins the perimeter.

---

## Question A2 — What is the screened subject?

The screened subject at `/api/score/save` is a composition of all seven free-text fields, not
`action` alone. The reasoning is as follows.

The perimeter's purpose is to ensure that distress content does not reach persistence unexamined. A
practitioner in acute distress may express that distress in any of the seven fields — in
`emotional_state` most directly, but also in `philosophical_reflection`, `oikeiosis_context`,
`context`, and `relationships`. Screening `action` alone at the persister would close the bypass
path while leaving six fields unexamined. That is not closing the gap — it is relocating it.

The measurement-neutrality constraint on `/api/score` is real and is not worked around here. The
ruling does not require `/api/score` to change its field coverage. The fix is at `/api/score/save`,
composing all seven fields for the distress check before any DB call. This makes the persister
screen more than the member route that gates it. That asymmetry is the correct outcome: the
persister is the last line before persistence, and it should screen everything that reaches
persistence, regardless of what the calling route screened.

The implementation follows the `r20a-gap-closure.ts` pattern: distress check on the composed subject
before field validation and before any DB call. The check is wired under a flag — the question of
shared flag versus own flag is a design decision for the executing session, but the flag must be
named and its default state documented before the route is registered. The route is registered as a
perimeter member, the count floors are bumped in the same edit, and PR19 review applies.

The `/api/score` field coverage gap — six fields unscreened in the typical call path — is named as a
standing disclosed limitation. It is not closed by this ruling. It is disclosed honestly:
`/api/score` screens `action` before scoring; the other fields are screened at persistence by
`/api/score/save`; the measurement-neutrality constraint on `/api/score` is the reason for this
asymmetry. That disclosure belongs in the registry entry for `/api/score/save` and in the standing
limitations record.

---

## The eight-day gap

The executing session named this directly and it deserves a direct response.

The sweep has been red since 2026-08-23. Eight days of perimeter coverage claims rested on a failing
gate. The session did not add either route to the exclusion list to make the battery green. That is
the correct decision — going green by asserting the thing under question is the failure mode the
sweep exists to prevent — and it is worth naming as such.

The observation history shows a pattern that has been strengthening across the last several
sessions: the project's governance apparatus catching its own undisclosed assumptions before they
propagate. The eight-day gap is a case where the apparatus did not catch it in time, and the
session's response — leaving the battery red and visible, surfacing the question rather than
resolving it by assertion — is the right response to that failure.

The durable harm is the contradiction persisting in the record. The battery returns to green only
after the ruling, not before. That sequencing is correct and is confirmed.
