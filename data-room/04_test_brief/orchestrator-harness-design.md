# 04 — Orchestrator Harness Design (Reading A)

**Status:** Designed (0a). Built in a later session (the PR1 single-loop proof first, then the rest of the matrix). **Decision status of the approach:** Adopted — `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`.
**Tier of the session that produced this:** `governance` — Standard risk. Design + data-room docs only; no product code, schema, env, or deploy touched.
**Date:** 2026-05-24.
**Reads alongside:** `03_seam_map/seam-map.md` (the four seams under test), `04_test_brief/test-brief.md` (the configuration matrix + per-seam pass criteria), `04_test_brief/test-flag-config.md` (the safety boundary + the genuine→200 trio), `04_test_brief/scenario-matrix.md` (one scenario per configuration), `04_test_brief/test-env-standup-checklist.md` (the founder-performed prerequisite).

---

## 1. What the harness is (and is not)

The harness is a **script that plays the agent**. It drives the four real product endpoints in sequence over HTTP — `/api/calling` → `/api/reason` → `/api/accreditation/[agent_id]` → `/api/practice/reflect` — threading each endpoint's output into the next call, with **Claude-generated scenario inputs**, against a **TEST environment** (a separate test Supabase project; never production).

This is **Reading A** (per `D-WHOLE-SYSTEM-TEST-ORCHESTRATOR-READING-A-2026-05-24`). The harness exercises the seams **at the HTTP boundary**, as a real agent developer's client would. It is **test scaffolding, not product code**:

- It does **not** chain endpoints server-side. There is no new route that calls another route. (That was **Reading B**, rejected — it would be a partly-Critical product build, and it conflicts with the "two front-ends, one substrate" design where the agent is the orchestrator, not the server.)
- It does **not** modify any product behaviour. Every endpoint it calls is the one already deployed; the harness only sends requests and inspects responses.
- It writes **only** to the test Supabase project and runs against a **local `npm run dev`** (or a preview deployment wired to the test project) — **never** production.

The one place the orchestrator reaches **inside** the codebase is the **Seam 2 bridge** — a pure function no route calls — which it imports and runs as a **`tsx` step** (see §5). Everything else is HTTP.

> **Why this is the right shape.** A by-hand manual loop strings the products together *through a human* — it never exercises the seams as wired integrations, and a human can silently paper over a dropped handoff (the E#1 failure class: a value computed then discarded). The orchestrator threads the *actual* output of one endpoint into the *actual* input of the next, so a dropped or mis-shaped seam shows up as a failed assertion, not a human's good guess. It is repeatable, comparable run-to-run, and — because it writes only to a test project — needs no production snapshot or surgical cleanup. It also doubles, later, as the **control-vs-treatment rig** for the "is the agent better *with* the substrate?" comparison (the second-room question).

## 2. Where it lives (decision)

**Decision: the harness scripts live under `website/scripts/whole-system-harness/`; the spec, scenario matrix, and run outputs stay in `data-room/`.** Recommended; the founder may override at build time.

| Concern | Resolution |
|---|---|
| Must import the real Seam 2 bridge + the project's types for the `tsx` step | `website/` is where `sage-assent-bridge.ts` and the TypeScript config live. A script under `website/scripts/` imports them by relative path and runs under the project's existing `npx tsx` toolchain. |
| Must **not** ship in the production bundle | `website/scripts/` is **outside `website/src/`**, so Next.js does not include it in the build. (Putting it in `src/lib/` would risk bundling — explicitly avoided.) This keeps "no production code touched" true: the harness is never deployed. |
| Must extend the existing test pattern, not start greenfield (PR15) | The repo's substrate/translation-sandwich tests are **plain-assertion `tsx` scripts** (no Jest). The harness is the same pattern at a larger scope: a `tsx` script that makes assertions and exits non-zero on failure. |
| Outputs belong to the room (0e; brief §6) | Run results, captured request/response pairs, and the pass/fail ledger are written to **`data-room/05_outputs/`** — the room's results folder, currently holding only its README. |
| Human-UI checks need Playwright | The `webapp-testing` skill (`.claude/skills/anthropic/webapp-testing/`) drives the human front-end for C1/C2 (see §6). Its scripts also live under `website/scripts/` alongside the API harness. |

**Layout (built later):**

```
website/scripts/whole-system-harness/
  run-loop.ts            # the orchestrator entry point (one config per invocation)
  lib/
    http-client.ts       # thin fetch wrapper: base URL, auth headers, JSON, status capture
    scenario-inputs.ts   # Claude-generated inputs per configuration (L1–L7 + negatives)
    thread.ts            # the endpoint-threading map (§4) in code
    bridge-step.ts       # the Seam 2 tsx step: imports sage-assent-bridge.ts (§5)
    assertions.ts        # pass/fail assertions tied to test-brief §B + §C
    capture.ts           # writes the run ledger to data-room/05_outputs/
  README.md              # how to run one config; where outputs land
```

## 3. Authentication per endpoint (test env)

**This section was grounded by a code-read on 2026-05-24, and it corrects an assumption in the next-session prompt.** The prompt said "API-key/plugin-auth for `/api/reason`; admin-mint + `sr_assent_` token for accreditation." The code shows a simpler, more uniform picture for three of the four endpoints:

| Endpoint | Auth required (test env) | Source of truth | Notes |
|---|---|---|---|
| `POST /api/calling` | **`Authorization: Bearer sr_assent_<token>`** | `calling/route.ts` auth gate (D-6, AC7); `validateSageAssentWriteToken(token, agent_id)` | Single `401` on any auth failure (no info leak). Also gated by `SAGE_CALLING_ENABLED='true'`. |
| `POST /api/reason` | **One of:** Supabase JWT (`requireAuth`) **OR** API key (`X-Api-Key`, `validateApiKey`) **OR** plugin-auth (`Authorization` against `PLUGIN_AUTH_SECRET`, only when `PLUGIN_AUTH_ENABLED='true'`) | `reason/route.ts` L454–502 | **Recommended for the harness: the API-key (`X-Api-Key`) path** — it is the agent-developer surface and it is what drives Option-D loop metering. Plugin-auth (shared secret) is the lighter alternative if metering is not under test. |
| `POST /api/accreditation/[agent_id]` | **`Authorization: Bearer sr_assent_<token>`**, scope `sage_assent_write`, bound to `agent_id` | `accreditation/[agent_id]/route.ts` L391–394; `validateSageAssentWriteToken` | Then the A10 ownership gate, then the **provenance gate** (`enforceWriteProvenance`) → `422` / `403` / `503`. |
| `POST /api/practice/reflect` | **`Authorization: Bearer sr_assent_<token>`** | `practice/reflect/route.ts` L115–116 | Single `401` on failure. Also gated by `SAGE_REFLECT_ENABLED='true'` (503 until set). |
| `GET /api/public-key` | **None (public)** | `public-key/route.ts` | Serves the Ed25519 verification key; used to confirm the test key-pair the gate verifies against. |

**Consequence for the harness (a refinement, diagnostic-certain):** the **same `sr_assent_` write token authenticates Calling, Accreditation, and Reflect**. It is therefore **minted once, as a setup step, before the loop begins** — not mid-loop. (The prompt's inline "admin-mint … then accreditation" ordering would leave Calling unauthenticated.) `/api/reason` uses a **separate** credential (an API key, recommended). So the harness setup phase provisions **two** test credentials:

1. a `sr_assent_<token>` write token bound to the test `agent_id`, scope `sage_assent_write` (used by Calling, Accreditation, Reflect);
2. an API key for `/api/reason` (recommended), or the `PLUGIN_AUTH_SECRET` if the plugin-auth path is preferred.

Both are minted against the **test** project only. The mechanics of minting are in `test-env-standup-checklist.md`.

## 4. The endpoint-threading map (the seams, as the orchestrator threads them)

This is the heart of Reading A: what the orchestrator takes from each response and hands to the next request. Each row maps to a seam in `03_seam_map/seam-map.md`.

| Step | From → To | What is threaded | Seam | Client-side action |
|---|---|---|---|---|
| **T1** | `/api/calling` (approved path) → `/api/reason` | The `DiscoveredPurpose`'s **five slots** (work; capacity; circle_and_obligation {circle, obligation}; first appropriate act; role) become the impression/context the harness submits to `/api/reason`. | **S1** | Read Calling's response body; assemble the `/api/reason` request from the five verbatim slots. Assert all five survive into what Layer 1 receives (no dropped slot). The **clarification branch** (incomplete specs) must return a developer clarification and **not** hand off. |
| **T2** | `/api/reason` → `/api/accreditation/[agent_id]` | The **signed assessment** `{ assessment, signature, key_id }` from `/api/reason` (returned when `SUBSTRATE_LAYER2_SIGNING_ENABLED='true'` — `parallel-run.ts` L785–812) is POSTed as `provenance: { signed_assessments: [ { assessment, signature, key_id } ] }`. | **S2** (write-boundary / R18f) | The **genuine→200 recipe** (`test-flag-config.md`). The gate's `validateWriteProvenance` (structural) + `verifyLayer2Signature` (cryptographic) accept exactly this shape. This is the L7 centrepiece. |
| **T2-bridge** | `/api/reason` signed assessment → `EvaluatedAction` | The same `SignedLayer2Assessment` is fed to **`sage-assent-bridge.ts`** (`deriveReceiptId(signature) = SHA-256(signature)`). | **S2** (bridge) | **A `tsx` step, not HTTP** (§5) — the bridge is a pure function no route calls. Threaded **client-side**, separate from the credential write. |
| **T3** | (after the act) → `/api/practice/reflect` | A Reflect session carrying **Q4 `KathekonAssessment[]`** (a review of the completed action). The in-process `sage-assent-feed.ts` updates `agent_accreditation` **via the engine** (grade moves on evidence + hysteresis, never hand-written); FK-seed fires for a new agent; SR-15 per-domain proximity written. | **S3** | Verify by **DB query** against the test project (before/after `agent_accreditation` + `evaluated_actions`); confirm the grade change matches the engine, not a hand-set value. |
| **T4** | `/api/practice/reflect` → next product entry | Reflect returns an **`exit_path`** (`'sage_reasoning'` \| `'sage_calling'`). The orchestrator **consumes** it: a "purpose holds" exit re-enters `/api/reason`; a "purpose complete / needs revision" exit re-enters `/api/calling`. | **S4** | Assert the `exit_path` is **actually acted on** — the agent lands in the next product's entry, not merely that the string is correct (the loop closes). |

**The loop, in one line:** mint credentials (setup) → `POST /api/calling` (approved path) → thread five-spec into `POST /api/reason` → take the signed assessment → `POST /api/accreditation/[agent_id]` with it as `provenance` (genuine→200) **and** run the bridge `tsx` step → act → `POST /api/practice/reflect` with Q4 records → consume `exit_path` → re-enter Reasoning or Calling. `GET /api/public-key` is used wherever a verification of the key the gate trusts is needed.

## 5. Where the harness drops to a `tsx` step (Seam 2 bridge)

`sage-assent-bridge.ts` maps `SignedLayer2Assessment → EvaluatedAction` with `receipt_id = SHA-256(signature)`. It is a **pure, synchronous function that no `/api` route imports** (`seam-map.md` Seam 2 — "imported by no `/api` route"). So it **cannot be exercised over HTTP**. The orchestrator covers it as a **`tsx` step**: `bridge-step.ts` imports the bridge directly, feeds it the *same* signed assessment that `/api/reason` returned, and asserts the resulting `EvaluatedAction` is well-formed with `receipt_id === SHA-256(signature)`.

**What this proves, and what it does not (M-6, deferred):** the genuine→200 **credential write** proves *possession of genuine substrate output* — the provenance gate verified a real signature. It does **not** exercise the bridge, and it does **not** prove **aggregate-faithfulness** (that the submitted aggregates faithfully reflect the examination — `99_review/missing-context.md` M-6). The bridge `tsx` step is a **separate** assertion about the pure mapping; it does not run as part of the credential write. The design keeps the two distinct so a green run is not over-read as proving more than it does.

## 6. Cross-cutting coverage (and what stays out of scope this build)

The orchestrator's primary job is the **four seams** (§4). The cross-cutting assertions in `test-brief.md` §C are layered on as follows:

- **C1 — shared-substrate consistency** (human vs agent path produce the same Layer-2/Layer-3 reasoning): the **`webapp-testing`** skill drives `sagereasoning.com`'s human flow for the same input the API harness submits; the two outputs are compared. (PR15: built on the installed skill, not bespoke.)
- **C2 — R20a distress perimeter across the loop:** **Critical-tier when built** — out of scope for this Standard design session and for the first single-loop proof. Mapped here, built under the Critical Change Protocol later. The harness will submit a distress-signal input at each entry and confirm the redirect/pass-through statement appears (Playwright screenshot for the human UI).
- **C3 — state + audit trail:** a DB query after a full loop confirms one coherent trail (`discovery_sessions` → `evaluated_actions` / `agent_accreditation` / `grade_history` / `credential_audit` → reflect store) in the **test** project.
- **C4 — credentials end-to-end (A10):** mint → write → check `credential_audit` → revoke → confirm a subsequent write fails. Exercised with the test `sr_assent_` token.
- **C5 — adversarial containment (R18d):** inject a spoof at one stage; confirm downstream state is unaffected. Per-product adversarial tests already exist in Calling + Reflect; this is the *cross-stage* assertion.

## 7. Build sequencing (PR1; 0g manual-first)

1. **Single-loop proof first (PR1).** Build + run **one** configuration end-to-end before generalising — recommend **L7 (Reasoning + Assent)** because it exercises the genuine→200 centrepiece (T2) and the bridge `tsx` step (T2-bridge). It must reach **Verified** (0a) before the rest of the matrix is built on the same pattern. Capture the result into `data-room/05_outputs/`.
2. **Then the remaining configurations** (L1–L6) + the two negatives (Combination 1 → 422/403; Combination 2 → disclaimer present), one at a time, reusing the proven pattern.
3. **Then the cross-cutting layers** (C1, C3, C4, C5), with **C2 (distress perimeter) deferred to a Critical-tier session**.

The single-loop proof is the **first 0h-criterion-4 value demonstration** (end-to-end value on one real use case for the agent-developer audience). The human-practitioner audience demonstration follows via the `webapp-testing` path (C1).

## 8. PR15 / PR16 notes

- **PR15 (bias toward existing Anthropic infrastructure):** the harness is **not** greenfield. It extends (a) the repo's existing plain-`tsx` assertion-test pattern and (b) the installed **`webapp-testing`** (Playwright) skill for the human UI. Claude Code sub-agents may orchestrate the scripted journey. No Anthropic-canonical primitive performs *this project's* four-seam HTTP threading against *this project's* test env, so the bespoke script is justified — but it is a thin script over existing tools, not a new framework.
- **PR16 (positioning + dogfood lens):** running an agent through the loop **is** the dogfooding mandate — the dependency gate (R18f) is validated by the same run that exercises it. **Positioning:** a green whole-system run **strengthens** the "Character Kernel" claim — it is the evidence that the integrity rule is enforced end-to-end, not merely written down. **Dogfood relevance:** high — the loop is substrate-consultable via `/api/reason` by construction.

## 9. Open questions / deferred

- **Orchestrator location** — recommended `website/scripts/whole-system-harness/` (§2); founder confirms at build time.
- **`/api/reason` auth choice** — API key (recommended) vs plugin-auth (lighter); decided at build time per whether loop metering is under test.
- **C2 distress perimeter** — Critical-tier; deferred to a Critical Change Protocol session.
- **Aggregate-faithfulness (M-6)** — not proven by the genuine→200 path; deferred (ADR revisit-condition 1).
- **Reading B** — rejected, not deferred (server-side seam-wiring; revisit only if a *product* requirement, not a test requirement, calls for it).

---

*End of design. The harness plays the agent over HTTP against a test environment; it threads the four seams as a real client would; it drops to a `tsx` step only for the Seam 2 bridge. Built later — single-loop proof (L7) first, per PR1.*
