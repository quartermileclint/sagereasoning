# 04 — Test Flag-Config (the loop's "on" switch — and the safety boundary)

**The point (brief §5.6):** to test the whole loop, all four products must be ON at once. That configuration is, **by design, different from production** — and *naming that difference is itself a safety control*. The single most important line in this file: **the test environment must point at a TEST database, never production Supabase, and never the live Vercel deployment** (brief §8.2).

This file defines the flags. The actual run (Step 7) happens in a later session, in the **Code tab**, against a **test** environment.

---

## The flag table

| Flag | Production (baseline) | **Test (whole-loop)** | Why the test value differs |
|---|---|---|---|
| `SAGE_CALLING_ENABLED` | set (Live) | `true` | Stage 1 on |
| `SAGE_REFLECT_ENABLED` | `true` | `true` | Stage 4 on (master kill-switch; 503 otherwise) |
| `SUBSTRATE_WRITE_PATH_ENABLED` | `true` | `true` | Stage 3 credential write path on (A10 kill-switch) |
| `SUBSTRATE_LAYER2_SIGNING_ENABLED` | on (A3/A4 Verified) | `true` | **Seam 2 needs signing** — the `SignedLayer2Assessment` is what the bridge anchors `receipt_id` to, **and** the signed `assessment` is what a *genuine* credential write submits as its `provenance` (the genuine→200 path; see below) |
| `SUBSTRATE_PROVENANCE_GATE_ENABLED` | **`true` (Live 2026-05-24)** | `true` | The R18f write-boundary gate (`D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`). **`true` in both**, but in test it does double duty: it **enforces the Combination-1 negatives** (no `provenance` → 422 `bad_provenance`; forged → 403 `no_examination`) *and* it is the gate a **genuine→200** write must satisfy. Unsetting it in *production* is the gate's rollback; in test it stays on so the headline assertions run |
| `SUBSTRATE_LAYER2_PUBLIC_KEY` | set (prod verifier key) | **the TEST key-pair's public key** | The gate verifies the submitted signature against this key. It **MUST be the public half of the same key-pair the test env signs with** (see the key-pair-match note below) — a mismatch makes every *genuine* write fail the verify as a **"false 403"** |
| `SUBSTRATE_LAYER3_ENABLED` | **UNSET → 503** | `true` | Production keeps Layer 3 off; the **whole-loop test needs Layer 3 prose** to exercise the full substrate. This is a deliberate test-only difference |
| `SUBSTRATE_R20A_GATE_ENABLED` | **UNSET** | `true` (when testing the perimeter) | To exercise the **substrate-side** R20a gate end-to-end. (On the eight AC5 routes R20a is already enforced by the invocation guard regardless.) Note: enabling this in *production* is **Critical** — here it is test-only |
| `TRANSLATION_SANDWICH_PARALLEL_RUN` | per current prod | match prod, or `false` for determinism | Keep test runs reproducible unless the test is specifically about parallel-run |
| `PLUGIN_AUTH_ENABLED` / `PLUGIN_AUTH_SECRET` | prod values | **test values** | A test credential, not the production secret |
| `ANTHROPIC_API_KEY` | prod key | **test/dev key** | LLM calls for Layer 1 + Layer 3; keep test spend isolated |
| `MENTOR_ENCRYPTION_KEY` | prod key | **test key** | Never decrypt real intimate data in a test env (R17b) |

## The genuine→200 trio + the "false 403" trap (added 2026-05-24)

The three conditions for a *legitimate* credential write to **succeed** (a genuine 200, not merely a correctly-rejected forgery) are **configuration, not missing capability** — verified by code-read ("check #1", 2026-05-24):

1. **`SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`** — so `/api/reason` returns a *signed* assessment.
2. **A matching signing/public key-pair, and a `key_id` the verifier recognises** — the private signing key the test env signs with and the `SUBSTRATE_LAYER2_PUBLIC_KEY` the gate verifies against must be **two halves of one pair**, and the assessment's `key_id` must be one the verifier knows (the current key, or an A4 rotation-overlap previous key). A mismatched pair or an unknown `key_id` makes the verify fail on *genuine* input — a **"false 403"** (`no_examination` returned for a real examination). This is the single most common test-env misconfiguration.
3. **`SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` with `SUBSTRATE_LAYER2_PUBLIC_KEY` present** — the gate is on and has a key to verify against. (If the gate is on but the key env is missing/malformed, the gate routes to `verifier_unavailable` → **503**, *not* a 403 — an operator-misconfig signal, deliberately distinct from a forgery.)

**The genuine→200 recipe (the L7 centrepiece):** call `POST /api/reason` → take the `assessment` object from its response (the response is `{ assessment, signature, key_id }` when signing is on — `website/src/lib/translation-sandwich/parallel-run.ts` L785–812) → POST it to `POST /api/accreditation/[agent_id]` as `provenance: { signed_assessments: [ <that object> ] }`. The gate's `validateWriteProvenance` (structural) + `verifyLayer2Signature` (cryptographic) accept exactly this shape. The endpoint-threading map in `orchestrator-harness-design.md` and the **L7** row of `scenario-matrix.md` carry the full step-by-step.

> **Why this trio lives in the safety file:** the *same* `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` that lets the genuine path through is what *enforces* the Combination-1 block. Getting the key-pair wrong doesn't only break L7 — a 403 from a **key mismatch** looks identical to a 403 from a **forgery**, so a mis-paired key would make the Combination-1 negative "pass" for the wrong reason. The key-pair match is therefore a **test-validity** control, not just a convenience: before trusting any negative result, confirm a *genuine* write returns 200 on the same env (the positive control).

## The database boundary (the non-negotiable safety control)

| Connection | Production | **Test** |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod project | **a separate test Supabase project** |
| `SUPABASE_SERVICE_ROLE_KEY` | prod key | **the test project's key** |

- **No writes to production tables.** A real loop writes `discovery_sessions`, `evaluated_actions`, `agent_accreditation`, `grade_history`, `credential_audit`, and the reflect store. All of those must be **test-project tables**.
- **No live Vercel env.** Run locally (`npm run dev` in `website/`) or on a preview deployment wired to the test project — never against the production deployment.
- **Test agent + test credential only.** Mint a test `sr_assent_…` credential bound to a test `agent_id`; "no current users" holds (founder + test logins only).

## How the difference *is* the safety control

If a future run is ever found pointing at the production `SUPABASE_URL`, or running with the production deployment, that is the signal to **stop** — the test has crossed the boundary this file draws. The baseline in `00_baseline/` is what "untouched production" must look like before and after any run.
