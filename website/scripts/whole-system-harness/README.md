# Whole-System Harness — L7 single-loop proof

Test scaffolding that **plays an agent** over HTTP against a **TEST** environment
(Reading A; `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`). It lives
under `website/scripts/` — **outside `src/`**, so Next.js never bundles it and it
is **never deployed**. It writes only to the **test** Supabase project, never
production.

This first build is the **PR1 single-loop proof**: one configuration — **L7
(Reasoning + Assent)** — end-to-end, before the rest of the matrix is built on
the proven pattern.

## What L7 proves

| # | Assertion | Where | This build |
|---|---|---|---|
| (a) | genuine→200 credential write (`/api/reason` → `/api/accreditation`) | LIVE run | **deferred** to the founder live run |
| (b) | no-practice disclaimer string surfaced | docs | **pending Priority 4** (text not written) |
| (c) | Seam 2 bridge: `receipt_id === 'rcpt_' + SHA-256(signature)` | both modes | **proven here** (build-only) |

## Two modes

### Build-only (default — no live env, no secrets)

Runs the Seam 2 **bridge tsx step** against a synthetic `SignedLayer2Assessment`
fixture and writes a run ledger to `data-room/05_outputs/`. No network, no DB.

```
cd website
npx tsx scripts/whole-system-harness/run-l7.ts
```

Exit 0 = all assertions passed.

### Live (founder-performed once the TEST env is standing)

Prerequisite: the test environment is standing per
`data-room/04_test_brief/test-env-standup-checklist.md`, and its **Step 7
positive control returns 200**. Then set the env vars and run with
`--env-file=.env.local`:

| Env var | Value |
|---|---|
| `WSH_BASE_URL` | e.g. `http://localhost:3000` (your `npm run dev`, test env) |
| `WSH_API_KEY` | the test `api_keys` row — `X-Api-Key` for `/api/reason` |
| `WSH_ASSENT_TOKEN` | the test `sr_assent_` token — Bearer for `/api/accreditation` |
| `WSH_AGENT_ID` | the test `agent_id` the `sr_assent_` token is bound to |

```
cd website
npm run dev          # in one terminal, with the test .env.local (Step 6 of the checklist)
# in another terminal:
npx tsx --env-file=.env.local scripts/whole-system-harness/run-l7.ts --live
```

The live run threads: `POST /api/reason` (signing on) → `output.assessment`
(`{ assessment, signature, key_id }`) → `POST /api/accreditation/[agent_id]`
with `{ kind:'seed', profile, provenance:{ signed_assessments:[…] } }` → **200**,
then the bridge tsx step on the same signed assessment.

> **"false 403" trap:** a `403 no_examination` on *genuine* input means the
> public key does not match the signing key — regenerate the test key-pair
> *together* (checklist Step 3), don't treat it as a forgery rejection.

## Layout

```
run-l7.ts            entry point (one mode per invocation)
lib/
  http-client.ts     fetch wrapper (LIVE only): base URL, auth headers, status capture
  bridge-step.ts     Seam 2 bridge tsx step — imports ONLY the pure sage-assent-bridge
  fixtures.ts        synthetic SignedLayer2Assessment for build-only (reused from the bridge test)
  scenario-input.ts  the L7 Claude-generated impression (drives live /api/reason)
  assertions.ts      plain-assertion ledger (no Jest; mirrors the repo test pattern)
  capture.ts         writes the run ledger (JSON + Markdown) to data-room/05_outputs/
```

## Scope / honest limitations

- The genuine→200 write proves **possession of genuine substrate output**. It
  does **not** prove aggregate-faithfulness (M-6, deferred).
- The bridge step is a **separate** assertion about the pure mapping; it is not
  part of the credential write.
- C2 (R20a distress perimeter across the loop) is **Critical-tier** — out of
  scope here; built later under the Critical Change Protocol.
- Only L6 and L7 use the bridge tsx step. L1–L6 + the two negatives are built
  on this proven pattern (PR1) — see below.

## L1–L6 build (2026-05-25)

Built the **clean** positive scenarios as **sibling runners** on the L7 pattern
(founder "clean scenarios first" election). Each mirrors the run-l7.ts two-mode
shape: a **dry-preview** default (no env — prints inputs + assertion plan, exits 0;
used for sandbox import-checks) and a **`--live`** mode the founder runs against the
standing TEST env.

| Runner | Scenario | Endpoint(s) | LLM cost on live run | Founder verifies |
|---|---|---|---|---|
| `run-l1.ts` | L1 — Reasoning alone | `/api/reason` (X-Api-Key) | 1 Sonnet pass | runner asserts 200 + Layer-2 + Layer-3 + disclaimer |
| `run-l2.ts` | L2 — Calling alone (**incomplete-specs variant only**) | `/api/calling` (Bearer) | none (engine is pure) | runner asserts `null_result` + clarification + NO handoff |
| `run-l3.ts` | L3 — Reflect alone | `/api/practice/reflect` (Bearer) | ~4–5 Sonnet (Q1–Q4 + cond. Q5) | runner asserts `complete` + thin profile + mirror note |
| `run-l5.ts` | L5 — Reasoning + Reflect (Seam **S3**) | `/api/reason` → `/api/practice/reflect` | 1 + ~4–5 Sonnet | runner asserts profile read-back; **founder runs the S3 DB-verify SQL** the runner prints |

Live run (one at a time; dev server up against the test env; `WSH_*` exported as for L7):
```
cd website
npx tsx scripts/whole-system-harness/run-l1.ts --live
npx tsx scripts/whole-system-harness/run-l3.ts --live
npx tsx scripts/whole-system-harness/run-l2.ts --live
# L5 (exercise FK-seed: run the teardown SQL in the TEST SQL editor first):
#   delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';
npx tsx scripts/whole-system-harness/run-l5.ts --live
```
These runners import only `lib/` (no Supabase module), so they run under a plain
`npx tsx` — `--env-file` is not required (the `WSH_*` come from the shell export).

### Shared lib added this build
- `lib/http-client.ts` — `postCalling` + `postReflect` (both Bearer `sr_assent_`).
- `lib/reflect-driver.ts` — **adaptive** Reflect dialogue driver (answers whatever
  step the engine surfaces — Q1–Q6, FD-R1, RS-4 — looping to `complete`). Shared by
  L3 + L5. AGENT-NATIVE answers; a caller may override any step.
- `lib/capture.ts` — generalised from the L7-only literal to any scenario label.

## L2-complete / L4 / L6 build (2026-05-25) — positive scenarios completed

Built the three previously-deferred positive scenarios, settling the approval seam
by **founder election of Option A — the pure `tsx` step** (no admin credential, no
new env flags):

| Runner | Scenario | Approach | Founder verifies (live) |
|---|---|---|---|
| `run-l2-complete.ts` | L2-complete — Calling approved path | drive `/api/calling` → `awaiting_approval`, then pure `buildDiscoveredPurpose()` over the captured history | reaches the Hard Gate + the five slots carry the agent's own words (no dropped slot) |
| `run-l4.ts` | L4 — Seam S1 | thread the five-spec into a `Layer1Schema`; real `validateLayer1Schema()` | all five slots survive into Layer 1 (input↔received printed side-by-side) |
| `run-l6.ts` | L6 — full suite (S1–S4) | S1 build+survival → S2 `/api/reason`+genuine write+bridge → S3 Reflect → S4 consume `exit_path` | each seam in sequence; **S4 re-entry returns 200 (loop closes)**; founder runs the printed DB-verify SQL for S2/S3 |

Shared `lib/` added this build: `calling-driver.ts` (adaptive drive to the Hard
Gate; complete-path answers authored against the `engine.ts` marker sets; faithful
`(stage,response)` history reconstruction) and `discovered-purpose-asserts.ts`
(shared five-slot + Layer-1-survival assertions). The pure cores run in dry-preview
(no network) — sandbox-verified green (L2-complete 10/10, L4 7/7, L6 build-only
37/37) + `npx tsc --noEmit` clean. The live HTTP runs are the founder's.

Live run (one at a time; dev server up against the test env; `WSH_*` exported):
```
cd website
# L6 seed teardown FIRST (TEST SQL editor): delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';
npx tsx scripts/whole-system-harness/run-l2-complete.ts --live
npx tsx scripts/whole-system-harness/run-l4.ts --live
npx tsx --env-file=.env.local scripts/whole-system-harness/run-l6.ts --live
```

### Still deferred
- **Option B** (admin `POST /api/calling/approve` HTTP + plugin-auth Layer-1 thread)
  — the higher-fidelity follow-up exercising the real D-14 gate end-to-end.
- **Combination 2** — blocked on Priority 4 (disclaimer text).
- **C2** (R20a distress perimeter across the loop) — Critical-tier, a separate session.
