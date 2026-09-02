# Codebase-wide sweep — unbounded Supabase reads vs the silent PostgREST row cap — REPORT

**Date:** 2026-09-02 (written into 2026-09-03). **Scope:** every `.from(...).select(...)` chain and
every `.rpc(...)` call under `website/src`, `website/scripts`, repo-root `sage-mentor/` and `sdk/`,
at HEAD `a32c4a2` plus this session's `/api/founder/hub` fix. **Inventory:**
`2026-09-02-unbounded-select-sweep-INVENTORY.md` (mechanical, 441 chains / 14 RPC calls; 85
`unbounded-read` candidates + 3 `bounded-continuation`). **Classification:** first-hand, from the
code around every candidate, by this session (see §9 for why first-hand and what that limits).
**This report RECOMMENDS. It changes no code.** The only reads fixed this session are the two
founder-hub sites (`D-FOUNDER-HUB-POSTGREST-ROW-CAP-FIXED-…`).

## 0. The fact the whole sweep rests on

PostgREST's `db-max-rows` is a hard cap on rows fetched "from a view, table, or function"
(PostgREST configuration reference; its own default is unlimited). Supabase sets it per project — this
project's cap was **confirmed behaviourally at 1,000** (a 1,013-row conversation returned exactly
1,000) rather than read from a setting. Nothing signals the truncation: no error, no header the
client surfaces. `Prefer: count=exact` returns the TRUE total in `Content-Range` regardless of the
cap (PostgREST pagination/count reference), so a count is always honest even when the rows are not.
**Which rows drop depends on the ORDER**: ascending drops the newest; descending the oldest; no
order = heap order, effectively arbitrary.

## 1. Headline

Of 85 unbounded candidates, **12 sites on 4 global/ledger tables can cross the cap NOW or within
weeks, and every one of them feeds a number somebody reads as true**: the A13 cost-health detectors
(daily Slack), the A19 abuse detectors, the A14 SLO tracker, the monthly LLM-cost and revenue:cost
figures, and the provenance-ledger C2 discharge tally that gates slice 5's ENFORCE switch-on. One
more is a governing surface: the mentor profile's rolling-window update reads the ENTIRE
`mentor_interactions` table with no filter (485 rows in August, growing ~110/month). A second class —
**every data-rights export/access read** (≈30 sites) — is structurally unbounded and will silently
produce an incomplete Article 15/20 copy the day any per-user table passes 1,000 rows; none does
today. Everything else is bounded by structure (a primary key, a vocabulary, a 56-day curriculum) or
is far below the cap with a bounded growth driver. The mechanical inventory's known blind spots were
checked; **no missed read was found** (§7), with the honest caveat that the tool cannot see a bound
applied on only one branch.

## 2. Findings by severity

Legend — **can_exceed**: `now` (evidence the set already exceeds or nearly exceeds 1,000),
`plausible` (grows without bound; will cross), `unlikely` (bounded by design, not by the query),
`no` (structurally impossible). **Order**: what the query orders by, hence which rows drop.
**WATCHED** = a provenance-ledger observation-window surface; report-only this session.

### 2.1 HIGH — a number read as true is silently wrong, now or within weeks

| # | site | table | order | filter | can_exceed | consumer | what goes silently wrong | fix |
|---|---|---|---|---|---|---|---|---|
| H1 | `website/scripts/provenance-c2-discharge-tally.ts:170` | `agent_provenance_ledger` | asc `recorded_at` | none (whole table) | **now/weeks** — ~47 rows/day since 2026-08-26 (187 in 4 days); crosses 1,000 ≈ 2026-09-17; 90-day steady state ≈ 4,000 | the C2 discharge tally — the readiness instrument for slice 5 (ENFORCE) | the tally counts 1,000 of N entries, the NEWEST dropped; a "100% resolution" reading over an unverified set — the exact "verified arithmetic on an unverified set" class | **WATCHED** (`provenance-*.ts`) — report only. When the window closes: page the read (keyset on `recorded_at,id`) or tally in SQL |
| H2 | `website/src/app/api/billing/cost-alerts/evaluate/route.ts:246` | `loop_billing_events` | none (heap) | none (whole table) | **now** — ~3,200 rows by 2026-08-25, append-only, no retention | D4 per-call spike (global): count, total, max over "all loops" | computed over an arbitrary 1,000-row subset; the daily Slack cost-health signal is wrong with no indication | aggregate in SQL (`count`, `sum`, `max` via RPC or a view) — never fetch rows to sum them |
| H3 | `…/cost-alerts/evaluate/route.ts:131` | `loop_billing_events` | none | `agent_id not null` (whole table) | **now** | enumerate identities to evaluate | identities beyond the first 1,000 rows are silently excluded from cost evaluation | `select distinct agent_id` via RPC/view, or page |
| H4 | `…/cost-alerts/evaluate/route.ts:173` and `website/src/lib/substrate/substrate-identity-baseline.ts:70` | `loop_billing_events` | none | `.eq('agent_id')` | **now** for `sagereasoning:s9-loop@v1` (the dominant consult identity; thousands of loops) | per-identity anomaly detector; identity cost baseline | loop count, total and max computed on 1,000 arbitrary rows of one agent | aggregate in SQL |
| H5 | `website/src/app/api/abuse/evaluate/route.ts:134` | `substrate_audit_events` | none | `agent_id not null` (whole table) | **now** — ~3,200+ rows, append-only, DELETE revoked | enumerate identities for the A19 abuse detectors | identities silently dropped from abuse detection | `distinct agent_id` via RPC/view |
| H6 | `…/abuse/evaluate/route.ts:187` | `substrate_audit_events` | none | `.eq('agent_id')` | **now** for s9-loop | velocity + structural detectors (windowed request counts, input-size sets) | detectors run on an arbitrary 1,000-event subset; a burst can be invisible | bound by time window (`gte occurred_at`) AND aggregate in SQL |
| H7 | `website/src/app/api/admin/slo-health/route.ts:54` | `substrate_audit_events` | none | `.eq('surface','api_reason')` | **now** | the A14 SLO/health tracker (percentile latencies) | the SLO figure is a percentile over 1,000 arbitrary rows, not the population | windowed read (last N days) with a limit, or percentiles in SQL |
| H8 | `website/src/app/api/billing/usage-summary/route.ts:109` and `…/cost-alerts/evaluate/route.ts:285` | `translation_sandwich_comparisons` | none | month window | **plausible-now** — a row is written per sandwich consult (`parallel-run.ts:1281`); at ~48 consults/day ≈ 1,450/month | monthly LLM cost (D1 denominator, D3) and the usage summary | the month's cost is understated; the revenue:cost ratio is wrong | `sum()` in SQL; **founder SQL to confirm today's count:** `select count(*) from translation_sandwich_comparisons where created_at >= date_trunc('month', now());` |
| H9 | `sage-mentor/profile-store.ts:876` (`computeRollingWindow`, called live from `updateProfileFromReflection` at `:1175`, which `/api/reflect` and `/api/mentor/private/reflect` call) | `mentor_interactions` | none | **none — the whole table, every user**; filtered by `profile_id` and date client-side | **plausible** — 485 rows on 2026-08-18, ~110/month → ≈ early 2027 for one practitioner; sooner with any second one | the mentor profile's rolling-window update (a governing surface's memory) | the window is computed on an arbitrary 1,000-row subset; also reads every practitioner's rows to find one (a privacy/perf smell outside this sweep) | `.eq('profile_id', …).gte('created_at', cutoff).order(desc).limit(HUMAN_ROLLING_WINDOW.max_interactions)` |

### 2.2 MEDIUM — wrong or incomplete, later or under a condition

| # | site | table | can_exceed | consequence | fix |
|---|---|---|---|---|---|
| M1 | `website/src/app/api/webhooks/stripe/route.ts:315` | `loop_billing_events` (per api_key set, per invoice period) | dormant (Stripe `not_configured`); a customer at >1,000 loops/month | **under-billing** presented as an accurate invoice — critical the day Stripe activates | `sum(total_cents)` grouped by day in SQL; make this a Stripe-activation precondition |
| M2 | `…/usage-summary/route.ts:180`, `…/cost-alerts/evaluate/route.ts:328` | `translation_sandwich_comparisons` (7-day window) | plausible (crosses at ~143 consults/day) | rolling 7-day spend understated | as H8 |
| M3 | `website/src/app/api/admin/metrics/route.ts:42`, `:46` | `analytics_events` (7-day / today windows) | plausible (600 rows total 2026-07-20; per-week volume unknown) | admin week/today counts capped | `count` by `event_type` in SQL |
| M4 | `…/admin/metrics/route.ts:83` | `analytics_events` (whole table, fallback) | **now if the fallback is live**: `get_event_counts` has NO definition anywhere in the repo, so if it is absent in production the fallback IS the live path | all-time admin counts capped at 1,000 | verify the RPC exists in production; otherwise count in SQL |
| M5 | **Every data-rights read** — `website/src/app/api/user/export/route.ts:139` (20-table loop incl. `analytics_events`, `reflections`, `action_evaluations_v3`), `:432` (9 profile-scoped tables incl. `mentor_interactions`), `:249/:277/:306/:337/:367`; `website/src/lib/user-data-gathering.ts:117/:279/:144/:162/:193/:222`; `agent-assessment-history-store.ts:625`; `stoa-store.ts:652/:674`; `idea-loop-watching-store.ts:369/:557`; `collaboration-store.ts:345`; `trust-core-store.ts:956` (via `:942/:944`); `provenance-ledger-store.ts:180` (via `:166/:168` — **WATCHED**); `sage-reflect/session-store.ts:636`; `mentor-appendix-store.ts:143` | per user / owner / credential | none today; **`mentor_interactions` (485) is the nearest**; `agent_assessment_history` per owner-bound credential (~48/day for s9-loop's class) would cross in weeks if a consult credential were owner-bound | an **incomplete Article 15 access copy or Article 20 export presented as complete** — the compliance form of the silent remainder | one shared paging helper (`selectAll(table, filter)` looping `.range()` or keyset until `count` is reached) used by every data-rights read; add an `incomplete: true` marker if a page ever comes back capped |
| M6 | `website/src/app/api/user/delete/route.ts:217`, `:239` | `api_keys` per owner (60 total today) | unlikely (would need >1,000 credentials per owner) | these lists DRIVE deletes (`deleteStoaDataForCredential` per key; `deleteAgentSessions` per agent) — a truncated key list is an **incomplete deletion reported as success** | same paging helper; the class matters more than the number |

### 2.3 LOW — bounded in practice, unbounded in the query

| site | table | why low | note |
|---|---|---|---|
| `website/src/app/api/reflections/route.ts:53` | `reflections` per user, desc | ≈3 years of nightly practice to reach 1,000; desc drops the OLDEST | page the history view |
| `website/src/app/api/admin/api-keys/route.ts:61` | `api_key_usage_current` view (one row per credential; 60 in July) | grows with mints only | add `.limit`/paging when the admin list matters |
| `…/billing/usage-summary/route.ts:74`, `website/src/app/api/usage/route.ts:78` | `api_key_usage` per (key, year, month) | credentials × 1 month | fine |
| `website/src/app/api/keys/route.ts:22`, `usage/route.ts:43`, `export:249/:277`, `user-data-gathering.ts:144`, `webhooks/stripe:298` | `api_keys` per owner | ≤60 total | `usage/route.ts:43` is an assigned builder with NO later bound on any path (the one true `assigned + unbounded`) |
| `…/cost-alerts/evaluate/route.ts:273`, `…/usage-summary/route.ts:86` | `payment_events` monthly | Stripe dormant; the table's production existence is itself uncertain (2026-07-22 handoff) | revenue sum — same SQL-aggregate fix as H8 when Stripe lands |
| `website/scripts/provenance-c2-discharge-tally.ts:123/:132/:141` | `agent_trust_events` (credential-completed, windowed) / `agent_accreditation` (whole table) | credential-completed events are rare; agents < 100 | `:132/:141` are whole-table and will truncate past 1,000 agents — **WATCHED** |
| `website/src/lib/substrate/narrative-retention.ts:395` | `substrate_audit_narratives` (pending/failed sweep) | self-correcting — an hourly sweep that sees 1,000 completes 1,000 and returns for the rest; not silent loss | fine |
| `website/src/app/api/deliberation-chain/[id]/route.ts:48` | `deliberation_steps_v3` per chain | a 1,000-step chain is implausible | fine |
| `sage-mentor/profile-store.ts:626-631` (`loadProfile`) | six profile sub-tables, **no filter at all**, filtered client-side | writers dormant (`seedProfileFromIngestion` has no caller); `loadProfile` has no live caller (only `loadProfileWithCache`, itself uncalled) | dormant, but reads every user's rows — a privacy smell to fix if ever revived |
| `website/src/lib/stoa/stoa-presentation.ts:69` | `profiles` `.in(ids)` | bounded by the listed entries (≤200) | fine |

### 2.4 NONE — structurally impossible

| site | reason |
|---|---|
| `journal/route.ts:182`, `milestones/route.ts:124`, `practice-calendar/route.ts:101` (+ export/access loops) | `journal_entries` is UNIQUE(user_id, day_number) over a 56-day curriculum |
| `milestones/route.ts:56`, `:101` | UNIQUE(user_id, milestone_id) over a vocabulary < 50 |
| `milestones/route.ts:103/:107`, `practice-calendar/route.ts:77/:86` | per user (and per month for the calendar); practice cadence is daily at most — see M5 for the export form |
| `mentor/gap4/route.ts:391`, `mentor/oikeiosis/route.ts:169`, `mentor/premeditatio/route.ts:431` | per user, monthly/quarterly cadence; two are views grouped per month/quarter |
| `admin/api-keys/route.ts:193`, `export:91`, `user-data-gathering.ts:70` | `profiles` by id / by unique email |
| `baseline/agent/route.ts:85` | per agent per calendar month, capped at 2 by the route's own rule |
| `rag/retrieve-passages.ts:402` | `.in(passage_ids)` from a top-K list over a 186-row static corpus |
| `trust-core-store.ts:532` | `agent_trust_state` per agent: UNIQUE(agent_id, virtue_domain), ≤5 rows |
| `scripts/s9-instrument-fidelity-battery.ts:250/:262/:598` | TEST-only fixture ids |
| `founder/hub/conversation-history.ts:249`, `mentor-context-private.ts:255`, `stoa-store.ts:574` | `bounded-continuation` — confirmed: `.limit(limit)` at `:264`, `.limit(limit)` at `:268`, `.range(offset, …)` at `:579`, each on every path |

## 3. Unknown cardinality

- `analytics_events`: no base `CREATE TABLE` in the repo; production volume per week unknown (600 rows total on 2026-07-20). One count settles M3/M4: `select count(*) from analytics_events where created_at > now() - interval '7 days';`
- `translation_sandwich_comparisons`: whether every production consult writes a row is established from `parallel-run.ts:1281` but the current monthly count is not — the H8 SQL settles it.
- `get_event_counts` (RPC): exists in production or not — settles whether M4's fallback is live.

## 4. RPC functions (the cap applies to set-returning RPC too)

| fn | returns | bounded? |
|---|---|---|
| `match_passages_bm25`, `match_passages_vector` | TABLE | by `match_count` (caller passes a top-K); corpus is 186 rows |
| `search_mentor_memory` | TABLE (`api/migrations/openbrain-memory-layer.sql:68`) | see the function's own `LIMIT`/`match_count` parameter — a memory search, small |
| `get_classifier_cost_summary` | TABLE (aggregate summary) | a handful of rows |
| `get_event_counts` | **no definition in the repo** | unknown — see M4 |
| `increment_api_usage`, `get_or_create_stripe_customer`, `upgrade_api_key_to_paid`, `downgrade_api_key_to_free`, `increment_structured_observation_count`, `insert_mentor_raw_input` | scalar / void | not at risk |

## 5. The two founder-hub sites (fixed this session)

`route.ts:1431` (POST `load_history`) and `:1780` (GET `?conversation_id=`) — both ascending, no limit, on a 1,013-row conversation. Replaced by `conversation-history.ts` (newest-window with explicit limit + exact count; keyset pagination with a cap-robust cursor). Executed regression test 74/0 with a cap-modelling fake and a negative control reproducing rows 981-1000; mutation-verified four ways.

## 6. Recommended remediation order

1. **Fix now, non-watched, numbers people act on:** H2–H7 (cost-health + abuse + SLO). The right fix in every case is the same: **stop fetching rows to aggregate them** — `count`/`sum`/`max`/`distinct`/percentiles in SQL (an RPC or a view), or at minimum a time-windowed read with an explicit limit and a disclosed `capped` flag. One `code-elevated` session; each route already has a test file to extend.
2. **Confirm then fix:** H8/M2 (`translation_sandwich_comparisons` month/7-day sums) and M3/M4 (`analytics_events`) — run the three SQL counts in §3 first; the fix shape is the same aggregate-in-SQL.
3. **Governing surface:** H9 — filter `mentor_interactions` by `profile_id` + window + order + limit in `computeRollingWindow`. Small, isolated, and closes a privacy smell at the same time.
4. **Data-rights class:** M5/M6 — one shared paging helper for every export/access/delete-driving read, with an honest `incomplete` marker. Compliance-class; not urgent by volume, urgent by kind.
5. **Report-only (WATCHED):** H1 + the tally's `agent_accreditation` reads — fix after the provenance-ledger observation window closes; note that the tally will cross the cap ≈ 2026-09-17, i.e. **during the window it measures** — the founder should know the instrument's own ceiling before reading its 2-week figure.
6. **Before Stripe activation:** M1 (invoice aggregation).

## 7. Inventory completeness — what was checked for reads the tool cannot see

- `.from(` with a non-literal table (`.from(table)`, `.from(TABLE)`): **covered** by the tool's second pattern (16 dynamic sites in the inventory).
- Builders assigned then bounded later: **covered** for same-function continuations (3 found, all confirmed). **Blind spot stated honestly:** a bound applied on only one branch would read as bounded; none of the three has a branch.
- Builders passed to a helper that applies the bound: none found.
- `.from(` in comments/strings: would be over-counted (false-positive direction), never missed.
- Raw `/rest/v1/` fetches: only the three RLS bypass-proof scripts, each filtered by a unique marker or id — bounded.
- Client-side reads: `website/src/app/community/page.tsx:92` — `.eq('id').single()` — bounded.
- Repo dirs outside `website/`: `sage-mentor/` swept (included); `trust-layer/` has zero selects; `harness/*.mjs` call the API, not the DB; `sdk/` has one `.from` (an example). No `supabase/functions` directory exists.
- Views read as tables: `api_key_usage_current`, `oikeiosis_stage_progression`, `premeditatio_engagement` (all classified above); `vulnerability_flag_owner_view` is not selected from anywhere.
- `.csv()`, `.explain()`, storage buckets: none.

## 8. Method

Mechanical inventory (`website/scripts/unbounded-select-sweep.ts`: full fluent-chain extraction across lines, string/template-literal aware, literal and identifier table names, assigned-builder continuation scan) → a per-table cardinality dossier from migrations + the decision log (the one workflow agent that survived the session limit; its facts are cited above where used) → first-hand read of the code around every candidate → this classification.

## 9. Limits (read before quoting a severity)

- **This classification is single-perspective.** The independent classify/verify workflow was launched three times and died three times on the account session limit (12 of 15, then 6 of 7 agents); only the dossier completed. Per PR19 §4 the review was completed first-hand; **an independent adversarial pass over THIS report is the carried, required follow-up** before any remediation session treats a `none`/`low` here as settled. Every `now` rests on a cited production count; every `no` on a structural reason you can check in the migration named; every `plausible`/`unlikely` on cardinality evidence that will age.
- Row counts are from the project record (dates given), not from a live query in this session; the three §3 SQL statements are how the founder makes them current.
- The tool is not a gate. Whether a lint-style gate on new unbounded reads is warranted is a question for after the first remediation session.
