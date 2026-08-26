# Next-Session Prompt — Slice 2: the consult-side write, its flag, and the PR24 sweep

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder. **Tier:** `code-critical` — a new env flag activating a write path against a
production table, plus a live cron extension. Full Critical Change Protocol applies. **AC7 engages at
the flag-flip/activation step** (the founder sets `SUBSTRATE_PROVENANCE_LEDGER_ENABLED=true` in Vercel
and the sweep flag, redeploys, and runs the live smokes); the AI drafts, wires, and adversarially
reviews the build and performs no live Vercel/Supabase op itself — the project's standing practice on
every prior flag-gated build in this arc's family (M6, AE-1, the trajectory-delta layer, the
observability sweep).

**Risk:** Critical (new write path + a live cron whose flag is already `true` in production for a
sibling feature — see Step 4 below, read it before touching the sweep).

**Governing frame:** `/adopted/standing-protocol-cache.md` (note §6 concurrency — `ListAgents` at
open — this repo had a concurrent stream active during the slice-1 session).

**Slice 1 is CLOSED.** Both tables (`agent_provenance_ledger`, `agent_provenance_gaps`) exist, empty,
on TEST and production — verified 2026-08-26, every `§VERIFY` query matched expectation on both
environments, including the two load-bearing checks (the tightened `apl_identity_kind_consistency`
CHECK and the zero-rows F-2 exclusion probe). See
`operations/handoffs/founder/2026-08-26-provenance-ledger-slice1-migrations-CLOSE.md` for the full
record. **Nothing about the schema is open to relitigate.**

**Round 6 is RULED.** This prompt originally carried two open questions (Step 2's slice-boundary
question, Step 4's sweep-flag question). Both have since been put to the mentor and ruled — this
version of the prompt has the rulings folded in directly, so what follows is build instruction, not an
open design question. The verbatim ruling is at
`operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-round6-q5-q6-verbatim.md`
if you want the full reasoning; the questions themselves (for context on how they were framed) are at
`operations/agent-circles-2026-08/2026-08-26-MENTOR-QUESTION-round6-provenance-ledger-slice2-scope-
and-sweep-flag.md`.

---

## Step 0 — Open and re-ground

1. `/adopted/standing-protocol-cache.md`; `git log -1`; `git status`; `ListAgents`.
2. **Read in full:** `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md` — §2
   (mechanism facts, esp. facts 1, 3, 4, 5, 6, 8, 9, 12, 13), §3 (the identity finding — already
   resolved by the migration's CHECK, but the write path must still supply the right inputs), §4.2
   (the write path and the gating it must NOT inherit), §5 (the lookup and the refusal — READ THIS
   ONE CAREFULLY, see Step 2 below), §7 (the retention window + the sweep recommendation), §9 (the
   phasing + threshold this write starts accumulating evidence for).
3. Skim, verbatim wins, none re-opened: `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-
   verbatim.md` (+ addenda) → the three `2026-08-26-mentor-ruling-provenance-ledger-*-verbatim.md`
   files → `2026-08-26-mentor-ruling-provenance-ledger-round6-q5-q6-verbatim.md` (the two rulings this
   version of the prompt already has folded in — read for the full reasoning, not to re-decide
   anything).
4. Read `website/supabase-agent-provenance-ledger-migration.sql` and
   `website/supabase-agent-provenance-gaps-migration.sql` in full — the header comments carry the
   reasoning for every column, including the two gaps slice 1 resolved (the `correlation_id`
   uniqueness and the four-value refusal-reason precedence). This slice's write code must match that
   schema exactly, not a remembered approximation of it.
5. Read `website/src/lib/substrate/trust-core/provenance-ledger-store.ts` — slice 1 already built the
   R17 data-rights seam here (`deleteProvenanceDataForOwner`, `deleteProvenanceDataForCredential`,
   `getProvenanceDataForOwner`). **This slice adds to the SAME file** — the write function, the flag
   helper, and the two purge functions belong here, mirroring how `agent-assessment-history-store.ts`
   holds M6's write + M7's read + the sweep all in one module.
6. Confirm at open: tier `code-critical`; AC7 status (not yet engaged — engages at the flag-flip);
   PR6 (founder performs every live flag/deploy operation); hold-point P0 0h; weights BLOCKED
   (unaffected by this arc either way).

## Step 1 — What is ruled and closed for this slice, not to be re-derived

| | Ruled | Where |
|---|---|---|
| Where the write lands | Alongside the M6 trajectory write, `website/src/app/api/reason/route.ts` — same identity inputs already in scope there | SCOPE §4.2; confirmed at the exact current lines in Step 3 below |
| `layer1_source` computation | Unconditional from `preExtractedLayer1Schema !== undefined` — never gated behind an unrelated flag (the trajectory-delta blind-window class this ledger must not inherit) | SCOPE §2 fact 6, §4.2 |
| Insert-once | `signature_hash` is `UNIQUE` on the table (slice 1, live). A conflict is a benign no-op — this project's standing idiom is a plain `.insert()` + catching Postgres `23505` as `ok:true`, never `.upsert()` | SCOPE §4.3; the codebase-wide `PG_UNIQUE_VIOLATION` pattern (grep it — five existing stores use it identically) |
| The flag | `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` — its own flag, never piggybacked on `isTrajectoryWriteEnabled()` or any other existing flag | SCOPE §4.2, the slice-1 prompt's own Step "no flag" constraint (which named this flag as slice 2's to create) |
| Gate on a signature being present | If `SUBSTRATE_LAYER2_SIGNING_ENABLED` is off, there is no signature to hash — this is self-consistent, not a gap (without signing, the accreditation write's R18f gate cannot set `provenanceEnforced` either, so no mint happens regardless) | SCOPE §4.2 |
| Retention window | 90 days, already declared on both tables' `retain_until` columns (slice 1) | SCOPE §7 |
| Sweep destination | Extend the EXISTING `/api/cron/trajectory-retention-sweep` handler — do NOT add a new cron | SCOPE §7, citing the `/api/cron/observability-retention-sweep` two-table-in-one-handler precedent |
| Retained exclusions | No assessment on error or Tier-1 short-circuit; no `credentialRef` ⇒ nothing to record (user-JWT consults carry no agent identity) — the SAME guard the trajectory write already applies | SCOPE §4.2 |
| **Slice-2 scope (round 6, Q5)** | **Slice 2 builds §5's classification logic** (identity + ledger-lookup-result in, outcome out — a PURE function, its own eligibility-predicate contract), alongside the consult-side write, running record-only at every accreditation write: classifies, logs, returns. **Never refuses, never writes `agent_provenance_gaps`** in this slice — those are enforce-phase behaviours slice 5 wires the SAME function into | Round 6 ruling, Q5 |
| **Sweep flag shape (round 6, Q6)** | **Both new purge functions gate internally on `SUBSTRATE_PROVENANCE_LEDGER_ENABLED`** — not the shared `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` (already `true` in production), not a third dedicated flag | Round 6 ruling, Q6 |

**Do not re-open:** the fix choice, any of Q1–Q4's policy rulings, the schema shape, the two
slice-1-resolved gaps, the round-6 Q5/Q6 rulings, or anything the SCOPE document already marks RULED.

## Step 2 — RULED (round 6, Q5): slice 2 builds §5's classification logic, record-only

**This was an open slice-boundary question when this prompt was first drafted. It is now ruled.**
Verbatim: `operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-round6-q5-q6-
verbatim.md`. Summary of what to build, and why, so you don't need to re-derive the reasoning before
coding:

**§13's table describes slice 2 as "the consult-side write + its flag, record-only."** That phrase
covers TWO pieces of work, not one — the mentor's ruling makes this explicit. §5 ("The lookup and the
refusal") describes classification logic at `emitAccreditationTrustEvents`
(`website/src/lib/substrate/trust-core/emission-hooks.ts`, currently ~lines 74–124 — re-confirm, this
file changes often), DISTINCT from the consult-side write at `/api/reason`. §5's own step 4 states a
record-only BEHAVIOUR for it (*"log every outcome, mint as today regardless of outcome"*), and the
mentor's reasoning is that §9's C2 threshold — 100% of ledger-eligible submitted artifacts resolving
in the ledger, observed across at least two consecutive weeks of record-only operation — is
unmeasurable without exactly this classification logic running live during the record-only window. A
standalone founder-run script mirroring the Trust Layer S11 `false-hold-observation-report.ts`
precedent was considered and rejected: that precedent fits a one-time retrospective measurement, not
an ongoing two-week observation, and would create a second implementation of the same classification
logic that has to be kept in sync with the first.

**Build both pieces this slice, at their respective locations:**

1. **The consult-side write** (Step 3) — populates `agent_provenance_ledger`.
2. **The classification logic** at `emitAccreditationTrustEvents` — for each submitted signed
   assessment: resolve the write-side identity via `resolveLongitudinalIdentity`, hash the signature,
   look it up in the ledger, and classify the outcome (`permit` / `no_ledger_entry` / `out_of_window` /
   `identity_mismatch` / `caller_supplied_extraction`). **Record-only means: classify, log the
   outcome, and return.** In this slice it **never refuses the mint** and **never writes an
   `agent_provenance_gaps` row** — both are explicitly ENFORCE-phase behaviours (§5 step 4) that slice
   5 adds later, reusing this exact logic.

**Build the classification logic as a PURE function** (identity + ledger-lookup-result in, outcome
out — no I/O inside the pure part, mirroring every other deterministic-core-plus-I/O-seam module in
`trust-core/`). The mentor's stated reason: slice 5's enforce-phase wiring needs to call the IDENTICAL
function and act on its output (refuse vs. permit) rather than rewriting or inheriting side effects
from a non-pure version — record-only and enforce-only should differ only in what they DO with the
classification result, never in how the result is produced.

**One binding implementation note from the ruling, not in the original SCOPE text:** *"the pure
function's signature should be explicit about what constitutes a ledger-eligible artifact. The
classification logic cannot run on artifacts the ledger was never designed to cover. The eligibility
predicate should be defined in the pure function's contract, not inferred by its callers."* Concretely:
decide and document, as part of the function's own type/contract (not as an implicit assumption a
caller has to infer), which submitted artifacts are even candidates for classification — e.g. an
artifact consulted before the write flag began recording for its identity is honestly `no_ledger_entry`
forever (SCOPE §9's C2 text already names this class) but the function's CONTRACT should say so
explicitly, not leave it to whoever calls the function to work out from context.

## Step 3 — The consult-side write

**Site:** `website/src/app/api/reason/route.ts`, immediately alongside the M6 trajectory write block
(currently `if (isTrajectoryWriteEnabled() && sandwichResult.error === null && ...)`, roughly lines
1792–1888 — re-confirm before editing, this file changes often). **Do not fold this into that `if`
block** — it has its own flag (`SUBSTRATE_PROVENANCE_LEDGER_ENABLED`) and its own gating condition (a
signature must be present), so it needs its own guard, even though it reuses the SAME
`credentialRef`/`ownerUserId`/`declaredAgentId` resolution the trajectory block already computes a few
lines above (reuse those three locals — do not re-derive them, do not do a second credential-context
PK read; `sharedCredCtx` is already the established reuse pattern here, see AE-1's own comment on that
exact point).

**What to write, per row (`agent_provenance_ledger`):**
- `signature_hash` — `createHash('sha256').update(signature).digest('hex')`, where `signature` is
  `sandwichResult.output.assessment.signature` (the `SignedLayer2Assessment.signature` field,
  base64 — `website/src/lib/translation-sandwich/layer2-signer.ts:95-98`). **`sandwichResult` is fully
  computed by the time this code runs** (it's constructed via an awaited `runSandwich()` call much
  earlier in the route, ~line 1434) — confirm `sandwichResult.output?.assessment?.signature` is
  present and a non-empty string before proceeding; if signing is off, this will be absent — skip the
  write silently (the "gate on a signature being present" rule from Step 1).
- `identity_kind` / `owner_user_id` / `agent_id` — via `resolveLongitudinalIdentity({ credentialRef,
  ownerUserId, agentId: declaredAgentId })` (`website/src/lib/substrate/longitudinal-identity.ts`,
  unchanged, import it — do not re-derive the branching logic inline, the migration's CHECK constraint
  exists specifically so this module's output and the stored row can never silently diverge).
- `credential_ref` — the same `credentialRef` local the trajectory block computes.
- `layer1_source` — `preExtractedLayer1Schema !== undefined ? 'supplied' : 'server'`, computed
  UNCONDITIONALLY (never behind `isTrajectoryDeltaEnabled()` — that flag gates a DIFFERENT field on a
  DIFFERENT table and this ledger must not inherit its blind window; SCOPE §2 fact 6 is explicit about
  this).
- `recorded_at` — the consult time. Use the SAME timestamp basis the trajectory write uses (check what
  it passes, if anything — if it relies on the column default, this ledger row should too, so both
  rows agree on the moment).

**Insert:** a plain `.insert()` against `agent_provenance_ledger`, awaited (KG1 — no fire-and-forget),
wrapped so a `23505` (the `PG_UNIQUE_VIOLATION` constant every sibling store defines locally) is
treated as `ok:true` — a benign retry, never a logged failure. Any OTHER error is logged
non-fatally (`console.warn`) and the response proceeds unchanged — this write must never be able to
fail the consult, mirroring the trajectory write's own fail-honest posture exactly.

**Add to `provenance-ledger-store.ts`:**
- `PROVENANCE_LEDGER_ENV_VAR = 'SUBSTRATE_PROVENANCE_LEDGER_ENABLED'` + `isProvenanceLedgerEnabled()`
  (mirrors `isTrajectoryWriteEnabled()` in `agent-assessment-history-store.ts:44-50` exactly).
- The write function itself (name it something like `persistProvenanceLedgerEntry`), taking the
  resolved identity + signature + layer1Source + recordedAt, doing the insert-with-conflict-benign
  dance, returning `StoreResult<'inserted' | 'already_recorded'>` or similar — pick a shape that lets
  a unit test distinguish a fresh insert from a benign duplicate, since that distinction matters for
  slice 2's own test coverage (a retried consult must not double-count).

## Step 4 — The PR24 sweep, extending the trajectory-retention-sweep cron

**RULED (round 6, Q6): both new purge functions gate internally on `SUBSTRATE_PROVENANCE_LEDGER_
ENABLED`.** Not the shared `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED`, not a dedicated third flag. Verbatim:
`operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-round6-q5-q6-verbatim.md`.

**Why this matters, and why it isn't merely a style preference:** `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED`
is ALREADY `true` in production (live since 2026-06-14, per `/CLAUDE.md`'s production-state record —
verify this is still current before relying on it, don't just trust this line — the ruling itself
names this as the correct discipline). If the two new purges were gated only by that already-live
flag, they would go live the instant this code is pushed — not when the founder deliberately sets
`SUBSTRATE_PROVENANCE_LEDGER_ENABLED`. The mentor's ruling explicitly rejected the "it's harmless
because the tables are empty" argument: *"the argument that riding the shared trajectory sweep flag is
fine here… is technically correct and strategically wrong… it reproduces the exact shape that the Stoa
incident named as a standing rule: dark is per-flag, not per-feature… the inertness is a coincidence
of the current state, not a property of the design."* Gating on the ledger's own flag is also the
RIGHT coupling on its own terms, not merely the safe one: *"a sweep that runs only when the ledger is
active is not an arbitrary constraint. It is the correct description of the feature's operational
state."*

**Shape (verify against `/api/cron/observability-retention-sweep/handler.ts`'s exact structure, which
this should mirror closely — the two-purges-in-one-handler precedent):**
- In `provenance-ledger-store.ts`, add `purgeExpiredProvenanceLedger()` and
  `purgeExpiredProvenanceGaps()` — each a `{ deleted: number; error: string | null }`-shaped,
  fail-honest purge (mirrors `purgeExpiredTrajectory` / `purgeExpiredRouteErrors` exactly: an indexed
  `DELETE ... WHERE retain_until < now() RETURNING id`, missing-table-benign, never throws). **Each
  purge function gates internally on `isProvenanceLedgerEnabled()`** (the same flag helper Step 3 adds
  for the write) — calling either function when the ledger's own flag is unset is a documented no-op.
- In `website/src/app/api/cron/trajectory-retention-sweep/handler.ts`, add the two new purges to
  `SweepDeps`/`DEFAULT_DEPS`, call them alongside the existing `purge()` call — **sequentially,
  independently** (mirror the observability handler's own comment: one failing must never suppress or
  skip the others; pin this with a test the same way `route.test.ts §6` pins the observability sweep's
  independence). Sum the `deleted` counts or report them per-table (`{ trajectory: N, provenance_
  ledger: N, provenance_gaps: N }`) — pick the shape that's easiest for a founder eyeballing the cron's
  JSON response to interpret, and say which you picked and why in the close.
- **No new cron entry in `website/vercel.json`** — this rides the existing `trajectory-retention-
  sweep` schedule entirely.

## Step 5 — Inherited lessons, named so they are not rediscovered

- **A fake PostgREST test client that ignores its `select()` argument cannot catch a wrong primary-key
  column** (the C-1 sweep defect). Both new tables use a generic `id UUID PRIMARY KEY` — confirmed in
  the migrations — so this specific trap doesn't apply here, but any test double you write for the new
  purge functions should still name the real PK column explicitly rather than assuming any string
  passed to `.select()` is validated by the fake.
- **Re-derive any CHECK constraint's CURRENT definition via `pg_get_constraintdef`** before writing
  code that assumes a particular shape — this slice doesn't touch any CHECK, but if you find yourself
  needing to confirm the live `apl_identity_kind_consistency` definition for any reason, don't trust
  the migration file's comment; the slice-1 close has the founder-verified live definition pasted in.
- **A shared cron/flag makes "dark" a per-flag claim, not a per-feature claim** — see Step 4; this is
  the lesson most directly load-bearing for this specific slice, and the round-6 mentor ruling
  confirmed it applies here even though the practical blast radius is currently nil (empty tables).
- **KG1 — no fire-and-forget.** Every DB write and every purge call in this slice must be `await`ed;
  Vercel terminates the function after the response is sent, so an un-awaited write can silently never
  land.

## Step 6 — What this session must produce

1. **The consult-side write** (Step 3), flag-gated, dark by default (`SUBSTRATE_PROVENANCE_LEDGER_
   ENABLED` unset ⇒ byte-identical to today — test-assert this explicitly, the way every prior flag in
   this arc's family has been battery-proven flag-off-identical).
2. **Step 2's ruled classification logic** — the pure function at (or called from)
   `emitAccreditationTrustEvents`, its eligibility-predicate contract stated explicitly, wired to run
   record-only (classify, log, return — never refuse, never write `agent_provenance_gaps`).
3. **The PR24 sweep extension** (Step 4), gated on `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` per the
   round-6 ruling — state in the close that this was verified, not merely coded to spec.
4. **Unit tests** for the new write function (fresh insert vs. benign duplicate vs. real-error;
   missing-signature ⇒ no-op; flag-off ⇒ no-op), the classification pure function (all five outcomes,
   incl. the eligibility-predicate boundary), and the two new purge functions (missing-table-benign,
   real-error-surfaces, expired-vs-live discrimination, flag-off ⇒ no-op even with expired rows
   present) — follow this session family's `npx tsx` plain-assertion pattern, no Jest.
5. **One independent adversarial-review pass** before close (this arc's standing practice every
   session since slice 1) — the load-bearing dimensions: flag-off byte-identity on `/api/reason`; the
   signature-hash computation is byte-correct against the real `SignedLayer2Assessment.signature`
   field (not a decoy field); insert-once genuinely dedupes a retried write; the sweep's flag-gating is
   genuinely `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` and does NOT inherit the trajectory sweep's
   already-live state (a live-code check, not a comment claim); and the classification logic never
   writes `agent_provenance_gaps` and never refuses a mint in this slice (record-only means
   record-only) — pin this the same way the observability sweep's independence is pinned.
6. **TEST-first, then production activation** (AC7, founder-walked): apply nothing new to the schema
   (slice 1 already did); set `SUBSTRATE_PROVENANCE_LEDGER_ENABLED=true` in Vercel + redeploy + a live
   smoke (a real consult on a credentialed request should land exactly one new
   `agent_provenance_ledger` row, correctly classified `identity_kind`/`layer1_source`); confirm the
   sweep's JSON response reports the two new purges (even if `deleted: 0`, since the tables start
   empty).
7. **A close**, following the slice-1 close's shape: what was built (both the write and the
   classification logic), adversarial-review findings and folds, the founder-run verification results,
   and what slice 3 and slice 5 each inherit (slice 5 in particular inherits the pure classification
   function directly — name it and its location explicitly in the close so slice 5 doesn't have to
   rediscover it).

## Constraints that bind

- **This is still record-only.** Nothing in this slice may cause an accreditation write to be refused,
  and nothing in this slice may write to `agent_provenance_gaps` — that table stays empty until slice 5
  implements ENFORCE-phase behaviour (per §5 step 4 and the round-6 ruling, which confirms slice 5
  reuses this slice's classification function rather than rebuilding it).
- **No change to `agent_provenance_gaps`'s served-field story** — that's slice 3's job (the SCOPE §6
  `provenance_gaps` field on the public trust record + the §10 attestation amendment). Don't touch
  `trust-record-payload.ts` or `TRUST_RECORD_ENVELOPE` in this slice.
- **Concurrency:** `ListAgents` at open; `git status` before writing and again before staging;
  path-scoped commits; exclude `website/src/data/environmental-context.json`.
- Weights BLOCKED (unaffected). Nothing here bears on the 0h call.

## What "done" looks like

The consult-side write is live in production behind its own flag, dark by default and confirmed
byte-identical when off; a real consult produces exactly one correctly-shaped ledger row when on; the
classification pure function exists at the accreditation write boundary, running record-only (classify,
log, return — confirmed never refusing and never writing `agent_provenance_gaps`), with its
ledger-eligibility contract stated explicitly rather than left implicit; the PR24 sweep covers both new
tables from the existing cron, gated on `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` and confirmed NOT to
inherit the already-live trajectory sweep's "on" state; and slice 3 (the served `provenance_gaps`
field + the attestation amendment + the ENV-1 gate relaxation) and slice 5 (which reuses this slice's
classification function in its enforcing branch) are both ready to open as their own founder-walked
sessions.

*End of prompt.*
