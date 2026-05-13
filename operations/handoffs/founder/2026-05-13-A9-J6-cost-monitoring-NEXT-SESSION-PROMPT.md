# Next-Session Prompt — A9 + J6: Cost Monitoring on the Substrate Path + R5 Impact Assessment

**Stream:** founder.
**Tier:** mixed — `code-elevated` for A9 + `governance` for J6. Highest-risk sets session form per standing cache §"Work categories" — **Elevated** for the session as a whole.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day = `/adopted/substrate-plugin-staging-plan.md` §Stage 1 items A9 + J6).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md` (A7 server-side R20a gate Verified — most recent substrate-build close).
**Predecessor decision-log entries (most recent first):** `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`; `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`.
**Risk classification:** **Elevated** under 0d-ii (changes to existing user-facing functionality — R5 cost-as-health-metric alerts). Critical Change Protocol **NOT engaged** (no auth, no encryption, no R20a perimeter, no deployment configuration change). AC7 **NOT engaged**. PR6 **NOT engaged**.

## Why this session matters

A9 and J6 are the cost-shape reckoning for the substrate path. Today the translation-sandwich captures Layer 1 + Layer 3 LLM costs via `sonnetCostMicrocents` in `parallel-run.ts` and writes them to the `translation_sandwich_comparisons` + `translation_sandwich_cost_tracker` tables. The R5 cost-as-health-metric alerts (per `/manifest.md` §R5: "Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend") were designed against the bundled-engine cost shape — pre-substrate. With the substrate path now the sole user-facing engine on `/api/reason` post-M1-CP6 cutover, A9 re-points the alerts to the new cost source. J6 sits alongside: it is the governance assessment of how the cost shape changes under the substrate + plugin paradigm (Layer 1 cost shifts to plugin at Stage 3; Layer 2 cost near-zero; Layer 3 cost stays metered) and whether R5's 2x revenue:cost ratio threshold remains appropriate. J6's assessment informs A9's threshold decisions.

## Pre-conditions

1. **A7 commit pushed.** Confirm `git log --oneline -3 origin/main` shows the A7 scaffolding commit on top, preceded by the 2026-05-13 agentic-commerce commit, preceded by the A5 commit. Out-of-order commits break the chain.
2. **A7 verification clean between sessions.** Founder confirms at session-open that the six verification checks from the A7 close ran clean: `tsc --noEmit` clean; A7 tests 33/33 pass; A5 regression 28/28 pass; invocation greps confirmed (enforceLayer2R20aGate ≥2; isSubstrateR20aGateEnabled ≥2; attachDistressSignalToAssessment ≥2); production state probes (`/api/substrate/layer3` 503; `/api/public-key` PASS).
3. **A7 status: Verified.** No regression since A7 session.
4. **A1–A5 still Verified.** No regression since A5 session.
5. **Founder commits to a 1-2 hour bounded session** — Elevated-tier, lean+Elevated templates.
6. **Production state unchanged from A7 close.** Both `SUBSTRATE_LAYER3_ENABLED` and `SUBSTRATE_R20A_GATE_ENABLED` env vars UNSET in Vercel; `/api/reason` byte-identical to pre-A7; `/api/substrate/layer3` returns 503.

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier; model selection (N/A — no LLM calls this session); status vocabulary; signals; risk classification; Elevated-tier additions to the lean template.
2. **`/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`** (~5 min) — predecessor close; confirms A7 Verified + production state unchanged + new cost-capture surfaces from A7 (none — A7 doesn't add LLM calls).
3. **`/adopted/substrate-plugin-staging-plan.md`** §Stage 1 items A9 + J6 (~3 min) — the operative item descriptions; estimated sessions; dependencies.
4. **`/manifest.md`** §R5 (Free Tier and Cost Guardrail) — the rule A9 enforces. Read in full. R5 also names the Sage Ops $100/month cap which is OUT OF SCOPE for this session (Sage Ops Operational Boundaries are R15; A9 is about the substrate path, not Sage Ops).
5. **`/website/src/lib/translation-sandwich/parallel-run.ts`** §"COST CALCULATION" + §"COST-TRACKER OPERATIONS" (~5 min) — current cost capture infrastructure. Key functions: `sonnetCostMicrocents`; `readCostTracker`; `incrementCostTracker`; the `translation_sandwich_cost_tracker` table. Note: `incrementCostTracker` is wired in the deprecated `runParallelSandwich` path only; the production `runSandwich` path captures cost on the comparison row but does NOT increment the cost tracker (the parallel-run mechanism was retired at M1-CP6).
6. **`/operations/decision-log.md`** — read the last 3 entries (`D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`; `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`) for the most recent substrate-build context.

**Confirm at session open** (state explicitly, briefly):

- Tier: mixed code-elevated + governance; session-as-a-whole Elevated
- Hold-point status: P0 0h active
- Model selection: N/A — A9 + J6 add no new LLM calls; existing Sonnet cost capture for Layer 1 + Layer 3 is unchanged
- Status vocabulary: implementation `Scoped → ... → Live`; decision `Adopted / Under review / Superseded`
- Signals + risk classification: Elevated; CCP not engaged; AC7 + PR6 not engaged
- PR10 PEV loop applies (Plan + Execute + Verify with diagnostic-certainty signalling) in lean form
- PR11 (authoritative-current-sources) — at session-open, scan `/inbox/` for any new R5 / cost-related material dated since 2026-05-13
- PR16 positioning + dogfood lens — applied per item

## Part B — Procedure

### Step 1 — J6 first (~20-30 min): R5 cost-shape impact assessment

**Why J6 before A9:** J6's assessment of cost shape under the substrate + plugin paradigm informs A9's threshold decisions. Doing J6 first means A9 doesn't get re-pointed against thresholds that are then revisited.

Produce a short assessment document at `/operations/r5-cost-shape-impact-assessment-2026-MM-DD.md`. Cover:

1. **Current cost shape (pre-substrate, bundled-engine baseline).** Per pre-M1-CP6 state. Single LLM call per `/api/reason` request; cost = Sonnet input + output tokens.
2. **Substrate path cost shape (post-M1-CP6, current).** Layer 1 LLM (Sonnet via extractFeatures) + Layer 2 deterministic (zero LLM cost) + Layer 3 LLM (Sonnet via generateProse). Cost capture: layer1_cost_usd_microcents + layer3_cost_usd_microcents in the comparison row. Total per request = Layer 1 cost + Layer 3 cost.
3. **Future cost shape (plugin paradigm, Stage 3+).** Layer 1 LLM cost shifts to the plugin (the plugin runs Layer 1 locally on the agent developer's substrate; SageReasoning does not pay). Layer 2 cost remains near-zero. Layer 3 cost remains metered (Sonnet via generateProse). Total cost SageReasoning pays per plugin-originated request = Layer 3 cost only.
4. **R5 2x revenue:cost ratio implications.** Calculate the cost shape change's impact on the 2x threshold. For human-facing /api/reason traffic, total cost is Layer 1 + Layer 3 (no change from current). For future plugin-originated traffic, total cost is Layer 3 only (lower). Paid-tier revenue requirements scale accordingly.
5. **Alert threshold recommendations.** Does the "2x rolling 7-day average daily spend" threshold need adjustment? Default recommendation: keep the multiplier (the math is self-adjusting), but split the alert into per-path metrics so plugin-originated cost growth doesn't mask human-facing cost regression (or vice versa).
6. **Layer 1 cost migration timing.** When does the Layer 1 cost shift to plugin happen in practice? Per the staging plan, this is gated on Stage 3 plugin-tools work. Until then, all /api/reason traffic pays Layer 1 cost server-side. The assessment should note this is a forward-looking expectation, not current state.

Save to `/operations/r5-cost-shape-impact-assessment-YYYY-MM-DD.md`. Cross-reference in A9's decision-log entry.

### Step 2 — A9 (~30-45 min): Re-point R5 cost-as-health-metric alerts

**Audit first** (~10 min):

1. Grep the codebase for R5 alert sources. Search: `cost-as-health-metric`, `cost_health`, `R5 alert`, `daily spend`, `rolling 7-day`, `2x` (in cost contexts).
2. Identify the current alert mechanism. Check: `/website/src/lib/r20a-cost-tracker.ts` (for the classifier path); `/website/src/lib/translation-sandwich/parallel-run.ts` (for the substrate path); any cron jobs or scheduled tasks; any Vercel cron config; Supabase scheduled functions.
3. Likely finding: alerts may be defined only in governance docs, not in code yet. If so, A9 becomes "scaffold the alert mechanism for the substrate path" rather than "re-point existing alerts". This is a scope determination at session-open.

**Branch (a) — alerts exist and need re-pointing.** Update the cost source from bundled-engine to translation-sandwich. Verify thresholds match J6's recommendations from Step 1.

**Branch (b) — alerts don't yet exist (R5 is governance-only).** Scaffold the alert mechanism per J6's recommendations. Likely shape: a scheduled function that reads the `translation_sandwich_cost_tracker` table (or queries the comparison table for rolling-window cost), compares against threshold, writes to an alerts table or emits a structured-log line for Sage Ops to consume. Time-bound: don't over-engineer; the minimum viable alert is a structured-log emission with the agreed shape.

**Branch (c) — cost tracker itself is not wired in the production runSandwich path.** Per the predecessor parallel-run.ts read note: `incrementCostTracker` is called from the deprecated `runParallelSandwich`, not the production `runSandwich`. The cost capture happens on the comparison row but the tracker isn't incremented per request post-M1-CP6. This means R5 alerts have NO production data source today. A9 likely includes wiring `incrementCostTracker` (or an equivalent) into the production path. **This branch is the most likely state.**

Founder elects branch at session-open after audit.

### Step 3 — Verify (~15-20 min)

For Branch (c) — the most-likely path:

```bash
# 1. TypeScript compile
cd website && npx tsc --noEmit -p tsconfig.json && cd ..
# Expected: zero errors.

# 2. Invocation grep — A9's cost-tracker increment is wired in the production path
grep -cn "incrementCostTracker\|recordSubstrateCost" website/src/lib/translation-sandwich/parallel-run.ts
# Expected: >= 2 (call sites at the end of the production runSandwich path)

# 3. Schema check — confirm translation_sandwich_cost_tracker table exists
# (Founder runs in Supabase SQL Editor; expected: row id=1 with rolling cost data)

# 4. Production state probes — substrate steady state preserved
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503 (A5 still gated OFF).
curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "import json,sys; d=json.load(sys.stdin); print('PASS' if d.get('previous') is None and d.get('algorithm')=='Ed25519' else 'FAIL')"
# Expected: PASS.
```

For Branch (a) or Branch (b), the verification commands adapt to what was wired — confirm via grep that the alert source / threshold is the substrate path, not the bundled engine.

### Step 4 — Append decision-log entry (lean form per cache)

Entry ID: `D-A9-J6-COST-MONITORING-WIRED-YYYY-MM-DD`. Lean template per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry":

- **Decision** — what got done (J6 assessment produced + A9 alert re-pointing or scaffolding).
- **Reasoning** — why (R5 cost-shape change post-M1-CP6 + substrate path now sole user-facing engine). Cross-reference `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13` (predecessor substrate-build entry).
- **Files touched** — list (J6 assessment doc; A9 code/config changes).
- **Risk classification** — Elevated under 0d-ii. AC7 not engaged. PR6 not engaged.
- **Rollback path** — `git revert` for code changes; J6 doc can be revised in place since it's an assessment not a decision.
- **Verification step** — commands from Step 3.
- **Open questions** — any R5 thresholds or migration timing questions deferred for later.
- **Rules served** — R5; PR11; PR16; 0c; 0d-ii; 0f. PR1 may engage if A9 is scaffolded as a single-endpoint proof (the substrate path on /api/reason).
- **Status** — Adopted. Cross-references: predecessor entries; staging plan §A9 + §J6; new J6 assessment doc path; modified files.

### Step 5 — Session close (lean form per cache)

Path: `/operations/handoffs/founder/YYYY-MM-DD-A9-J6-cost-monitoring-close.md`. Lean template per `/adopted/standing-protocol-cache.md` §"Lean session close":

- **Decisions Made** — entry ID + one-line summary
- **Status Changes** — A9 Scoped → Wired or Verified; J6 Scoped → Adopted; cost-tracker integration status changes
- **Next Session Should** — A6 prose_mode templates OR A10 per-agent credentials kickoff OR A11a audits per founder election
- **Blocked On** — uncommitted files + production state at session close
- **Open Questions** — any deferred
- **Founder Verification** — commands from Step 3 + commit command
- **Cross-references** — predecessor close; this session's decision-log entry; modified files; J6 assessment doc

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + deliverable reads (Part A) | 15-20 min |
| Step 1 — J6 assessment doc | 20-30 min |
| Step 2 — A9 audit + scaffold/re-point | 30-45 min |
| Step 3 — Verify | 15-20 min |
| Decision-log + close | 20-30 min |
| **Total** | **~1.5-2.5 hours** |

## Rollback path

Code changes (A9): `git revert <session-commit>` and push via GitHub Desktop. Vercel auto-redeploys prior A7-Verified state. Cost tracker reverts to its pre-A9 state (likely not-incremented-in-production-path). Governance assessment (J6): the document at `/operations/r5-cost-shape-impact-assessment-YYYY-MM-DD.md` can be revised in place via a follow-up edit (assessments aren't decision-binding — they're inputs to decisions; revisable).

If A9 wires a new schedule/cron/alert that emits to a Supabase table or external service, rollback includes pausing the schedule + clearing any test alerts to avoid noisy steady-state.

## Forecast

Successful A9 + J6 produces:

- A J6 assessment doc capturing the cost-shape change under substrate + plugin paradigm with R5 ratio implications
- A9 code changes that ensure R5 cost-as-health-metric alerts fire from the substrate path (either by re-pointing existing alerts, or scaffolding the alert mechanism if none existed in code)
- Production cost tracking that reflects the current /api/reason path (substrate + cost capture wired in production runSandwich, not just the deprecated parallel-run)
- Decision-log entry + session close recording the R5 alignment

**Stage 1 status after A9 + J6:** existing critical chain A1→A2→A3→A4→A5→A7 + cost monitoring (A9 + J6) complete. Stage 1 remaining items: A6 (prose_mode templates), A8 (V3 endpoint relationship design), A10-A19 (Stage 1 expansion items). Substrate operationally ready for K-category migration prep (Stage 2 still gated on A10 + Stage 1 close).

**Next session after A9 + J6:** A6 prose_mode templates (Standard; ~2-3hr), A10 per-agent credentials kickoff (Critical; ~3-4hr; consumes the AP2 mandate candidate), A11a endpoint-auth audits (Standard; ~1hr), or A8 V3 endpoint mapping (Standard; ~1-2hr) — per founder election.

End of prompt.
