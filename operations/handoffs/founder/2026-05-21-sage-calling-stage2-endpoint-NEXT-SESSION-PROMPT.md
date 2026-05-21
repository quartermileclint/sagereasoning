# Next-Session Prompt — Sage Calling: Stage 2 Public Surface (Endpoint + Auth Gate + Hard Gate + R18d + Go-Live)

**Stream:** founder.
**Tier:** `code-critical`. This is the **Critical half** of Stage 2 (D-9), split off after the engine + store landed Verified. It wires the public `POST /api/calling` endpoint, the A10 auth gate, the per-stage Option D metering, the Hard Gate enforcement + the `discovered_purpose` handoff, the D-12 clarification re-entry, the optional `agent_card_url` (D-13), and the R18d adversarial suite — then takes the product **Live, gated by `SAGE_CALLING_ENABLED`**.
**Governing frame:** `/adopted/standing-protocol-cache.md` (`code-critical` → **Full** template + Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc; the **"no current users"** note relaxes Critical Change Protocol step 3 only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-engine-store-close.md`.
**Predecessor decision-log entries:** `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21` (engine + store, **Verified**); `D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21` (content + schema, **Verified**); `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` (the locked design); `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (auth pre-condition, **Verified**).
**Operative deliverable (read in full):** `/adopted/purpose-discovery-product-design.md` (D-2, D-5, D-6, D-8, D-12, D-13, D-14 + the R18d block).
**Risk classification:** **Critical** under 0d-ii. The **full Critical Change Protocol (0c-ii) APPLIES** and must be completed visibly before the founder deploys or flips the global flag. AC7 **ENGAGED** (auth gate). PR6 **NOT** engaged (no R20a/distress surface). `SAGE_CALLING_ENABLED` is the Critical go-live control.

## Why this session matters
The engine and store are built and Verified; this session makes them reachable. It exposes the deterministic engine over an authenticated public endpoint, persists each turn through the store, enforces the D-14 Hard Gate (the five-spec handoff into Layer 1 `discovered_purpose` **cannot fire on the agent's say-so** — only an explicit external approval flips `gate_status='approved'`), proves the lot against the R18d adversarial suite, and goes Live **off by default** behind `SAGE_CALLING_ENABLED` (the `SUBSTRATE_WRITE_PATH_ENABLED` analogue). Because it touches auth, a new public surface, R17 persistence, and a deployment-config flag, every step runs under the Critical Change Protocol.

## Pre-conditions (confirm at open)
1. **Engine + store Verified** — satisfied this session: `engine.ts` (41/0) + `session-store.ts` (30/0) + `tsc` clean. Re-run the two tests at open to confirm still-green.
2. **A10 Verified** — satisfied. Confirm `validateAtlWriteToken` still present in `website/src/lib/security.ts` (signature `validateAtlWriteToken(rawToken, agent_id, carriedProfile?)`, prefix `sr_atl_`, purpose `atl_write`).
3. **`discovery_sessions` present** — run one VERIFY `SELECT` before building against it (the table is from Stage 1).
4. **Founder at a machine** that can commit/push via GitHub Desktop and set a Vercel env var (`SAGE_CALLING_ENABLED`). No new migration is expected.
5. **Production unchanged from the engine-store close:** A10 Live + Verified; substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Option D Live; no public Sage Calling surface; the two new modules imported nowhere.

## What already exists to wire against (built this session)
**`website/src/lib/sage-calling/engine.ts`:**
- `nextStep(history: ResponseRecord[]): EngineOutput` — pure, deterministic. `EngineOutput` is `{ kind:'question', stage, variant, rule, text, advanced, signals }` | `{ kind:'hard_gate', rule, signals }` | `{ kind:'null_result', clarificationVariant, text, rule, signals }`.
- `detectSignals`, `getVariantText`, `getClarificationText` exported.
- Types: `ResponseRecord { stage, variant, response }`, `EpistemicSignal`.

**`website/src/lib/sage-calling/session-store.ts`:**
- I/O: `getSession`, `createSession`, `persistTurn`, `setGateStatus`, `deleteSession`, `deleteAgentSessions`, `sweepExpiredSessions` (all return `StoreResult<T>` = `{ok:true,value}|{ok:false,error}`).
- Pure helpers: `initialSessionInsert`, `appendResponse`, `appendAudit`, `toSelectionAudit`, `deriveTerminal`, `computeRetentionCutoffIso`, `RETENTION_WINDOW_DAYS` (90).
- Types: `DiscoverySessionRow`, `SelectionAudit`, `GateStatus`, `Outcome`.

**The endpoint↔engine contract (important — no `current_variant` column needed):** the engine is deterministic, so the variant the agent is *currently answering* is recomputed as `nextStep(session.response_history)` (the question last surfaced). The endpoint therefore: load/create session → if a response is supplied, `surfaced = nextStep(prevHistory)` (must be a `question`) → append `{surfaced.stage, surfaced.variant, response}` to history → `decision = nextStep(newHistory)` → `appendAudit(signals, toSelectionAudit(decision))` → `deriveTerminal(decision)` for gate/outcome/completed → `persistTurn(...)` with the full new arrays → return `decision` (question text / hard_gate / clarification text). First call (no response): `createSession` + return `nextStep([])` (Q1/A).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, status vocabulary, the **Critical-risk sessions** section (the 6-step Critical Change Protocol).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — the **"no current users"** note (Critical Change Protocol step 3 may be answered "N/A — only founder + test logins exist").
3. `/adopted/purpose-discovery-product-design.md` **in full** — closest attention to D-2, D-5, D-6, D-8, D-12, D-13, D-14, and the R18d block.
4. `/operations/handoffs/founder/2026-05-21-sage-calling-stage2-engine-store-close.md` (the predecessor close — what's built; the carried decisions/questions).
5. `/operations/decision-log.md` — the four predecessor entries named above.
6. The engine + store + their tests, in full (`website/src/lib/sage-calling/*.ts` + `__tests__`), and the existing `sr_atl_`-gated route to mirror conventions: `website/src/app/api/accreditation/[agent_id]/route.ts` (+ `request-helpers.ts`, `response-builders.ts`) — auth gate + the `SUBSTRATE_WRITE_PATH_ENABLED` kill-switch pattern; and `website/src/lib/loop-cost-tracker.ts` (metering: `createLoopAccumulator`, `extractLoopId`/`generateLoopId`, `finalizeLoopResponse`, `(api_key_id, loop_id)` uniqueness → no double-bill on resume).

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); **model selection** — engine is rule-based → **no LLM → PR4 N/A** (only network call is the optional `agent_card_url` HTTPS fetch, not an LLM call); status vocabulary; signals + risk class; **Critical Change Protocol ENGAGED**.

**PR5 knowledge-gap scan:** KG1 (await all DB I/O; no fire-and-forget; the endpoint must not self-call other routes — use direct imports) and KG7 (the store already writes JSONB arrays directly; verify with `jsonb_typeof(...)='array'` after the first live write). Both already enforced in the store; re-read the resolutions in `/operations/knowledge-gaps.md` before wiring.

**PR15 consult:** before wiring, check `.claude/skills/anthropic/` (`claude-api` engages only if the PR7 LLM hybrid is later adopted; `mcp-builder` is the R18c forward-pointer) + `/operations/agentic-commerce-findings-downstream-order.md`. The endpoint is bespoke Next.js App Router wiring; record the consult.

**Founder decisions already resolved (do not re-litigate):** split scope (done); **D-6 reuse the `atl_write` credential as-is** (no `purpose='discovery'` scope); **retention 90 days** (proceeding); **Layer 1 `version` → v3** (execute at Step 4). **Still to confirm at open:** the **D-12 clarification timeout value** + the "new context arrives" detection mechanism (propose a default, e.g. a fixed wall-clock timeout + a developer-supplied context delta on the next call; surface via AskUserQuestion).

## Part B — Procedure
Apply **PR1** (the engine is the proven core; this wires the single endpoint over it) and **PR2** (verify each function is actually invoked in the request path — grep for calls, not definitions).

### Step 3 — `POST /api/calling` (D-2, D-6, D-8)
New route `website/src/app/api/calling/route.ts`. Server-side session keyed by agent-supplied `session_id`. **A10 auth gate (D-6, AC7):** reuse `validateAtlWriteToken`; collapse every failure to `401` (mirror the accreditation route; no info leak; log the specific reason via the `atl_verify` event shape). **Global flag (D-14):** if `SAGE_CALLING_ENABLED !== 'true'`, the whole endpoint returns `503` (the `SUBSTRATE_WRITE_PATH_ENABLED` analogue), checked before auth. **Per-stage metering (D-8):** each stage call = one Option D loop; propagate `loop_id`/`session_id` (AC10); a resumed stage that does no new compute must not be re-billed (the `(api_key_id, loop_id)` uniqueness gives this — handle `duplicate_loop_id` as a no-op, not a 400, for resumes). **R3 + R18e:** every response carries the one-framework (Stoic) disclaimer and identifies the interaction as a Stoic-grounded purpose-discovery sequence. Use the endpoint↔engine contract above.

### Step 4 — Hard Gate + handoff (D-14, D-5) + Layer 1 `version` → v3
At a `hard_gate` decision, `persistTurn` sets `gate_status='awaiting_approval'`, `outcome='found'`, `completed_at`. The five-spec handoff into Layer 1 `discovered_purpose` **MUST NOT fire** until an explicit external developer approval flips `gate_status='approved'` (via `setGateStatus`; build the approval entry-point — a separate authenticated route or admin action). Wire the five-spec → `discovered_purpose` mapping (D-5) only on the approved path. **Also here:** bump the Layer 1 schema `version` → v3 in `layer1-extractor.ts` — first grep for any consumer that compares `version` literally; if none, bump; flag for the Rule A licensing gate; classify the bump (likely Elevated) and note it in the Critical Change Protocol.

### Step 5 — Null-result + clarification (D-12)
On a `null_result` decision, emit the engine's chosen `CLARIFICATION_TEMPLATES` text. Then **return to innermost-circle attention (Q6 Variant A)** until the developer responds, a timeout fires (confirmed value), or new context arrives. **Do NOT loop to Q1; do NOT repeat the clarifying request** (the engine already enforces no-loop + once-and-precisely; the endpoint enforces the re-entry + timeout).

### Step 6 — Optional `agent_card_url` (D-13) + R18d adversarial suite
Accept optional `agent_card_url`; **decline `available_tools`**. If a card URL is supplied, **fetch and verify** it against its URL; it informs signal detection (e.g. chosen-role persona) but never substitutes for the agent's own response and is never trusted at face value. **R18d suite (PRIMARY):** (a) responses engineered to steer the engine toward validation (Q2-B / Q3-B targets); (b) covert framing / biased priors the discipline must resist; (c) poisoned/spoofed Agent Cards via `agent_card_url`. If the suite shows the rules miss subtle semantic signals → that is the **D-4 PR7 trigger**: escalate to the rules+LLM hybrid (PR4 + KG2 + a `constraints.ts` model row engage). Otherwise record that the rules held.

### Step 7 — Verify (in-session, before the Critical deploy)
`tsc --noEmit` clean project-wide; engine + store + endpoint + R18d suites green; Stage 1 + substrate/translation-sandwich regression green (the two Supabase-importing tests need `npx tsx --env-file=.env.local`). Grep (PR2) that the auth gate, the global-flag check, the Hard-Gate transition, and the metering call are actually invoked in the request path.

### Step 8 — Critical Change Protocol (0c-ii) — complete visibly BEFORE the founder deploys
State all six: (1) what changes — a new authenticated public endpoint, off by default behind `SAGE_CALLING_ENABLED`; (2) what could break — auth-gate flaw exposing the endpoint; Hard-Gate flaw letting the handoff fire un-approved; metering double-bill; KG7 double-serialisation; (3) existing sessions — **N/A** ("no current users"); (4) rollback — `SAGE_CALLING_ENABLED` UNSET/`false` → 503 instantly (no redeploy); pre-push `git reset --hard`; post-push `git revert` + push; `discovery_sessions` rows hard-deletable (R17h) — exact commands; (5) verification — mint/reuse a test `sr_atl_` credential; POST a stage call → question; walk Q1→Q5; confirm the Hard Gate pauses; confirm `gate_status` transitions; confirm a row with `jsonb_typeof(response_history)='array'`; confirm failure modes (no/bad/wrong-agent token → 401; flag off → 503); (6) explicit founder approval against the named risks before flipping the flag.

### Step 9 — Decision-log entry (full Critical form) + session close (full Critical form)
Entry `D-SAGE-CALLING-STAGE2-ENDPOINT-WIRED-VERIFIED-YYYY-MM-DD` with the full Critical sections. Status: **Wired** (code + tests Verified in-session) → **Verified / Live** once the founder deploys, flips `SAGE_CALLING_ENABLED='true'`, and runs the post-deploy smoke tests. The close names the next track (the founder elects: K-category migration; the Stage 1-close lawyer engagement; smaller PR7 follow-ons).

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Part A — caches + design + engine-store close + the existing route/metering reads | 30–40 min |
| Step 3 — endpoint (auth gate, global flag, metering) | 45–60 min |
| Step 4 — Hard Gate + handoff + Layer 1 v3 bump | 30–45 min |
| Step 5 — null-result + clarification re-entry | 20–30 min |
| Step 6 — `agent_card_url` + R18d suite | 45–60 min |
| Step 7 — verify | 20–30 min |
| Step 8 — Critical Change Protocol (visible) | 15–20 min |
| Step 9 — decision-log + close (full Critical form) | 25–35 min |
| **Total** | **~3.5–4.5 hr** |

## Rollback path
Layered. **Fastest:** `SAGE_CALLING_ENABLED` UNSET/`false` in Vercel → endpoint returns `503` immediately, no redeploy, no other behaviour change. **Pre-push:** `git reset --hard`. **Post-push:** `git revert` + push → Vercel rebuilds to the pre-endpoint shape (endpoint 404/absent). `discovery_sessions` rows are removable via R17h hard-delete. The engine + store + Stage 1 table/field remain (inert) on rollback — this stage is purely additive on top of them. Nothing touches A10, the substrate write path, Option D's existing surface, the pass-through fields, or Stripe.

## Forecast
Complete = Sage Calling is **Live but gated** — a rule-based, fully auditable, A10-authenticated purpose-discovery endpoint over the verified engine + store, persisting every session, gating the handoff behind a Hard Gate + global kill switch, R18d-tested, off by default until the founder flips `SAGE_CALLING_ENABLED`. After it, the post-arc tracks remain (K-category migration; the Stage 1-close lawyer engagement; smaller PR7 follow-ons) — the founder elects order.

---
*End of prompt. Paste into a fresh session; it begins under Part A. This is the Critical public-surface half of Stage 2 (D-9); the full Critical Change Protocol applies, and the surface goes Live gated by `SAGE_CALLING_ENABLED`.*
