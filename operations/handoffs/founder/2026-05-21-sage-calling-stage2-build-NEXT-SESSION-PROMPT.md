# Next-Session Prompt — Sage Calling: Build Stage 2 (Engine + Endpoint + Go-Live)

**Stream:** founder.
**Tier:** `code-critical` (Stage 2 of the staged Sage Calling build per D-9). This is the Critical half: it wires the rule-based engine, the public `POST /api/calling` endpoint, the A10 auth gate, the Hard Gate + global-flag kill switch, full-session persistence, and the R18d adversarial tests — and takes the product **Live**, gated by a global env flag.
**Governing frame:** `/adopted/standing-protocol-cache.md` (`code-critical` → **Full** template + Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context; the **"no current users"** note relaxes Critical Change Protocol step 3 only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-21-sage-calling-stage1-build-close.md`.
**Predecessor decision-log entries:** `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21` (Stage 1 — content + schema + Layer 1 extension, **Verified**: migration run, Vercel green); `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` (the locked design — this build implements it); `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the auth pre-condition, **Verified**).
**Operative deliverable (read in full):** `/adopted/purpose-discovery-product-design.md` (the locked design; D-1 … D-14).
**Risk classification:** **Critical** under 0d-ii. The **full Critical Change Protocol (0c-ii) APPLIES** and must be completed visibly in the conversation before the founder deploys or flips the global flag. AC7 **ENGAGED** (auth gate). PR6 **NOT** engaged (no R20a/distress surface — confirmed in the design). The deployment-configuration flag (`SAGE_CALLING_ENABLED`) is the Critical go-live control.

## Why this session matters

This is **Stage 2 of 2** — it makes Sage Calling real. Stage 1 landed the inert groundwork (the 24-variant content library, the `discovery_sessions` table, the additive Layer 1 `discovered_purpose` field). Stage 2 builds the rule-based variant-selection engine over that content, exposes the `POST /api/calling` endpoint behind the A10 credential gate, wires full-session persistence into `discovery_sessions`, enforces the D-14 Hard Gate (the handoff cannot fire on the agent's say-so) plus a coarse global kill switch, and proves the lot against the R18d adversarial suite. The public surface then goes Live — but **off by default**, gated by `SAGE_CALLING_ENABLED` exactly as the substrate write path was gated by `SUBSTRATE_WRITE_PATH_ENABLED`. Because this touches auth, a new public surface, R17 persistence of introspective content, and a deployment-config flag, every step runs under the Critical Change Protocol.

## Pre-conditions (confirm at open)

1. **Stage 1 Verified** — satisfied: `discovery_sessions` exists in Supabase (5 VERIFY blocks confirmed 2026-05-21); the Layer 1 `discovered_purpose` field is live and inert; Vercel green. Confirm `discovery_sessions` is still present (one VERIFY SELECT) before building against it.
2. **A10 Verified** — satisfied (`D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`): the `sr_atl_` per-agent credential primitive + its token-validation function are live. Confirm the validator function exists (Part A, Step 0) before wiring the gate.
3. **Founder at a machine** that can run Supabase SQL (only if a follow-on migration is needed — none expected; the table exists), commit/push via GitHub Desktop, and set a Vercel env var (`SAGE_CALLING_ENABLED`).
4. **Production state unchanged from the Stage 1 close:** A10 Live + Verified; substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Option D Live; no public Sage Calling surface yet.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, status vocabulary, and the **Critical-risk sessions** section (the full templates + the 6-step Critical Change Protocol).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the **"no current users"** note (Critical Change Protocol step 3 may be answered "N/A — only founder + test logins exist").
3. `/adopted/purpose-discovery-product-design.md` **in full** (~15–20 min). Closest attention to: D-2 (server-side session shape); D-4 (rule-based engine + the variant-selection discipline — legitimate epistemic-state triggers vs illegitimate preference-state triggers; the hardest-diagnostic-always-reachable constraint); D-6 (A10 auth reuse + the `purpose='discovery'` scope-check build note); D-7 (full persistence + retention/deletion); D-8 (per-stage Option D metering; no double-bill on resume/Hard-Gate pause); D-12 (return-to-innermost-circle after clarification; no loop to Q1; once-and-precisely); D-13 (`agent_card_url` only; decline `available_tools`; verify the card, never trust at face value); D-14 (Hard Gate before handoff + global flag); and the R18d engagement block.
4. `/operations/handoffs/founder/2026-05-21-sage-calling-stage1-build-close.md` (~5 min) — the Stage 1 close (what's built; the three open questions).
5. `/operations/decision-log.md` — the three predecessor entries named above (last entries; `D-SAGE-CALLING-STAGE1-…` is the tail).
6. The Stage 1 artefacts, in full: `website/src/lib/sage-calling/question-library.ts` (the content to build the engine over) and `website/supabase-discovery-sessions-migration.sql` (the live table shape the store writes to). Skim `website/src/lib/translation-sandwich/layer1-extractor.ts` §`DiscoveredPurpose*` (the handoff target).

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); **model selection** — the D-4 engine is **rule-based → no LLM → PR4 N/A** (cite the cache PR4 "Documentation/schema/registry → N/A" logic; the only network call is the optional `agent_card_url` fetch, which is HTTP, not an LLM call); status vocabulary; signals + risk class; **Critical Change Protocol ENGAGED**.

**PR5 knowledge-gap scan:** KG1 (Vercel five rules) ENGAGES — every `discovery_sessions` read/write awaited; no fire-and-forget; the endpoint must not self-call other routes (use direct imports). KG7 (JSONB) ENGAGES — `response_history` + `signals_detected` written as arrays/objects passed directly to the Supabase client (never `JSON.stringify`'d); verify with `jsonb_typeof(...) = 'array'` after the first write. Read both resolutions in `/operations/knowledge-gaps.md` before writing the store.

**PR15 consult:** before the bespoke engine build, check `.claude/skills/anthropic/` and `/operations/agentic-commerce-findings-downstream-order.md`. The engine is bespoke deterministic rule logic with no Anthropic-primitive substitute; record the consult and the bespoke justification in the decision-log entry under "Reasoning".

**Founder decisions to take at open (carried from the Stage 1 close — surface via AskUserQuestion):**
- **Retention window** — Stage 1 set 90 days as documented policy. Confirm or change before wiring the retention sweep + the R17h deletion endpoint.
- **`outcome` enum** — Stage 1 used `'found' | 'null_result'`. Confirm for R10 consistency across API/marketplace/docs.
- **Layer 1 `version`** — left unbumped in Stage 1. Confirm, or bump (heavier; touches the open-source Layer 1 contract / Rule A licensing gate).
- **D-6 scope check** — whether the `sr_atl_` credential needs an explicit `purpose='discovery'` scope, or whether reusing the write credential as-is is acceptable for Stage 2.
- **D-12 clarification timeout** value + the "new context arrives" detection mechanism (build-time details deferred to this stage).

## Part B — Procedure

Apply **PR1 single-endpoint proof** (this IS the single endpoint — prove the engine deterministically before wiring persistence + the gate) and **PR2 build-to-wire** (verify each function is actually invoked in the execution path, in-session — grep for calls, not definitions).

### Step 0 — Locate the seams (no code yet)
Grep and confirm, reporting each before building: (a) the A10 token-validation function + the `sr_atl_` primitive (per D-6; the design names `validateAtlWriteToken`); (b) the Option D metering entry point (per D-8 — where a loop is recorded in `loop_billing_events`; how `loop_id`/`session_id` propagate for AC10); (c) the `discovered_purpose` shape on `Layer1Schema` (the handoff target); (d) the App Router convention for a new route (`website/src/app/api/.../route.ts`) and how existing routes read the `sr_atl_` bearer token.

### Step 1 — The rule-based variant-selection engine (D-4) — prove it first (PR1)
New module (e.g. `website/src/lib/sage-calling/engine.ts`). Given a stage + the prior response history, deterministically select one variant from `QUESTION_VARIANTS`. **Discipline (binding, per the design):** read only **epistemic state** (completeness gaps, over/under-claiming, skipped tests, premature closure, extended avoidance) — never **preference state** (tone, apparent direction). Every selection must trace to a **named rule** (this is the auditable R0 value and feeds `signals_detected`). Ensure each stage's hardest-diagnostic variant is always reachable. No randomness, no sentiment analysis, no LLM. Unit-test the engine exhaustively (deterministic input history → expected variant + named rule) **before** wiring anything else.

### Step 2 — The `discovery_sessions` store (D-7) — KG1 + KG7
New module (e.g. `website/src/lib/sage-calling/session-store.ts`). Create/read/advance a session row; append to `response_history` + `signals_detected` (JSONB arrays, written directly — KG7); set `current_stage`, `gate_status`, `outcome`, `completed_at`. R17i minimisation: persist only variant selections, agent responses, outcome. Provide the R17h **genuine-deletion** path (hard DELETE by `session_id` and by `agent_id`) and the retention-sweep query (per the confirmed window). All reads/writes awaited (KG1). Round-trip test (founder smoke-tests the live Supabase round-trip post-deploy).

### Step 3 — `POST /api/calling` (D-2, D-6, D-8, D-14)
New route. Server-side session keyed by agent-supplied `session_id`. **A10 auth gate (D-6, AC7):** reuse the `sr_atl_` validator; reject missing/invalid/wrong-agent tokens with `401` (mirror the A10 failure-mode behaviour). **Global flag (D-14):** if `SAGE_CALLING_ENABLED !== 'true'`, the whole endpoint returns `503` (the `SUBSTRATE_WRITE_PATH_ENABLED` analogue). **Per-stage metering (D-8):** each stage call = one Option D loop; propagate `loop_id`/`session_id` (AC10); a resumed stage that does no new compute is **not** re-billed. **R3 + R18e:** every response carries the one-framework (Stoic) disclaimer and identifies the interaction as a Stoic-grounded purpose-discovery sequence.

### Step 4 — The Hard Gate + handoff (D-14, D-5)
At the end of Q5, set `gate_status='awaiting_approval'` and **pause** — the five-specification handoff into `discovered_purpose` on the Layer 1 input **MUST NOT fire** until an explicit external developer approval flips `gate_status='approved'`. The handoff must be gateable independently of the agent's own logic. Wire the five-spec → `discovered_purpose` mapping (D-5) only on the approved path.

### Step 5 — Null-result + clarification protocol (D-12)
On a genuine null (Q6 exhausted), emit one of the four `CLARIFICATION_TEMPLATES` (report → location → request). Then **return to innermost-circle attention (Q6 Variant A)** until the developer responds, a timeout fires (confirmed value), or new context arrives. **Do NOT loop back to Q1**; do NOT repeat the clarifying request (once-and-precisely). The no-loop constraint is non-negotiable.

### Step 6 — Optional `agent_card_url` (D-13) + R18d adversarial suite
Accept an optional `agent_card_url`; **decline** `available_tools`. If a card URL is supplied, **fetch and verify the card against its URL**; it informs the engine's signal detection (e.g. the chosen-role persona) but never substitutes for the agent's own response and is never accepted at face value as evidence of capacity. **R18d adversarial tests (PRIMARY):** (a) agents whose responses try to steer the engine toward validation (Q2-B / Q3-B targets); (b) instructions/context carrying covert framing or biased priors the discipline must resist; (c) **poisoned/spoofed Agent Cards** via `agent_card_url`. If the suite shows the rules miss subtle semantic signals, that is the D-4 PR7 trigger — escalate to the rules+LLM hybrid (PR4 + KG2 + a `constraints.ts` model row engage); otherwise record that the rules held.

### Step 7 — Verify (in-session, before the Critical deploy)
`tsc --noEmit` clean project-wide; the engine unit tests, the store tests, the endpoint tests, and the R18d suite green; existing substrate/translation-sandwich + Stage 1 tests still green. Run tests from `website/` (for `@/` alias resolution); the two Supabase-importing substrate tests need `npx tsx --env-file=.env.local`. Confirm via grep (PR2) that the auth gate, the global-flag check, the Hard Gate, and the metering call are all actually invoked in the request path — not merely defined.

### Step 8 — Critical Change Protocol (0c-ii) — complete visibly BEFORE the founder deploys
State all six, specific to the named risks:
1. **What is changing** — plain language: a new authenticated public endpoint goes live, off by default behind `SAGE_CALLING_ENABLED`.
2. **What could break** — the specific worst cases: an auth-gate flaw exposing the endpoint without a valid `sr_atl_` token; a Hard-Gate flaw letting the handoff fire un-approved; a metering flaw double-billing; a KG7 double-serialisation making `response_history` unreadable.
3. **What happens to existing sessions** — **N/A** per the "no current users" note (only founder + test logins; no third-party sessions to invalidate). State this explicitly.
4. **Rollback plan** — founder-runnable: set `SAGE_CALLING_ENABLED` UNSET/`'false'` (endpoint → 503 instantly, no redeploy needed); pre-push `git reset --hard`; post-push `git revert` + push → Vercel rebuilds to the pre-Stage-2 shape; `discovery_sessions` rows can be hard-deleted (R17h). Provide the exact commands.
5. **Verification step** — after deploy + flag flip: mint/reuse a test `sr_atl_` credential; POST a stage call → expect a question; walk Q1→Q5; confirm the Hard Gate pauses before handoff; confirm `gate_status` transitions; confirm a `discovery_sessions` row with `jsonb_typeof(response_history)='array'`; confirm failure modes (no token / bad token / wrong-agent → 401; flag off → 503).
6. **Explicit approval** — the founder says "OK / go ahead" against these named risks before the flag is flipped.

### Step 9 — Decision-log entry (full Critical form) + session close (full Critical form)
Entry: `D-SAGE-CALLING-STAGE2-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Include the full Critical sections: Verification Method Used (0c), Risk Classification Record (0d-ii), PR5 Knowledge-Gap Carry-Forward, Rollback path, Verification step. Status: implementation **Wired** (code + tests Verified in-session) → **Verified / Live** once the founder deploys, flips `SAGE_CALLING_ENABLED='true'`, and runs the post-deploy smoke tests. The close names the next track (the founder elects: K-category migration; Stage 1-close lawyer engagement; smaller follow-ons) and carries the resolved/remaining open questions.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + locked design + Stage 1 artefacts + opening decisions | 30–45 min |
| Step 0 — locate the seams | 15–20 min |
| Step 1 — rule-based engine (prove first, PR1) + unit tests | 60–80 min |
| Step 2 — `discovery_sessions` store (KG1/KG7) + tests | 30–45 min |
| Step 3 — `POST /api/calling` (auth gate, global flag, metering) | 45–60 min |
| Step 4 — Hard Gate + handoff (D-14/D-5) | 30–40 min |
| Step 5 — null-result + clarification (D-12) | 20–30 min |
| Step 6 — `agent_card_url` (D-13) + R18d adversarial suite | 45–60 min |
| Step 7 — verify | 20–30 min |
| Step 8 — Critical Change Protocol (visible) | 15–20 min |
| Step 9 — decision-log + close (full Critical form) | 30–40 min |
| **Total** | **~4.5–6 hr** (a long Critical sitting — the founder may split it; if so, a clean pause is after Step 2, with the engine + store Verified and nothing wired to a public surface) |

## Rollback path

Layered. **Fastest:** set `SAGE_CALLING_ENABLED` UNSET or `'false'` in Vercel → the endpoint returns `503` immediately, no redeploy, no behaviour change anywhere else. **Pre-push:** `git reset --hard`. **Post-push:** `git revert` the commit + push via GitHub Desktop → Vercel rebuilds to the pre-Stage-2 shape (endpoint 404/absent). `discovery_sessions` rows are removable via the R17h hard-delete path. The Stage 1 Layer 1 field + table remain (inert) on rollback — Stage 2 is purely additive on top of them. Nothing touches A10, the substrate write path, Option D's existing surface, the pass-through fields, or Stripe.

## Forecast

Stage 2 complete = Sage Calling is **Live but gated** — a rule-based, fully auditable, A10-authenticated purpose-discovery endpoint that persists every session, gates the handoff behind a Hard Gate + global kill switch, and has passed the R18d adversarial suite. The product the design locked on 2026-05-21 is then real and operational, off by default until the founder flips the flag. After Stage 2, the post-arc tracks remain (K-category migration; the Stage 1-close lawyer engagement on the substrate-plugin staging plan; the smaller PR7 follow-ons) — the founder elects order.

---

*End of prompt. Paste into a fresh session; the session begins under Part A. This is Stage 2 of the staged Sage Calling build (D-9); it is Critical, the full Critical Change Protocol applies, and the public surface goes Live gated by `SAGE_CALLING_ENABLED`.*
