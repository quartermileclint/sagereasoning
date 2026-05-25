# Session Close — 2026-05-24 — Whole-System Test: L7 Single-Loop Proof (Build-Only, PR1)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-standard` — **Standard** risk. Test scaffolding under `website/scripts/` (outside `src/`, never bundled, never deployed); runs against a TEST env only. **No production code / schema / env / deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged (harness writes no DB rows; bridge step imports only the pure bridge).
**Date:** 2026-05-24.
**Branch:** worked on **`main`** (Pre-condition-2; clean working tree, no `.git/index.lock`). AI did **no** git operations.
**Scope elected at open:** **(b) Build-only** (test env not yet standing) + **API-key (`X-Api-Key`)** auth path for `/api/reason`.

## What this session did

Built the **L7 single-loop-proof harness** (PR1) under `website/scripts/whole-system-harness/` and ran the **Seam-2 bridge `tsx` step green in build-only mode — 20/20 assertions, exit 0** — capturing the run ledger to `data-room/05_outputs/`. The full project `tsc --noEmit` is clean (0 errors), so the **live** path (which the founder runs once the test env is standing) is type-clean and ready. The harness is **Wired**, not yet Verified as a whole — the live genuine→200 loop is deferred.

Seven new files: `run-l7.ts` + `lib/{assertions,http-client,bridge-step,fixtures,scenario-input,capture}.ts` + `README.md`. Plus the build-only run ledger (`.json` + `.md`) in `data-room/05_outputs/`.

## Two refinements surfaced (PR13 — both folded into the harness + README)

1. **`deriveReceiptId` returns `'rcpt_' + SHA-256(signature)`, not a bare SHA-256.** The design docs phrased the assertion as `receipt_id === SHA-256(signature)`; the real bridge code prefixes `rcpt_`. The bridge-step assertion was written to match the real code (and verified two independent ways). *Diagnostic-certain (code-read + run).*
2. **The genuine→200 write body is a complete accreditation write**, not just `{ provenance }`: `{ kind:'seed', profile: createCarriedProfile(agent_id), provenance: { signed_assessments:[…] } }`. The route runs `validateWriteBody` (which needs `kind` + a `profile` with `agent_id`/`accreditation_record`/`regressing_check_count`) **before** the provenance gate, so a `{ provenance }`-only body would 400 first. The live path builds the full body via the reused, pure `createCarriedProfile`. *Diagnostic-certain (code-read).*

## L7 assertion coverage (this build)

- **(a) genuine→200 credential write** — **deferred** to the founder live run (test env not standing).
- **(b) no-practice disclaimer string** — **pending Priority 4** (text not written); recorded as pending, not failed.
- **(c) Seam-2 bridge `receipt_id === 'rcpt_' + SHA-256(signature)` + well-formed `EvaluatedAction`** — **Verified** (20/20).

## Decisions Made

- `D-L7-SINGLE-LOOP-PROOF-BUILD-2026-05-24` appended (+~45 lines). L7 harness built; bridge step green (build-only); API-key path elected; build-only scope; ledger in `05_outputs/`. Standard risk; no code/env/deploy to production.

## Status Changes

| Item | Old | New |
|---|---|---|
| L7 harness (`website/scripts/whole-system-harness/`) | Designed | **Wired** (full L7 reaches Verified at the founder live run) |
| Seam-2 bridge `tsx` step (L7 assertion c) | Designed | **Verified** (build-only, 20/20) |
| L7 assertion (a) genuine→200 | Designed | deferred to live run |
| `data-room/05_outputs/` | README only | first run ledger present (build-only PASS) |

## Next Session Should

**Founder, between sessions:** stand up the test environment per `data-room/04_test_brief/test-env-standup-checklist.md` (Step 7 positive control = 200), then run the **deferred L7 live loop** (commands in Founder Verification below) to move L7 to **Verified** end-to-end — the first 0h-criterion-4 value demonstration (agent-developer audience). **Then** a follow-up `code-standard` session builds out **L1–L6 + Combination 1/2** on the proven pattern (one at a time). **C2 distress perimeter** stays deferred to a **Critical** session; **Combination 2** stays blocked on Priority 4.

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`):**
- `website/scripts/whole-system-harness/run-l7.ts`
- `website/scripts/whole-system-harness/lib/assertions.ts`
- `website/scripts/whole-system-harness/lib/http-client.ts`
- `website/scripts/whole-system-harness/lib/bridge-step.ts`
- `website/scripts/whole-system-harness/lib/fixtures.ts`
- `website/scripts/whole-system-harness/lib/scenario-input.ts`
- `website/scripts/whole-system-harness/lib/capture.ts`
- `website/scripts/whole-system-harness/README.md`
- `data-room/05_outputs/L7-build-only-2026-05-24T06-28-57-267Z.json`
- `data-room/05_outputs/L7-build-only-2026-05-24T06-28-57-267Z.md`
- `operations/decision-log.md` (modified)
- `operations/handoffs/founder/2026-05-24-L7-single-loop-proof-build-close.md` (this close)

**Do NOT stage:** `website/tsconfig.tsbuildinfo` (modified by the AI's `tsc` run — a harmless incremental-build cache; optional host-side restore `git checkout -- website/tsconfig.tsbuildinfo`).

**Production state at session close:** **UNCHANGED.** No code/schema/env/deploy touched. The provenance gate remains **Live** (`SUBSTRATE_PROVENANCE_GATE_ENABLED='true'`); its rollback is unchanged (unset the flag + redeploy). `/api/reason` byte-identical to pre-A7 cutover.

## Open Questions

- **Test-env standup is founder-performed** and is the hard prerequisite for the deferred live run (Supabase/Vercel/key access the AI cannot reach).
- **L7 assertion (b)** is blocked on Priority 4 (disclaimer text).
- **Aggregate-faithfulness (M-6)** is not proven by the genuine→200 path (deferred; ADR revisit-condition 1).

## Founder Verification

**Re-run the build-only proof (no env needed) and confirm the harness typechecks:**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx scripts/whole-system-harness/run-l7.ts
npx tsc --noEmit
```
Expected: `20 passed, 0 failed`, `Result: PASS`, a new ledger under `data-room/05_outputs/`; `tsc` prints nothing (0 errors).

**Deferred live run (once the test env is standing — Step 7 positive control = 200):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
# Terminal 1: dev server reading the TEST .env.local (checklist Step 6)
npm run dev
# Terminal 2 (set the four WSH_ vars to your test credentials first):
WSH_BASE_URL=http://localhost:3000 \
WSH_API_KEY=<test api key> \
WSH_ASSENT_TOKEN=<test sr_assent_ token> \
WSH_AGENT_ID=<test agent_id> \
npx tsx --env-file=.env.local scripts/whole-system-harness/run-l7.ts --live
```
Expected: `/api/reason` → 200; genuine credential write → 200; bridge step PASS. A `403 no_examination` on genuine input = a key-pair mismatch ("false 403") — regenerate the test key-pair together (checklist Step 3).

**Commit (host-side, stage by name):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/scripts/whole-system-harness/run-l7.ts \
  website/scripts/whole-system-harness/lib/assertions.ts \
  website/scripts/whole-system-harness/lib/http-client.ts \
  website/scripts/whole-system-harness/lib/bridge-step.ts \
  website/scripts/whole-system-harness/lib/fixtures.ts \
  website/scripts/whole-system-harness/lib/scenario-input.ts \
  website/scripts/whole-system-harness/lib/capture.ts \
  website/scripts/whole-system-harness/README.md \
  data-room/05_outputs/L7-build-only-2026-05-24T06-28-57-267Z.json \
  data-room/05_outputs/L7-build-only-2026-05-24T06-28-57-267Z.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-24-L7-single-loop-proof-build-close.md"
git commit -m "L7 single-loop-proof harness (PR1): build-only bridge tsx step green (20/20); API-key path; live loop ready+deferred (D-L7-SINGLE-LOOP-PROOF-BUILD). code-standard/Standard; no production code/env/deploy."
```
Then push via GitHub Desktop. **No Vercel impact** (test scaffolding is never deployed). (If GitHub Desktop reports a lock: close it, `rm -f .git/index.lock`, retry.)

## Cross-references

- `/operations/handoffs/founder/2026-05-24-whole-system-harness-design-close.md` (predecessor close)
- `/operations/handoffs/founder/2026-05-24-L7-single-loop-proof-build-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `/operations/decision-log.md` — `D-L7-SINGLE-LOOP-PROOF-BUILD-2026-05-24` (+ predecessors `D-WHOLE-SYSTEM-HARNESS-DESIGN-2026-05-24`, `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`, `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`)
- `data-room/04_test_brief/{orchestrator-harness-design,scenario-matrix,test-flag-config,test-env-standup-checklist}.md`
- `data-room/05_outputs/L7-build-only-2026-05-24T06-28-57-267Z.{json,md}` (the run ledger)
- `website/scripts/whole-system-harness/` (the harness)

*End of session close. Stabilised to a known-good state: production unchanged; the L7 harness is Wired, its Seam-2 bridge step Verified (build-only, 20/20), and the live genuine→200 loop is type-clean and ready to run once the founder stands up the test environment. Twelve files staged for a single host-side commit; the build cache is the only modified tracked file and is excluded by name.*
