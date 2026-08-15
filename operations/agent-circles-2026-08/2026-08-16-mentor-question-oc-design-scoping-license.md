# Mentor question — license the O-C per-consumer rendering design SCOPING session?

**Drafted:** 2026-08-16, concurrent-arc session C3b (Deliverable 3). **Rides the founder's
next consultation at their cadence** — nothing gates on it; no session in the current arc plan
is allocated to O-C and none self-starts (Ruling Set D's own instruction). **Prepared under
PR20:** the mechanisms the ruling would land on are named below, file:line, verified
first-hand 2026-08-16 (claims-vs-repo checked at close by an independent read-only agent; its
two precision findings — the L-1 quote's sentence-initial capital, and the note that the
`r20a-audience-renderer.ts:45` cite is the header-comment specification while the executable
discriminator lives at `api/reason/route.ts:805` — are folded below).

---

## The question

Ruling Set D (2026-08-15, L-1) **opened O-C — the per-consumer rendering design question — and
ruled its path without licensing its first step**: *"A design session will produce a document
for its own ruling before any build. That design session is not licensed by this ruling — it
requires a separate scoping session, which itself requires a ruling before execution."*

**Asked:** do you license the O-C **scoping session** (the session that produces the scope
document for your ruling — the same M2 shape as C2/C3: the AI runs it, documents only, you
rule on the document)? And if licensed, when — post-run is presumed (the arc plan's M2
discipline routes all ruled execution post-run, and the scoping session, while documents-only,
feeds a chain whose every downstream step is post-run).

This question asks for **one ruling on sequencing/licence only**. It does not re-open any L-1
through L-5 item, does not ask for the design itself, and does not convene anything.

## The mechanisms a licensed scoping session would name (PR20 grounding)

- The dormant route: `POST /api/substrate/layer3` — answers 503; **`SUBSTRATE_LAYER3_ENABLED`
  unset**. S7's decision for the route and flag **stands unchanged** (L-1: "not reversed").
- The discriminator (must-reuse precedent, confirmed binding at L-3):
  `website/src/lib/substrate/r20a-audience-renderer.ts:45` — the route-auth signal
  (`auth.user?.id` truthy → `human_user`; falsy → `agent_developer`). That line is the
  header-comment specification of the derivation; the executable site is
  `website/src/app/api/reason/route.ts:805` (`const r20aAudience: R20aAudience =
  auth.user?.id ? 'human_user' : 'agent_developer'`). No second practitioner-type
  discriminator may be introduced.
- The crisis precedent's relay pattern (`suggested_user_message` carrying human-form content
  inside the agent form) — ruled at L-2 as "the precedent to follow, not to replace."
- The four relational-context placeholder fields (`relational_context`, `practitioner_role`,
  `relationship_type`, `examination_status`) — **F-d (design-target only) is the correct
  current state until O-C's design session produces a document for ruling** (L-4). (F-b —
  their additive-optional request-field form — is separately opened post-run with its R17
  co-requisite; it is not this question's subject.)

## Ruled constraints already in hand (carried, not re-argued — the scoping session inherits them)

- **All five distinction dimensions are in scope** for O-C's design; **dimension (c) — honesty
  — is load-bearing and must be the FIRST design question** the session addresses (L-2).
- The **discriminator-reuse constraint** and both its named honest limits (transport-level
  classification — the signal classifies the caller, not the downstream practitioner; the
  flag-off asymmetry is historical, not live) carry explicitly (L-3). Any calibrated rendering
  not following the relay pattern must answer the relayed-human case before execution.
- The **`relationship_type` distinctness constraint is binding** (it must never be read as a
  practitioner-type signal) and must be stated in any design document carrying those fields
  (L-4). The **R20d boundary** (engage the self-side, decline the other-side) binds on all
  surfaces regardless of practitioner type.

## Standing non-licences (restated; nothing here touches them)

- **Activation of the dormant route is NOT licensed** by Ruling Set D, by this question, by
  any answer to it, or by any downstream ruling short of an explicit activation ruling plus
  the separately-walked founder 0c-ii step.
- **`SUBSTRATE_LAYER3_ENABLED` stays unset** throughout the scoping → design → ruling chain.
- The scoping session itself, if licensed, is **documents-only** (M2 shape) and produces a
  scope document **for ruling** — the design session it scopes then needs its own ruling, and
  any build after that needs the design ruling. Three gates, none collapsed.

## Options (for the ruling)

- **(i) License now, session runs post-run** — after R1's §6 report is compiled (the report
  gate ordering the arc already honours for R5/R8), as an AI-run documents-only session.
- **(ii) License, gated behind the §6-report consultation** — the scoping session opens only
  after you have ruled on the run report (the stricter reading of the post-run sequencing).
- **(iii) Defer** — the question returns at a later consultation; O-C stays open-unlicensed
  and no session touches it.

*End of question. Drafted at C3b; carried to the mentor by the founder at their cadence.*
