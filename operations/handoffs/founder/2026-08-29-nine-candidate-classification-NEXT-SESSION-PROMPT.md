# Next-session prompt — the nine-candidate remediation-shaped classification

**Paste this as the task after the standing session opener.** Tier: `governance`, a
practitioner-facing classification act — documents-only in the sense that it produces a written
classification, but it requires reading real candidate data (a DB read, likely founder-assisted).
No code, schema, flag, credential, or build is licensed by this prompt.

## What this is

The fourth step of the mentor's ruled Q7 sequence
(`operations/agent-circles-2026-08/2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`):

> *"Fourth, run the nine-candidate classification separately from the review. It is not folded
> into Probe 1 or novelty work — the classification is a practitioner-facing governance act and
> the review is a systems analysis; conflating them would compromise both."*

The ATRF register-completion pass (step 3) is done
(`D-ATRF-REGISTER-ROW-COMPLETED-2026-08-29`). **This is the next and last step before the
standing-runner design session opens** (step 5) — nothing in this prompt licenses opening that
session.

## The origin question, and why it needs a real read, not a re-derivation

From the bounded validation run's own §6 report
(`operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md`, "The guardrail calibration
limit" section, ~lines 166–187):

Of the 120 candidates generated across the 20-cycle run, **9 were rejected by the guardrail**
(`katorthoma_proximity = reflexive`, the floor class) and 37 failed the novelty check; 74 passed
both gates. One of the nine (h1, cycle 20) was read closely and found to be a **calibration limit,
not a correctness defect**: the guardrail's harm-identification was correct, but its attribution
was not — it scored a candidate that *described* a conduct in order to remediate it the same way
it would score a candidate that *exhibited* that conduct. Mentor's verbatim diagnosis: *"the
guardrail's extraction cannot reliably distinguish between a proposal that exhibits a conduct and
a proposal that describes a conduct in order to remediate it."*

The report explicitly declined to generalize from that one instance:

> *"This report does not have a mechanical, DB-derivable classifier for 'remediation-shaped' —
> that judgement requires reading each rejected candidate's proposed action... A full test of the
> hypothesis is therefore NOT completed here — doing so honestly requires either a qualitative
> pass over all 9 rejected candidates' text... or a mentor-guided reading. This gap is named
> rather than silently closed with a plausible-sounding guess."*

**The task: read all nine rejected candidates' `proposed_action` text and classify each as
remediation-shaped (describes a conduct in order to fix/report/prevent it) or not
(exhibits/proposes the conduct itself), then report whether the guardrail's rejection rate on the
remediation-shaped subset is disproportionate** — testing, not assuming, the hypothesis that the
attribution defect systematically depressed remediation-shaped candidates specifically.

## Where the data lives, and the access gap to solve first

The nine candidates are rows in the production `idea_loop_candidates` table
(`website/src/lib/substrate/idea-loop-watching-store.ts:62`, `CANDIDATES_TABLE =
'idea_loop_candidates'`), filtered on `guardrail_proximity = 'reflexive'` (or equivalently, on
whatever field the route stamps for a `rejected_by_guardrail` verdict — verify the exact filter
against `idea-loop-watching-store.ts`'s own read path before trusting this description of it, per
PR20). The candidate's proposed action lives in the `proposed_action` column.

**This session's own tools may not include live Supabase/production DB read access** — check the
available MCP tools first (search for anything Supabase- or database-shaped). If none is
connected:
- Ask the founder to run one read-only query against production and paste the results:
  `SELECT id, cycle_number, proposed_action, guardrail_proximity FROM idea_loop_candidates WHERE
  guardrail_proximity = 'reflexive' ORDER BY cycle_number;` (verify the exact column name for the
  rejection signal against source before running — do not guess a column name into a live query).
- Alternatively, check whether the run's own working materials (the founder's scratch project
  referenced elsewhere as `RUN-LOG.md` — **not present in this repo**, per a `find` at drafting
  time; ask the founder where the run's raw output lives if it isn't in `operations/`) already
  captured the nine candidates' text somewhere readable without a DB query.
- **h1 (cycle 20) is already read and diagnosed** — do not re-derive it; cite the §6 report's own
  finding and fold it into the nine as one already-classified instance, not an eighth or tenth
  data point.

## What "done" looks like

- All nine candidates' `proposed_action` text read (not summarized from memory, not guessed).
- Each classified remediation-shaped / not, with the classifying reasoning shown, not just the
  verdict (a bare label without the reasoning that produced it fails the same standard the §6
  report itself named — "not silently closed with a plausible-sounding guess").
- The disproportion question answered honestly: 9 rejections is a small sample, and a report that
  finds "6 of 9 were remediation-shaped" must also say what that does and does not license (it
  raises or lowers confidence in the calibration-limit hypothesis; it is not, on its own, a
  9-candidate sample large enough to prove a systematic rate, and the report should say so rather
  than overclaim).
- If genuinely fewer than nine rows are found, or the filter used doesn't cleanly isolate exactly
  nine, that discrepancy is reported and reconciled against the §6 report's count — not silently
  adjusted to make the numbers match.
- A decision-log entry records the classification, its method, its finding, and what it does and
  does not settle (per Q4 of `2026-08-23-mentor-rulings-oc-gate2-verbatim.md`: the classification
  gates R8 — the standing-runner design session — but the mentor's own reasoning there notes the
  design work does not strictly need the full classification to proceed on the calibration-limit
  question; check whether that Q4 ruling and the later Q7 sequencing are in tension before
  treating either as settling exactly what this classification's absence would block, and if they
  are in tension, name that rather than picking one silently).
- **Nothing else is resolved.** GS-CYB-1, Q-C2b, §5d, the capacity axis, and every other open item
  in the named-input register keep their status exactly as the 2026-08-29 register-completion
  pass left them.

## Standing constraints (apply throughout)

- **PR20** — verify the exact column/filter names and the guardrail-verdict field against
  `idea-loop-watching-store.ts` source before running or requesting any query; do not infer schema
  from this prompt's description of it.
- **PR19** — if this session's classification produces a finding with design consequences
  (e.g., "yes, the guardrail systematically depressed remediation-shaped candidates"), an
  independent adversarial review of the classification's reasoning (not just its arithmetic)
  before the finding is treated as final, per the project's standing practice this window.
- **Concurrency convention:** run `ListAgents` at open; commit path-scoped; never `git add -A`.
- This is a **practitioner-facing governance act**, per Q7's own framing — the classification
  judgement (remediation-shaped or not) is a substantive read of intent from text, not a mechanical
  derivation. Show the reasoning, don't just assert the label.

## Then what

On completion, per Q7: **the standing-runner design session opens**, with the four instruction
frames (F3 Anandkumar, F4 convergence, F5 Spinoza capstone, presented together per F5) plus the
seven-probe adversarial review's findings plus this session's corrected named-input register plus
this classification's finding, all as its inputs. The O-C Gate-3 design session is a parallel
track with no ordering dependency on any of this.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md` (the origin — "The guardrail
  calibration limit" section)
- `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-oc-gate2-verbatim.md` Q4 (the
  classification ruled as R8's own gating task)
- `operations/agent-circles-2026-08/2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`
  Q7 (the sequencing this prompt executes step 4 of)
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs held for not-yet-opened
  sessions" (the register this session's predecessor completed — read it for full context on what
  the standing-runner design session will inherit)
- `website/src/lib/substrate/idea-loop-watching-store.ts` (the table/column source of truth)
- `operations/decision-log.md` — `D-ATRF-REGISTER-ROW-COMPLETED-2026-08-29`,
  `D-FIVE-INSTRUCTION-FAMILY-RULED-ADOPTED-EXECUTED-2026-08-29`,
  `D-ADVERSARIAL-REVIEW-CYBERNETIC-SEVEN-PROBES-RUN-PR19-FOLDED-2026-08-29`
