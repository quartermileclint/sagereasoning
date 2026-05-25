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
  later on this proven pattern (PR1).
