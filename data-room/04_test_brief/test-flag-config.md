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
| `SUBSTRATE_LAYER2_SIGNING_ENABLED` | on (A3/A4 Verified) | `true` | **Seam 2 needs signing** — the `SignedLayer2Assessment` is what the bridge anchors `receipt_id` to |
| `SUBSTRATE_LAYER3_ENABLED` | **UNSET → 503** | `true` | Production keeps Layer 3 off; the **whole-loop test needs Layer 3 prose** to exercise the full substrate. This is a deliberate test-only difference |
| `SUBSTRATE_R20A_GATE_ENABLED` | **UNSET** | `true` (when testing the perimeter) | To exercise the **substrate-side** R20a gate end-to-end. (On the eight AC5 routes R20a is already enforced by the invocation guard regardless.) Note: enabling this in *production* is **Critical** — here it is test-only |
| `TRANSLATION_SANDWICH_PARALLEL_RUN` | per current prod | match prod, or `false` for determinism | Keep test runs reproducible unless the test is specifically about parallel-run |
| `PLUGIN_AUTH_ENABLED` / `PLUGIN_AUTH_SECRET` | prod values | **test values** | A test credential, not the production secret |
| `ANTHROPIC_API_KEY` | prod key | **test/dev key** | LLM calls for Layer 1 + Layer 3; keep test spend isolated |
| `MENTOR_ENCRYPTION_KEY` | prod key | **test key** | Never decrypt real intimate data in a test env (R17b) |

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
