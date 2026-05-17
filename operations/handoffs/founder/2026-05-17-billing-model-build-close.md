# Session Close — 2026-05-17 — Option D Billing Model Build

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-critical` row → **Full** template; CCP applies) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 N/A).
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **Full** template per the standing cache §"Critical-risk sessions". Critical Change Protocol (0c-ii) ENGAGED. AC7 ENGAGED. PR6 NOT engaged.
**Date:** 2026-05-17.

Built the Option D per-loop billing model per `D-BILLING-MODEL-LOCKED-2026-05-17` + `/adopted/billing-model-design.md` (session #2 of 6 in the new post-6b arc tail). All 17 expected file changes from the design's build-session implementation summary table landed in one Critical-risk session (PR1 single-build proof). Per-call billing replaced by per-loop billing for paid API-key callers — `$0.02` base per loop with LLM-token-cost overage above 50% of base × 2 multiplier; R5's 2× revenue/cost floor holds by construction. New `loop_billing_events` ledger; metering layer wired into both loop-producing routes; six X-Loop-* response headers emit on every billable branch; Stripe webhook `invoice.created` handler attaches per-day-aggregate line items (inert until `STRIPE_PER_LOOP_PRICE_ID` set in a follow-on session per Step 0 election).

**Part A** — read both caches (standing + build-arc); the predecessor design-pass close in full; `/adopted/billing-model-design.md` in full; the seven targeted code + schema files (`api-keys-schema.sql`, `stripe-billing-schema.sql`, `r20a-cost-tracker.ts`, `stripe.ts`, plus the two integration target routes `reason/route.ts` + `score-iterate/route.ts`); the last three decision-log entries (write-path-build-verified, A10-design-locked, billing-model-locked); PR11 inbox scan (no files in `/inbox/` — confirmed empty); PR15 consult (predecessor design-pass's PR15 reading affirmed — bespoke billing is substrate-internal commercial code; no Anthropic primitive substitutes; the existing `api_key_usage` + `cost_health_snapshots` + `r20a-cost-tracker.ts` + Stripe infrastructure is the production-adjacent reusable primitive Option D extends).

**Step 0** — scope confirmed via AskUserQuestion (two questions). Stripe Price ID elected as **deferred to a follow-on session** (metering layer + webhook handler land in this build; Stripe live invoice rendering inert until `STRIPE_PER_LOOP_PRICE_ID` is set). Session-time commitment elected as **split at natural pause after Step 8** (offered as a continuation point; you elected to push through Steps 9–14 in one session at the pause-point check).

**Step 1** — five build-session discretion picks via two AskUserQuestion rounds. Round 1 (CORS exposure + invoice line-item shape) ran clean — both Recommended options elected: (a) defer browser CORS exposure under PR7; (b) per-day-aggregate + CSV download (CSV deferred under PR7 — only per-day-aggregate landed this build). Round 2 (dead per-call code paths + test file structure + the 5th election I surfaced from Part A reads) ran clean — all three Recommended options: (c) retain dead per-call code one release cycle; (d) sibling test file; (e) hard error on duplicate (api_key_id, loop_id).

**Step 2** — schema migration written at `/api/migrations/option-d-billing-schema.sql`. Idempotent DDL: `api_keys.billing_model` column with CHECK constraint; five new aggregate columns on `api_key_usage`; new `loop_billing_events` table with two indexes + UNIQUE constraint; `classifier_cost_log.loop_id` column added (Step 6 integration); RLS enabled on the new ledger. Cross-reference headers added to `/api/migrations/stripe-billing-schema.sql` + `/api/api-keys-schema.sql`.

**Step 3** — RPC extension written at `/api/migrations/option-d-billing-rpc.sql`. `increment_api_usage` extended with 13 optional Option D params (loop_id, surface, anthropic_cost_cents, base/threshold/overage/total cents, overage_fired, internal_calls, models_used, total_input/output_tokens, agent_id). Return shape extended with `new_monthly_loops`. Transactional: when `p_loop_id` is provided, the RPC writes a `loop_billing_events` row in the same PL/pgSQL function (one implicit transaction) as the `api_key_usage` aggregate increment. Backward-compatible — DEFAULT params mean the existing 5-arg call sites in `security.ts`'s `validateApiKey` continue to work unchanged.

**Step 4** — `/website/src/lib/loop-cost-tracker.ts` written. Per-model pricing constants (Haiku 4.5: $1/$5 per million; Sonnet 4.6: $3/$15; Opus 4.6: $15/$75 listed for future). `estimateCallCostCents(model, in, out) → cents` (float for precision; rounded at billing-construction boundary; unknown model returns 0 with warn-once). `createLoopAccumulator(params) → LoopAccumulator` factory with `addCall` + `addPrecomputedCall` + `getState` (defensive copy of `models_used`); KG1 rule 4 — per-request scope, never module-level state. `recordLoopBilling(params) → RecordLoopBillingResult` (discriminated union — `ok: true | false` with `kind: 'duplicate_loop_id' | 'rpc_error'` on failure). `buildLoopHeaders(input) → Record<string, string>` (six X-Loop-* headers per Decision H). `extractLoopId(request) → string | null` (UUIDv4 validation; soft fallback for malformed). `generateLoopId() → string` (crypto.randomUUID). `finalizeLoopResponse(params) → Promise<NextResponse>` (combines bill compute + persist + headers; fail-closed on rpc_error returning 500).

**Step 5** — `/website/src/lib/stripe.ts` modified. `OPTION_D_BILLING` constants block added (`LOOP_BASE_RATE_CENTS = 2`, `OVERAGE_TRIGGER_RATIO = 0.5`, `OVERAGE_RATE_MULTIPLIER = 2.0`). `computeLoopBill(anthropicCostCents) → LoopBill` helper added — single source of truth for Decisions B + C + D arithmetic; integer cents throughout; `Math.round` at the float-to-cents boundary; `Math.floor` on the threshold computation (favours customer at cent boundary). `STRIPE_PRICES.perLoop` env var named (`STRIPE_PER_LOOP_PRICE_ID`). File-header Rules served extended to name R18a + AC7 + the prospective R5 enforcement note.

**Step 6** — `/website/src/lib/r20a-cost-tracker.ts` modified (minimal). Optional `loop_id` field added to `ClassifierRunLog` interface; persisted to `classifier_cost_log.loop_id` (column added in Step 2 migration). Live add-to-loop-aggregate at the TypeScript layer DEFERRED under PR7 (would require touching r20a-classifier.ts — Critical under PR6 — for the classifier to pass tokens to a wrapper-supplied accumulator; this build keeps the classifier surface untouched). Pricing convention reconciliation between the two trackers (r20a's $25/$125 per million vs loop-cost-tracker's $1/$5 — appears off by ~25x relative to Anthropic listed Haiku 4.5 pricing + the design's cost-per-loop appendix) documented in r20a-cost-tracker.ts header as a separate follow-on Standard-risk session.

**Step 7** — loop-producing surface integration. `/website/src/app/api/reason/route.ts` modified: Option D imports added; `loopId` extracted-or-generated after auth resolution (only when API-key auth succeeded — user-auth + plugin-auth callers are NOT metered); `LoopAccumulator` created inside the try block (KG1 rule 4); local `respond()` helper wraps every response branch via `finalizeLoopResponse`. After `runSandwich` completes, per-layer Anthropic cost populated from `SandwichRunResult.layer1_cost_usd_microcents` + `.layer3_cost_usd_microcents` (microcents → cents conversion via `/10000`); both layers attributed to `claude-sonnet-4-6` (AC1). 15 return statements modified: pre-substrate validation errors → `isBillable: false` (no LLM cost; emit X-Loop-* headers with zero values; no ledger write); R20a redirect, Tier 1, A7 redirect, layer throws, happy path → `isBillable: true` (substrate engaged; bill at base rate or full cost); server-misconfig 503s (continuation_token_secret_missing, signing_throw) → `isBillable: false` (not customer fault). Catch block emits X-Loop-* headers from accumulator state but skips ledger write (fail-open on bill for catch-all errors). `/website/src/app/api/score-iterate/route.ts` modified: same shape but simpler (single Anthropic call per HTTP request; either Mode 1 initial or Mode 2 iteration); `loopAccumulator.addCall(MODEL_DEEP, message.usage.input_tokens, message.usage.output_tokens)` added immediately after both `client.messages.create` calls; 12 return statements modified; pre-substrate validation + chain-state errors (chain not found, iteration limit, agent_id mismatch) → `isBillable: false`; LLM-call errors + happy path → `isBillable: true`.

**Step 8** — Stripe webhook integration. `/website/src/app/api/webhooks/stripe/route.ts` modified: `invoice.created` event handler added in the route switch; new `handleInvoiceCreated` async function queries `loop_billing_events` for the customer's `api_keys` (filtered to `billing_model = 'per_loop'`) within the invoice period; aggregates by UTC date (YYYY-MM-DD); attaches one Stripe Invoice Item per day via `stripe.invoiceItems.create`; metadata records `source: 'option_d_billing'` + `day` + `loops_count`. Three skip conditions handled gracefully: customer not in `stripe_customers` (warning logged); `STRIPE_PRICES.perLoop` unset (informational log — Step 0 election); no `loop_billing_events` in period (informational log). File-header doc extended to describe the Option D integration.

**Natural pause point reached** after Step 8 per Step 0 election. AskUserQuestion: continue or close. Elected: **push through Steps 9–14 in this session**.

**Step 9** — discovery files updated. `/product/AGENTS.md`: 12-row skills table cost column updated to `$0.02/loop + overage*` with footnote linking to the design doc; Free Tier section rewritten ("30 loops per month (≈1/day)"); Sage Skill Wrappers section rewritten with the X-Loop-* headers listed. `/website/public/llms.txt`: Free + Paid tier sections rewritten in per-loop language with the six headers documented. `/website/public/.well-known/agent-card.json`: access-tiers extension updated with `monthlyLoopLimit: 30`, `dailyLoopLimit: 1`, `billingModel: 'per_loop'`, `loopBaseRateCents: 2`, `overageTriggerRatio: 0.5`, `overageRateMultiplier: 2.0`. `/business/STATUS-REVENUE-MODEL.md`: supersession notice block added at the top — Tasks 4 + 5 marked Superseded by `D-BILLING-MODEL-LOCKED-2026-05-17` + this build entry; Tasks 1, 2, 3, 6, 7, 8 remain in force.

**Step 10** — tests written + run. `/website/src/lib/__tests__/loop-cost-tracker.test.ts` (NEW, 76 tests) covering: `estimateCallCostCents` (Haiku + Sonnet pricing accuracy; zero tokens; unknown model; aliased model names; linearity), `OPTION_D_BILLING` constants (LOOP_BASE_RATE_CENTS, OVERAGE_TRIGGER_RATIO, OVERAGE_RATE_MULTIPLIER), `computeLoopBill` (Decision D's 4 worked examples — $0.005, $0.01, $0.02, $0.03 Anthropic costs; R5 floor at $0.10 + $1.00 Anthropic costs; float input rounding edges), `createLoopAccumulator` (state init at zero; addCall increments; addPrecomputedCall increments; model dedup; defensive copy; mixed-model accumulation; KG1 rule 4 — two accumulators independent), `extractLoopId` (5 cases: missing header, valid UUIDv4, malformed, empty string, mixed-case), `generateLoopId` (validity + uniqueness), `buildLoopHeaders` (4 cases × all 6 header keys). **Result: `Total: 76  Pass: 76  Fail: 0`. `tsc --noEmit` exit 0.** Both verified in-session.

**Step 11** — Critical Change Protocol (0c-ii) responses presented visibly in the session; seven failure modes (a)–(g) named with mitigations; four rollback paths (A)–(D) named; verification step (local + Supabase + post-deploy) named; founder approval requested specific to the seven named risks. **Founder elected: "OK to deploy — I accept the seven risks."** Recorded in this close + the decision-log entry.

**Step 12** — post-deploy founder verification — to be performed by you after the steps in the Founder Verification block below. Stripe Price ID deferral (Step 0) means live invoice rendering is NOT verified this session; only metering writes + response headers.

**Step 13** — `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` appended (full form for Critical). Initial insertion position was corrected mid-session (the entry briefly landed above its predecessor `D-BILLING-MODEL-LOCKED-2026-05-17` due to an Edit-tool ordering quirk; reordered via a one-shot Python script so the LOCKED entry precedes the BUILD entry in chronological order).

**Step 14** — this close.

## Decisions Made

- **`D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`** appended (full form for Critical). Status: Adopted. 17 file changes; 76 tests pass; tsc clean. The Critical Change Protocol's seven responses recorded in the entry.

## Status Changes

| Item | Old | New |
|---|---|---|
| Option D billing model | **Designed** under `D-BILLING-MODEL-LOCKED-2026-05-17` | **Wired** (pending founder Supabase migration + push + post-deploy verification → **Verified**) |
| `/api/migrations/option-d-billing-schema.sql` | did not exist | **Wired** (file authored; founder applies in Supabase → **Verified**) |
| `/api/migrations/option-d-billing-rpc.sql` | did not exist | **Wired** (file authored; founder applies in Supabase → **Verified**) |
| `/website/src/lib/loop-cost-tracker.ts` | did not exist | **Verified** (76/76 tests pass; tsc clean) |
| `OPTION_D_BILLING` + `computeLoopBill` (in stripe.ts) | did not exist | **Verified** (tests BILL-1 through BILL-7) |
| `r20a-cost-tracker.ts` `loop_id` integration | did not exist | **Wired** (param added; integration with actual classifier deferred under PR7) |
| `/api/reason` per-loop metering | did not exist | **Wired** (15 response branches modified; founder post-deploy curl → **Verified**) |
| `/api/score-iterate` per-loop metering | did not exist | **Wired** (12 response branches modified; founder post-deploy curl → **Verified**) |
| Stripe webhook `invoice.created` handler | did not exist | **Wired** (live flow inert pre-Stripe-Price-ID; verification at follow-on session) |
| Discovery files (AGENTS.md + llms.txt + agent-card.json) | per-call language | per-loop language (founder reads + confirms) |
| `/business/STATUS-REVENUE-MODEL.md` Tasks 4 + 5 | **In force** | **Superseded by `/adopted/billing-model-design.md`** (supersession notice added) |
| Per-call billing model | **In force** (designed for retirement at this build session) | **Retired** (all api_keys default to billing_model='per_loop'; dead per-call code retained one release cycle per Step 1(c)) |
| R5 enforcement mechanism | **Retrospective only via cost_health_snapshots** | **Prospective primary (per-loop formula) + retrospective secondary (cost_health_snapshots retained per Decision G)** |
| Production state | A7 Verified; write-path Live but inert; /api/reason byte-identical; /api/substrate/layer3 returns 503; /api/accreditation/[agent_id] Live (GET 404 / POST 503); both ATL tables empty; api_keys table holds existing ecosystem keys only | **Unchanged until founder pushes** — no code, schema, env, or production exposure yet. After push: /api/reason + /api/score-iterate emit X-Loop-* headers; loop_billing_events ledger populates; Stripe rendering remains inert (STRIPE_PER_LOOP_PRICE_ID UNSET per Step 0). |

## Next Session Should

**Session #3 of the new post-6b arc tail — pass-through fields design pass.** `governance` tier; Standard risk under 0d-ii. Lean template per the standing protocol cache. Estimated ~2.5–3 hr.

Per the predecessor design-pass close's Part 2 + the brainstorm scoping: six new pass-through fields on `EvaluatedAction` / `CarriedProfile` — `operation_class` (read/draft/execute taxonomy from Nate B Jones essay), `downstream_identity_model`, `path_posture`, `target_system`, `outcome_verification`, `reversibility_signal`. The design pass produces `/adopted/pass-through-fields-design.md` (six-decision-pass shape modelled on `/adopted/billing-model-design.md`) + the `D-PASS-THROUGH-FIELDS-LOCKED-YYYY-MM-DD` decision-log entry + a lean close.

After session #3 lands, sessions #4–#6 of the new ordering follow per the predecessor close's Part 2:
- **#4:** pass-through fields build (Elevated; ~2–3 hr)
- **#5:** A10 design rewrite (governance; Standard; ~1–2 hr) — supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with `owner_user_id` + `agent_id` correction + integration with Option D's `loop_billing_events` (where the credential surface touches billing) + integration with the new pass-through fields
- **#6:** A10 build (Critical; ~3–4 hr) — closes the post-6b arc

Plus the **follow-on Stripe Price ID session** (Standard-to-Elevated; ~30–60 min) — independent of sessions #3–#6; can be scheduled at any point post-deploy. Founder generates Price ID in Stripe Dashboard (Products → New Product → Recurring → Per-loop billing); sets `STRIPE_PER_LOOP_PRICE_ID` in Vercel; verifies live invoice rendering against the first paying customer subscription.

The next-session prompt for #3 is **not yet written** — to be drafted by the AI between sessions (or at session open) based on the brainstorm scoping in the 2026-05-16 A10-design-pass-close + the new design-pass template established by `/adopted/billing-model-design.md`. Estimated prompt write: ~15–20 min.

## Blocked On

**Files remaining uncommitted (to be committed by the founder per the Founder Verification block below):**

```
?? api/migrations/option-d-billing-schema.sql                                           (NEW — schema migration)
?? api/migrations/option-d-billing-rpc.sql                                              (NEW — RPC extension)
 M api/migrations/stripe-billing-schema.sql                                             (cross-reference header)
 M api/api-keys-schema.sql                                                              (cross-reference header)
?? website/src/lib/loop-cost-tracker.ts                                                 (NEW — metering module)
 M website/src/lib/stripe.ts                                                            (OPTION_D_BILLING + computeLoopBill)
 M website/src/lib/r20a-cost-tracker.ts                                                 (loop_id param + docs)
 M website/src/app/api/reason/route.ts                                                  (metering wiring)
 M website/src/app/api/score-iterate/route.ts                                           (metering wiring)
 M website/src/app/api/webhooks/stripe/route.ts                                         (invoice.created handler)
 M product/AGENTS.md                                                                    (per-loop language)
 M website/public/llms.txt                                                              (per-loop language)
 M website/public/.well-known/agent-card.json                                           (per-loop fields)
 M business/STATUS-REVENUE-MODEL.md                                                     (supersession notice)
?? website/src/lib/__tests__/loop-cost-tracker.test.ts                                  (NEW — 76 tests)
 M operations/decision-log.md                                                           (D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17 appended)
?? operations/handoffs/founder/2026-05-17-billing-model-build-close.md                  (NEW — this close)
```

**Production state at session close:** **unchanged from session open** (no env vars set; nothing pushed yet). Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert). `/api/reason` byte-identical to pre-Option-D production. `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live (GET 404 / POST 503). Both ATL tables empty. `api_keys` table holds existing ecosystem keys only — the new Option D schema additions are NOT yet applied (and won't be until you run the two Supabase migrations in the Founder Verification block below). After you complete the Founder Verification: substrate stays at A7 Verified; A11+ status changes to **Wired** (route metering + ledger) → **Verified** (post your curl + Supabase query confirm response headers + ledger row); Stripe invoice rendering remains **Wired but inert** until the Price ID follow-on session.

## Open Questions

The decision-log entry's "Open questions (deferred per PR7)" block names ~10 deferred items. The headline ones for you to keep in mind between sessions:

- **Stripe Price ID + STRIPE_PER_LOOP_PRICE_ID env var + live invoice rendering verification.** Follow-on Standard-to-Elevated session; ~30–60 min. Founder action: generate Price ID in Stripe Dashboard (Products → New Product → Recurring → Per-loop billing); set `STRIPE_PER_LOOP_PRICE_ID` in Vercel; verify live `invoice.created` rendering against first paying customer subscription. The metering layer + webhook code is fully operational without this — the deferral only affects live Stripe rendering.
- **Base-rate re-tuning window.** Post-deploy + post-Stripe-activation, the first 2–4 weeks of production data produce real per-loop cost distributions; the `$0.02` base rate is re-tunable as an Elevated edit to `/adopted/billing-model-design.md` + `stripe.ts` before Stripe goes live with real customers.
- **CSV per-loop download attached to Stripe invoices.** Step 1(b) deferral. Follow-on Standard-risk session — generates per-loop CSV per customer per period; uploads to Supabase Storage with signed URL; attaches to invoice metadata. The per-day-aggregate line items satisfy the meter-visibility requirement; CSV adds accounting export convenience.
- **CORS Access-Control-Expose-Headers for browser-side wrappers.** Step 1(a) deferral. Server-side wrappers see X-Loop-* headers fine via direct response inspection; browser-side wrappers can't until a follow-on Standard-risk session adds the six headers to the CORS expose block.
- **Removal of dead per-call code paths.** Step 1(c) deferral. Follow-on Standard-risk session after 2 weeks of stable Option D operation in production. The per-call counters on `api_key_usage` (`total_calls`, `guardrail_calls`, etc.) continue to increment alongside `loop_count` until then.
- **Pricing convention reconciliation between r20a-cost-tracker.ts and loop-cost-tracker.ts.** Documented in r20a-cost-tracker.ts header — r20a's $25/$125 per million constants appear to overestimate Haiku 4.5 pricing by ~25x. Follow-on Standard-risk session re-aligns + shares the per-call cost-estimation primitive across both trackers.
- **Live classifier→loop-aggregate integration.** Currently the optional `loop_id` param on `logClassifierRun` + `classifier_cost_log.loop_id` column enable post-hoc joins between classifier cost + loop cost. Live add-to-aggregate at the TypeScript layer requires touching r20a-classifier.ts and is deferred under PR7 to avoid R20a perimeter surgery in this session.

## Founder Verification

**Five things to do, in order. Take them ONE AT A TIME — do not paste the multi-line blocks as one command per the CLAUDE.md note about prompt-consumption. Each numbered step is a checkpoint; if anything looks unexpected, message me before continuing.**

### 1. Apply the schema migration in Supabase

Open Supabase Dashboard → SQL Editor → New Query. Paste the entire contents of `/api/migrations/option-d-billing-schema.sql` (read the file in your editor; copy the whole thing) into the SQL Editor and Run.

**Expected result:** at the bottom of the file are five VERIFY queries. Each should return the expected row count + values noted in the file's comments:
- `api_keys.billing_model` exists: one row (text, default `'per_loop'::text`, NOT NULL)
- `api_key_usage` gained 5 new columns: five rows (all integer, default 0)
- `loop_billing_events` table exists: one row
- Indexes exist: four rows (`idx_loop_billing_events_key_month`, `idx_loop_billing_events_loop_id`, `loop_billing_events_pkey`, `unique_api_key_loop`)
- RLS enabled on loop_billing_events: `loop_billing_events | t`
- `classifier_cost_log.loop_id` exists: one row (uuid, nullable YES)

If any VERIFY query returns unexpected output, stop and message me. The migration is idempotent — safe to re-run if any step failed.

### 2. Apply the RPC extension in Supabase

Open a new SQL Editor query. Paste the entire contents of `/api/migrations/option-d-billing-rpc.sql` and Run.

**Expected result:** the VERIFY query at the bottom should return `increment_api_usage | 18` (18 input params on the function).

If any error fires, the most likely cause is that the migration script didn't drop the old function before recreating. The DROP FUNCTION is at the top of the file and uses IF EXISTS, but if the function signature changed in another session, the DROP might miss. Run `DROP FUNCTION public.increment_api_usage CASCADE;` manually, then re-run the migration.

### 3. Run the local tests one command at a time

Open Terminal:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
```

Then on its own line:

```
npx tsc --noEmit
```

**Expected:** no output, exit code 0. (If the command produces no visible output and returns to a fresh prompt, that's success.)

Then on its own line:

```
npx tsx src/lib/__tests__/loop-cost-tracker.test.ts
```

**Expected:** final line should be `Total: 76  Pass: 76  Fail: 0` (and exit code 0).

If either fails, stop and message me. Do NOT commit + push if tests fail.

### 4. Commit and push

Targeted adds (explicit paths, not `git add -A`):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add api/migrations/option-d-billing-schema.sql
```

```
git add api/migrations/option-d-billing-rpc.sql
```

```
git add api/migrations/stripe-billing-schema.sql
```

```
git add api/api-keys-schema.sql
```

```
git add website/src/lib/loop-cost-tracker.ts
```

```
git add website/src/lib/stripe.ts
```

```
git add website/src/lib/r20a-cost-tracker.ts
```

```
git add website/src/app/api/reason/route.ts
```

```
git add website/src/app/api/score-iterate/route.ts
```

```
git add website/src/app/api/webhooks/stripe/route.ts
```

```
git add product/AGENTS.md
```

```
git add website/public/llms.txt
```

```
git add website/public/.well-known/agent-card.json
```

```
git add business/STATUS-REVENUE-MODEL.md
```

```
git add website/src/lib/__tests__/loop-cost-tracker.test.ts
```

```
git add operations/decision-log.md
```

```
git add operations/handoffs/founder/2026-05-17-billing-model-build-close.md
```

Then the commit (multi-line message — paste the whole block including the closing `"`):

```
git commit -m "Option D per-loop billing model build

Replaces per-API-call (count-based) billing with per-loop billing for
paid API-key callers. One loop = one wrapper invocation. Base \$0.02/loop;
overage of 2x the excess fires when Anthropic cost exceeds 50%% of base.
R5's 2x revenue/cost floor enforced prospectively at the loop level by
construction. Decision G keeps cost_health_snapshots as retrospective
sanity check (defence-in-depth); R5 manifest text unchanged.

17 file changes per the design's build-session implementation summary:
  - Schema migration (option-d-billing-schema.sql + option-d-billing-rpc.sql)
  - New loop-cost-tracker.ts module (per-request accumulator;
    persist via extended increment_api_usage RPC)
  - Stripe constants OPTION_D_BILLING + computeLoopBill helper
  - r20a-cost-tracker.ts optional loop_id param (classifier_cost_log gains
    loop_id column for forensic joins)
  - /api/reason + /api/score-iterate metering wiring (15 + 12 response
    branches modified; 6 X-Loop-* response headers per Decision H)
  - Stripe webhook invoice.created handler (per-day-aggregate line items;
    inert until STRIPE_PER_LOOP_PRICE_ID is set in a follow-on session)
  - Discovery files (AGENTS.md + llms.txt + agent-card.json) updated to
    per-loop language
  - STATUS-REVENUE-MODEL.md Tasks 4+5 marked Superseded
  - 76 plain-assertion tests; all pass; tsc clean

Step 0 election: Stripe Price ID deferred to a follow-on session.
Metering writes loop_billing_events + emits headers normally; Stripe
invoice rendering inert until STRIPE_PER_LOOP_PRICE_ID is set.

Step 1 elections:
  (a) defer browser CORS exposure under PR7
  (b) per-day-aggregate Stripe line items (CSV download deferred under PR7)
  (c) retain dead per-call code one release cycle (Decision F rollback safety)
  (d) sibling test file (loop-cost-tracker.test.ts)
  (e) hard error on duplicate (api_key_id, loop_id) — UNIQUE constraint
      surfaces as HTTP 400 loop_id_already_billed

Critical risk under 0d-ii. AC7 ENGAGED (deployment-config + access-control
changes). PR6 NOT engaged (R20a classifier surface untouched). Critical
Change Protocol seven responses recorded in decision-log entry. Founder
explicit approval recorded specific to seven named risks.

Per D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17.

Next: session #3 of post-6b arc tail (pass-through fields design pass;
governance; Standard; ~2.5-3 hr)."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** full rebuild (TypeScript files changed). ~2 min. Build should complete cleanly — tsc was already clean locally. No env var changes needed for the build itself (the new `STRIPE_PER_LOOP_PRICE_ID` is OPTIONAL — code handles unset gracefully).

### 5. Post-deploy verification

After Vercel reports green, run from Terminal (use `www.sagereasoning.com` — bare `sagereasoning.com` redirects 307 at the Vercel edge):

```
curl -i -X POST https://www.sagereasoning.com/api/reason \
  -H "Authorization: Bearer sr_live_REPLACE_WITH_YOUR_TEST_PAID_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":"Should I send the email now?","depth":"quick"}'
```

**Expected:** HTTP/2 200 with response headers including:
- `X-Loop-Id: <some-uuidv4>`
- `X-Loop-Cost-Cents: 2` (typical loop — no overage)
- `X-Anthropic-Cost-Cents: <a small integer, likely 0 or 1>`
- `X-Overage-Fired: false`
- `X-Overage-Cents: 0`
- `X-Loop-Internal-Calls: 2` (Layer 1 + Layer 3)

Then in Supabase SQL Editor:

```
SELECT loop_id, total_cents, anthropic_cost_cents, overage_fired, internal_calls, created_at
FROM public.loop_billing_events
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** one new row with `total_cents = 2`, `overage_fired = false`, `internal_calls = 2`, `created_at` within the last few seconds. The `loop_id` should match the X-Loop-Id from the curl response headers.

Then verify the existing GET-only surface hasn't regressed:

```
curl -i https://www.sagereasoning.com/api/accreditation/agent_test_v1
```

**Expected:** HTTP/2 404 with body `{"status":"not_found",...}` — byte-identical to pre-Option-D behaviour (no Option D headers on this surface — the GET endpoint isn't a loop-producing surface).

If anything looks unexpected at any step, message me with the curl output + the Supabase query result. The rollback paths from the Critical Change Protocol section above are available; the schema rollback paste-block is below for convenience.

### Optional — Schema rollback paste-block (only if needed)

Paste in Supabase SQL Editor if you decide to roll back the schema after push:

```
ALTER TABLE public.classifier_cost_log DROP COLUMN IF EXISTS loop_id;
DROP TABLE IF EXISTS public.loop_billing_events;
ALTER TABLE public.api_key_usage
  DROP COLUMN IF EXISTS loop_count,
  DROP COLUMN IF EXISTS anthropic_cost_cents,
  DROP COLUMN IF EXISTS billed_cents,
  DROP COLUMN IF EXISTS overage_count,
  DROP COLUMN IF EXISTS overage_cents;
ALTER TABLE public.api_keys DROP COLUMN IF EXISTS billing_model;
```

The RPC's extended signature stays backward-compatible (all new params have DEFAULT values), so RPC rollback is OPTIONAL. To revert the RPC to its 5-arg form, drop and recreate from `/api/api-keys-schema.sql` section 3.

## Verification Method Used (0c framework)

| Component | Method |
|---|---|
| Schema migration | Founder applies via Supabase SQL Editor; the file footer's six VERIFY queries confirm column adds + table create + indexes + RLS + classifier_cost_log.loop_id |
| RPC extension | Founder applies via Supabase SQL Editor; the file footer VERIFY query confirms 18 input params on increment_api_usage |
| `loop-cost-tracker.ts` | 76 plain-assertion tests at `/website/src/lib/__tests__/loop-cost-tracker.test.ts`; all 76 PASS in-session; `tsc --noEmit` clean (exit 0); founder runs locally per the Founder Verification block |
| `computeLoopBill` (in `stripe.ts`) | Tests BILL-1 through BILL-7 cover Decision D's worked examples + R5 floor + rounding edges |
| Route metering integration | Type-checked via `tsc --noEmit`; end-to-end verified by the founder's post-deploy curl + Supabase query (Founder Verification step 5) |
| Stripe webhook handler | Type-checked; live flow inert pre-Stripe-Price-ID; end-to-end verification deferred to the Price-ID follow-on session |
| Discovery files + STATUS supersession | Founder reads the four files directly + confirms language consistency |
| `r20a-cost-tracker.ts` integration | Type-checked; `classifier_cost_log.loop_id` column landing verified via the schema migration's VERIFY query |

## Risk Classification Record (0d-ii)

| Change | Classification | Reason |
|---|---|---|
| Schema migration affecting api_keys + api_key_usage + new loop_billing_events | **Critical** | AC7 ENGAGED — deployment-config + access-control changes |
| Extended increment_api_usage RPC | **Critical** | AC7 ENGAGED — signature change; transactional posture (backward-compatible via DEFAULTs) |
| Integration into /api/reason + /api/score-iterate | **Critical** | Both routes are R20a-perimeter-adjacent (PR6 NOT engaged — classifier untouched); user-facing functionality change |
| New loop-cost-tracker.ts module | Standard (absorbed into Critical because wired) | KG1 rule 4 — per-request scope; no module-level state |
| Stripe constants + computeLoopBill | Standard | Pure additive — new constants + new helper |
| r20a-cost-tracker.ts optional loop_id param | Standard | Additive — no functional effect on classifier path |
| classifier_cost_log.loop_id column | Standard | Additive schema change; no constraint; nullable |
| Stripe webhook invoice.created handler | Standard (absorbed into Critical because webhook surface) | Server-to-server; inert pre-Stripe-Price-ID |
| Discovery files | Standard | Documentation-only |
| STATUS-REVENUE-MODEL.md supersession notice | Elevated (governance edit; absorbed into session's Critical) | Edit to adopted governance document |
| Test files | Standard | No production effect |

The session's highest-risk components set the overall classification: **Critical**.

## PR5 Knowledge-Gap Carry-Forward

No concepts required re-explanation this session. Founder mid-session input concentrated at Step 0 (Stripe Price ID + session-time elections), Step 1 (5 build-session discretion picks), Step 8 pause-point check, Step 11 CCP approval — the rest of the session ran without needing decisions. Knowledge gaps register at `/operations/knowledge-gaps.md` not edited this session.

**New PR5 candidate (first observation; logged for future recurrence count):**

- **SandwichResult exposes cost-in-microcents but not token counts**, while `LoopAccumulator.addCall(model, inputTokens, outputTokens)` was originally designed around token counts. Required adding `addPrecomputedCall(model, costCents, inputTokens?, outputTokens?)` for `/api/reason` integration. The kind of integration friction that scales with the number of substrate consumers wiring to the metering layer. Revisit condition: another consumer surfaces the same friction; if so, promote to a knowledge-gaps register entry with a recommendation (e.g., "substrate result interfaces should expose token counts alongside cost when both are computed internally").

## Orchestration Reminder

After your push lands + Vercel goes green + your post-deploy verification confirms the response headers + ledger row, the post-6b arc has **four sessions remaining** plus one independent follow-on:

- **#3 (next, ~2.5–3 hr):** pass-through fields design pass — governance; Standard
- **#4 (~2–3 hr):** pass-through fields build — Elevated
- **#5 (~1–2 hr):** A10 design rewrite (supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with integration into Option D's `loop_billing_events` + the new pass-through fields) — governance; Standard
- **#6 (~3–4 hr):** A10 build — Critical
- **Independent follow-on (~30–60 min):** Stripe Price ID generation + env var setup + live invoice rendering verification — Standard-to-Elevated; can be scheduled at any point post-deploy

After session #6 closes, the post-6b arc closes. The substrate carries: authenticated read AND write public surfaces (post-A10); per-loop billing with R5 prospectively enforced (post Option D, this session); enterprise-readable pass-through fields (post-pass-through). The substrate is launch-ready from a structural standpoint; the remaining gates are commercial (Stage 1 close lawyer engagement, FPE-5 TOS + liability), regulatory, and market.

## Cross-references

- Operative session prompt: the inline prompt in this session (Next-Session Prompt — Session #2 of the new post-6b arc tail: Option D Billing Model Build)
- Predecessor session close: `/operations/handoffs/founder/2026-05-17-billing-model-design-pass-close.md`
- Design source: `/adopted/billing-model-design.md` (D-BILLING-MODEL-LOCKED-2026-05-17)
- Decision-log entry (Adopted): `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`
- Predecessor decision-log entries:
  - `D-BILLING-MODEL-LOCKED-2026-05-17` (this build's spec)
  - `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the write surface that produces the loops Option D meters)
  - `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (A10 design Adopted; will be Superseded at session #5 of the new post-6b arc tail; not affected by this session)
- Sequencing source: `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 (session #2 of 6)
- Schema migration: `/api/migrations/option-d-billing-schema.sql`
- RPC extension: `/api/migrations/option-d-billing-rpc.sql`
- New module: `/website/src/lib/loop-cost-tracker.ts`
- Test file: `/website/src/lib/__tests__/loop-cost-tracker.test.ts`
- Modified: `/website/src/lib/stripe.ts`, `/website/src/lib/r20a-cost-tracker.ts`, `/website/src/app/api/reason/route.ts`, `/website/src/app/api/score-iterate/route.ts`, `/website/src/app/api/webhooks/stripe/route.ts`, `/product/AGENTS.md`, `/website/public/llms.txt`, `/website/public/.well-known/agent-card.json`, `/business/STATUS-REVENUE-MODEL.md`, `/api/migrations/stripe-billing-schema.sql`, `/api/api-keys-schema.sql`
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (F4 names `loop_billing_events` as upstream provenance for A12 OpenTelemetry post-launch)
- Governance: `/adopted/standing-protocol-cache.md` (Full template for Critical), `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note — CCP step 3 N/A)
- Manifest: `/manifest.md` §R5 (prospective formula instantiates 2× ratio at loop level; manifest text unchanged per Decision G), AC7 (engaged), AC8 (substrate translation-sandwich respected — no Layer 1 contract change), AC10 (loop_billing_events upstream provenance for A12), KG1 (Vercel five-rule constraint engaged — every metering write awaited; per-request scope; no fire-and-forget)

*End of session close. With the build adopted and the decision-log entry appended, session #2 of the new post-6b arc tail closes. Four sessions remain in the tail (pass-through fields design + build; A10 rewrite + build) plus one independent follow-on (Stripe Price ID setup). The substrate stays at its current Live-but-inert state for the write path (SUBSTRATE_WRITE_PATH_ENABLED UNSET) until A10 lands; the per-loop metering layer activates the moment your push reaches Vercel green and you complete the Founder Verification block above. Per-call billing remains operational on existing infrastructure (dead code retained one release cycle per Step 1(c)) until removed in a follow-on Standard-risk session.*
