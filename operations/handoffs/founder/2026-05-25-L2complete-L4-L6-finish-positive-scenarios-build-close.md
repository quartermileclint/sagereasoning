# Session Close — 2026-05-25 — L2-complete / L4 / L6 Built (Positive Scenarios Completed)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-standard` — **Standard** risk. Test scaffolding under `website/scripts/whole-system-harness/` (outside `src/`, never bundled, never deployed); runs against the **TEST** environment only. **No production code / schema / env / deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged.
**Date:** 2026-05-25.
**Branch:** `main` (AI did no git operations).

## What this session did

Opened under the protocol; confirmed the test env is standing (`.env.local` — 0 prod refs / 2 test refs; on `main`; tree clean; no `index.lock`). Settled the **opening approval-seam election** with you: **Option A — the pure `tsx` step** (no admin credential, no new env flags). Then built the three deferred **positive** scenarios on the proven harness pattern, completing the positive matrix L1–L7:

- **L2-complete** — drive `/api/calling` (Bearer) to the Hard Gate (`awaiting_approval`), then assemble the five-slot `DiscoveredPurpose` with the exported pure `buildDiscoveredPurpose()` over the session's response history.
- **L4 (Seam S1)** — thread that five-spec into a `Layer1Schema` and run the real `validateLayer1Schema()`; assert all five slots survive (no dropped/mis-slotted slot).
- **L6 (full suite)** — S1 (build + survival) → S2 (`/api/reason` → genuine credential write 200 + the Seam-2 bridge step) → S3 (Reflect → engine-decided profile read-back) → S4 (consume `exit_path`; the re-entered product returns 200 — the loop closes).

Three load-bearing claims were re-verified by my own code-read (diagnostic-certain), not inherited: `buildDiscoveredPurpose` exported+pure (`calling-service.ts:232`); `validateLayer1Schema` exported (`layer1-extractor.ts:817`); `/api/calling/approve` is `requireAdmin`-gated. The complete-path driver answers were authored against `engine.ts`'s lexical marker sets to walk Q1→Q2→Q3→Q4→Q5→hard_gate with **no** diagnostic re-prompt and **no** Q1→Q5 jump.

**What I verified myself (the pure cores need no network, so they ran in the sandbox):** dry-preview assertions green — **L2-complete 10/10, L4 7/7, L6 build-only 37/37** — and **full-project `npx tsc --noEmit` → EXIT 0** (the pre-commit + Vercel check; last session's "`tsx` passes but `tsc` fails" trap is ruled out this time).

**Limitation (stated plainly):** the build sandbox cannot reach your dev server (network allowlist), so the **live HTTP runs and the `Verified` stamp are yours**, between sessions (0c framework). For L2-complete/L4 only the live Calling drive is deferred (the five-slot assembly + Layer-1 survival already ran here); for L6 the S2-write / S3 / S4 legs are the live part.

## Decisions Made

- `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25` appended. Built L2-complete / L4 / L6 via Option A (pure `tsx`); two new shared `lib/` modules; sandbox dry-preview green + `tsc` clean. Standard risk; no production touched.

## Status Changes

| Item | Old | New |
|---|---|---|
| `run-l2-complete.ts` (L2-complete — approved path) | Scoped | **Wired** (sandbox dry-preview 10/10; Verified at your live run) |
| `run-l4.ts` (L4 — Seam S1) | Scoped | **Wired** (sandbox dry-preview 7/7; Verified at your live run) |
| `run-l6.ts` (L6 — full suite S1–S4) | Scoped | **Wired** (build-only 37/37; Verified at your live run) |
| `lib/calling-driver.ts` (adaptive drive to Hard Gate) | — | **Wired** (sandbox import + dry-preview clean) |
| `lib/discovered-purpose-asserts.ts` (shared five-slot + survival asserts) | — | **Wired** (sandbox dry-preview clean) |
| Positive scenario coverage (L1–L7) | partial | **complete** (built; L2-complete/L4/L6 → Verified at your live runs) |

## Next Session Should

Run the three new scenarios live (the Founder Verification block below) to move L2-complete / L4 / L6 from **Wired → Verified**, completing 0h-criterion-4's value-demonstration coverage across every supported single-product and combination configuration. After that, the remaining whole-system work is: **Combination 2** (once Priority 4 writes the no-practice disclaimer text); **C2** the R20a distress perimeter (Critical-tier — a separate Critical session under the full protocol); and then the harness becomes the control-vs-treatment rig for the "is the agent better *with* the substrate?" comparison. **Option B** (the admin `/api/calling/approve` gate end-to-end) remains the optional higher-fidelity follow-up.

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`):**
- `website/scripts/whole-system-harness/run-l2-complete.ts` (new)
- `website/scripts/whole-system-harness/run-l4.ts` (new)
- `website/scripts/whole-system-harness/run-l6.ts` (new)
- `website/scripts/whole-system-harness/lib/calling-driver.ts` (new)
- `website/scripts/whole-system-harness/lib/discovered-purpose-asserts.ts` (new)
- `website/scripts/whole-system-harness/README.md` (modified — L2-complete/L4/L6 build section)
- `operations/decision-log.md` (the new `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD` entry)
- `operations/handoffs/founder/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md` (this close)
- **After your live runs:** the new `data-room/05_outputs/L2-complete-live-*`, `L4-live-*`, `L6-live-*` ledgers.

**Do NOT stage:** `website/.env.local*` (gitignored — test config + prod backup); `website/tsconfig.tsbuildinfo` (build cache); `website/src/data/environmental-context.json` (your weekly refresh — unrelated).

**Production state at session close:** **UNCHANGED.** No production code / schema / env / deploy touched. Provenance gate remains **Live** (rollback unchanged + independent). `/api/reason` byte-identical to pre-A7 cutover. Local dev still points at the **test** project.

## Open Questions

- **Option B** (admin `/api/calling/approve` HTTP + plugin-auth Layer-1 thread) — deferred; the higher-fidelity follow-up that exercises the real D-14 gate end-to-end. Revisit when gate-level coverage is wanted.
- **Combination 2** — blocked on Priority 4 (disclaimer text). **C2** distress perimeter — Critical-tier, a separate Critical session.

## Founder Verification

Run the three scenarios live (dev server up against the TEST env, `WSH_*` exported — same credentials as the L1–L7 runs). Confirm the test env first: open `http://localhost:3000/api/public-key` → `key_id` should be `substrate-layer2-test`.

Terminal 1 (test env dev server), if not already up:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npm run dev
```

Terminal 2 — export the `WSH_*` vars (same as L7), then run **one at a time** (not as a block):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"

npx tsx scripts/whole-system-harness/run-l2-complete.ts --live
#   expect: Result: PASS — reaches awaiting_approval; five slots carry the agent's own words

npx tsx scripts/whole-system-harness/run-l4.ts --live
#   expect: Result: PASS — all five slots survive into the Layer 1 schema (input↔received printed)
```
For **L6**, run the seed teardown FIRST in the **TEST project SQL editor** (else the S2 seed → 409):
```
delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';
```
then:
```
npx tsx --env-file=.env.local scripts/whole-system-harness/run-l6.ts --live
#   expect: Result: PASS — S1, S2 (genuine write 200 + bridge), S3 (Reflect complete), S4 (re-entry 200; loop closes)
#   then run the S2/S3 DB-verify SQL the runner prints
```

**L6 S2/S3 DB verify** — run in the TEST project SQL editor after the L6 run (the runner echoes these):
```
select * from public.agent_accreditation  where agent_id='wsh-test-agent-L7';
select * from public.evaluated_actions     where agent_id='wsh-test-agent-L7' order by evaluated_at desc limit 5;
select * from public.grade_history         where agent_id='wsh-test-agent-L7' order by occurred_at desc limit 5;
```
Expect: an `agent_accreditation` row (seeded by S2 after the teardown, then updated by S3); ≥1 `evaluated_actions` row from this session; `senecan_grade` reflecting the engine's decision (not hand-set).

Each `--live` run writes a ledger to `data-room/05_outputs/<scenario>-live-<timestamp>.{json,md}` — stage those alongside the code when you commit.

**Stop the dev server** when done (`Ctrl + C`). **Restore production local dev** when all testing is done:
```
cp "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/.env.local.prod-backup-2026-05-24" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/.env.local"
```

**Commit (host-side, stage by name):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/scripts/whole-system-harness/run-l2-complete.ts \
  website/scripts/whole-system-harness/run-l4.ts \
  website/scripts/whole-system-harness/run-l6.ts \
  website/scripts/whole-system-harness/lib/calling-driver.ts \
  website/scripts/whole-system-harness/lib/discovered-purpose-asserts.ts \
  website/scripts/whole-system-harness/README.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md"
# after the live runs, also: git add data-room/05_outputs/
git commit -m "Whole-system test: build L2-complete/L4/L6 positive scenarios (Option A pure tsx; calling-driver + discovered-purpose-asserts) (D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD). code-standard/Standard; no production code/env/deploy."
```
Then push via GitHub Desktop. **No Vercel behaviour change** (test scaffolding is never bundled; the push type-checks `website/scripts/` — already `tsc`-clean here). (If GitHub Desktop reports a lock: close it, `rm -f .git/index.lock`, retry.)

## Cross-references

- `/operations/handoffs/founder/2026-05-25-L1-L5-clean-scenarios-build-close.md` (predecessor close)
- `/operations/decision-log.md` — `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25` (+ the L1-L5 / L7 predecessors)
- `data-room/04_test_brief/scenario-matrix.md` (L2/L4/L6 rows) + `data-room/04_test_brief/test-brief.md` §B (S1–S4)
- `website/scripts/whole-system-harness/README.md` (the L2-complete/L4/L6 build section)
- `website/scripts/whole-system-harness/{run-l2-complete,run-l4,run-l6}.ts` + `lib/{calling-driver,discovered-purpose-asserts}.ts`

*End of session close. Stabilised to a known-good state: three positive-scenario runners + two shared lib modules built, sandbox dry-preview green, `tsc --noEmit` clean, production unchanged, local dev still on the test project (restore command above). L2-complete / L4 / L6 await your live runs for the Verified stamp.*

---

## Verification Outcome (2026-05-25, same day — founder live runs)

All three scenarios **ran green live** against the test env:

| Scenario | Result |
|---|---|
| L2-complete — Calling approved path → five-slot DiscoveredPurpose | **PASS** |
| L4 — Seam S1 (five slots survive into Layer 1) | **PASS** |
| L6 — full suite S1–S4 (loop closes) | **PASS** |

**S2/S3 confirmed in the DB:** `agent_accreditation`, `evaluated_actions`, and `grade_history` all returned rows for `wsh-test-agent-L7` — S2 seeded the row (after the teardown), and the Reflect feed wrote through the engine at S3 (the seam closed).

**Status now:** L2-complete / L4 / L6 — **Verified** (was Wired). The **positive scenario matrix (L1–L7) is complete**. Still deferred: Combination 2 (blocked on Priority 4 disclaimer text), C2 distress perimeter (Critical-tier, separate session), Option B (admin-gate fidelity follow-up).

*End of verification addendum. Commit per the Founder Verification block above (stage by name; include the new `data-room/05_outputs/L2-complete-live-*`, `L4-live-*`, `L6-live-*` ledgers; do NOT stage `tsconfig.tsbuildinfo`). Restore production local dev when done.*
