# Next-session prompt — reconcile the verdict-variance wording, then run its PR19

**Paste this as the task after the standing session opener.** Authored 2026-08-30 at the close of
the first D6a live sweep. **Authoring this prompt licensed nothing.**

## Tier

**`governance`** for the reconciliation and the mentor relay (documents only). The session **may**
continue into the PR19 review of the wording, which is still `governance` — the review reads, it
does not apply. **Applying anything to a public surface is a different session** under the existing
`operations/handoffs/founder/2026-08-30-verdict-variance-disclosure-APPLICATION-NEXT-SESSION-PROMPT.md`,
which is `code-elevated`.

**AC7 is NOT engaged.** No mint, schema, flag, migration, credential, or public surface. **Do not
apply the disclosure in this session** — see the ordering note at the end.

## Read at open

- `D-R8-D6A-FIRST-LIVE-SWEEP-RATE-MEASURED-ANCHOR-FALSIFICATION-RECORDED-2026-08-30` (the sweep)
- `operations/handoffs/founder/2026-08-30-R8-D6a-first-live-sweep-CLOSE.md`
- `operations/agent-circles-2026-08/2026-08-30-verdict-variance-disclosure-R18-SIGNOFF-PACKAGE.md`
  (**the document this session reconciles**)
- `operations/agent-circles-2026-08/2026-08-30-mentor-question-verdict-variance-rate-presentation.md`
  (the brief awaiting relay)
- Both 2026-08-30 mentor verbatims. **They win over every summary, including this prompt.**

## The situation, stated plainly

The mentor's sequencing was: publish "variance exists, rate unknown" **first**, then update with the
rate. **That order inverted.** The D6a sweep ran on 2026-08-30 while the disclosure was still
unapplied (blocked on its own PR19). **The rate now exists and the disclosure does not.**

**Consequence — this is the session's reason for existing.** The signed wording asserts, in four
places and deliberately, that the rate is unmeasured:

| Surface | Signed text | Now |
|---|---|---|
| `TRUST_RECORD_ENVELOPE` §3 | "Its rate has not been measured" / "an instrument to measure it is scheduled" | **false** |
| `llms.txt` §6(a) | "The rate has NOT been measured… an instrument to measure it is scheduled" | **false** |
| `agent-card.json` | `"rate": "not measured"`, `"rate_location": "not yet determined"` | **false** |
| api-docs | "measured on one input (9 of 10 proceed, one block), rate not yet measured" | **false** — 5 inputs, 50 outcomes |

**Applying the wording unchanged would publish four false statements** in exactly the honesty class
this arc exists to correct. The `agent-card` one is sharpest: the sign-off package itself argues that
param is a positive machine-read claim, not an absence.

**Why the existing PR19 cannot catch this.** The application prompt says *"re-open the wording only
if PR19 finds a defect in it."* A reviewer checking the wording against its 2026-08-29 sources will
find it faithful — the defect was created *after* sign-off by a later run. **Tell the reviewer the
sweep happened and hand it the rate file.**

## What this session does

**1. Relay the mentor brief.** It is authored and awaiting the founder:
`operations/agent-circles-2026-08/2026-08-30-mentor-question-verdict-variance-rate-presentation.md`.
Four questions: sequencing now the order inverted; whether a single rate may be published when the
variance is bidirectional; point estimate vs a 5.6–23.8% interval; and what the rate is *about* after
the clean anchor moved. **Capture the reply verbatim into a `-verbatim.md` record before acting on
it** — this arc's convention, and two prior captures in it ended on a trailing hyphen (confirmed a
non-issue, but check).

**2. Reconcile the wording, conditional on the reply.** The mechanical part is the founder's and is
small: replace the four "not measured" assertions. The *shape* depends on Q1 — one publication
carrying the rate, or the two-step preserved. **Do not guess Q1.** If the founder elects to proceed
without waiting for the mentor, the executing session's recommendation is in the table below.

**3. Then, and only then, run the wording's PR19** — the gate the application prompt names as its one
remaining blocker. Review the *reconciled* wording, not the stale one. Tell the reviewer the author's
own claims-vs-source pass already ran (package §11) so it hunts for what that missed. **This arc's
own inherited prompt warns the mandatory re-run "has been missed once already"; do not make it twice.**

## Open items and the executing session's recommendations

| # | Item | Recommendation | Whose call |
|---|---|---|---|
| 1 | Sequencing (mentor Q1) | **One publication carrying the rate.** No honesty argument supports publishing a statement known false at the moment of publication; the two-step's rationale (don't withhold while measuring) is spent. | Mentor, then founder |
| 2 | Directional split (mentor Q2) | **Disclose the asymmetry qualitatively, not as a second rate.** "Variance runs in both directions, including toward proceeding" is supportable at n=3/direction; a second percentage is not. | Mentor |
| 3 | Point estimate vs interval (Q3) | **Publish the interval, or "approximately 12% (n=50, 95% CI 6–24%)".** A bare 12% implies precision a 4× interval does not support. | Mentor |
| 4 | What the rate is about (Q4) | **Adopt the sharper formulation:** variance appears across the scale (the clean anchor moved too); what distinguishes the borderline class is that its variance *crosses the decision boundary*. More accurate and more calibrating. | Mentor |
| 5 | `llms.txt:118` — *"identical inputs produce identical assessments"* | **Qualify it in the same R18 pass.** Defensible as scoped to Layer 2, but it borrows `/api/reason`'s own request-field name; the three sibling claims are each explicitly scoped, which is what makes this one loose. Not doctrine — a defect. | Founder |
| 6 | A second sweep to tighten n | **Worth it before publishing a number, and cheap** — ~$0.93, ~30 min, halves the interval far more than raising K would. Not proposed as blocking. | Founder |
| 7 | Directional split in the *runner* | **Do not fold it in without PR19.** A runner change binds to its own independent review before the next sweep. If item 6 runs first, that review must precede it. | Founder |
| 8 | `runs/` size | Recorded correction: sized "~300KB/sweep", actual **1.3MB**. Fine at this cadence; archive, never delete. Don't re-quote the old figure. | — |

## Standing constraints — unchanged

- **Weights-BLOCKED.** No weighting function may be designed, sketched, or evaluated. Nothing in the
  sweep or the brief bears on the deferred M-vs-W ruling in either direction.
- **Q1 — the loop proposes; it never executes.** D6a is not in the loop's path.
- **The §A boundary.** Nothing consumes D6a's output as a signal into generation or election.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; the `/api/reason` rate is
  unknown and must be stated as unknown wherever the rate is named.
- **Concurrency:** `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`;
  append shared records at the physical tail.
- Nothing here bears on the 0h call, which remains the founder's.

## State at authoring

- **Committed at `350dd29`** — the sweep evidence, the frozen probe file, the decision-log entry, the
  close, and the predecessor session's build (which had never been committed).
- **The probe credential has consumed 140 of 600 monthly units.** Roughly three more sweeps fit.
- **Nothing is applied to any public surface.** The disclosure remains unapplied; verified
  first-hand 2026-08-30, not inherited.
- **Session honesty note:** every at-action Gate-2 guardrail check in the authoring session returned
  UNAVAILABLE on a 28s timeout, so that session's writes and its commit were unguarded. This is the
  same class the two predecessor sessions recorded, and — as one of them observed — it is the same
  instrument whose variance this arc is disclosing.

## What "done" looks like

The mentor brief relayed and its reply captured verbatim; the four false assertions reconciled
against the reply (or the founder's election recorded if they proceed without it); the wording's PR19
run against the *reconciled* text; a decision-log entry at the tail; a lean close naming the
application session as the successor. **Nothing applied to a public surface in this session.**

End of prompt.
