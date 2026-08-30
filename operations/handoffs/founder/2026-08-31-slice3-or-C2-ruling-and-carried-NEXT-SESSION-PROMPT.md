# Next-session prompt — slice 3, or the C2 ruling, and the carried tail

**Paste this as the task after the standing session opener.** Authored 2026-08-30 at the close of the
C2-reachability finding session. **Authoring this prompt licensed nothing.**

## First — two things are unpushed and one of them is a live-surface fix

`1db52c8` renames the last **uppercase** `BORDERLINE` in `llms.txt`; `2752cf9` is the prior successor
prompt. **The previous session could not push them** — no git credentials in that environment, `gh`
absent. **Verify whether they are pushed before anything else**, and if not, that is a founder step.

```
git log origin/main..HEAD --oneline                                    # expect empty
curl -s https://www.sagereasoning.com/llms.txt | grep -ci borderline   # expect 0
```

Pre-push state was measured on 2026-08-30: **live = 1, local = 0.**

## The state that changed since the last prompt

**The provenance ledger's classification side is structurally dead, and this is now recorded.** Read
before choosing a task:

- `operations/agent-circles-2026-08/2026-08-30-provenance-ledger-C2-observation-input-unreachable-FINDING.md`
- `operations/agent-circles-2026-08/2026-08-30-MENTOR-QUESTION-provenance-ledger-C2-reachability.md`
- `D-PROVENANCE-LEDGER-C2-OBSERVATION-INPUT-UNREACHABLE-FOUND` in the decision log

In one line: the write side is healthy (187 rows), but `classifyProvenanceArtifact` is reached only
from the accreditation-write route, which 409s a `seed` write against an existing row **before** the
emission call — and the harness close hook only ever seeds. **15 of 15 closes since activation logged
`already-exists`; zero `accred=written` in the log's whole seven-week span.** So slice 5's C2
observation has no inputs and C2's denominator is empty besides.

**The mentor question is drafted and unasked.** Four shapes are laid out in it; **do not pick one in a
build session** — threshold definition has been mentor territory throughout this arc.

## Candidate tasks

### A — Slice 3 (still the recommended build)

`code-elevated`. The served `provenance_gaps` field plus the **§10 attestation amendment**. Governed
by `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` and by the slice-2 close's
**§"What is inherited by slice 3 and slice 5"**, which remains accurate: slice 3 inherits nothing from
slice 2's code and should not need to touch it.

**One thing changed for slice 3.** Its §10 amendment must now describe the field as reading a table
that is empty **and** name that the pipeline which would populate it has never run — not merely
"empty until slice 5." That is a sharper and more honest claim, and it is available only because of
the finding.

**The standing caution is unchanged and now stronger:** slice 3 amends `TRUST_RECORD_ENVELOPE`, which
took **four separate edits on 2026-08-30**. This would be the fifth pass. **Every blocking defect in
that arc was coverage, and coverage risk compounds with passes.** Deferring remains legitimate.

### B — Carry the mentor question and act on the ruling

If the question has been put and answered, the ruling governs. Note shape (b) and shape (c) are
**code-critical** if elected; shape (a) and shape (d) are records/tooling.

### C — The rest of the carried tail, unchanged from the previous prompt

| # | Item | Tier |
|---|---|---|
| 1 | **Correct the slice-2 close's step 5** — it instructs an observation that cannot succeed. Arguably do this regardless of the ruling, per the Stoa lesson that the durable harm is the contradiction persisting in the record | records |
| 2 | **`api/mentor/private/reflect/route.ts:660`** — the body-supplied `user_id` on a reflections insert; the only live **security** surface in the named-and-unbuilt list, founder-elected first of that list | `code-critical`, PR19 |
| 3 | **The RLS backlog remainder** — carrying the standing warning that a table-level RLS fix is **invisible** to a `SECURITY DEFINER` function writing the same table | `code-critical` |
| 4 | **The p5-force probe-set redesign**, governed by A5 Q2 — selection basis frozen **in advance**, **never** chosen by observed variance; and by Q3/Q4, a differently-defined sweep publishes **beside** the n=100 record, not over it | founder's call |
| 5 | Register D4, AE-3, P1/P6/P7/P8, C1c, the `/api/reason` status-masking fix, the reflect-path `loop_id` UUID bug, the `target_circle` gap, Resend provisioning, `agent_hold_observations` retention, the two LOW `founder_conversations` findings | various |

**Routed and NOT to be opened here** — **A2**, **A3**, **A4** and **D** belong to the
**standing-runner design session**, itself gated on the bounded validation run's §6 report. **D1** and
**D2** remain blocked.

**The A0 state is unchanged and the register is still stale on it** — the asymmetry is real, open, and
**instrumented**; do not re-scope it, and do not treat the register as current on that item.

## What keeps going wrong — read before drafting anything

**Nine review rounds across the predecessor arc. Not one found a wrong number. Every defect was
coverage.** Three were found only by a **live `curl` after deploy**. The 2026-08-30 session added a
tenth instance of the same shape in a different register: a claim about to be written as *"20+"* from
a visual scan, which counted exactly is **15**.

**Therefore:** apply by quoted first/last words against the live file; **sweep case-insensitively**;
diff every surface; verify **order**, not only presence; **count rather than estimate**; and **never
let the verification method share an assumption with the edit method.**

## Standing constraints — unchanged

- **Weights-BLOCKED.** Nothing in the C2 finding bears on it in either direction.
- **Q1 — the loop proposes; it never executes.**
- **The §A boundary.** Nothing consumes D6a's output as a signal into generation or election.
- **Path-specificity is binding.** The rate is `/api/guardrail` ONLY; `/api/reason` unmeasured, stated
  at all seven places and pinned (S2-52).
- **The class split is binding.** **Grave-vocabulary traffic** is what was measured; **near-boundary
  inputs** is the population a rate is properly about and **has never been measured**. Do not
  reintroduce the old term.
- **Concurrency:** `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`;
  append shared records at the physical tail.
- **Nothing bears on the 0h call, which remains the founder's.**

## State at authoring

- The verdict-variance disclosure is live and verified at all seven places **except** the single
  uppercase occurrence `1db52c8` fixes, which is **still live and still unpushed**.
- Battery **156/0**; `tsc` 0; build compiles. **Not re-run on 2026-08-30's finding session** — that
  session changed no code, so the figures are inherited, not re-verified.
- **Pins S2-58 through S2-68 all mutation-verified. S2-64 is an ORDERING pin** — `includes()` is
  order-blind, so re-verify it against an **actual re-inversion**, never merely re-run it. **S2-54 has
  survived four consecutive revisions untouched — leave it alone.**
- `agent_provenance_ledger` 187 rows and growing; `agent_provenance_gaps` **0**, correctly.

End of prompt.
