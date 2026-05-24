# Session Close — 2026-05-24 — Whole-System Test: Reading-A Orchestrator Harness (Design + Env Standup)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `governance` — **Standard** risk. **No production code / schema / env / deploy touched.** Critical Change Protocol NOT engaged. PR6 / KG1 NOT engaged.
**Date:** 2026-05-24.
**Branch:** worked on **`main`** (founder's Pre-condition-1 election; clean working tree, no `.git/index.lock`). Scope elected at open: **design-only (Steps 1–4 + close); Step 5 single-loop proof NOT run** (the test env is not yet standing).

## What this session did

Produced the spec + checklist so the next build session opens ready to run the L7 single-loop proof. Four deliverables:

1. **Refreshed the stale `test-flag-config.md`** (Step 1) — added `SUBSTRATE_PROVENANCE_GATE_ENABLED` + `SUBSTRATE_LAYER2_PUBLIC_KEY` to the test column, plus a new "genuine→200 trio + false-403 trap" section cross-referencing the genuine→200 recipe.
2. **Designed the Reading-A orchestrator harness** (Step 2) — `orchestrator-harness-design.md`: a script that *plays the agent* over HTTP against a TEST env; location decided (`website/scripts/whole-system-harness/`, outside `src/` so it never bundles); per-endpoint auth; the S1–S4 endpoint-threading map; the Seam-2 bridge `tsx` step.
3. **Defined the nine-scenario matrix** (Step 3) — `scenario-matrix.md`: L1–L7 + Combination 1 (422/403) + Combination 2 (disclaimer), each with inputs, endpoints, seams, `tsx`-step flag, and a pass assertion tied to `03_seam_map/` + test-brief §B.
4. **Produced the test-environment standup checklist** (Step 4) — `test-env-standup-checklist.md`: founder-performable, with the schema-clone vs migration-replay decision, Ed25519 key-pair generation, the full env-var table, credential minting, and the genuine→200 positive-control smoke check.

## Two material findings (PR13 — both folded into the docs)

1. **Auth is more uniform than the prompt assumed.** `/api/calling`, `/api/accreditation`, and `/api/practice/reflect` **all** use the same `Bearer sr_assent_` write token (`SAGE_ASSENT_WRITE_TOKEN_PREFIX='sr_assent_'`); only `/api/reason` uses the JWT/API-key/plugin-auth model. ⟹ the credential is minted **at setup, before the loop**, not mid-loop (corrects the prompt's inline ordering). *Diagnostic-certain (code-read).*
2. **`api_keys`, `loop_billing_events`, `api_key_usage` are NOT created by any repo migration** — only `ALTER`ed/referenced. A naive migration-replay would leave the test project unable to authenticate (the `sage_assent_write` scope is a column on `api_keys`). ⟹ the standup checklist flags this and recommends a **schema-only clone** of production (structure, zero rows). *Diagnostic-certain (repo scan).*

## Decisions Made

- `D-WHOLE-SYSTEM-HARNESS-DESIGN-2026-05-24` appended (+~45 lines). Harness designed; scenario matrix defined; standup checklist produced; flag-config refreshed. Standard risk; no code/env/deploy.

## Status Changes

| Item | Old | New |
|---|---|---|
| Reading-A orchestrator harness | (approach Adopted, unbuilt) | **Designed** (0a) |
| Scenario matrix (L1–L7 + 2 negatives) | undefined | **Designed** (specified) |
| Test-environment standup checklist | absent | **exists** (founder-performable) |
| `test-flag-config.md` | stale (predated the gate) | current (gate flags + genuine→200 trio) |

## Next Session Should

**Stand up the test environment** (founder, between sessions — per `test-env-standup-checklist.md`), then a **`code-standard`/Standard build session** builds + runs the **L7 single-loop proof** (PR1) — `/api/reason` → genuine `provenance` → `POST /api/accreditation` → `200`, plus the Seam-2 bridge `tsx` step — and captures the result into `data-room/05_outputs/` (the first 0h-criterion-4 value demonstration, agent-developer audience). After L7 is **Verified**, build out L1–L6 + the two negatives on the proven pattern. C2 (distress perimeter) stays deferred to a **Critical** session.

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`):**
- `data-room/04_test_brief/test-flag-config.md` (modified)
- `data-room/04_test_brief/orchestrator-harness-design.md` (new)
- `data-room/04_test_brief/scenario-matrix.md` (new)
- `data-room/04_test_brief/test-env-standup-checklist.md` (new)
- `operations/decision-log.md` (modified)
- `operations/handoffs/founder/2026-05-24-whole-system-harness-design-close.md` (this close)

**Production state at session close:** **UNCHANGED.** No code/schema/env/deploy touched. The provenance gate remains **Live** (`SUBSTRATE_PROVENANCE_GATE_ENABLED='true'`); its rollback is unchanged (unset the flag + redeploy). `/api/reason` byte-identical to pre-A7 cutover.

## Open Questions

- **Test-env standup is founder-performed** and is the hard prerequisite for any orchestrator run — it needs Supabase/Vercel/key access the AI cannot reach.
- **Orchestrator location** (`website/scripts/whole-system-harness/`) and **`/api/reason` auth choice** (API key vs plugin-auth) are confirmed at build time.
- **Combination 2** is blocked on Priority 4 (disclaimer text not yet written) — the row is specified but not runnable until then.
- **`test-brief.md` left unedited by design** — settled + committed last session; the new sibling docs reference it (children → parent), so no edit was needed.

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  data-room/04_test_brief/test-flag-config.md \
  data-room/04_test_brief/orchestrator-harness-design.md \
  data-room/04_test_brief/scenario-matrix.md \
  data-room/04_test_brief/test-env-standup-checklist.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-24-whole-system-harness-design-close.md"
git commit -m "Whole-system test (Reading A): orchestrator harness design + 9-scenario matrix (L1-L7 + 2 negatives) + test-env standup checklist; refresh stale test-flag-config (provenance-gate flags + genuine->200 trio) (D-WHOLE-SYSTEM-HARNESS-DESIGN). Governance/Standard; no code/env/deploy."
```

Then push via GitHub Desktop. **No Vercel impact** (documentation only). (If GitHub Desktop reports a lock: close it, `rm -f .git/index.lock`, retry.)

Optional doc-check (independent of commit):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/data-room/04_test_brief"
grep -l "signed_assessments" *.md
grep -n "NOT created by any\|sr_assent_" test-env-standup-checklist.md | head
```
Expected: `signed_assessments` appears in the harness design, scenario matrix, standup checklist, and flag-config; the standup checklist records the out-of-repo-tables finding and the `sr_assent_` setup-mint.

## Cross-references

- `/operations/handoffs/founder/2026-05-24-data-room-combination-1-passing-close.md` (predecessor close)
- `/operations/handoffs/founder/2026-05-24-whole-system-test-orchestrator-harness-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `/operations/decision-log.md` — `D-WHOLE-SYSTEM-HARNESS-DESIGN-2026-05-24` (+ predecessors `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`, `D-DATA-ROOM-COMBINATION-1-PASSING-2026-05-24`, `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`)
- `data-room/04_test_brief/{test-flag-config,orchestrator-harness-design,scenario-matrix,test-env-standup-checklist}.md`
- `/drafts/2026-05-23-whole-system-data-room-brief.md` (§5 surfaces, §9 harness)

*End of session close. Stabilised to a known-good state: production unchanged; the harness is Designed, the nine-scenario matrix is defined, and the founder-performable standup checklist exists — so the build session opens ready to run the L7 single-loop proof. Six files staged for a single host-side commit.*
