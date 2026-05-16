# Session Close — 2026-05-17 — Option D Billing Model Design Pass

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; Decision F load-bearing premise).
**Tier:** `governance` — **Standard** risk under 0d-ii. Lean template. Critical Change Protocol NOT engaged this session (engages at session #2 — Option D build).
**Date:** 2026-05-17.

Produced `/adopted/billing-model-design.md` (the Option D per-loop-billing design — eight locked decisions A–H) and appended `D-BILLING-MODEL-LOCKED-2026-05-17` to the decision log. This was session #1 of 6 in the new post-6b arc tail per the predecessor close's Part 2 (Option D billing → Option D build → pass-through fields design → pass-through fields build → A10 rewrite → A10 build).

**Part A** — read both caches (standing + build-arc); the predecessor A10-design-pass close (Part 2 in full); the seven targeted code + schema files (`api-keys-schema.sql`, `stripe-billing-schema.sql`, `r20a-cost-tracker.ts`, `stripe.ts`, `STATUS-REVENUE-MODEL.md`, manifest §R5, the fair-license-essay section); the last three decision-log entries; PR11 inbox scan (no files dated since 2026-05-16 beyond the two consumed at the brainstorm); PR15 skills consult (Anthropic primitives reviewed — `claude-api` informational; `mcp-builder` forward pointer for R18c interoperability post-launch; bespoke election justified for substrate-internal commercial design).

**Step 0** — scope confirmed via AskUserQuestion ("Proceed as scoped"): eight-question design pass producing the design document + lean decision-log entry + lean close.

**Step 1** — eight prompt-named questions surfaced (Q1–Q8). Founder accepted the eight-question set without modification ("Accept all eight as scoped").

**Step 2** — two AskUserQuestion rounds. Round 1 (Q1–Q4: formula core) ran with one mid-round elaboration — founder asked for a cost-per-loop estimate against Q2's candidates before electing the base rate; AI produced the estimate (cost table + comparison-to-current-per-call-pricing table); founder elected $0.02/loop on the re-asked Q2. Round 2 (Q5–Q8: infrastructure + transition + communication) ran clean with all four elections matching the AI's recommendations.

| Round | Questions | Founder's elections |
|---|---|---|
| 1 of 2 | Q1 (loop), Q2 (base rate — re-asked with cost estimate), Q3 (overage trigger), Q4 (overage rate) | (c) Wrapper invocation; $0.02/loop; (c) Multiple of base rate (50%); (a) Anthropic cost × 2 |
| 2 of 2 | Q5 (cost tracking), Q6 (migration), Q7 (R5 transition), Q8 (communication) | (c) Both (`api_key_usage` + `loop_billing_events`); (d) Full cutover; (a) Keep `cost_health_snapshots` as sanity check; (c) Both (response headers + invoices) |

**Step 3** — `/adopted/billing-model-design.md` written in a single Write call, modelled on `/adopted/atl-a10-design.md`'s nine-decision-pass shape, extended/contracted to eight decisions. Per-decision sections: Why / Elected position / Why this and not alternatives / Structural constraint / R-rule engagement / Layer 1 implication / Deferred under PR7. Plus a cost-per-loop estimate appendix (preserving the in-session Q2 estimate as a reference) and a 17-row build-session implementation summary table naming the expected file changes for the Option D build session.

**Step 4** — founder verification via AskUserQuestion: "Yes — proceed to decision-log + close." No edits requested.

**Step 5** — `D-BILLING-MODEL-LOCKED-2026-05-17` appended in lean form. Eight sub-decisions summarised; ~28 deferred items named under PR7; PR11 inbox scan + PR15 election recorded.

**Step 6** — this close.

## Decisions Made

- **`D-BILLING-MODEL-LOCKED-2026-05-17`** appended (lean form). Status: Adopted. Eight decisions A–H define Option D's surface.

## Status Changes

| Item | Old | New |
|---|---|---|
| Option D billing model | **Elected at brainstorm 2026-05-16** (scope-shaping, not adopted) | **Designed** under `D-BILLING-MODEL-LOCKED-2026-05-17` |
| `/adopted/billing-model-design.md` | did not exist | **Adopted** (decision); **Designed** (implementation) |
| Billing-model design (session #1 of new post-6b arc tail) | **Scoped** | **Designed** |
| Post-6b arc tail | 5 sessions remaining (Option D design + build; pass-through design + build; A10 rewrite + build = 6) | 4 sessions remaining (Option D build; pass-through design + build; A10 rewrite + build = 5; one session = #1 = closed) |
| Per-call billing model | **In force** (current per-call rates documented in `api_keys` + `STATUS-REVENUE-MODEL.md` Tasks 4+5) | **Designed for retirement** (Decision F — full cutover at Option D build deploy; STATUS-REVENUE-MODEL.md Tasks 4+5 will be marked Superseded at build session) |
| R5 enforcement mechanism | **Retrospective only** (`cost_health_snapshots` alerts at 2x ratio violation) | **Prospective primary + retrospective secondary** (per Decision G; R5 manifest text unchanged) |
| Production state | A7 Verified; write-path Live but inert; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live (GET 404 / POST 503 when `SUBSTRATE_WRITE_PATH_ENABLED` UNSET); both ATL tables empty | **Unchanged** — no code, schema, env, or production exposure this session |

## Next Session Should

**Session #2 of the new ordering — Option D billing model build.** Critical-tier; full Critical Change Protocol (per 0c-ii); Lean Critical template per the existing protocol. Estimated ~3–4 hr.

Expected scope per the design's 17-row build-session implementation summary table:

- **Schema migration** at `/api/migrations/option-d-billing-schema.sql` (NEW): `api_keys.billing_model` column with CHECK constraint; five new columns on `api_key_usage` (`loop_count`, `anthropic_cost_cents`, `billed_cents`, `overage_count`, `overage_cents`); new `loop_billing_events` table with indexes.
- **Stripe constants** in `/website/src/lib/stripe.ts`: `LOOP_BASE_RATE_CENTS = 2`, `OVERAGE_TRIGGER_RATIO = 0.5`, `OVERAGE_RATE_MULTIPLIER = 2.0`, `computeLoopBill(anthropic_cost_cents)` helper.
- **New module** `/website/src/lib/loop-cost-tracker.ts`: per-model pricing constants (Haiku-4-5 + Sonnet-4-6); `estimateCallCostCents`, `aggregateLoopCost`, `recordLoopBilling` functions. Re-export pattern with `r20a-cost-tracker.ts` for shared primitive.
- **Updated RPC** `increment_api_usage` extends with optional `loop_id`, `anthropic_cost_cents`, `billed_cents`, `overage_fired` params; transactional `loop_billing_events` insert when `loop_id` provided.
- **Integration** at `/api/reason` + `/api/score-iterate`: `loop_id` extract-or-generate; per-call cost computation; loop-aggregate accumulation; response-header emission (the six `X-Loop-*` headers per Decision H); terminal-call `loop_billing_events` write.
- **Stripe webhook** integration: invoice-rendering handler reads `loop_billing_events` for per-day or per-loop line items.
- **Discovery files** (`AGENTS.md`, `llms.txt`, `agent-card.json`) updated to replace per-call rate references with per-loop language.
- **STATUS-REVENUE-MODEL.md** header note appended marking Tasks 4+5 as Superseded by `D-BILLING-MODEL-LOCKED-2026-05-17`.
- **Tests** for the metering layer, `computeLoopBill` arithmetic, response-header emission, `X-Loop-Id` propagation, transactional aggregate + ledger consistency.
- **Env** new `STRIPE_PER_LOOP_PRICE_ID` (founder generates Price ID in Stripe Dashboard pre-deploy; AI names env var at build session).

**Pre-condition for session #2:** founder generates the new Stripe Price ID in the Stripe Dashboard before the build session opens (the AI will provide the exact Stripe Dashboard menu path at the start of session #2). Without the Price ID, the build session can land all code + schema but cannot enable Stripe-mediated billing.

The next-session prompt is **not yet written** — to be drafted by the AI between sessions (or at the founder's session-open) based on the design document + this close + the standard Critical-risk prompt template. Estimated prompt write: ~15–20 min.

After session #2 lands, sessions #3–#6 of the new ordering follow per the predecessor close's Part 2 (pass-through fields design + build; A10 rewrite + build).

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
?? adopted/billing-model-design.md                                                  (NEW — design document)
 M operations/decision-log.md                                                       (D-BILLING-MODEL-LOCKED-2026-05-17 appended)
?? operations/handoffs/founder/2026-05-17-billing-model-design-pass-close.md        (NEW — this close)
```

**Production state at session close:** unchanged from session open. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert). `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live for GET (404 on unknown agent_id) + POST (503 because `SUBSTRATE_WRITE_PATH_ENABLED` UNSET). Both ATL tables empty. `api_keys` table holds existing ecosystem keys only; the new Option D schema additions are NOT yet applied (and won't be until session #2 build lands).

## Open Questions

(All deferred items are named in the decision-log entry's "Open questions (deferred per PR7)" block — ~28 items. The headline ones the founder should keep in mind between sessions:)

- **Option D build session timing.** The build session is the natural next session but the founder may elect to compress, defer, or interleave. The design is stable and re-readable; the build can wait if higher-priority work surfaces.
- **Stripe Price ID generation.** Founder action — generate the new Price ID in the Stripe Dashboard before session #2 opens. The AI will provide exact Dashboard menu paths at session #2 start.
- **Base-rate re-tuning window.** Post Option D build deploy, the first 2–4 weeks of live operation produce real per-loop cost data; the $0.02 base rate is re-tunable as an Elevated edit before Stripe goes live with real customers. Founder should plan for a brief re-tuning session ~2 weeks after the Option D build deploys.

## Founder Verification

**Two things to do, in order. Take them one at a time — do not paste the blocks as multi-line commands per the CLAUDE.md note about prompt-consumption.**

### 1. Read the design document between sessions

Open `/adopted/billing-model-design.md` in a text viewer. Confirm the eight decisions captured match the elections from Step 2. The document is the spec for session #2 — every paragraph in it will inform a code change in the build session. The cost-per-loop estimate appendix is a reference for the base-rate re-tuning conversation post-launch.

If any decision needs adjustment, message me. Edits to an adopted governance document are Elevated under 0d-ii (per the standing protocol cache).

### 2. Commit and push

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add adopted/billing-model-design.md
```

```
git add operations/decision-log.md
```

```
git add operations/handoffs/founder/2026-05-17-billing-model-design-pass-close.md
```

Then the commit (one command, but multi-line message — paste the whole block including the closing `"`):

```
git commit -m "Option D billing model design pass

Eight design decisions locked defining per-loop billing model that
replaces the current per-API-call (count-based) model. Per-loop base
rate (\$0.02) + LLM-token-cost overage (50%% of base trigger; x2
multiplier). R5's 2x ratio enforced prospectively by construction;
cost_health_snapshots retained as retrospective sanity check.

Eight decisions:
  A - Loop = wrapper invocation (X-Loop-Id propagation)
  B - Base rate = \$0.02/loop (LOOP_BASE_RATE_CENTS = 2)
  C - Overage trigger = 50%% of base rate (self-balancing)
  D - Overage rate = Anthropic cost above threshold x 2 (R5 by construction)
  E - Cost tracking = api_key_usage extensions + new loop_billing_events
  F - Migration = full cutover (no current users); STATUS-REVENUE-MODEL
      Tasks 4+5 will be marked Superseded at build session
  G - R5 manifest text unchanged; prospective primary + retrospective secondary
  H - Communication = X-Loop-* response headers + Stripe invoice rendering

Cited the Nate B Jones companion essay (Related to agent API billing.rtf)
as the external benchmark; fair-license criteria (the meter is visible,
the unit makes sense, usage data exports cleanly, the model aligns with
the value created) checked against every decision.

Standard risk; governance only; no code, schema, env, or production
exposure. AC7 not engaged this session (engages at session #2 - Option D
build, Critical risk).

Next: session #2 - Option D billing model build (Critical; ~3-4 hr;
full Critical Change Protocol)."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** no rebuild — only governance files changed. Production state unchanged.

## Cross-references

- Operative session prompt: `/operations/handoffs/founder/2026-05-16-billing-model-design-NEXT-SESSION-PROMPT.md`
- Predecessor session close: `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` (Part 2 — post-brainstorm scoping source)
- Sequencing source: same as predecessor close (Part 2 §"Decision — Re-ordering the post-6b arc tail")
- Design document (Adopted): `/adopted/billing-model-design.md`
- Decision-log entry (Adopted): `D-BILLING-MODEL-LOCKED-2026-05-17`
- Predecessor decision-log entries: `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (A10 design Adopted; will be Superseded at session #5); `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (the write surface that produces the loops Option D meters)
- Structural template: `/adopted/atl-a10-design.md` (nine-decision-pass shape extended/contracted to eight here)
- PR15 reuse targets: `/website/src/lib/r20a-cost-tracker.ts`; `/website/src/lib/stripe.ts`; `/api/api-keys-schema.sql`; `/api/migrations/stripe-billing-schema.sql`
- Future build target schema: `/api/migrations/option-d-billing-schema.sql` (NEW at session #2)
- Future build target module: `/website/src/lib/loop-cost-tracker.ts` (NEW at session #2)
- Future build target routes: `/website/src/app/api/reason/route.ts`; `/website/src/app/api/score-iterate/route.ts` (metering + response-header integration at session #2)
- Deliverable to be updated at session #2: `/business/STATUS-REVENUE-MODEL.md` (Tasks 4+5 marked Superseded)
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (F4's upstream provenance surface is `loop_billing_events`)
- Inbox files consumed at predecessor brainstorm (already-consumed source material at session open): `/inbox/Related to agent API billing.rtf` (Nate B Jones companion essay — "What a fair SaaS agent license looks like" is the cited external benchmark); `/inbox/20260508-262-promptkit-1.md` (Nate B Jones prompt kit — relevant to session #3's pass-through fields, not Option D)
- Governance: `/adopted/standing-protocol-cache.md` (Lean templates); `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note — Decision F load-bearing premise)
- Manifest: `/manifest.md` — particularly §R5 (the rule Option D operationalises as a prospective formula; manifest text unchanged per Decision G)

*End of session close. With the design adopted and the decision-log entry appended, session #1 of the new post-6b arc tail closes. Four sessions remain in the tail (Option D build → pass-through fields design + build → A10 rewrite + build). The substrate stays at its current Live-but-inert state throughout (write surface gated by `SUBSTRATE_WRITE_PATH_ENABLED` UNSET); per-call billing remains operational on existing infrastructure until the Option D build session's deploy lands the cutover. Founder elects when session #2 opens.*
