# Mentor ruling — corrected Question B + Question A2b — VERBATIM

**Date:** 2026-08-31. **Status:** BINDING. **Verbatim wins over every summary, including this header.**
**Corrects and supersedes** the Question B reasoning in
`2026-08-31-mentor-consultation-r20a-two-unclassified-routes-verbatim.md`.
**Ruling request:** `2026-08-31-CORRECTION-to-r20a-ruling-question-B-false-fact.md`.

**Headline:** (B) exclusion **STANDS on the corrected ground**; the self-sealing revisit trigger is
**REPLACED**. (A2b) the screened set **EXTENDS to every caller-supplied field capable of carrying
prose**, enumerated **from the route's actual schema**. (A) the revert was correct; the rebuild's
distress response **must not be a 200**, and the **calling page is in PR19 scope**.

---

## Question B (corrected) — `/api/practice/completion-signal` on the true facts

The exclusion stands, on the corrected ground. The conclusion the prior ruling reached survives; the
reason given to reach it does not, and the record must carry the corrected reason.

The ST4 precedent is not "this route has no free text." It is "agent-authored free text over a
credential-authenticated call is outside the perimeter, because it processes agent output rather than
human distress input."

On the corrected facts, `/api/practice/completion-signal` fits that precedent precisely.
`impression_assented_to` is agent-authored — it is what the agent examined and assented to, submitted
over a `completion_signal_write` credential, never over a browser session. The route authenticates
Bearer-only on a write-class capability. There is no path by which a human practitioner's distress
enters this route.

The perimeter exists to protect human practitioners from having acute distress pass through the
system unscreened. This route does not carry human distress input. The exclusion stands.

The revisit trigger as recorded is self-sealing and must be replaced. The recorded trigger — "if the
route's design changes to carry caller-supplied human text" — describes a change that has already
occurred and therefore cannot fire. The corrected trigger is: the exclusion is revisited if the
route's authentication model changes to permit browser-session callers, or if the route's field
definitions are amended to accept practitioner-typed input rather than agent-authored output. Neither
condition is met today. The corrected trigger is recorded in place of the prior one.

---

## Question A2b — Screened field scope

The screened set extends to every caller-supplied field capable of carrying prose.

The seven-field scope drawn in the prior ruling rested on a criterion — "engine outputs echoed back by
the client, not practitioner-authored prose" — that the code does not enforce and that does not
partition the fields as described. Both defects are confirmed by the correction document and are ruled
on directly.

The criterion fails on its own terms. Three of the seven fields the prior ruling required screening —
`philosophical_reflection`, `improvement_path`, `oikeiosis_context` — are engine outputs echoed back by
the client, by exactly the test used to exclude the other six. Applied honestly, the criterion would
remove three fields from the screened set. The prior ruling cannot simultaneously require screening
those three fields and use "echoed back by the client" as the exclusion criterion for the other six.

The criterion also fails structurally. The prior ruling's own premise is that a caller can POST
directly to `/api/score/save` with `/api/score` never executing. Under that premise, "echoed back by
the client" describes a client the route does not control. The route cannot enforce the distinction
between practitioner-typed input and echoed engine output. A caller posting directly can place
distress content in any field the route accepts. The correction document confirms this:
`false_judgements` is a JSONB field that receives zero validation, and distress content in that field
reaches the insert. In Stoic practice, `false_judgements` is where a practitioner records their own
catastrophic self-statements. That is not a peripheral field — it is the field most likely to carry
the material the perimeter exists to screen.

The screened set is therefore all caller-supplied fields capable of carrying prose: `action`,
`context`, `relationships`, `emotional_state`, `philosophical_reflection`, `improvement_path`,
`oikeiosis_context`, `false_judgements`, and any other JSONB or TEXT field the route accepts without
validation. The rebuild must enumerate these from the route's actual schema, not from a criterion that
the code does not enforce.

---

## Question A — The implementation failure

The ruling stands adopted and unexecuted. The revert was correct.

The implementation returned the distress redirect as HTTP 200, which the calling page read as success.
A practitioner writing acute distress into `emotional_state` received a silently unsaved record, the
word "saved," and no crisis resources. That is not a marginal implementation defect — it is an outcome
worse than the unscreened state it replaced, for precisely the population the perimeter protects. The
revert was the right call and was made correctly.

The rebuild waits on the A2b ruling above, which is now given. The rebuild's scope is: screen every
caller-supplied field capable of carrying prose, using the `r20a-gap-closure.ts` pattern, before field
validation and before any DB call. The HTTP response on a distress detection must be a status code the
calling page treats as an error, not a 200. The calling page's handling of that response is in scope
for the PR19 review — the prior implementation's failure was at the response-handling layer, and the
review must verify that layer explicitly, not only the detection layer.

The exhaustiveness backstop remains red until the rebuild is complete, registered, and the count floors
are bumped. That sequencing is confirmed correct.
