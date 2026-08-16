# Next session — R2b: the code-critical guard bundle (dark)

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: `code-elevated`→`code-critical` per item, all dark/additive — NO FLAG IS SET IN THIS
SESSION.** Founder presence: none required mid-build; **two decisions are the founder's and are
named in Part C**; two PAUSE points around the consolidated PR19 review.

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → the arc plan's R2 block
(`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`, search "☐ R2b") → the R2a
decision-log entry `D-CONCURRENT-ARC-R2A-DISCLOSURE-BUNDLE-BUILT-PR19-FOLDED-2026-08-16` **in
full** (it carries three scope findings that bind this session) → `git status` and
`git log --oneline -10`.

**Re-check the guard posture at THIS session's open, not from this prompt.** The byte-identity
guard is window-conditional — it binds iff `GATE1_FALSE_HOLD_CAPTURE === 'true'`
(`website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` §C, the M1 ruling). It was
**unset/DORMANT** throughout R2a. Both `derive-trust-events.ts` and the harness hook tree match
`GUARD_RE`, so if a new window has started, this session coordinates with the window rules rather
than assuming dormancy. **Do not infer the guard's state from a calendar date — a PR19 review agent
did exactly that in R2a and got the right answer for the wrong reason.**

**Expected HEAD at authoring:** `2e73ca7` (the R2a PR19 fold). Nothing is pushed — the push is R4
step 1.

---

## Part A — Why this session matters

R2a built the disclosure half of the R2 batch (what the record *says about itself*). R2b is the
other half: **the guard bundle proper** — the live trust-ledger reducer, the harness hooks, a new
retention sweep, and the AE-1 dispersion member. These are the items whose activations R4 walks.
R2a deliberately deferred them rather than rushing them at the end of a long session.

**R2a surfaced three findings that change what this session should build. They are not optional
context — two of them mean the arc plan's own wording is wrong.**

---

## Part B — The three inherited scope findings (read before scoping any item)

### 1. PR24's `stoa_entries` half DOES NOT EXIST — and building it would contradict a ruling

The arc plan says item 7 covers "both named gaps — `agent_hold_observations` + `stoa_entries` sweep
coverage". **`stoa_entries` has no `retain_until` column, deliberately**, by binding mentor ruling
**#24, Q9**: entries are *standing declarations*; **"silent expiry is prohibited."** This is pinned
in three independent places:

- `website/supabase-stoa-entries-migration.sql:21-26` — "DELIBERATE ABSENCES (each a ruling, not an
  oversight): NO retain_until and NO retention-sweep participation"
- `website/src/lib/stoa/stoa-store.ts:29-33` — **"Never add this table to any retention sweep."**
- `website/src/lib/stoa/__tests__/stoa-boundary.test.ts:305` — a battery assertion that fails if
  `retain_until` appears in the migration at all.

PR24's own grounding sentence (`adopted/project-instructions-snapshot.md:621`ff) claims both tables
declare it. **That claim is factually wrong for `stoa_entries`.**

**→ FOUNDER DECISION (Part C.1).** Default: build the sweep for `agent_hold_observations` ONLY and
record the `stoa_entries` half as a non-gap resolved by ruling #24/Q9. Changing the stoa posture
"requires re-opening the mentor record, not a schema tweak" (the migration's own words).

**Build note if it proceeds:** `agent_hold_observations`' PK is a generic **`id`** — unlike its
`route_errors`/`throttle_events` siblings. The **PK_COLUMN discipline** from the 2026-08-12 C-1 live
defect applies (a hardcoded `.select('id')` was the defect there; here `id` happens to be right,
which is exactly how the class hides). Encode it in the map anyway and harden the fake test client
to validate `select()`'s column against the real PK, per the C-1 pattern
(`website/src/app/api/cron/observability-retention-sweep/`). The existing ingest script
(`website/scripts/false-hold-observation-report.ts:237-243`) already does an **agent-scoped** purge
— complementary to an unscoped cron sweep, not conflicting, but check it again first-hand.

### 2. Item 5's registered defect is mis-named in every record that carries it

The reflect route's `loop_billing_events.loop_id` **has been UUID-safe since the route's creation**
(`website/src/app/api/practice/reflect/route.ts:304`, `extractLoopId(request) ?? generateLoopId()`,
present from commit `0eb36c8`). It is not the defect.

**The actual sink** for the founder-observed `invalid input syntax for type uuid:
"reflect-<session_id>"` is **`classifier_cost_log.session_id`** (a UUID column,
`supabase/migrations/20260417_r20a_classifier_cost_tracking.sql:45`) receiving the caller-supplied
free-form id through the R20a gate: `reflect/route.ts:415` (`sessionId: session_id`) →
`r20a-gate.ts:490` → `r20a-classifier.ts` `logClassifierRunSafe` → `r20a-cost-tracker.ts:140`.
Swallowed twice (`r20a-cost-tracker.ts:152-157` console.error + `r20a-classifier.ts:314-317`
fire-and-forget), so the reflect persist and loop billing both succeed while the classifier cost row
is **permanently absent** — R20a cost/coverage telemetry silently undercounts the reflect surface.

**Two things the records do not carry:** a worse sibling on the failure path —
`writeClassifierDownMarker` inserts the same free-form id into `vulnerability_flag.session_id`
(`UUID NOT NULL`), so the `needs_rescoring` marker would also be lost; and an **unrecorded adjacent
instance**, `/api/calling` (`calling/route.ts:462-466`) passing a free-form `session_id` to the same
gate.

**Fix precedent is in-repo:** `deterministicLoopId` (`loop-cost-tracker.ts:53-65`), the 2026-07-12
S9b fix, already used at `practice/discernment/handler.ts:240-243` and
`sage-reflect/screened-examination.ts:52-55`. Note `recordLoopBilling` defends only the **INTEGER**
half of that contract; `p_loop_id` passes through unvalidated. **The choice of fix site (shape at
the classifier boundary vs. thread the route's real UUID through `ClassifierRunLog.loop_id`, which
exists and is unused by these call sites) is a design decision for that session to make and record.**

### 3. The stoic-brain compiler has diverged from its checked-in artifact

Not an R2b item, but do not repeat R2a's near-miss. `scripts/compile-stoic-brain.ts` writes
`website/src/data/stoic-brain-compiled.ts` (**not** `website/src/lib/stoic-brain.ts` as the arc plan
says), and running it yields **+1565/−375** — the checked-in artifact is hand-condensed for LLM
context injection; the compiler emits a raw dump. Two live consumers read it. **Do not run it
without a deliberate decision.**

---

## Part C — Session-open decisions (state each in the record; do not decide silently)

1. **PR24 scope — FOUNDER'S CALL.** Accept the correction (build `agent_hold_observations` only,
   record the stoa half as a non-gap), or escalate to re-open the mentor record. **Do not build a
   `stoa_entries` sweep on the arc plan's wording alone.**
2. **AE-3 (item 2) — is it buildable this session?** ADR-014 §7 gates it: *"Last; needs structural
   cadence-provenance + a non-monoculture distribution."* Neither is verifiable from a repo session.
   AE-3 is the **agent R20b dependence detector** (NOT the reflect projection — that gate belongs to
   AE-1 and does not apply here; see the R2a research). Its own preconditions: a structural way to
   distinguish harness-mandated from agent-elected consults (**never a client-supplied flag** —
   §3.4), and the `deliberate`-monoculture resolved. **If the preconditions cannot be shown met,
   the honest move is to scope-and-defer with the reason recorded, not to build a detector whose
   inputs are known-degenerate.** The ADR also names no carrier surface and no flag for it —
   both are open design choices.
3. **Order and split.** Suggested: item 1 (D4+D1) → item 5 → item 7 → item 8 (P8a) → Spec 4 → item 2
   (AE-3) last, per the ADR. Split again at the review boundary if context runs hot; say so.
4. **The carried Q1 finding** (below) — fix here, or route to R3? State the choice.

---

## Part D — What R2b builds

1. **D4 + D1** — the trust-ledger reducer self-circle narrowing coupled with D1's cap logic.
   `deriveWorstJusticeOutcome` (`derive-trust-events.ts:165-230`) **reads circle STATUSES but never
   circle NAMES** — so a `self_preservation`-only assessment derives all four justice event types
   today. The predicate (`kathekon-engagement.ts`) was narrowed 2026-07-19; the reducer was not
   (register **D4**; `D3` makes it `code-critical` + founder-walked because it is a LIVE
   trust-event surface). **Three things that will bite:** (a) the predicate's own delegation call
   (`kathekon-engagement.ts:167-179`) reconstructs circles **without names** — if the reducer starts
   reading names, that call site must pass `signals.circles` or Arm 1 breaks; (b) the S1 battery's
   `mkSigned` fixture (`trust-core.test.ts:319-337`) produces **name-less** circles throughout, so
   an unknown-identity policy decision (strict like the predicate, or permissive) determines how
   many of ~15 reducer pins move; (c) **§8.9 in `kathekon-engagement.test.ts:537-560` pins the
   CURRENT divergence as intentional** and must be inverted, not deleted quietly. Build + battery
   dark; the walk is R4.
2. **Item 5** — the metering fix, re-scoped per Part B.2.
3. **Item 7** — PR24 retention parity, scope per Part C.1. Dark behind its own new flag; **no flag
   set, no `vercel.json` cron entry** (that is R4).
4. **Item 8 — P8a guard-path capture.** The register's own words: the guard path *"writes no
   record,"* which is why part (3) of the readiness standard has **no denominator** (trust-layer
   register P5). The verdict is in hand at `at-action-hook.mjs:444` and discarded in every branch.
   **`fetchGuardrail` (`framing-core.mjs:595-608`) returns only 5 lean fields and drops
   `is_kathekon`/`kathekon_quality`/`extraction`/`signed_assessment`** — it must be extended before
   a signals-bearing record is possible (contrast `fetchFrame`, which returns the full body).
   **P8a's own load-bearing requirement, verbatim: "prove by test that a capture failure inside the
   guard hook CANNOT alter, delay, or fail the deny decision (fail-soft capture, fail-safe guard —
   two independent properties, both battery-pinned)."** The mock's `guardrailBody` needs richer
   fixtures. Also check the TS ingest (`false-hold-observation-report.ts`) admits any new record
   schema without breaking v1–v3 hash idempotency.
5. **Spec 4 — the AE-1 dispersion member.** Election **already resolved, do not re-open**: a
   dedicated `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` (UNSET ⇒ byte-identical, battery-asserted),
   schema stays `agent-trajectory-delta-v1`. **Copy the spec's §4.1 flag-discipline statement into
   the implementation record BEFORE touching code** — a mentor-stated requirement. Ruled constraints
   ride it (Set B R-3/R-5): served ONLY inside the AE-1 delta on credential-bearing `/api/reason`
   consults, **never on the public trust record**; the two named honest limits carried in its own
   disclosure; the M7 window stands; MEASURE-only.
6. **AE-3** — per Part C.2.
7. **The carried Q1 null-suspicion finding** (PR19-confirmed in R2a). Q1's recalibrated wording
   invites *"I cannot determine"*; `reflect-extractor.ts`'s `mapQ1`/`Q1_SYSTEM` has **no field
   distinguishing it from "examined, found nothing"** — both give `distortions: []`, so three
   consecutive honest answers trip `null_reflection` (`engine.ts:479-488`) and elevate
   `fabrication_risk` to `moderate`, surfacing a misdirected scrutiny note
   (`response-builders.ts:187-188`). Bounded — never reaches `high`, so S1 emission is unaffected
   (`derive-trust-events.ts:516`). Closing it means adding a cannot-determine signal to the Q1
   extraction schema: **a live trust-event surface, its own scoped change.**

---

## Part E — Adversarial review (PR19)

One consolidated review across whatever this session actually builds. **PAUSE before launching** —
founder drops the model setting. **PAUSE after it returns** — founder restores it. **PR19 is
mandatory here, not optional:** D4+D1 is a trust-core reducer change, item 7 is data-deleting code,
and item 8 touches the only live enforcement channel — three of PR19's named trigger surfaces.

---

## Part F — Close

Decision-log entry (full form — D4+D1 and P8a are both `code-critical`-adjacent); state every Part C
decision and its reasoning; mutation-verify every new pin and say so; tick the arc plan's **R2b**
box with a DONE annotation naming the entry; author the R3 prompt or hand back per the arc plan.

---

## What NOT to do

- **Do not set any flag. Do not activate anything. Do not push.** R4 does all three, after R2 and R3
  are both built.
- **Do not build a `stoa_entries` sweep** on the arc plan's wording — see Part B.1.
- **Do not fix `loop_billing_events.loop_id`** — it is not broken. See Part B.2.
- **Do not run the stoic-brain compiler.** See Part B.3.
- **Do not re-open Spec 4's flag election** — resolved 2026-08-16, founder-approved.
- Do not delete the §8.9 divergence pin quietly when narrowing the reducer — invert it, so the
  change stays a conscious decision rather than drift.

## Rollback path

Every item is dark, additive, and independently `git revert`-able. Nothing in R2b is live in
production regardless of outcome; R4 is the separately-walked activation.

## Forecast

Success = the six carried items built dark with clean batteries and mutation-verified pins, the two
founder decisions recorded rather than assumed, one clean consolidated PR19 review with both pause
points honoured, nothing activated — and R3 next.

*End of prompt.*
