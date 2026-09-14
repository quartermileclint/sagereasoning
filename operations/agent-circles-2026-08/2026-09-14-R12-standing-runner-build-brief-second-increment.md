# R12 — The standing-runner build brief, second increment

> **⚖️ RULED 2026-09-14, same day, on the relay this document fed** (verbatim, canonical:
> `2026-09-14-mentor-ruling-R12-three-questions-verbatim.md`; **wins over this document**).
> **Q-R12-A:** §5's fork is settled — **option (c)**, a new narrower CHECK requiring
> `agent_id IS NOT NULL` **only**, for read-class capabilities. Option (a) is **ruled out** on the
> RLS-survey precedent. The two-migration structure and its disclosure as a deliberate exception to
> Q-B2 are **accepted**.
> **Q-R12-B:** §8.4 is settled — **NO.** The window's waiver admission is **confined to authoring**
> and does not extend to a code build on the measured checkout. **The build waits for the window to
> close**, or goes to a worktree outside the instrument's reach.
> **Q-R12-C:** §3.3 block 2 and §10's anchor row are settled — the envelope is **not sufficient for
> machine consumption** (a **Prerequisite Criterion finding**, not a pass). **The anchor serves
> coverage and confidence state ONLY, without per-domain levels.**
> **NOT ruled, and not to be recorded as ruled:** the runner's explicit engagement with the anchor's
> disclosed limitations is **not mandatory** — it is *"the correct direction"*, carried as an **open
> design question for the generation-step scoping session**, never as a resolved parameter (§13).
> **No build is licensed by this ruling.**

**STATUS: Designed and ruled, awaiting the window's close.**

**2026-09-14.** The standing-runner design track's fifth sitting (R8 → R9 → R10 → R11 → **R12**).
Tier `governance` / design. **AC7 not engaged. Nothing is built, activated, flipped, deployed,
migrated, minted or pushed by this document.**

**What this is.** R9 §16.2 and R8 §11.2 each named a "standing-runner build brief" as a proposed
follow-on and neither authored it — each left a list of elements scattered across its own design
body. This brief is that authoring: **one buildable specification consolidating both lists**, with
every schema object, flag, route, capability, data-rights branch and prerequisite stated once, in
build order, with its source section named.

**What this is not.** It is not an authorisation. Every element below remains a founder election,
and the build it specifies is a **`code-critical`, founder-walked, PR19-reviewed step licensed by
nothing here** — the same posture R8 §11 and R9 §16 stated for their own lists.

**The ruled exclusion, carried from the designation.** **R8-D7's open parameters are OUT OF SCOPE** —
**K, the trigger, vocabulary and the persistence target** remain open by ruling (Q-M6, Q-M7,
Q-R11-A1) pending the live-loop measurement now running. §9 gives R8-D7 a named slot and states its
parameters as open; it sets none. **`surface` and incomplete-series handling are NOT on that list —
both were settled by the 2026-09-13 ruling** (Q-R11-A2: gate only; Q-R11-B2: hold). See §9, which
records why the five-item list still circulating in other records is the pre-ruling state.

**Verbatim wins.** Where this brief and a mentor ruling differ, the ruling governs. Where it and a
prior design sitting differ, the sitting governs unless this document says explicitly that it is
correcting a fact at source.

---

## 0. The ruled and elected ground this brief stands on

| Input | Disposition this brief inherits |
|---|---|
| **Q-B2** — one bundled migration window | Every new column and table below lands in **one** founder-walked migration, not five |
| **F3 block item 3** — per-surface flags | Each read surface gates on **its own** flag; activating receipt never activates consumption |
| **C1** — runner-attested, harness-unverified | Every runner-supplied field is disclosure, never a harness claim |
| **C5** — the tag sits *beside* `heuristic` | `generative_environment` does not replace or derive from `heuristic` at read time |
| **D1** (R9 §4.2) | The GS-ATRF-4 vocabulary-direction question stays **held open, owned by no session**; §2.8 records the dependency and builds no vocabulary |
| **D5** (R9 §6) | The proposal-shape environment field is **design-only** here; its column rides this bundle — specified at §2.7 |
| **A9** | `target_circle` attribution for historical cycles **cannot be backfilled**, permanently |
| **Q-C1 / Q1c** | Runner and executing agent are distinct identities; the read is scoped to the runner's own loop |
| **Q-R11-A2** | Sampling reaches **the gate only**; the consult path needs its own measurement and credential shape first |
| **W (elected 2026-09-13)** | Worst-of-K is the ruled floor semantics **if and when** a sampling layer is built; K is not set here |
| **The weights block** | No harness-computed scalar over moves or candidates; no runner-supplied number consulted |
| **Q1** | The loop proposes; it never executes. No element below creates a path from a candidate to an action-taking tool or scheduler |

---

## 1. The design ground — present-tense facts verified at source 2026-09-14 (PR20)

Each fact below was read from the file named, today, not carried from a prior sitting's prose.

1. **`idea_loop_cycles`** exists (`website/supabase-idea-loop-watching-migration.sql:82`) with
   `loop_id TEXT NOT NULL`, `cycle_number`, `cycle_outcome` CHECK over four values,
   `winner_candidate_id` (FK, `ON DELETE SET NULL`), `agent_id TEXT` **nullable**,
   `owner_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE`, `credential_ref TEXT`,
   **`started_at` and `ended_at` both nullable**, and
   `retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')`.
2. **`idea_loop_candidates`** exists (same file, `:152`) with `cycle_id … ON DELETE CASCADE`,
   `heuristic` CHECK over the seven ruled values, `proposed_action`, `classification_kind`,
   `guardrail_proximity` CHECK over the five ranks, `passed_novelty_check`, `cycle_outcome` CHECK
   over seven values, `created_at`. **No `retain_until` of its own** — it rides the cycle cascade.
3. **The ATRF/S4 columns are on `idea_loop_candidates`**, added by
   `supabase-idea-loop-candidates-atrf-blast-radius-and-s4-migration.sql`: `blast_radius`,
   `agent_blast_radius`, **`target_circle SMALLINT`**, `blast_radius_basis JSONB`,
   `traceability_check`, `extraction_evidence JSONB`. That these columns are **declared** by that
   migration is repo-verified. Their **production apply status is recorded-but-not-independently-verified**
   here (PR20's amended convention — a repo session cannot query the database): the record is
   `D-ATRF-EE-WAVE-STEP0-PRODUCTION-STATE-DETERMINED-ALREADY-APPLIED` (2026-08-31), which reports all
   four steps applied. **TEST remains undetermined** — carried, not resolved here, and §7.5 requires
   the bundle's `§PRE` to determine it by query rather than assume it.
4. **`idea_loop_completion_signals`** exists (`supabase-idea-loop-completion-signals-migration.sql:83`)
   with `cycle_id … ON DELETE CASCADE`, `impression_assented_to TEXT NOT NULL`,
   `assent_quality ∈ {examined, habitual}`, `threshold_reached ∈ {katorthoma, kathekon}` nullable,
   `refuse_to_attest BOOLEAN NOT NULL` + `refusal_reason`, the four provenance/credence columns, and
   a CHECK binding `refuse_to_attest` to `threshold_reached`'s nullity. **Deliberately no
   `retain_until`** — the file's own §RETENTION header states PR24 is not engaged because the table
   declares none and rides the cycle cascade.
5. **`POST /api/practice/completion-signal` exports POST and OPTIONS only.** No `GET`. Gated on
   `SUBSTRATE_COMPLETION_SIGNAL_ENABLED` (`handler.ts:126`), **unset ⇒ honest 503**.
   *(R8 §2.1's claim re-verified today, not carried.)*
6. **`idea-loop-watching-store.ts` exports no completion-signal read beyond data rights.** Its
   exports are `insertCycleRecord`, `getCyclesWithCandidates`, `deleteWatchingDataFor{Owner,Credential}`,
   `getWatchingDataForOwner`, `insertCompletionSignal`, `deleteCompletionSignalsFor{Credential,Owner}`,
   `getCompletionSignalsForOwner`, `purgeExpiredWatching`. **R8-D1b's read path does not exist.**
7. **`/api/founder/watching/handler.ts` contains zero occurrences of the string `completion`.**
   **R8-D1a's dashboard fold does not exist.**
8. **Three of this brief's four flag names do not exist anywhere in `website/src`:**
   `SUBSTRATE_COMPLETION_SIGNAL_DASHBOARD_ENABLED`, `SUBSTRATE_COMPLETION_SIGNAL_READ_ENABLED`,
   `SUBSTRATE_RUNNER_CYCLE_OPEN_READ_ENABLED`. Only `SUBSTRATE_COMPLETION_SIGNAL_ENABLED` exists.
9. **`PRACTICE_CAPABILITIES`** (`website/src/lib/practice-credential.ts:53`) is exactly
   `consult, l1_supply, accreditation_write, calling, reflect, watching_write, completion_signal_write`.
   **`WRITE_CLASS_CAPABILITIES`** (`:90`) is the same list minus `consult` and `l1_supply`.
   **No read-scoped capability of any kind exists.** See §5 — this is the brief's largest unresolved
   design question and it was not visible from either prior sitting's prose.
10. **`SUBSTRATE_WATCHING_ENABLED` gates both the write route and the founder GET** — one flag, two
    surfaces (`api/practice/watching/handler.ts:103`, `api/founder/watching/handler.ts:95`). The
    one-flag-two-surfaces fact is repo-verified. That the flag is **set in production** is
    **recorded-but-not-independently-verified** (PR20's amended convention): a repo session cannot
    read a Vercel environment value. The record is `D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10`.
11. **`runner_melete_entries` does not exist** in any migration file.
12. **Data rights today:** `/api/user/delete/route.ts` deletes `idea_loop_cycles` (`:193`) and
    `idea_loop_completion_signals` (`:205`) and names `idea_loop_cycles` in `tables_cleared` (`:344`);
    `/api/user/export/route.ts` exports both (`:268`, `:283`) with an explicit comment (`:276`) that
    the two are kept separate because they carry **different actors'** data.
13. **Timestamp reliability:** the §6 report records **cycles 5, 6 and 13 null on both `started_at`
    and `ended_at`** — 3 of 20, by direct query. This is the "cycle-timestamp robustness fix" R8
    §11.2 carries so it stops being silently dropped.
14. **`GUARD_RE` exposure of this entire bundle is exactly one file** — tested against the live regex
    today: `website/src/lib/substrate/idea-loop-watching-store.ts` matches (on `/substrate/`).
    `api/practice/watching/handler.ts`, `api/founder/watching/handler.ts`,
    `api/practice/completion-signal/handler.ts`, `practice-credential.ts`, both `/api/user/` routes,
    and every `supabase-*.sql` file are **free**. See §8.4.

---

## 2. The migration bundle — one window, Q-B2

All of §2 is **one** founder-walked migration, applied TEST then production, with `§PRE` / `§APPLY`
/ `§VERIFY` / `§INVERSE` sections in the house form. Every object is additive and nullable; nothing
below alters an existing column's type or drops anything.

### 2.1 `idea_loop_candidates.generative_environment` (R9 §4.1)

Nullable `TEXT` with a CHECK on the seven generative rooms
(`workshop | garden | forest | observatory | archive | attic | cellar`). Runner-attested,
harness-unverified. **Required by the handler for every candidate produced after the framework is
live; `NULL` for every pre-framework row.** **Backfill is FORBIDDEN** — a retrospective attribution
under this column's name is exactly what the close-gate naming constraint prohibits; R9 §13's
`assessed_environment_retrospective` is the distinct name such an attribution must use.

### 2.2 `idea_loop_candidates.derivation` (R9 §3.4)

Nullable `JSONB`:
`{ anchor_basis, finger: { kind: 'domain' | 'circle_gap' | 'task_list_friction', ref }, moves?: [...], accepted_move_count? }`.
Each move records `{ type, virtue_check: { phronesis, sophrosyne, dikaiosyne, andreia } as accept|reject, justification }`
and **rejected moves are retained** — the discarded link is part of the derivation's honesty.

**Two constraints the build must not soften.** A candidate from a **domain or circle finger without
a derivation is rejected before examination**. A **`task_list_friction` candidate carries no
`moves`** and is exempt, as R9 §3.3 discloses.

### 2.3 `idea_loop_candidates.accepted_move_count` (R9 §3.4)

> **🗳 FOUNDER ELECTION APPLIED 2026-09-14 — THIS COLUMN IS STRUCK FROM THE BUNDLE.** The founder
> elected the mentor's recommendation: **derive `accepted_move_count` from `derivation.moves[]`; do
> not store it.** Ground: *"two sources of truth for the same value… the shape that produces silent
> inconsistency when one is updated and the other is not. The derivation array is the authoritative
> source; read from it."*
> **Consequences, so a build does not have to re-derive them:** (i) the §2 migration creates **no**
> `accepted_move_count` column; (ii) §11's required source-grep assertions drop this field — the
> others stand; (iii) the non-comparability disclosure below **still holds and must ride the derived
> value**, since granularity remains runner-controlled whether the number is stored or computed.
> **The section is retained, not deleted, as the record of what was specified and why the election
> went the other way.**

Nullable `INTEGER`. **Runner-attested, runner-controlled granularity, and therefore NON-COMPARABLE
across runners** unless the build fixes a move vocabulary and a granularity rule. **Recorded as
disclosure and consulted by nothing** — no selection, no threshold, no indicator reads it. This is
the concrete form of the weights block at the schema layer: the number exists and nothing reads it.

*A build-time note the schema cannot enforce:* `accepted_move_count` is derivable from
`derivation.moves[]`. Storing it separately is a second copy of one fact — the drift class R9 §4.3
exists to avoid. The brief keeps it because R9 §3.4 names it explicitly as a separate integer;
**whether it should instead be derived at read time is a build election, and either choice must be
recorded, not made silently.**

> **⚖️ MENTOR RECOMMENDATION 2026-09-14 (a recommendation, NOT a ruling — the election remains the
> founder's):** **derive from `derivation.moves[]`; do not store.** *"Storing it duplicates a fact
> that is already structurally present in the derivation array. A derived field that duplicates a
> stored fact creates two sources of truth for the same value, which is the shape that produces
> silent inconsistency when one is updated and the other is not. The derivation array is the
> authoritative source; read from it."*
> **This REVERSES this section's specification**, which creates the column. **If the founder adopts
> the recommendation, §2.3's column is struck from the bundle** and `accepted_move_count` becomes a
> read-time derivation over `derivation.moves[]` — which also removes one column from §2's migration
> and one field from §11's required source-grep assertions. **Not applied here:** the brief does not
> make the founder's election, and the recommendation is recorded rather than executed.

### 2.4 `idea_loop_candidates.role_context` (R9 §7a)

Nullable `JSONB`:
`{ actor_role: 'proposer', on_behalf_of: target_agent_id, declared_purpose_ref?, relationship_type: 'agent–agent' | 'human–agent' }`
— **F-b's vocabulary exactly**, so F-b's eventual landing has no second vocabulary to reconcile.

**Three pins, each of which must survive the build as an assertion, not a comment:**
it is **never** read to infer practitioner type (the auth-signal discriminator stays sole); it is
**never** passed to the engine in v1; the founder dashboard **reads** it — which is what makes this
disclosure rather than perpetuation of the deficiency A2 names.

### 2.5 `idea_loop_candidates.election_basis` (R8 §5.2c)

> **🗳 FOUNDER ELECTION APPLIED 2026-09-14 — CANDIDATE ROW, as specified.** The founder elected the
> mentor's recommendation, which confirms this section: *"R8's 'per-cycle' wording describes the
> cadence of the election, not the granularity of the record… A cycle row carrying the election basis
> would require joining back to the candidate to interpret it."* **The placement note below is
> settled; it is no longer electable.**

Nullable `TEXT` CHECK over `uncontested | tie_break_random | out_scored`, plus a nullable
`tie_set_size INTEGER`. Runner-recorded at election time. **Telemetry records how elections
happened; it does not change how they happen.** Changing them is R8-D7 (§9).

*Placement note:* R8 §5.2c calls this per-cycle. It is specified here on the **candidate** row
because the basis is a property of the winner's election, and the cycle row already carries
`winner_candidate_id`. **If the build prefers the cycle row, that is a legitimate election** — the
constraint is that it lives in one place and the dashboard reads it from there.

### 2.6 `idea_loop_cycles.winner_rank_pair` (R8 §4.5, §5.2b)

Nullable `JSONB` `{ previous: rank|null, current: rank }` **stored as the raw pair, never as a
difference**, so no equal-spacing assumption enters the schema — the spacing question is GS-CYB-1's
named open sub-question and stays open. Plus a nullable `verdict_grade_counts JSONB` — the cycle's
per-grade verdict distribution, which R8 §5.2b notes is more informative than any single delta.

**The within-cycle pair (R8-D3's primary) needs no new column:** it is the winner's
`guardrail_proximity` against that cycle's completion-signal `assent_quality` / `threshold_reached`,
both already stored. **Its two inherited bounds must ride every surface that renders it:** the
sentence is fully meaningful only where attester and elector coincide, and its election-time anchor
sits on the timestamp surface §1.13 names unreliable. **A pair with a null anchor is recorded as
such and never interpolated.**

### 2.7 The proposal-shape environment field (R9-D5 / GS-ATRF-2)

The proposal shape carries the generative environment as a **third disclosed classification**,
alongside the two it already carries — because the adopter at Threshold is owed the conditions under
which the candidate became thinkable, and withholding them is the omission Gate-3 Q2 names as *"a
false impression by omission."*

**The value is runner-attested and disclosed as such, and in v1 it is a function of the heuristic —
the proposal shape must say so**, so the disclosure carries its own limit rather than implying a
selection that does not occur.

*An earlier draft of this brief asserted in §0 that this column "rides this bundle" and then
specified no column for it anywhere — an element claimed as covered while being absent. It is
specified here.* Per D5 the **design** is R9's; what lands in this bundle is the column.

### 2.8 What this bundle deliberately does NOT add

- **No epistemic-status field on the candidate row.** D1 holds the vocabulary-direction question
  open and owned by no session. R9 §4.2's recommendation — keep the fields separate with a declared
  dependency, the basis *referencing* the environment tag and derivation rather than copying either
  — is **recorded here as the migration path if the eventual owner rules for unification**, and
  builds nothing.
- **No `retain_until` on any new table.** §6 explains why, and why PR24 does not engage.
- **No backfill of any kind.**
- **R8-D9 — the `assessStructuralNovelty` similarity dimension and its persistence counter — is NOT
  in this bundle, and the reason is a gate, not an oversight.** R8 §11.2 admits it *"only alongside
  R8-D6a"* (the verdict-repeatability instrument), and R8-D6a is its own separate follow-on which
  this brief does not scope. R8's own disclosed cost is why the pairing is mandatory: **R8-D9 removes
  the loop's only natural repeat-examination**, so adopting it without R8-D6a *"would blind the
  system to exactly"* the variance R8-D6a exists to measure. **Stated here so a reader checking this
  brief against R8 §11.2's list can tell the omission is gated rather than accidental** — which an
  earlier draft, by simply not mentioning it, could not.

**Two synthesis decisions this brief made on an internally ambiguous source, flagged rather than
passed off as R9's own wording.** (i) R9 §3.4 calls `accepted_move_count` *"a separate integer"* in
one sentence and writes it **inside** the derivation object literal in the next, and R9 §16.2 says
*"the `derivation` JSONB **with** `accepted_move_count`" — readable either way. §2.2/§2.3 split them
into two columns and §2.3 records the duplication risk and leaves the choice electable. (ii) R9 §3.4
gives `finger.kind` as `'domain' | 'circle_gap'` and describes `task_list_friction` separately as a
distinct exempt case rather than explicitly as a third value of the same enum; §2.2's single
three-value enum is this brief's unification of the two, not R9's literal phrasing.

---

## 3. The read surfaces — two reads, three flags, four blocks

### 3.1 R8-D1a — the founder-dashboard completion-signal fold

`GET /api/founder/watching` and `/founder-watching` gain a per-cycle completion-signal block behind
**`SUBSTRATE_COMPLETION_SIGNAL_DASHBOARD_ENABLED`** (new; §1.8 confirms it does not exist).

Present ⇒ `assent_quality`, `threshold_reached`, `refuse_to_attest` (+ `refusal_reason`), the four
provenance/credence values, received-at, **and `impression_assented_to`** — the founder already owns
this table's data-rights surface. Absent ⇒ an explicit `completion_signal: 'absent'` marker.
**Never a default, never silently omitted: the absence IS a datum**, and the run's own signal rate
was zero.

**The fold carries four views, not one.** R9 §16.2 names three by name and R8-D1a the fourth; an
earlier draft of this brief specified only the completion-signal block plus two fields, dropping two
of the three R9 named:

1. **The completion-signal block** (above) — R8-D1a proper.
2. **`runner_environment_history`** (R9 §4.3) — the ordered
   `(cycle_number, candidate_id, heuristic, generative_environment)` sequence over the runner's
   cycles, **derived at read time**, keyed on the cycle row's loop identity (`loop_id` — `agent_id`
   is nullable on that row, §1.1). **`NULL` environment for every pre-framework row, never
   backfilled.** *Why derived and not a stored field:* a named field is a second copy of
   per-candidate facts, updatable independently and therefore able to drift — the class this
   project's perimeter-count history documents three times.
3. **The melete view** (R9 §8) — `runner_melete_entries` rendered for the founder's eye. **This is
   melete's only consumer** (§4.1), so omitting it from the fold would leave the table with no
   reader at all, which is the one thing that would make it pointless: its only teeth are that it is
   visible.
4. **`role_context` (§2.4) and `election_basis` (§2.5).** The `role_context` read is what makes §2.4
   disclosure rather than perpetuation of the deficiency A2 names.

### 3.2 R8-D1b — the runner's completion-signal read (phase 3)

A credentialed GET serving the runner, at cycle open, its **own loop's** prior-cycle summaries:
`{ cycle_number, signal: present|absent, assent_quality?, threshold_reached?, refuse_to_attest? }`
— **structured fields only, `impression_assented_to` deliberately excluded.** Two recorded reasons:
the update rule consumes only the structured fields, so serving the text would be exposure without
function; and the text is the agent's own composed practice content across a Q-C1 actor boundary.
**The alternative (serve the text too) is workable and revisitable; it is not taken.**

Flag: **`SUBSTRATE_COMPLETION_SIGNAL_READ_ENABLED`** (new). Dark ⇒ honest 503.

### 3.3 R9-D11 — the runner cycle-open read (phase 1′)

Behind **`SUBSTRATE_RUNNER_CYCLE_OPEN_READ_ENABLED`** (new), **independent of §3.2** so generation's
prerequisites can be live before phase 3. R9 corrected an earlier circular dependency here: B4 and
C2 make the anchor and the dwelling parameter prerequisites *of generation itself*, so putting them
behind the phase-3 flag would mean no new-design cycle could run until signals existed that only
such cycles produce.

Blocks, **each absent when its data is absent** (block 1 is §3.2's, served by the other flag):

- **2 `anchor`** — `{ target_agent_id, anchor_basis, trust_record_summary?, purpose_acknowledgement_ref? }`.
  `trust_record_summary` is the **public trust-record payload reused, envelope included**, read
  server-side so the runner needs no second credential. This reuse is why serving a virtue
  assessment of another agent to an agent practitioner passes the Prerequisite Criterion (§10).

  > **⚖️ RULED 2026-09-14 — THIS BLOCK'S PAYLOAD IS REDUCED. The two sentences above are SUPERSEDED**
  > and left only as the record of what this brief argued. The ruling: *"The envelope is not
  > sufficient as currently designed for machine consumption. The anchor requires a structural
  > constraint the brief's design does not yet carry."*
  > **`trust_record_summary` serves COVERAGE AND CONFIDENCE STATE ONLY — NOT per-domain levels.**
  > The honest-claims envelope travels with the reduced payload.
  > **Why per-domain levels specifically:** *"the per-domain levels are where the score most directly
  > resembles a virtue verdict, and they are the fields an agent consuming the payload is most likely
  > to reason from without engaging the disclosure."* The ruling is explicit that this does **not**
  > eliminate the concern — *"the coverage and confidence state still carries information about the
  > target agent"* — but removes the field most likely to function as a virtue score one level
  > removed.
  > **Why this brief's argument failed, carried because it generalises:** *"The envelope travels with
  > the payload. The disclosure is present. But presence is not engagement, and the design cannot
  > establish that the runner engages with the disclosure rather than treating it as metadata."*
  > **NOT ruled:** requiring the runner to record its own engagement with the target before the
  > anchor is served. It is *"the correct direction for the design to develop toward"*, carried as an
  > **open design question for the generation-step scoping session, NOT as a resolved parameter**
  > (§13). A build implementing it as a design element would be over-reading this ruling.
- **3 `dwelling`** — `{ max_dwell_ms, termination }`, operator-configured server-side. **In v1 only
  `time` termination is enforceable and the contract must say so.**
- **4 `runner_history`** — the runner's own examined-action history: per prior candidate of *this
  runner*, `(cycle_number, candidate_id, heuristic, generative_environment, proposed_action,
  guardrail_proximity, passed_novelty_check, cycle_outcome)`. **This is the single backward edge
  made persistent** — it adds no edge; it carries across cycles what an in-run runner already
  carries in memory. It is h6's substrate and what R9 §3.3's examined-at-all exhaustion rule reads.

**The read persists nothing.**

**The two-flag constraint is load-bearing and must be asserted, not commented:** activating the
anchor read can never silently activate signal consumption, or the reverse.

---

## 4. The runner-side components (no server code)

These are the runner's own behaviour, specified because the build brief is what the runner is built
against. **No server change implements any of them.**

- **The v1 update rule (R8-D2)** — a completion signal changes **what the next cycle examines and
  discloses**; it never changes what the generation step generates. `assent_quality: 'habitual'` ⇒
  a re-examination posture for the affected class (same heuristic, same `target_circle` where
  populated), the report presented into the runner's **own election deliberation** and an **open
  examination loop** marked on the cycle record. **It is NOT injected into the generation prompt and
  NOT sent to any examination engine** — `prior_feedback` exists on `/api/reason` and not on
  `/api/guardrail`, and the runner's per-candidate surface is the gate, so the CI-4 contract cannot
  receive this. CI-4 is the precedent for the *shape* of an open-loop marker, not a contract reused.
- **⚠ THE CLOSURE PREDICATE (R8-D2) — carried here because an earlier draft of this brief dropped
  it, which is the exact defect R8 named and fixed.** R8's own words: an undefined closure *"either
  never closes, accumulating obligations monotonically, or closes trivially at build time."*
  **An open loop on a class closes when EITHER (a) a subsequent cycle elects a candidate of that
  class whose completion signal reports `assent_quality: 'examined'`, OR (b) the founder explicitly
  dispositions it on the dashboard. Nothing else closes it.** An unclosed loop's **age is itself
  surfaced**, so a monotonically growing stock of open loops is visible as a finding rather than
  accumulating silently. **A build working from a brief without this would rediscover the defect.**
  **Its disclosed limit, carried with it:** the *agent's* reported assent quality is mapped onto the
  *runner's* candidate class — two actors' practices. The mapping is the only one available, and it
  is a proxy, disclosed as one.
- **The other three signal branches (R8-D2 items 2–4)** — `refuse_to_attest: true` ⇒ the cycle is
  marked **practice-incomplete** and is **not counted anywhere as a completed practice instance**;
  no penalty, no weight, no domain exclusion, because a refusal is the honest branch working.
  `threshold_reached: 'kathekon'` ⇒ recorded as completed-but-not-katorthoma. `examined` +
  `katorthoma` ⇒ recorded, and **nothing is boosted** — a good report changes no behaviour,
  deliberately. **The rule is asymmetric by design and the build must not symmetrise it.**
- **Missing-signal handling (R8-D4)** — a prior cycle without a signal is recorded
  `completion_signal: absent`, provenance/credence `unknown`. **The absent case updates nothing.**
  The **signal rate** is a first-class longitudinal observable; the bounded run's was zero.
- **The melete surface (R9-D7)** — after examine, before record. **Three fixed prompts, never
  abbreviated** (the Reflect precedent): which moves were accepted and by examination or habit;
  whether recent consistency is a settled disposition or a settled pattern no longer examined, with
  the evidence from the runner's own record; what was declined for examination and why.
  **Refuse-to-attest mirrors Q-C3** — an honest "I did not examine my own attention this cycle" is a
  legitimate entry and a datum, and **its only teeth are that it is visible.**
- **Dwelling** — runner-side, with its blindness to verdicts **attested, not pinned** (R9 §2.2 says
  so explicitly and the brief does not upgrade the claim).
- **The examined-at-all exhaustion rule (R9 §3.3)** — fingers are exhausted by having been examined
  at all, **never by verdict value**.
- **The cycle-timestamp robustness fix (§1.13)** — the runner must write `started_at` and `ended_at`
  on every cycle, including the abnormal outcomes (`dependency_unavailable`, `terminated_by_timeout`)
  where the bounded run's nulls clustered. **Load-bearing for R8 §6.3b(3) and §4.5**, which is why
  R8 §11.2 named it explicitly rather than leaving it in the §6 report.

### 4.1 `runner_melete_entries` (R9 §8) — the one new table

```
cycle_id UUID NOT NULL REFERENCES idea_loop_cycles(id) ON DELETE CASCADE
owner_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
cycle_number INTEGER NOT NULL
examination_object TEXT NOT NULL CHECK (examination_object = 'ruling_faculty')
responses TEXT[] NOT NULL            -- exactly three, the three fixed prompts in order
refuse_to_attest BOOLEAN NOT NULL
refusal_reason TEXT
provenance TEXT NOT NULL CHECK (provenance = 'inference')
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

`examination_object` is the structural distinction A3 asks for — it is what makes this record type
distinguishable from every object-level record in the loop.

**Consumer: MEASURE only — the founder dashboard fold. Never a trust event, never an input to the
update rule, never a gate, never read by the Q-C2b signature.**

**The environment-diversity "drift signature" flag is WITHDRAWN for v1** on R9's two grounds: it is
vacuous (environment is a function of heuristic; uniform exposure occurs only in the ruled fallback,
so the flag would fire exactly and only on correct behaviour), and its vocabulary is a
from-the-outside disposition reading A3 says the harness cannot make. **If a state-dependent chooser
ever makes exposure vary, a flag may return as the distribution fact only** — `uniform_environment_exposure`
— never as a character reading.

---

## 5. Capability and auth — the brief's largest unresolved question

**R8-D1b's design constraint is that read authorisation is its own named scope** — explicitly *not*
`watching_write`, which a first draft proposed and PR19 review flagged as granting read scope
through a write capability, inverting the mint-level separation posture.

**§1.9 establishes at source that no read-scoped capability exists.** So the build must add one, and
adding one runs into a structural interaction neither R8 nor R9 records:

1. **`WRITE_CLASS_CAPABILITIES` drives the 6e §A DB CHECK** — and the CHECK's predicate is
   `OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)`
   (`supabase-api-keys-watching-write-capability-migration.sql:171`). It requires **both**.
2. A new read capability (working name **`runner_read`**) would **not** be write-class — so the
   CHECK would not oblige it to carry an `agent_id`.
3. But §3.2 and §3.3 scope the read **to the runner's own loop identity**, which the server can only
   derive from the credential's **`agent_id`**. **Owner binding is not what the scoping needs.**

**So a read capability that is not write-class can be minted without the very binding its scoping
depends on.** There are **three** shapes, not two:

- **(a)** Add `runner_read` to `PRACTICE_CAPABILITIES` only, and enforce the agent binding in the
  route handler — a route-level check, which is the class of enforcement the RLS survey
  (`operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md`) exists because
  this project has been bitten by.
- **(b)** Add `runner_read` to **both** arrays, so the 6e §A CHECK applies. **But this over-binds,
  and the over-binding is not theoretical:** the CHECK demands `owner_user_id` too, while this
  project's own standing runner credentials are **owner-less by design** (`sagereasoning:idea-loop@v1`
  and `sagereasoning:s9-loop@v1` are both recorded as agent-bound, owner-less ⇒ `external_consumer`).
  **Under (b), minting `runner_read` on the established runner-credential shape would be rejected by
  the CHECK** — forcing every runner credential that needs the read to become operator-owned, a
  change to the credential's identity shape that the read's scoping never asked for.
- **(c)** A **new, narrower CHECK** — an agent-bound-class set requiring `agent_id IS NOT NULL`
  **only** — applied to read-class capabilities. This gives database-level enforcement of exactly the
  binding the scoping depends on, with no owner-binding side effect and no misleading array name.

**Recommendation: (c).** It is the only one of the three that enforces the binding the design
actually requires, at the database, without changing what a runner credential is. **(b) is withdrawn
as this brief's recommendation** — an earlier draft recommended it on the belief that 6e §A enforced
identity binding generally; the CHECK's own predicate shows it enforces owner-**and**-agent, which is
strictly more than the read needs and incompatible with the live runner-credential shape.

> **⚖️ RULED 2026-09-14 — (c) is ruled.** *"A new, narrower CHECK requiring `agent_id IS NOT NULL`
> only, applied to read-class capabilities."* The recommendation and its reasoning are confirmed.
> **(a) is ruled OUT**, on this project's own precedent: *"The RLS survey exists because
> route-handler-only enforcement has been bitten before. A capability whose only enforcement is in a
> route handler is a capability whose enforcement can be bypassed by a route change. The database is
> the right place for this constraint."* On the cost of a second constraint: *"That cost is correct
> to pay."* **The two-migration structure is confirmed as the right discipline** and this brief's
> disclosure of it as a deliberate Q-B2 exception is **accepted** — *"Bundling a mint-side constraint
> change with a loop-schema change would couple two unrelated rollbacks."*
> **The ruling licenses no build.** The CHECK, the capability addition and both migrations remain
> `code-critical`, founder-walked steps — and per Q-R12-B they wait for the window to close.

**A migration consequence, disclosed rather than buried.** Whichever way this resolves, adding any
value to `PRACTICE_CAPABILITIES` **does not extend the DB CHECKs by itself** — the DB arrays are
hard-coded, and `practice-credential.ts`'s own PR20-verified comment says so: a companion migration's
**§V (the closed `api_keys_capabilities_subset_check` vocabulary)** and, where applicable, **§W (the
owner+agent overlap)** must be applied founder-walked alongside. Both precedent additions
(`watching_write`, `completion_signal_write`) shipped exactly such a file. **So resolving Q-R12-A
necessarily produces a SECOND migration, outside §2's bundle. This is a deliberate, disclosed
exception to Q-B2's one-window discipline, not an oversight** — the capability migration touches
`api_keys`, a different table on a different release path from the loop tables, and bundling a
mint-side constraint change with a loop-schema change would couple two unrelated rollbacks.

**This is put to the mentor as Q-R12-A** (§13).

---

## 6. Data rights, retention, and PR24

- **`runner_melete_entries` declares no `retain_until`, so PR24 does not engage** — PR24 binds on a
  table *declaring* `retain_until` with nothing enforcing it, and a second, independently-drifting
  retention clock on a cascade-covered child is the defect that file's own §RETENTION header was
  written to avoid (§1.4). **Retention** therefore rides the cycle cascade.
- **⚠ DELETE MUST NOT RIDE THE CASCADE. It needs its own explicit, query-verified functions** —
  `deleteMeleteEntriesForOwner` and `deleteMeleteEntriesForCredential` — called from
  `/api/user/delete/route.ts` and `consumer-erasure.ts`, mirroring the sibling exactly. **An earlier
  draft of this brief said melete could ride the cascade "exactly as `idea_loop_completion_signals`
  does". That misdescribes the precedent, and the precedent's own comment says why:**
  > *"the profiles FK already cascades and the cycle FK covers the ordinary case, but this path is
  > explicit for the same reason the watching delete above is: erasure is verified by query, never
  > inferred from a cascade."* (`/api/user/delete/route.ts:196-199`)

  **Why this matters more than it looks:** combined with the `tables_cleared` requirement below, a
  build following the cascade reading would ship a compliance claim of "cleared" for a table whose
  deletion the code never verifies — the exact inverse of the omission defect the next bullet warns
  against, and on a table class this project has twice treated as needing query verification.
- **It needs its own export branch** in `/api/user/export/route.ts` — the cascade covers delete, not
  export. R9 §8 names this and it is easy to lose, because delete appears to work.
- **The export branch must cover the owner-less credential shape, keyed by `credential_ref`.**
  `consumer-erasure.ts` is **erase-only — it has no export counterpart** (its exports are
  `isConsumerErasureEnabled`, `classifyErasureTarget`, `lookupCredentialByToken{Hash,Id}`,
  `eraseExternalConsumerCredential`). The standing runner credentials are owner-less, so an
  owner-keyed export branch alone would export nothing for them. `/api/user/export/route.ts` already
  carries the pattern this needs — an operator's owner-NULL credentials exported *"keyed by
  `credential_ref`, exactly"* (`:300-302`) — and the melete branch must follow **that** sibling, not
  the owner-keyed one.
- **The new columns in §2 need no new data-rights wiring** — they are columns on tables both routes
  already handle (§1.12).
- **`tables_cleared` in `/api/user/delete` must gain `runner_melete_entries`.** The list at `:344`
  is the compliance record; a table deleted by cascade but absent from the list is a true deletion
  with a false record of it — the class the Stoa erasure work already corrected once.
- **The export must preserve the separation `/api/user/export/route.ts:276` already documents** —
  cycles and completion signals carry *different actors'* data, and melete entries are the
  **runner's**, not the executing agent's.

---

## 7. Prerequisites — named here so they are not discovered at build

R9 §16.2 named two. This brief carries both, and adds three found at source today.

1. **A server-side derivation of the target's current circle does not exist** (R9 §3.3). The circle
   finger is the **runner's own declaration**; `gap_ref` is runner-supplied and the harness holds no
   per-circle state. Any build element reading a server-derived circle is building on nothing.
2. **A harness identity with an examined record for the v1 executing actor must exist** for R9 §3's
   anchor to do any work (R9 §3.1). This is the founder's act (R9 §16.10) and is **not** satisfied
   by the runner's own identity — Q1c makes them distinct by construction.
3. **The read-scoped capability does not exist** (§5) and its shape is an open question.
4. **`target_circle` is populated only going forward.** Circle-attributed observation starts when
   the column starts being populated, and **A9 makes the historical gap permanent** — the design
   accepts that boundary rather than planning around it.
5. **TEST's apply status for the ATRF/S4 columns is undetermined** (§1.3). The bundle's `§PRE` must
   determine it by query rather than assume it — the 2026-08-12 Stoa staleness class, and the
   W2 schema walk's own programmatic re-derivation, are the precedent.
6. **⚠ THE CYCLE-IDENTITY HANDOFF — R8 §4.0's producer question, item 2 — is unanswered, and §3.2's
   whole read path depends on it.** R8 §4.0 is titled *"THE PRODUCER QUESTION — this design's own
   largest open item"*, and its item 2 asks: **how does an executing agent learn `loop_id` +
   `cycle_number`?** The built schema requires both on a completion-signal write. **Without an
   answer, nobody but the runner itself can ever post a completion signal** — so phase 3's
   consumption read would consume a stream that only the runner can produce, which is not what the
   signal is for. **An earlier draft of this brief omitted this from §7 entirely**, while framing §7
   as exhaustive-by-design. R8 §11.2 folds it into the build brief by name and makes it *"buildable
   only after follow-on 1 answers who that is"* — follow-on 1 being the producer-question mentor
   brief, which R8 named as **the recommended first follow-on, ahead of any build.**

---

## 8. Sequencing

### 8.1 The phase ladder, with R9's phase 1′ folded in

> **⚖️ RULED 2026-09-14 — NO PHASE IN THIS TABLE OPENS UNTIL THE OBSERVATION WINDOW CLOSES**, on the
> measured checkout. Q-R12-B confines the window's waiver admission to authoring; a code build alters
> the measured system's behaviour and is not admitted. **The table below states the phases' internal
> ordering, which is unchanged; it does not state when the first of them may begin.** Read it with
> §8.4. The worktree route remains available and remains non-equivalent for the instrument.
>
> **⚖️ THE CLOSE CONDITION IS NAMED — follow-on ruling, same day.** *"The window closes when the
> S11-D2 baseline is complete — five ordinary post-remedy consult days counted from W2's first
> record."* The clock starts at **W2's first sitting's first consult record**; five ordinary days
> from that record sets the baseline; **the baseline's completion is the close condition.**
> **It is bounded, not indefinite** — *"it is bounded by a clock that starts when the founder opens
> W2's first sitting."*
> **A correction this brief needed:** the F-3′ obligations are **the reporting obligations that
> FOLLOW the close, not the close condition itself** — this session had read them as the condition.
> **⚠ ONE PREMISE IS FLAGGED FOR THE FOUNDER, NOT RESOLVED HERE:** the ruling reasons from *"W2 has
> not opened"*. Whether the founder's opening of the sitting that authored this brief **was** W2's
> first sitting is the founder's determination — the recorded criterion is *"the act of opening being
> what makes it the first"*. It matters: if it was, the clock started `2026-09-14T08:44:36.147Z` and
> the baseline completes about **2026-09-19**. See the follow-on verbatim's executing-session notes.

| Phase | Content | Gate |
|---|---|---|
| **0 (current)** | Write endpoint deployed, dark. Migration apply status: production confirmed, TEST undetermined | — |
| **1 — receipt** | Resolve TEST apply status, then activate `SUBSTRATE_COMPLETION_SIGNAL_ENABLED` (migration-before-flag) | founder-walked `code-critical` |
| **1′ — generation prerequisites** | The §2 migration bundle + §3.3's read behind its own flag | founder-walked; **independent of phase 3** |
| **2 — observability** | §3.1's dashboard fold, own flag | buildable immediately after phase 1; valuable from the first signal |
| **3 — consumption** | §3.2's read + §4's update rule | **follows the first N genuine signals having been received and read on the dashboard. N = 3, founder-elected 2026-09-14** — *"it requires a pattern, not a single occurrence, and it is small enough to reach in a reasonable window."* **AND, per R8 §4.0, the producer question answered** — an activation gate on an event with no designed cause would be self-sealing |
| **not a phase** | The weight-touching update rule. **No activation slot on this path at all** | designable only if GS-CYB-1's two conditions are both independently ruled |

### 8.2 Why 1′ is not inside 3

Stated once more because it is the correction R9 made to R8's own ladder and is easy to re-collapse:
the anchor and dwelling blocks are prerequisites *of generation*. Behind the phase-3 flag, no
new-design cycle could run until signals existed that only new-design cycles produce.

### 8.3 What must be true before the migration window opens

§7's five prerequisites; the `§PRE` determination of TEST state; and a decision on §5's capability
shape, because the capability value is part of the same mint-side surface.

### 8.4 The window constraint — stated because it changes *when*, not *what*

**Exactly one file in this entire bundle matches `GUARD_RE`:**
`website/src/lib/substrate/idea-loop-watching-store.ts` (on `/substrate/`) — tested against the live
regex today, along with every other file the bundle touches (§1.14). Every route handler, the
credential module, both data-rights routes and every `.sql` file are **free**.

While the false-hold observation window runs and the guard is armed, that one file cannot sit
modified in the working tree without a recorded per-commit founder waiver. **Two consequences worth
stating plainly:**

- The **read paths** (§3.1, §3.2, §3.3) all need store functions, and the store is the guarded file.
  So the read work is the part that collides; the migration, the capability and the data-rights
  wiring do not.
- **Whether the window's discipline tolerates guarded-file waivers as the window's own work is not
  ruled** — the same open question the W2 work-designation assessment named, and the reason W2's own
  build took a worktree route the ruling says produced nothing. **This brief does not resolve it and
  must not be read as licensing either answer.**

> **⚖️ RULED 2026-09-14 — NO. THIS SECTION IS SETTLED, AND IT SETTLES THE BRIEF'S OWN STATUS.**
> *"The window's admission of guarded-file waivers is confined to the authoring work the designation
> names. It does not extend to a code build on the measured checkout."*
> **The operative distinction:** a waiver for authoring is granted because authoring *"does not alter
> the measured system's behaviour"*; **a code build does.** Admitting one *"is not a waiver of the
> guard's form — it is a waiver of the guard's purpose."*
> **The practical implication, in the ruling's own words:** *"the build brief is complete and ruled.
> The build waits for the window to close. The window's remaining cycles proceed on the measured
> checkout, unmodified."*
> **The worktree remains available and remains non-equivalent** — the ruling confirms it *"places the
> work outside the instrument's reach, as the W2 build did. That is the cost of the window's
> discipline. The measurement's integrity is not negotiable mid-window."*
> **This reaches the WHOLE bundle, not only the one guarded file.** §2's migrations and §5's
> capability work are not `GUARD_RE`-matched, but they are a code build on the measured checkout, and
> the ruling's ground is behaviour-alteration rather than regex membership. **Nothing in §8.1's
> ladder opens until the window closes.**

---

## 9. R8-D7's slot — named, unparameterised, and excluded by designation

R8-D7 is a component of this bundle. **It is specified here only to the depth the rulings settle,
and its parameters are out of scope by the founder's designation.**

**Settled:** worst-of-K is the floor semantics (W, elected 2026-09-13). Scope is **would-be winners
only** with no rejection fixpoint (Q-M5) — under W a rejection can never recover, so R8 §5.3's
symmetric fixpoint becomes a descending chain. Dethronement is **floor-only** (Q-R11-B1): a
floor-free sampled winner is never dethroned by an unsampled survivor's higher single draw.
An **incomplete series holds** — no verdict on fewer than K draws (Q-R11-B2). Scope is **the gate
only** (Q-R11-A2). **K=1 with the published disclosure is the live state and is W** (Q-M6).

**Open, and not set here — FOUR items, not five:** K; any trigger; vocabulary; persistence target.
Q-R11-A1 rules a first-draw-signal trigger admissible **only on a measured relation to the latent
floor**, shown by the live-loop measurement's cross-tabulation once it exists — **none is admissible
before then, in either direction.**

**⚠ `surface` is NOT on that list, and an earlier draft of this brief wrongly put it there** — while
the same paragraph also listed it as settled, so the draft contradicted itself. The R11 design's own
RULED header is explicit: *"§5's surface parameter confirmed **gate only**… **K, the trigger
condition, vocabulary and the persistence target remain OPEN**."* The five-item list is the
**pre-ruling** state, carried forward from the R11 close and the decision-log entry that recorded it
before Q-R11-A2 and Q-R11-B2 landed. Two items left that list on the ruling: `surface` (settled gate
only) and incomplete-series handling (settled: hold). **Recorded rather than silently corrected,
because the pre-ruling list is still quoted in at least two other records and will be read forward
by whoever opens R8-D7 next.**

**What the bundle must therefore reserve:** nothing. A worst-of-K policy with K=1 needs no column.
**If K>1 is ever served, three things become due at once** — the R18 disclosure (the published
sentence *"treat one call as one draw"* becomes false), a persistence target, and the per-draw floor
attributions. **The bundle should not pre-create a column for a K that is not set**, because a
nullable column for an unset parameter is an invitation to populate it before the parameter is
ruled. Stated as a deliberate omission so a later build does not read the absence as an oversight.

---

## 10. The Prerequisite Criterion — applied where engaged

| Element | Engaged? | Disposition |
|---|---|---|
| §3.3 block 2, serving a trust-record summary of another agent to an agent practitioner | **Yes** | **Passes on the output question, and the harder question is named rather than assumed away.** It produces no new wisdom-resembling output: it is the same public surface, unchanged, envelope intact, read server-side. **But unlike every other row in this table, this one is CONSUMED, not merely disclosed** — it is the anchor, and it feeds `anchor_basis`. So the sharper question the Criterion's purpose raises is whether feeding one agent's already-computed virtue assessment into another agent's generation *as ground truth* substitutes for the runner's own examined engagement with the target — a score one level removed. **This brief's answer: the envelope is what keeps it honest, because the envelope states what the record does not attest, and it travels with the payload.** That is a claim about the envelope's adequacy, not a proof, and it is **put to the mentor as Q-R12-C** rather than settled here |
| §4.1 melete | **Yes** | **Passes** — examined assent about the examiner's own operations; it produces nothing resembling wisdom. The withdrawn drift flag would have been a diagnosis-shaped output and stays withdrawn |
| §2.4 `role_context` | **Yes** | **Passes** — recorded and disclosed, consumed by nothing; it discloses a deficiency rather than simulating its remedy |
| §3.1 dashboard fold | **Yes** | **Passes** — it prompts founder attention and diagnoses nothing. The absence marker is the load-bearing honesty |
| §2.1–2.3, §2.6 generation mechanics and rank pairs | **Checked, not fired** | Runner-internal records; their candidates are examined by the unchanged engine. The rank **pair** rather than a difference is what keeps this true |
| §2.5 election telemetry | **Checked, not fired** | Records how elections happened; changes nothing |

> **⚖️ RULED 2026-09-14 — THE ANCHOR ROW DOES NOT PASS AS DESIGNED. It is a PREREQUISITE CRITERION
> FINDING, and the row above is superseded.** *"The envelope is not sufficient as currently designed
> for machine consumption."*
> **The ruling accepts this brief's own diagnosis of why the standard disposition failed to settle
> it:** *"every other row in the design passes on the second ground — the field is recorded and read
> by nothing. This row cannot claim that. It is the one place where an assessment of an agent is
> consumed by a reasoning process. The standard disposition does not settle it because the standard
> disposition was written for displayed records, not consumed ones."*
> **What makes the row pass is a design change, not an argument: the anchor serves coverage and
> confidence state ONLY, without per-domain levels** (§3.3 block 2). Even then the concern is reduced,
> not eliminated — *"the coverage and confidence state still carries information about the target
> agent."*
> **A general lesson this row now carries for every future Prerequisite-Criterion application in this
> project:** a disposition written for a **displayed** record does not transfer to a **consumed** one,
> because *"presence is not engagement"* — and where the consumer is a machine, the design cannot
> establish engagement by shipping the disclosure alongside the data.

---

## 11. Standing-constraint compliance

- **The loop proposes; it never executes.** No element creates a path from any candidate,
  derivation, environment, melete entry or signal to an action-taking tool or scheduler. The
  proposal's handoff is to external execution by an adopter.
- **Weights BLOCKED.** No weighting function is designed, sketched or evaluated. **The harness
  computes no scalar over moves or candidates and consults no runner-supplied number** — §2.3 makes
  this concrete: `accepted_move_count` is stored and read by nothing. Finger exhaustion is
  examined-at-all, never by verdict value. Dwelling's blindness is **attested, not pinned**, and the
  brief says so rather than upgrading it.
  **A build requirement this brief adds rather than assumes:** every "recorded and consulted by
  nothing" claim above (§2.3 `accepted_move_count`, §2.5 `election_basis`, §2.6 `winner_rank_pair`,
  §2.4 `role_context`) is **today only a sentence in a design document**. This project's own
  precedent for a structural claim that must not silently erode is an **executing assertion, not a
  comment** — the `GUARD_RE` byte-identity guard, and the perimeter count that went stale three times
  under an emphatic instruction not to hand-maintain it until an assertion replaced the instruction.
  **The build must therefore ship a source-grep assertion per field, proving no read site exists
  outside the disclosure surfaces, mutation-verified.** Without it, the weights block on this bundle
  rests on the same kind of written instruction this project has watched fail.
- **The engine stays deterministic, doctrine-grounded and byte-unchanged.** Nothing in §2–§6 touches
  `/api/reason` or `/api/guardrail`. The A2 engine change (R9 §7b) is **not in this brief** — it is a
  separate `code-critical` session gated on item D's end condition.
- **Distinct identities (Q1c).** The runner's history is the runner's; `target_agent_id` is required
  and distinct; melete entries are the runner's, not the executing agent's. **The one place this
  brief routes information about a DIFFERENT agent identity to the runner is §3.3 block 2's
  `trust_record_summary`, and it is named here rather than left to the reader** — it is the target's
  own **public** record, served with its honest-claims envelope, and it is not memory: nothing about
  the target accumulates in the runner's state, and the read persists nothing. That is the ground on
  which it sits with Q1c's no-cross-agent-memory reading, stated so the claim can be contested.
  Its Prerequisite-Criterion disposition is §10's, and its open question is Q-R12-C.
- **No new retrieval surface that bypasses examination.** §3.3 reads records, not corpus.
- **Per-surface flags.** Three new flags, one per read surface, never shared with the write path.
- **The `relationship_type` distinctness constraint.** §2.4's field is self-declared, never
  auth-inferred, never read to infer practitioner type.
- **No backfill anywhere.**

---

## 12. What this brief does NOT authorise

It authorises no build, no migration, no flag, no mint, no capability addition, no deploy. It does
not open the phase ladder. It does not set K or any R8-D7 parameter. It does not resolve §5's
capability shape, §8.4's window question, or D1's vocabulary-direction question. It does not touch
`option-s/`, `manifest.md`, any R18 surface, any `GUARD_RE` file, `~/.sage-gate1/`, or
`agent_hold_observations`.

---

## 13. Questions raised — ALL THREE RULED 2026-09-14

> **⚖️ Q-R12-A, Q-R12-B and Q-R12-C are all RULED** (verbatim:
> `2026-09-14-mentor-ruling-R12-three-questions-verbatim.md`). **A:** option (c) — a narrower CHECK
> on `agent_id` only; (a) ruled out; the two-migration structure accepted. **B:** **no** — the waiver
> admission is confined to authoring; the build waits for the window to close. **C:** the envelope is
> **not sufficient** for machine consumption; the anchor serves coverage and confidence state only.
> The three questions are retained below as authored, because a ruling is read against the question
> it answered.
>
> **ONE GENUINELY NEW OPEN ITEM, created by the ruling and belonging to a DIFFERENT session:**
> **whether the runner's generation step must include an explicit examination of the anchor's
> disclosed limitations before reasoning from it.** The ruling: *"not ruled as mandatory at this
> stage, but it is the correct direction for the design to develop toward… If the runner's generation
> step is designed to include an explicit examination of the anchor's disclosed limitations before
> reasoning from it, that examination is the prerequisite the envelope cannot supply by itself."*
> **It is carried to the generation-step scoping session as an open design question, NOT as a
> resolved parameter** — the ruling says so in terms, and a build that treated it as settled in
> either direction would be over-reading it. **This brief does not own it and does not assign it.**

### The questions as put

- **Q-R12-A (mentor)** — §5. How should the loop-scoped read capability be bound? **(a)** route-level
  enforcement only; **(b)** add it to `WRITE_CLASS_CAPABILITIES` so the existing 6e §A CHECK applies,
  accepting that the CHECK demands `owner_user_id` too and would therefore **reject a mint on the
  established owner-less runner-credential shape**; or **(c)** a new, narrower CHECK requiring
  `agent_id IS NOT NULL` only. **Recommendation: (c).**
  **PR20 — the specific mechanisms this ruling would land on, as one-sentence facts about current
  behaviour:** `WRITE_CLASS_CAPABILITIES` (`practice-credential.ts:90`) drives a mint-time DB CHECK
  whose predicate is `OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL)` — **both**, not
  either; a capability outside that array can be minted with `agent_id` null, and the loop-scoping in
  §3.2/§3.3 has no other source for the loop identity; this project's standing runner credentials are
  **agent-bound and owner-less** by design, so (b) would change what a runner credential is; and
  adding any value to `PRACTICE_CAPABILITIES` extends **no** DB CHECK by itself — the DB arrays are
  hard-coded, so a companion `§V` vocabulary migration is due in every case, separately from §2's
  bundle.
- **Q-R12-B (mentor or founder)** — §8.4. Does the W2 window's discipline tolerate a guarded-file
  waiver as the window's own work? This brief's read paths are the concrete instance: one file,
  `idea-loop-watching-store.ts`, and nothing else in the bundle.
- **Q-R12-C (mentor)** — §10, §11. §3.3 block 2 serves the target agent's public trust-record summary
  to the runner as the generation anchor. It is the one place this brief routes information about a
  different agent identity to the runner, and the one Prerequisite-Criterion row where the data is
  **consumed** rather than merely disclosed. Is the honest-claims envelope travelling with the
  payload sufficient to keep this from becoming a score one level removed — substituting another
  agent's computed assessment for the runner's own examined engagement with the target?
  **PR20 — the mechanism:** the summary is the unmodified public `GET /api/trust-record/{agent_id}`
  payload including `TRUST_RECORD_ENVELOPE`, read server-side; the read persists nothing and nothing
  about the target accumulates in the runner's state.
- **Founder election** — §2.3: store `accepted_move_count` or derive it from `derivation.moves[]`.
  **Mentor recommendation 2026-09-14 (not a ruling): DERIVE, do not store** — two sources of truth
  for one value is *"the shape that produces silent inconsistency."* This reverses §2.3's
  specification; see the annotation there. **Still the founder's election.**
- **Founder election** — §2.5: `election_basis` on the candidate row or the cycle row.
  **Mentor recommendation 2026-09-14 (not a ruling): CANDIDATE ROW** — *"R8's 'per-cycle' wording
  describes the cadence of the election, not the granularity of the record… A cycle row carrying the
  election basis would require joining back to the candidate to interpret it."* **Confirms §2.5's
  specification and its stated reasoning.**
- **Founder election** — §8.1: the value of N for phase 3, constrained only to be non-zero.
  **Mentor 2026-09-14: *"genuinely the founder's election and the ruling does not constrain it
  beyond the stated non-zero requirement."*** Recommendation: **3** — *"low enough that the first
  completion signals are informative before the threshold is reached, and high enough that the
  threshold is not met by a single anomalous signal… it requires a pattern, not a single
  occurrence."*
- **Held open, owned by no session (D1)** — the GS-ATRF-4 vocabulary direction. §2.8 records the
  dependency and assigns nothing.

---

## 14. PR19 independent review — RUN 2026-09-14, findings folded

**Three blind reviewers**, launched together, each given **only the deliverable and the source
paths** and no visibility into the author's own assessment or into each other's. Read-only; Sonnet
per the founder's standing permission (the session's own model unchanged). Dimensions: **A**
source-fact correctness, **B** fidelity to the sittings and the binding rulings, **C**
standing-constraint compliance and safety. **Every finding was verified first-hand against source
before folding; none was accepted on the reviewer's word.**

**A — CLEAN, zero findings.** It re-derived every line-number citation in §1 and **mechanically
re-applied the live `GUARD_RE`** rather than eyeballing it, confirming the one-file result. One
parenthetical it raised *was* a real gap and was folded: two present-tense production claims (the
flag's live state; the migration's production apply status) are now marked
**recorded-but-not-independently-verified** per PR20's amendment, with their records named.

**B — six findings, all confirmed at source, all folded.** Two were material:
- **The `surface` contradiction (HIGH).** §9 listed `surface` as settled *and* open in the same
  paragraph. Verified against the R11 design's RULED header: `surface` is confirmed **gate only**
  and the OPEN list is **four** items. The five-item list was the pre-ruling state. Fixed in §9 and
  in this document's own header, with the provenance recorded because the stale list circulates.
- **The closure predicate (MEDIUM-HIGH).** §4 restated R8-D2's re-examination posture without the
  predicate that closes an open loop — **the exact defect R8 named and fixed** (*"an undefined
  closure either never closes… or closes trivially"*). Folded verbatim with its disclosed proxy
  limit, plus the three other signal branches, which were also missing.
- Also folded: the **proposal-shape environment field** (claimed in §0 as riding the bundle, then
  specified nowhere — now §2.7); **two of the three named dashboard views** (`runner_environment_history`
  and melete — the melete omission would have left the table with no reader at all); the
  **cycle-identity handoff / producer question** (§7.6 — without it nobody but the runner can post a
  completion signal, so phase 3 would consume a stream only the runner produces); and **R8-D9's
  gated exclusion**, now stated as a gate rather than an absence. Two synthesis decisions on
  genuinely ambiguous R9 text are flagged as syntheses in §2.8.

**C — six findings, four checkable at source, all confirmed, all folded.** Two changed the design:
- **The delete path (MEDIUM-HIGH).** The brief said melete could ride the cycle cascade *"exactly as
  `idea_loop_completion_signals` does"*. It cannot: the sibling has an **explicit** delete call whose
  comment states the discipline — *"erasure is verified by query, never inferred from a cascade"*.
  Combined with §6's `tables_cleared` requirement, the cascade reading would have shipped a
  compliance claim for a deletion the code never verifies. §6 now specifies explicit functions.
- **§5's recommendation is WITHDRAWN.** It recommended adding the read capability to
  `WRITE_CLASS_CAPABILITIES` on the belief that the 6e §A CHECK enforces identity binding generally.
  The predicate is `agent_id IS NOT NULL AND owner_user_id IS NOT NULL` — **both** — while the read
  needs only `agent_id`, and the standing runner credentials are **owner-less by design**, so the
  recommendation would have rejected a mint on the live credential shape. A third option was missed
  and is now the recommendation.
- Also folded: the export gap for owner-less credentials (refined on verification — the route *does*
  carry a `credential_ref`-keyed pattern, so the fix is to follow that sibling, which is narrower
  than the reviewer's reading); the **anchor's Prerequisite-Criterion row**, which is the one row
  where data is *consumed* rather than disclosed (now stated as a question, Q-R12-C, not assumed
  away); §11's silence on the one cross-agent flow; and a build requirement that every
  "consulted by nothing" claim ship as a **source-grep assertion**, not a sentence.

**Clean dimensions on C's own enumeration:** PR24's non-engagement; the absence of any
candidate→execution path or harness-computed scalar; and §11's loop-proposes, weights-BLOCKED and
engine-byte-unchanged claims.

**Honest note on the review's own shape.** A's clean result is the weakest of the three signals — a
dimension that finds nothing tells you less than one that finds six, and A's dimension (line-level
fact-checking) was also the one this session had most recently exercised itself. B and C each found
material defects in work this session believed sound, which is PR19's grounding rationale
reproduced once more.

---

## 15. Honest limits

1. **This brief specifies; it has not been built against.** Every prior sitting's specifications that
   reached a build acquired corrections at the build. Expect the same.
2. **§4's runner-side components are specifications of an agent's behaviour, not of code the
   repository will contain.** The brief cannot make them true; only the runner's construction can.
3. **The TEST apply status (§1.3, §7.5) is undetermined and this session could not determine it** —
   a repo session cannot query either database. It is stated as undetermined, not assumed either way.
4. **Whether a design document is a "live surface" in the W2 clock rule's sense is not adjudicated
   here** — the work-designation assessment quoted both texts and declined to adjudicate, and this
   brief does not resolve what that assessment left to the founder.
5. **The `election_basis` placement (§2.5) departs from R8 §5.2c's "per-cycle" wording.** The
   departure is named, reasoned and left electable rather than applied silently.
6. **This brief's own first draft dropped five elements its sources named and contradicted itself on
   a sixth**, and none of that was caught by the author. Independent review caught all of it. The
   folded document is better than the drafted one; **that is a statement about the review, not about
   the drafting, and a later reader should weight §14 accordingly** rather than treating the current
   text as having been got right first time.
7. **§7.6 constrains the ladder more than §8.1 shows.** The producer question is unanswered, so the
   completion-signal stream has no producer other than the runner itself. **Phases 1 and 1′ are
   reachable today; phase 3's value is not, until R8's own recommended first follow-on — the
   producer-question mentor brief — has run.** §8.1's table states the phase gates; it does not
   state this, and the two must be read together.

---

## 16. Cross-references

- `2026-08-30-standing-runner-design-R8.md` — §4.3 (D1), §4.4 (D2), §4.5 (D3), §4.6 (D4), §4.8 (D5),
  §5.2 (D6a/b/c), §5.3 (D7), §6.2, §11.2
- `2026-09-04-standing-runner-design-R9.md` — §2.2, §3.1, §3.3, §3.4, §4.1, §4.2, §4.3, §6, §7, §8,
  §12, §13, §16
- `2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md` — §5.3, §9
- `2026-09-13-R11-R8D7-worst-of-K-policy-DESIGN.md`; `2026-09-13-R11-live-loop-verdict-measurement-DESIGN.md`
- `2026-09-13-mentor-ruling-R11-seven-questions-verbatim.md`;
  `2026-09-13-mentor-rulings-option-s-result-and-F-R1-verbatim.md` (Exchange 5 — W elected)
- `2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs"
- `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md` (the timestamp finding)

---

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
