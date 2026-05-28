# Next-Session Prompt — Session 2 (C2): R20a Distress Perimeter Across the Loop

**This expands Session 2 of the v2 sequence** (`/operations/handoffs/founder/2026-05-26-sage-practice-sequence-v2-NEXT-SESSION-PROMPT.md`) into its own prompt. Session 1 (Comb 2 / no-practice disclaimer) is **closed, Verified live, and shipped (Vercel green)** — see `/operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md`.

**Stream:** founder.
**Tier:** **`code-critical`** — the **full Critical Change Protocol (0c-ii) applies, visibly, before any flag flip**. PR6 throughout (R20a is safety-critical). PR3 (safety checks synchronous). PR1 (one route proven first). Full templates per standing-cache §"Critical-risk sessions" — NOT the lean form.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor close (this stream):** `/operations/handoffs/founder/2026-05-27-comb2-no-practice-disclaimer-close.md`.
**Predecessor close (R20a gate):** `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md` (the A7 server-side gate — Verified on `/api/reason`; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in prod).
**Predecessor decision-log entries:** `D-COMB2-NO-PRACTICE-DISCLAIMER-2026-05-27`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`.

---

## Why this session matters

C2 is the **safety story** of the whole-system test (test-brief §C, C2): *distress entering at any product entry must be caught and redirected, synchronously.* It is the last Critical-tier item in the test matrix and one of the 0h value/coverage criteria. It is independent of the value-evidence rig (Session 3) and the Sage Practice spec (Session 4) — it completes the safety coverage on its own.

**This session is a TEST exercise of the safety perimeter. It does NOT activate R20a in production.** Activating `SUBSTRATE_R20A_GATE_ENABLED` in *production* is a separate future Critical change (A7 close, open question #1) and is explicitly **out of scope** here. In this session the flag is turned on in the **TEST env only**; production stays byte-identical.

---

## A hard truth to resolve at open (do not skip — PR12)

The v2 sequence says "submit a distress input at **each product entry**; assert redirect/pass-through." But the four product entry points the harness drives are **not** the eight AC5 perimeter routes. Confirmed by code-read at the time this prompt was written (re-verify at session open — code may have moved):

- **AC5 perimeter = exactly eight human-facing POST routes** (`manifest.md` §AC5): `/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`, **`/api/reason`**, `/api/reflect`, `/api/mentor/private/reflect`. These enforce R20a at the route level via `detectDistressTwoStage` + `enforceDistressCheck` (AC4 invocation-tested).
- **The four product entry points** the loop/harness uses are `/api/reason`, `/api/calling`, `/api/practice/reflect`, `/api/accreditation/[agent_id]`. **Only `/api/reason` is in the AC5 eight.** `/api/reflect` (in AC5) is the *human* daily-reflection endpoint — **not** `/api/practice/reflect` (the agent Sage Reflect endpoint).
- The **A7 substrate-side gate** (`SUBSTRATE_R20A_GATE_ENABLED`) guards **Layer 2 inside the translation sandwich** — so it covers whatever routes through the substrate (`/api/reason`), not necessarily `/api/calling` / `/api/practice/reflect` / `/api/accreditation`.

**So the first real work of C2 is diagnostic, not assertion:** establish, by code-read, which of the four product entries actually enforce R20a today, by which mechanism (AC5 route guard vs A7 substrate gate vs neither). Where there is no coverage, that is a **C2 finding to document with severity** (0h: blocker / significant / minor / cosmetic) — not a test to force green. This is the A7 close's own lesson (PR12: a prompt's framing was found out of date against the code; surface honestly).

---

## Pre-conditions

1. Session 1 is committed to `origin/main` and live (confirmed: Vercel green).
2. **TEST env must be stood up and `.env.local` re-pointed at it** before any live run (Step 0). Local dev is currently on **PRODUCTION** (`.env.local`). There is **no one-line "restore test" backup** — re-point per `data-room/04_test_brief/test-env-standup-checklist.md`.
3. The standing TEST env exists (per the v2 prompt): test Supabase `iwdtrvuphogkwmovhnvz`; test Ed25519 key-pair; two seeded `WSH_*` credentials (`mint-test-credentials.ts`); A1 columns present; **`SUBSTRATE_R20A_GATE_ENABLED` UNSET** (this session turns it on in TEST, under the CCP).
4. Branch `main`. **The AI does no git operations.** Stage by name (never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`); clear any `.git/index.lock` host-side.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — but note: this is `code-critical`, so also read the full rules below, not just the cache).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. This prompt + `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md` (the A7 gate — current state of the substrate-side R20a gate).
4. `/manifest.md` — read in full: **§R20a**, **§AC5** (the eight routes + ninth-route protocol), **§AC2** (the ~500ms latency budget — accepted, not to be optimised away), **§AC4** (invocation testing for safety functions), **§AC1** (model selection — R20a classifier = **Haiku**).
5. `data-room/04_test_brief/test-brief.md` §C (C2 row) + `data-room/04_test_brief/scenario-matrix.md` + `data-room/04_test_brief/test-env-standup-checklist.md` + `test-flag-config.md` (the `SUBSTRATE_R20A_GATE_ENABLED` row + the DB boundary).
6. The R20a code surfaces: `website/src/lib/r20a-classifier.ts`, `website/src/lib/r20a-invocation-guard.test.ts` (the AC5 registry), `website/src/lib/substrate/r20a-gate.ts` (A7), and the four route files (`/api/reason`, `/api/calling`, `/api/practice/reflect`, `/api/accreditation/[agent_id]`).
7. `/operations/decision-log.md` last 2 entries.

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); **model selection — R20a classifier = Haiku per AC1/cache Element 6**; status vocabulary; signals + risk class; PR3 + PR6 + PR1 + AC2 + AC4 engaged. PR15 consult (the harness `lib/` is the proven primitive — reuse, don't rebuild).

---

## Part B — Procedure

### Step 0 — Stand up / re-point the TEST env (founder-performed)

Per `test-env-standup-checklist.md`. Re-point `website/.env.local` at the TEST project, **add `SUBSTRATE_R20A_GATE_ENABLED='true'`** (the one new flag vs the standing test config — Step 3 below covers it under the CCP), restart `npm run dev`, then **confirm the boundary**:

```
GET http://localhost:3000/api/public-key   → expect key_id: substrate-layer2-test
```

If it returns the production key, **stop** — the env is mis-set (checklist Step 8 stop-signal). Do not proceed against production.

### Step 1 — Diagnostic: actual R20a coverage of the four product entries (code-read; PR12)

Before writing any assertion, the AI establishes — by reading the four route files + the AC5 registry + `r20a-gate.ts` — exactly how (or whether) each of the four product entries enforces R20a today:

| Entry | In AC5 eight? | Route-level guard? | A7 substrate gate (flag on)? | Distress disposition |
|---|---|---|---|---|
| `/api/reason` | **yes** | confirm `detectDistressTwoStage` + `enforceDistressCheck` | confirm (routes through substrate Layer 2) | redirect/pass-through |
| `/api/calling` | no | confirm / deny | confirm / deny | **establish honestly** |
| `/api/practice/reflect` | no | confirm / deny | confirm / deny | **establish honestly** |
| `/api/accreditation/[agent_id]` | no | confirm / deny | confirm / deny | **establish honestly** |

Output a short honest coverage statement. **Where an entry has no R20a coverage, log it as a C2 finding with severity (0h)** in `data-room/99_review/missing-context.md` — that is a legitimate, valuable C2 result. Use the diagnostic-certainty signals ("Diagnostic-certain — root cause identified" vs "Diagnostic-uncertain — …") when reporting.

### Step 2 — Critical Change Protocol writeup (0c-ii), visibly, for the TEST flag flip

Complete all six steps in the conversation before the founder enables the flag:

1. **What is changing** — `SUBSTRATE_R20A_GATE_ENABLED='true'` in the **TEST env only**; turns on the A7 substrate-side R20a gate guarding Layer 2 in the translation sandwich, for the test deployment.
2. **What could break** — the gate runs the Haiku distress classifier on the Layer-2 path (AC2 ~500ms for borderline inputs, accepted); a mis-wired gate could over-redirect (false positives) or under-redirect. In TEST this only affects test runs.
3. **What happens to existing sessions** — **N/A** (no current users; founder + test logins only — build-arc cache). Production flag stays UNSET; production untouched.
4. **Rollback plan** — unset `SUBSTRATE_R20A_GATE_ENABLED` in `website/.env.local` (TEST) and restart dev; production was never touched. Then restore prod local dev (Rollback section below).
5. **Verification step** — run-c2 (Step 4) returns the redirect/pass-through on a distress input at `/api/reason`; `npx tsc --noEmit` EXIT 0; production probes unchanged (A7 close §"Founder Verification" probes: `/api/substrate/layer3` → 503; `/api/public-key` steady-state on **production**).
6. **Explicit approval** — founder says "OK"/"go ahead" specific to the named risks before the flag is enabled.

### Step 3 — Enable the flag in TEST (founder), confirm

Founder sets `SUBSTRATE_R20A_GATE_ENABLED='true'` in `website/.env.local`, restarts dev. (Folded into Step 0 in practice; kept distinct here so it sits *after* the CCP writeup + approval, per protocol.)

### Step 4 — Build `run-c2.ts` (PR1: one route first)

Reuse the proven harness `lib/` (PR15 — `http-client.ts` already has `postReason` / `postCalling` / `postReflect` / `postAccreditation` / `getPublicKey`; `AssertionLedger`; `writeLedger`). Add a small distress-input fixture to `lib/scenario-input.ts` (a clearly Zone-2/acute distress impression — keep it test-only, non-graphic).

- **PR1 — prove `/api/reason` first** (the in-perimeter route): submit the distress input; assert the response is the **R20a redirect / distress pass-through** (the `r20a_gate_redirect` 200 redirect shape, A7 close §Status / Branch 1.7), and that it is **synchronous** (PR3 — the redirect is in the response, not deferred). Confirm the classifier fired (the gate output / redirect message present).
- **Then extend** to `/api/calling`, `/api/practice/reflect`, `/api/accreditation` — **asserting per the Step-1 diagnostic**: where an entry enforces R20a, assert the redirect/pass-through; where it does **not**, assert (and record) the honest current behaviour rather than forcing a pass. Do not claim coverage the code does not have.
- Write a ledger to `data-room/05_outputs/` (scenario `C2`), mirroring the L-runners' shape. Build-only vs live: the classifier path needs the dev server (localhost) + Haiku, so the real assertions are a **live** run (founder-performed); a build-only sanity mode can validate scaffolding import-clean without network.

### Step 5 — Verify

- `cd website && npx tsc --noEmit` → EXIT 0 (whole project).
- Live (founder, dev server up against TEST, `WSH_*` exported; run one at a time): `npx tsx scripts/whole-system-harness/run-c2.ts --live` → distress at `/api/reason` caught + redirected; other entries per the honest diagnostic.
- Optional human-UI evidence: `webapp-testing` (Anthropic skill) to screenshot the distress redirect on the human surface, per test-brief C2.
- Production probes unchanged (A7 close probes) — confirm production never moved.

### Step 6 — Decision-log entry (Critical **full** form)

Per standing-cache §"Critical-risk sessions" — full form (Verification Method Used; Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; the CCP writeup; Founder Verification; Orchestration Reminder). ID e.g. `D-C2-R20A-DISTRESS-PERIMETER-TEST-VERIFIED-2026-05-XX`.

### Step 7 — Session close (Critical **full** form)

Full close template. Record: the coverage diagnostic + any severity-tagged gaps; the TEST flag flip + its rollback; the run-c2 result; production-untouched confirmation; next item (Session 3 — control-vs-treatment rig).

---

## Rollback

- TEST flag: unset `SUBSTRATE_R20A_GATE_ENABLED` in `website/.env.local`, restart dev. Production was never touched (flag stays UNSET in Vercel).
- `run-c2.ts` + the fixture addition are additive test scaffolding — delete host-side if abandoned.
- **Restore production local dev when test work is done:** `cp website/.env.local.prod-backup-2026-05-24 website/.env.local` (then restart dev; confirm `/api/public-key` serves the production key again).

---

## Locked context — do NOT re-derive

- **R20a classifier model = Haiku** (AC1 / cache Element 6) — single-output safety classifier within the Haiku boundary; do not re-litigate.
- **AC5 perimeter = the eight routes above.** Adding a ninth is itself Critical (AC5 + PR6 + PR1). C2 does **not** add routes to the perimeter — it tests current coverage and exercises the A7 substrate gate.
- **A7 substrate gate is Verified on `/api/reason`**; `SUBSTRATE_R20A_GATE_ENABLED` is UNSET in production. **C2 does not change that** — TEST-only flag flip.
- **Harness `lib/` is proven — reuse, don't rebuild** (PR15): `http-client`, `assertions`, `capture`, `scenario-input`, `fixtures`, and the existing `run-l*` runners are the pattern. `run-comb2.ts` (Session 1) is the most recent example.
- **Production UNTOUCHED.** `/api/reason` byte-identical; provenance gate Live; `/api/substrate/layer3` → 503; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel.
- **Local dev is on PRODUCTION** until Step 0 re-points it at TEST. **No one-line restore-test backup** — re-point per `test-env-standup-checklist.md`. Return to prod: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.
- **Verify with `npx tsc --noEmit`** (full project), not only `npx tsx`. Live runs reach `localhost:3000` (the build sandbox cannot) — live runs + the `Verified` stamp are the founder's between-session step (0c).
- **Branch `main`. The AI does no git operations.** Stage by name; never `git add .`; never stage `website/.env.local*` or `tsconfig.tsbuildinfo`.

---

## Forecast

C2 completes the whole-system test's **safety coverage**: distress at the substrate boundary is caught and redirected, exercised end-to-end in TEST, with an honest, severity-tagged statement of which product entries enforce R20a and which do not. That plus the positive matrix (L1–L7 Verified), Combination 1 (Live), and Combination 2 (Verified 2026-05-27) leaves only the **value-evidence rig (Session 3)** before the **Sage Practice spec (Session 4)**. Production stays untouched throughout; any production R20a activation is a separate, later Critical change.

End of prompt. Opens on `main`. Production unchanged at session open; Step 0 re-points `.env.local` at TEST first. This is a `code-critical` session — the full Critical Change Protocol applies, visibly, before the flag flip.
