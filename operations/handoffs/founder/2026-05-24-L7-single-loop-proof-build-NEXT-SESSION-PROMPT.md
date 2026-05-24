# Next-Session Prompt — Whole-System Test: L7 Single-Loop Proof (Build + Run, PR1)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk. The harness is **test scaffolding** under `website/scripts/` (outside `src/`, never bundled, never deployed); it runs against a **TEST** environment only. **No production code, schema, env, or deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged (the harness calls endpoints over HTTP and imports only the *pure* Seam-2 bridge for a `tsx` step — it writes no DB rows itself; the test endpoints write to the **test** project. If the harness is ever changed to import a DB-write module directly, KG1 engages then — call it out).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-24-whole-system-harness-design-close.md`.
**Predecessor decision-log entries:** `D-WHOLE-SYSTEM-HARNESS-DESIGN-2026-05-24`; `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`; `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`.

## Why this session matters

The harness is **Designed**; this session **builds and runs one configuration** — **L7 (Reasoning + Assent)** — end-to-end against the test environment, as the **PR1 single-loop proof**. L7 is the centrepiece: it exercises the **genuine→200** path (a legitimate `/api/reason` output threaded into a credential write that *succeeds*) plus the **Seam-2 bridge** `tsx` step. A green L7 run is the **first 0h-criterion-4 value demonstration** (agent-developer audience) and the **positive control** that makes every later negative test trustworthy. Prove the pattern on **one** configuration before building the rest (PR1; 0g manual-first). It does **not** build the remaining scenarios or any product code.

## Locked context — do NOT re-derive

- **Approach = Reading A.** The orchestrator *plays the agent* over HTTP; it does **not** chain endpoints server-side (Reading B rejected). Runs against a **test** env (separate test Supabase project), never production.
- **Harness location (decided):** `website/scripts/whole-system-harness/` — outside `src/`, so it never enters the Next.js build. Outputs → `data-room/05_outputs/`. Founder may override at open.
- **The genuine→200 recipe (verified by code-read "check #1"):** `POST /api/reason` → take the `assessment` object from its response (the response is `{ assessment, signature, key_id }` when signing is on — `website/src/lib/translation-sandwich/parallel-run.ts` L785–812) → POST it to `POST /api/accreditation/[agent_id]` as `provenance: { signed_assessments: [ <that object> ] }`. The gate's `validateWriteProvenance` (structural) + `verifyLayer2Signature` (cryptographic) accept exactly this shape.
- **Three conditions for a genuine 200** (config, not missing capability): (1) `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`; (2) a matching signing/public **key-pair** and a `key_id` the verifier recognises (a mismatch = a **"false 403"**); (3) `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` with `SUBSTRATE_LAYER2_PUBLIC_KEY` present. All three are in the test env per `test-env-standup-checklist.md`.
- **Auth (verified by code-read this arc — diagnostic-certain):** `/api/calling`, `/api/accreditation/[agent_id]`, and `/api/practice/reflect` all authenticate with `Authorization: Bearer sr_assent_<token>` (`SAGE_ASSENT_WRITE_TOKEN_PREFIX='sr_assent_'`). Only `/api/reason` uses the JWT / API-key (`X-Api-Key`) / plugin-auth model. **The `sr_assent_` token is minted at setup, before the loop** — not mid-loop. For L7, you need: the `sr_assent_` token (for the accreditation write) **and** an API key (for `/api/reason`).
- **Seam 2 is NOT HTTP-wired.** `sage-assent-bridge.ts` (`SignedLayer2Assessment → EvaluatedAction`, `receipt_id = SHA-256(signature)`) is a pure function no route calls. The harness covers it as a **`tsx` step** (import the bridge, feed it the same signed assessment, assert `receipt_id === SHA-256(signature)`) — **separate** from the credential write. The write proves *possession of genuine substrate output*, not aggregate-faithfulness (M-6, deferred).
- **L7 assertion (b) caveat:** the no-practice disclaimer text is **blocked on Priority 4** (not yet written). So L7 proves **(a)** genuine→200 and **(c)** the bridge mapping this session; **(b)** the disclaimer-string assertion is recorded as *pending Priority 4*, not failed.
- **Branch:** the founder worked on `main` last session. Confirm the checked-out branch at open; the AI does **no** git operations (host-side only; clear any `.git/index.lock` host-side).
- **Production state:** UNCHANGED. Provenance gate **Live**; rollback = unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy (unchanged, independent of this session).

## Pre-conditions (confirm at open)

1. **Test environment is standing** (founder-performed per `data-room/04_test_brief/test-env-standup-checklist.md`), and the checklist's **Step 7 positive control returns `200`** (a genuine write succeeds). *This is the hard prerequisite for running the proof.* If the env is not standing, see the scope election below.
2. **Branch handling (founder call).** Continue on `main` (the harness is new files under `website/scripts/`, additive) or a dedicated branch. The AI confirms the checked-out branch before editing and does no git ops.
3. Working tree clean; no `.git/index.lock` (clear host-side if present).
4. **Scope election (founder call at open):**
   - **(a) Build + run** — the test env is standing → build the L7 harness and run the proof (the intended path).
   - **(b) Build-only** — the test env is not yet standing → build the L7 harness scaffolding so it is ready to run, but defer the run to a follow-up (the harness stays at **Scaffolded/Wired**, not **Verified**, until it runs).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, model selection, lean templates, risk class).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/operations/handoffs/founder/2026-05-24-whole-system-harness-design-close.md` (predecessor close).
4. `data-room/04_test_brief/orchestrator-harness-design.md` (the harness spec — §3 auth, §4 threading map, §5 the bridge `tsx` step, §7 build sequencing) and the **L7 row** of `data-room/04_test_brief/scenario-matrix.md`.
5. `data-room/04_test_brief/test-flag-config.md` (the genuine→200 trio + false-403 trap) and `data-room/04_test_brief/test-env-standup-checklist.md` (the env the run assumes).
6. `/operations/decision-log.md` — the three predecessor entries named above.

**PR15 consult (before any bespoke build):** the harness extends the repo's existing **plain-`tsx` assertion pattern**, not greenfield. `webapp-testing` (Playwright) is for the *human* UI (C1, later) — not needed for the L7 API loop. Claude Code sub-agents may orchestrate the scripted journey. State the Anthropic-primitive consideration before writing the script.

Confirm at open: tier (`code-standard`/Standard); branch checked out; test-env-standing status; the gate is Live; status vocabulary; model selection (the test env's `/api/reason` uses Sonnet for Layer 1/3 + Haiku for quick-depth per AC1 — no model choice is the harness's to make).

## Part B — Procedure

### Step 1 — Scaffold the L7 harness (`code-standard`; PR1 minimum)
Create `website/scripts/whole-system-harness/` with **only what L7 needs** (per harness design §2 layout): `lib/http-client.ts` (fetch wrapper: base URL, auth headers, JSON, status capture), `lib/bridge-step.ts` (imports `../../src/lib/substrate/sage-assent-bridge.ts`; asserts `receipt_id === SHA-256(signature)`), `lib/assertions.ts`, `lib/capture.ts` (writes the run ledger to `data-room/05_outputs/`), and `run-l7.ts` (the entry point). Keep it a plain-`tsx` script (no Jest). **PR2:** verify the script actually runs and asserts in the same session — a harness that exists but never runs is worse than none.

### Step 2 — Generate the L7 scenario input
Use Claude to generate one realistic first-person agent impression (per the scenario-matrix L7 row — e.g. the "pressured to ship something I believe is unsafe" shape). Record it in `data-room/05_outputs/` alongside the run so the input is inspectable.

### Step 3 — Run the L7 loop against the test env (scope (a) only)
`POST /api/reason` (with `X-Api-Key`; signing on) → capture `{ assessment, signature, key_id }` → `POST /api/accreditation/[test_agent_id]` (with `Bearer sr_assent_<token>`) carrying `provenance: { signed_assessments: [ <assessment object> ] }` → **expect `200`**. Then run the **bridge `tsx` step** on the same signed assessment → assert a well-formed `EvaluatedAction` with `receipt_id === SHA-256(signature)`. Record assertion **(b)** (no-practice disclaimer) as **pending Priority 4**.

### Step 4 — Verify (PEV loop, PR10)
The genuine write returns `200`; the bridge `tsx` step passes; the run ledger is written to `data-room/05_outputs/`. If the write returns `403 no_examination` on genuine input, that is the **"false 403"** — the public key does not match the signing key; regenerate the test key-pair together (checklist Step 3) before re-running. Classify the outcome: **Diagnostic-certain** if the proof passes as designed; **Diagnostic-uncertain — symptom level** if a failure's root cause is not confirmed (founder acknowledgement required before treating as resolved). PR1: L7 must reach **Verified** (0a) before any L1–L6 build.

### Step 5 — Append decision-log entry (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Record the L7 result, the harness's implementation status (Verified if run; Scaffolded/Wired if build-only), and the `05_outputs/` artefact path.

### Step 6 — Session close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean session close". Provide founder commit commands (stage by name — there is untracked `data-room/` and now `website/scripts/` content; do **not** `git add .`). No Vercel impact (test scaffolding is never deployed).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + harness design + L7 row read | 15–20 min |
| Confirm test env standing (positive control = 200) | 10 min |
| Step 1 (scaffold L7 harness) | 45–75 min |
| Step 2 (generate L7 input) | 10 min |
| Step 3 (run the loop) | 20–30 min |
| Step 4 (verify, PEV) | 15–20 min |
| Decision-log + close | 20–30 min |
| **Total** | **~2.5–3.5 hours** |

## Rollback

Test scaffolding only — nothing deployed, nothing in production to roll back. The harness files are new and additive; delete them host-side if abandoned. The test env writes only to the **test** Supabase project. The production gate's rollback (unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy) is unchanged and independent.

## Forecast

Success = the L7 single-loop proof runs green against the test env (genuine→200 + bridge `tsx` step), captured in `data-room/05_outputs/` — the first 0h-criterion-4 value demonstration, and the positive control for the negatives. After this: build out L1–L6 + Combination 1/2 on the proven pattern (C2 distress perimeter stays deferred to a Critical session; Combination 2 stays blocked on Priority 4). Then the harness becomes the control-vs-treatment rig for the "is the agent better *with* the substrate?" comparison (the second-room question).

End of prompt. Opens on `main` unless the founder elects a branch at open (confirm at open). Build + run against the **test** environment only — production is unchanged by this session.
