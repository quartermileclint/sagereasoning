# Next session — Observability retention sweep (C-1) activation

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `code-critical` (0d-ii — "env flags activating new surfaces," per the route's own header
comment). AC7 (Critical Change Protocol) engaged: this activates a live, unattended data-deletion
path against two production tables for the first time.** No code is written this session — the
route, handler, flag, and tests already exist, built and independently reviewed. This session's
entire job is a founder-walked *deployment-configuration* change (env var + `vercel.json` cron
entry + redeploy) plus live verification. Model/effort: whatever the founder's session default is;
nothing here calls for a higher tier than usual reasoning.

**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor build session:** `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10` (built the sweep dark,
independently reviewed, three confirmed defects found and fixed at the root — read that entry's "The
C-1 sweep, and what the independent review found" section before touching anything, so you know what
was already caught and why the fixes look the way they do).
**The code itself:**
`website/src/app/api/cron/observability-retention-sweep/route.ts` (thin GET wrapper) +
`.../handler.ts` (the testable implementation) + `website/src/lib/observability-store.ts` (the flag,
`isObservabilitySweepEnabled()`, and the two purge functions `purgeExpiredRouteErrors`/
`purgeExpiredThrottleEvents`). Battery: `__tests__/route.test.ts`, 50/0 as of this writing — re-run it
at open to confirm nothing regressed since the predecessor session.

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. Re-derive
current state fresh; do not inherit a cycle count from memory. **This activation does not touch any of
that prompt's fenced surfaces** (`SUBSTRATE_FRESH_ENABLED`/`SUBSTRATE_WATCHING_ENABLED`/
`SUBSTRATE_LOOP_ID_FIELD_ENABLED`, the outcome vocabularies, the idea-loop credential, or the
`/api/reason`/`/api/guardrail`/`/api/practice/fresh`/`/api/practice/watching` contracts) — but it is
worth naming explicitly why it's safe: `logRouteError`/`logThrottleEvent` (the WRITE side into
`route_errors`/`throttle_events`) are already live everywhere, unconditionally, and unaffected by this
session's flag. This session only turns on the **deletion** of old rows past `retain_until`. The
runner's calls to those four routes will continue writing exactly as before, whether or not this
sweep is on. Still, re-check the pre-flight per its own instruction rather than trusting this
paragraph's reasoning alone — it was written before this session opened.

---

## Why this matters (read before touching anything)

`route_errors` (#5) and `throttle_events` (#8) have each carried a `retain_until` column **and an
index on it** since their migrations (2026-07-20) — the schema has always declared 90-day retention.
**Nothing has ever enforced it.** Neither table is reachable by the user-JWT data-rights paths
(`/api/user/delete`, `/api/user/export`) — both are service-role-only, and `throttle_events` stores
only a hashed IP, no owner — so this sweep is their **only** genuine-deletion mechanism. The
2026-08-01 Fable-5 regrounding audit named this gap as C-1; the predecessor session closed the build
half but deliberately left activation as "its own founder-walked Critical step," per the route's own
header comment. This session executes that step.

**Read live at the point this prompt was authored (2026-08-12), production:**
- `route_errors`: 1 row, 0 past `retain_until`.
- `throttle_events`: 1,584 rows, 0 past `retain_until`.

**This means the first live sweep run after activation will legitimately report `deleted: {route_errors: 0, throttle_events: 0}`.** That is not a sign the sweep is broken — nothing in either table is actually 90 days old yet (the tables are five weeks old at most). Re-check both counts at the start of this session rather than trusting the numbers above, which will have drifted.

---

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md`.
2. This prompt in full.
3. `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10` (decision-log) — the build + independent-review
   section specifically. Confirm you understand the three defects that were found and fixed
   (`isMissingTableError`'s column-vs-table false-benign trap; the unsafe `(e as Error).message` cast
   that could throw fresh from inside a catch block; the battery's captured-filter-column-but-not-value
   vacuity) — you are not re-fixing these, but you should be able to recognise if any of them has
   regressed.
4. Read `website/src/app/api/cron/observability-retention-sweep/route.ts`,
   `.../handler.ts`, and the retention-sweep section of `website/src/lib/observability-store.ts`
   (search `RETENTION SWEEP (C-1)`) directly — do not rely on this prompt's paraphrase.
5. Read one sibling activation for the exact discipline this repo uses (the shape is identical):
   `D-MECHANISM-CORRECTION-TRAJECTORY-B1-ACTIVATION-2026-06-14` (decision-log) — flag flip in Vercel,
   `vercel.json` cron entry, redeploy, live smoke, all founder-walked.

**Confirm at open:** tier (`code-critical`, AC7 engaged); hold-point status; that
`SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED` is currently unset in Vercel Production (check the dashboard,
don't assume); that no `vercel.json` cron entry for this route exists yet (confirmed absent as of this
writing — re-check, since `vercel.json` may have changed since); the current row counts in both
tables (re-run the two counts above).

---

## Part B — Procedure

### Step 1 — Re-verify the battery (Standard; no code change expected)

```bash
cd website && npx tsx src/app/api/cron/observability-retention-sweep/__tests__/route.test.ts
```

Expect `50 passed, 0 failed`. If anything has regressed, stop and diagnose before proceeding to any
live step — do not activate a sweep whose own tests are failing.

### Step 2 — Add the `vercel.json` cron entry (repo change, founder commits)

Add a fifth entry to `website/vercel.json`'s `crons` array, matching the sibling sweeps' daily
schedule (the three existing daily crons all run `"0 8 * * *"` — UTC 08:00 — so this sweep runs
alongside them in the same batch, not scattered across the day for no reason):

```json
{
  "path": "/api/cron/observability-retention-sweep",
  "schedule": "0 8 * * *"
}
```

This is the only file this session edits. The route/handler/store code is already correct and
untouched. Commit with a message naming the activation and the predecessor build entry; the founder
pushes.

### Step 3 — Set the flag in Vercel Production (founder-walked, PR17)

`SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED=true` in the Vercel dashboard, Production environment. Do this
**after** Step 2's commit is pushed and Vercel has redeployed — flag-before-code-in-place would be a
no-op (the code reading the flag has to exist on the deployed build first), and code-before-flag is
harmless (an unset flag reports `{ ok: true, flag_enabled: false }`, no DB work) — so either order is
safe, but pushing the cron-entry commit first means the flag flip is the last step and its effect is
immediately observable.

### Step 4 — Redeploy and confirm green

Standard Vercel redeploy after the flag is set (Vercel typically redeploys automatically on an env-var
change in some configurations — confirm whether this project does, or trigger a redeploy manually).
Wait for green before proceeding.

### Step 5 — Live smoke (founder-walked; the AI drafts the `curl`, founder runs it with the real `CRON_SECRET`)

Two calls, in order:

**5a — auth check (expect 401):**
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.sagereasoning.com/api/cron/observability-retention-sweep
```
No `Authorization` header → expect `401`.

**5b — the real invocation (expect 200, flag_enabled:true):**
```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  https://www.sagereasoning.com/api/cron/observability-retention-sweep | jq .
```
Expect:
```json
{
  "ok": true,
  "ran_at": "<timestamp>",
  "flag_enabled": true,
  "deleted": { "route_errors": 0, "throttle_events": 0 },
  "errors": []
}
```
The `deleted` counts being `0` is expected (see "Why this matters," above) **unless** the row counts
you re-checked at open showed something already past `retain_until` — in that case, expect a
non-zero count matching what you observed, and re-read the affected table afterward to confirm exactly
that many rows are gone, no more.

**If either purge reports a non-empty `errors[]` entry:** stop, do not treat it as a transient glitch.
Read the error string (it will be prefixed `route_errors:` or `throttle_events:`), and check first
whether it is the `isMissingTableError` classifier failing to recognise a real error as such (the
exact class the predecessor review hardened) — if so, this is a regression of a fixed defect, not a
new problem to route around.

### Step 6 — Let one real cron cycle run, or force one, before closing

The cron fires at UTC 08:00 daily. If this session runs well before or after that time, either (a)
close the session with the manual smoke from Step 5 as sufficient live verification, noting in the
close that the first *scheduled* (not manually-triggered) run hasn't been observed yet, or (b) if the
founder wants to see a real scheduled fire before closing, wait for it — the founder's call, not a
requirement.

### Step 7 — Close (lean form) + decision log

Record: the `vercel.json` diff; the flag flip; the live smoke result (paste the actual JSON, not a
paraphrase); the row counts before and after (if any deletion occurred); explicit confirmation that
this closes C-1. Cross-reference `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`. Update `CLAUDE.md`'s
one line currently reading *"The C-1 observability retention sweep is BUILT DARK
(`SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED`, unset, no `vercel.json` entry)"* to state it is now Live,
scheduled, and smoke-verified — matching the phrasing convention used for the sibling sweeps
(trajectory-retention-sweep, trust-core-retention-sweep, narrative-sweep) already documented as Live
in that file's "Live in production" list.

---

## What is NOT in scope

- No change to `route.ts`, `handler.ts`, or `observability-store.ts` — the code is done and reviewed.
  If this session finds a genuine defect in it, that is its own, separate finding — fix it as a
  distinct, disclosed step, do not silently patch-and-activate in the same breath.
- No change to the sweep's schedule cadence beyond matching the sibling daily crons (`"0 8 * * *"`) —
  if the founder wants a different cadence, that's a explicit choice to record, not a default to
  assume.
- No touch to `route_errors`/`throttle_events`'s write paths (`logRouteError`/`logThrottleEvent`,
  already live everywhere) — this session activates deletion only.
- No touch to any other cron (`observability`, `trajectory-retention-sweep`, `narrative-sweep`,
  `trust-core-retention-sweep`) beyond adding this one alongside them in `vercel.json`.
- Does not open PR24's other named gap (`agent_hold_observations` and `stoa_entries` retention parity)
  — that is its own carried item, not folded into this session just because it's adjacent.

## Rollback

Unset `SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED` in Vercel + redeploy — the route reverts to
`{ ok: true, flag_enabled: false }`, byte-identical to its pre-activation behaviour, no DB work. The
`vercel.json` cron entry can be removed independently (a scheduled call to a flag-off route is
harmless, so removing the entry and unsetting the flag are two independent, either-order-safe
rollback actions). No schema to reverse — the two tables and their `retain_until` columns predate this
session and are untouched by it.

## Forecast

Success = `SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED=true` in Vercel Production, a fifth `vercel.json` cron
entry alongside the three existing daily sweeps, a green deploy, a live smoke showing
`flag_enabled: true` and an honest (likely zero, for now) deletion count, and C-1 recorded as fully
closed in both the decision log and `CLAUDE.md`. This is a short session — the code work is already
done; the substance here is founder-walked deployment discipline and honest live verification, not
new engineering.

End of prompt.
