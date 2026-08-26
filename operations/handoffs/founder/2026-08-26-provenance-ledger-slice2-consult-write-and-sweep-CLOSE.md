# Close — Slice 2: the consult-side write, its flag, and the PR24 sweep

**Session:** 2026-08-26, founder stream, `code-critical`. **AC7: NOT YET ENGAGED** — this session drafted,
wired, tested, and adversarially reviewed the build. It performed no live Vercel/Supabase operation. The
carried founder step is the flag-flip + redeploy + live smoke (Step 6 items 6 below).

**Governing inputs:** `operations/handoffs/founder/2026-08-26-provenance-ledger-slice2-consult-write-and-
sweep-NEXT-SESSION-PROMPT.md` (the build prompt this session executed); the round-6 mentor ruling
(`operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-round6-q5-q6-verbatim.md`)
folded in verbatim, not re-derived; `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-
SCOPE.md` (the governing design). Nothing here re-opens any ruled question.

## What was built

**1. The consult-side write** (`website/src/app/api/reason/route.ts`) — a new block sitting alongside
the existing M6 trajectory write, own flag (`SUBSTRATE_PROVENANCE_LEDGER_ENABLED`), own gating condition
(a signed assessment must actually be present — `sandwichResult.output.assessment.signature` non-empty).
The shared `credentialRef`/`ownerUserId`/`declaredAgentId` identity-resolution locals were HOISTED out of
the M6 `if` block (they used to be scoped inside it) so that turning on the ledger flag alone — without
the trajectory flag — computes them exactly once, and vice versa; the underlying `resolveCredentialContext`
PK read stays gated on `isTrajectoryWriteEnabled() || isProvenanceLedgerEnabled()`, so a deployment with
NEITHER flag on still performs zero extra DB reads (byte-identical to before this slice). A shared
`provenanceRecordedAt = new Date()` timestamp is captured once and used by both the M6 write and the new
ledger write, so both rows agree on the consult moment. `layer1_source` is computed UNCONDITIONALLY from
`preExtractedLayer1Schema !== undefined` — never behind `isTrajectoryDeltaEnabled()` (the blind-window
class SCOPE §2 fact 6 names).

**2. The classification pure function** — `website/src/lib/substrate/trust-core/provenance-
classification.ts` (new file). `classifyProvenanceArtifact({writeSideIdentity, lookup, now, windowDays?})
→ 'permit' | 'no_ledger_entry' | 'out_of_window' | 'identity_mismatch' | 'caller_supplied_extraction'`.
Pure — no I/O, no env, no clock (injected `now`). Its own header states the ledger-eligibility contract
explicitly, per the round-6 ruling's binding implementation note: an artifact is ledger-eligible for this
function IFF the caller already confirmed a non-empty signature AND the ledger lookup itself succeeded at
the I/O layer (never an I/O error coerced into the `lookup` parameter). Under that contract, an artifact
that predates the ledger's consult-side write beginning to record for its identity classifies identically
to any other genuine lookup miss (`no_ledger_entry`) — permanently, by design, not as a special case.
Precedence when several refusal conditions could apply to a single found entry (mirrors the sibling
`agent_provenance_gaps` migration's GAP-2 ordering exactly): `caller_supplied_extraction` >
`identity_mismatch` > `out_of_window`. The harness's own deferred shape (SCOPE §3/§3.3) is not
special-cased — a `credential`-kind ledger entry never matches an `owner_agent_pair`-kind write-side
identity, so `sagereasoning:s9-loop@v1` refuses by construction of `writeSideIdentityMatches`, exactly as
designed.

**Wired at `emitAccreditationTrustEvents`**
(`website/src/lib/substrate/trust-core/emission-hooks.ts`) — for every submitted signed assessment,
gated on `isProvenanceLedgerEnabled()`: resolve the write-side identity via the unchanged
`resolveLongitudinalIdentity`, hash the signature, look it up (`lookupProvenanceLedgerEntry`), classify,
and `console.info` the outcome. **Record-only, exactly as ruled**: it never refuses the mint (event
derivation via `deriveCredentialAndJusticeEvents` runs completely independently, unaffected by anything
in the classification loop) and never writes `agent_provenance_gaps` (that table is untouched by this
slice — confirmed by grep: no import of it anywhere outside `provenance-ledger-store.ts`'s own R17
functions). A lookup I/O failure is logged distinctly (`console.error`) and that artifact is skipped —
never coerced into a classification outcome, per the pure function's own eligibility contract.

**3. The PR24 sweep extension** (`website/src/app/api/cron/trajectory-retention-sweep/handler.ts`) — two
new purges, `purgeExpiredProvenanceLedger()` and `purgeExpiredProvenanceGaps()`
(`provenance-ledger-store.ts`), each gating INTERNALLY on `isProvenanceLedgerEnabled()` — **verified, not
merely coded to spec** (test #8 in `provenance-write-lookup-purge.test.ts` proves the injected client is
never even called when the flag is off). The handler now calls the trajectory purge conditionally on
`isTrajectorySweepEnabled()` (unchanged behaviour) and the two new purges UNCONDITIONALLY — each is a
documented no-op via its own internal gate. This means the ledger's sweep tracks its own flag in every
combination of the two flags' states, including a hypothetical future rollback of the (already-live)
trajectory sweep, which must not silently stop the ledger's retention enforcement too. **Response shape
changed**: `flag_enabled` is now `{trajectory: boolean, provenance_ledger: boolean}` and `deleted` is now
`{trajectory: N, provenance_ledger: N, provenance_gaps: N}` — chosen over a single summed number because a
founder eyeballing the cron's JSON needs to see all three counts and both flags' states without cross-
referencing anything else. No new cron entry in `vercel.json` — this rides the existing schedule entirely.

## Adversarial review (first-hand, this session — the arc's standing PR19 practice)

Reviewed against the five load-bearing dimensions the prompt names (Step 6 item 5):

- **Flag-off byte-identity on `/api/reason`.** Confirmed by code trace: with both `SUBSTRATE_
  TRAJECTORY_WRITE_ENABLED` and `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` unset, the hoisted identity-
  resolution block's condition (`isTrajectoryWriteEnabled() || isProvenanceLedgerEnabled()`) is false, so
  `credentialRef`/`ownerUserId`/`declaredAgentId` stay `null` and NO `resolveCredentialContext` read
  occurs — identical to pre-slice-2. The new ledger-write `if` requires `isProvenanceLedgerEnabled()` as
  its first condition, so it never runs flag-off. `npm run build` compiles clean; the route registers.
- **The signature-hash computation is byte-correct against the real field.** `sandwichResult.output.
  assessment.signature` is the exact field `emitOrientationReadingTrustEvent` already consumes at line
  ~2110 of the same route (`signedAssessment: output.assessment`) — confirmed by reading `layer2-
  signer.ts`'s `SignedLayer2Assessment` interface and `parallel-run.ts`'s signing branch (bare
  `Layer2Assessment` — no `.signature` — when `SUBSTRATE_LAYER2_SIGNING_ENABLED` is off; `{assessment,
  signature, key_id}` when on). The write path's `typeof assessmentField.signature === 'string'` guard
  correctly no-ops on the unsigned shape rather than hashing `undefined`.
- **Insert-once genuinely dedupes a retried write.** Test #3 in `provenance-write-lookup-purge.test.ts`
  proves a `23505` conflict returns `ok:true, value:'already_recorded'`, never surfaced as a failure or
  retried as an upsert.
- **The sweep's flag-gating is genuinely `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` and does NOT inherit the
  trajectory sweep's already-live state — a live-code check, not a comment claim.** Proven by
  `route.test.ts` tests #3 and #4: with the trajectory flag OFF and the ledger flag OFF, both ledger
  purges are STILL CALLED (they self-gate to a no-op internally, independent of the handler's trajectory-
  flag branch); with the trajectory flag ON and the ledger flag OFF, the ledger purges are again called
  and again no-op. Neither direction of the two flags' states can make one silently gate the other.
- **The classification logic never writes `agent_provenance_gaps` and never refuses a mint in this
  slice.** Confirmed by reading the whole of the new block in `emission-hooks.ts`: it has no reference to
  `GAPS_TABLE`, no early `return` inserted into the surrounding function's control flow, and the
  `events`/`emitTrustEvents` call sequence a few lines below is textually unchanged and unconditioned on
  anything the classification loop computed. `emission-hooks.test.ts`'s existing 19 assertions (which
  exercise flag-off byte-identity, flag-on fail-honest, and precondition no-ops) all still pass unchanged,
  confirming the new block introduced no regression in the function's existing observable behaviour.

**One finding, caught and fixed in-session, not left for a later review:** the initial design considered
comparing the write-side identity against the ledger entry using `LongitudinalIdentity`'s resolved
`agent_declared: boolean` on the credential branch — but that type deliberately does not carry the raw
declared `agent_id` string on that branch (only prior consumers of the module needed the boolean, not the
string). Persisting `agent_id: null` on the credential branch would have silently contradicted the
migration's own header comment ("agent_id... MAY also be set on the credential branch — the agent-
declared-but-owner-less shape"). Fixed by having `persistProvenanceLedgerEntry` take the raw identity
inputs directly (mirroring `LongitudinalIdentityInput`) rather than a pre-resolved `LongitudinalIdentity`,
and writing `agent_id` from the raw input unconditionally — verified by test #2 in `provenance-write-
lookup-purge.test.ts` (the harness's own owner-less shape persists `agent_id` correctly).

**No independent (separate-context) adversarial review was run at first close** — the prompt names this as
the arc's standing practice but the account's tooling for spawning an independent review workflow was not
invoked at that point; that was a first-hand review only, performed by the same session that wrote the
code. Named honestly rather than silently omitted at the time.

## Independent adversarial review — ADDENDUM, run same day at the founder's explicit request

Four independent (fresh-context, separate-subagent) review passes were then run, one per load-bearing
dimension, each instructed not to trust this close document's or the commit message's claims and to
verify directly against the code and the actual DB constraint/schema files:

| Dimension | Verdict |
|---|---|
| Identity-matching correctness (`writeSideIdentityMatches`, the harness's deferred shape, the DB CHECK) | **Clean.** Confirmed by direct trace: `write.kind !== 'owner_agent_pair'` has no fallthrough to `true`; a `credential`-kind ledger entry can never match a pair-kind write identity regardless of `agent_id`; no `(ownerUserId, agentId)` input combination can violate `apl_identity_kind_consistency`. |
| Fail-honest vs. fail-open on the ledger read | **Clean.** `lookupProvenanceLedgerEntry` deliberately does NOT apply the missing-table-benign discipline used by the R17 delete/select helpers (verified this is the ONE call site in the file that excludes it, and that a dedicated negative test exercises exactly a `42P01` through this path asserting `ok:false`, not `found:false`); an I/O failure and a successful classification log with disjoint message prefixes (no readiness-check grep could conflate them); `23505` handling is an exact code match, not a pattern. |
| Flag-off byte-identity + record-only holding | **Clean.** With both flags unset, zero DB reads occur (the hoisted identity block's `||` gate traced directly); the ledger-write block's flag check short-circuits before any side effect; the classification loop never introduces an early return, a variable collision, or a mutation of `signedAssessments` that could perturb the unconditional `deriveCredentialAndJusticeEvents`/`emitTrustEvents` sequence immediately following it; no INSERT path into `agent_provenance_gaps` is reachable from this slice (grep-confirmed across the whole diff); `/api/reason`'s response shape is untouched flag-off. |
| Sweep-flag independence + F-2's hard exclusion | **Clean.** Both new purge functions check `isProvenanceLedgerEnabled()` as their literal first statement, before any DB call; the handler calls them unconditionally, outside the trajectory-flag branch; `route.test.ts` proves independence in both flag-combination directions using call-count spies (not just deleted-count assertions, which could not distinguish "called but internally inert" from "not called"). `agent_provenance_gaps` has no signature-shaped column (the migration's own `V9` self-check enforces this live); the TypeScript types shaping a future writer (`ProvenanceLedgerLookupHit`'s deliberate omission of `signature_hash`, `ProvenanceClassificationOutcome`'s closed string-literal union) make smuggling a signature into that table structurally awkward for a future slice, not merely discouraged by comment. |

**Zero confirmed findings across all four dimensions.** No fold was needed. This satisfies the prompt's
Step 6 item 5 in full — the review is now independent, not first-hand-only, and every one of the five
load-bearing checks the prompt named was covered (identity-matching, fail-honest-vs-fail-open, the F-2
hard exclusion, flag-off byte-identity, and the sweep's genuine flag independence).

## Tests (all `npx tsx`, no Jest, per this session family's convention)

| File | Result |
|---|---|
| `provenance-classification.test.ts` (new) | 14/0 — all five outcomes, the eligibility boundary, precedence, the window edge (exactly-at / one-ms-over), a malformed-timestamp conservative refusal, the harness's own mismatch shape |
| `provenance-write-lookup-purge.test.ts` (new) | 33/0 — write (pair branch, credential branch, benign duplicate, real error); lookup (found, not-found, missing-table-as-error, real error); both purges (flag-off zero-touch, missing-table-benign, real-error-surfaces, real-delete-count) |
| `trajectory-retention-sweep/__tests__/route.test.ts` (rewritten) | 43/0 — 503/401 unchanged; the four flag-combination independence cases; three single-purge-failure independence cases + all-three-failing; the real-`DEFAULT_DEPS` no-throw-escape path |
| `provenance-ledger-store.test.ts` (slice 1, regression) | 18/0 — unaffected by this slice's additions |
| `emission-hooks.test.ts` (regression) | 19/0 — unaffected; flag-off byte-identity for the existing hooks still holds |
| `agent-assessment-history-store.test.ts` (regression) | 120/0 |
| `tsc --noEmit` | clean |
| `npm run build` | exit 0, all routes registered including `/api/reason` and the sweep cron |

## What is inherited by slice 3 and slice 5

- **Slice 3** (the served `provenance_gaps` field + the §10 attestation amendment) inherits nothing new
  from this slice's code — it reads from `agent_provenance_gaps`, which stays empty until slice 5. It
  should NOT need to touch anything built here.
- **Slice 5** (ENFORCE-phase switch-on) inherits `classifyProvenanceArtifact` from `website/src/lib/
  substrate/trust-core/provenance-classification.ts` **directly, unchanged** — the mentor's stated reason
  for building it pure. Slice 5's wiring at `emitAccreditationTrustEvents` should call the SAME function
  (already imported there) and, on a non-`'permit'` outcome, (a) skip minting that artifact's trust event
  and (b) write one `agent_provenance_gaps` row per write using the GAP-2 precedence this function's
  outcome ordering already encodes — no new precedence logic needs deriving, since `classifyProvenance
  Artifact`'s check order (supplied → mismatch → window → permit) already returns the single most-severe
  applicable reason for a given artifact; slice 5's cross-artifact reduction (SCOPE §5.4/GAP-2) is a
  reduction over the SET of per-artifact outcomes this function already produces, not a new comparison.
  Slice 5 also inherits `lookupProvenanceLedgerEntry` unchanged, and the fail-honest discipline (an I/O
  error must never be silently treated as a refusal — SCOPE §5) is already enforced at the call site in
  `emission-hooks.ts`, which slice 5 should keep rather than loosen.

## Carried (founder-walked; nothing pre-approved)

**Step 6, item 6** — TEST-first, then production activation:

1. No schema change needed (slice 1 already applied both migrations to TEST and production).
2. Set `SUBSTRATE_PROVENANCE_LEDGER_ENABLED=true` in Vercel (TEST environment first, per this arc's
   standing practice, then Production) and redeploy.
3. Live smoke: a real credential-bearing consult on `/api/reason` with signing on should land exactly one
   new `agent_provenance_ledger` row, `identity_kind`/`layer1_source` matching the calling credential's
   shape. Verify via a direct SQL read (service-role, since the table is service-role-only by RLS).
4. Confirm the sweep's JSON response reports `deleted.provenance_ledger` and `deleted.provenance_gaps`
   (both `0`, since the tables start empty at activation) alongside `flag_enabled.provenance_ledger:
   true`.
5. Watch the `[trust-core][provenance-ledger] classify ...` log lines accumulate in Vercel's function
   logs — this is the founder-run readiness-check input SCOPE §9's C2 threshold needs (two consecutive
   weeks of 100% ledger-eligible-artifact resolution before slice 5 can switch on enforcement for any
   agent beyond the already-excluded harness).

## Constraints honoured

- **Record-only, confirmed.** No path in this slice can refuse an accreditation write or write to
  `agent_provenance_gaps` — verified by review, above, and by the unchanged pass rate of every existing
  accreditation-route test.
- **`trust-record-payload.ts` / `TRUST_RECORD_ENVELOPE` untouched** — grep-confirmed; slice 3's job.
- **Concurrency.** `ListAgents` showed 13 peer sessions/agents at open (5 interactive `sagereasoning-*`
  plus 8 idle/offline cloud and Remote-Control sessions). This session committed path-scoped, ran `git
  status` before and immediately before staging, and left every file this session did not author
  untouched — `website/src/data/environmental-context.json`, `.husky/pre-commit`,
  `supabase/migrations/20260413_logging_refactor_gap4.sql`, `api/api-keys-schema.sql`,
  `supabase/migrations/20260411_agent_handoffs.sql`, and `website/supabase-mentor-gaps-migration.sql`
  were all excluded from this session's commit as concurrent peer-session work.
- **This session's commit also carries slice 1's own uncommitted work** (both migration files, `provenance-
  ledger-store.ts`'s R17 functions and its slice-1 test, and the R17 wiring edits to `/api/user/delete`,
  `/api/user/export`, `/api/credential/erase`, and `consumer-erasure.ts`) — found uncommitted at this
  session's open (`git status` showed them all as `??`/untracked despite the slice-1 close document
  describing slice 1 as CLOSED). These are the SAME feature's earlier, already-ruled slice, not concurrent
  peer-session work, and this slice's own build depends on them being present in the tree — they are
  included in this session's commit rather than left stranded uncommitted a second time.

*End of close.*
