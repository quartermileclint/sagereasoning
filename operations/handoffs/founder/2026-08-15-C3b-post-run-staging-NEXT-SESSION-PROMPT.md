# Next session — concurrent-arc C3b: post-run staging (AI-only, documents)

**Open the session in the `sagereasoning` repo root** (not the runner's scratch project):

```bash
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning && claude
```

**Paste this as the FIRST message of the new session.** C3b is a **founder-elected addition**
(2026-08-15, elected in the C3/Ruling-Set-D follow-on conversation) to the concurrent arc
(`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — the governing document; its
C3b block was added at election). It inherits the arc's verified grounding through the plan
under the lean protocol — do not re-read the full standing opener.

**Tier: `governance`, documents only. This session is PREPARATION, not execution.** No code,
schema, flag, credential, migration, or public-surface change; no edit to any file a ruled
item will eventually edit. **The M2 boundary is the session's defining constraint: every ruled
execution item from Ruling Sets A, B, and D lands in post-run sessions — C3b stages those
sessions so they open with everything in hand; it executes none of them.** The rulings
themselves contemplate this class of work (B/M-B and D/L-5 both *require* statements in the
implementation record BEFORE their edits are made). Founder presence: none required
mid-session (this prompt is the election); the sign-off package produced here awaits the
founder's signature at the post-run R18 close, NOT in this session.

**Standing instruction (carry it all session):** if you run an adversarial review, PAUSE
before launching it so the founder can drop the model setting, and PAUSE after it completes so
the founder can restore it. For this documents-only session a full PR19 pass is not mandated;
a lighter claims-vs-repo check on the staging outputs before close is recommended (a single
small verification agent does not need the pause). **Citations lesson, now with two
instances — carry it forward:** verify every input record's citations first-hand before
reproducing them, AND treat your own "corrections" of a record's cites as claims needing the
same verification — at C3 the session's own §6 "correction" of a correct cite (`:45`→`:46`)
was the inverted error, caught only by the independent check and resolved only by direct
re-measurement (`grep -n` + `awk`, never a single display's line numbering).

---

## Step 1 — Ground (lean)

Read, in order:

1. The arc plan's **C3b block** + the **ruled-additions blocks under C2 and C3** + the
   conditionals table (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`).
2. **The four verbatim records carrying the in-hand wordings** — these are the binding
   sources; verbatim wins over every summary:
   - `operations/agent-circles-2026-08/2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`
     — Set A **R-5** (the kathêkon role-blindness qualification wording) and Set B **R-2/M-A**
     (the discriminative-range `does_not_attest` wording + the same-edit constraint).
   - `operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md`
     — **M6** (the total-unknown-branch curation-disclosure sentence).
   - `operations/agent-circles-2026-08/2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`
     — **D/O-A** (the practitioner-type calibration disclosure wording) + the D/O-C path
     ("a separate scoping session, which itself requires a ruling before execution").
   - `operations/agent-circles-2026-08/2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md`
     — **D/L-5** (the vetted Q1–Q6 canonical strings + the execution-record requirements).
3. The **format precedent** for sign-off packages:
   `operations/connective-layer-2026-08/2026-08-15-q5c-q13a-r18-docs-signoff-package.md` (the
   C1 package the founder signed — match its shape: per-surface insertion points, exact
   proposed text, provenance per wording, discovered-drift section, sign-off lines).

**State list — true as of the vetted-verbatim recording close (2026-08-15, pushed `1ebd95d`,
Vercel green):** C1/C2/C3 all DONE and RULED (Sets A, B, D); the L-5 vetted verbatim is in
hand; the five Set A/B execution items + the four Set D items are ALL post-run; D/O-C is
opened but its scoping session is NOT licensed (needs a ruling first); C4/C5 are the remaining
founder-walked Phase-1 sessions; run snapshot at authoring: **18 cycles** (13 winner /
3 dependency_unavailable / 2 null_cycle, latest 2026-08-15 17:41 UTC) — re-derive, don't
trust it. Working-tree strays remain deliberate; `website/src/data/environmental-context.json`
is a known pre-existing modified stray — leave it out of any commit.

## Step 2 — Parallel-window pre-flight, fresh (mandatory while the run is in flight)

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`
steps 1–3 exactly: check the scratch project
(`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`) for any
`*-CHANGE-SPEC.md` / `*-BLOCKED.md` other than the resolved `NOT-SELECTED-CHANGE-SPEC.md` →
**Mode 1 preempts everything.** Otherwise re-derive the live cycle count (production Supabase
via PostgREST, creds in `website/.env.local`, loop `sagereasoning:idea-loop@v1#001`,
read-only, never print the key; the `cycle_outcome` column; note `ended_at`, not
`completed_at`). **The run was at 18 of 20 at authoring — treat the ≥20 branch as LIVE:
≥20 + founder-confirmed runner hand-back → STOP and tell the founder** (Mode 3 / the §6
report takes precedence over C3b; C3b's staging value survives being deferred a session).
Then `git fetch origin && git log origin/main..HEAD --oneline && git status --short` —
expected clean through `1ebd95d` (or only this prompt's own authoring commit).

## Step 3 — The work: three staging deliverables (documents only)

All three live in `operations/agent-circles-2026-08/` (dated 2026-08-<day>). Every insertion
point, line number, extension count, and current-string claim is **verified first-hand against
the repo at session time** (grep/read; `primary-data-beats-secondary-characterisation`) — the
whole value of this session is that the post-run sessions inherit *verified* staging, not
transcribed staging.

### Deliverable 1 — the R18 sign-off package (three wordings, one package)

`2026-08-<day>-post-run-r18-signoff-package-STAGED.md` — for the founder's signature **at the
post-run R18 close** (R2's close or R4), covering the three mentor-worded DOC-surface items:

- **A/R-5** — the kathêkon role-blindness qualification → the guardrail GET self-doc
  (`website/src/app/api/guardrail/route.ts` ~:595-640 — re-derive the exact current lines),
  `website/public/llms.txt`, and the `agent-card.json` guardrail extension.
- **B/M-A (R18 half)** — the discriminative-range `does_not_attest` amendment's three R18
  surfaces (`llms.txt`, `agent-card.json`, api-docs). The CODE half (ADR + payload + battery,
  same-edit) is Deliverable 2's — state the split explicitly so neither session double-lands
  or half-lands it.
- **D/O-A** — the practitioner-type calibration disclosure → `llms.txt`, `agent-card.json`,
  api-docs.

Per wording: the mentor's verbatim text (quoted from its source record, cite exact), the
proposed insertion point with surrounding text (enough context that the founder can sign
without opening the file), the agent-card extension-count consequence (re-derive the current
count first-hand — it was 23 at C1; do not inherit), and a **discovered-drift section** (the
C1 precedent: placing wording is where stale claims on the live surfaces get found — check the
surrounding published text still matches the code it describes, and flag anything that
doesn't rather than silently accommodating it). Close the package with per-item sign-off
lines. **Nothing is applied to any surface in this session.**

### Deliverable 2 — the R2/R3 edit-spec staging document

`2026-08-<day>-post-run-edit-specs-STAGED.md` — precise, verified specs for the code-adjacent
ruled items, so the post-run build sessions open with the constraint structure already pinned:

- **B/M-A same-edit spec:** the three components that must land in ONE edit (the ADR-013 §8
  dated-amendment text drafted verbatim-ready; the `does_not_attest` array site in
  `website/src/lib/substrate/trust-core/trust-record-payload.ts` — re-verify the current
  lines, cited as `:52-61` in the ruling; the S10 battery pin
  `s10-trust-record-surface.test.ts:265` — re-verify). State the same-edit rule in the spec's
  own header so it cannot be split by accident.
- **M6 total-unknown-branch spec:** locate the total-UNKNOWN branch in the live payload code
  first-hand (the total-KNOWN branch gained its composition note 2026-08-12,
  `D-CURATION-VIA-VOLUME-FOLDED-INTO-LIVE-PAYLOAD-2026-08-12` — the unknown branch is the
  remaining half, previously routed to R2 at C1); spec the insertion of the M6 sentence
  verbatim + the battery/mutation expectations, noting the file is `/substrate/`-guard-class
  (the M1 window-conditional guard is dormant while `GATE1_FALSE_HOLD_CAPTURE` is unset —
  state the guard posture at execution time as a check the R2 session performs, not a fact
  inherited from this prompt).
- **D/L-5 implementation-record skeleton:** the four mentor-required elements pre-drafted
  (change-date placeholder; the Q4 deferral as a deliberate hold pending G4 mechanism review;
  the Q1 + Q3 amendments as canonical forms; all-else-byte-identical) + a **current-strings
  byte-check**: re-verify that `question-bank.ts`'s Q1–Q6 strings today still match what the
  candidate document assumed (guarding against drift between vetting and execution — if
  anything moved, flag it loudly; the vetted verbatim record remains canonical).
- **B/M-B flag-discipline statement, drafted:** the statement the ruling requires in the
  implementation record BEFORE the edit — a new member riding
  `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` is live the moment it deploys; per-feature darkness
  needs its own flag — plus the named decision the R2/R3 session must put to the founder
  (ride the existing flag and be live-on-deploy, or add a dedicated flag).

### Deliverable 3 — the D/O-C licensing question, drafted for the mentor

`2026-08-<day>-mentor-question-oc-design-scoping-license.md` — a short question in the
mentor-questions format asking whether (and when — post-run presumably) to license the O-C
per-consumer rendering design **scoping session**, per Set D's own path ("a separate scoping
session, which itself requires a ruling before execution"). Carry, without re-arguing: the
ruled design constraints already in hand (all five dimensions in scope; dimension (c)
load-bearing and first; the relay pattern "the precedent to follow, not to replace"; F-d
correct until the design rules), and the standing non-licenses (activation; the flag). The
question rides the founder's next consultation at their cadence. **Do not convene, run, or
pre-answer the scoping session itself.**

## Step 4 — Close (lean)

- Lighter claims-vs-repo check on the three deliverables (single small agent, no pause):
  every insertion point, line cite, extension count, and quoted wording verified against
  source; fold findings before close.
- Lean decision-log entry (`governance` tier).
- Tick the arc plan's **C3b** checkbox.
- Commit only this session's own outputs (the three staged documents + decision log + arc
  plan tick). Use `git commit -F <file>` if the message quotes anything.
- Founder pushes. The staged package waits for the post-run R18 close; the edit-specs wait
  for R2/R3; the mentor question rides the founder's next consultation.

## What NOT to do

- **No execution of any ruled item** — A/R-5, A/R-3, B/M-A, B/M-B, B/R-6, D/O-A, D/L-5,
  D/F-b are ALL post-run per M2; this session stages, it does not land. **No edit to
  `question-bank.ts`, `trust-record-payload.ts`, ADR-013, `llms.txt`, `agent-card.json`,
  api-docs, or any guardrail/route file.**
- **Do not convene the O-C scoping session** (Deliverable 3 drafts the *licensing question*
  only — the session itself needs a ruling first, per Set D verbatim).
- **`SUBSTRATE_LAYER3_ENABLED` activation is NOT licensed** by anything in this chain;
  restate it wherever the staged documents touch Layer 3 material.
- No fenced-surface changes (the three IDEA-loop flags, watching vocabularies, runner
  credential `527cc86b-…`, the four live route contracts, `idea_loop_*` schema). **The Q1
  hard constraint holds: the loop proposes; it never executes.** Weights BLOCKED; the P0 0h
  hold stands.
- No editing `stoic-brain.ts`/`.json` (SHA-pinned regardless of the window ruling).
- Don't touch the uniformity-reads-as-stable family (open in the hegemonikon record, ruled
  together or not at all), the founder-convened Prudence Q2 / SagePals Stage-4 questions,
  GS-ATRF-1/2/3, the four QG rulings, the R-phase items themselves, or C4/C5's work.
- Don't produce a fourth deliverable "while you're there" — three, then close.

---

**Forecast.** Success = pre-flight clean (Mode 2 — or an honest STOP handed to the founder if
the run has completed), three staged documents with every mechanical claim verified first-hand
at session time, findings from the close check folded, a lean close with C3b ticked — nothing
applied anywhere, `question-bank.ts` and every public surface byte-identical, and the runner
never disturbed.

*End of prompt.*
