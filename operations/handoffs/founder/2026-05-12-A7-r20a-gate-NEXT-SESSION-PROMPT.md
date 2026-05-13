# Next-Session Prompt — A7: Server-Side R20a Gate (Scaffolding)

**Stream:** founder.
**Tier:** code-critical (per `/adopted/standing-protocol-cache.md` §"Work categories"). A7 is **Critical-risk** under PR6 + AC5 + AC7. A7 is the **second-layer R20a defence** (per the three-layer architecture in `/adopted/build-sessions-protocol-cache.md`): in-plugin script → server-side gate (A7) → Layer 3 deterministic injection (A5.4). The full templates apply; the lean form does not. **Critical Change Protocol (0c-ii) engages at deployment time** — see Part B Step 5.

**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` + the amended staging plan + the amended manifest + the project-instructions snapshot.

**Predecessor session close:** `/operations/handoffs/founder/2026-05-12-A5-layer3-service-close.md` (A5 Layer 3 substrate service reaches Scaffolded + Wired + Verified on `/api/reason` PR1 single-endpoint proof).

**Predecessor decision-log entries:** `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12` (the most recent substrate-build entry); `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10`; `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`; `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`.

**Risk classification:** **Critical** under 0d-ii. AC5 + AC7 + PR6 all engage (R20a perimeter; auth surface for plugin-originated calls into the Layer 2 API; safety-critical distress classifier path). **Critical Change Protocol applies** — see §"Critical Change Protocol pointer" below. The session-as-a-whole is Critical.

## Why this session matters

A7 is the second-layer R20a defence — it guards the Layer 2 API regardless of plugin behaviour. The three-layer R20a architecture is: (1) in-plugin script in the open-source Layer 1 plugin (fast, local distress detection — Stage 3 work); (2) **A7 server-side gate** guarding Layer 2 API (this session — compliance enforcement at the server boundary); (3) A5.4 deterministic injection at Layer 3 (already scaffolded; activates when A7 attaches `distress_signal` to `Layer2Assessment`).

A7 closes a specific gap: today, the R20a perimeter is enforced at the **route level** in `/api/reason/route.ts` (line ~173) before `runSandwich` is called. Human-facing traffic is protected. But plugin-originated traffic that submits a pre-extracted Layer 1 schema bypasses the route-level perimeter — it goes through the substrate's plugin-auth path with `preExtractedLayer1Schema` and never sees `detectDistressTwoStage`. **A7 closes this gap by running the distress classifier at the substrate's server-side boundary, before Layer 2 mechanisms run, regardless of how the request entered.**

A7 also produces the **`distress_signal` field on Layer2Assessment** that A5.4 reads. Until A7 wires, A5.4 is structurally complete but functionally inert. When A7 reaches Verified, A5.4 activates as the third-layer defence.

This session is **A7 scaffolding** — the gate module, the call site in `parallel-run.ts`, the `distress_signal` attachment to `Layer2Assessment`, the feature flag, and the verification harness. A7-Verified depends on a single-endpoint proof on `/api/reason` (per PR1), just as A5 did.

## Pre-conditions

1. **A5 commit pushed.** Confirm `git log --oneline -1 origin/main` shows the A5 scaffolding commit. The A5 work must be on origin/main before A7 begins (A7 attaches `distress_signal` to a Layer2Assessment that A5 reads — out-of-order commits break the chain).
2. **A5 verification clean between sessions.** Founder confirms at session-open that the four verification checks from the A5 close passed:
   - `npx tsc --noEmit -p tsconfig.json` (clean)
   - `npx tsx src/lib/substrate/__tests__/layer3-service.test.ts` (28 pass / 0 fail)
   - 12-occurrence invocation grep
   - Production state probes (`/api/public-key` PASS; `/api/substrate/layer3` 503)
3. **A5 status: Verified.** No regression since A5 session.
4. **A1, A2, A3, A4 still Verified.** No regression since A4 session.
5. **Founder commits to a 3-4 hour bounded session** — Critical-tier session.
6. **Project-instructions snapshot paste-sync state confirmed.** If the operative Cowork-panel content still shows the pre-A5 (or pre-ST2) project instructions, the AI should note that PR10-PR16 are only authoritative via the repo snapshot for this session.
7. **Production state unchanged from A5 close.** `SUBSTRATE_LAYER3_ENABLED` env var UNSET in Vercel; `/api/reason` byte-identical to pre-A5; `/api/substrate/layer3` returns 503.

## Critical Change Protocol pointer (for §Part B Step 5)

Per project instructions 0c-ii (and PR6 — safety-critical changes always Critical risk), before the founder deploys A7 the AI completes inline:

1. **What is changing** — plain language; A7's role from the founder's perspective.
2. **What could break** — specific worst-case failure modes (e.g., "A7 fails open — a Layer1Schema carrying distress signals reaches Layer 2 mechanisms without redirection").
3. **What happens to existing sessions** — per build-arc no-current-users governing note: N/A. The AI states this explicitly.
4. **Rollback plan** — exact `git revert` command + env-var rollback steps (`SUBSTRATE_R20A_GATE_ENABLED=false`).
5. **Verification step** — what the founder runs (URL + expected output, or `curl` + `python3` snippet); what to do if the result is different.
6. **Explicit founder approval** specific to the named risks.

Do not abbreviate this protocol. The full close note for this session will include Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), and Orchestration Reminder per the standing cache's §"Critical-risk sessions" guidance.

## Part A — Open under the protocol

Read in order (full canonical-source reads required for code-critical category per standing cache Element 2):

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — tier; model selection (Haiku for the distress classifier per AC1 row + KG2); KG register; signals (incl. diagnostic-certainty); risk classification.
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — build-arc context; three-layer R20a architecture; no-current-users note.
3. **`/operations/handoffs/founder/2026-05-12-A5-layer3-service-close.md`** (~5 min) — predecessor close; confirms A5 reaches Verified; lists A5.4's defensive read of `assessment.distress_signal` which A7 will populate.
4. **`/adopted/substrate-plugin-staging-plan.md`** §Stage 1 — A7 (~5 min) — the operative item description; A7's risk + dependencies + estimated sessions.
5. **`/manifest.md`** — read these sections in full:
   - **R20a** (incl. the perimeter potential-broadening placeholder added under ST2) — Active protection; the rule A7 enforces
   - **AC2** — Safety system latency budget (the ~500ms regex → Haiku cost is accepted and non-negotiable; A7 inherits this budget)
   - **AC4** — Invocation testing for safety functions (A7 + its distress-classifier wrapper require both functional + invocation tests)
   - **AC5** — R20a enforcement perimeter (A7 expands the perimeter to a server-side surface; the perimeter potentially broadens at A10 per the ST2 placeholder; this session reviews whether A7 itself constitutes a perimeter addition)
   - **AC7** — Session 7b standing constraint (A7 introduces a new auth-surface posture for plugin-originated calls; named explicitly)
   - **AC1** — Model selection (Haiku for safety-critical distress classification per the row + KG2; cite the row)
   - **AC8** — Translation-sandwich architectural constraint (A7 sits in `/lib/substrate/` alongside A5; new module; preserves the architecture)
6. **`/website/src/lib/r20a-classifier.ts`** (~5 min) — the existing two-stage distress classifier (`detectDistressTwoStage`); A7 reuses it; do NOT re-implement.
7. **`/website/src/lib/constraints.ts`** (~3 min) — the SafetyGate token pattern; A7 produces SafetyGate-equivalent shapes; consider whether A7 should produce an actual SafetyGate via `enforceDistressCheck` for type-level compile guarantees.
8. **`/website/src/lib/substrate/layer3-service.ts`** (~5 min) — A5's expectations for the `distress_signal` field; A7 must populate this field on `Layer2Assessment` when a sub-threshold signal is detected (or when A7 is bypassed but the assessment passes through).
9. **`/website/src/lib/translation-sandwich/parallel-run.ts`** (~10 min) — the orchestrator A7 wires into; specifically `runSandwichInner` and the existing path Layer 1 → Layer 2 → Layer 3. A7 sits BEFORE `applyMechanisms` (so distress redirection short-circuits before Layer 2 work).
10. **`/website/src/lib/translation-sandwich/layer2-mechanisms.ts`** (skim the `Layer2Assessment` interface ~5 min) — A7 must extend the type to optionally carry `distress_signal: boolean`; defensive default false; readable by A5.4.
11. **`/website/src/app/api/reason/route.ts`** (skim the existing route-level R20a perimeter at line ~173 ~5 min) — A7 must NOT duplicate the route-level perimeter check for human-facing traffic; the route-level check stays. A7 covers the plugin-originated path that bypasses the route-level perimeter (the `preExtractedLayer1Schema` path).
12. **`/operations/decision-log.md`** — read the last 2 entries (`D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`; `D-CACHE-DRIFT-RESOLVED-2026-05-12`) for the most recent substrate-build context.

**Confirm at session open** (state explicitly, briefly):

- Tier: code-critical / Critical-risk
- Hold-point status: P0 0h active
- Model selection: Haiku (FastModel) per AC1 row for "Safety-critical (R20a distress classifier)"; type-enforced via `constraints.ts` `SafetyCriticalCallParams`
- Status vocabulary: implementation `Scoped → ... → Live`; decision `Adopted / Under review / Superseded`
- Signals + risk classification: diagnostic-certainty signalling (per PR10); risk Critical
- **PR10 PEV loop applies** — Plan (Critical Change Protocol inline); Execute (PR1 single-endpoint-proof + PR2 build-to-wire-immediate); Verify (diagnostic-certainty signalling)
- **PR11-PR15 standing requirements engaged**
- **PR16 positioning + dogfood lens** at each design decision

## Part B — Procedure

### Step 1 — Plan (Critical Change Protocol inline)

Complete CCP 0c-ii steps 1-5 in the conversation before writing any code. Cover specifically:

- What surfaces A7 protects (plugin-originated `preExtractedLayer1Schema` path; the route-level perimeter remains unchanged for human-facing traffic)
- Whether A7 constitutes a ninth route addition to the AC5 perimeter (it might not — A7 operates inside `runSandwich`, not as a separate route — but the analysis is required per AC5)
- The fail-closed posture: if the distress classifier throws, A7 must fail closed (treat as distress detected; return the redirect) — never fail open
- The latency budget: A7 inherits AC2's ~500ms regex → Haiku budget; A7 itself adds no further latency
- Whether the existing `/api/reason` route-level perimeter call should be preserved alongside A7 (defence in depth) or removed (single source of truth). **Recommendation:** preserve (defence in depth; A5.4 then becomes the third-layer truth-of-record, A7 the second, route-level perimeter the first).

PR15 check: confirm bespoke A7 is appropriate. The existing `detectDistressTwoStage` classifier in `/website/src/lib/r20a-classifier.ts` is the right primitive to reuse; bespoke A7 wraps it at the substrate boundary. Log in the decision-log entry.

### Step 2 — Scaffold A7

Recommend a new module: `/website/src/lib/substrate/r20a-gate.ts`.

Components to scaffold (analogous to A5's components):

- **A7.1** — Gate service stub: accepts the Layer 1 user-input string (`text` field of `Layer1Schema`) + optional context; returns `R20aGateResult` with `decision: 'PASS' | 'REDIRECT'` + `distress_signal: boolean` (for sub-threshold signals) + optional `redirect_message` (the user-facing pass-through).
- **A7.2** — `enforceLayer2R20aGate(layer1Schema)` async function: calls `detectDistressTwoStage` from the existing classifier; produces the gate result; **fail-closed on classifier throw**.
- **A7.3** — `attachDistressSignalToAssessment(assessment, gateResult)`: when gate returns PASS but a sub-threshold signal is present, attach `distress_signal: true` to `Layer2Assessment` so A5.4 reads it.
- **A7.4** — `R20aGateBypassed` error type + handling: when the flag is unset, A7 returns a sentinel "bypassed" result so the orchestrator falls through to existing logic unchanged.
- **A7.5** — Feature flag `SUBSTRATE_R20A_GATE_ENABLED` reader; defaults OFF.
- **A7.6** — OpenTelemetry GenAI span emission stub (per AC11; A12 wires receiver).
- **A7.7** — Extend `Layer2Assessment` interface in `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` with optional `distress_signal?: boolean` field. Defensive default false.

### Step 3 — Single-endpoint proof (PR1)

`/api/reason` is the proof endpoint. Wire A7 into `parallel-run.ts` `runSandwichInner` BEFORE the existing `applyMechanisms` call. Behind the `SUBSTRATE_R20A_GATE_ENABLED` flag (default OFF) so production behaviour is byte-identical when flag unset.

**Important sequencing decision (surface to founder at session-open):** should A7 run BEFORE or AFTER Layer 1 extraction?
- **Option (a)** — A7 runs after Layer 1 (consumes `layer1Schema.text` or the post-extraction structured form). Cleaner — A7 sees what Layer 2 sees.
- **Option (b)** — A7 runs before Layer 1 (on the raw input string). Catches distress earlier; saves Layer 1 cost on redirected requests. But requires plumbing the raw input string into `runSandwichInner` separately from `preExtractedLayer1Schema`.

**Recommendation:** Option (a). Layer 1 is cheap (Haiku); the cleanliness of "A7 sees Layer 2's input" is more valuable than the marginal cost saving.

### Step 4 — Build-to-wire verification (PR2)

When A7 is wired and the flag flipped ON in dev/staging, verification happens in the same session per PR2. Grep confirms each safety-critical injection function is called in the execution path.

### Step 5 — Critical Change Protocol completion (founder-approval gate)

Before founder deploys: re-state CCP steps 1-6 with concrete answers from Steps 1-4. Founder approval specific to the named risks. Founder may signal "Treat this as critical" or "I'm done for now".

### Step 6 — Verify

Per AC4 invocation testing:

- **Functional tests** — `enforceLayer2R20aGate` produces PASS / REDIRECT correctly given known input shapes (clean text → PASS; distress text → REDIRECT; classifier throw → REDIRECT fail-closed).
- **Invocation tests** — grep confirms `enforceLayer2R20aGate` is called in `parallel-run.ts` BEFORE `applyMechanisms`:
  ```bash
  grep -n "enforceLayer2R20aGate\|isSubstrateR20aGateEnabled" website/src/lib/translation-sandwich/parallel-run.ts
  ```
  Expected: each function name appears at both import + call site. Zero appearances = FAIL.

Per AC2 latency budget — verify A7 adds no further latency beyond AC2's ~500ms budget (functional test asserts execution time under threshold for borderline inputs).

Per the A5.4 activation contract — verify that when A7 returns PASS with `distress_signal: true`, the resulting `Layer2Assessment` carries the field AND A5.4 reads it (end-to-end test of the second + third layer defence interlock).

### Step 7 — Append decision-log entry (full form for Critical)

Entry ID: `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-YYYY-MM-DD`. Full template per the standing cache §"Critical-risk sessions". Include all sections (Decision, Reasoning, Files touched, Risk classification, Rollback path, Verification step, Verification Method Used, PR5 Knowledge-Gap Carry-Forward, Open questions, Rules served, Status, Cross-references).

### Step 8 — Session close (full form for Critical)

Path: `/operations/handoffs/founder/YYYY-MM-DD-A7-r20a-gate-close.md`. Full template. Include: Decisions Made; Status Changes (A7 Scoped → Scaffolded → Verified; `Layer2Assessment.distress_signal` field added; A5.4 status note — defensive read now meets a real producer); Next Session Should (A6 prose_mode templates OR A10 per-agent credentials kickoff per founder election); Blocked On; Open Questions; Verification Method Used; Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; Founder Verification (Between Sessions); Orchestration Reminder; Cross-references.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + manifest + ADR reads (Part A) | 30-40 min |
| Decision-log + classifier + parallel-run.ts review (Part A continued) | 15-20 min |
| Session-open confirmation + PR1/PR2/PR15 checks stated | 5 min |
| Step 1 — Plan (Critical Change Protocol inline) | 15-20 min |
| Step 2 — Scaffold A7.1-A7.7 | 45-60 min |
| Step 3 — Single-endpoint proof on `/api/reason` | 20-30 min |
| Step 4 — Build-to-wire verification | 15-20 min |
| Step 5 — Critical Change Protocol completion + founder approval | 10-15 min |
| Step 6 — Verify (functional + invocation + AC2 latency + A5.4 interlock) | 20-30 min |
| Step 7 — Decision-log entry (full form) | 20-25 min |
| Step 8 — Session close (full form) | 20-25 min |
| **Total** | **~3.5-4.5 hours** |

**Alternative session shape (split):** If founder elects a shorter session (2-3 hours), split as for A5:
- **A7-Scaffold session:** Part A + Steps 1-2 + 4. A7 reaches Scaffolded but not Verified.
- **A7-Verify session (next):** Steps 3 + 5 + 6 + 7 + 8. A7 reaches Verified.

Founder elects at session-open.

## Rollback path

This session's work is a `Scoped` → `Scaffolded` (or `Verified`) status change for A7 + a new gate module + extension of the `Layer2Assessment` type + a feature flag wire-in. Rollback steps:

1. **Code rollback:** `git revert <session-commit>` to remove A7 scaffolding from the codebase. The `Layer2Assessment` interface extension reverts; A5.4's defensive read continues to function (no breakage because the field is optional).
2. **Feature flag rollback:** if `SUBSTRATE_R20A_GATE_ENABLED` was set to ON in any environment, set back to OFF (or unset) before pushing the revert.
3. **No env-var changes** beyond the feature flag.
4. **No auth surface changes on existing routes** — A7 wires into `parallel-run.ts`, not into route auth. The new `/api/substrate/layer3` endpoint (from A5) remains 503 because `SUBSTRATE_LAYER3_ENABLED` continues to be unset.
5. **No schema changes** — A7 doesn't write to Supabase.

## Forecast

Successful A7 scaffolding produces:

- `/website/src/lib/substrate/r20a-gate.ts` (or equivalent) exists with A7.1-A7.7 components
- `parallel-run.ts` calls A7 before `applyMechanisms` behind feature flag in dev/staging
- `Layer2Assessment` extended with optional `distress_signal: boolean`
- A5.4 receives a real producer for `distress_signal` (defensive read now meets reality)
- All AC4 invocation tests pass; functional tests pass; latency budget met
- Substrate production state at session close: A7 in dev/staging behind flag; production unchanged unless founder explicitly elects to flip the flag in production after Critical Change Protocol completion

**Next session after A7 Verified:** A6 (prose_mode per-mode templates — Standard-risk; ~2-3 hours) OR A10 (per-agent credentials kickoff — Critical-risk; ~3-4 hours; requires token-format ADR drafted in the same session per ST2 open question). Founder elects.

**Stage 1 status after A7 Verified:** existing critical chain A1→A2→A3→A4→A5→A7 complete; A10-A19 Stage 1 expansion items remain Scoped. R20a three-layer defence operationally active (Layers 2 + 3 wired; Layer 1 in-plugin script is Stage 3 work). Substrate ready for K-category migration prep (Stage 2 still gated on A10 per-agent credentials).

End of prompt.
