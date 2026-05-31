# Session Close — 2026-05-31 — R20a A7 Gate Activation (the deferred 4th flag) + TEST Live-Verification

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-critical` — **Critical** risk. The full Critical Change Protocol (0c-ii) was completed in chat before the Vercel change; founder approved "Go ahead" specific to the largest-blast-radius framing + the dormant-mild-path note. PR6 + AC5 + PR17 engaged; PR10 (PEV loop) engaged throughout; PR1 (single-endpoint proof via the probe) engaged. AC2 **not** paid live on `/api/reason` (the gate reuses the route gate — zero added latency).
**Date:** 2026-05-31.
**Branch:** `main` (the AI did no git operations; the activation was Vercel configuration; one new TEST-scaffolding file written, uncommitted).
**Predecessor close:** `/operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache, the predecessor close, the batch + C2 decision-log entries, and the code-of-the-day (`r20a-gate.ts`, the gate call site in `parallel-run.ts`, the `/api/reason` `runSandwich` call). Confirmed tier / hold-point (P0 0h active) / model (Haiku, cache AC1) / vocabulary / signals.
2. **Stated the production behaviour finding (Diagnostic-certain, before proceeding).** `/api/reason` DOES invoke `runSandwichInner` in production; with the flag on, the gate **reuses the route's SafetyGate** (zero new Haiku call, zero added latency); its REDIRECT branch is effectively unreachable (route catch redirects first); its only net-new effect (mild → `distress_signal` → Layer-3 injection) is gated by `isSubstrateLayer3Enabled()`, UNSET in production → inert today. Net: activating the flag changes nothing user-visible — pure defence-in-depth + forward protection. (This also corrected the prompt header's "AC2 paid live" note: no fresh call on `/api/reason`.)
3. **Step 1 — activation-approach decision.** Presented Options 1/2/3; founder elected **Option 1** (live-verify in TEST, then activate).
4. **Step 2 — TEST live-verification (Option 1).** Built a gate-specific direct-function probe (`run-r20a-gate-probe.ts`) exercising `enforceLayer2R20aGate` against real Haiku. AI self-verified the deterministic half (17/17) + `tsc` clean in-sandbox, then walked the founder through the live run (PR17). After two owned-and-fixed false starts (an RTF-corrupted env-file; a stale assertion), the run returned **28/28 PASS** — gate **Verified-live in TEST**, including the mild-severity path classified by real Haiku.
5. **Step 3 — Critical Change Protocol** completed in chat (six steps); founder "Go ahead".
6. **Step 4 — activation walked through live (PR17).** Founder added `SUBSTRATE_R20A_GATE_ENABLED = true` (Production only) in Vercel and redeployed; confirmed green at both checkpoints.
7. **Step 5 — verified.** Config confirmed (Production = `true`, redeploy green); behaviour rests on the 28/28 TEST evidence. Live production probe waived (informed).
8. **Step 6 — governance.** `D-R20A-GATE-ACTIVATION-2026-05-31` appended (full Critical form); this close produced.

## Decisions Made

- `D-R20A-GATE-ACTIVATION-2026-05-31` — the fourth and final R20a flag activated. **All four R20a flags now `true` in production; the R20a production-activation arc is complete.** Resolves the PR7 deferral in `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`.

## Status Changes

| Item | Old | New |
|---|---|---|
| `SUBSTRATE_R20A_GATE_ENABLED` (A7 gate) | deferred — UNSET | **Live (production) = `true`** |
| A7 substrate gate (`enforceLayer2R20aGate`) | Wired + unit/invocation-Verified | **Verified-live (TEST, 28/28 real Haiku) → Live (production)** |
| R20a production flags (Vercel) | 3 set; 1 UNSET (gate) | **all 4 set** |
| `run-r20a-gate-probe.ts` | — | **NEW** (additive TEST scaffolding, Standard risk) |

## Verification Method Used (0c Framework)

- **Deployment-configuration (Critical):** AI supplied exact Vercel path + values; founder performed the env-var add + redeploy on their machine (Vercel is outside the Cowork sandbox) and confirmed each step green. Case-strict reader (`r20a-gate.ts:238`) confirmed reading exactly `'true'` by the probe's K assertion.
- **Gate behaviour (Verified-live, TEST):** the `run-r20a-gate-probe.ts` direct-function probe against real Haiku — 28/28. Exercised the exact function (`enforceLayer2R20aGate`) that runs inside `runSandwichInner`. Covered: flag-off → BYPASSED; reused-gate decision mapping (zero latency); fail-CLOSED on a forced throw; **a real-Haiku mild-distress classification with `distress_signal=true`** (the signature mild-path, live); acute → REDIRECT; and the production-style self-gating flag path.
- **AI pre-handoff check:** deterministic half (17/17) + `npx tsc --noEmit` (no errors in the probe) run in-sandbox before the founder's live run.
- **Live production probe:** waived by founder (informed; consistent across all four activations).

## Risk Classification Record (0d-ii)

- **The R20a gate activation:** **Critical** — deployment-configuration activating an R20a perimeter surface. Full CCP completed in chat before the Vercel change; PR6 + AC5 + PR17 engaged; PR10 throughout. AC2 **not** paid live on `/api/reason` (reused-gate, zero latency). Production-only scope. AC7 not engaged.
- **The probe (`run-r20a-gate-probe.ts`):** **Standard** — additive TEST scaffolding, no production path.

## Next Session Should

Founder's pick (each its own session):

1. **Layer 3 activation (`SUBSTRATE_LAYER3_ENABLED`)** — the natural follow-on: it is what makes the now-active gate's **mild-severity prose injection actually surface** (today it is inert). This is its own **Critical** change with its own blast radius + full CCP — **not** to be bundled. Recommend the same Option-1 discipline (TEST live-verify first).
2. **Batch-encrypt the three lower-severity plaintext tables** (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — batchable since the single-table encryption proof landed (PR1).

## Blocked On

**Files remaining uncommitted (commit commands below):**
- `website/scripts/whole-system-harness/run-r20a-gate-probe.ts` (NEW — the gate probe)
- `operations/decision-log.md` (the `D-R20A-GATE-ACTIVATION-2026-05-31` entry)
- `operations/handoffs/founder/2026-05-31-r20a-gate-activation-close.md` (this close)

**Founder action outside git:** delete the throwaway probe env-file if not already done —
`rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/.env.r20a-gate-probe.local"` (it holds the key in plaintext and is **not** gitignored — do not `git add .`).

**Production state at session close:** **All four R20a flags `true` in Vercel (Production)** — `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`. `/api/reason` byte-identical for human/web callers (gate reuses route catch → zero latency; REDIRECT unreachable; mild-path inert while Layer 3 off). `SUBSTRATE_LAYER3_ENABLED` UNSET → `/api/substrate/layer3` 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). Journal distress screening LIVE; R17b realtime-journal encryption LIVE. AC7 not engaged.

## Open Questions

- Layer 3 activation (queued — own Critical session; see Next Session Should #1).
- Production live probes for the activated gate (waived) — runnable any time a production `sr_assent_`/API write credential is minted; low value for the gate specifically (reused route catch; REDIRECT unreachable on `/api/reason`).
- Carried forward: the three plaintext-table encryption batch; `/api/score` single-field coverage (minor); the Jest-runner gap; manifest R17c "503 stub" drift; `mentor_profiles` schema-drift (governance pass).

## PR5 — Knowledge-Gap Carry-Forward

No concept required re-explanation. One recurring **operational friction** worth noting (not yet a logged KG): the macOS **TextEdit RTF-default** corrupted the founder-created env-file (trailing `}` on the flag + a mangled key → a 401 and a false-green live run). Same family as the R17b session's paste-wrap finding. Resolution applied this session: the AI wrote the env-file as plain text directly from the working `.env.local` (key never re-typed), and **hardened the probe so a malformed flag or dead key now turns the live run red** rather than passing green. If a third recurrence appears (PR8), promote to a process note: "founder-created env-files are written by the AI as plain text, not typed into TextEdit."

## Founder Verification (Between Sessions)

Confirm the activation holds and the governance records exist:
```
# In Vercel: Settings → Environment Variables — confirm ALL FOUR R20a flags = true (Production):
#   SUBSTRATE_CALLING_R20A_ENABLED, SUBSTRATE_REFLECT_R20A_ENABLED,
#   SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED, SUBSTRATE_R20A_GATE_ENABLED
```
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R20A-GATE-ACTIVATION-2026-05-31" operations/decision-log.md
```
Expected: all four flags listed `= true` (Production); the grep returns the new entry header.

Re-run the gate probe any time the gate logic is touched (deterministic half needs no key):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx scripts/whole-system-harness/run-r20a-gate-probe.ts        # build-only: 17/17
# (live: recreate a plain-text .env.r20a-gate-probe.local with ANTHROPIC_API_KEY + SUBSTRATE_R20A_GATE_ENABLED=true, then add --live)
```

Then commit + push the governance:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/scripts/whole-system-harness/run-r20a-gate-probe.ts \
        operations/decision-log.md \
        "operations/handoffs/founder/2026-05-31-r20a-gate-activation-close.md"
git commit -m "R20a: activate the 4th/final flag SUBSTRATE_R20A_GATE_ENABLED in production (Vercel config, Production scope) — completes the R20a production-activation arc; all four R20a flags now true. Gate Verified-live in TEST against real Haiku (28/28) via new run-r20a-gate-probe.ts (additive TEST scaffolding). /api/reason byte-identical for human/web callers (gate reuses route catch, zero latency, REDIRECT unreachable, mild-path inert while Layer 3 off). Critical / code-critical; full CCP + PR17 completed; live probe waived (informed); reversible via Vercel UNSET + redeploy. (D-R20A-GATE-ACTIVATION-2026-05-31)"
```
Then push via GitHub Desktop. **No Vercel behaviour change on push** — the activation is already live (applied in the dashboard); these files are the governance record + the test scaffolding only.

## Rollback path

Delete `SUBSTRATE_R20A_GATE_ENABLED` in Vercel → Settings → Environment Variables → Remove → redeploy. No code, no schema, nothing persisted — production returns to its pre-activation state in one redeploy. (`git revert` the governance commit only un-records the decision + removes the probe; the live rollback is the Vercel UNSET.)

## Orchestration Reminder

Stage by name (the three files above); do **not** `git add .` — the throwaway `.env.r20a-gate-probe.local` is untracked and **not** gitignored. No application-code change this session, so no migrate-before-push ordering concern. The activation is already live in Vercel; the commit only records it + adds the test scaffolding.

## Cross-references

- Decision log: `D-R20A-GATE-ACTIVATION-2026-05-31`; resolves the PR7 deferral in `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`
- Activation context: `D-R20A-CALLING-ACTIVATION-2026-05-31`; `D-R20A-C2-LIVE-RUN-VERIFIED-2026-05-30`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`
- Predecessor close: `/operations/handoffs/founder/2026-05-31-r20a-calling-activation-close.md`
- Code: `website/src/lib/substrate/r20a-gate.ts`; `website/src/lib/translation-sandwich/parallel-run.ts` (gate call site :582; Layer-3 gate :737); `website/src/app/api/reason/route.ts` (`runSandwich` call :800, `safetyGate: gate` :820)
- Probe: `website/scripts/whole-system-harness/run-r20a-gate-probe.ts`
- Manifest: §R20a, §AC5, §AC2, §AC7

*End of session close. Stabilised to a known-good state: the A7 substrate gate is **Verified-live in TEST (28/28 real Haiku)** and **Live in production**, completing the four-flag R20a production-activation arc — all four R20a flags now `true`. The activation is additive defence-in-depth (the gate reuses the always-on route catch with zero added latency; `/api/reason` byte-identical for human/web callers; the mild-severity benefit stays dormant until Layer 3 is enabled). Reversible via Vercel UNSET + redeploy. Next: Layer 3 activation (its own Critical session) or the plaintext-table encryption batch — founder's pick.*
