# Session Close — 2026-05-24 — Data Room: Combination-1 Passing + Whole-System Test Approach (Reading A)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `governance` — **Standard** risk. No production code / schema / env / deploy touched. Critical Change Protocol NOT engaged. PR6 / KG1 NOT engaged.
**Date:** 2026-05-24.
**Branch:** worked on **`main`** (founder's Pre-condition-1 election; the `data-room/` files are byte-identical on `main` and the `whole-system-data-room` branch, so editing on `main` keeps a single coherent trail on top of the live gate).

## What this session did

Two parts.

1. **Recorded the Combination-1 enforcement in the data room.** Flipped the headline negative test from *documented gap* → *passing assertion* and resolved the gap record M-4, on the strength of the 2026-05-24 production verification that the Sage Assent provenance gate is Live (no-`provenance` write → 422 `bad_provenance`; forged → 403 `no_examination`).
2. **Settled the whole-system test approach.** A scoping discussion (test-safety precautions; the second-room/comparison question; an end-to-end manual-loop thought experiment; a code-read verification — "check #1") concluded with the founder adopting **Reading A**: a data-room orchestrator that *plays the agent* against a **test** environment.

## Decisions Made

- `D-DATA-ROOM-COMBINATION-1-PASSING-2026-05-24` — Combination-1 / S2-neg flipped to passing; M-4 resolved; seam-map Seam-2 cells updated for consistency.
- `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24` — adopt Reading A; reject Reading B (server-side seam-wiring) and the controlled-production run (test env instead).

## Key finding (check #1 — verified by code-read)

The genuine→200 provenance round-trip **is viable**. With signing on, `/api/reason` returns `{ assessment, signature, key_id }` (`website/src/lib/translation-sandwich/parallel-run.ts` L785–812) — exactly the shape the gate accepts as `provenance.signed_assessments[]` (`provenance-contract.ts`). So R18f is *satisfiable* by legitimate callers, not only enforceable against forgeries. Three conditions for a 200: (1) `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`; (2) a matching signing/public key pair and a `key_id` the verifier recognises; (3) `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` with `SUBSTRATE_LAYER2_PUBLIC_KEY` present. (This path proves *possession of genuine substrate output*, not aggregate-faithfulness — M-6 — and does not exercise Seam 2's bridge, still HTTP-unwired.)

## Status Changes

| Item | Old | New |
|---|---|---|
| Data-room Combination-1 / S2-neg | documented gap | passing assertion |
| M-4 (enforcement gap) | open | resolved |
| Whole-system test approach | undecided | Reading A (Adopted) |

## Next Session Should

Design the **Reading-A orchestrator harness** + the **scenario matrix** (L1–L7 + Combination 1/2) + the **test-environment standup checklist**; then, as a stretch if the test env is ready, build the **PR1 single-loop proof** on one configuration. Governance/Standard for the design; code-standard/Standard for the build. Full pre-conditions + procedure in:
`/operations/handoffs/founder/2026-05-24-whole-system-test-orchestrator-harness-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted (stage by name — there is untracked `data-room/` clutter; do NOT `git add .`):**
- `data-room/04_test_brief/test-brief.md`
- `data-room/99_review/missing-context.md`
- `data-room/03_seam_map/seam-map.md`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-05-24-data-room-combination-1-passing-close.md` (this close)
- `operations/handoffs/founder/2026-05-24-whole-system-test-orchestrator-harness-NEXT-SESSION-PROMPT.md` (the next-session prompt)

**Production state at session close:** **UNCHANGED.** No code/schema/env/deploy touched. The provenance gate remains Live (`SUBSTRATE_PROVENANCE_GATE_ENABLED='true'`); its rollback is unchanged (unset the flag + redeploy). `main` carries the `data-room/` files; the `whole-system-data-room` branch is behind `main` and holds only the `D-WHOLE-SYSTEM-DATA-ROOM-BUILD-2026-05-24` entry (commit `0b32417`).

## Open Questions

- `00_baseline/known-good-state.md` left **unedited by design** — it is the frozen, read-only known-good/rollback anchor recording production *before* the gate flip. Optional dated "superseded" pointer if the founder wants one.
- `data-room/04_test_brief/test-flag-config.md` is **stale** — predates the provenance gate, so it omits `SUBSTRATE_PROVENANCE_GATE_ENABLED` + `SUBSTRATE_LAYER2_PUBLIC_KEY`. First task in the next session.
- Whether to port `D-WHOLE-SYSTEM-DATA-ROOM-BUILD-2026-05-24` from the branch into `main`'s decision log (founder's call; not required).

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  data-room/04_test_brief/test-brief.md \
  data-room/99_review/missing-context.md \
  data-room/03_seam_map/seam-map.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-24-data-room-combination-1-passing-close.md" \
  "operations/handoffs/founder/2026-05-24-whole-system-test-orchestrator-harness-NEXT-SESSION-PROMPT.md"
git commit -m "Data room: Combination-1 -> passing (R18f Live); M-4 resolved; seam-map Seam-2 updated; adopt Reading A whole-system test approach (D-DATA-ROOM-COMBINATION-1-PASSING + D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A). Governance/Standard; no code/env/deploy."
```

Then push via GitHub Desktop. **No Vercel impact** (documentation only). (If GitHub Desktop reports a lock: close it, `rm -f .git/index.lock`, retry.)

Optional doc-check (independent of commit):
```
grep -n "PASSING\|RESOLVED (2026-05-24)" data-room/04_test_brief/test-brief.md data-room/99_review/missing-context.md
```
Expected: the Combination-1 / S2-neg rows and M-4 read as passing/resolved with the production-evidence citation.

## Cross-references

- `/operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-build-close.md` (predecessor — the gate build)
- `/operations/handoffs/founder/2026-05-24-whole-system-test-orchestrator-harness-NEXT-SESSION-PROMPT.md` (next session)
- `/operations/decision-log.md` — `D-DATA-ROOM-COMBINATION-1-PASSING-2026-05-24`; `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`
- `data-room/04_test_brief/test-brief.md`; `data-room/99_review/missing-context.md`; `data-room/03_seam_map/seam-map.md`
- `/drafts/2026-05-23-whole-system-data-room-brief.md` (§5 surfaces, §9 harness)

*End of session close. Stabilised to a known-good state: production unchanged; the data room records Combination-1 as a passing assertion with production evidence; the whole-system test approach is settled as Reading A; six files are staged for a single host-side commit.*
