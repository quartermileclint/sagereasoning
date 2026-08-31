# CORRECTION to the 2026-08-31 R20a ruling — a false mechanism fact, and Question B re-asked

**Date:** 2026-08-31. **For:** the private mentor. **Status:** correction, awaiting re-ruling.
**Corrects:** `2026-08-31-r20a-two-unclassified-routes-ruling-request.md` §3.
**Ruling being corrected:** `2026-08-31-mentor-consultation-r20a-two-unclassified-routes-verbatim.md`,
Question B.

**PR20 compliance, and the reason this document exists.** Every fact below was re-derived from source
on 2026-08-31, **after** the error, by reading each route's `handler.ts` as well as its `route.ts`.
The original brief carried the same assurance and was wrong; that is stated here rather than
implied.

---

## 1. The false fact

The ruling request told you, under a heading asserting first-hand verification:

> `/api/practice/completion-signal` … carries **no human free-text field**.

**That is false.** The route **requires**, on every call:

- `examination.impression_assented_to` — a non-empty string, capped at **5,000 characters**
  (`handler.ts:342`, `MAX_IMPRESSION_CHARS = 5000` at `handler.ts:162`)

and optionally accepts:

- `refusal_reason` — a string, capped at **2,000 characters**
  (`handler.ts:386-389`, `MAX_REFUSAL_REASON_CHARS = 2000` at `handler.ts:163`)

**How the error was made.** The route was inspected by grepping `route.ts` alone. The fields live in
its sibling `handler.ts`. This is the **route/handler split-file blindness class that this project
had already discovered, documented and fixed inside the R20a exhaustiveness sweep itself** — it was
reproduced by hand while auditing that very sweep, and it defeated a check that the sweep's own code
no longer falls for.

## 2. What this does to the ruling as recorded

Your Question B reasoning turned on the route "carrying no human free text," and you recorded a
revisit trigger:

> "If the route's design changes to carry caller-supplied human text, the exclusion is revisited at
> that point."

**That trigger can never fire.** No design change is required — the 5,000-character caller-supplied
field is already present, and required. As recorded, the exclusion is self-sealing.

## 3. The corrected picture — which may well preserve your conclusion, on a different ground

The ST4 precedent was cited correctly but described wrongly. `/api/stoa/declare`'s own recorded
decision (`route.ts:18-26`, ST4 2026-08-03) reads:

> "Its free-text fields (`what_i_bring` / `what_i_seek` / `contact_channel` / `tags`) are
> **AGENT-authored text** submitted over a credential-authenticated API call, not human free text
> entered through a cookie/JWT browser session — the r20a-invocation-guard registry's own standing
> exclusion: *'Agent-facing endpoints … are excluded because they process agent output, not human
> distress input.'*"

So ST4 is **not** "this route has no free text." ST4 is **"agent-authored free text over a
credential-authenticated call is outside the perimeter, because it is agent output rather than human
distress input."**

On that reading, `/api/practice/completion-signal` fits the precedent: its `impression_assented_to`
is agent-authored, and the route authenticates Bearer-only on the write-class
`completion_signal_write` capability (`handler.ts:220`, `handler.ts:24`), never on a browser session.

**So the conclusion you reached may be right. The reason given to you was false.** An accurate brief
would have asked you to rule on *"a required 5,000-character agent-authored free-text field behind a
write-class credential"* — a materially different question from *"no free-text field."*

**Also verified live (2026-08-31):** an unauthenticated POST to the production route returns **503** —
it remains dark behind `SUBSTRATE_COMPLETION_SIGNAL_ENABLED`, as the original brief stated.

### QUESTION B, RE-ASKED

**On the corrected facts, does the exclusion stand?** And if it does — **what is the correct revisit
trigger**, given the recorded one describes a change that has already happened and therefore cannot
fire?

---

## 4. A second correction, bearing on Question A2's scope

The brief justified screening seven fields and not the other six by the criterion *"engine outputs
echoed back by the client, not practitioner-authored prose."* Independent review found two defects in
that criterion, both re-verified here.

**(a) It does not partition the sets.** Of the seven fields your ruling requires screening, only
**four** are practitioner-typed — `action`, `context`, `relationships`, `emotional_state`, each a
`useState('')` text input (`score/page.tsx:90-93`). The other three —
`philosophical_reflection`, `improvement_path`, `oikeiosis_context` — are engine outputs echoed back
by the client, **by exactly the test used to exclude the other six**. Applied honestly, the stated
criterion would remove three of the seven you ruled must be screened.

**(b) The route cannot enforce it.** Your ruling's own premise is that a caller can POST directly with
`/api/score` never executing. Under that premise, "echoed back by the client" describes a client the
route does not control. Verified: `ruling_faculty_state` is unbounded `TEXT`, `false_judgements` and
`passions_detected` are `JSONB`, and **all three receive zero validation in the route** (grep for
`typeof <field>` returns 0 for each). A reviewer demonstrated distress content in `false_judgements`
reaching the insert. In Stoic practice that field is where a practitioner records their own
catastrophic self-statements.

### QUESTION A2b

**Does the screened set stay at the seven named fields, or does it extend to every caller-supplied
field capable of carrying prose?** The seven-field scope was drawn partly on a criterion the code
does not enforce and which does not partition the fields as described.

---

## 5. Status of Question A — your ruling stands, and is unexecuted

Question A was implemented, independently reviewed under PR19, and **reverted**.

Six reviewers on isolated checkouts returned **5 CRITICAL, 12 HIGH, 9 MEDIUM**
(`2026-08-31-PR19-review-register-score-save-perimeter.md`). The dispositive defect was not a test
gap. The implementation returned the distress redirect as HTTP 200; the calling page reads a 200 as
success. A practitioner writing acute distress into `emotional_state` — the exact case your ruling
was about — received a **silently unsaved record, the word "saved", and no crisis resources**. That is
worse than the unscreened state it replaced, for precisely the population the perimeter protects.

The code is reverted; **every record was preserved**. Your ruling remains **adopted and unexecuted**.
`/api/score/save` again screens nothing and `/api/score` still screens `action` alone — the state you
judged inadequate. The exhaustiveness backstop is red at 689/2, which is the sequencing you confirmed
as correct.

**Nothing will be rebuilt until Questions B and A2b are answered**, because A2b determines the scope
of what the rebuild must screen.

---

## 6. What this project takes from the error, stated without mitigation

A mechanism fact was relayed to you as verified when the verification had inspected one of the two
files that define the route's contract. The check that failed is one this codebase had already
written down as a known blindness class. The pattern worth naming is not carelessness but
**inherited-confidence**: the assurance "verified first-hand" was carried forward from the sweep's own
hardened predicate to a hand-grep that did not implement it.
