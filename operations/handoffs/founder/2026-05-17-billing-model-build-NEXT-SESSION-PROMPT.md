# Next-Session Prompt — Session #2 of the new post-6b arc tail: Option D Billing Model Build

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template (not Lean — Critical sessions use the full session close per the standing protocol cache §"Critical-risk sessions").
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-critical` row → **Full** template; CCP applies) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 is moot for this session).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-17-billing-model-design-pass-close.md`.
**Predecessor decision-log entries:** `D-BILLING-MODEL-LOCKED-2026-05-17` (the design this build implements); `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (adjacent design — A10 will be Superseded at session #5 of the new post-6b arc tail, unrelated to this session).
**Sequencing source:** session #2 of 6 in the new post-6b arc tail per `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 + session #1's close.
**Risk classification:** **Critical** under 0d-ii. **Critical Change Protocol (0c-ii) ENGAGED.** AC7 ENGAGED (deployment-config + access-control changes — new env var; schema migrations affecting `api_keys` + `api_key_usage`; new `loop_billing_events` table; modified RPC; Stripe webhook integration; response-header emission on the loop-producing surfaces). PR6 NOT engaged (no R20a / distress-classifier surface touch).

---

## Why this session matters

The Option D design (session #1, locked under `D-BILLING-MODEL-LOCKED-2026-05-17`) is the spec; this session lands the code. Eight design decisions A–H define the surface; the design's 17-row build-session implementation summary table names the file changes. Per PR1 single-build proof discipline, all 17 changes land in one Critical-risk session.

After this session lands and the founder flips the Stripe Price ID env var in Vercel:

- The substrate switches from per-API-call (count-based) billing to per-loop billing.
- R5's 2x ratio becomes prospectively enforced (every loop's bill is constructed such that revenue covers 2x the loop's LLM cost).
- The founder is no longer absorbing LLM-cost variance — the overage mechanism (Anthropic cost above 50% of base rate × 2 margin) passes variance through to the caller that caused it.
- Response headers (`X-Loop-Id`, `X-Loop-Cost-Cents`, `X-Anthropic-Cost-Cents`, `X-Overage-Fired`, `X-Overage-Cents`, `X-Loop-Internal-Calls`) on `/api/reason` and `/api/score-iterate` give wrappers real-time cost-awareness (the fair-license criterion "the meter is visible").
- `loop_billing_events` becomes the canonical billing ledger; Stripe invoices render from it; the existing `cost_health_snapshots` retains its retrospective sanity-check role (Decision G).

**Plan ~3–4 hr** (the design pass estimated 3–4 hr for this build; some sub-steps may compress, particularly if the founder takes the natural pause after Step 8 — Stripe webhook integration). Founder mid-session input concentrated at Step 1 (discretion picks) and Step 11 (CCP + explicit approval).

---

## Pre-conditions

1. **Vercel green for the design-pass commit** (founder confirmed at session #1 close 2026-05-17).
2. **Founder has read `/adopted/billing-model-design.md` in full** and accepts the eight decisions as written. If any decision needs adjustment, that's an Elevated edit before this build session opens, not a mid-build correction.
3. **Founder has generated the new Stripe Price ID in the Stripe Dashboard** — load-bearing pre-condition. The AI will name the env var (`STRIPE_PER_LOOP_PRICE_ID`) at Step 0; the founder fills the env var in Vercel pre-deploy with the Price ID. If the Price ID is not yet generated when this session opens, Step 0 will pause to walk through Dashboard menu paths and generate it before continuing. **Recommendation: generate the Price ID before opening this session** to avoid the mid-session pause.
4. **Founder commits to a ~3–4 hr bounded session** (with a possible pause-and-continue point after Step 8 if energy flags).
5. **Founder available for Critical-tier mid-session approval at Step 11** — the CCP requires explicit founder approval specific to the seven named risks before deploy.
6. **Production state unchanged from the design-pass close:** substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert); `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET 404 / POST 503). Both ATL tables empty. `api_keys` table holds existing ecosystem keys only.

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirm tier (`code-critical`), risk class (Critical), Full template, signals, status vocabulary, AC1 model-selection row (N/A this session — no LLM calls; the session writes code that processes billing metadata, not code that calls LLMs).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — confirm "no current users" simplification still applies (CCP step 3 will be moot: "N/A — only founder + test logins exist; no third-party sessions to invalidate").
3. **`/operations/handoffs/founder/2026-05-17-billing-model-design-pass-close.md`** (~5 min) — predecessor close; particularly the "Next Session Should" block which scopes this session.
4. **`/adopted/billing-model-design.md`** **in full** (~15–20 min) — **the day's primary deliverable; the spec for this session**. Every paragraph in the design corresponds to a code change in this build. Particularly: the eight decisions A–H, the cost-per-loop estimate appendix, and the 17-row build-session implementation summary table.
5. **Targeted code + schema files** (~10 min):
   - `/api/api-keys-schema.sql` — the existing schema this build extends (Decision E + F)
   - `/api/migrations/stripe-billing-schema.sql` — Stripe + cost-health schema (Decision G keeps this unchanged structurally; the build adds `loop_billing_events` alongside)
   - `/website/src/lib/r20a-cost-tracker.ts` — pattern source for `loop-cost-tracker.ts` (Decision E)
   - `/website/src/lib/stripe.ts` — where Decision B + C + D constants land + the existing `COST_HEALTH` block
6. **Integration target routes** (~10 min):
   - `/website/src/app/api/reason/route.ts` — to map where the metering layer integrates at request entry + response construction
   - `/website/src/app/api/score-iterate/route.ts` — the chain-iteration enforcement is preserved; all iterations in a chain share one `loop_id`
7. **`/operations/decision-log.md` last 3 entries** — `D-BILLING-MODEL-LOCKED-2026-05-17` (this session's spec) + the two A10-related entries (`D-ATL-A10-DESIGN-LOCKED-2026-05-16` + `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16`) for context on adjacent surfaces.
8. **PR11 inbox scan** — list `/inbox/` for files dated since 2026-05-17. None expected; predecessor close confirmed no new files since 2026-05-16. F-tracker (`/operations/agentic-commerce-findings-downstream-order.md`): no F-finding targets this session; F4's downstream-order target is A12 (post-launch), not this build.
9. **PR15 consult** — `.claude/skills/anthropic/` review. Candidate primitives: `claude-api` (informational — SDK patterns; the build session doesn't call LLMs but does emit response headers in the Anthropic-style convention); `mcp-builder` (forward pointer for R18c interoperability post-launch — billing data could later be exposed via MCP). Bespoke election expected to be justified — billing is substrate-internal commercial code; no Anthropic primitive substitutes. The dominant PR15 finding mirrors the design pass: the existing `api_key_usage` + `cost_health_snapshots` + `r20a-cost-tracker.ts` + Stripe billing infrastructure is the production-adjacent reusable primitive; the build extends rather than replaces.

**Confirm at open:** tier (`code-critical`); hold-point status (P0 0h active); model selection N/A (no LLM calls — the session writes code that processes billing metadata); status vocabulary; signals + risk classification; **Critical Change Protocol ENGAGED this session** (the seven CCP responses are constructed across Steps 2–10 and presented at Step 11 before founder approval).

---

## Part B — Procedure

### Step 0 — Scope confirm + Stripe Price ID precheck (~10 min)

State scope via AskUserQuestion: implement the 17 file changes from the design's build-session implementation summary table, in the order specified by Steps 2–10 below. Critical risk; full CCP at Step 11; full session close at Step 14.

**Stripe Price ID precheck:** confirm the founder has generated the new Stripe Price ID (`STRIPE_PER_LOOP_PRICE_ID`) in the Stripe Dashboard. If not, walk the founder through Dashboard menu paths (Products → New Product → Recurring/One-off → Per-loop billing) and pause until Price ID is available. The env var is filled in Vercel pre-deploy (after Step 10 tests pass, before Step 11 approval); the build session can land all code without the Price ID, but the Step 12 post-deploy verification requires it.

**In scope:** the 17 file changes from the design. **NOT in scope:** any of the deferred items in `D-BILLING-MODEL-LOCKED-2026-05-17`'s "Open questions (deferred per PR7)" block; pass-through fields (session #3); A10 rewrite (session #5). If a decision the design left to build-session discretion needs the founder's input, Step 1 surfaces it.

### Step 1 — Build-session discretion picks (~10–15 min)

The design left a few decisions to build-session discretion. AskUserQuestion (one round of 3–4 questions) to surface them:

- **(a) CORS `Access-Control-Expose-Headers` configuration.** The new `X-Loop-*` response headers need to be exposed for browser-side wrappers; current CORS posture exposes a limited header set. Election: (i) add all six `X-Loop-*` headers to the existing `ACCREDITATION_RESPONSE_HEADERS`-style block (deeper edit); (ii) defer browser-side header exposure under PR7 (current shape — server-to-server callers see headers via `curl -i`; browser callers don't until a follow-on session adds the CORS surface).
- **(b) Invoice line-item shape.** Per Decision H: per-day-aggregate (compact; one line per day of usage) or per-loop-granular (verbose; one line per loop) or per-day-aggregate-with-CSV-download (the design's recommendation).
- **(c) Dead per-call code paths.** Retain for one release cycle (default per the design) for rollback safety, or remove immediately. Recommendation: retain; the follow-on Standard-risk session removes them after 2 weeks of stable Option D operation.
- **(d) Test file structure for the metering layer.** Sibling `loop-cost-tracker.test.ts` (matches the existing `r20a-cost-tracker` pattern) or co-located in the route test files. Recommendation: sibling (cleaner separation; the metering layer is a stable primitive).

### Step 2 — Schema migration (~20–25 min)

Write `/api/migrations/option-d-billing-schema.sql` (NEW). Idempotent DDL per Decision E + F:

- `ALTER TABLE public.api_keys ADD COLUMN billing_model TEXT NOT NULL DEFAULT 'per_loop' CHECK (billing_model IN ('per_call', 'per_loop'))`.
- `ALTER TABLE public.api_key_usage ADD COLUMN loop_count INTEGER DEFAULT 0 NOT NULL`, plus the four other columns (`anthropic_cost_cents`, `billed_cents`, `overage_count`, `overage_cents`).
- `CREATE TABLE public.loop_billing_events` per Decision E's DDL block.
- Indexes per Decision E (`idx_loop_billing_events_key_month`, `idx_loop_billing_events_loop_id`).

**Founder action (in-session):** run the migration in Supabase Dashboard → SQL Editor → New Query (founder pastes the SQL; the AI provides the exact paste-block). Verify: `SELECT column_name FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'billing_model';` returns one row; `SELECT column_name FROM information_schema.columns WHERE table_name = 'api_key_usage' ORDER BY ordinal_position;` shows all five new columns; `SELECT table_name FROM information_schema.tables WHERE table_name = 'loop_billing_events';` returns one row.

### Step 3 — RPC extension (~10–15 min)

Update `increment_api_usage` RPC per Decision E. New optional params: `p_loop_id UUID DEFAULT NULL`, `p_anthropic_cost_cents INTEGER DEFAULT 0`, `p_billed_cents INTEGER DEFAULT 0`, `p_overage_fired BOOLEAN DEFAULT FALSE`, `p_anthropic_cost_cents INTEGER DEFAULT 0`. When `p_loop_id` is provided, the RPC writes a `loop_billing_events` row in the same transaction as the `api_key_usage` increment. Transactional posture is load-bearing — both succeed or both fail.

**Founder action (in-session):** paste the updated RPC into Supabase Dashboard → SQL Editor → New Query. Verify: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'increment_api_usage';` returns one row; the new signature is documented in the function comment.

### Step 4 — New module `loop-cost-tracker.ts` (~15–20 min)

Write `/website/src/lib/loop-cost-tracker.ts` (NEW). Per Decision E: per-model pricing constants (Haiku-4-5 + Sonnet-4-6 per AC1 of the manifest); `estimateCallCostCents(model, input_tokens, output_tokens)`, `aggregateLoopCost(loop_id)`, `recordLoopBilling(api_key_id, loop_id, anthropic_cost_cents, surface, ...)` functions. Re-exports the cost-estimation primitive used by `r20a-cost-tracker.ts` (or vice versa — election (d) at Step 1).

### Step 5 — Stripe constants (~5–10 min)

Modify `/website/src/lib/stripe.ts`. Add to the `COST_HEALTH` block (or create a sibling `BILLING_MODEL` block) per Decision B + C + D:
- `LOOP_BASE_RATE_CENTS = 2`
- `OVERAGE_TRIGGER_RATIO = 0.5`
- `OVERAGE_RATE_MULTIPLIER = 2.0`
- `computeLoopBill(anthropic_cost_cents): { base_cents, overage_cents, total_cents, overage_fired }` helper (single-source-of-truth for the formula).

Update the file-header comment block's "Rules served" list to reflect the new R5-by-construction property.

### Step 6 — `r20a-cost-tracker.ts` integration (~5–10 min)

Minor changes per Decision E:
- Share the per-call cost-estimation primitive with `loop-cost-tracker.ts` (re-export pattern).
- Add a `loop_id` optional param to `logClassifierRun` so the classifier's cost can be attributed to the parent loop when the classifier runs inside a wrapper invocation.

The R20a classifier-cost tracking continues to use its existing path (no schema change to `classifier_cost_log`); the integration is additive — when a `loop_id` is provided, the classifier's cost is *also* added to the loop's `anthropic_cost_cents`.

### Step 7 — Loop-producing surface integration (~30–45 min)

Modify `/website/src/app/api/reason/route.ts` and `/website/src/app/api/score-iterate/route.ts`. Per Decision A + E + H:

- **At request entry:** extract `X-Loop-Id` header (UUIDv4); if absent, generate a new UUIDv4 and emit as `X-Loop-Id` in response. Validate the format; reject malformed values with 400.
- **At per-call point:** compute the call's Anthropic cost via `loop-cost-tracker.ts`; accumulate into a per-loop in-memory aggregate keyed by `loop_id`.
- **At response construction (every call):** emit the six response headers per Decision H — `X-Loop-Id`, `X-Loop-Cost-Cents` (cumulative), `X-Anthropic-Cost-Cents` (cumulative), `X-Overage-Fired`, `X-Overage-Cents` (cumulative), `X-Loop-Internal-Calls` (cumulative).
- **At terminal call of a loop:** call `computeLoopBill` from `stripe.ts`; write the `loop_billing_events` row via the extended `increment_api_usage` RPC (Step 3). Transactional with the aggregate increment.
- **`/api/score-iterate` specifically:** all chain iterations within one invocation share the same `loop_id`. The existing `max_chain_iterations` enforcement is preserved (the loop's call count is bounded; one terminal write at the last iteration).

KG1 disciplines apply: every metering write is awaited; no fire-and-forget; no self-calls between the metering layer and the loop-producing surfaces; no redirects from the metering paths; no file-system reads.

### Step 8 — Stripe webhook integration (~15–25 min)

Modify or create the Stripe webhook handler at `/website/src/app/api/stripe/webhook/route.ts` (or sibling). Per Decision H:

- On `invoice.created` or `invoice.finalized`: query `loop_billing_events` for the customer's `api_key_id`s in the period; render line items (per Step 1 (b) election); attach to the Stripe invoice via the Stripe Invoice Items API.
- Reuse the existing `constructWebhookEvent` + `logPaymentEvent` patterns from `/website/src/lib/stripe.ts`.
- If Step 1 (b) elects per-day-aggregate-with-CSV-download: generate a CSV per customer per period and host it via a signed URL on the invoice metadata.

**Natural pause point: AFTER Step 8.** If the founder's energy is flagging or session-time is tight, this is the clean break — first half of the build is done (schema + RPC + module + constants + integration + webhook); second half is discovery files + tests + verification. Founder elects whether to take the pause via AskUserQuestion at this point.

### Step 9 — Discovery files + STATUS-REVENUE-MODEL.md supersession (~15–20 min)

Per Decision F + H:

- **`/AGENTS.md`** — replace per-call rate references with per-loop language; document the response headers; document the `X-Loop-Id` header pattern.
- **`/website/public/llms.txt`** — same replacements; consistent language.
- **`/website/public/.well-known/agent-card.json`** — update authentication + rate-limit descriptions to reflect per-loop billing.
- **`/business/STATUS-REVENUE-MODEL.md`** — append header note: "**Superseded by `/adopted/billing-model-design.md` (D-BILLING-MODEL-LOCKED-2026-05-17)** for Tasks 4 + 5 (free/paid tier pricing rationales). Tasks 1, 2, 3, 6, 7, 8 remain in force." This supersession edit is Elevated under 0d-ii but happens within this Critical session as part of the build.

### Step 10 — Tests (~20–30 min)

Per PR2 build-to-wire verification immediate:

- **`/website/src/lib/__tests__/loop-cost-tracker.test.ts`** (NEW) — plain-assertion harness per the existing pattern (PASS/FAIL labels, exit code 0/1, no Jest). Tests cover: `estimateCallCostCents` for Haiku + Sonnet; `aggregateLoopCost` aggregation correctness; `recordLoopBilling` RPC call shape (mock the persistence layer).
- **Modifications to route tests** — `/api/reason/__tests__/route.test.ts` and `/api/score-iterate/__tests__/route.test.ts`: tests for `X-Loop-Id` extract-or-generate, response-header emission, metering-layer integration with the RPC mock, terminal-call `loop_billing_events` write.
- **`computeLoopBill` unit test** — in `/website/src/lib/__tests__/stripe.test.ts` or sibling: tests for the four worked examples from the design's Decision D ($0.005, $0.01, $0.02, $0.03 Anthropic costs); asymptotic 2.0x R5 ratio on overage.
- **Transactional consistency test** — simulate a `loop_billing_events` insert failure; verify the `api_key_usage` aggregate is rolled back; no orphan ledger rows.

Run `tsc --noEmit` in the website directory; verify exit code 0.

**Founder runs the tests locally** before approving at Step 11:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
```
Then each test command on its own line (per CLAUDE.md — one command at a time, not pasted as a block; tests that need Supabase load `--env-file=.env.local`):
```
npx tsx src/lib/__tests__/loop-cost-tracker.test.ts
```
```
npx tsx --env-file=.env.local src/app/api/reason/__tests__/route.test.ts
```
```
npx tsx --env-file=.env.local src/app/api/score-iterate/__tests__/route.test.ts
```
Expected: each prints `N passed / 0 failed` or equivalent.

### Step 11 — Critical Change Protocol responses + founder approval (~15–20 min)

Per `0c-ii` and PR10's Plan step. Present the seven CCP responses visibly in the session before asking for approval:

1. **What is changing — plain language.** "We're replacing per-API-call billing with per-loop billing. Loops are wrapper invocations identified by `X-Loop-Id` headers. Each loop has a base rate of $0.02 plus an overage if the Anthropic cost exceeds half the base rate. There's a new database table (`loop_billing_events`), five new columns on the existing usage table, a new column on the API keys table, a new module for cost tracking, integration into the two loop-producing API routes, and Stripe webhook integration for invoice rendering. The R5 2x ratio is now enforced prospectively by the formula; the existing retrospective alert (`cost_health_snapshots`) is kept as defence-in-depth."
2. **What could break — specific failure modes.** Construct from the build's actual surface. Expected risks: (a) the metering layer mis-attributes calls between loops (the loop_id propagation has bugs); (b) the `computeLoopBill` arithmetic has off-by-one or rounding errors; (c) the transactional RPC fails between the aggregate increment and the ledger insert, leaving inconsistent state; (d) response headers leak internal state (e.g., model identifiers); (e) the Stripe webhook integration mis-renders line items; (f) the per-call-rate code paths are accidentally hit (dead code becomes live code) — mitigated by Decision F's full cutover; (g) the schema migration fails partway and leaves the table in an inconsistent intermediate state — mitigated by idempotent `IF NOT EXISTS` clauses.
3. **What happens to existing sessions.** "N/A — only founder + test logins exist; no third-party sessions to invalidate" per the build-arc cache's "no current users" governing note (affirmed 2026-05-10).
4. **Rollback plan.** Four paths: (A) **Before push:** `git reset --hard HEAD~1` discards the commit; no production effect. (B) **Schema rollback (independent of code):** `ALTER TABLE public.api_keys DROP COLUMN billing_model; ALTER TABLE public.api_key_usage DROP COLUMN loop_count, DROP COLUMN anthropic_cost_cents, DROP COLUMN billed_cents, DROP COLUMN overage_count, DROP COLUMN overage_cents; DROP TABLE public.loop_billing_events; CREATE OR REPLACE FUNCTION public.increment_api_usage ...` (original signature; preserve the original definition for paste-back). (C) **After push, before Stripe Price ID env var set:** route changes deploy but per-loop billing is inert because the Stripe Price ID is not configured; `git revert HEAD --no-edit` + push removes the code. (D) **After push AND Stripe Price ID set:** unset `STRIPE_PER_LOOP_PRICE_ID` in Vercel (Project → Settings → Environment Variables → unset, or set to empty); the metering still runs (writes `loop_billing_events`) but no Stripe invoice rendering happens. The data is preserved for forensic review.
5. **Verification step.** Local pre-push: founder runs the Step 10 test commands. Post-deploy: founder runs `curl -i -H "Authorization: Bearer sr_live_<existing_paid_key>" https://www.sagereasoning.com/api/reason -X POST -H "Content-Type: application/json" -d '{"impression":"test","depth":"quick"}'` (or equivalent — the AI provides the exact `curl` at Step 12). Expected: HTTP 200 with the six `X-Loop-*` headers present.
6. **Explicit founder approval.** AskUserQuestion specific to the seven named risks; founder elects "OK to deploy" or names a specific risk to address before deploy. The approval is not generic; the seven risks above are re-stated immediately before the question.
7. **Orchestration reminder.** The founder runs the pre-push tests locally one command at a time (not as a pasted block, per CLAUDE.md); commits via the exact `git add` + `git commit` block in the session-close Founder Verification section; pushes via GitHub Desktop; after Vercel reports green, sets `STRIPE_PER_LOOP_PRICE_ID` in Vercel (Project → Settings → Environment Variables → add new); then runs the post-deploy `curl` to verify response headers.

### Step 12 — Post-deploy founder verification (~10 min)

After founder pushes + Vercel reports green + Stripe Price ID env var set in Vercel:

- Founder runs `curl -i` against `/api/reason` and `/api/score-iterate` (the AI provides exact commands).
- Verify: HTTP 200; six `X-Loop-*` response headers present; values sensible (e.g., `X-Loop-Cost-Cents: 2` for a typical loop; `X-Overage-Fired: false`).
- Verify the existing GET endpoints (e.g., `/api/accreditation/[agent_id]`) are byte-identical (no regression).
- Verify Supabase `loop_billing_events` table receives a row after the `curl` (founder queries via Supabase Dashboard SQL Editor).

### Step 13 — Append `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-YYYY-MM-DD` decision-log entry (full form) (~15–20 min)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" — the full template for Critical sessions includes Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. The entry's "Rules served" list will include (at minimum): 0a, 0c, 0c-ii, 0d-ii, 0f, R0, R3, R4, R5 (primary), R9, R10, R18a, AC5 (NOT engaged), AC7 (ENGAGED — full CCP responses recorded), AC8, AC10 (`loop_billing_events` is F4's upstream provenance), KG1 (engaged — transactional + awaited + no fire-and-forget), KG7 (NOT engaged), PR1 (single-build proof), PR2 (build-to-wire immediate), PR4 (N/A), PR6 (NOT engaged), PR7 (deferred items named), PR10 (Plan → Execute → Verify completed), PR11 (inbox scan), PR15 (bespoke election justified).

### Step 14 — Session close (full form for Critical) (~20–25 min)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". Full session close shape; "Next Session Should" block names session #3 of the new ordering — pass-through fields design pass (governance; Standard; ~2.5–3 hr).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + design doc in full + targeted files + decision-log + PR11 + PR15 | 40–50 min |
| Step 0 — scope confirm + Stripe Price ID precheck | 10 min |
| Step 1 — build-session discretion picks | 10–15 min |
| Step 2 — schema migration + founder Supabase action | 20–25 min |
| Step 3 — RPC extension + founder Supabase action | 10–15 min |
| Step 4 — `loop-cost-tracker.ts` new module | 15–20 min |
| Step 5 — Stripe constants | 5–10 min |
| Step 6 — `r20a-cost-tracker.ts` integration | 5–10 min |
| Step 7 — loop-producing surface integration | 30–45 min |
| Step 8 — Stripe webhook integration | 15–25 min |
| **NATURAL PAUSE POINT** (founder elects) | — |
| Step 9 — discovery files + STATUS supersession | 15–20 min |
| Step 10 — tests | 20–30 min |
| Step 11 — CCP + founder approval | 15–20 min |
| Step 12 — post-deploy founder verification | 10 min |
| Step 13 — decision-log entry (full form for Critical) | 15–20 min |
| Step 14 — session close (full form for Critical) | 20–25 min |
| **Total** | **~4–5 hr** |

The estimate runs slightly over the design pass's 3–4 hr projection because the Critical-tier full template adds overhead at Steps 11 + 13 + 14 that the design pass's lean template didn't carry. **The natural pause point is after Step 8** — first half (schema + module + integration + webhook) complete; second half (discovery files + tests + verification + close) can be a continuation session if needed.

If the founder takes the pause: the session resumes against the same prompt; the partial commit is held by the founder (uncommitted local changes) or committed locally as a WIP state (the AI advises which based on session-end state).

---

## Rollback path

Critical change — full rollback paths are documented at Step 11 CCP. Summary:

- **Before push:** `git reset --hard HEAD~1`.
- **Schema rollback (independent of code):** `ALTER TABLE` + `DROP COLUMN` + `DROP TABLE` SQL (AI provides exact block at Step 11).
- **After push, before Stripe Price ID env var set:** route changes deploy but per-loop billing is inert; `git revert` + push.
- **After push AND Stripe Price ID set:** unset `STRIPE_PER_LOOP_PRICE_ID` in Vercel; metering data preserved for forensic review.

The four paths give the founder defensible recovery at every stage. The "no current users" governing note means none of these paths require third-party communication.

---

## Forecast

A successful build session lands all 17 file changes; the schema migration applies idempotently in Supabase; `loop-cost-tracker.ts` is Verified; the loop-producing surfaces emit response headers; the Stripe webhook handler renders invoices from `loop_billing_events`; tests pass; post-deploy verification confirms the surface behaves as designed.

After session #2 lands, sessions #3–#6 of the new post-6b arc tail follow per the predecessor close's Part 2:

- **#3** — pass-through fields design pass (governance; Standard; ~2.5–3 hr) — six new fields on `EvaluatedAction` / `CarriedProfile` per the brainstorm scoping (`operation_class`, `downstream_identity_model`, `path_posture`, `target_system`, `outcome_verification`, `reversibility_signal`).
- **#4** — pass-through fields build (Elevated; ~2–3 hr).
- **#5** — A10 design rewrite (governance; Standard; ~1–2 hr) — supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with the `owner_user_id` + `agent_id` correction + integration with Option D's `loop_billing_events` (where the credential surface touches billing) + integration with the new pass-through fields.
- **#6** — A10 build (Critical; ~3–4 hr) — closes the post-6b arc.

After session #6 lands, the post-6b arc closes. The substrate carries: authenticated read AND write public surfaces (post-A10); per-loop billing with R5 prospectively enforced (post-Option-D); enterprise-readable pass-through fields (post-pass-through). The substrate is launch-ready from a structural standpoint; the remaining gates are commercial (Stage 1 close lawyer engagement, FPE-5 TOS + liability), regulatory, and market.

**Post-launch base-rate re-tuning window:** 2–4 weeks after this build's deploy, real per-loop cost distributions become available; the $0.02 base rate is re-tunable as an Elevated edit before Stripe activation with paying customers. Plan a brief re-tuning session ~2 weeks after this build deploys.

*End of prompt.*
