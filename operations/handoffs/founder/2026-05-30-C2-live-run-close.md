# Session Close — 2026-05-30 — C2 Live Run: Agent-Path R20a Catch Fired Live (TEST env, real Haiku)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted) + `data-room/04_test_brief/` (test-env-standup-checklist.md + test-flag-config.md).
**Tier:** `code-critical` — **Critical** risk. Full Critical Change Protocol (0c-ii) completed visibly in chat before any flag was set. PR6 ENGAGED (R20a perimeter exercised live). PR17 ENGAGED (TEST-env standup + live runs walked through interactively, step by step, in-session).
**Date:** 2026-05-30.
**Branch:** `main` (the AI did **no** git operations).
**Predecessor close:** `/operations/handoffs/founder/2026-05-30-OPTION-A-session-5-configuration-flows-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache, build-sessions cache, the C2 prompt, the S5 close, the ADR, the two test-brief files (standup checklist + flag config), the gate code (`r20a-gate.ts`), the three route catch regions, the live classifier (`r20a-classifier.ts`), the response builders, and the audience renderer.
2. **Resolved pre-conditions by code-read.** Confirmed the flag set (Diagnostic-certain) and located the distress fixture (`C2_DISTRESS_INPUT`, under `website/scripts/...` — the S5-open grep had searched `website/src` only). Surfaced two code-read findings before any standup: (a) `/api/reason`'s developer payload omits `safety_signal` (route-guard does not pass it — route.ts:673-677), unlike Calling + Reflect; (b) `/api/reason`'s catch on `input` is always-on, the audience flag switches only the output form.
3. **Found the stale harness.** `run-c2.ts` predated Option A and asserted the inverted M-7 "no catch" behaviour. Founder elected: rewrite it to the Option A expectations.
4. **Step 1 — full CCP in chat; founder approved** specific to the named risks (three TEST-only flags, real Haiku, isolated test spend).
5. **Rewrote the harness** (`run-c2.ts`) to assert the catch FIRES per surface (developer payload + neutral negative control + a DB-boundary guard that aborts on a non-test key). Verified in-sandbox: build-only PASS; `tsc --noEmit` EXIT 0.
6. **Step 2 — PR17 TEST-env standup, walked live step by step:** test Supabase project (reused today's; schema confirmed complete — all 10 tables incl. `api_keys`); test Ed25519 key-pair; `.env.local` (test DB + signing + Layer 3 + the three R20a flags + test Anthropic key + test encryption key + PEM-as-multiline); minted the two test credentials (cleaned a duplicate-seed → exactly 2 rows); `npm run dev` smoke check → `/api/public-key` served `key_id: substrate-layer2-test`.
7. **Step 3 — live run (real Haiku):** `34 passed, 0 failed`. The catch fired on all three wired surfaces with the developer payload; neutral controls passed; Reflect Zone-3 declared-signal regression control held.
8. **Step 4 — production untouched:** verified by direct fetch (`/api/public-key` steady-state `substrate-layer2-2026Q2`, distinct from the test key; `/api/substrate/layer3` empty/503-consistent) + founder confirmation that no Vercel action was taken (four R20a flags still UNSET).
9. **Steps 5–6 — decision-log entry + this close.**

## Decisions Made

- `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30` appended (full Critical form) — agent-path R20a catch Verified-live in TEST across the three wired surfaces; launch criterion #10 agent leg closed; the four M-7 finding rows → closure-ready.

## Status Changes

| Item | Old | New |
|---|---|---|
| Agent-path R20a catch (live behaviour) | Wired + unit-Verified (S5) | **Verified-live (TEST)** — 34/34 on real Haiku |
| Launch criterion #10 — agent leg | open | **closed** |
| `run-c2.ts` harness | Stale (pre-Option-A; inverted M-7 assertions) | **Rewritten + Verified** (build-only + tsc EXIT 0 + 34/34 live) |
| Four M-7 finding rows | open | **closure-ready** |
| Production (Vercel) | four R20a flags UNSET | **UNCHANGED** — four UNSET; no Vercel action taken |

## Next Session Should

**Either** capability-inventory **gap #4** (confirm every human-facing tool routes through a distress-checked endpoint) and **gap #5** (confirm intimate-data encryption end-to-end), **or** the **first of the four R20a production activations** (each a separate future Critical session, with its own full CCP + PR17 walkthrough — flipping one flag ON in Vercel). Optionally first: the two R17 governance carry-forwards (manifest's stale "R17c 503" notes; the `mentor_profiles` schema-drift note) as a Standard-risk documentation pass.

The TEST env can stay standing for reuse (gap #5 / the production-activation dry-runs) or be torn down — your call. Nothing in production depends on it.

## Blocked On — single commit list (stage by name; do NOT `git add .`; never stage `website/.env.local*`, `website/tsconfig.tsbuildinfo`, or the `data-room/05_outputs/C2-build-only-*` files)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/scripts/whole-system-harness/run-c2.ts \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-30-C2-live-run-close.md"
# Optional — the live-run evidence ledger (resolves the decision-log reference):
git add data-room/05_outputs/C2-live-2026-05-30T09-47-17-113Z.json \
        data-room/05_outputs/C2-live-2026-05-30T09-47-17-113Z.md
git commit -m "C2 live run: agent-path R20a catch Verified-live in TEST against real Haiku (34/34). Rewrote website/scripts/whole-system-harness/run-c2.ts to the Option A per-surface expectations (the pre-Option-A version asserted the inverted M-7 no-catch behaviour; in git history): per surface (Calling, Reflect, /api/reason agent-API) the catch FIRES -> developer payload (status:redirected, distress_detected:true, severity moderate|acute, developer_note, suggested_user_message, flow_terminated:true) + neutral negative control passes; safety_signal asserted on Calling+Reflect, ABSENT on /api/reason (route-guard omits it); Reflect Zone-3 declared-signal regression control held; DB-boundary guard aborts on a non-test key. Run entirely local (.env.local + localhost) against a separate TEST Supabase project; production UNTOUCHED (all four R20a flags UNSET in Vercel; /api/public-key steady-state substrate-layer2-2026Q2; /api/substrate/layer3 503). Critical / code-critical; full CCP + PR17 completed. Launch criterion #10 agent leg closed; four M-7 finding rows -> closure-ready. (D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30)."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — the harness is additive TEST scaffolding; all four R20a flags remain UNSET; `/api/reason` byte-identical for all caller types in production.

**Production state at session close:** **UNCHANGED.** `SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` all UNSET in Vercel; `/api/reason` byte-identical for all caller types; `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). The R17 `/api/user/*` changes from 2026-05-29 remain LIVE (untouched). AC7 not engaged.

## Open Questions

- **The four R20a production activations** — each a separate future Critical session with its own CCP + PR17 walkthrough. Revisit: per-flag activation sessions.
- **End-to-end cross-surface forwarding** (the `safety_signal` carrier threaded through `DiscoveredPurpose` into `/api/reason`). Does not exist today; future K-category migration.
- **`/api/reason` `safety_signal` asymmetry** — the route-guard omits the carrier on its developer payload (Calling + Reflect attach it). Documented + asserted. Revisit if/when a forwarded carrier is built.
- **Capability-inventory gaps #4 + #5** — human-tool distress coverage; intimate-data encryption end-to-end.
- **F-series Jest-config debt** (AC12); the two R17 governance carry-forwards.

## Verification Method Used (0c Framework)

- **API endpoint (live behaviour):** the AI supplied the exact run command with expected output; the founder ran it on `localhost` (which the Cowork sandbox cannot reach) and reported the full ledger — `34 passed, 0 failed`. The AI verified each assertion against the expected per-surface contract.
- **Production-untouched (read-only):** the AI verified `/api/public-key` + `/api/substrate/layer3` directly by fetch; the founder confirmed no Vercel action was taken (the four flags remain UNSET).
- **Harness (in-sandbox):** build-only run PASS; `npx tsc --noEmit` EXIT 0.
- **Governance:** decision-log entry + this close produced and cross-referenced.

## Risk Classification Record (0d-ii)

- **TEST-env R20a flag activation:** **Critical** — env-flag activation of the R20a perimeter. Full CCP completed in chat before activation; PR6 + PR17 engaged; AC2 paid live; AC4 exercised end-to-end. TEST-only; production config unchanged.
- **`run-c2.ts` rewrite:** **Standard** — additive TEST scaffolding; no production path, no safety-function change.

## PR5 — Knowledge-Gap Carry-Forward

Concepts re-explained this session (operational-setup, first observations → **Candidate** entries in `operations/knowledge-gaps.md`):
- **PEM-into-env multiline formatting** — how to paste a multi-line PEM as a double-quoted env value (the code passes it straight to `createPrivateKey`/`createPublicKey` with no `\n` conversion). Candidate (1st).
- **Placeholder `<...>` bracket convention** — that angle-bracket placeholders are replaced *including* the brackets. Candidate (1st).
- **Supabase new key format** — `sb_secret_` = service-role equivalent; `sb_publishable_` = anon equivalent; both accepted by the client. Candidate (1st).

None reached the 3rd-recurrence promotion threshold. Logged for the next standup so the resolution is read before the work, not during it.

## Founder Verification (Between Sessions)

Re-run while the TEST env is still standing (dev server running in another tab):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx --env-file=.env.local scripts/whole-system-harness/run-c2.ts --live
```
Expected: `34 passed, 0 failed`; `Result: PASS`.

Build-only sanity (no env, no network — safe anywhere):
```
npx tsx scripts/whole-system-harness/run-c2.ts
```
Expected: `Result: PASS` (0 assertions; prints the fixtures + flag set + assertion plan).

Confirm the entry + close exist:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30" operations/decision-log.md
ls "operations/handoffs/founder/2026-05-30-C2-live-run-close.md"
```

**TEST-env teardown (optional):** when finished, unset the three R20a flags in `website/.env.local` (or restore `.env.local.backup-pre-c2`) and stop the dev server. There is **no production rollback** — production was never touched.

## Orchestration Reminder

Stage by name (the block above); never `git add .`. Do **not** stage `website/.env.local*` (secrets), `website/tsconfig.tsbuildinfo` (build cache), or the `data-room/05_outputs/C2-build-only-*` files (sandbox build-only artifacts — safe to delete). The live ledger (`C2-live-2026-05-30T09-47-17-113Z.*`) is optional evidence.

## Cross-references

- Decision log: `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`
- Predecessor close (S5): `/operations/handoffs/founder/2026-05-30-OPTION-A-session-5-configuration-flows-close.md`
- ADR: `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`
- Test brief: `data-room/04_test_brief/test-env-standup-checklist.md`, `data-room/04_test_brief/test-flag-config.md`
- Harness (rewritten): `/website/scripts/whole-system-harness/run-c2.ts`
- Live ledger: `/data-room/05_outputs/C2-live-2026-05-30T09-47-17-113Z.{json,md}`
- Capability inventory (gap ranking): `/drafts/2026-05-29-capability-inventory-first-pass.md`

*End of session close. Stabilised to a known-good state: the agent-path R20a distress catch is Verified-live in a TEST environment against real Haiku across all three wired surfaces (34/34) — the first time the safety functions ran against real Haiku — closing launch criterion #10's agent leg and moving Option A from "Wired + unit-Verified" to operationally proven. Production UNCHANGED — all four R20a flags UNSET in Vercel. The next sub-arc is capability-inventory gaps #4 + #5, or the first of the four R20a production activations (each its own Critical session with CCP + PR17 walkthrough).*
