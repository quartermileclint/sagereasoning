# Session Close — 2026-06-14 — Trajectory B1 Activation (sweep → M6-P2 write → M7 read)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR17 (every founder step walked live). PR18 at close.
**Tier:** `code-critical` — **Full** Critical Change Protocol (0c-ii). One `code-standard` code deliverable (the retention sweep) + four Critical production activations.
**Date:** 2026-06-14.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-close.md`.
**Decision-log entry:** `D-MECHANISM-CORRECTION-TRAJECTORY-B1-ACTIVATION-2026-06-14`.

## What happened

Chain **B1** of the trajectory activation, executed in the inviolable order — **(1) build + activate the retention sweep → (2) M6-P2 write flag → (3) M7 read flag** — turning the M6/M7 trajectory feature (built + TEST-Verified, production-inert since 2026-06-14) **Live in production**. Chain **B2 (CI-4) was not touched** (independent; its own session).

## Decisions Made
- `D-MECHANISM-CORRECTION-TRAJECTORY-B1-ACTIVATION-2026-06-14` appended. The trajectory feature is Live: sweep enforcing `retain_until` (R17c), writes accruing, the honest `meta.trajectory` overlay surfacing — engine byte-identical.

## Status Changes
| Item | Old | New |
|---|---|---|
| Retention sweep (`/api/cron/trajectory-retention-sweep` + `purgeExpiredTrajectory`) | (did not exist) | **Live** (`SUBSTRATE_TRAJECTORY_SWEEP_ENABLED=true`; cron `0 8 * * *`) |
| M6 trajectory persistence (write) | Built, inert (flag unset; P1 migration only) | **Live** (`SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true`) |
| M7 trajectory overlay (read) | Built, inert (flag unset) | **Live** (`SUBSTRATE_TRAJECTORY_READ_ENABLED=true`) |

## The five steps (all verified green)
1. **Sweep built** — route + `purgeExpiredTrajectory()` + handler split + tsx tests (store 114, route 26); `npm run build` exit 0.
2. **Sweep activated** (the M6-P2 gate) — `vercel.json` cron `0 8 * * *` + flag on; `200 {flag_enabled:true, deleted:0}` / `401`.
3. **TEST WRITE→READ** (AI-driven on TEST) — 2 rows; overlay `prior_instances:2`/`low`; fresh → `single_snapshot`; determinism additive. Torn down.
4. **Production M6-P2 write** — real row, `retain_until +90d`, no `meta.trajectory` (read off).
5. **Production M7 read** — overlay `prior_instances:2`/`low`/`stable`; engine byte-identical. Throwaway prod key revoked.

## Verification Method Used
- **PR10 PEV** — `tsc --noEmit` clean; **`npm run build` exit 0** (the route-export gate that `tsc` misses); store **114** + route **26** tsx assertions; siblings green.
- **Adversarial:** an **8-agent / 4-dimension** review of the Step-1 build (correctness/scope, KG1, flag-inertness/auth/fail-mode, test-adequacy) → **2 real findings, both fixed in-session** (critical: `getAdminClient()` default-param fail-honest; major: untested production default path) → **focused re-review clean**.
- **Live (PR17):** every production flag/cron/consult/SQL was founder-performed and the output verified before the next step; the TEST leg was AI-driven on the local TEST harness with throwaway credentials + full teardown.

## Risk Classification Record
**Critical** (0d-ii: env-flag activation of new surfaces + a deployment-config cron + a new production write surface). Sweep **code** Standard (founder-elected; scope §5). **AC7 not engaged** (no auth/session/encryption/signing). **PR6 not engaged** (no distress/R20a/A5; engine byte-identical). Per-named-risk founder approval obtained at each flip.

## PR5 Knowledge-Gap Carry-Forward
- **KG1** engaged + satisfied — the purge + write + read are awaited, direct-import, no fire-and-forget; lazy client; fail-honest.
- **New standing lesson (memory):** Next.js `route.ts`/`page.tsx` files reject non-handler exports at **`next build`** — `tsc`/tsx miss it. Any route-file change is gated by `npm run build`. (First Step-1 commit went red on Vercel for this; fixed via the `handler.ts` split.)

## Next Session Should
**B2 (CI-4 chain)** — independent, not started. Order: M5 reason-route flag (`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`) **then** the M3 write-boundary gate (`SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED`, detect mode; `_REJECT` deferred). Spec: the existing prompt `operations/handoffs/founder/2026-06-14-trajectory-and-ci4-activation-NEXT-SESSION-PROMPT.md` **§Part B2**. Optional follow-on: the **CI-15 docs-flip** (public R18; `operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md`).

## Blocked On
**Files remaining uncommitted (founder commits — AI does no git ops):**
- `operations/decision-log.md` (the new entry)
- `operations/handoffs/founder/2026-06-14-trajectory-B1-activation-close.md` (this file)
- `CLAUDE.md` (PR18 production-state refresh)
- (the code + `vercel.json` were committed during the session: `ed74fde`, the handler-split fix-up, the cron commit.)

**Production state at session close:** trajectory feature **Live** — `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` / `_WRITE_ENABLED` / `_READ_ENABLED` all `true`; sweep cron `0 8 * * *`; `/api/reason` persists one `agent_assessment_history` row per credential-bearing consult + surfaces `meta.trajectory`; engine byte-identical. R20a four flags `true`; CI-10 Live. 1 throwaway prod key revoked; 3 verification rows on it (`retain_until`-governed — exclude from samples).

## Open Questions
- B2 (CI-4) not started; CI-15 docs-flip optional; carried: M1/M3/M4/M5 activations, CI-14 credential build, parked CI-16, M4 CI-9 replay-ack, `/api/keys` 100/100/1, the leg-B seed-row, **the 0h call**.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md \
        operations/handoffs/founder/2026-06-14-trajectory-B1-activation-close.md \
        CLAUDE.md
git commit -m "Trajectory B1 activation close: sweep + M6-P2 + M7 Live (decision log + close + PR18 state)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
Then push via GitHub Desktop (docs-only — no deploy impact). Optional re-verify: `cd website && npm run build` (exit 0); the two tsx suites (114 / 26).

## Orchestration Reminder
The AI did no git/production operations: the founder committed by name (`ed74fde`, the handler-split fix-up, the `vercel.json` cron) and performed every Vercel env flip + redeploy + production consult + Supabase query; the AI built the sweep, drove the TEST leg on the local harness, and walked each production activation live (PR17), verifying output before the next step. Rollback for any activation = unset the flag in Vercel (byte-identical).

## Cross-references
- Predecessor: `operations/handoffs/founder/2026-06-14-mechanism-correction-M8-credential-consolidation-close.md`
- Prompt: `operations/handoffs/founder/2026-06-14-trajectory-and-ci4-activation-NEXT-SESSION-PROMPT.md` (B2 = §Part B2)
- Decision-log entry: `D-MECHANISM-CORRECTION-TRAJECTORY-B1-ACTIVATION-2026-06-14`
- Sweep scope: `operations/p1-rebuild-2026-06/trajectory-retention-sweep-scope.md`
- M6/M7 closes: `2026-06-14-mechanism-correction-M{6,7}-trajectory-*-close.md`

*End of session close. Chain B1 complete — the trajectory feature is Live in production in the only safe order; the engine is byte-identical; rollback is "unset the flag." B2 (CI-4) remains, independent.*
