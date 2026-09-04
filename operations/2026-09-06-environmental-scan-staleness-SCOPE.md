# Scope — the stale weekly environmental scan (carried item §4D)

**2026-09-06, `governance`.** Scoped, not run, per the carrying prompt: *"research is autonomous;
live data is not."* Every fact below was read from source on 2026-09-06. **No production read was
made**, and the question that decides the item's severity requires one.

**This note deliberately makes no disposition recommendation.** An earlier draft recommended removing
the two live call sites; that was prescribe-before-grounding (KG-EX1) — it proposed tearing out code
without establishing what the injection is *for*, and the project's own records suggest it may be
deliberate P7 scaffolding. The guard blocked it, correctly. What follows is the mechanism, the
finding, and the question.

---

## What the item actually is

Carried since 2026-07-07 as *"the stale weekly environmental scan (last 2026-06-22)"* — a one-line
follow-up never scoped. It is a **Layer-4 context injection**.

- **Loader:** `website/src/lib/context/environmental-context.ts` — reads the Supabase
  `environmental_context` table (`domain, current_summary, last_scanned`), with a static baseline at
  `website/src/data/environmental-context.json`.
- **Domains:** `ops` | `tech` | `growth` | `support`.

## What consumes it — and this is where the archive is stale

Archived tech-guide notes describe it as *"scaffolded, not routinely wired into core reasoning
endpoints"*, and `context-layer-summary.md` says it was *"removed from all product-facing endpoints
in Sessions 8-9 … reserved for internal agent sessions only (when environmental scans are activated
in P7)."* **The first is stale; the second is the key to the item.** Read from source today:

1. **`/api/skill/sage-classify`** — `route.ts:184` calls `getEnvironmentalContext('ops')` and appends
   the result **directly into `userContent`**, the LLM user message.
2. **`/api/skill/sage-prioritise`** — same pattern.

Both are **live R20a route-level perimeter members** (both appear in `manifest.md` §AC5's flag-gated
list). So scan output does reach production prompts.

`sage-reason-engine.ts` also declares `environmentalContext?: string | null` and appends it at
`:551-552`, but **no caller passes that parameter** — grep for `environmentalContext:` returns no
call site outside the engine itself. That path is inert; the two skill routes are the live consumers.

## The finding: nothing writes it

**No cron and no route writes `environmental_context`.** `vercel.json` schedules six crons —
`observability`, `trajectory-retention-sweep`, `narrative-sweep`, `trust-core-retention-sweep`,
`observability-retention-sweep`, `agent-hold-observations-retention-sweep` — and **none is the
weekly scan**. A grep across `src/app/api/` for `environmental_context` returns no writer.

The *"Weekly environmental scan (Monday 7:05 AM AEST)"* named as item 7g in
`operations/build-knowledge-extraction-2026-04-17.md` **is not present in this codebase.** That is
the substance of the item: not a job running late, but **no producer**, while two live routes read
what it was meant to produce. Whether that is an unfinished build or intentional pre-wiring for P7
is exactly what this note does not presume.

## Why the severity is bounded

The loader is **fail-safe by construction**:

```ts
if (!env) return null
if (!env.last_scanned) return null   // "Don't inject context if no scan has ever run"
```

It cannot bypass the R20a perimeter (both routes are members; the distress check is untouched) and
cannot affect verdict determinism on `/api/reason` or `/api/guardrail`, which do not consume it.
The worst case is **correctness of context** — feeding a model a false present tense.

## The one question, and who can answer it

**Founder-performable, read-only, one query:**

```sql
select domain, last_scanned, length(current_summary) as summary_chars
from environmental_context
order by domain;
```

**Branch A — zero rows, or `last_scanned` null on every row.** `getEnvironmentalContext` returns
`null`, nothing is appended, the consumers are inert. The item is **dormant**, and the honest record
is "a consumer pair awaiting a producer", not "a stale scan".

**Branch B — any row with `last_scanned` set.** Both live routes have been injecting an
environmental summary presented to the model as current, unrefreshed since that date. The carried
note says 2026-06-22, which would be roughly eleven weeks.

## The disposition question, left open for the founder

Under **either** branch the same question decides it, and it is a purpose question, not an
engineering one: **were those two call sites placed deliberately, to be fed when the scan is
activated in P7 — or are they an unfinished wiring?** `context-layer-summary.md` reads as the
former. If it is the former, nothing should be removed and the correct action is to record the
producer as P7-pending so this stops resurfacing as "staleness". If the latter, the options are to
build the producer or retire the consumers — both changes to live perimeter routes, each needing its
own session.

## Deliberately not done here

No production query. No code change. No recommendation on removing or retaining the call sites.
