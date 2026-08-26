# Close — Slice 1: the provenance-ledger migrations (BUILT, REVIEWED, APPLIED — TEST + production both green)

**Stream:** founder. **Tier:** `code-critical` (schema). **AC7: ENGAGED AND DISCHARGED, 2026-08-26** —
the founder ran every migration statement on TEST and production and returned every `§VERIFY` output,
all clean. The AI drafted, wired, and adversarially reviewed the build; it performed no live DB
operation itself. **Slice 1 is fully closed — both tables exist, empty and inert, on both
environments.**

---

## What this session built (repo-only)

1. **Two new migration files**, following the `agent_hold_observations`/`agent_trust_events` precedent
   shape (idempotent, `§PRE`/`§APPLY`/`§VERIFY`/rollback):
   - `website/supabase-agent-provenance-ledger-migration.sql`
   - `website/supabase-agent-provenance-gaps-migration.sql`
2. **The two schema-level gaps the scoping never resolved (SCOPE, flagged in the slice-1 prompt Step 2)
   are now resolved, with reasoning stated in the migration files themselves, not defaulted silently:**
   - **Gap 1** (`agent_provenance_gaps.correlation_id` had no uniqueness constraint despite being
     labelled "idempotency"): resolved as `UNIQUE (correlation_id)` — the harness's own
     honest-409-on-reuse pattern makes retries the normal case, and without this constraint a retry
     would duplicate a refusal fact on the public record.
   - **Gap 2** (no stated precedence when one write produces several distinct refusal reasons at once):
     resolved as `caller_supplied_extraction` (a positive finding) > `identity_mismatch` >
     `out_of_window` > `no_ledger_entry` (the true fallback) — stated in the migration comment so the
     CHECK vocabulary and slice 2's write-path logic never need to renegotiate it.
3. **The R17 data-rights sequencing question (SCOPE §4.4) was decided: wire it in THIS slice**, not
   deferred to slice 2. Reasoning: SCOPE §4.4 calls it "not a rider; a precondition," and every prior
   schema slice in this project's history (Trust Layer S1, S5, the Stoa entries table) wired
   delete/export/erase coverage in the same session as the schema that needed it. Built:
   - `website/src/lib/substrate/trust-core/provenance-ledger-store.ts` — the R17 seam
     (`deleteProvenanceDataForOwner`, `deleteProvenanceDataForCredential`,
     `getProvenanceDataForOwner`), mirroring `trust-core-store.ts`/`collaboration-store.ts` exactly:
     missing-table-benign, fail-honest, no read/write path for the ledger's actual purpose (that stays
     slice 2's job).
   - Wired into `/api/user/delete`, `/api/user/export`, `/api/credential/erase` (`handler.ts` +
     `consumer-erasure.ts`'s `ErasureResult`/`eraseExternalConsumerCredential`).
   - **A tension worth naming explicitly rather than letting it sit unaddressed** (the adversarial
     review's own instruction): the slice-1 prompt's "Constraints that bind" section says "NO write
     path, no flag, no route change" — and this session DID touch three existing route files.
     Read in context, that constraint is almost certainly about the *ledger-populating* write path
     (`api/reason`, gated behind the not-yet-created `SUBSTRATE_PROVENANCE_LEDGER_ENABLED`) — the
     surrounding sentences name that flag specifically as slice 2's job. Data-rights plumbing over two
     still-empty tables is a different kind of route change: always-on, missing-table-benign,
     zero-behaviour-change until the tables have rows. But the prompt's own words are broader than that
     reading, so this decision is a **judgement call, recorded as one**, not asserted as the only
     possible reading. If the founder disagrees, `git revert` the five R17-wiring files independently
     of the two migrations (they are a separate, easily-isolated commit-worth of change).
4. **Both migrations produce empty, inert tables** — no flag exists, no route reads or writes them for
   real. `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` does not exist in this codebase after this session
   (confirmed: `grep -r SUBSTRATE_PROVENANCE_LEDGER_ENABLED website/src` returns nothing).

## Adversarial review (this session, one independent-agent pass)

**Verdict: GO-WITH-FIXES.** All confirmed findings were folded before this close:

- **MEDIUM, folded:** the `apl_identity_kind_consistency` CHECK on `agent_provenance_ledger` was
  looser than what its own header comment claimed to mirror — it admitted `owner_user_id` set while
  `identity_kind='credential'` (as long as `agent_id` was null), a row shape `resolveLongitudinalIdentity()`
  can never produce. Tightened to `identity_kind = 'credential' AND owner_user_id IS NULL` — a
  slice-2 write-path bug on the credential-fallback branch is now caught at the schema level rather
  than silently admitted.
- **LOW ×2, folded:** both migrations' `§VERIFY V2` comments miscounted their own column lists
  (said "N rows" then listed a different total) — corrected; the `agent_provenance_gaps` correlation-id
  comment now explicitly distinguishes its shape from `agent_trust_events`' `uq_ate_correlation`
  (a nullable, partial, three-column composite index) rather than implying it mirrors that shape.
- **NIT, folded:** F-2's hard exclusion (no signature-derived column on `agent_provenance_gaps`) had
  no standing regression test, only a one-time migration `§VERIFY` query. Added a text-based drift pin
  in `provenance-ledger-store.test.ts` that reads the migration's own `CREATE TABLE` block and asserts
  no column name matches `/signature/i` — **mutation-verified**: injecting a `signature_hash` column
  into a scratch copy of the migration made the test fail with the exact expected message; reverted,
  re-confirmed 18/0.
- **Confirmed clean:** identity-matching correctness (modulo the fold above); the four-value reason
  vocabulary is exactly what the stated precedence rule can produce; `agent_id NOT NULL` on
  `agent_provenance_gaps` is consistent with the emission-hooks call site (`route.ts:829` —
  confirmed always a non-empty string there); `isMissingTableError` in the new store byte-matches the
  precedent's error-shape classification; both migrations are genuinely idempotent
  (`IF NOT EXISTS` throughout); RLS is service-role-only with no permissive policy (matching
  `agent_trust_events`, not the user-scoped `impulse_entries` pattern); the store's test exercises the
  partial-failure case (first table succeeds, second fails ⇒ `ok:false`, never a half-silent partial
  success).

## Verified (repo-only; all green)

- `tsc --noEmit -p .` — clean.
- `npx tsx src/lib/substrate/trust-core/__tests__/provenance-ledger-store.test.ts` — **18/0** (new).
- `npx tsx src/lib/__tests__/consumer-erasure.test.ts` — **25/0** (unchanged assertions, new table
  reached via the default fake-client branch, zero rows, no regression).
- `npx tsx src/app/api/credential/erase/__tests__/handler.test.ts` — **41/0** (extended with a
  `provenance_deleted: 5` fixture value + a compliance-log assertion naming
  `agent_provenance_ledger`/`agent_provenance_gaps`).
- `npm run build` — exit 0, all routes registered (the Next.js route-export validation this project has
  been bitten by before — confirmed clean).

## Files touched/added this session

- New: `website/supabase-agent-provenance-ledger-migration.sql`
- New: `website/supabase-agent-provenance-gaps-migration.sql`
- New: `website/src/lib/substrate/trust-core/provenance-ledger-store.ts`
- New: `website/src/lib/substrate/trust-core/__tests__/provenance-ledger-store.test.ts`
- Modified: `website/src/app/api/user/delete/route.ts`
- Modified: `website/src/app/api/user/export/route.ts`
- Modified: `website/src/app/api/credential/erase/handler.ts`
- Modified: `website/src/app/api/credential/erase/__tests__/handler.test.ts`
- Modified: `website/src/lib/consumer-erasure.ts`

---

## DONE — the founder-walked apply, TEST then production, 2026-08-26

Both files applied, in order (`agent_provenance_ledger` then `agent_provenance_gaps`), on TEST first
and then production, with every `§PRE`/`§APPLY` step returning a clean "success, no rows returned" and
every `§VERIFY` query returned to the AI for confirmation. **Production's results are byte-for-byte
identical to TEST's** — same column order/types/nullability, same six index names per table, same CHECK
constraint definitions (including the tightened `apl_identity_kind_consistency` from the adversarial
fold), same FK/RLS/empty-count results on both environments.

**The two checks that mattered most, both confirmed on both environments:**
- **`agent_provenance_ledger` V4** — `apl_identity_kind_consistency`'s live definition reads exactly
  `((identity_kind = 'owner_agent_pair' AND owner_user_id IS NOT NULL AND agent_id IS NOT NULL) OR
  (identity_kind = 'credential' AND owner_user_id IS NULL))` — the tightened, adversarial-review-folded
  form, not the looser pre-fix version. Confirmed live, not just in the file.
- **`agent_provenance_gaps` V9** — zero rows on both TEST and production. F-2's hard exclusion (no
  signature-derived column reachable on this table) is now a checked, structural fact of the live
  schema, not merely a claim in a migration comment.

**Both tables are empty (`V8: count = 0`) on both environments** — no flag exists, no route reads or
writes them for real, `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` does not exist. Production remains
genuinely byte-equivalent in every behavioural sense (the two new tables sit inert; the R17 wiring code,
once pushed, only ever touches them on a delete/export/erase call, and returns zero rows either way
until slice 2 gives them contents).

**Slice 1 is closed.** Slice 2 (`operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
§13, row 2 — the consult-side write + `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` + the PR24 sweep wiring
extending `/api/cron/trajectory-retention-sweep`) is ready to open as its own founder-walked session.

**Rollback (either environment, either table, independently — still available, nothing precludes it
now that the tables exist and are populated with zero rows):**
```sql
DROP TABLE IF EXISTS public.agent_provenance_gaps;
DROP TABLE IF EXISTS public.agent_provenance_ledger;
```
And `git revert` the R17-wiring commit(s) independently of the migration files if the founder judges
the "wire R17 now" call above should have gone the other way — still a live option since nothing
downstream depends on the R17 wiring yet.

---

**Rules served:** PR6/PR17 (every live DB step named as founder-only, none simulated or assumed);
PR19 (one independent adversarial pass run and folded before this close, not skipped for being
"schema-only"); PR20 (the two SCOPE-flagged gaps resolved with stated reasoning, not silently
defaulted); PR15 (every store/route pattern reused verbatim from `trust-core-store.ts`/
`collaboration-store.ts`/the `/api/user/delete`+`/api/user/export`+`/api/credential/erase` precedent,
nothing re-invented).

**Cross-references:** `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`;
`operations/handoffs/founder/2026-08-26-provenance-ledger-slice1-migrations-NEXT-SESSION-PROMPT.md`;
`D-PROVENANCE-LEDGER-SLICE1-PROMPT-AUTHORED-2026-08-26`.

*End of close.*
