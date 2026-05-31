# Session Close — 2026-05-31 — Layer 3 Activation Decision (Deferred, Option C)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** scoped `code-critical` (Critical) — activation was on the table; the elected outcome (defer) changed nothing, so the recorded action is a **Standard** governance append. Full Critical Change Protocol not reached (no Critical change made). PR10 + PR12 engaged in the code-read; PR7 engaged (deferral recorded); PR15 N/A (no build); PR17 N/A (no founder-performed operational step reached).
**Date:** 2026-05-31.
**Branch:** `main` (no git operations by the AI beyond the two governance files below; no code/config/schema change).
**Predecessor close:** `/operations/handoffs/founder/2026-05-31-r20a-gate-activation-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache + build-arc cache, the predecessor (gate-activation) close, the two predecessor decision-log entries (`D-R20A-GATE-ACTIVATION-2026-05-31`, `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`), and the code-of-the-day. Confirmed tier / hold-point (P0 0h active) / model (Layer 3 = Sonnet per cache AC1; the A5.4 injection is deterministic, no model) / vocabulary / signals.
2. **Re-verified the two findings by code-read (Diagnostic-certain).**
   - *Finding 1:* `/api/reason/route.ts` does **not** read/serve `substrate_layer3_response` — grep showed only `layer3_cost_usd_microcents` (cost) and `layer3_throw` (error). `applyLayer3Injections` (`layer3-service.ts:582`) is deterministic (no `generateProse`). So a flag flip is metadata-only/inert on `/api/reason` — no benefit, no cost, no latency.
   - *Finding 2:* `/api/substrate/layer3/route.ts` has **no auth** (PR12: multi-pattern grep → no matches) and `middleware.ts:48–49` skips all `/api/` routes. When ON it calls `generateLayer3Response` → `generateProse` → Sonnet. Flag-off (503) is its only protection today. Flipping it would expose an unauthenticated paid endpoint — the blocker.
3. **Verified pre-conditions** (read-side): gate governance committed locally (`D-R20A-GATE-ACTIVATION-2026-05-31` present; gate close committed); on `main`. Vercel flag states are founder-confirmed (outside the sandbox).
4. **Presented the decision (Options A/B/C)** in plain language with the recommendation to defer.
5. **Founder elected Option C — defer.** Recorded the PR7 deferred-decision entry. No flag flip, no code, no deploy.

## Decisions Made

- `D-LAYER3-ACTIVATION-DEFERRED-2026-05-31` appended — Layer 3 activation deferred under PR7 with two revisit conditions (Stage-3 plugin traffic → Option A; or a decision to surface the mild benefit on `/api/reason` → Option B). Examined under full pre-activation rigour; chose not to flip.

## Status Changes

| Item | Old | New |
|---|---|---|
| `SUBSTRATE_LAYER3_ENABLED` | UNSET (queued for decision) | **deferred (UNSET)** — PR7 record |

(No implementation-status change; nothing was built or activated.)

## Next Session Should

**Default next: the three plaintext-table encryption batch** (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — its own session; batchable since the single-table encryption proof landed (PR1). Risk: Critical (encryption / R17b). Pre-condition: read the predecessor encryption-wiring close + the single-table proof entry.

Layer 3 returns only on a revisit condition (PR7 record): Stage-3 plugin traffic (→ Option A, wire endpoint auth first) or a decision to surface the gate's mild benefit on `/api/reason` (→ Option B, route change + flag-split). Either is its own Critical session.

## Blocked On

**Files remaining uncommitted (commit commands below):**
- `operations/decision-log.md` (the `D-LAYER3-ACTIVATION-DEFERRED-2026-05-31` entry)
- `operations/handoffs/founder/2026-05-31-layer3-activation-deferred-close.md` (this close)

**Founder action outside git (carried from the gate session):** delete the throwaway probe env-file (holds the API key in plaintext; **not** gitignored — do not `git add .`):
`rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/.env.r20a-gate-probe.local"`

Also untracked from prior sessions (next-session prompt files; leave or commit as you prefer): `operations/handoffs/founder/2026-05-31-NEXT-SESSION-PROMPT-layer3-activation.md`, `operations/handoffs/founder/NEXT-SESSION-PROMPT-r20a-gate-activation.md`. And `website/tsconfig.tsbuildinfo` is modified (build artefact — ignore).

**Production state at session close:** UNCHANGED from session open. All four R20a flags `true` in Vercel (Production). `SUBSTRATE_LAYER3_ENABLED` UNSET → `/api/substrate/layer3` returns 503. `/api/reason` byte-identical for human/web callers. `/api/public-key` steady-state (`substrate-layer2-2026Q2`). Journal distress screening LIVE; R17b realtime-journal encryption LIVE. AC7 not engaged.

## Open Questions

- Layer 3 activation — deferred under PR7; revisit on Stage-3 plugin traffic (Option A) or a decision to surface the mild benefit on `/api/reason` (Option B).
- Carried-forward minors: `/api/score` single-field coverage; Jest-runner gap; manifest R17c "503 stub" drift; `mentor_profiles` schema-drift (governance pass).

## Founder Verification (Between Sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-LAYER3-ACTIVATION-DEFERRED-2026-05-31" operations/decision-log.md
```
Then commit + push the governance:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md \
        "operations/handoffs/founder/2026-05-31-layer3-activation-deferred-close.md"
git commit -m "Layer 3: defer activation (Option C) under PR7. Pre-activation code-read (Diagnostic-certain) confirmed SUBSTRATE_LAYER3_ENABLED flip delivers no /api/reason benefit (route never reads substrate_layer3_response; injection is metadata-only) and would expose an unauthenticated Sonnet-calling /api/substrate/layer3 (no auth in handler; middleware skips /api/). No code/config/schema change; production unchanged. Revisit on Stage-3 plugin traffic (Option A: wire endpoint auth first) or a decision to surface the mild benefit on /api/reason (Option B: route change + flag-split). (D-LAYER3-ACTIVATION-DEFERRED-2026-05-31)"
```
Then push via GitHub Desktop. **No Vercel behaviour change** — these are governance records only; nothing was activated.

## Cross-references

- Decision log: `D-LAYER3-ACTIVATION-DEFERRED-2026-05-31`
- Predecessor close: `/operations/handoffs/founder/2026-05-31-r20a-gate-activation-close.md`
- Context: `D-R20A-GATE-ACTIVATION-2026-05-31` (queued this); `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`
- Code read: `website/src/lib/substrate/layer3-service.ts` (`:582` deterministic injection; `:663,676` Sonnet call; `:700` case-strict flag); `website/src/lib/translation-sandwich/parallel-run.ts` (`:737` gate; `:755` fail-open); `website/src/app/api/reason/route.ts` (no `substrate_layer3_response` read); `website/src/app/api/substrate/layer3/route.ts` (`:85` 503 gate, no auth); `website/src/middleware.ts` (`:48–49` skips `/api/`)
- Manifest: §R3, §R18a, §R18e, §R19/§R19c/§R19d, §R20a, §AC1, §AC5, §AC7

*End of session close. Stabilised to a known-good state — production is byte-identical to session open; nothing was activated. The session's work was the pre-activation code-read, which confirmed that flipping `SUBSTRATE_LAYER3_ENABLED` today would deliver no user benefit and open an unauthenticated paid endpoint. The founder examined it under full Critical rigour and chose not to flip (Option C, deferred under PR7). Next by default: the three plaintext-table encryption batch.*
