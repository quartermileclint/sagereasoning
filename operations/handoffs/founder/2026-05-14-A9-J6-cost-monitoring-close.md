# Session Close — 2026-05-14 — A9 + J6 Cost Monitoring on the Substrate Path + R5 Impact Assessment

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache). Deliverable-of-the-day: `/adopted/substrate-plugin-staging-plan.md` §Stage 1 items A9 + J6.
**Tier:** mixed `code-elevated` (A9) + `governance` (J6); session-as-a-whole **Elevated** risk under 0d-ii. Lean + Elevated additions per cache.
**Date:** 2026-05-14.
**Predecessor close (substrate-build):** `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md` (A7 server-side R20a gate Verified).
**Operative session prompt:** in-chat A9 + J6 next-session prompt.

---

## Decisions Made

- `D-A9-J6-COST-MONITORING-WIRED-2026-05-14` appended (+~80 lines). Stage 1 items A9 (cost monitoring on the substrate path) + J6 (R5 cost-shape impact assessment) reach **Verified** (A9) / **Adopted as governance input** (J6) under founder-elected **Option B** scope (re-point LLM cost source from heuristic to substrate data + scaffold the manifest-named "2x rolling 7-day average daily spend" alert). Option C deferred to protect against accidental short-circuit of live `/api/reason` traffic via re-activated M1-CP4 cost cap. PR12 negative-finding discipline applied at audit-step: the prompt's three-branch framing was found to be more nuanced than presented (Branch (a) and (b) overlap; Branch (c) carries a side-effect risk); recalibration surfaced to founder before branch election. PR11 inbox scan: three files dated since 2026-05-13 — none R5/cost-related. J6 assessment produced as a revisable governance input (not a binding decision) covering bundled-engine baseline → substrate cost shape → future plugin shape, R5 ratio implications, alert threshold recommendations, and Layer 1 cost migration timing. PR16 positioning + dogfood lens: substrate cost source strengthens Character Kernel positioning.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 A9 (Cost monitoring on the substrate path) | Scoped | **Verified** (on `/api/billing/usage-summary` PR1 single-endpoint proof) |
| Stage 1 J6 (R5 cost-as-health-metric impact assessment) | Scoped | **Adopted as governance input** (revisable in place) |
| `/operations/r5-cost-shape-impact-assessment-2026-05-14.md` | did not exist | NEW (~135 lines; six sections + three open questions) |
| `/website/src/app/api/billing/usage-summary/route.ts` LLM cost source | heuristic (`totalApiCalls × $0.005`) | substrate-derived (SUM over `translation_sandwich_comparisons` for the period) with defensive fallback |
| R5 manifest "2x rolling 7-day average daily spend" alert | constant defined but unwired | **Wired** in `/api/billing/usage-summary` with cold-start guard (≥3 days observed) |
| Response schema on `/api/billing/usage-summary` | prior | extended: `metrics.cost_source` + `metrics.rolling_seven_day` block + `thresholds.rolling_seven_day_alert_multiplier` |
| `COST_HEALTH.ROLLING_AVERAGE_ALERT_MULTIPLIER` (in `/website/src/lib/stripe.ts`) | defined but unused | read by alert logic (3 references in route) |
| Substrate production | A7 Verified; flag UNSET; `/api/public-key` steady state | **unchanged** — A9 doesn't touch substrate hot path or env vars |

---

## Next Session Should

The build arc proceeds. Four valid elections per the A7 close's Next Session Should and the staging plan post-A9 + J6 state:

- **Option A — A6 prose_mode per-mode templates** (Standard; ~2-3hr). Closes A5.5 parameter-plumbing-only scope by filling in clinical/terse/standard/educational templates. F3 fold-in applies (A6 session references A5). Recommended if K-category migration prep is the priority.
- **Option B — A10 per-agent credentials kickoff + token-format ADR** (Critical; ~3-4hr; token-format ADR drafted in-session). The highest-leverage Critical item — token-format ADR now consumes four candidates (JWT / W3C VC / AP2-style mandate / hybrid) per the 2026-05-13 agentic-commerce upstream re-work. Recommended if Stage 1 critical-path expansion is the priority.
- **Option C — A11a endpoint-auth audits** (Standard; ~1hr). Lean parallel-track work; not on the critical path; routine governance fit.
- **Option D — A8 V3 endpoint relationship design** (Standard; ~1-2hr). Produces the mapping document for how each existing `/api/score-*` endpoint becomes a plugin-internal tool wrapper after migration. Recommended if K-category prep clarity is the priority.

**Founder elects at next session-open.**

**Pre-conditions for any next session:**
1. This session's work committed to origin/main (commit command in §"Founder Verification" below).
2. Founder runs the production-state verification probes between sessions to confirm substrate steady state preserved (A7 flag UNSET; A5 flag UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503).
3. (Optional) Founder visits `/api/billing/usage-summary` as admin after Vercel redeploys to confirm the new `metrics.cost_source` and `metrics.rolling_seven_day` fields appear in the response.

**Next-session prompt:** to be drafted at the start of the next session. Standing protocol cache + this close + the A9 + J6 decision-log entry are sufficient session-opening references for any of the four options.

---

## Blocked On

**Files uncommitted (to be committed by founder before next session):**

```
?? operations/r5-cost-shape-impact-assessment-2026-05-14.md
M  operations/decision-log.md
M  website/src/app/api/billing/usage-summary/route.ts
?? operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md
```

**Production state at session close:** unchanged from session start (and from 2026-05-13 A7 close). Substrate at A7 Verified. `/api/public-key` serves steady-state shape (`previous: null`; `rotation_overlap_until: null`; `algorithm: Ed25519`). `SUBSTRATE_LAYER3_ENABLED` env var UNSET. `SUBSTRATE_R20A_GATE_ENABLED` env var UNSET. `/api/reason` behaviour byte-identical to pre-A7 (A9 did not touch the user-facing reasoning path). `/api/substrate/layer3` returns 503 (A5 flag unset). All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. Vercel state: A9 modifies `/api/billing/usage-summary` (admin endpoint); Vercel will redeploy on push — the admin endpoint will return the extended schema (new `cost_source` + `rolling_seven_day` fields) starting on first request post-deploy; no env-var changes; no schema migrations; no auth-surface changes; no R20a perimeter changes (AC5 perimeter intact).

---

## Open Questions

**New open questions surfaced this session (per J6 §"Open questions" + A9 decision-log entry):**

1. **Cap defaults review (deferred from Option C).** If `incrementCostTracker` is ever wired into production `runSandwich`, the M1-CP4 cap defaults ($50 / 1000 req / 14 days) must be reviewed against the substrate sole-engine state before activation. Revisit condition: explicit founder direction to activate production cost-cap short-circuiting.
2. **Per-path metric split trigger.** Per J6 §4, the revenue:cost metric should split into human-facing vs plugin-originated when plugin-originated traffic becomes non-trivial. Working definition: ≥10% of `/api/reason` traffic over a 7-day window is plugin-originated, OR Stage 3 close is reached. Revisit condition: either trigger fires.
3. **Alert delivery surface (push vs pull).** Today's alerts surface only when an admin visits `/api/billing/usage-summary`. Push delivery (email/webhook/scheduled task) is out of scope for A9 Option B. Revisit condition: founder direction OR Sage Ops activation at P7.

**Carry-forward open questions from predecessor sessions (still open):**

- A7 production activation timing — unchanged this session; A7 + A5.4 third-layer defence still gated on Critical Change Protocol re-engagement for the flag-flip.
- A5.4 production activation timing — unchanged this session.
- AC2 latency budget verification for the fresh-call path — unchanged this session.
- Component-registry update batching — A9 + J6 join the deferred batch with A1-A5 + A7 entries.

---

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Stage 1 A9 + J6: cost monitoring on the substrate path + R5 impact assessment

A9 reaches Verified on /api/billing/usage-summary PR1 single-endpoint proof.
J6 adopted as governance input (revisable in place).

Founder elected Option B at session-open: re-point LLM cost source from
heuristic to substrate data + scaffold the manifest-named '2x rolling 7-day
average daily spend' alert. Option C deferred (would re-activate legacy
M1-CP4 cost cap on live /api/reason traffic).

Files:
- operations/r5-cost-shape-impact-assessment-2026-05-14.md (NEW; J6
  deliverable; six sections + three open questions; revisable).
- website/src/app/api/billing/usage-summary/route.ts (MODIFIED;
  ~80 line addition).
  - LLM cost source re-pointed from totalApiCalls * \$0.005 heuristic
    to SUM over translation_sandwich_comparisons for the period, with
    defensive fallback if the substrate query fails or returns zero rows.
  - Rolling 7-day daily-spend alert scaffolded: prior-7-day average
    excluding today, fires R5 ALERT when today >= 2.0x average AND
    >= 3 prior days observed (cold-start guard).
  - Response schema extended: metrics.cost_source + metrics.rolling_seven_day
    + thresholds.rolling_seven_day_alert_multiplier.

Production state at commit: unchanged. Substrate at A7 Verified;
SUBSTRATE_R20A_GATE_ENABLED + SUBSTRATE_LAYER3_ENABLED both UNSET in
Vercel; /api/reason behaviour byte-identical; /api/substrate/layer3
returns 503. A9 touches only the admin /api/billing/usage-summary
endpoint; no user-facing reasoning-path change.

Verification:
- TypeScript clean compile (tsc --noEmit; EXIT_CODE=0).
- A7 regression: 33/33 PASS.
- A5 regression: 28/28 PASS.
- Invocation greps: translation_sandwich_comparisons 4 occurrences in
  route; ROLLING_AVERAGE_ALERT_MULTIPLIER 3 occurrences; R5 ALERT 3
  occurrences (ratio + sage-ops + rolling); cost_source field present.

PR11 (inbox scan): three files dated since 2026-05-13 — none R5/cost-related.
PR12 (negative-finding): prompt's three-branch framing recalibrated at audit
before founder election.
PR13 (consider-implications): applied at audit.
PR16 (positioning + dogfood): substrate cost source strengthens Character
Kernel positioning; substrate-consultable via /api/billing/usage-summary.

Decision-log entries appended:
- D-A9-J6-COST-MONITORING-WIRED-2026-05-14

Next session: A6 prose_mode templates OR A10 per-agent credentials kickoff
OR A11a audits OR A8 V3 endpoint mapping per founder election."
```

Then push via GitHub Desktop. Vercel redeploy expected: `/api/billing/usage-summary` returns the extended schema on first request post-deploy. No user-facing route changes; no env-var changes; no DB schema changes.

**Between-session verification (Clinton runs locally):**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm commit + push
git log --oneline -3 origin/main
# Expected: top commit = the A9 + J6 commit; preceded by 2026-05-13 A7.

# 2. TypeScript compile (expected: clean)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..

# 3. A5 regression check (expected: 28 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..

# 4. A7 regression check (expected: 33 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..

# 5. Invocation greps
grep -cn "translation_sandwich_comparisons" website/src/app/api/billing/usage-summary/route.ts
# Expected: >= 2

grep -cn "ROLLING_AVERAGE_ALERT_MULTIPLIER" website/src/app/api/billing/usage-summary/route.ts
# Expected: >= 2

grep -cn "R5 ALERT:" website/src/app/api/billing/usage-summary/route.ts
# Expected: 3

# 6. Substrate steady state (production unchanged)
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503

curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS' if ok else 'FAIL')
"
# Expected: PASS
```

If any check fails, A9 has regressed; `git revert` and push to roll back. The endpoint reverts to the prior heuristic cost source; no data loss (the comparison rows are untouched).

---

## Cross-references

- Operative session prompt: in-chat A9 + J6 next-session prompt.
- Predecessor close (substrate-build): `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`.
- Predecessor decision-log entries: `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`; `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`.
- This session's decision-log entry: `D-A9-J6-COST-MONITORING-WIRED-2026-05-14`.
- Adopted artefacts (new + modified):
  - `/operations/r5-cost-shape-impact-assessment-2026-05-14.md` (NEW — J6 deliverable)
  - `/website/src/app/api/billing/usage-summary/route.ts` (MODIFIED — A9 changes)
  - `/operations/decision-log.md` (entry appended)
- Governing frame:
  - `/manifest.md` §R5 (both alert rules now wired)
  - `/adopted/substrate-plugin-staging-plan.md` Stage 1 A9 + J6 (success criteria SATISFIED)
  - `/website/src/lib/stripe.ts` (`COST_HEALTH` constants — `ROLLING_AVERAGE_ALERT_MULTIPLIER` now read by alert logic)
  - `/website/src/lib/translation-sandwich/parallel-run.ts` (cost capture infrastructure — reused unchanged)
  - `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` (schema reference; index on `created_at DESC` ensures efficient window query)
  - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (J1 ADR — Character Kernel category preserved)
- Caches (unchanged this session):
  - `/adopted/standing-protocol-cache.md`
  - `/adopted/build-sessions-protocol-cache.md`

---

*End of A9 + J6 cost-monitoring session close. Stage 1 cost-monitoring re-pointing complete on the substrate path. R5's two manifest-named alert rules — the 2x revenue:cost ratio and the 2x rolling 7-day daily-spend — are both wired against actual substrate cost capture. Production state preserved: substrate hot path untouched; admin endpoint extended additively with defensive fallback. Build arc proceeds to A6 / A10 / A11a / A8 per founder election at next session-open.*
