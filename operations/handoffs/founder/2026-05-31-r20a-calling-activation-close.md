# Session Close — 2026-05-31 — R20a Production Activations (Calling + Reflect + Audience) + Journal-Distress Deployment Record

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-critical` — **Critical** risk. Step 1 governance finalisation (Standard); the activations (Critical). The highest-risk part set the tier. A **separate** full Critical Change Protocol (0c-ii) was completed in chat for **each** flag before its Vercel change; founder approved "Go ahead" per flag, specific to each flag's named risks. PR6 + AC5 + PR3 + PR17 engaged; AC2 paid live (Reflect catch). PR7 engaged (A7 gate deferred).
**Date:** 2026-05-31.
**Branch:** `main` (the AI did no git operations; no application code changed — all activations were Vercel configuration).
**Predecessor close:** `/operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache, the predecessor close, the C2 live-run close, the journal + C2 decision-log entries, the gate code (`r20a-gate.ts`), the Calling + Reflect routes, the audience renderer, and the test flag-config. Confirmed tier / hold-point / model (Haiku, cache AC1) / vocabulary / signals.
2. **Step 1 — governance finalisation (Standard).** Recorded `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` as deployed + live in production (Verified-live; live TEST run waived); LC#10 met for the journal. Founder approved the wording first.
3. **Calling activation (Critical).** Full CCP in chat → founder "Go ahead", Production-only → walked the Vercel env-var add + redeploy live (PR17) → config-verified green. Live probe waived (informed: the catch sits behind the `sr_assent_` auth gate, so a clean probe needs a production write credential). `D-R20A-CALLING-ACTIVATION-2026-05-31` recorded. Founder committed + pushed; Vercel green.
4. **Founder elected to continue with the remaining activations in-session.** AI stated the one-per-session governance concern once, then proceeded with each flag handled discretely (own CCP + own Vercel step + own verification), ascending blast-radius order.
5. **Reflect activation (Critical).** CCP → "Go ahead", Production-only → Vercel walked live → green. Same independent per-route pattern as Calling; Verified-live in TEST (C2).
6. **Audience-rendering activation (Critical).** CCP (noting it changes the `/api/reason` API-caller redirect *output shape*, not a catch) → "Go ahead", Production-only → Vercel walked live → green. Developer-payload form Verified-live in TEST (C2).
7. **A7 gate (`SUBSTRATE_R20A_GATE_ENABLED`) — DEFERRED.** On checking `run-c2.ts`, the AI found this flag was explicitly **not** in C2's live run, is the **largest blast radius**, and its main new effect is **inert while Layer 3 is off** (`SUBSTRATE_LAYER3_ENABLED` UNSET → 503). AI recommended deferral; founder elected to defer to its own session. Recorded as a PR7 deferred decision.
8. **Governance.** `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31` appended (full Critical form; per-flag CCP records + the A7 PR7 deferral); this close updated to cover the full session.

## Decisions Made

- `D-R20A-CALLING-ACTIVATION-2026-05-31` — first R20a flag activated (Calling). Committed + pushed by founder.
- `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31` — Reflect + Audience-rendering activated; A7 gate deferred (PR7).
- Follow-up on `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` — journal screening recorded live; LC#10 met for the journal.

## Status Changes

| Item | Old | New |
|---|---|---|
| `/api/calling` R20a catch | Verified-live (TEST) | **Live (production)** |
| `/api/practice/reflect` R20a catch | Verified-live (TEST) | **Live (production)** |
| `/api/reason` audience-correct redirect rendering | Verified-live (TEST) | **Live (production)** |
| `SUBSTRATE_R20A_GATE_ENABLED` (A7 gate) | UNSET | **deferred — still UNSET** |
| R20a production flags (Vercel) | four UNSET | **3 set; 1 UNSET (A7 gate)** |
| Journal distress screening | Wired + statically Verified | **Verified-live (production)**; live test waived |

## Verification Method Used (0c Framework)

- **Deployment-configuration (Critical, per flag):** AI supplied exact dashboard path + values; founder performed each env-var add + redeploy on their machine (Vercel is outside the Cowork sandbox) and confirmed each step green.
- **Flag-reader correctness (read-only):** all readers case-strict (`=== 'true'`): Calling `r20a-gate.ts:268`; Reflect `:299`; gate `:238`; Audience `r20a-audience-renderer.ts:342`. Founder set the exact literal `true` each time.
- **Catch / render behaviour:** Calling, Reflect, and Audience developer-payload all Verified-live in TEST against real Haiku (34/34) at `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`; `run-c2.ts` confirms these three were the flags C2 set. A7 gate **not** live-verified (deferred).
- **Live production probes:** waived by founder (informed; consistent across all activations).
- **Governance:** two decision-log entries + this close produced and cross-referenced.

## Risk Classification Record (0d-ii)

- **Each R20a flag activation:** **Critical** — deployment-configuration activating an R20a perimeter surface. A separate full CCP completed in chat before each; PR6 + PR17 engaged; AC2 paid live on the Reflect catch; PR3 (Reflect catch awaited). Production-only scope each.
- **A7 gate:** **deferred** (PR7) — not activated.
- **Step 1 journal deployment-record follow-up:** **Standard** — append-only documentation.

## Next Session Should

Founder's pick (each its own session):

1. **A7 gate activation** (`SUBSTRATE_R20A_GATE_ENABLED`) — the deferred fourth flag. A discrete Critical session with a live probe or a TEST run that sets this flag specifically; ideally consider Layer 3 activation so the mild-severity prose-injection benefit actually surfaces.
2. **Batch-encrypt the three lower-severity plaintext tables** (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — batchable since the single-table encryption proof landed (PR1).

## Blocked On

**Files remaining uncommitted (commit commands below):**
- `operations/decision-log.md` (the batch entry — the Calling entry + journal follow-up were committed earlier this session)
- `operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md` (this updated close)

(No application-code change — all activations were Vercel configuration, already applied live.)

**Production state at session close:** `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` = `true` (Production); `SUBSTRATE_R20A_GATE_ENABLED` **UNSET** (deferred). `/api/calling` + `/api/practice/reflect` distress catches **ON**. `/api/reason` byte-identical for human/web callers; API-caller redirect output now developer-form when a redirect fires. `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). Journal distress screening LIVE; R17b realtime-journal encryption LIVE. AC7 not engaged.

## Open Questions

- A7 gate activation (deferred — own session, per the PR7 record in the batch entry).
- Production live probes for the activated catches (waived) — runnable any time a production `sr_assent_` write credential is minted.
- Carried forward: the three plaintext-table encryption batch; `/api/score` single-field coverage (minor); the Jest-runner gap; manifest R17c "503 stub" drift; `mentor_profiles` schema-drift (governance pass).

## PR5 — Knowledge-Gap Carry-Forward

No concept required re-explanation. The activation pattern followed the C2 precedent + the cache directly; the case-strict flag-reader semantics, the auth-gate-before-catch ordering, and the A7/Layer-3 dependency were all confirmed by code-read. No recurrence logged.

## Founder Verification (Between Sessions)

Confirm the activations hold and the governance records exist:
```
# In Vercel: Settings → Environment Variables — confirm THREE flags = true (Production):
#   SUBSTRATE_CALLING_R20A_ENABLED, SUBSTRATE_REFLECT_R20A_ENABLED, SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
# and confirm SUBSTRATE_R20A_GATE_ENABLED is ABSENT (deferred).
```
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31" operations/decision-log.md
```
Expected: three flags listed = `true` (Production); the gate flag absent; the grep returns the batch-entry header.

Then commit + push the batch governance:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md \
        "operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md"
git commit -m "R20a: activate Reflect + Audience-rendering in production (Vercel config, Production scope); /api/practice/reflect catch ON; /api/reason API-caller redirect output now developer-form. Both Verified-live in TEST (C2). A7 gate (SUBSTRATE_R20A_GATE_ENABLED) DEFERRED (PR7) — not in C2 live run, largest blast radius, inert while Layer 3 off. 3 of 4 R20a flags now live; gate UNSET. Config-only, no application code; reversible per-flag via UNSET + redeploy. Critical / code-critical; per-flag CCP + PR17 completed; live probes waived (informed). (D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31)"
```
Then push via GitHub Desktop. **No Vercel behaviour change on push** — the activations are already live (applied in the dashboard); these files are the governance record only.

## Rollback path (per flag)

For any activated flag: delete it in Vercel → Settings → Environment Variables → Remove → redeploy. No code, no schema, nothing persisted — that surface returns to its pre-activation behaviour in one redeploy. (`git revert` the governance commit only un-records the decision; the live rollback is the Vercel UNSET.)

## Orchestration Reminder

Stage by name (the two governance files above); do not `git add .`. No application-code change this session, so no migrate-before-push ordering concern. The activations are already live in Vercel; the commit only records them.

## Cross-references

- Decision log: `D-R20A-CALLING-ACTIVATION-2026-05-31`; `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`; follow-up on `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31`
- Activation context: `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`; `/operations/handoffs/founder/2026-05-30-C2-live-run-close.md`
- Predecessor close: `/operations/handoffs/founder/2026-05-31-r20a-journal-distress-check-close.md`
- Code: `website/src/lib/substrate/r20a-gate.ts`; `website/src/lib/substrate/r20a-audience-renderer.ts`; `website/src/app/api/calling/route.ts`; `website/src/app/api/practice/reflect/route.ts`
- C2 harness (flag set): `website/scripts/whole-system-harness/run-c2.ts`
- Test flag-config: `data-room/04_test_brief/test-flag-config.md`
- Manifest: §R20a, §AC5, §AC2

*End of session close. Stabilised to a known-good state: the journal-distress change is recorded live (LC#10 met for the journal), and **three of the four** R20a production flags are ON — Calling, Reflect, and Audience-rendering, the three C2 proved live against real Haiku — each activated under its own CCP + live PR17 walkthrough, config-verified. The fourth, the shared A7 gate, was deliberately **deferred** to its own session (not C2-live-verified, largest blast radius, inert while Layer 3 is off). Three R20a flags remain reversible per-flag via Vercel UNSET + redeploy; `/api/reason` byte-identical for human/web callers. Next: the A7 gate activation or the plaintext-table encryption batch — founder's pick.*
