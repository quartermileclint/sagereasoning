# Session Close — 2026-06-11 — P1 Comparison, Leg B (harnessed): the same task under the public contract

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18).
**Tier:** `governance` — Standard risk throughout. **Session model: Fable 5 (`claude-fable-5`) — PR4 parity with leg A confirmed at open.**
**Date:** 2026-06-11. **Baseline:** `main` at `a3db4c7` (unmoved since leg A; run in place, no worktree).
**Wall-clock (both conventions):** open **18:16:35** → deliverables-complete **19:31:20** (74m45s) → close-document write **19:51:24** AEST (95m). Composition note: includes ~25 min of founder-performed credential phase (mints, two 400-retry rounds, one expired-JWT recovery) that leg A had no equivalent of — stated for the verdict memo's fairness read, applied as the boxes say.

## What this session did

1. **Opened under the protocol** with model parity confirmed; leg-A outputs never read (constraint honoured: `bare/` untouched); the §6 thresholds not steered to (the frozen sheet stayed closed).
2. **Step 1 — credentials minted live (PR17):** `sr_inst_` + `sr_assent_` + (after the named pre-flight 401 confirmed `sr_inst_` is rejected by `/api/guardrail`) a leg-scoped `sr_live_`. Both prompt mint bodies 400'd on a missing `purpose` field — fixed live (PF-1).
3. **Step 2 — the harnessed run:** the frozen brief executed with **12 `/api/reason` consults** at the four decision-point classes and **2 guardrail gates** (both `proceed: true`; one transient 500, retried). Mid-run scope judgement (consult #2): the prompt's `sr_inst_` mandate conflicts with its `X-Loop-*` cost-capture mandate (the plugin path is unmetered by design) — consults #3+ switched to the `sr_live_` key; deviation logged; founder did not override. Produced **`p1-inputs-pack.md`**, **`findings-memo.md`** (12 findings), **`recommendations.md`** (R1–R10 incl. the evidence-gated investment-case reframe and the Stripe criterion-2 amendment recommendation, both consult-shaped).
4. **Step 3 — Sage Assent loop closed:** seed write initially 422 (provenance required — R18f working as designed, undocumented in the prompt); re-submitted carrying **all 12 signed Layer-2 assessments** → 200; record Live (`agent_accreditation` key `p1-comparison-leg-b-agent`, created 2026-06-11T09:33:33.938Z, expires 2026-09-09). Post-write probe found the **write/read agent_id asymmetry** (GET rejects the id POST accepted).
5. **Step 4 — metrics captured** (`leg-b-metrics.md`, all §5 rows): harness cost Σ **76¢ billed / 38¢ Anthropic** metered (~$0.50 est. total; 3 calls structurally unmeterable — itself a finding); Σ consult latency 367.9s server-side; **decisions changed by consultation: 4** (2 unambiguously material); **errors caught: 2 attributed** (F2 pre-pivot contradiction + arithmetic; **F12 live mint-defaults drift 667/50/20 vs adopted 30/1/1 — reachable only by a run that mints real credentials**) + the write/read asymmetry; token cost = **founder runs `/cost` and fills the row**.
6. **Step 5 — credentials retired (founder, walked live):** 2× DELETE `revoked: true`; `sr_live_` via PATCH suspend (that surface has no DELETE — prompt drift recorded); negative-auth verified **401/401/403**. Reflect leg: not elected; election point passed at revocation.

## Decisions Made

- `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11` appended. Harnessed leg executed; full incorporation + telemetry trail; verdict-memo session queued.

## Status Changes

| Item | Old | New |
|---|---|---|
| P1 comparison leg B (harnessed) | queued | **complete** (5 outputs + raw/ trail) |
| P1 comparison verdict memo | unwritten | **queued** (prompt below) |
| P1 inputs pack (harnessed variant) | — | **rebuilt** (leg-B directory) |
| 0h main-blocker test | half-run (leg A) | **both legs complete; verdict outstanding** |

## Next Session Should

**The verdict-memo session** per `/operations/handoffs/founder/2026-06-11-P1-comparison-verdict-memo-NEXT-SESSION-PROMPT.md` — founder blind-ish quality read first, then the §5 table, then the three frozen boxes applied exactly as ticked (2 / 50% / $5; AND'd). Either outcome stands. Then the founder's 0h call.

## Blocked On

**Files uncommitted (one commit — block below):** the five leg-B outputs + `raw/`; the decision-log entry; this close; the verdict-memo prompt; CLAUDE.md (0h line).

**Production state at session close (2026-06-11, leg B):** per PR18 — **no flag, schema, perimeter, or code change**; data written under existing Live surfaces only: 1 `agent_accreditation` seed row (test agent id, expires 2026-09-09), 10 `loop_billing_events` rows (real metering of this run's consults — exclude from any billing-design tuning sample as test traffic), 12 `substrate_audit_events` rows, 3 credential rows minted-then-retired (2 revoked, 1 suspended). All four R20a flags `true`; A10/A11b/A12/A13/A14/A19/GDPR Live; Layer 3 + R20b inert by decision; Stripe `not_configured`. 0h HELD — main-blocker test now fully run (both legs); verdict memo + founder call outstanding; three supporting blockers unchanged. Per `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11`.

## Open Questions

- F12 (mint-defaults drift): own Elevated fix session before P1, or rides R5's pre-onboard gate? (founder)
- The accreditation seed row: leave to expire 2026-09-09, or SQL-delete after the verdict memo? (founder; inert either way)
- A8 order vs the verdict memo (unchanged from leg A).

## Founder Verification (Between Sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "P1 comparison leg B (harnessed): frozen brief run under the public contract from a3db4c7 — 12 consults (4 decision-point classes) + 2 guardrail gates + provenance-carrying Sage Assent write; rebuilt P1 inputs pack + findings memo (12 findings; errors caught incl. live mint-defaults drift 667/50/20) + recommendation set; verbatim incorporation log + full harness telemetry (76c billed / 38c Anthropic metered). Credentials retired, negative-auth verified. Verdict-memo session queued. 0h HELD; main-blocker test legs 2/2 done. (D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11)"
```
Then push via GitHub Desktop (content only — no deploy behaviour change). **Also: run `/cost` in this session and fill the token-cost row in `operations/p1-rebuild-2026-06/harnessed/leg-b-metrics.md` before closing the window** (KG5 — unrecoverable later). **Do not start the comparative read until the verdict-memo session opens** (its Step 1 structures your blind-ish read).

## Orchestration Reminder

The AI has no persistent memory; these docs are its memory. **Arc:** S1–S8b ✅ → leg A (bare) ✅ → **leg B (harnessed) ✅ this session** → **verdict memo vs the frozen 2/50%/$5** → founder 0h call → A8 mapping → migration + presentation arc (incl. score-conversation Critical wiring) → P1 review (reads: verdict memo → inputs pack → findings memo → recommendations) → launch decision. **Founder wall-clock this week:** lawyer email + FPE-1/FPE-3 (unchanged; the harnessed pack's R7 carries the same message). At the next open: read this close, then the verdict-memo prompt; the §6 sheet opens there for the first time since the freeze.

## Cross-references

- `/operations/handoffs/founder/2026-06-11-P1-comparison-harnessed-leg-NEXT-SESSION-PROMPT.md` (this session's operative prompt)
- `/operations/handoffs/founder/2026-06-11-P1-comparison-leg-A-close.md` (predecessor)
- `/operations/p1-rebuild-2026-06/harnessed/` (the five leg-B outputs + raw/)
- Decision log: `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11`
- `/operations/handoffs/founder/2026-06-11-P1-comparison-verdict-memo-NEXT-SESSION-PROMPT.md` (next)

*End of session close. Stabilised: production data-clean (credentials retired, writes attributable and expiring); the pre-registration held end-to-end (the §6 sheet was never opened mid-run); both legs now exist with full telemetry; the verdict memo is fully specified.*
