> **⛔ SPENT 2026-08-23.** This prompt was executed in full. All four pieces are built,
> PR19-reviewed twice, and green; nothing live was touched. See
> `operations/handoffs/founder/2026-08-23-atrf-ee-production-wave-CLOSE.md` and the walk
> reference `…-FOUNDER-WALK.md`. Two of this prompt's own instructions were corrected against
> source during execution (Shape 1's "zero live-op cost" framing, and the directed second edit
> to `guardrail-sandwich.ts`) — both are recorded in the close. Do not re-run this prompt.

# Next-Session Prompt — ATRF/EE Production Wave (build session, one consolidated founder walk)

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `code-critical` — this session touches a live schema (an additive migration on
`idea_loop_candidates`), a new endpoint, a live-surface wire change (byte-identity disciplines), and
an already-authored RLS lockdown migration. Full Critical Change Protocol applies to every live step.
AC7 engaged at the founder walk (not before). PR6, PR19 (independent adversarial review, mandatory
before any of this is treated as verified), PR20 (timestamp-check every fact below at open).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor:** the ATRF arc close (`2026-08-23-ATRF-scoping-session-CLOSE.md`, through Addendum 3)
and the Evaluative Engine close (`2026-08-23-evaluative-engine-epistemic-status-scoping-CLOSE.md`) —
**both fully ruled; nothing in this prompt is a proposal, everything cited below is a binding
ruling.** Check `git log -1` and the decision-log tail before trusting this snapshot — this prompt
was written at HEAD `7c77123`.

---

## Why this session bundles four things

Four independent pieces of work all reached the identical state — **fully ruled, fully specified,
nothing left to design, waiting only on a build + a founder-walked live step** — within the same day.
Rather than four separate sessions each re-reading the grounding and each asking for a separate
founder sitting, this session builds all four and ends in **one consolidated founder walk** covering
every live step at once. If any one piece turns out to need more design than expected, split it out
and finish the other three — do not let one blocked item stall the rest.

**One question to confirm at open, not assumed:** is the founder content to batch the Class B RLS
walk (a different backlog thread — the RLS survey, not the ATRF/EE arcs) into this same sitting? The
default in this prompt is yes (it is fully ready and the marginal cost of one more `SQL Editor`
sitting in the same session is near zero) — but say so explicitly in the close if the founder splits
it out instead.

---

## Step 0 — Open, re-ground, confirm nothing has moved

1. Read `/adopted/standing-protocol-cache.md` in full. Read this file in full.
2. `ListAgents` — coordinate with any live peers before editing; this stream has run with 3–5
   concurrent sessions on several days this week. Sequence any decision-log append explicitly.
3. `git log -1` and `git status` — confirm HEAD is at or after `7c77123`; if the tree has moved,
   re-read whatever landed since before trusting the register below.
4. **Timestamp-check every ruling citation in Part A against its source file** before building
   from it (PR20) — this prompt quotes rulings, it does not re-derive them; re-derivation is this
   session's job, not this prompt's.
5. Confirm at open: tier `code-critical`; hold-point P0 0h active (founder's 2026-08-22 direction:
   all current tasks before any 0h assessment, unaffected by this session); model + effort stated;
   weights BLOCKED; the Q1 hard constraint untouched by anything here.

---

## Part A — The four pieces, each fully specified by a binding ruling

### A1 — Class B RLS lockdown (apply an already-built, TEST-verified migration)

**Nothing to design.** Built and TEST-verified in the Class-B route-change session
(`D-CLASS-B-ROUTE-CHANGE-BUILT-TEST-VERIFIED-2026-08-23`): `website/supabase-class-b-rls-lockdown-migration.sql`
+ `website/scripts/class-b-rls-bypass-proof.ts`, mirroring the `impulse_entries`/practice-family
pattern exactly. The route-change prerequisite (zero remaining client-side consumer of
`action_evaluations_v3`/`journal_entries`/`reflections`) is PR19-confirmed done. This step is: walk
the migration TEST → production, run the bypass-proof harness in both default and `--legit` mode
against real TEST data first, then production, per the item-4/`impulse_entries` precedent exactly.

### A2 — GS-ATRF-2 shape: the additive `idea_loop_candidates` migration

**Ruled** (`2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md`, Q-B1/Q-B2): `target_circle`
is **ELECTED** as a column (not a cycle-level resolution from the gap). Three additive columns land
on `idea_loop_candidates`: the loop's own blast-radius indicator (`high|medium|low`, CHECK-constrained
— GS-ATRF-1's four-dimension answer, §(a) of `gs-atrf-corrections.md`, unabridged, not the
circle-only narrowing), the agent's own blast-radius assessment (same vocabulary, recorded
*"alongside … for longitudinal comparison"* per the manifest's ATRF text — **two records, not one**),
and `target_circle`. Q-B2: *"Conditional on Q-D1. One migration window if eighth heuristic elected;
three blast-radius columns and S4 extension proceed regardless."* Q-D1 elected **pre-generation
step** (not the eighth heuristic), so the combined-window condition does not bind — **this migration
can proceed standalone.**

**S4 rides the same migration window** (Q-B2: *"S4 extension proceed[s] regardless… S4 column set
specified at build session"*). Read `operations/primal-substrate-2026-08/S4-traceability-criterion-scope.md`
in full before drafting the migration — it names the parked half as *"an additive migration on
`idea_loop_candidates`"* and the ruled cross-endpoint-comparison criterion this table extension is
meant to serve; **the exact S4 column set is this session's engineering decision to make and
document, not a pre-given list** — read the scope doc, propose the columns, state the reasoning in
the decision-log entry.

### A3 — The ATRF completion-signal endpoint (GS-ATRF-3 return path)

**Fully specified, ruled** (same rulings file, Q-C1/Q-C2a/Q-C3/Q-C4):
- **Actor:** the agent, post-execution.
- **Transport:** direct credentialed POST (a new, dedicated harness endpoint — not folded into an
  existing route).
- **Schema:** `loop_id` (the cycle whose elected idea was executed) + the agent's own provenance
  status for the signal's propositions (**inference** — self-reported post-execution evidence is
  constructed, not directly observed, per Q-A1) + the examination content + a **refuse-to-attest
  branch** (a **named field**, required — Q-C3: *"the signal carries the examination record, never a
  justice verdict"*).
- **Examination content (Q-C2a, M5-confirmed):** three questions in sequence — (1) what impression
  was assented to; (2) was the assent examined or habitual; (3) did the examination reach the
  katorthoma threshold. **Q-C2b (WHEN in the runner's cycle this fires) is explicitly NOT this
  session's to answer — its home is the standing-runner design session** (Q4.3 precedent + the
  F-Q43 discrimination warning carried there). Build the endpoint to *receive* this content; do not
  design the runner-side trigger.
- **Provenance statuses on the signal's own propositions (Q-C4):** inference /
  inference-with-credence-constraint / unknown-on-the-refuse-branch.
- **Persistence:** the watching table, **immediate on receipt**. *"Receipt triggers the write only —
  no flag, no dashboard update at this stage."* Do not build a dashboard surface or a flag-gated
  read path in this session; that is out of scope by the ruling's own words.
- **Schema is additive** — a new payload type on the new endpoint; no existing signal is replaced.

### A4 — Evaluative Engine Shapes 1 and 2

**Ruled** (`2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md`):

**Shape 1 — the documentation map (governance, zero live-op cost, unconditional prerequisite —
build this FIRST, before A4's Shape 2 or A3):**
> *"Required regardless of which shape is elected... near-zero cost... addresses the doctrinal-prior
> disclosure (EE-C3) and the quiet-site-#2 interim label (EE-C2) without touching the wire. Shape 1
> runs first, unconditionally."*

The map must carry, with the exact ruled wordings (read them from source, do not paraphrase):
- **EE-C2** — quiet site #2's interim label (the `ruling_faculty_state`/deliberation-notes proxy);
  *"removed at the same commit the D4-completion fix lands"* — name that removal condition in the
  map entry itself, not just in the decision-log.
- **EE-C3** — the doctrinal-prior grades' (honourability/advantageousness) label: *assumption,
  established* — the framework's own structure, not a proposition asserted about submitted text.
- **EE-D1** — the conditionality marker for `obligation_assessment`/`examined_before_acting`: *"a
  constant architectural fact… `corroboration-checked on this consult only when the action text was
  supplied, the check flag was on, and dikaiosyne weighting was on (layer2-mechanisms.ts:2808-2818);
  unchecked otherwise.`"* Plus the standing A2-coverage constraint wording: per-field status entries
  *"must not imply A2 coverage and must not be constructed to suggest it."*
- **EE-D2** — the signature-scope disclosure forward pointer.
- **EE-A2** — the computed-field derivation note (Layer-2 outputs = inference, weakest-provenance-
  inherited from Layer 1; computation's determinism is expressed on the *signature* axis, not the
  provenance axis) — additive at documentation-map level (the wire option was not elected — see
  Shape 2 below, EE-A3: *"credence field not elected"*).

**Shape 2 — the one wire change (`code-critical`, PR19-required, byte-identity disciplines on
MEASURED surfaces — `/api/reason` and `/api/guardrail`'s import graph):**
> **EE-C1, ruled string, apply verbatim:** *"No kathekon factors were extracted from the submitted
> text; on that basis, the engine reads the action as contrary to appropriate action."*

This replaces the current quiet-site-#1 justification string at
`layer2-mechanisms.ts:1271-1274` (**re-verify the line number from source — do not trust this
citation, this exact class of drift has recurred in this stream**). The ruling names a **second live
surface** the string reaches: *"the quiet-site-#1 live-surface finding (`synthesizeReasoning`
surfaces the justification string verbatim on the live guardrail verdict)"* — find and update that
call site too (`guardrail-sandwich.ts`, per the EE scoping document's own citation, `:195`/`:350` —
re-verify). **This is a wording-only change: EE-C1/C2 do not change any classification, floor, or
downstream consequence — the `is_kathekon = false` verdict and everything derived from it are
unchanged.** The byte-identity guard on this stream's measured surfaces applies — confirm its
current window-conditional state (`GATE1_FALSE_HOLD_CAPTURE`) before editing either file, per the
2026-08-15 M1 ruling (window-conditional; check current state, don't assume dormant).

**Not in scope for this session:** the EE-A3 credence-field wire option (explicitly not elected);
any §6.9 (inquiry-discipline-outputs-on-the-public-trust-record) work (unowned, far downstream); the
D4-completion proxy fix itself (its own future, separately-scoped build — only its *label removal
condition* is written into today's Shape-1 map entry).

---

## Part B — Build order

1. **Shape 1 first** (governance, no code) — the documentation map. Cheapest, zero risk, unblocks
   nothing else but should not wait behind riskier work.
2. **A2's migration** (schema authoring — TEST apply is part of the founder walk, not before).
   Author `idea_loop_candidates`'s additive columns (GS-ATRF-2's three + S4's set, one migration
   file, one window) with the standard idempotent/additive/reversible shape and a `§VERIFY` block,
   following the `impulse_entries`/practice-family precedent for form.
3. **A3's endpoint build** — the new route, its schema, its persistence-on-receipt write. TEST-only
   verification (real POST round-trips against a TEST watching-table row) before any live step.
4. **A4 Shape 2's wire reword** — small, but carries the full PR19/byte-identity discipline; do not
   let its smallness invite a shortcut on review rigor.
5. **PR19** — independent adversarial review across everything built (A2's migration, A3's endpoint
   + schema, A4 Shape 2's reword). If the account session limit kills review agents, complete the
   review first-hand per this stream's now-repeated precedent (§4 pattern) rather than skip it.
6. **The consolidated founder walk** — one sitting, in this order: (a) A1's Class B RLS migration,
   TEST then production, with the bypass-proof harness both directions; (b) A2's `idea_loop_candidates`
   migration, TEST then production; (c) push + deploy A3's endpoint + A4 Shape 2's reword together
   (one commit or two — founder's preference, name which in the close); (d) live smoke on the new
   endpoint against production (a real POST, real persistence confirmed, then decide with the founder
   whether to leave the test row or clean it up — record whichever is chosen).

---

## Constraints that bind regardless

- **PR19** required before any of this is "verified" (trust-core/predicate/fold/engine-adjacent
  class, and separately, R20a/auth-adjacent scope-widened class for A1).
- **PR20** — every fact above is a citation to a ruling, not a live-repo fact; re-verify against
  source at open, and timestamp-check the byte-identity guard's current state before touching either
  measured-surface file in A4.
- **PR6 + AC7** — full Critical Change Protocol for every live step in the Part-B Step-6 walk.
- **PR23** — consult the memory index before diagnosing or writing in a recurring class;
  `nextjs-route-export-validation` and `Supabase view default grants + auto-updatable` are both
  plausibly relevant to the new endpoint's route file.
- The Q1 hard constraint (the loop proposes, never executes) is untouched by A3 — the new endpoint
  *receives* a completion signal from an agent that already acted; it does not cause any action.
- Weights BLOCKED throughout; nothing here is a training signal.

---

## What does not move in this session

- Q-C2b (the completion-signal trigger's place in the runner's cycle) — standing-runner design
  session's, not this one's.
- The standing-runner design session itself, and the O-C Gate-3 design session — both licensed to
  open, neither pre-scoped here; unaffected by this session.
- The RLS survey backlog remainder (Class A rows 13–18, row 28, the non-`security_invoker` view
  gap) and mechanical item 6 housekeeping — carried, not touched.
- The D4-completion proxy fix itself, and the EE-A3 credence-field option — named, not built.
- The reflections-examination arc's four work items — a separate arc, untouched.

---

*End of prompt. Four independently-ruled, fully-specified pieces, one build pass, one consolidated
founder walk. If any piece needs more design than its ruling supplies, stop that piece and name the
gap — do not improvise past what was ruled.*
