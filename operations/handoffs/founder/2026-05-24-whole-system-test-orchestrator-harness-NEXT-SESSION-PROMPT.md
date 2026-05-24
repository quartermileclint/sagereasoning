# Next-Session Prompt — Whole-System Test: Reading-A Orchestrator Harness (Design + Env Standup, + optional single-loop proof)

**Stream:** founder.
**Tier:** `governance` (design + data-room docs) → `code-standard` if the optional build step is elected. **Standard** risk throughout. **No production code, schema, env, or deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged (the orchestrator runs against a TEST environment; if it ever imports DB-write modules that changes — call it out then).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-24-data-room-combination-1-passing-close.md`.
**Predecessor decision-log entries:** `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`; `D-DATA-ROOM-COMBINATION-1-PASSING-2026-05-24`; `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`.

## Why this session matters

The whole-system test approach is settled: **Reading A** — a data-room **orchestrator that plays the agent**, driving the four real product endpoints in sequence over HTTP with Claude-generated scenario inputs, against a **TEST** environment (no production writes). This session designs that orchestrator, defines the scenario matrix, and produces the test-environment standup checklist — so the build session that follows opens with a spec and a ready environment. It does **not** build new product code; the orchestrator is test scaffolding, not server-side seam-wiring (Reading B was rejected). If the test environment is already standing, the session may stretch into a **PR1 single-loop proof** on one configuration.

## Locked context — do NOT re-derive

- **Approach = Reading A** (per `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`). The orchestrator plays the agent; it does **not** chain endpoints server-side. Reading B (server-side seam-wiring) and a controlled-production run were both rejected — run against a **test** environment.
- **Coverage:** one scenario per confirmed configuration (test-brief A.1, **L1–L7**) + the two negatives (**Combination 1** → expect 422/403; **Combination 2** → disclaimer present). See `data-room/04_test_brief/test-brief.md` (now flipped: Combination-1 is a *passing assertion*; M-4 resolved).
- **The genuine→200 recipe (verified by code-read, "check #1" 2026-05-24):** call `/api/reason` → take the `assessment` object from the response (it is `{ assessment, signature, key_id }` when signing is on, per `parallel-run.ts` L785–812) → POST it to `/api/accreditation/[agent_id]` as `provenance: { signed_assessments: [ <that object> ] }`. The gate's `validateWriteProvenance` + `verifyLayer2Signature` accept exactly this shape.
- **Three conditions for a genuine 200** (these are config, not missing capability): (1) `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'`; (2) a matching signing/public key pair and a `key_id` the verifier recognises; (3) `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` with `SUBSTRATE_LAYER2_PUBLIC_KEY` present.
- **Seam 2 is NOT HTTP-wired.** `sage-assent-bridge.ts` (`SignedLayer2Assessment → EvaluatedAction`, `receipt_id = SHA-256(signature)`) is a pure function no route calls. The orchestrator threads it client-side (or via a `tsx` step) — it is not exercised by the credential write itself. The genuine→200 path proves *possession of genuine substrate output*, not aggregate-faithfulness (M-6, deferred).
- **Endpoints in the loop:** `POST /api/calling` → `POST /api/reason` → (admin-mint a test `sr_assent_` credential) → `POST /api/accreditation/[agent_id]` → `POST /api/practice/reflect` (returns `exit_path` → next product). `GET /api/public-key` for verification.
- **Branch:** the founder worked on `main` last session; the `data-room/` files live there. Confirm the checked-out branch at open; the AI does **no** git operations (host-side only — the sandbox cannot do git working-tree ops; clear any `.git/index.lock` host-side).
- **Production state:** UNCHANGED. Provenance gate Live; rollback = unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy.
- **`test-flag-config.md` is stale** — predates the provenance gate; omits `SUBSTRATE_PROVENANCE_GATE_ENABLED` + `SUBSTRATE_LAYER2_PUBLIC_KEY`. Updating it is Step 1.

## Pre-conditions (confirm at open)

1. **Branch handling (founder call).** Confirm whether to continue on `main` (recommended — consistent with last session) or a dedicated branch for the harness work. The AI confirms the checked-out branch before editing and does no git ops.
2. Working tree clean; no `.git/index.lock` (clear host-side if present).
3. **Scope election (founder call at open):** design-only (Steps 1–4 + close), or design + the optional single-loop proof (Step 5) if the test environment is already standing.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, model selection, lean templates, risk class).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/operations/handoffs/founder/2026-05-24-data-room-combination-1-passing-close.md` (predecessor close).
4. `/operations/decision-log.md` — `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24` + the two predecessors named above.
5. `data-room/04_test_brief/test-brief.md` (the configuration matrix + seams) and `data-room/04_test_brief/test-flag-config.md` (the safety boundary; stale).
6. `/drafts/2026-05-23-whole-system-data-room-brief.md` §5 (test surfaces) + §9 (Anthropic-native tooling for the harness).

**PR15 consult (before any bespoke build):** check `.claude/skills/anthropic/` for `webapp-testing` (Playwright — drives the human front-end) and consider Claude Code sub-agents/scripts for the API loop, per brief §9. The harness extends the existing plain-`tsx` assertion pattern, not greenfield.

Confirm at open: tier; branch checked out; status vocabulary; the gate is Live; Reading A scope.

## Part B — Procedure

### Step 1 — Refresh the stale test-flag-config (data-room doc; Standard)
In `data-room/04_test_brief/test-flag-config.md`, add `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` and `SUBSTRATE_LAYER2_PUBLIC_KEY` to the test column, and add a note on the signing/public **key-pair match** + `key_id` recognition (the "false 403" trap). Cross-reference the genuine→200 recipe.

### Step 2 — Design the orchestrator harness
Produce a short design doc (in the data room — e.g. `data-room/04_test_brief/orchestrator-harness-design.md`): what the harness is (a script that plays the agent over HTTP), where it lives (`data-room/` vs `website/` — decide and record), how it authenticates per endpoint in the test env (API-key/plugin-auth for `/api/reason`; admin-mint + `sr_assent_` token for accreditation), and the **endpoint-threading map** (Calling five-spec → `/api/reason` input; `/api/reason` `assessment` → accreditation `provenance`; Reflect `exit_path` → next product). Build on `webapp-testing` for the human UI per PR15.

### Step 3 — Define the scenario matrix
One scenario per configuration (L1–L7) + Combination 1 (expect 422/403) + Combination 2 (disclaimer present). For each: the Claude-generated inputs, the endpoints exercised, the seam(s) covered, and the pass assertion (tie to `03_seam_map/` + test-brief §B). Record where the harness must drop to a `tsx` step (Seam 2 bridge).

### Step 4 — Test-environment standup checklist
A founder-performable checklist: create a separate **test** Supabase project; replay the migrations (enumerate them from `02_inventory/`); set the test env vars (the three genuine→200 conditions + `SAGE_CALLING_ENABLED`, `SAGE_REFLECT_ENABLED`, `SUBSTRATE_WRITE_PATH_ENABLED`, test `ANTHROPIC_API_KEY`, test `PLUGIN_AUTH_SECRET`, test `MENTOR_ENCRYPTION_KEY`); run locally (`npm run dev`) or a preview wired to the test project — **never production**.

### Step 5 — (Optional / stretch) PR1 single-loop proof
If the test env is standing, build + run **one** configuration end-to-end (recommend L7 Reasoning + Assent — it exercises the genuine→200 centrepiece) as the PR1 single-loop proof. Capture the result into `data-room/05_outputs/`. Prove the pattern on one before rolling out to all (PR1; 0g manual-first).

### Step 6 — Append decision-log entry (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry".

### Step 7 — Session close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean session close". Provide founder commit commands (stage by name; `www` for any live checks).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + test-brief read | 15–20 min |
| Step 1 (flag-config refresh) | 15 min |
| Step 2 (orchestrator design) | 45–60 min |
| Step 3 (scenario matrix) | 45–60 min |
| Step 4 (env standup checklist) | 30 min |
| Step 5 (optional single-loop proof) | 60–90 min |
| Decision-log + close | 20–30 min |

## Rollback

Design + data-room docs only — nothing to roll back at runtime. If Step 5 is run, it touches only the test environment; the production gate's rollback (unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy) is unchanged and independent.

## Forecast

Success = the orchestrator harness is designed, the scenario matrix is defined (L1–L7 + 2 negatives), and the test-environment standup checklist exists — so the build session opens ready. If Step 5 is elected, one configuration is proven end-to-end against the test env (the first 0h-criterion-4 value demonstration). After this: build out the remaining scenarios; then the harness becomes the control-vs-treatment rig for the "is the agent better with the substrate" comparison (the second-room question).

End of prompt. Opens on `main` unless the founder elects a branch at open (confirm at open). Design + workspace only — production is unchanged by this session.
