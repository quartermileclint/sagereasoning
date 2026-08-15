# Next session — concurrent-arc C3: Scoping session B (Layer 3 per-consumer rendering)

**Open the session in the `sagereasoning` repo root** (not the runner's scratch project):

```bash
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning && claude
```

**Paste this as the FIRST message of the new session.** It is the C3 session of the concurrent
arc (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — the governing document;
C3 is **GO per the mentor's M2 ruling**, 2026-08-15, and **Ruling Set C of the C2 rulings
explicitly awaits this document**: *"The Layer 3 session remains OPEN — awaiting ruling — and is
not ruled here. It will be ruled in a separate consultation once the scope document is produced
under the M2 process."*). It inherits the arc's verified grounding through the plan under the
lean protocol — do not re-read the full standing opener.

**Tier: `governance`, documents only.** No code, schema, flag, credential, migration, or
public-surface change. Founder presence: none required mid-session (this prompt is the
election). The session produces **ONE scope document for mentor ruling** — it decides nothing
the mentor owns, and **execution folds into post-run sessions after the ruling** (M2, verbatim:
"The sessions produce the document. The mentor rules on the document.").

**Standing instruction (carry it all session):** if you run an adversarial review, PAUSE before
launching it so the founder can drop the model setting, and PAUSE after it completes so the
founder can restore it. For this documents-only session a full PR19 pass is not mandated; a
lighter claims-vs-repo check on the scope document before close is recommended (a single small
verification agent does not need the pause). **C2 lesson, carry it forward: verify the input
record's OWN citations first-hand before reproducing any of them** — at C2 one imprecise
citation propagated from the 08-12 record into a mentor-facing draft and was caught only by the
close check.

---

## Step 1 — Ground (lean)

Read, in order:

1. The arc plan's **C3 block** + its "Standing constraints" section + the **ruled-additions
   block under C2** (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`).
2. **The state list below** (authoritative where anything older conflicts).
3. The Tier-2 scoping record — the session's actual input:
   `operations/agent-circles-2026-08/2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md`
   (it carries the session question verbatim, the 2026-08-14 Stage 2 relational-context
   amendment, the four placeholder fields, the reflect-wording residual, and the
   discriminator-reuse constraint — all binding on this session).
4. The M2 ruling verbatim (so the output shape is the ruled one):
   `operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md`
   (M2 section; skim the rest only as needed).
5. The C2 rulings verbatim — for Set C (this session's mandate) and for the SHAPE Sets A/B
   model (what a ruling-ready scope document looks like, and how the mentor ruled on
   landing-surface option lists):
   `operations/agent-circles-2026-08/2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`.
6. Optional, for the output shape only: the two C2 scope documents in
   `operations/agent-circles-2026-08/` (`2026-08-15-SCOPE-DOCUMENT-*-FOR-RULING.md`) — the
   ruled precedent for structure (questions up front → decision space → PR20 surfaces →
   recommend-only-where-licensed → not-asked list → sequencing note).

**State list — true as of the C2-rulings close (2026-08-15, all pushed, Vercel green through
`08d96e0`):**

- **C1 is DONE** (`D-CONCURRENT-ARC-C1-Q5C-Q13A-R18-DOCS-AND-RECORD-INTEGRITY-2026-08-15`).
- **C2 is DONE and RULED, same day**
  (`D-CONCURRENT-ARC-C2-SCOPE-DOCUMENTS-KATHEKON-AND-DRIFT-MELETE-2026-08-15` +
  `D-MENTOR-RULINGS-C2-SCOPE-DOCUMENTS-RECORDED-2026-08-15`): the kathêkon scoping session is
  **CLOSED** (Ruling Set A — role-relativity yes-conditionally; locus D-i guardrail-local; the
  remit gate an explicitly-ruled pre-filter, winner rule NOT amended; the R-5 naming
  qualification adopted with wording in hand); the hegemonikon session is ruled on items 1–4 +
  framing and **remains open ONLY for the uniformity-reads-as-stable family** (Ruling Set B —
  M-A + M-B adopted, M-C/M-D not adopted, melete deferred). **Five ruled execution items sit in
  the arc plan's ruled-additions block — ALL post-run; this session executes NONE of them.**
- Run snapshot at the C2 close: **17 cycles** (12 winner / 3 dependency_unavailable /
  2 null_cycle; latest 2026-08-15 09:56 UTC) — re-derive, don't trust it.
- Working-tree strays remain deliberate (untracked-until-elected); touch nothing not required
  by this session's task. `website/src/data/environmental-context.json` is a known pre-existing
  modified stray — leave it out of any commit.

## Step 2 — Parallel-window pre-flight, fresh (mandatory while the run is in flight)

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md` steps
1–3 exactly: check the scratch project
(`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`) for any
`*-CHANGE-SPEC.md` / `*-BLOCKED.md` other than the resolved `NOT-SELECTED-CHANGE-SPEC.md` →
**Mode 1 preempts everything.** Otherwise re-derive the live cycle count (production Supabase
via PostgREST, creds in `website/.env.local`, loop `sagereasoning:idea-loop@v1#001`, read-only,
never print the key; note the `cycle_outcome` column name). **≥20 + founder-confirmed runner
hand-back → STOP and tell the founder** (Mode 3 / the §6 report takes precedence over C3).
Then `git fetch origin && git log origin/main..HEAD --oneline && git status --short` — expected
clean through `08d96e0` (or only this prompt's own authoring commit).

## Step 3 — The work: ONE scope document, written FOR mentor ruling

The document lives in `operations/agent-circles-2026-08/` (dated 2026-08-<day>), e.g.
`2026-08-<day>-SCOPE-DOCUMENT-layer3-per-consumer-rendering-FOR-RULING.md`. It is a **scope
document, not a design of record and not a build** — its job is to give the mentor a complete,
honest picture of the decision space so the ruling can be made once, cleanly.

**PR20 binds the document (load-bearing):** name the affected architectural surfaces per
proposed mechanism — which files/surfaces it would touch, what event effects
(increase/decrease/flag/none) are implied, how it interacts with any evidence gate, what is
served publicly vs ledgered-only vs rendered-only, and what the MEASURE/ENFORCE posture is.
Verify mechanics against the actual code (grep/read first-hand), never from records alone
(`primary-data-beats-secondary-characterisation`).

**The session question (verbatim from the scoping record — surface it, do not answer it):**

> Should the S7 "Layer 3 out of launch scope, internal-only" decision be re-opened on the
> ground that the guide's response is uncalibrated for practitioner type everywhere outside the
> R20a crisis path — and if so, what distinguishes an agent-calibrated rendering from a
> human-calibrated one, given that Layers 1 and 2 are correctly practitioner-blind?

**What the document must carry (from the record's own boundaries):**

- **The widened Stage 2 relational-context scope** (the 2026-08-14 amendment): the fuller
  question — *what does the guide need to know about the practitioner's relational context to
  respond appropriately?* — with its two minimum pieces (the practitioner's ROLE in the
  relationship, not the relationship type; whether impressions about the relationship are
  examined or assumed), **the R20d self-side boundary** (engage self-examination, decline
  diagnosis of the other party — the record notes the Grok research's framing is INVERTED by
  the Stoic frame), and **the four Stage 2 placeholder fields as the design target**
  (`relational_context`, `practitioner_role`, `relationship_type`, `examination_status` —
  named, not built).
- **The must-reuse discriminator:** `website/src/lib/substrate/r20a-audience-renderer.ts:45`
  (auth signal: `auth.user?.id` truthy → `human_user`; falsy → `agent_developer`). Any second
  practitioner-type discriminator must REUSE this one — it is already load-bearing for the
  R20a distress perimeter, and two independent notions of practitioner type that could disagree
  would put a safety decision and a rendering decision on different footings. Verify the
  current line first-hand.
- **The carried reflect-wording residual** (finding 2's residual, in-session by ruling): the
  Q1–Q6 reflect sequence invites self-examination in language presuming an interior access the
  architecture declines to trust — a rendering/wording gap on exactly this layer, the concrete
  instance of what "uncalibrated for practitioner type" costs. Verify the current wording
  surfaces first-hand (`src/lib/sage-reflect/reflect-service.ts`; the G4 cross-check sites).
- **The S7 decision presented honestly:** it was sound on the grounds available to it; this
  session supplies a ground it did not have (the ongoing agent-guide relationship examined as
  its own question). Re-opening it is the MENTOR's call — the document presents, with the
  verified current state of the route/flag (`website/src/app/api/substrate/layer3/route.ts` —
  503, "No production traffic possible"; `SUBSTRATE_LAYER3_ENABLED` unset).
- **The boundary against the kathêkon session, updated:** that session is now RULED and CLOSED
  (Ruling Set A). Both draw on role-carries-kathekonta; neither absorbs the other. The C3
  document should note where Set A's rulings touch shared ground (e.g., role as
  self-report-through-extraction, the named honest limit) without re-opening anything ruled.
- **Classical citations discipline:** the record flags its Cicero locus as "transcribed, not
  text-verified" — if the document quotes or leans on a classical locus, text-verify it
  (`classical-citations-text-verify`) or carry the record's own flag forward honestly.

**Output shape (the ruled precedent):** the question(s) for ruling stated crisply up front
(severable sub-questions marked severable) → the decision space with honest trade-offs →
affected architectural surfaces (PR20) → what the AI recommends ONLY where the scoping record
already licenses a recommendation, otherwise present-don't-recommend (the record pre-answers
nothing) → explicit "not asked / out of scope" list → the sequencing note (execution post-run,
after the ruling; per M2). The document self-starts nothing.

## Step 4 — Close (lean)

- Lean decision-log entry (`governance` tier).
- Tick the arc plan's **C3** checkbox.
- Commit only this session's own outputs (the scope document + decision log + arc plan tick +
  this prompt file if it isn't already committed). Use `git commit -F <file>` if the message
  quotes anything.
- Founder pushes; the founder takes the document to the mentor at their own cadence.

## What NOT to do

- **No execution, no build, no code edit** — M2's ruling is explicit: scope documents only;
  execution folds into post-run sessions after the ruling.
- **`SUBSTRATE_LAYER3_ENABLED` activation is NOT licensed by this session** — recorded at the
  mentor's explicit instruction in the scoping record itself; restate it in the document.
- **Do not execute any of the five C2 ruled-additions items** (all post-run; they live in the
  arc plan's ruled-additions block).
- No fenced-surface changes (the three IDEA-loop flags, watching vocabularies, runner credential
  `527cc86b-…`, the four live route contracts, `idea_loop_*` schema). **The Q1 hard constraint
  holds: the loop proposes; it never executes.** Weights BLOCKED; the P0 0h hold stands.
- No editing `stoic-brain.ts`/`.json` (SHA-pinned regardless of the window ruling).
- Don't pre-answer anything reserved for the mentor (the whole point of the document), the
  founder-convened Prudence Q2 / SagePals Stage-4 questions, or the uniformity-reads-as-stable
  family (open in the hegemonikon record — ruled together or not at all, not this session's).
- Don't touch GS-ATRF-1/2/3, the four QG rulings, the R-phase items, the guard bundle, or
  C4/C5's work.

---

**Forecast.** Success = pre-flight clean (Mode 2), one scope document authored to the ruled
shape with PR20-complete surface naming and first-hand-verified mechanics (including the
discriminator line, the layer3 route's 503 posture, and the reflect-wording surfaces), a lean
close with C3 ticked — and the runner never disturbed.

*End of prompt.*
