> **SPENT 2026-09-03** — Gate 3 ran and all seven questions were RULED the same day (`2026-09-03-OC-Gate3-per-consumer-rendering-design-CLOSE.md`; `D-MENTOR-RULINGS-OC-GATE3-ADOPTED-EXECUTED-2026-09-03`). The O-C Gate-3 track is CLOSED; its §11 items are named to the standing-runner track's next design-capable session.

# Next session — O-C Gate 3: the per-consumer rendering design session

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: `governance` — a design session producing a document for mentor ruling. NO code, no flag, no
schema, no migration, nothing activated.** `SUBSTRATE_LAYER3_ENABLED` stays unset throughout. This
session's own output is not licensed to build anything — it produces a design document that itself
goes back to the mentor for ruling before Gate 3's design becomes buildable.

**Expected HEAD at authoring:** `f2dc4e5`. Nothing uncommitted.

---

## Step 0 — Open, in this order

1. `/adopted/standing-protocol-cache.md`
2. This prompt in full
3. **The whole three-gate chain, in chronological order — read every word, do not skip to the
   summaries:**
   - `operations/agent-circles-2026-08/2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`
     (Ruling Set D — the ORIGINAL five distinction dimensions, L-1 through L-5; the reason Layer 3
     stayed dormant at S7 and how the revisit path was opened)
   - `operations/agent-circles-2026-08/2026-08-16-mentor-ruling-oc-scoping-license-verbatim.md`
     (Gate 1 — the three-gate chain itself named, and why Gate 2 was gated behind the §6 report)
   - `operations/agent-circles-2026-08/2026-08-16-SCOPE-DOCUMENT-oc-per-consumer-rendering-design-FOR-RULING.md`
     (Gate 2's OWN output — **this is the document Gate 3 opens FROM.** Its §2 verifies four real
     usage-data classes against the §6 report; its §3 maps them onto the five L-2 dimensions; its §4
     is five numbered questions; its §5 is the constraint list Gate 3 inherits verbatim and does not
     re-derive)
   - `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-oc-gate2-verbatim.md`
     (Gate 2's ruling — **THIS is Gate 3's actual opening agenda.** Q1–Q5 answered; read the verbatim,
     not the decision-log summary of it)
4. `operations/decision-log.md`, entry `D-MENTOR-RULINGS-OC-GATE2-ADOPTED-GATE3-LICENSED-2026-08-23`
   (the licensing decision itself, with the exact scope of what is and is not licensed)
5. `operations/decision-log.md`, entries `D-NINE-CANDIDATE-CLASSIFICATION-PR19-REVIEW-RUN-BASE-RATE-CORRECTED-2026-08-29`
   and its two predecessors (`D-NINE-CANDIDATE-REMEDIATION-SHAPE-CLASSIFIED-2026-08-29`,
   `D-NINE-CANDIDATE-CLASSIFICATION-TWIN-COUNT-CORRECTED-2026-08-29`) — **this classification task
   RAN and completed 2026-08-29, after the Gate-2 scope document was written.** Gate 2's own Q4 named
   it as something that "would sharpen dimension (d) considerably if it runs before Gate 3" — it now
   has. Read its finding, not just this prompt's summary of it (§B.1 below restates the headline, but
   the deliverable itself — cross-referenced in the entry — has the full reasoning).
6. `CLAUDE.md`'s "Built but inert in production" Layer-3 bullet (re-verify the dormant claim is still
   true — see §A.0 below).

---

## Part A — Re-verify before designing anything (PR20; do not trust this prompt's own present-tense claims)

Every "still true" statement below was checked at this prompt's authoring (`f2dc4e5`, 2026-09-03).
**Re-check all of it first-hand before treating any of it as ground truth** — this exact discipline is
what the Gate-2 relaying session did at 2026-08-23 and the mentor commended it by name for doing so.

- **`SUBSTRATE_LAYER3_ENABLED` unset; the three Layer-3 files untouched since the last check.**
  `git log -1 -- website/src/lib/substrate/layer3-service.ts website/src/lib/substrate/layer3-prose.ts
  website/src/app/api/substrate/layer3/route.ts` — confirm the last touching commit predates this
  prompt's authoring session.
- **The four relational-context fields (`relational_context`, `practitioner_role`,
  `relationship_type`, `examination_status`) remain absent from `website/src`.**
  `grep -rn "relational_context\|examination_status" website/src --include="*.ts" --include="*.tsx"`
  — confirmed empty at authoring.
- **The discriminator is unchanged: `auth.user?.id` at `website/src/app/api/reason/route.ts` still
  the sole practitioner-type signal** (human vs agent/developer), still transport-level (classifies
  the *caller*, not the downstream practitioner behind an agent relay).
- **Whether anything has moved on the standing-runner (R8) track, or on F-b / L-5's own execution,
  since 2026-08-30** — both are named as parallel, independent tracks with no ordering dependency on
  Gate 3 (Q3/§5), but check the decision log for anything since this prompt's authoring that might
  bear on Gate 3's dimension (e) (role-calibration) or dimension (a) (reader identity) agenda items.
- **The §6 report's own data (proximity distributions, delivery classifications, passion readings,
  the B7 cross-endpoint check) is a single 20-cycle run from one credentialed loop identity
  (`sagereasoning:idea-loop@v1`), not a survey.** Confirm this generalisability caveat is still
  accurate — no second run has since supplied a comparison population.

---

## Part B — What Gate 3 actually does

**This is a design session, not a build session, and not a re-scoping session.** Its job: produce a
design document answering the five inherited questions (Gate-2 §4, Q1–Q5) in the order Gate 2's
ruling set (agenda (c) → (d) → (a)/(b)/(e), per Q1), reasoning from the real usage data Gate 2 already
verified plus the nine-candidate classification's now-completed finding, and land on a **proposed
shape** for the per-consumer rendering — not a final answer, since the design document itself goes
back for its own ruling before anything is licensed further.

### B.1 — Dimension (c), first: does L-5's disclosure discipline generalise?

**The confirmed starting question (Gate-2 ruling Q2):** does the reflect surface's already-executed
recalibration — *"disclose the posture, don't presume the access"* (the L-5 verbatim discipline,
executed at commit `9bfd69e`, 2026-08-17, on `question-bank.ts`) — generalise to the consult-rendering
surface, given the two data points Gate 2 verified make the gap concrete rather than hypothetical:

- the delivery-classification split (14% of the run's own examinations, 3/22, completed **outside**
  the observed delivery-timeout bound — `observed` vs `examined` classes, §2.2 of the Gate-2 document);
- the B7 cross-endpoint check (a standing, per-cycle mechanism comparing the SAME winner action's
  `/api/guardrail` and `/api/reason` extractions — currently founder-facing only, per Ruling Set D's
  B/R-6; Gate-2's Q3 asks explicitly whether any form of its result should ever reach the practitioner
  whose action produced it, and takes no position — **this session must take one**, or name why it
  cannot yet).

A third instance the Gate-2 document names but does not fold into its own agenda structure: **cycle
3's production contamination** (a served-200 response, "plausible and well-formed, but substantively
wrong" — §6 report §2) — a case where the rendering gave no signal that its own confident-looking
output should not be trusted. Treat this as a third concrete instance of the same dimension-(c) gap,
alongside the two Gate 2 already structured its Q2 around.

### B.2 — Dimension (d), second, now sharpened by the nine-candidate classification

Gate 2's own §3 named one sharp instance under dimension (d): a guardrail rejection that correctly
identified a harm but attributed it to the wrong party ("the extraction assented to [the framing]
without examining whether the described behaviour was the proposer's or the system's"), from a
population Gate 2 itself said was under-classified (1 of 9 read closely; **"a full test of the
hypothesis is therefore NOT completed here"**).

**That classification has since run to completion** (`D-NINE-CANDIDATE-CLASSIFICATION-PR19-REVIEW-
RUN-BASE-RATE-CORRECTED-2026-08-29`, independently reviewed by three parallel blind reviewers, every
finding folded). Use its corrected findings, not the first-draft numbers:

- a **within-run divergence control** (Tier A/B twin pairs — c11↔c13 scoring 0.944 fuzzy-match
  similarity against under 0.25 for every other pair, an outlier by a wide margin) now carries the
  **primary** evidential weight for whether the same practitioner action can be scored two different
  ways by the same instrument;
- the base-rate argument the first draft called decisive was **corrected to "mildly corroborating"**
  after review found the true remediation-shaped base rate is 0.60–0.65, not "essentially the entire
  population" — a real but mild departure from chance (p≈0.07–0.12), not the near-impossibility the
  first version claimed;
- **two open readings, deliberately not resolved by the classification work: Reading A (verdict
  instability is a reproducibility defect) vs Reading B (it is expected variance from a probabilistic
  Layer-1 extraction call, in which case the live design question becomes what confidence a single
  `reflexive` verdict carries, and whether a floor-class verdict should be re-run before being treated
  as final).** The classification work names a cheap experiment (re-running the c11 text several
  times) that would settle A-vs-B; **that experiment has not been run** as of this prompt's authoring
  — check whether it has run since, and if not, Gate 3's design should state explicitly which reading
  its own proposal assumes, and name the unresolved question rather than silently picking one.

**Gate 3's dimension-(d) task:** given this sharpened evidence, what does a rejected or
floor-classified agent practitioner's rendering get to honestly say about *why*, in a way that
distinguishes "your proposal describes something wrong" from "you did something wrong" — and does the
answer change depending on which of Reading A / Reading B turns out to be true?

### B.3 — Dimensions (a), (b), (e): on the existing architectural material alone

Per Gate 2's own finding (§3), the §6 run supplies **no fresh data** on these three — treat them as
Gate 2 already scoped them:

- **(a) who the reader is presumed to be** — the run confirms direct agent-to-agent consumption is a
  real, current pattern (no relay in the loop); it supplies **zero** evidence on the relayed-human
  case (an agent operator whose end-user is human) that Ruling Set D's L-3 named as an open honest
  limit. State the relayed-human case as an explicit, unresolved design input rather than an
  afterthought.
- **(b) direct address vs structured relay** — the crisis-path relay pattern
  (`suggested_user_message`) is named as the precedent to follow; the run never exercised it (no
  cycle crossed the R20a perimeter in 20 cycles). Any design not following the relay precedent must
  separately answer the relayed-human case before execution (inherited constraint, §5 of the Gate-2
  document).
- **(e) role-calibration / relational context** — the run is a single agent identity with no
  relational dyad; it supplies no data on either of the two minimum pieces L-4 named (role in a
  relationship; examined-vs-assumed impressions about it). The nearest existing analogue is the
  runner's own remit self-declaration (Ruling Set A's A/R-3) — a self-declaration honest-limit case,
  explicitly **not** a relational one; do not merge the two.

### B.4 — Binding constraints, inherited verbatim, not open for this session's own re-derivation

Carried forward from Ruling Set D + the two licensing rulings (Gate-2 document §5, restated here so
this prompt is self-contained — **verify each against source per Part A before relying on it**):

- **The discriminator-reuse constraint.** No second practitioner-type discriminator may be
  introduced. Any design reuses `auth.user?.id` as-is.
- **Both named honest limits carry explicitly:** transport-level classification (the signal
  classifies the *caller*, not the downstream practitioner behind a relay) and the flag-off asymmetry
  (historical, not live — the audience-rendering flag has been on since 2026-05-31, so this is not a
  live-behaviour concern, only a historical-record one).
- **The relay pattern is the precedent to follow.** Any calibrated rendering not following it must
  answer the relayed-human case before execution.
- **The `relationship_type` distinctness constraint binds** on any design carrying the four
  relational-context placeholder fields — they are still named-not-built.
- **The R20d boundary binds on all surfaces regardless of practitioner type** — engage the self-side,
  decline the other-side.
- **`SUBSTRATE_LAYER3_ENABLED` stays unset throughout.** This session's design document does not
  license activation. Activation needs an explicit activation ruling plus a separately-walked
  founder step, neither of which this session is or produces.
- **F-b (the four relational-context fields as additive-optional request fields) and L-5 (the
  reflect-wording recalibration) are distinct, separately-slotted execution tracks** — F-b's own R17
  co-requisite stands as its own document says; L-5 has already run (per Part A). Neither is this
  session's subject; Gate 3's Q2 asks only whether L-5's *discipline* generalises, not whether its
  execution is re-opened.

---

## Part C — What this session must produce

A **design document** (`operations/agent-circles-2026-08/2026-09-0X-DESIGN-DOCUMENT-oc-per-consumer-
rendering-FOR-RULING.md` or similar, dated at time of writing) that:

1. Answers dimension (c) first, with a concrete proposal (or a stated reason it cannot yet propose
   one) for whether/how the L-5 disclosure discipline generalises to the consult-rendering surface,
   addressing the delivery-timeout gap, the B7 cross-endpoint divergence, and the cycle-3 contamination
   instance by name.
2. Answers dimension (d) second, incorporating the corrected nine-candidate classification findings,
   and states explicitly which of Reading A / Reading B its proposal assumes (or that it deliberately
   does not choose between them, and why).
3. Addresses (a), (b), (e) on the existing architectural material, explicitly naming the relayed-human
   case and the relational-context gap as unresolved rather than glossing them.
4. States, for every claim drawn from the §6 report, that it is a single-loop-identity instance, not a
   survey — per Gate-2's own Q5 ruling, at every point the §6 data is cited (not merely once at the top).
5. Proposes a **shape** for the per-consumer rendering — what fields it would carry, what it would and
   would not claim, how it interacts with the existing audience-rendering split (`human_user` vs
   `agent_developer`) — **without writing code, setting a flag, or touching schema.**
6. Names, explicitly, what this design document does NOT license: `SUBSTRATE_LAYER3_ENABLED`
   activation; any edit to `layer3-service.ts`/`layer3-prose.ts`/the route; any schema change for the
   four relational-context fields (that is F-b's track); any change to `question-bank.ts` (that is
   L-5's track, already executed).

Plus a decision-log entry recording the session, and — per this project's standing practice for a
design document headed to the mentor — a companion mentor-question-format distillation if the design
document's own length or density would make it hard for the mentor to rule on directly (follow the
pattern of `2026-09-03-MENTOR-QUESTION-route-i-what-is-l1-supply-for.md` if useful; not mandatory).

## What NOT to do

- **Do not write code.** Not the route, not the service, not the prose templates, not even a stub.
- **Do not set `SUBSTRATE_LAYER3_ENABLED`.** Not to `true`, not for a local test — the flag stays
  unset for the entire scoping → design → ruling chain per Ruling Set D and every ruling since.
- **Do not re-litigate Ruling Set D (L-1 through L-5) or the Gate-2 scoping questions (Q1–Q5).** They
  are closed; this session's job is to answer Q1–Q5 as Gate 3's agenda, not to reopen whether they were
  the right questions.
- **Do not treat the §6 report as a survey of agent practitioners in general.** It is one credentialed
  loop identity's 20-cycle history. Say so at every citation, not once.
- **Do not resolve Reading A vs Reading B by picking the more interesting one.** The nine-candidate
  classification work deliberately declined to choose, and named the cheap experiment (re-running c11
  several times) that would settle it. If that experiment still has not run, name it as a recommended
  next step rather than silently assuming an answer.
- **Do not treat this session's design document as licensing anything beyond itself.** It goes back to
  the mentor for its own ruling before Gate 3's proposal becomes buildable, per the three-gate chain's
  own terms.

## Forecast

Success = a design document that answers Gate 2's Q1–Q5 in the ruled agenda order, grounds every claim
in the verified §6 data (dimension c) and the corrected nine-candidate classification (dimension d),
names the relayed-human and relational-context gaps as open rather than glossed (dimensions a/b/e),
proposes a concrete rendering shape without building anything, and is honest about what it does and
does not license — ready for the mentor's Gate-3 ruling, which is the next and last gate before any
build session on this track becomes possible.
