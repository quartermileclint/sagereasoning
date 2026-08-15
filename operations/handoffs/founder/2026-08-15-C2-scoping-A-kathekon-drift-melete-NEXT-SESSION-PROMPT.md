# Next session — concurrent-arc C2: Scoping session A (kathêkon role-relative + hegemonikon drift/melete)

**Open the session in the `sagereasoning` repo root** (not the runner's scratch project):

```bash
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning && claude
```

**Paste this as the FIRST message of the new session.** It is the C2 session of the concurrent
arc (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — the governing document;
C2 is **GO per the mentor's M2 ruling**, 2026-08-15). It inherits the arc's verified grounding
through the plan under the lean protocol — do not re-read the full standing opener.

**Tier: `governance`, documents only.** No code, schema, flag, credential, migration, or
public-surface change. Founder presence: none required mid-session (this prompt is the
election). The session produces **two scope documents for mentor ruling** — it decides nothing
the mentor owns, and **execution folds into post-run sessions after the ruling** (M2, verbatim:
"The sessions produce the document. The mentor rules on the document.").

**Standing instruction (carry it all session):** if you run an adversarial review, PAUSE before
launching it so the founder can drop the model setting, and PAUSE after it completes so the
founder can restore it. For this documents-only session a full PR19 pass is not mandated; a
lighter claims-vs-repo check on each scope document before close is recommended (same pauses if
it uses a subagent at scale — a single small verification agent does not need the pause).

---

## Step 1 — Ground (lean)

Read, in order:

1. The arc plan's **C2 block** + its "Standing constraints" section
   (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`).
2. **The state list below** (authoritative where anything older conflicts).
3. The two Tier-2 scoping records (the session's actual inputs):
   - `operations/agent-circles-2026-08/2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md`
   - `operations/agent-circles-2026-08/2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md`
4. The M2 ruling verbatim (so the output shape is the ruled one):
   `operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md` (M2
   section; skim the rest only as needed).

**State list — true as of the C1 close (2026-08-15, all pushed, Vercel green through `4b70f20`):**

- **C1 is DONE** (`D-CONCURRENT-ARC-C1-Q5C-Q13A-R18-DOCS-AND-RECORD-INTEGRITY-2026-08-15`; PR19
  GO, zero findings). The Q5c/Q13a R18 docs are **live on production** (llms.txt subsection
  "The Stoa — curator-flagged trust events"; agent-card extension #23
  `stoa-curator-flagged-trust-events/v1`; api-docs paragraph; the two 2026-08-08 separation
  claims qualified). CLAUDE.md's C15 is CLOSED; the standing opener carries dated errata on
  queue items 9/15/17/18; the false-hold new-window design is SCOPED (register P6; P8a
  precondition; window starts R4-last).
- **The mentor's M1–M7 rulings are all EXECUTED** — nothing in them is pending for this session
  beyond M2's license to run it.
- Run snapshot at C1 close: **16 cycles** (11 winner / 3 dependency_unavailable / 2 null_cycle;
  latest 2026-08-15 02:17 UTC) — re-derive, don't trust it.
- Working-tree strays remain deliberate (untracked-until-elected); touch nothing not required by
  this session's task. `website/src/data/environmental-context.json` is a known pre-existing
  modified stray — leave it out of any commit.

## Step 2 — Parallel-window pre-flight, fresh (mandatory while the run is in flight)

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md` steps
1–3 exactly: check the scratch project
(`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`) for any
`*-CHANGE-SPEC.md` / `*-BLOCKED.md` other than the resolved `NOT-SELECTED-CHANGE-SPEC.md` →
**Mode 1 preempts everything.** Otherwise re-derive the live cycle count (production Supabase
via PostgREST, creds in `website/.env.local`, loop `sagereasoning:idea-loop@v1#001`, read-only,
never print the key; note the `cycle_outcome` column name). **≥20 + founder-confirmed runner
hand-back → STOP and tell the founder** (Mode 3 / the §6 report takes precedence over C2).
Then `git fetch origin && git log origin/main..HEAD --oneline && git status --short` — expected
clean through `4b70f20` (or only this prompt's own authoring commit).

## Step 3 — The work: two scope documents, each written FOR mentor ruling

Both documents live in `operations/agent-circles-2026-08/` (dated 2026-08-<day>). Both are
**scope documents, not designs of record and not builds** — their job is to give the mentor a
complete, honest picture of the decision space so the ruling can be made once, cleanly.

**PR20 binds both documents (this is load-bearing):** a brief to the mentor MUST name the
affected architectural surfaces — including fold/seed mechanics where an event class touches
trust state (the 2026-08-04 floor-creation lesson: *"the fold mechanism seeds a new domain row
at the floor for any decrease event in an unexamined domain"* would have changed a ruling had
it been stated). For each proposed mechanism, state: which files/surfaces it would touch, what
event effects (increase/decrease/flag) are implied, how it interacts with the evidence gate,
what is served publicly vs ledgered-only, and what the MEASURE/ENFORCE posture is. Verify
mechanics against the actual code (grep/read first-hand), never from records alone
(`primary-data-beats-secondary-characterisation`).

### Document 1 — Kathêkon role-relative evaluation (scope for ruling)

Work from the 2026-08-12 scoping record as the input, and honour its recorded boundaries:
- Inherits the **C6 + QG-D precedent** (re-read those from the record's own citations — do not
  re-derive them from memory).
- **Kathêkon ≠ blast radius is a recorded boundary** — the scope document must keep the
  role-relative kathêkon question separate from the two settled blast-radius names
  (*loop-level blast-radius proxy*; *permission-layer blast-radius enrichment* — binding names,
  never shortened).
- The document should surface (not answer): what "role-relative" would mean against the live
  kathekon predicate (`assessKathekonEngagement` — the same shared function the S11 G6(a) flip
  binds on; any change to it re-opens flip-readiness questions — say so explicitly in the
  brief), where role information would come from, and what the honest limits are.

### Document 2 — Hegemonikon drift + melete (scope for ruling)

Work from the 2026-08-12 scoping record; the four scope inputs it names:
1. the **ADR-013 §8 `does_not_attest` question** (whether/how drift claims interact with the
   published honest-claims envelope — quote the live envelope text first-hand);
2. **melete's half** (the practice/rehearsal mechanism's scope);
3. the **M7-window question**;
4. the **proposal-range-narrowing framing**.

Plus the record's named constraints: **Seneca 75.8–9 as the criterion**, the
**hysteresis-vs-practitioner-stability warning**, and the **n=1 survivorship-flagged harness
data** (state the n=1 limitation plainly in the brief — the mentor must not receive it as a
distribution).

### Output shape (both documents)

Each: the question(s) for ruling stated crisply up front → the decision space with honest
trade-offs → affected architectural surfaces (PR20) → what the AI recommends ONLY where the
scoping record already licenses a recommendation, otherwise present-don't-recommend → explicit
"not asked / out of scope" list → the sequencing note (execution post-run, after the ruling;
per M2). Neither document self-starts anything.

## Step 4 — Close (lean)

- Lean decision-log entry (one entry covering both documents; `governance` tier).
- Tick the arc plan's **C2** checkbox.
- Commit only this session's own outputs (the two scope documents + decision log + arc plan
  tick + this prompt file if it isn't already committed). Use `git commit -F <file>` if the
  message quotes anything.
- Founder pushes; the founder takes the two documents to the mentor at their own cadence.

## What NOT to do

- **No execution, no build, no code edit** — M2's ruling is explicit: scope documents only;
  execution folds into post-run sessions after the ruling.
- No fenced-surface changes (the three IDEA-loop flags, watching vocabularies, runner credential
  `527cc86b-…`, the four live route contracts, `idea_loop_*` schema). **The Q1 hard constraint
  holds: the loop proposes; it never executes.** Weights BLOCKED; the P0 0h hold stands.
- No editing `stoic-brain.ts`/`.json` (SHA-pinned regardless of the window ruling).
- Don't pre-answer anything reserved for the mentor (the whole point of both documents) or the
  founder-convened Prudence Q2 / SagePals Stage-4 questions.
- Don't touch the R-phase items, the guard bundle, or C3–C5's work.

---

**Forecast.** Success = pre-flight clean (Mode 2), both scope documents authored to the ruled
shape with PR20-complete surface naming and first-hand-verified mechanics, a lean close with
C2 ticked — and the runner never disturbed.

*End of prompt.*
