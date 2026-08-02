# Session Close — 2026-08-03 — Stoa ST1: community-map repair + Q6a de-grading

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST1 + §2 #18; the binding verbatim Q6a record.
**Tier:** `code-elevated` + `schema` — Elevated risk. **Date:** 2026-08-03. **Model:** Fable 5 (`claude-fable-5`).
**Honesty note:** every Gate-1/Gate-2 hook attempt 401'd (the known transient server-side fail-secure class) and one guard probe 429'd — the whole session ran unframed/unguarded, honestly logged; proceeded deliberately per the standing opener. The close-time reflect invitation fired mid-session and the review below stands as the genuine engagement.

## What happened

The mentor's one implement-now directive (Q6a) is implemented at build level: the broken `/community` surface repaired AND rebuilt without the alignment tier. §5 item iii re-confirmed at open (aggregate stats leave entirely). **Root cause sharpened:** the live 42703 was the ROUTE filtering `show_on_map` against a view that never exposed it — guaranteed by code, latent behind the old fake-benign error swallow. **PR19 ran as four parallel independent Agent reviewers** (disclosed Workflow-equivalent): 0 HIGH; 1 MEDIUM (legacy migration could silently re-grade the view — neutralised) + 4 LOWs folded (auth UUID off the surface; explicit service_role grant; wrong-relkind note; loadData finally-guard); privacy dimension: no regression, strictly narrowing. Full disposition in the decision-log entry.

## Decisions Made
- `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03` appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| ST1 (community-map repair + de-grade) | Scoped | **Verified (build-level; tsc 0 · build 0 · local render + payload checked · PR19 folded) — founder walk pending** |
| `community_map_pins` graded view path | runnable from legacy migration | **Neutralised (Q6a)** |
| `/api/community-map` error posture | fake-benign `{pins:[]}` | honest 500 |

## The founder walk (run in this order — PR17, live)

**1. Diagnose (read-only, record the output):** open the Supabase SQL editor (PRODUCTION project) and run §0 of `website/supabase-community-map-degrade-migration.sql`. If the TEST project mirrors the gap, walk TEST first with the same steps.

**2. Apply:** run the rest of the file (§1 → §3) as one paste. ⚠ If §0 showed `view_exists=0` but `view_columns` non-null, STOP — the §2 note explains that state.

**3. §VERIFY:** run V1–V4. Expected: V1 `display_name, city, country, latitude, longitude` (no alignment field, no id); V2 SELECT for anon + authenticated + service_role; V3 = 5; V4 ≥ 0.

**4. Commit + push (BEFORE live reads — the 2026-08-02 walk lesson; confirm the deployed hash carries this session's changes):**
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add website/supabase-community-map-degrade-migration.sql website/supabase-location-migration.sql website/src/app/api/community-map/route.ts website/src/app/community/page.tsx .claude/launch.json operations/decision-log.md operations/handoffs/founder/2026-08-03-stoa-ST1-community-map-CLOSE.md operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md
```
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git commit -m "Stoa ST1: repair the community map and rebuild it without the alignment tier (Q6a); PR19 folds"
```
Then push via GitHub Desktop; wait for Vercel green and confirm the deployment's commit hash is this commit.

**5. Live smoke:**
```bash
curl -s https://www.sagereasoning.com/api/community-map
```
Expected: HTTP 200 with real pins for opted-in practitioners, or honestly-empty `{"pins":[],"total":0}`; the payload must contain NO `sage_alignment`, `avg_total`, or `id`. Then load `https://www.sagereasoning.com/community` — pins render (or honest empty), two stat tiles only, no tier legend.

**6. Report the results back** — a one-line reply with the §0 found-state + §VERIFY green + the curl output closes ST1 to Live in the next entry.

## Blocked On
**Production state at session close (PR18):** byte-equivalent — nothing applied, deployed, or flipped this session; AC7 not engaged. On the founder's walk above, production changes deliberately and standing: the repaired, de-graded map (an adopted-ruling implementation, not a regression). Rollback: `git revert` the session commit and/or the migration footer's rollback — **the graded view is never restored** (reversing Q6a requires re-opening the mentor record).

**Files remaining uncommitted (this session's — stage ONLY these; the tree carries other sessions' strays, untouched):** the eight paths in step 4 above.

## Open Questions / Named follow-ups
- Map-into-Stoa fold election (plan ST7).
- Pre-existing, out of scope: `update-location` raw `error.message` passthrough; range-only lat/long validation (self-published precise coords, own opt-in pin only); "Remove from map" nulls saved location; stale `component-registry.json` `prod-community-map` blocker text (next registry pass).

## Next Session Should
**ST2** — the `stoa_entries` schema + data rights, dark behind `SUBSTRATE_STOA_ENABLED` (`schema` + `code-standard`; founder-walked migration TEST→prod; plan §3 ST2). Pre-condition: this session's commit pushed + the ST1 walk done (or explicitly deferred).

## Cross-references
- `operations/handoffs/founder/2026-08-02-stoa-ST1-community-map-reachback-NEXT-SESSION-PROMPT.md` (the spent prompt)
- `operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md` (§3 ST1 status updated)
- `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` (Q6a — binding)
- `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03`

*End of session close. The first adopted Stoa ruling is implemented at build level and reviewed; the founder's walk makes it live.*
