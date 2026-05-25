# Session Close — 2026-05-25 — L1–L6 Clean Scenarios Built (L1, L2-incomplete, L3, L5)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-standard` — **Standard** risk. Test scaffolding under `website/scripts/whole-system-harness/` (outside `src/`, never bundled, never deployed); runs against the **TEST** environment only. **No production code / schema / env / deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged.
**Date:** 2026-05-25.
**Branch:** `main` (AI did no git operations).

## What this session did

Opened under the protocol, verified the test env is still standing (`.env.local` has 0 production refs / 2 test refs; the relevant flags present; `SUBSTRATE_R20A_GATE_ENABLED` correctly absent), then built the **clean positive scenarios** on the proven L7 pattern. Per the two opening decisions (you elected **sibling runners** + **clean scenarios first**), this session delivered **L1, L2-incomplete, L3, L5** as sibling runners plus the shared `lib/` extensions.

Two diagnostic-certain findings (code-read) re-shaped the plan and are why L2-complete/L4/L6 were deferred: (1) the five-slot `DiscoveredPurpose` is built **only** by the admin-only `POST /api/calling/approve` (the harness holds no admin credential); (2) the five-spec reaches Layer 1 as a `Layer1Schema.discovered_purpose` field on the plugin-auth path, **not** a body field on `/api/reason`. The four clean scenarios need neither.

**Limitation (stated plainly):** the build sandbox cannot reach your dev server (network allowlist), so I could not run the live HTTP scenarios myself — exactly as with L7. I **import-checked every runner in build-only/dry-preview** (all exit 0) and **re-confirmed the L7 build-only regression (20/20)** after the `lib/` edits. The **live runs and the `Verified` stamp are yours**, between sessions (the 0c framework). The Reflect/Calling drivers are **adaptive** (they answer whatever step the engine surfaces, including re-prompts / FD-R1 / RS-4) so a single live run reaches a terminal without a brittle fixed script.

## Decisions Made

- `D-L1-L5-CLEAN-SCENARIOS-BUILD-2026-05-25` appended. Built L1 / L2-incomplete / L3 / L5 as sibling runners + extended `lib/` (`postCalling`/`postReflect`, generalised `capture`, new adaptive `reflect-driver`). L2-complete / L4 / L6 deferred pending the approval-seam decision. Standard risk; no production touched.

## Status Changes

| Item | Old | New |
|---|---|---|
| `run-l1.ts` (L1 — Reasoning alone) | — | **Wired** (import-clean; Verified at your live run) |
| `run-l2.ts` (L2 — Calling alone, incomplete-specs variant) | — | **Wired** (import-clean; Verified at your live run) |
| `run-l3.ts` (L3 — Reflect alone) | — | **Wired** (import-clean; Verified at your live run) |
| `run-l5.ts` (L5 — Reasoning + Reflect, Seam S3) | — | **Wired** (import-clean; S3 Verified at your live run + DB query) |
| `lib/reflect-driver.ts` (adaptive Reflect driver) | — | **Wired** (build-only import-clean) |
| `lib/http-client.ts` (+ postCalling / postReflect) | Verified (L7) | **Verified** (L7 regression re-confirmed) |
| `lib/capture.ts` (generalised to any scenario) | Verified (L7) | **Verified** (L7 regression re-confirmed) |
| L2-complete / L4 / L6 | Scoped | **Scoped** (deferred — approval-seam decision) |

## Next Session Should

Two threads, your choice of order:

1. **Run the four clean scenarios live** (the Founder Verification block below) to move L1 / L2-incomplete / L3 / L5 from **Wired → Verified**. Each is an independent checkpoint; a failure in one doesn't touch the others. This completes more 0h-criterion-4 value demonstrations (a reasoning-alone, a calling-incomplete, a reflect-alone, and a reasoning→reflect S3 loop).
2. **The L2-complete / L4 / L6 follow-up** — a focused session that first settles the **approval-seam decision**: drive the real admin `POST /api/calling/approve` over HTTP (you'd supply an admin Supabase session token), **or** a pure `tsx` step on `buildDiscoveredPurpose` + `validateLayer1Schema` (mirrors the existing bridge step; no admin credential). My recommendation is the pure `tsx` step for the first pass; the admin-HTTP route is higher fidelity if you want the gate exercised end-to-end. Once chosen, L4 (Seam S1) and L6 (full suite + the bridge + exit_path loop-close) follow.

**Still out of scope:** Combination 2 (blocked on Priority 4 disclaimer text); C2 distress perimeter (Critical-tier, a separate Critical session).

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`):**
- `website/scripts/whole-system-harness/` (new: `run-l1.ts`, `run-l2.ts`, `run-l3.ts`, `run-l5.ts`, `lib/reflect-driver.ts`; modified: `lib/http-client.ts`, `lib/capture.ts`, `README.md`)
- `operations/decision-log.md` (the new `D-L1-L5-CLEAN-SCENARIOS-BUILD` entry)
- `operations/handoffs/founder/2026-05-25-L1-L5-clean-scenarios-build-close.md` (this close)
- **If not yet committed from the predecessor session:** the L7 files (`run-l7.ts`, `smoke-negatives.ts`, `mint-test-credentials.ts`, the original `lib/*`, the L7 `05_outputs` ledgers, `.gitignore`) — staging the whole `website/scripts/whole-system-harness/` directory by name will sweep these in too; or run the L7 close's commit first.

**Do NOT stage:** `website/.env.local*` (gitignored — test config + prod backup; secrets); `website/tsconfig.tsbuildinfo` (build cache); `website/src/data/environmental-context.json` (your weekly refresh — unrelated).

**Production state at session close:** **UNCHANGED.** No production code / schema / env / deploy touched. The provenance gate remains **Live** (rollback unchanged + independent). `/api/reason` byte-identical to pre-A7 cutover. Local dev still points at the **test** project.

## Open Questions

- **L2-complete / L4 / L6** — deferred pending the approval-seam decision (above).
- **L1 (f) no-practice disclaimer** — pending Priority 4 (recorded as a note in the L1 ledger, not failed; shares the L7(b) / Combination-2 disposition).
- **L5 FK-seed branch** — only exercised if `agent_accreditation` for `wsh-test-agent-L7` is absent at run time (run the teardown SQL first); otherwise the feed updates the existing row (still a valid S3 write).

## Founder Verification

**Run the four clean scenarios live (the dev server must be up against the TEST env, `WSH_*` exported — same credentials as the L7 run).**

Terminal 1 (test env dev server), if not already up:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npm run dev
```
Quick re-confirm the test env: open `http://localhost:3000/api/public-key` → `key_id` should be `substrate-layer2-test`.

Terminal 2 — export the `WSH_*` vars (the values from `mint-test-credentials.ts`, same as L7), then run **one at a time** (run each on its own line; don't paste as a block):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"

npx tsx scripts/whole-system-harness/run-l1.ts --live
#   expect: "5 passed, 0 failed"  →  Result: PASS

npx tsx scripts/whole-system-harness/run-l3.ts --live
#   expect: Result: PASS  (multi-turn; Q1–Q4 make Sonnet calls, so this one takes longer)

npx tsx scripts/whole-system-harness/run-l2.ts --live
#   expect: Result: PASS  (the dialogue terminates at null_result; the Calling engine makes no LLM call)
```
For **L5**, to exercise the FK-seed branch, first run this one line in the **TEST project SQL editor**:
```
delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';
```
then:
```
npx tsx scripts/whole-system-harness/run-l5.ts --live
#   expect: Result: PASS; the runner then prints the S3 DB-verify SQL
```
**L5 S3 DB verify** — run in the TEST project SQL editor after the L5 run:
```
select * from public.agent_accreditation  where agent_id='wsh-test-agent-L7';
select * from public.evaluated_actions     where agent_id='wsh-test-agent-L7' order by evaluated_at desc limit 5;
select * from public.grade_history         where agent_id='wsh-test-agent-L7' order by occurred_at desc limit 5;
```
Expect: an `agent_accreditation` row present (seeded if you ran the teardown, else updated); ≥1 `evaluated_actions` row from this session; the `senecan_grade` reflects the engine's decision (not a hand-set value); a per-domain proximity present.

Each `--live` run writes a ledger to `data-room/05_outputs/<scenario>-live-<timestamp>.{json,md}` — stage those alongside the code when you commit.

**Stop the dev server** when done: `Ctrl + C` in Terminal 1. **Restore production local dev** when all testing is done:
```
cp "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/.env.local.prod-backup-2026-05-24" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/.env.local"
```

**Commit (host-side, stage by name):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/scripts/whole-system-harness/ \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-25-L1-L5-clean-scenarios-build-close.md"
# after the live runs, also: git add data-room/05_outputs/
git commit -m "Whole-system test: build L1/L2-incomplete/L3/L5 clean scenarios on the L7 pattern (sibling runners + adaptive reflect-driver; lib http-client/capture extended) (D-L1-L5-CLEAN-SCENARIOS-BUILD). code-standard/Standard; no production code/env/deploy."
```
Then push via GitHub Desktop. **No Vercel impact** (test scaffolding is never deployed). (If GitHub Desktop reports a lock: close it, `rm -f .git/index.lock`, retry.)

## Cross-references

- `/operations/handoffs/founder/2026-05-25-L7-live-verification-test-env-standup-close.md` (predecessor close — read its Continuation addendum)
- `/operations/decision-log.md` — `D-L1-L5-CLEAN-SCENARIOS-BUILD-2026-05-25` (+ the three L7 / harness predecessors)
- `data-room/04_test_brief/scenario-matrix.md` (L1–L6 rows) + `data-room/04_test_brief/test-brief.md` §B
- `website/scripts/whole-system-harness/README.md` (the L1–L6 build section)
- `website/scripts/whole-system-harness/{run-l1,run-l2,run-l3,run-l5}.ts` + `lib/reflect-driver.ts`

*End of session close. Stabilised to a known-good state: four clean-scenario runners built + import-clean (build-only), L7 regression re-confirmed, production unchanged, local dev still on the test project (restore command above). L2-complete / L4 / L6 await the approval-seam decision.*

---

## Verification Outcome (2026-05-25, same day — founder live runs)

All four clean scenarios **ran green live** against the test env:

| Scenario | Result | Ledger |
|---|---|---|
| L1 — Reasoning alone | **PASS (5/5)** | `data-room/05_outputs/L1-live-2026-05-25T07-43-…` |
| L2 — Calling, incomplete-specs | **PASS (4/4)** | `…/L2-live-2026-05-25T07-46-…` |
| L3 — Reflect alone | **PASS** (after the env fix below) | `…/L3-live-2026-05-25T08-06-…` (07-44 = pre-fix FAIL, kept as evidence) |
| L5 — Reasoning + Reflect (S3) | **PASS** (after the env fix below) | `…/L5-live-2026-05-25T08-08-…` (07-47 = pre-fix FAIL, kept as evidence) |

**Test-env schema gap found + fixed (diagnostic-certain).** L3/L5 first failed with a 503 at the Reflect *completion* step: the test project's `sage_reflect_sessions` was missing the A1 cross-session columns (`complexity`, `calibration_all_correct`) — `supabase-sage-reflect-a1-cross-session-migration.sql` had never been applied to the structure-only clone (it isn't live in production either). Founder applied that migration (additive / idempotent / reversible) to the **TEST** project; **production untouched**. L3/L5 then passed. **The test project now carries the A1 columns** — recorded here so a future session doesn't re-trip it.

**S3 (Seam 3) confirmed in the DB:** `agent_accreditation` and `evaluated_actions` both returned rows for `wsh-test-agent-L7` (the feed wrote through the engine — the seam). The `grade_history` verify query's order column was corrected `created_at → occurred_at` (the table's real column) in `run-l5.ts` + this close.

**Status now:** L1 / L2-incomplete / L3 / L5 — **Verified** (was Wired). L7 — Verified (unchanged). L2-complete / L4 / L6 — Scoped (deferred, approval-seam decision).

*End of verification addendum.*
