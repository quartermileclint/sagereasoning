# Next-Session Prompt — Option D Billing Model Design Pass (session #1 of the new post-6b arc tail)

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template. Critical Change Protocol NOT engaged this session (engages at session #2 — Option D build).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → Lean template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` (the post-brainstorm version — read **Part 2** in full; it scopes this session).
**Predecessor decision-log entries:** `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (the A10 design — Adopted but will be Superseded at session #5); `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the write surface this billing model meters).
**Sequencing source:** the predecessor close's **Part 2** §"Decision — Re-ordering the post-6b arc tail". This session is **#1 of 6** in the new ordering.

---

## Why this session matters

The current billing model is per-API-call (count-based) — `monthly_limit=30` free / `monthly_limit=10,000` paid; ~$0.0025/call. R5 ("paid-tier revenue must cover at least 2x LLM API costs") is enforced *retrospectively* via `cost_health_snapshots` alerts, not built into the pricing formula. Two structural consequences:

1. **The founder absorbs LLM-cost variance.** A loop with 5 chain iterations costs the same to bill as one with 1 iteration but consumes 5x the Anthropic tokens. The price-per-call doesn't track the cost-per-call. R5's 2x ratio is monitored after the fact; if it slips below 2x the alert fires but the bill is already out.
2. **The billed unit doesn't match the value unit.** Wrappers consume 2–3 API calls per invocation (guard + score + optional iterate). The agent's "loop" — input → substrate consult → action chosen — is the actual unit of work; the API-call count is a technical artefact of how the loop is implemented. Enterprise CFOs in the Nate B Jones essay ask "cost per completed task" not "cost per API call".

**Option D** (founder-elected at the 2026-05-16 brainstorm) fixes both: per-loop base rate (predictable headline price; covers ~80% of usage cleanly) + LLM-token-cost overage that fires only on long deliberation chains (founder protected against variance). R5's 2x ratio becomes a *prospective* formula: every loop's bill is constructed such that revenue covers 2x the loop's LLM cost.

This session locks the design. No code; no schema; no production exposure. The Option D **build** session (session #2) follows.

Plan **~2.5–3 hr.** Founder mid-session input concentrated at Steps 1–2 (surfacing design questions + electing positions across two rounds); the AI drafts the design document in Step 3, founder verifies at Step 4.

---

## Pre-conditions

1. **A10 design pass commits pushed; Vercel green.** Founder confirmed Vercel green for the A10 design-pass commit (no code change; the rebuild was a no-op from production's perspective). The post-brainstorm commit (rewritten close + this prompt) should also be pushed before this session opens; if not, the session opens against unpushed governance files which is fine but worth noting.
2. **Founder has read** the predecessor close's **Part 2** (post-session brainstorm) in full, and accepts the new ordering (Option D design → Option D build → pass-through fields design → pass-through fields build → A10 rewrite → A10 build).
3. **Founder has read** the four Option-A-to-D candidate billing models named in the predecessor close's Part 2 §"Per-loop billing options" and confirms Option D is the right election. If reconsidering, this session can re-open Option D (governance-Standard) — but the prompt assumes Option D is the elected direction.
4. **Production state unchanged from the A10 design-pass close:** substrate at A7 Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert); `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET 404 / POST 503). Both ATL tables empty. `api_keys` table holds existing ecosystem keys only.
5. **Founder commits to a ~2.5–3 hr bounded session.** Standard governance pace.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary, AC1 model-selection table (N/A this session — no LLM calls).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — confirm "no current users" simplification still applies.
3. `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` **Part 2 in full** (~10 min) — the scoping source for this session. Particularly the brainstorm findings (current billing model survey; four candidate options A–D; Option D elected; six pass-through fields scoped for session #3).
4. **`/api/api-keys-schema.sql`** (~5 min) — the `api_keys` + `api_key_usage` schemas. Current per-call usage tracking lives here; Option D's per-loop tracking will either extend this or sit alongside it (Decision E).
5. **`/api/migrations/stripe-billing-schema.sql`** (~5 min) — Stripe customers, subscriptions, payment events, `cost_health_snapshots` (the R5 retrospective surface Option D's prospective formula sits beside). Particularly the `upgrade_api_key_to_paid` + `downgrade_api_key_to_free` RPCs (which set `monthly_limit` / `daily_limit` / `max_chain_iterations` — Option D may keep these as caps or repurpose them).
6. **`/website/src/lib/r20a-cost-tracker.ts`** (~5 min) — the existing token-cost-estimation pattern for the safety classifier (Haiku-only). Option D's overage calculation builds on this pattern but extends to Sonnet (the deliberation chain model) and Haiku (quick-depth + classifier).
7. **`/website/src/lib/stripe.ts`** (~3 min — skim) — the `COST_HEALTH` constants. Option D's overage threshold + margin constants probably live here.
8. **`/business/STATUS-REVENUE-MODEL.md`** (~5 min) — the revenue-model status document. Records why the current per-call defaults were chosen (Task 4 + Task 5 of that document). Option D's design should explicitly supersede those rationales — the document doesn't have to be edited this session, but the supersession is recorded in the new design's "Why this and not the alternatives" sections.
9. **`/manifest.md` §R5** (~2 min — the rule Option D operationalises) — "Paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier. Sage Ops pipeline operational costs must not exceed $100/month without explicit founder review. Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend."
10. **`/inbox/Related to agent API billing.rtf`** **§"What a fair SaaS agent license looks like"** (~5 min — the nine traits) — the design document should cite this as the external benchmark. Particularly: "The meter is visible and the unit makes sense"; "Failed or low-value work isn't billed identically to completed work"; "The buyer can set caps"; "Usage data exports cleanly"; "The model aligns with the value created".
11. **`/operations/decision-log.md`** — last 3 entries: `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (the spec that names `credential_audit` — Option D's design needs to either piggyback on this table or sit beside it); `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the write surface that defines the loop boundary); `D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16`.
12. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16; review for billing-relevant material. The two inbox files reviewed at the brainstorm (Nate B Jones essay + prompt kit) are dated 2026-05-16 18:54–18:55; treat them as already-consumed source material per the predecessor close's Part 2. Other inbox files are pre-2026-05-16 and have been scanned previously.
13. **PR15 consult** — `.claude/skills/anthropic/` review. Candidate primitives for a billing-design session: `claude-api` (informational — SDK patterns); `mcp-builder` (forward pointer for R18c interoperability). Bespoke election expected to be justified — billing is substrate-internal commercial design; no Anthropic primitive substitutes. The PR15 dominant finding mirrors the A10 design's: the existing `/api/migrations/stripe-billing-schema.sql` + `api_key_usage` + `cost_health_snapshots` infrastructure is the production-adjacent reusable primitive; Option D extends rather than replaces.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification; Critical Change Protocol NOT engaged this session (engages at session #2 — Option D build).

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)

State scope via AskUserQuestion: produce `/adopted/billing-model-design.md` (Option D — per-loop base + LLM-token-cost overage) + append `D-BILLING-MODEL-LOCKED-2026-05-16` (or YYYY-MM-DD if the session lands on a different day) to the decision log. **In scope:** the ~8 design decisions defining Option D's surface — loop definition, base rate, overage trigger, overage rate, cost tracking surface, migration path for existing tier keys, R5 enforcement transition, communication surface. **NOT in scope this session:** code; schema migrations; the Option D build session (session #2); the six pass-through fields (session #3); the A10 design rewrite (session #5).

### Step 1 — Surface the design questions (~15–20 min)

The AI surfaces the candidate design questions Option D must resolve. Expected question set (subject to founder refinement at this step):

- **Q1 (loop definition)** — what counts as one "loop"? Candidates: (a) `CarriedProfile` lifecycle (consult → action → write to `agent_accreditation`); (b) single `/api/reason` call regardless of internal LLM count; (c) wrapper invocation (guard + score + iterate, even if it bridges multiple endpoints); (d) caller-asserted (the wrapper declares its loop boundary via a request header or body field). Cascades into Q2 (base rate granularity) and Q5 (where loops are counted).
- **Q2 (base rate per loop)** — what is the headline price? Candidates: $0.01 / $0.02 / $0.05 / tiered by surface (cheaper for `/api/reason` quick-depth; more expensive for `/api/score-iterate` or deliberation-chain loops). Cascades into Q3 (overage threshold relative to base rate).
- **Q3 (overage trigger threshold)** — when does the overage rate kick in? Candidates: (a) fixed Anthropic-token count per loop (e.g., 50k input + output tokens); (b) fixed USD-cost per loop (e.g., Anthropic cost > $0.01); (c) multiple of the base rate (e.g., Anthropic cost > 50% of base rate = overage fires). Option (c) self-balances if Anthropic prices shift.
- **Q4 (overage rate)** — how is the overage priced? Candidates: (a) Anthropic cost + 100% margin (the overage charges 2x what the LLM cost was); (b) Anthropic cost + a fixed multiplier (e.g., 2.5x for headroom); (c) Anthropic cost + a tiered multiplier (more margin on bigger overages). R5's 2x ratio is the floor — the overage rate must respect this.
- **Q5 (cost tracking surface)** — where do the per-loop billing events live? Candidates: (a) extend the existing `api_key_usage` table with `loop_count` + `anthropic_cost_cents` columns; (b) new `loop_billing_events` table (append-only ledger; one row per loop with all the operational metadata); (c) both — `api_key_usage` for aggregated daily counters; `loop_billing_events` for forensic granularity. Cascades into the Option D build's schema work.
- **Q6 (migration path for existing tier keys)** — how do existing `free`/`paid` tier keys land in the new model? Candidates: (a) grandfathered at current per-call rates until they expire / next renewal; (b) mandatory migration at a flag-day; (c) opt-in V2 (keys carry a `billing_model: 'per_call' | 'per_loop'` column; existing keys default to `per_call`; new keys default to `per_loop`); (d) full cutover (existing keys auto-convert; per-call rates retired). The "no current users" governing note simplifies this — there is no third-party customer to grandfather. But the Stripe Projects integration (placeholder) and `stripe_subscriptions` table imply a future where this matters.
- **Q7 (R5 enforcement transition)** — what happens to the current `cost_health_snapshots`-as-retrospective-alert mechanism? Candidates: (a) keep `cost_health_snapshots` as a sanity check on the Option D formula (the formula prospectively enforces 2x; the snapshot verifies it holds); (b) replace the retrospective entirely (Option D formula is the only enforcement); (c) the manifest R5 rule itself is rewritten to name the prospective formula as primary + retrospective as secondary.
- **Q8 (communication surface)** — how is per-loop billing surfaced to the caller? Candidates: (a) in API response headers (`X-Loop-Cost-Cents: 2`, `X-Anthropic-Cost-Cents: 0.4`, `X-Overage-Fired: false`); (b) only in invoices (Stripe webhook + monthly statement); (c) both — response headers for real-time agent-side cost-awareness; invoices for accounting reconciliation. Per the Nate B Jones essay's "fair license" criteria: "Usage data exports cleanly."

The AI notes any cascading dependencies (Q1's election narrows Q5's option space; Q3's election affects Q4's units). Founder may add / remove questions before Step 2.

### Step 2 — Design-decision gate (~30–45 min)

AskUserQuestion in 2 rounds (each round bundles 3–5 related decisions to keep founder input bounded). For each decision the AI presents the candidate answers + a recommended option + the rejected alternatives' reasoning. Founder elects.

Suggested Round 1: Q1, Q2, Q3, Q4 (the formula core).
Suggested Round 2: Q5, Q6, Q7, Q8 (infrastructure + transition + communication).

### Step 3 — Draft `/adopted/billing-model-design.md` (~30–40 min)

Single Write call modelled on `/adopted/atl-a10-design.md`'s nine-decision design-pass structure. Per-decision sections with Why / Elected position / Why this and not alternatives / Structural constraint / R-rule engagement / Layer 1 implication. A build-session implementation summary table at the bottom names the expected file changes for the Option D build session (session #2).

Cross-references: the predecessor A10 design's `credential_audit` (Option D may extend it or sit beside it per Q5); the F4 alignment via `credential_audit` (still applicable); the existing `/api/api-keys-schema.sql` + `stripe-billing-schema.sql` (PR15 reuse targets); the `r20a-cost-tracker.ts` pattern (the cost-estimation primitive Option D extends).

### Step 4 — Founder verification (~5 min)

AskUserQuestion: "The N decisions in the design document match the Step 2 elections?" Founder confirms or names corrections. Corrections are made in this same step; the document is not finalised until founder confirms.

### Step 5 — Append decision-log entry (lean form) (~10 min)

`D-BILLING-MODEL-LOCKED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Rules served expected: 0a, 0c, 0d-ii, 0f, R0 (sustainability — revenue covering cost is what makes the substrate operable long-term), R4 (the billing model exposes cost-tracking fields; the design ensures no engine internals cross via these fields), R5 (primary engagement — the prospective formula instantiates R5's 2x ratio at the loop level), R9 (no outcome promises in pricing language — Option D bills work done; outcome-aligned billing is Option B which was rejected for this iteration), R10 (marketplace compliance — pricing language consistent across marketplace + api-docs + invoice surfaces), R18a (no category-language change — billing is commercial, not credential), AC5 (NOT engaged — no R20a perimeter change), AC7 (NOT engaged this session; engages at session #2 — the Option D build's auth + endpoint surface), AC8 (translation-sandwich substrate — Option D meters across the substrate's surface), KG1 (engaged at session #2 — every cost-event write awaited; no fire-and-forget), PR1 (build-session proof — session #2 lands per-loop schema + meter + invoice integration in one Critical-risk session), PR4 (N/A), PR6 (NOT engaged), PR7 (deferred items named — outcome-based variant for V2; tiered-per-action for V3; pricing changes post-launch under contracted-renewal rules), PR10 (Plan — this session is the Plan step for the Option D build), PR11 (inbox scan recorded — Nate B Jones essay cited as fair-license benchmark), PR15 (bespoke election justified — Option D extends existing Stripe + api_keys + cost_health_snapshots infrastructure).

### Step 6 — Session close (lean form) (~15 min)

Per `/adopted/standing-protocol-cache.md` §"Lean session close". "Next Session Should" names session #2 of the new ordering — Option D build — Critical risk; full Critical Change Protocol; expected scope: schema migrations (`api_key_usage` extension OR new `loop_billing_events` table per Q5); cost-event-emission helper in `security.ts` or a sibling library; integration into `/api/reason` and `/api/score-iterate` (the two surfaces that produce the metered loops); invoice-rendering integration if Q8 elects header-emission; tests for all the above. Estimated session #2 time: ~3–4 hr.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close Part 2 + 7 targeted files + decision-log + PR11 + PR15 | 40–50 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — surface design questions | 15–20 min |
| Step 2 — design-decision gate (2 AskUserQuestion rounds) | 30–45 min |
| Step 3 — draft design document | 30–40 min |
| Step 4 — founder verification | 5 min |
| Step 5 — decision-log entry (lean form) | 10 min |
| Step 6 — session close (lean form) | 15 min |
| **Total** | **~2.5–3 hr** |

The natural pause point if the session runs long is **after Step 2** (design decisions elected; document drafting can be a fresh follow-on session). Founder elects whether to take the pause.

---

## Rollback path

Governance-only. If any decision is reconsidered after this session lands but before the Option D build session starts: append a superseding decision-log entry (`D-BILLING-MODEL-REVISED-YYYY-MM-DD`) marking `D-BILLING-MODEL-LOCKED-YYYY-MM-DD` as `Superseded by D-…`. Edit `/adopted/billing-model-design.md` in a follow-on Elevated session (edits to an adopted governance document are Elevated under 0d-ii). No production-state recovery required — nothing was built this session.

---

## Forecast

A successful design pass produces `/adopted/billing-model-design.md` (~8 locked design decisions defining Option D's surface) + `D-BILLING-MODEL-LOCKED-YYYY-MM-DD` decision-log entry (lean form) + session close (lean form). The natural next session is **session #2 — Option D build** — Critical risk; full Critical Change Protocol; expected scope:

- Schema migration(s) per Q5 election (extend `api_key_usage` OR new `loop_billing_events` table OR both).
- New cost-event-emission helper in `security.ts` or sibling library.
- Integration into `/api/reason` and `/api/score-iterate` (the loop-producing surfaces).
- If Q8 elects header emission: response-header serialisation on the loop-producing surfaces.
- Stripe webhook integration if invoice rendering needs the per-loop data (Q8 path-dependent).
- Tests for cost-event emission, overage threshold firing, R5 2x ratio prospective enforcement, migration of existing keys (Q6 path-dependent).

After session #2 lands, sessions #3–#6 of the new ordering follow per the predecessor close's Part 2:

- **#3** — pass-through fields design pass (governance; ~2.5–3 hr) — six new fields on `EvaluatedAction` / `CarriedProfile` per the brainstorm scoping.
- **#4** — pass-through fields build (Elevated; ~2–3 hr).
- **#5** — A10 design rewrite (governance; ~1–2 hr) — supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with the `owner_user_id` + `agent_id` correction + integration with Option D's `loop_billing_events` (if Q5 elects that path) + integration with the new pass-through fields where they affect the credential surface.
- **#6** — A10 build (Critical; ~3–4 hr) — closes the post-6b arc.

After session #6 lands, the post-6b arc closes. The substrate carries: authenticated read AND write public surfaces (post-A10); per-loop billing with R5 prospectively enforced (post-Option-D); enterprise-readable pass-through fields (post-pass-through). The substrate is launch-ready from a structural standpoint; the remaining gates are commercial (Stage 1 close lawyer engagement, FPE-5 TOS + liability), regulatory, and market (per the build-arc cache and substrate-plugin-staging-plan).

*End of prompt.*
