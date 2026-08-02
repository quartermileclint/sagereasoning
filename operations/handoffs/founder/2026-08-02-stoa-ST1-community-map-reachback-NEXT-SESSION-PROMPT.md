# Next-Session Prompt — Stoa ST1: the community-map repair + de-grading (the Q6a reach-back)

**Stream:** founder.
**Tier:** `code-elevated` + `schema` (a broken existing user-facing surface, repaired and changed; production view DDL founder-walked).
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §3 ST1 + §2 constraint #18; **the binding verbatim records win over everything here** — `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` (Q6a + the closing observation) and `inbox/stoic network enquiry and mentor response.txt`.
**Predecessor session close:** `operations/handoffs/founder/2026-08-02-connective-layer-stoa-adoption-and-plan-CLOSE.md`.
**Predecessor decision-log entries:** `D-CONNECTIVE-LAYER-STOA-MENTOR-VERDICTS-ADOPTED-PLAN-AUTHORED-2026-08-02`, `D-STOA-BUILD-PLAN-APPROVED-ST1-FIRST-2026-08-02`.
**Risk classification:** Elevated under 0d-ii (existing user-facing functionality + a production view). Critical Change Protocol NOT engaged — no auth/encryption/R20a/flag surface is touched; the SQL steps are founder-walked per PR17. **PR19 independent adversarial review is REQUIRED** (founder direction: at every Stoa build; parallel independent `Agent` calls are the accepted equivalent when the Workflow opt-in is absent — the Phase-3/07-29 precedent, disclosed each time).

## Why this session matters

This is the mentor's **one implement-now directive** from the fourteen adopted verdicts (Q6a + the closing observation, verbatim): *"The alignment tier should not be restored to the public map when the map is fixed. The map should be rebuilt without it, under the principles now in force. A broken surface that predates a ruling is not grandfathered by its prior existence."* — and — *"when the ruling is clear and the implementation opportunity is present, the right act is to implement it, not to defer it further."* The session repairs a surface broken in production since at least the recorded 42703 AND implements the no-practice-data-in-the-connective-layer ruling at the moment of repair. It is independent of every other Stoa phase.

## Grounded facts (verified 2026-08-02 — do not re-derive; DO re-verify prod state at Step 1)

- **Route:** `website/src/app/api/community-map/route.ts` (~30 LOC, public, unauthenticated, no rate limit) — selects `id, display_name, city, country, latitude, longitude, sage_alignment, avg_total` from `community_map_pins`, filtered `.eq('show_on_map', true)`, limit 2000, and **swallows all errors returning `{ pins: [] }`** (a false-benign — the house missing-table-benign lesson class).
- **The view:** `community_map_pins` is a **VIEW, not a table** — defined in `website/supabase-location-migration.sql`: `profiles` (city, country, latitude, longitude, display_name) JOIN `user_stoic_profiles` (sage_alignment, avg_total), gated `show_on_map = TRUE AND latitude IS NOT NULL`; SELECT granted to `anon`/`authenticated`.
- **The page:** `website/src/app/community/page.tsx` — "Sages Around the World" (react-simple-maps world map, hover tooltips, a stats row incl. **sage-like / principled counts**, and a self-service location form posting to `/api/update-location`). Linked from `NavBar.tsx` and the footer in `layout.tsx`.
- **The production defect:** live Postgres **42703 — `community_map_pins.show_on_map does not exist`** (decision-log ~line 13005; also the CLAUDE.md named follow-up) — the location migration was never fully applied to production, so the endpoint always returns zero pins and the map renders empty.
- **Privacy history (treat the repair as privacy-sensitive):** `compliance/Security_Audit_Report_4Apr2026.md` records that the `show_on_map` opt-in filter was added retroactively **after a leak of all users' locations**. Location display is country-centroid granularity by design.
- **The keying gotcha:** `profiles` is keyed by `id` (= auth user id), not `user_id` — this has caused two production bugs before.
- **Current production baseline:** `SUBSTRATE_AGENT_CIRCLES_ENABLED` is LIVE (2026-08-02 walk) — unrelated to this surface, but the deployed baseline is no longer the 07-30 state; expect it when reading production behaviour.

## Pre-conditions

1. `origin/main` at or past `8cd005c` (the Stoa adoption commit — pushed, Vercel green, founder-confirmed 2026-08-02).
2. The founder present for the SQL steps (Supabase SQL editor; **bare SQL in `sql`-tagged blocks, never shell wrappers; shell commands one per block**).
3. Read at open: the plan §2 constraint #18 + §3 ST1; the verbatim Q6a + closing observation; this prompt in full.

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`code-elevated`+`schema`), risk (Elevated), signals, status vocabulary; state the session's model.
2. Predecessor close + the plan's §2/§3 (ST1) + the verbatim Q6a.
3. `/operations/decision-log.md` last 2 entries.
4. `git status` — know the tree; stage only this session's files.
5. **Re-confirm at open (approved-as-recommended, one line):** aggregate alignment stats leave the map page entirely — the sage-like/principled stat tiles go, not just the per-pin tier. (Plan §5 item iii; the founder approved the recommendation 2026-08-02 — re-confirm, don't re-litigate.)

## Part B — Procedure

### Step 1 — Diagnose production first (founder-walked, read-only SQL)
Never assume which half is missing. Founder runs read-only checks: does `community_map_pins` exist and with which columns; do `profiles.show_on_map`/`latitude`/`longitude`/`city`/`country` exist; does `user_stoic_profiles` exist. The 42703 names `show_on_map` — determine whether the missing piece is the profiles columns, the view, or both. Record the found state verbatim in the session notes before authoring SQL.

### Step 2 — Author the corrected migration (idempotent, reversible)
One SQL file (house pattern: `website/supabase-community-map-degrade-migration.sql`):
- Apply any missing `profiles` location pieces `IF NOT EXISTS` (from the original `supabase-location-migration.sql`, unchanged in meaning).
- **`CREATE OR REPLACE` the view WITHOUT `sage_alignment` and `avg_total`** (constraint #18). Strongly consider dropping the `user_stoic_profiles` JOIN entirely — with the alignment fields gone the join likely serves nothing; less joined surface is less exposure. Preserve the `show_on_map = TRUE AND latitude IS NOT NULL` gate and the anon/authenticated SELECT grants exactly.
- Footer: rollback notes. **State plainly in the file: rollback restores the REPAIRED-degraded or broken state, never the graded view — re-adding the alignment fields would contradict the adopted Q6a ruling.**

### Step 3 — Code edits (small, scoped)
- Route: drop the two alignment fields from the select + payload. **Recommended in-scope hardening (founder-electable at open):** stop swallowing errors — return an honest 500 + server log on a real DB error instead of a fake-benign `{pins: []}` (the house false-benign lesson; keep a genuinely-empty result as a clean 200 `{pins: []}`).
- Page: remove alignment-derived display — per-pin tier styling/tooltip fields and the sage-like/principled stat tiles (keep pins-on-map + countries). Location form untouched. No other page redesign — ST1 is repair + de-grade, not a rebuild; the map-into-Stoa fold is a separate, later election (plan §3 ST7).

### Step 4 — Verify
- `tsc --noEmit` 0; `npm run build` 0 (route + page compile; `/community` + `/api/community-map` registered).
- Founder-walked SQL: TEST first if the TEST project mirrors the gap, then production; §VERIFY selects green (view exists; **column list contains NO alignment field**; grants intact).
- Live: `curl` `/api/community-map` — 200 with real pins (or honestly-empty 200 if no one has opted in); **grep the payload for `sage_alignment`/`avg_total` — must be absent**; load `/community` — renders without the alignment tiles.
- **The walk lesson (2026-08-02, standing):** confirm the deployed commit hash contains every intended change before treating any live check as meaningful — "a green deploy proves the build compiles, not that it's the commit you think it is." Commit + push BEFORE the live verification reads.

### Step 5 — PR19 independent adversarial review
Fresh reviewers given the artifact only (never this session's conclusions). Dimensions at minimum: ruling-fidelity (no alignment data reachable anywhere on the surface — view, route, page, payload), migration-correctness against the Step-1 found state, privacy regression (the leak history — nothing beyond display_name/city/country/centroid coordinates served; opt-in gate intact), and the error-handling change if elected. Adjudicate severity in the verify pass; fold confirmed findings before close.

### Step 6 — Records (lean forms per the cache)
Decision-log entry (`D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-02…` dated as run) + lean close. **PR18:** the close's production-state line records this as a deliberate, intended standing change to a live surface (the repaired, de-graded map), with the rollback statement from Step 2. Update the plan's ST1 line to DONE with the date.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads | 15–20 min |
| Step 1 prod diagnosis (founder SQL) | 10–15 min |
| Step 2 migration authoring | 20–30 min |
| Step 3 code edits | 30–45 min |
| Step 4 verify (incl. founder-walked apply + live checks) | 30–45 min |
| Step 5 PR19 review + folds | 45–90 min |
| Records + close | 20–30 min |
| **Total** | **~3–4.5 hours** |

## Rollback path

`git revert` the session commit (route + page revert to the alignment-selecting versions — which then 42703 against the de-graded view, i.e. the pre-session broken state, honest and safe) and/or the migration footer's rollback. **The graded view is never restored** — Q6a is adopted; a future founder decision to reverse it would need the mentor record re-opened, not a rollback.

## Forecast

Success: `/community` renders live pins for opted-in practitioners with zero practice-derived data anywhere on the surface — the first adopted Stoa ruling implemented in production. Next per the approved sequence: **ST2** (the `stoa_entries` schema + data rights, dark), then ST3→ST5 per the plan. The map-into-Stoa fold election and the walk-session's own carried items (agent-circles R18 docs, the stale-boundary-window query) remain separate threads the founder sequences.

End of prompt.
